// ===== index.js =====

import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { User, Booking, Flight } from './schemas.js';

const app = express();

app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

const PORT = 6001;

mongoose.connect('mongodb://localhost:27017/FlightBookingMERN', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {

    // Seed all flights for every city pair
    app.get('/seed-flights', async (req, res) => {
        try {
            await Flight.deleteMany();

            const cities = [
                'Delhi', 'Mumbai', 'Chennai', 'Hyderabad', 'Kolkata',
                'Bangalore', 'Indore', 'Pune', 'Jaipur', 'Varanasi',
                'Trivendrum', 'Bhopal'
            ];

            const sampleTimes = [
                { departure: '06:00 AM', arrival: '08:00 AM' },
                { departure: '09:00 AM', arrival: '11:00 AM' },
                { departure: '01:00 PM', arrival: '03:00 PM' },
                { departure: '04:00 PM', arrival: '06:30 PM' },
                { departure: '07:00 PM', arrival: '09:30 PM' }
            ];

            const flightNames = ['IndiGo', 'AirAsia', 'SpiceJet', 'Akasa', 'GoAir'];
            const flights = [];
            let count = 100;

            for (let i = 0; i < cities.length; i++) {
                for (let j = 0; j < cities.length; j++) {
                    if (i !== j) {
                        const origin = cities[i];
                        const destination = cities[j];
                        const numFlights = Math.floor(1 + Math.random() * 3);
                        for (let k = 0; k < numFlights; k++) {
                            const time = sampleTimes[Math.floor(Math.random() * sampleTimes.length)];
                            const name = flightNames[Math.floor(Math.random() * flightNames.length)];
                            const id = `${name.slice(0, 2).toUpperCase()}${count}`;

                            flights.push({
                                flightName: `${name} ${count}`,
                                flightId: id,
                                origin,
                                destination,
                                departureTime: time.departure,
                                arrivalTime: time.arrival,
                                basePrice: Math.floor(2500 + Math.random() * 2000),
                                totalSeats: Math.floor(40 + Math.random() * 40)
                            });

                            count++;
                        }
                    }
                }
            }

            await Flight.insertMany(flights);
            res.send(`✅ Seeded ${flights.length} flights for all city combinations!`);
        } catch (err) {
            console.error(err);
            res.status(500).send('❌ Error seeding flights');
        }
    });

    // Search flights with smart filtering
    app.get('/search-flights', async (req, res) => {
        const { from, to, returnTrip } = req.query;

        if (!from || !to) {
            return res.status(400).json({ message: "Missing 'from' or 'to' query params" });
        }

        try {
            const query = returnTrip === 'true'
                ? {
                    $or: [
                        { origin: from, destination: to },
                        { origin: to, destination: from }
                    ]
                }
                : { origin: from, destination: to };

            const flights = await Flight.find(query);
            res.json(flights);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error searching flights' });
        }
    });

    // Book ticket route
    app.post('/book-ticket', async (req, res) => {
        const {
            user, flight, flightName, flightId, departure, destination,
            email, mobile, passengers, totalPrice, journeyDate, journeyTime, seatClass
        } = req.body;

        try {
            const bookings = await Booking.find({ flight, journeyDate, seatClass });
            const numBookedSeats = bookings.reduce((acc, booking) => acc + booking.passengers.length, 0);

            const seatCode = {
                'economy': 'E',
                'premium-economy': 'P',
                'business': 'B',
                'first-class': 'A'
            };
            const coach = seatCode[seatClass] || 'E';

            const seats = passengers.map((_, i) => `${coach}-${numBookedSeats + i + 1}`);

            const booking = new Booking({
                user, flight, flightName, flightId, departure, destination,
                email, mobile, passengers, totalPrice, journeyDate, journeyTime, seatClass, seats
            });

            await booking.save();
            res.status(200).json({ message: 'Booking successful!!' });

        } catch (err) {
            console.error('Booking error:', err);
            res.status(500).json({ message: 'Booking failed' });
        }
    });

    // Other routes remain unchanged

    app.listen(PORT, () => {
        console.log(`Running @ ${PORT}`);
    });

}).catch((e) => console.log(`Error in db connection ${e}`));
