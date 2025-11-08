import mongoose from "mongoose";

const eventSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    guestSpeaker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GuestSpeaker',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    startTime: {
        type: String,
        required: true, // Format: "HH:MM"
    },
    endTime: {
        type: String,
        required: true, // Format: "HH:MM"
    },
    location: {
        type: String,
        required: true,
    },
    maxAttendees: {
        type: Number,
        required: true,
        default: 50,
    },
    currentAttendees: {
        type: Number,
        default: 0,
    },
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming',
    },
    category: {
        type: String,
        required: true, // e.g., "Workshop", "Seminar", "Lecture"
    },
}, {
    timestamps: true,
});

const Event = mongoose.model('Event', eventSchema);
export default Event;