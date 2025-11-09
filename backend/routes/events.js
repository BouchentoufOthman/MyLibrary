import express from 'express';
import Event from '../models/Event.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Get all events (Public - anyone can view, but students see only accepted invitations)
router.get('/', async (req, res) => {
    try {
        let filter = {};
        
        // If not authenticated or student, only show events with accepted invitations
        const token = req.headers.authorization?.split(' ')[1];
        let isAdmin = false;
        
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id);
                if (user && user.role === 'admin') {
                    isAdmin = true;
                }
            } catch (err) {
                // Token invalid or expired, continue as non-admin
            }
        }

        // Students only see events with accepted invitations
        if (!isAdmin) {
            filter.isVisibleToStudents = true;
        }

        const events = await Event.find(filter)
            .populate('guestUser', 'username email')
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
            .populate('guestUser', 'username email')
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
        const { title, description, guestUserId, date, startTime, endTime, location, maxAttendees, category } = req.body;

        if (!title || !description || !guestUserId || !date || !startTime || !endTime || !location || !category) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if guest user exists and has guest role
        const guestUser = await User.findById(guestUserId);
        if (!guestUser || guestUser.role !== 'guest') {
            return res.status(404).json({ message: 'Guest user not found or invalid role' });
        }

        const event = await Event.create({
            title,
            description,
            guestUser: guestUserId,
            date: new Date(date),
            startTime,
            endTime,
            location,
            maxAttendees: maxAttendees || 50,
            category,
            invitationStatus: 'pending',
            invitationSentAt: new Date(),
            isVisibleToStudents: false,
        });

        const populatedEvent = await Event.findById(event._id)
            .populate('guestUser', 'username email');

        res.status(201).json(populatedEvent);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update an event (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { title, description, guestUserId, date, startTime, endTime, location, maxAttendees, status, category } = req.body;

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // If changing guest user, verify it exists and has guest role
        if (guestUserId && guestUserId !== event.guestUser.toString()) {
            const guestUser = await User.findById(guestUserId);
            if (!guestUser || guestUser.role !== 'guest') {
                return res.status(404).json({ message: 'Guest user not found or invalid role' });
            }
            event.guestUser = guestUserId;
            // Reset invitation status when changing guest
            event.invitationStatus = 'pending';
            event.invitationSentAt = new Date();
            event.isVisibleToStudents = false;
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
            .populate('guestUser', 'username email');

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

// Get invitations for logged-in guest
router.get('/my/invitations', protect, async (req, res) => {
    try {
        if (req.user.role !== 'guest') {
            return res.status(403).json({ message: 'Access denied. Guest only.' });
        }

        const invitations = await Event.find({ 
            guestUser: req.user._id 
        })
            .populate('guestUser', 'username email')
            .sort({ invitationSentAt: -1 });

        res.json(invitations);
    } catch (error) {
        console.error('Error fetching invitations:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Respond to invitation (Guest only)
router.put('/:id/respond-invitation', protect, async (req, res) => {
    try {
        const { response } = req.body; // 'accepted' or 'declined'

        if (req.user.role !== 'guest') {
            return res.status(403).json({ message: 'Access denied. Guest only.' });
        }

        if (!['accepted', 'declined'].includes(response)) {
            return res.status(400).json({ message: 'Invalid response. Must be "accepted" or "declined"' });
        }

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if this guest is invited to this event
        if (!event.guestUser || event.guestUser.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not invited to this event' });
        }

        // Update invitation status
        event.invitationStatus = response;
        event.invitationRespondedAt = new Date();
        
        // Make visible to students only if accepted
        if (response === 'accepted') {
            event.isVisibleToStudents = true;
        }

        await event.save();

        const populatedEvent = await Event.findById(event._id)
            .populate('guestUser', 'username email');

        res.json(populatedEvent);
    } catch (error) {
        console.error('Error responding to invitation:', error);
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
            .populate('guestUser', 'username email');

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
            .populate('guestUser', 'username email');

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
            .populate('guestUser', 'username email')
            .sort({ date: 1 });
        res.json(events);
    } catch (error) {
        console.error('Error fetching registered events:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;