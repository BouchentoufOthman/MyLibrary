import express from 'express';
import Book from '../models/Books.js';
import Shelf from '../models/Shelf.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Get all books (Public - anyone can view)
router.get('/', async (req, res) => {
    try {
        const books = await Book.find({}).populate('shelf', 'shelfNumber location section');
        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single book by ID (Public)
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('shelf');
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create a new book (Admin only)
router.post('/', protect, admin, async (req, res) => {
    try {
        const { title, author, isbn, publishedYear, genre, copies, shelf, description } = req.body;

        // Validation
        if (!title || !author || !isbn || !publishedYear || !genre || !shelf) {
            return res.status(400).json({ message: 'Please provide all required fields including shelf' });
        }

        // Check if book with same ISBN already exists
        const bookExists = await Book.findOne({ isbn });
        if (bookExists) {
            return res.status(400).json({ message: 'Book with this ISBN already exists' });
        }

        // Check if shelf exists
        const shelfExists = await Shelf.findById(shelf);
        if (!shelfExists) {
            return res.status(404).json({ message: 'Shelf not found' });
        }

        // Check if shelf has capacity
        if (shelfExists.currentBooks >= shelfExists.capacity) {
            return res.status(400).json({ message: 'Shelf is at full capacity' });
        }

        const book = await Book.create({
            title,
            author,
            isbn,
            publishedYear,
            genre,
            copies: copies || 1,
            availableCopies: copies || 1,
            shelf,
            description,
        });

        // Update shelf's current books count
        shelfExists.currentBooks += 1;
        await shelfExists.save();

        const populatedBook = await Book.findById(book._id).populate('shelf');
        res.status(201).json(populatedBook);
    } catch (error) {
        console.error('Error creating book:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update a book (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { title, author, isbn, publishedYear, genre, copies, availableCopies, shelf, description } = req.body;

        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // If shelf is being changed
        if (shelf && shelf !== book.shelf.toString()) {
            const newShelf = await Shelf.findById(shelf);
            if (!newShelf) {
                return res.status(404).json({ message: 'New shelf not found' });
            }
            
            if (newShelf.currentBooks >= newShelf.capacity) {
                return res.status(400).json({ message: 'New shelf is at full capacity' });
            }

            // Update old shelf count
            const oldShelf = await Shelf.findById(book.shelf);
            if (oldShelf) {
                oldShelf.currentBooks -= 1;
                await oldShelf.save();
            }

            // Update new shelf count
            newShelf.currentBooks += 1;
            await newShelf.save();

            book.shelf = shelf;
        }

        // Update other fields
        book.title = title || book.title;
        book.author = author || book.author;
        book.isbn = isbn || book.isbn;
        book.publishedYear = publishedYear || book.publishedYear;
        book.genre = genre || book.genre;
        book.copies = copies !== undefined ? copies : book.copies;
        book.availableCopies = availableCopies !== undefined ? availableCopies : book.availableCopies;
        book.description = description || book.description;

        const updatedBook = await book.save();
        const populatedBook = await Book.findById(updatedBook._id).populate('shelf');
        res.json(populatedBook);
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a book (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Update shelf's current books count
        const shelf = await Shelf.findById(book.shelf);
        if (shelf) {
            shelf.currentBooks -= 1;
            await shelf.save();
        }

        await Book.deleteOne({ _id: req.params.id });
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;