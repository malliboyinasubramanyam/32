import React, { useContext, useEffect, useState } from 'react';
import '../styles/LandingPage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GeneralContext } from '../context/GeneralContext';

const LandingPage = () => {
    const [error, setError] = useState('');
    const [checkBox, setCheckBox] = useState(false);

    const [departure, setDeparture] = useState('');
    const [destination, setDestination] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [Flights, setFlights] = useState([]);

    const navigate = useNavigate();
    const { setTicketBookingDate } = useContext(GeneralContext);
    const userId = localStorage.getItem('userId');

    const cityList = [
        'Delhi', 'Mumbai', 'Chennai', 'Hyderabad', 'Kolkata',
        'Bangalore', 'Indore', 'Pune', 'Jaipur', 'Varanasi',
        'Trivendrum', 'Bhopal'
    ];

    useEffect(() => {
        const type = localStorage.getItem('userType');
        if (type === 'admin') navigate('/admin');
        else if (type === 'flight-operator') navigate('/flight-admin');
    }, []);

    const fetchFlights = async () => {
        if (departure && destination && departureDate && (!checkBox || returnDate)) {
            if (departure === destination) {
                setError('Departure and destination cannot be the same');
                return;
            }

            const today = new Date();
            const depDate = new Date(departureDate);
            const retDate = new Date(returnDate);

            if (!checkBox && depDate < today) {
                setError('Please select a valid departure date');
                return;
            }

            if (checkBox && (depDate < today || retDate <= depDate)) {
                setError('Please check the return journey dates');
                return;
            }

            setError('');
            try {
                const res = await axios.get('http://localhost:6001/search-flights', {
                    params: {
                        from: departure,
                        to: destination,
                        returnTrip: checkBox
                    }
                });
                setFlights(res.data);
                console.log(res.data);
            } catch (err) {
                console.error(err);
                setError('Error fetching flights');
            }
        } else {
            setError('Please fill all required fields');
        }
    };

    const handleTicketBooking = (id, origin) => {
        if (userId) {
            setTicketBookingDate(origin === departure ? departureDate : returnDate);
            navigate(`/book-flight/${id}`);
        } else {
            navigate('/auth');
        }
    };

    return (
        <div className="landingPage">
            <div className="landingHero">
                <div className="landingHero-title">
                    <h1 className="banner-h1">Embark on an Extraordinary Flight Booking Adventure!</h1>
                    <p className="banner-p">
                        Book your dream flight to any destination in India. Explore, discover, and fly high!
                    </p>
                </div>

                <div className="Flight-search-container input-container mb-4">
                    <div className="form-check form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            onChange={(e) => setCheckBox(e.target.checked)}
                            checked={checkBox}
                        />
                        <label className="form-check-label">Return journey</label>
                    </div>

                    <div className="Flight-search-container-body">
                        <div className="form-floating">
                            <select
                                className="form-select form-select-sm mb-3"
                                value={departure}
                                onChange={(e) => setDeparture(e.target.value)}
                            >
                                <option value="" disabled>Select Departure</option>
                                {cityList.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                            <label>Departure City</label>
                        </div>

                        <div className="form-floating">
                            <select
                                className="form-select form-select-sm mb-3"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                            >
                                <option value="" disabled>Select Destination</option>
                                {cityList.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                            <label>Destination City</label>
                        </div>

                        <div className="form-floating mb-3">
                            <input
                                type="date"
                                className="form-control"
                                value={departureDate}
                                onChange={(e) => setDepartureDate(e.target.value)}
                            />
                            <label>Journey Date</label>
                        </div>

                        {checkBox && (
                            <div className="form-floating mb-3">
                                <input
                                    type="date"
                                    className="form-control"
                                    value={returnDate}
                                    onChange={(e) => setReturnDate(e.target.value)}
                                />
                                <label>Return Date</label>
                            </div>
                        )}

                        <div>
                            <button className="btn btn-primary" onClick={fetchFlights}>
                                Search
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-danger mt-2">{error}</p>}
                </div>

                {Flights.length > 0 && (
                    <div className="availableFlightsContainer">
                        <h2>Available Flights</h2>
                        <div className="Flights">
                            {Flights.map((flight) => (
                                <div className="Flight" key={flight._id}>
                                    <div>
                                        <p><strong>{flight.flightName}</strong></p>
                                        <p>Flight ID: {flight.flightId}</p>
                                    </div>
                                    <div>
                                        <p>From: {flight.origin}</p>
                                        <p>To: {flight.destination}</p>
                                    </div>
                                    <div>
                                        <p>Departs: {flight.departureTime}</p>
                                        <p>Arrives: {flight.arrivalTime}</p>
                                    </div>
                                    <div>
                                        <p>Price: ₹{flight.basePrice}</p>
                                        <p>Seats: {flight.totalSeats}</p>
                                    </div>
                                    <button
                                        className="btn btn-success"
                                        onClick={() => handleTicketBooking(flight._id, flight.origin)}
                                    >
                                        Book Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LandingPage;