import express from 'express';
import Reservation from '../models/Reservation.js';
import Book from '../models/Books.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Get all reservations (Admin only)
router.get('/all', protect, admin, async (req, res) => {
    try {
        const reservations = await Reservation.find({})
            .populate('user', 'username email')
            .populate('book', 'title author isbn')
            .sort({ reservationDate: -1 });
        res.json(reservations);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user's own reservations (Student)
router.get('/my-reservations', protect, async (req, res) => {
    try {
        const reservations = await Reservation.find({ user: req.user._id })
            .populate('book', 'title author isbn')
            .sort({ reservationDate: -1 });
        res.json(reservations);
    } catch (error) {
        console.error('Error fetching user reservations:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create a new reservation (Student)
router.post('/', protect, async (req, res) => {
    try {
        const { bookId, daysToReturn } = req.body;

        if (!bookId) {
            return res.status(400).json({ message: 'Book ID is required' });
        }

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Check if book is available
        if (book.availableCopies <= 0) {
            return res.status(400).json({ message: 'No copies available for this book' });
        }

        // Check if user already has an active reservation for this book
        const existingReservation = await Reservation.findOne({
            user: req.user._id,
            book: bookId,
            status: 'active',
        });

        if (existingReservation) {
            return res.status(400).json({ message: 'You already have an active reservation for this book' });
        }

        // Calculate due date (default 14 days)
        const days = daysToReturn || 14;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + days);

        // Create reservation
        const reservation = await Reservation.create({
            user: req.user._id,
            book: bookId,
            dueDate,
        });

        // Decrease available copies
        book.availableCopies -= 1;
        await book.save();

        const populatedReservation = await Reservation.findById(reservation._id)
            .populate('book', 'title author isbn');

        res.status(201).json(populatedReservation);
    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Return a book (Student can return their own, Admin can return any)
router.put('/:id/return', protect, async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Check if user owns this reservation or is admin
        if (reservation.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to return this reservation' });
        }

        if (reservation.status !== 'active') {
            return res.status(400).json({ message: 'This reservation is not active' });
        }

        // Update reservation
        reservation.returnDate = new Date();
        reservation.status = 'returned';
        await reservation.save();

        // Increase available copies
        const book = await Book.findById(reservation.book);
        if (book) {
            book.availableCopies += 1;
            await book.save();
        }

        const populatedReservation = await Reservation.findById(reservation._id)
            .populate('book', 'title author isbn')
            .populate('user', 'username email');

        res.json(populatedReservation);
    } catch (error) {
        console.error('Error returning book:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a reservation (Admin only - for corrections)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // If reservation is active, restore book availability
        if (reservation.status === 'active') {
            const book = await Book.findById(reservation.book);
            if (book) {
                book.availableCopies += 1;
                await book.save();
            }
        }

        await Reservation.deleteOne({ _id: req.params.id });
        res.json({ message: 'Reservation deleted successfully' });
    } catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update overdue status (can be called by cron job or manually by admin)
router.put('/update-overdue', protect, admin, async (req, res) => {
    try {
        const now = new Date();
        const result = await Reservation.updateMany(
            {
                status: 'active',
                dueDate: { $lt: now },
            },
            {
                status: 'overdue',
            }
        );

        res.json({ 
            message: 'Overdue reservations updated', 
            updatedCount: result.modifiedCount 
        });
    } catch (error) {
        console.error('Error updating overdue reservations:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;