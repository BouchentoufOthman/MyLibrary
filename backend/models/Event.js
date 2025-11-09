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
    guestUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Only reference User model with guest role
        required: true,
    },
    invitationStatus: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending',
    },
    invitationSentAt: {
        type: Date,
    },
    invitationRespondedAt: {
        type: Date,
    },
    date: {
        type: Date,
        required: true,
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
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
        required: true,
    },
    isVisibleToStudents: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const Event = mongoose.model('Event', eventSchema);
export default Event;