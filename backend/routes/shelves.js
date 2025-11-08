import express from 'express';
import Shelf from '../models/Shelf.js';
import Book from '../models/Books.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Get all shelves (Public)
router.get('/', async (req, res) => {
    try {
        const shelves = await Shelf.find({});
        res.json(shelves);
    } catch (error) {
        console.error('Error fetching shelves:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single shelf by ID (Public)
router.get('/:id', async (req, res) => {
    try {
        const shelf = await Shelf.findById(req.params.id);
        if (!shelf) {
            return res.status(404).json({ message: 'Shelf not found' });
        }
        
        // Also get books on this shelf
        const books = await Book.find({ shelf: req.params.id });
        
        res.json({ shelf, books });
    } catch (error) {
        console.error('Error fetching shelf:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create a new shelf (Admin only)
router.post('/', protect, admin, async (req, res) => {
    try {
        const { shelfNumber, location, section, capacity, description } = req.body;

        if (!shelfNumber || !location || !section) {
            return res.status(400).json({ message: 'Please provide shelf number, location, and section' });
        }

        const shelfExists = await Shelf.findOne({ shelfNumber });
        if (shelfExists) {
            return res.status(400).json({ message: 'Shelf with this number already exists' });
        }

        const shelf = await Shelf.create({
            shelfNumber,
            location,
            section,
            capacity: capacity || 50,
            description,
        });

        res.status(201).json(shelf);
    } catch (error) {
        console.error('Error creating shelf:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update a shelf (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { shelfNumber, location, section, capacity, description } = req.body;

        const shelf = await Shelf.findById(req.params.id);
        if (!shelf) {
            return res.status(404).json({ message: 'Shelf not found' });
        }

        shelf.shelfNumber = shelfNumber || shelf.shelfNumber;
        shelf.location = location || shelf.location;
        shelf.section = section || shelf.section;
        shelf.capacity = capacity !== undefined ? capacity : shelf.capacity;
        shelf.description = description || shelf.description;

        const updatedShelf = await shelf.save();
        res.json(updatedShelf);
    } catch (error) {
        console.error('Error updating shelf:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a shelf (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const shelf = await Shelf.findById(req.params.id);
        if (!shelf) {
            return res.status(404).json({ message: 'Shelf not found' });
        }

        // Check if there are books on this shelf
        const booksOnShelf = await Book.countDocuments({ shelf: req.params.id });
        if (booksOnShelf > 0) {
            return res.status(400).json({ 
                message: `Cannot delete shelf. There are ${booksOnShelf} book(s) on this shelf. Please move or delete them first.` 
            });
        }

        await Shelf.deleteOne({ _id: req.params.id });
        res.json({ message: 'Shelf deleted successfully' });
    } catch (error) {
        console.error('Error deleting shelf:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;