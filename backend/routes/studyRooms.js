import express from 'express';
import StudyRoom from '../models/StudyRoom.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Get all study rooms (Public - anyone can view)
router.get('/', async (req, res) => {
    try {
        const studyRooms = await StudyRoom.find({});
        res.json(studyRooms);
    } catch (error) {
        console.error('Error fetching study rooms:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single study room by ID (Public)
router.get('/:id', async (req, res) => {
    try {
        const studyRoom = await StudyRoom.findById(req.params.id);
        if (!studyRoom) {
            return res.status(404).json({ message: 'Study room not found' });
        }
        res.json(studyRoom);
    } catch (error) {
        console.error('Error fetching study room:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create a new study room (Admin only)
router.post('/', protect, admin, async (req, res) => {
    try {
        const { roomNumber, name, capacity, facilities, description } = req.body;

        // Validation
        if (!roomNumber || !name || !capacity) {
            return res.status(400).json({ message: 'Please provide room number, name, and capacity' });
        }

        // Check if room with same number already exists
        const roomExists = await StudyRoom.findOne({ roomNumber });
        if (roomExists) {
            return res.status(400).json({ message: 'Study room with this number already exists' });
        }

        const studyRoom = await StudyRoom.create({
            roomNumber,
            name,
            capacity,
            facilities: facilities || [],
            description,
        });

        res.status(201).json(studyRoom);
    } catch (error) {
        console.error('Error creating study room:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update a study room (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { roomNumber, name, capacity, facilities, isAvailable, description } = req.body;

        const studyRoom = await StudyRoom.findById(req.params.id);
        if (!studyRoom) {
            return res.status(404).json({ message: 'Study room not found' });
        }

        // Update fields
        studyRoom.roomNumber = roomNumber || studyRoom.roomNumber;
        studyRoom.name = name || studyRoom.name;
        studyRoom.capacity = capacity || studyRoom.capacity;
        studyRoom.facilities = facilities !== undefined ? facilities : studyRoom.facilities;
        studyRoom.isAvailable = isAvailable !== undefined ? isAvailable : studyRoom.isAvailable;
        studyRoom.description = description || studyRoom.description;

        const updatedStudyRoom = await studyRoom.save();
        res.json(updatedStudyRoom);
    } catch (error) {
        console.error('Error updating study room:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a study room (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const studyRoom = await StudyRoom.findById(req.params.id);
        if (!studyRoom) {
            return res.status(404).json({ message: 'Study room not found' });
        }

        await StudyRoom.deleteOne({ _id: req.params.id });
        res.json({ message: 'Study room deleted successfully' });
    } catch (error) {
        console.error('Error deleting study room:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;