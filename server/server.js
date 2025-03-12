const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const eventsFile = "events.json";
const bookingsFile = "bookings.json";

const readData = (file) => {
  if (!fs.existsSync(file)) return [];
  const data = fs.readFileSync(file);
  return JSON.parse(data);
};

const writeData = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

app.get("/events", (req, res) => {
  const events = readData(eventsFile);
  res.json(events);
});

app.post("/bookings", (req, res) => {
  const { eventId, user } = req.body;

  if (!eventId || !user) {
    return res.status(400).json({ message: "Missing eventId or user" });
  }

  const bookings = readData(bookingsFile);
  const newBooking = { id: uuidv4(), eventId, user };

  bookings.push(newBooking);
  writeData(bookingsFile, bookings);

  res.status(201).json(newBooking);
});

app.get("/bookings", (req, res) => {
  const bookings = readData(bookingsFile);
  res.json(bookings);
});

app.delete("/bookings/:id", (req, res) => {
  const { id } = req.params;
  let bookings = readData(bookingsFile);

  const newBookings = bookings.filter((booking) => booking.id !== id);

  if (newBookings.length === bookings.length) {
    return res.status(404).json({ message: "Booking not found" });
  }

  writeData(bookingsFile, newBookings);
  res.json({ message: "Booking cancelled" });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
