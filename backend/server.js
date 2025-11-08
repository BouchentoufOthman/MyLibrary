import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import bookRoutes from "./routes/books.js";
import studyRoomRoutes from "./routes/studyRooms.js";
import shelfRoutes from "./routes/shelves.js";
import reservationRoutes from "./routes/reservations.js";
import studyRoomReservationRoutes from "./routes/studyRoomReservations.js";
import guestSpeakerRoutes from "./routes/guestSpeakers.js"; 
import eventRoutes from "./routes/events.js"; 
import { connectDB } from "./config/db.js";
dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());

app.use("/api/users", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/studyrooms", studyRoomRoutes);
app.use("/api/shelves", shelfRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/studyroom-reservations", studyRoomReservationRoutes); 
app.use("/api/guest-speakers", guestSpeakerRoutes);
app.use("/api/events", eventRoutes);

connectDB();

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});