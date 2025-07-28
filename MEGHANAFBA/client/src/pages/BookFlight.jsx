import React, { useContext, useEffect, useState } from 'react';
import '../styles/BookFlight.css';
import { GeneralContext } from '../context/GeneralContext';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const BookFlight = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { ticketBookingDate } = useContext(GeneralContext);

    const [flightName, setFlightName] = useState('');
    const [flightId, setFlightId] = useState('');
    const [basePrice, setBasePrice] = useState(0);
    const [StartCity, setStartCity] = useState('');
    const [destinationCity, setDestinationCity] = useState('');
    const [startTime, setStartTime] = useState('');

    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [coachType, setCoachType] = useState('');
    const [journeyDate, setJourneyDate] = useState(ticketBookingDate);
    const [numberOfPassengers, setNumberOfPassengers] = useState(0);
    const [passengerDetails, setPassengerDetails] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    const price = {
        'economy': 1,
        'premium-economy': 2,
        'business': 3,
        'first-class': 4
    };

    useEffect(() => {
        fetchFlightData();
    }, []);

    const fetchFlightData = async () => {
        try {
            const res = await axios.get(`http://localhost:6001/fetch-flight/${id}`);
            const data = res.data;
            setFlightName(data.flightName);
            setFlightId(data.flightId);
            setBasePrice(data.basePrice);
            setStartCity(data.origin);
            setDestinationCity(data.destination);
            setStartTime(data.departureTime);
        } catch (err) {
            console.error('Error fetching flight:', err);
        }
    };

    useEffect(() => {
        if (price[coachType] && basePrice && numberOfPassengers > 0) {
            setTotalPrice(price[coachType] * basePrice * numberOfPassengers);
        }
    }, [numberOfPassengers, coachType, basePrice]);

    const handlePassengerChange = (e) => {
        const value = parseInt(e.target.value) || 0;
        setNumberOfPassengers(value);
        setPassengerDetails(Array(value).fill({ name: '', age: '' }));
    };

    const handlePassengerDetailsChange = (index, key, value) => {
        setPassengerDetails((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [key]: value };
            return updated;
        });
    };

    const bookFlight = async () => {
        const inputs = {
            user: localStorage.getItem('userId'),
            flight: id,
            flightName,
            flightId,
            departure: StartCity,
            destination: destinationCity,
            journeyTime: startTime,
            email,
            mobile,
            passengers: passengerDetails,
            totalPrice,
            journeyDate,
            seatClass: coachType
        };

        try {
            await axios.post('http://localhost:6001/book-ticket', inputs);
            alert('Booking successful');
            navigate('/bookings');
        } catch (err) {
            console.error('Booking error:', err);
            alert('Booking failed!!');
        }
    };

    return (
        <div className='BookFlightPage'>
            <div className="BookingFlightPageContainer">
                <h2>Book ticket</h2>
                <p><b>Flight Name:</b> {flightName}</p>
                <p><b>Flight No:</b> {flightId}</p>
                <p><b>Base price:</b> {basePrice}</p>

                <div className="form-floating mb-3">
                    <input type="email" className="form-control" id="floatingInputEmail" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <label htmlFor="floatingInputEmail">Email</label>
                </div>

                <div className="form-floating mb-3">
                    <input type="text" className="form-control" id="floatingInputMobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                    <label htmlFor="floatingInputMobile">Mobile</label>
                </div>

                <div className="form-floating mb-3">
                    <input type="number" className="form-control" id="floatingInputPassengerCount" value={numberOfPassengers} onChange={handlePassengerChange} />
                    <label htmlFor="floatingInputPassengerCount">No of passengers</label>
                </div>

                <div className="form-floating mb-3">
                    <input type="date" className="form-control" id="floatingInputJourneyDate" value={journeyDate} onChange={(e) => setJourneyDate(e.target.value)} />
                    <label htmlFor="floatingInputJourneyDate">Journey date</label>
                </div>

                <div className="form-floating">
                    <select className="form-select form-select-sm mb-3" id="floatingSelect" value={coachType} onChange={(e) => setCoachType(e.target.value)}>
                        <option value="" disabled>Select</option>
                        <option value="economy">Economy class</option>
                        <option value="premium-economy">Premium Economy</option>
                        <option value="business">Business class</option>
                        <option value="first-class">First class</option>
                    </select>
                    <label htmlFor="floatingSelect">Seat Class</label>
                </div>

                <div className="new-passengers">
                    {passengerDetails.map((passenger, index) => (
                        <div className='new-passenger' key={index}>
                            <h4>Passenger {index + 1}</h4>
                            <div className="form-floating mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    id={`passengerName-${index}`}
                                    value={passenger.name || ''}
                                    onChange={(e) => handlePassengerDetailsChange(index, 'name', e.target.value)}
                                />
                                <label htmlFor={`passengerName-${index}`}>Name</label>
                            </div>
                            <div className="form-floating mb-3">
                                <input
                                    type="number"
                                    className="form-control"
                                    id={`passengerAge-${index}`}
                                    value={passenger.age || ''}
                                    onChange={(e) => handlePassengerDetailsChange(index, 'age', e.target.value)}
                                />
                                <label htmlFor={`passengerAge-${index}`}>Age</label>
                            </div>
                        </div>
                    ))}
                </div>

                <h6><b>Total price</b>: ₹{totalPrice}</h6>
                <button className='btn btn-primary' onClick={bookFlight}>Book now</button>
            </div>
        </div>
    );
};

export default BookFlight;