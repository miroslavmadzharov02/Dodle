import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [events, setEvents] = useState([]);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [eventName, setEventName] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [votes, setVotes] = useState([]);
    const [loggedIn, setLoggedIn] = useState(false);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        axios.get('/api/events').then(response => {
            setEvents(response.data);
        });
    }, []);

    const handleRegister = () => {
        axios.post('/api/register', { username, email, password })
            .then(response => {
                alert('User registered');
            })
            .catch(error => {
                alert('Error registering user');
            });
    };

    const handleLogin = () => {
        axios.post('/api/login', { email, password })
            .then(response => {
                setLoggedIn(true);
                setUserId(response.data.user_id);  // Assuming the server returns user ID
            })
            .catch(error => {
                alert('Invalid credentials');
            });
    };

    const handleCreateEvent = () => {
        axios.post('/api/create-meeting', { title: eventName, description: eventDescription, organizer_id: userId, start_date: startDate, end_date: endDate })
            .then(response => {
                alert('Event created');
                setEvents([...events, { title: eventName, description: eventDescription, start_date: startDate, end_date: endDate }]);
            })
            .catch(error => {
                alert('Error creating event');
            });
    };

    const handleCreateTimeSlot = (eventId) => {
        axios.post('/api/create-timeslot', { meeting_id: eventId, date: startDate, start_time: '10:00' })  // Example start time
            .then(response => {
                alert('TimeSlot created');
            })
            .catch(error => {
                alert('Error creating timeslot');
            });
    };

    const handleVote = (timeslotId) => {
        axios.post('/api/vote', { timeslot_id: timeslotId, voter_name: username })
            .then(response => {
                alert('Vote recorded');
            })
            .catch(error => {
                alert('Error voting');
            });
    };

    const handleShowResults = (eventId) => {
        axios.get(`/api/results/${eventId}`)
            .then(response => {
                setVotes(response.data);
            })
            .catch(error => {
                alert('Error fetching results');
            });
    };

    return (
        <div>
            <h1>Vote for Meeting Times</h1>
            {!loggedIn ? (
                <div>
                    <h2>Register/Login</h2>
                    <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button onClick={handleRegister}>Register</button>
                    <button onClick={handleLogin}>Login</button>
                </div>
            ) : (
                <div>
                    <h2>Create Event</h2>
                    <input type="text" placeholder="Event Name" value={eventName} onChange={(e) => setEventName(e.target.value)} />
                    <input type="text" placeholder="Event Description" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} />
                    <input type="date" placeholder="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <input type="date" placeholder="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    <button onClick={handleCreateEvent}>Create Event</button>
                </div>
            )}
            <h2>Events</h2>
            <ul>
                {events.map(event => (
                    <li key={event.id}>
                        {event.title} on {event.date}
                        <button onClick={() => handleCreateTimeSlot(event.id)}>Create TimeSlot</button>
                        <button onClick={() => handleVote(event.id)}>Vote</button>
                        <button onClick={() => handleShowResults(event.id)}>Show Results</button>
                    </li>
                ))}
            </ul>
            {votes.length > 0 && (
                <div>
                    <h2>Results</h2>
                    <ul>
                        {votes.map((vote, index) => (
                            <li key={index}>{vote.date} {vote.start_time}: {vote.votes_count} votes</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default App;
