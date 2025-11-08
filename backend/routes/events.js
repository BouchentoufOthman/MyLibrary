import express from 'express';
import Event from '../models/Event.js';
import GuestSpeaker from '../models/GuestSpeaker.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Get all events (Public - anyone can view)
router.get('/', async (req, res) => {
    try {
        const events = await Event.find({})
            .populate('guestSpeaker', 'name email expertise organization')
            .sort({ date: 1 });
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single event by ID (Public)
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('guestSpeaker')
            .populate('attendees', 'username email');
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create a new event (Admin only)
router.post('/', protect, admin, async (req, res) => {
    try {
        const { title, description, guestSpeakerId, date, startTime, endTime, location, maxAttendees, category } = req.body;

        if (!title || !description || !guestSpeakerId || !date || !startTime || !endTime || !location || !category) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if guest speaker exists
        const speaker = await GuestSpeaker.findById(guestSpeakerId);
        if (!speaker) {
            return res.status(404).json({ message: 'Guest speaker not found' });
        }

        const event = await Event.create({
            title,
            description,
            guestSpeaker: guestSpeakerId,
            date: new Date(date),
            startTime,
            endTime,
            location,
            maxAttendees: maxAttendees || 50,
            category,
        });

        const populatedEvent = await Event.findById(event._id)
            .populate('guestSpeaker', 'name email expertise organization');

        res.status(201).json(populatedEvent);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update an event (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { title, description, guestSpeakerId, date, startTime, endTime, location, maxAttendees, status, category } = req.body;

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // If changing guest speaker, verify it exists
        if (guestSpeakerId && guestSpeakerId !== event.guestSpeaker.toString()) {
            const speaker = await GuestSpeaker.findById(guestSpeakerId);
            if (!speaker) {
                return res.status(404).json({ message: 'Guest speaker not found' });
            }
            event.guestSpeaker = guestSpeakerId;
        }

        event.title = title || event.title;
        event.description = description || event.description;
        event.date = date ? new Date(date) : event.date;
        event.startTime = startTime || event.startTime;
        event.endTime = endTime || event.endTime;
        event.location = location || event.location;
        event.maxAttendees = maxAttendees !== undefined ? maxAttendees : event.maxAttendees;
        event.status = status || event.status;
        event.category = category || event.category;

        const updatedEvent = await event.save();
        const populatedEvent = await Event.findById(updatedEvent._id)
            .populate('guestSpeaker', 'name email expertise organization');

        res.json(populatedEvent);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete an event (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        await Event.deleteOne({ _id: req.params.id });
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Register for an event (Student)
router.post('/:id/register', protect, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.status !== 'upcoming') {
            return res.status(400).json({ message: 'Cannot register for this event' });
        }

        // Check if already registered
        if (event.attendees.includes(req.user._id)) {
            return res.status(400).json({ message: 'You are already registered for this event' });
        }

        // Check if event is full
        if (event.currentAttendees >= event.maxAttendees) {
            return res.status(400).json({ message: 'This event is full' });
        }

        event.attendees.push(req.user._id);
        event.currentAttendees += 1;
        await event.save();

        const populatedEvent = await Event.findById(event._id)
            .populate('guestSpeaker', 'name email expertise organization');

        res.json(populatedEvent);
    } catch (error) {
        console.error('Error registering for event:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Unregister from an event (Student)
router.post('/:id/unregister', protect, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.status !== 'upcoming') {
            return res.status(400).json({ message: 'Cannot unregister from this event' });
        }

        // Check if registered
        if (!event.attendees.includes(req.user._id)) {
            return res.status(400).json({ message: 'You are not registered for this event' });
        }

        event.attendees = event.attendees.filter(
            (attendeeId) => attendeeId.toString() !== req.user._id.toString()
        );
        event.currentAttendees -= 1;
        await event.save();

        const populatedEvent = await Event.findById(event._id)
            .populate('guestSpeaker', 'name email expertise organization');

        res.json(populatedEvent);
    } catch (error) {
        console.error('Error unregistering from event:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get my registered events (Student)
router.get('/my/registered', protect, async (req, res) => {
    try {
        const events = await Event.find({ attendees: req.user._id })
            .populate('guestSpeaker', 'name email expertise organization')
            .sort({ date: 1 });
        res.json(events);
    } catch (error) {
        console.error('Error fetching registered events:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;