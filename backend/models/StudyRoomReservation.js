import mongoose from "mongoose";

const studyRoomReservationSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    studyRoom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudyRoom',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    startTime: {
        type: String,
        required: true, // Format: "HH:MM" e.g., "09:00"
    },
    endTime: {
        type: String,
        required: true, // Format: "HH:MM" e.g., "11:00"
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active',
    },
    purpose: {
        type: String,
    },
}, {
    timestamps: true,
});

const StudyRoomReservation = mongoose.model('StudyRoomReservation', studyRoomReservationSchema);
export default StudyRoomReservation;