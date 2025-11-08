import mongoose from "mongoose";

const shelfSchema = mongoose.Schema({
    shelfNumber: {
        type: String,
        required: true,
        unique: true,
    },
    location: {
        type: String,
        required: true,
    },
    section: {
        type: String,
        required: true, // e.g., "Fiction", "Science", "History"
    },
    capacity: {
        type: Number,
        required: true,
        default: 50,
    },
    currentBooks: {
        type: Number,
        default: 0,
    },
    description: {
        type: String,
    },
}, {
    timestamps: true,
});

const Shelf = mongoose.model('Shelf', shelfSchema);
export default Shelf;