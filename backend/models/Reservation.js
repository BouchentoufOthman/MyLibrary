import mongoose from "mongoose";

const reservationSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
    },
    reservationDate: {
        type: Date,
        default: Date.now,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    returnDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['active', 'returned', 'overdue'],
        default: 'active',
    },
}, {
    timestamps: true,
});

const Reservation = mongoose.model('Reservation', reservationSchema);
export default Reservation;