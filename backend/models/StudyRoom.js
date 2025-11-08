import mongoose from "mongoose";

const studyRoomSchema = mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
    },
    facilities: {
        type: [String], // e.g., ["Projector", "Whiteboard", "Computer"]
        default: [],
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    description: {
        type: String,
    },
}, {
    timestamps: true,
});

const StudyRoom = mongoose.model('StudyRoom', studyRoomSchema);
export default StudyRoom;