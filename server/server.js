const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client/public')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'yourusername',
    password: 'yourpassword',
    database: 'yourdatabase'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the MySQL database');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/public/register.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/public/profile.html'));
});

app.get('/created-events', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/public/created-events.html'));
});

app.get('/event', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/public/event.html'));
});

app.get('/calendar', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/public/calendar.html'));
});

// Register User
app.post('/api/register', (req, res) => {
    const { email, password } = req.body;
    const sql = 'INSERT INTO Users (email, password) VALUES (?, ?)';
    db.query(sql, [email, password], (err, result) => {
        if (err) {
            res.status(500).send('Error registering user');
        } else {
            res.status(200).send('User registered');
        }
    });
});

// Login User
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM Users WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, results) => {
        if (err) {
            res.status(500).send('Error logging in');
        } else if (results.length > 0) {
            res.status(200).send({ message: 'Login successful', user_id: results[0].user_id });
        } else {
            res.status(400).send('Invalid credentials');
        }
    });
});

// Create Meeting
app.post('/api/create-meeting', (req, res) => {
    const { title, description, start_date, end_date, organizer_id } = req.body;
    
    const sqlInsertMeeting = 'INSERT INTO Meetings (title, description, organizer_id, start_date, end_date) VALUES (?, ?, ?, ?, ?)';
    db.query(sqlInsertMeeting, [title, description, organizer_id, start_date, end_date], (err, result) => {
        if (err) {
            res.status(500).send({ error: 'Error creating meeting' });
        } else {
            const meetingId = result.insertId;
            const timeSlots = generateTimeSlots(new Date(start_date), new Date(end_date));
            const sqlInsertTimeSlot = 'INSERT INTO TimeSlots (meeting_id, date, start_time) VALUES ?';
            const timeSlotValues = timeSlots.map(slot => [meetingId, slot.split('T')[0], slot.split('T')[1].split('.')[0]]);
            
            db.query(sqlInsertTimeSlot, [timeSlotValues], (err, result) => {
                if (err) {
                    res.status(500).send({ error: 'Error creating time slots' });
                } else {
                    res.status(200).send('Meeting and time slots created');
                }
            });
        }
    });
});

function generateTimeSlots(startDate, endDate) {
    const timeSlots = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        for (let hour = 0; hour < 24; hour++) {
            const slot = new Date(currentDate);
            slot.setHours(hour, 0, 0, 0);
            timeSlots.push(slot.toISOString());
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return timeSlots;
}

// Fetch TimeSlots
app.get('/api/timeslots', (req, res) => {
    const { meeting_id, date } = req.query;
    const sql = 'SELECT * FROM TimeSlots WHERE meeting_id = ? AND date = ?';
    db.query(sql, [meeting_id, date], (err, results) => {
        if (err) {
            res.status(500).send('Error fetching time slots');
        } else {
            res.status(200).json(results);
        }
    });
});

// Vote for TimeSlot
app.post('/api/vote', (req, res) => {
    const { userName, selectedSlots } = req.body;
    let voteInserts = selectedSlots.map(slot => [slot, userName]);

    const sql = 'INSERT INTO Votes (timeslot_id, voter_name) VALUES ?';
    db.query(sql, [voteInserts], (err, result) => {
        if (err) {
            res.status(500).send('Error voting');
        } else {
            res.status(200).send('Vote recorded');
        }
    });
});

// Fetch Results
app.get('/api/results/:meeting_id', (req, res) => {
    const { meeting_id } = req.params;
    const sql = `
        SELECT TimeSlots.timeslot_id, TimeSlots.date, TimeSlots.start_time, TimeSlots.votes_count
        FROM TimeSlots
        WHERE TimeSlots.meeting_id = ?
        ORDER BY TimeSlots.votes_count DESC
    `;
    db.query(sql, [meeting_id], (err, results) => {
        if (err) {
            res.status(500).send('Error fetching results');
        } else {
            res.status(200).json(results);
        }
    });
});

// Fetch Created Events
app.get('/api/created-events', (req, res) => {
    const userId = req.query.user_id;
    const sql = 'SELECT * FROM Meetings WHERE organizer_id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            res.status(500).send('Error fetching created events');
        } else {
            res.status(200).json(results);
        }
    });
});

app.listen(port, () => {
    console.log("Server live on http://localhost:" + port);
});
