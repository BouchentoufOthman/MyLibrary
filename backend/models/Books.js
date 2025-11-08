import mongoose from "mongoose";

const bookSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    isbn: {
        type: String,
        required: true,
        unique: true,
    },
    publishedYear: {
        type: Number,
        required: true,
    },
    genre: {
        type: String,
        required: true,
    },
    copies: {
        type: Number,
        required: true,
        default: 1,
    },
    availableCopies: {
        type: Number,
        required: true,
        default: 1,
    },
    shelf: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shelf',
        required: true,
    },
    description: {
        type: String,
    },
}, {
    timestamps: true,
});

const Book = mongoose.model('Book', bookSchema);
export default Book;