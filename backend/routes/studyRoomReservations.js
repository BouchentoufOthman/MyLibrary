import express from 'express';
import StudyRoomReservation from '../models/StudyRoomReservation.js';
import StudyRoom from '../models/StudyRoom.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Get all study room reservations (Admin only)
router.get('/all', protect, admin, async (req, res) => {
    try {
        const reservations = await StudyRoomReservation.find({})
            .populate('user', 'username email')
            .populate('studyRoom', 'roomNumber name')
            .sort({ date: -1, startTime: -1 });
        res.json(reservations);
    } catch (error) {
        console.error('Error fetching study room reservations:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user's own study room reservations (Student)
router.get('/my-reservations', protect, async (req, res) => {
    try {
        const reservations = await StudyRoomReservation.find({ user: req.user._id })
            .populate('studyRoom', 'roomNumber name capacity facilities')
            .sort({ date: -1, startTime: -1 });
        res.json(reservations);
    } catch (error) {
        console.error('Error fetching user study room reservations:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get available time slots for a study room on a specific date
router.get('/available-slots/:roomId/:date', async (req, res) => {
    try {
        const { roomId, date } = req.params;

        // Check if study room exists
        const studyRoom = await StudyRoom.findById(roomId);
        if (!studyRoom) {
            return res.status(404).json({ message: 'Study room not found' });
        }

        if (!studyRoom.isAvailable) {
            return res.status(400).json({ message: 'This study room is not available for booking' });
        }

        // Get all reservations for this room on this date
        const reservations = await StudyRoomReservation.find({
            studyRoom: roomId,
            date: new Date(date),
            status: 'active',
        });

        // Generate all possible time slots (9 AM to 9 PM, 1-hour slots)
        const allSlots = [];
        for (let hour = 9; hour < 21; hour++) {
            const startTime = `${hour.toString().padStart(2, '0')}:00`;
            const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
            allSlots.push({ startTime, endTime });
        }

        // Filter out booked slots
        const availableSlots = allSlots.filter(slot => {
            return !reservations.some(reservation => {
                // Check if there's any overlap
                return !(slot.endTime <= reservation.startTime || slot.startTime >= reservation.endTime);
            });
        });

        res.json({ studyRoom, availableSlots, bookedSlots: reservations });
    } catch (error) {
        console.error('Error fetching available slots:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create a new study room reservation (Student)
router.post('/', protect, async (req, res) => {
    try {
        const { studyRoomId, date, startTime, endTime, purpose } = req.body;

        if (!studyRoomId || !date || !startTime || !endTime) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if study room exists and is available
        const studyRoom = await StudyRoom.findById(studyRoomId);
        if (!studyRoom) {
            return res.status(404).json({ message: 'Study room not found' });
        }

        if (!studyRoom.isAvailable) {
            return res.status(400).json({ message: 'This study room is not available for booking' });
        }

        // Check if user already has an active reservation for a study room (only 1 allowed)
        const existingReservation = await StudyRoomReservation.findOne({
            user: req.user._id,
            status: 'active',
        });

        if (existingReservation) {
            return res.status(400).json({ 
                message: 'You already have an active study room reservation. Please complete or cancel it first.' 
            });
        }

        // Check if the time slot is available
        const conflictingReservation = await StudyRoomReservation.findOne({
            studyRoom: studyRoomId,
            date: new Date(date),
            status: 'active',
            $or: [
                // New reservation starts during an existing reservation
                { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
                // New reservation ends during an existing reservation
                { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
                // New reservation completely contains an existing reservation
                { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
            ],
        });

        if (conflictingReservation) {
            return res.status(400).json({ 
                message: 'This time slot is already booked. Please choose another time.' 
            });
        }

        // Create reservation
        const reservation = await StudyRoomReservation.create({
            user: req.user._id,
            studyRoom: studyRoomId,
            date: new Date(date),
            startTime,
            endTime,
            purpose,
        });

        const populatedReservation = await StudyRoomReservation.findById(reservation._id)
            .populate('studyRoom', 'roomNumber name capacity facilities');

        res.status(201).json(populatedReservation);
    } catch (error) {
        console.error('Error creating study room reservation:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Cancel a study room reservation (Student can cancel their own, Admin can cancel any)
router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const reservation = await StudyRoomReservation.findById(req.params.id);
        
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Check if user owns this reservation or is admin
        if (reservation.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
        }

        if (reservation.status !== 'active') {
            return res.status(400).json({ message: 'This reservation is not active' });
        }

        reservation.status = 'cancelled';
        await reservation.save();

        const populatedReservation = await StudyRoomReservation.findById(reservation._id)
            .populate('studyRoom', 'roomNumber name')
            .populate('user', 'username email');

        res.json(populatedReservation);
    } catch (error) {
        console.error('Error cancelling reservation:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Mark reservation as completed (Admin only or automatic)
router.put('/:id/complete', protect, async (req, res) => {
    try {
        const reservation = await StudyRoomReservation.findById(req.params.id);
        
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Check if user owns this reservation or is admin
        if (reservation.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to complete this reservation' });
        }

        if (reservation.status !== 'active') {
            return res.status(400).json({ message: 'This reservation is not active' });
        }

        reservation.status = 'completed';
        await reservation.save();

        const populatedReservation = await StudyRoomReservation.findById(reservation._id)
            .populate('studyRoom', 'roomNumber name')
            .populate('user', 'username email');

        res.json(populatedReservation);
    } catch (error) {
        console.error('Error completing reservation:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a study room reservation (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const reservation = await StudyRoomReservation.findById(req.params.id);
        
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        await StudyRoomReservation.deleteOne({ _id: req.params.id });
        res.json({ message: 'Study room reservation deleted successfully' });
    } catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;