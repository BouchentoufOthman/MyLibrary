import express from 'express';
import GuestSpeaker from '../models/GuestSpeaker.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Get all guest speakers (Public - anyone can view)
router.get('/', async (req, res) => {
    try {
        const speakers = await GuestSpeaker.find({});
        res.json(speakers);
    } catch (error) {
        console.error('Error fetching guest speakers:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single guest speaker by ID (Public)
router.get('/:id', async (req, res) => {
    try {
        const speaker = await GuestSpeaker.findById(req.params.id);
        if (!speaker) {
            return res.status(404).json({ message: 'Guest speaker not found' });
        }
        res.json(speaker);
    } catch (error) {
        console.error('Error fetching guest speaker:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create a new guest speaker (Admin only)
router.post('/', protect, admin, async (req, res) => {
    try {
        const { name, email, phone, expertise, bio, organization, photoUrl } = req.body;

        if (!name || !email || !phone || !expertise || !bio) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if speaker with same email already exists
        const speakerExists = await GuestSpeaker.findOne({ email });
        if (speakerExists) {
            return res.status(400).json({ message: 'Guest speaker with this email already exists' });
        }

        const speaker = await GuestSpeaker.create({
            name,
            email,
            phone,
            expertise,
            bio,
            organization,
            photoUrl,
        });

        res.status(201).json(speaker);
    } catch (error) {
        console.error('Error creating guest speaker:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update a guest speaker (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { name, email, phone, expertise, bio, organization, photoUrl, isAvailable } = req.body;

        const speaker = await GuestSpeaker.findById(req.params.id);
        if (!speaker) {
            return res.status(404).json({ message: 'Guest speaker not found' });
        }

        speaker.name = name || speaker.name;
        speaker.email = email || speaker.email;
        speaker.phone = phone || speaker.phone;
        speaker.expertise = expertise || speaker.expertise;
        speaker.bio = bio || speaker.bio;
        speaker.organization = organization || speaker.organization;
        speaker.photoUrl = photoUrl || speaker.photoUrl;
        speaker.isAvailable = isAvailable !== undefined ? isAvailable : speaker.isAvailable;

        const updatedSpeaker = await speaker.save();
        res.json(updatedSpeaker);
    } catch (error) {
        console.error('Error updating guest speaker:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a guest speaker (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const speaker = await GuestSpeaker.findById(req.params.id);
        if (!speaker) {
            return res.status(404).json({ message: 'Guest speaker not found' });
        }

        await GuestSpeaker.deleteOne({ _id: req.params.id });
        res.json({ message: 'Guest speaker deleted successfully' });
    } catch (error) {
        console.error('Error deleting guest speaker:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;