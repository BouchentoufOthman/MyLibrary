import mongoose from "mongoose";

const guestSpeakerSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    expertise: {
        type: [String],
        required: true, // e.g., ["Technology", "Science", "Business"]
    },
    bio: {
        type: String,
        required: true,
    },
    organization: {
        type: String,
    },
    photoUrl: {
        type: String,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

const GuestSpeaker = mongoose.model('GuestSpeaker', guestSpeakerSchema);
export default GuestSpeaker;