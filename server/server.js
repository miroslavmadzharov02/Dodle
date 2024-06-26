require('dotenv').config();
const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 5000;

const SECRET_SALT = process.env.SECRET_SALT;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client/public')));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});


db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the MySQL database');
    }
});

function hashId(id, salt) {
    return crypto.createHash('sha256').update(id + salt).digest('hex');
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/public/login.html'));
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

// Hash password function
function hashPassword(password, salt) {
    return crypto.createHash('sha256').update(password + salt).digest('hex');
}

// Register User
app.post('/api/register', (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = hashPassword(password, email);
    const sql = 'INSERT INTO Users (email, password) VALUES (?, ?)';
    db.query(sql, [email, hashedPassword], (err, result) => {
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
    const hashedPassword = hashPassword(password, email);
    const sql = 'SELECT * FROM Users WHERE email = ? AND password = ?';
    db.query(sql, [email, hashedPassword], (err, results) => {
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
    const { title, description, start_date, end_date, organizer_id, start_range, end_range } = req.body;

    const sqlInsertMeeting = 'INSERT INTO Meetings (title, description, organizer_id, start_date, end_date, start_range, end_range) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sqlInsertMeeting, [title, description, organizer_id, start_date, end_date, start_range, end_range], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(400).send({ error: 'Meeting title already exists. Please choose a different title.' });
            } else {
                console.error('Error creating meeting:', err);
                res.status(500).send({ error: 'Error creating meeting' });
            }
        } else {
            const meetingId = result.insertId;
            const timeSlots = generateTimeSlots(start_date, end_date, start_range, end_range);

            if (timeSlots.length === 0) {
                res.status(500).send({ error: 'No time slots generated. Please check the date and time range.' });
                return;
            }

            const sqlInsertTimeSlot = 'INSERT INTO TimeSlots (meeting_id, date, start_time) VALUES ?';
            const timeSlotValues = timeSlots.map(slot => [meetingId, slot.date, slot.time]);

            db.query(sqlInsertTimeSlot, [timeSlotValues], (err, result) => {
                if (err) {
                    console.error('Error creating time slots:', err);
                    res.status(500).send({ error: 'Error creating time slots' });
                } else {
                    res.status(200).send('Meeting and time slots created');
                }
            });
        }
    });
});

function generateTimeSlots(startDate, endDate, startHour, endHour) {
    const timeSlots = [];
    let currentDate = new Date(startDate);
    let endDateTime = new Date(endDate);

    // Ensure currentDate and endDateTime are at midnight UTC to avoid time zone issues
    currentDate.setUTCHours(0, 0, 0, 0);
    endDateTime.setUTCHours(0, 0, 0, 0);

    while (currentDate <= endDateTime) {
        for (let hour = startHour; hour < endHour; hour++) {
            const slot = new Date(currentDate);
            slot.setUTCHours(hour, 0, 0, 0);

            const date = slot.toISOString().split('T')[0];
            const time = slot.toTimeString().split(' ')[0];
            timeSlots.push({ date, time });
        }
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return timeSlots;
}

app.get('/api/meeting-dates/:meeting_id', (req, res) => {
    const meetingId = req.params.meeting_id;

    const query = `
        SELECT start_date, end_date, start_range, end_range 
        FROM Meetings 
        WHERE meeting_id = ?
    `;

    db.execute(query, [meetingId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Meeting not found' });
        }

        const { start_date, end_date, start_range, end_range } = results[0];
        res.json({ start_date, end_date, start_range, end_range });
    });
});

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

// Verify and fetch meeting ID from hashed link
app.get('/api/verify-link', (req, res) => {
    const { eventId } = req.query;
    const [hash, id] = eventId.split('-');

    const expectedHash = hashId(id, SECRET_SALT);
    if (hash !== expectedHash) {
        return res.status(400).json({ error: 'Invalid event link.' });
    }

    res.status(200).json({ meeting_id: id });
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
            const events = results.map(event => {
                const hash = hashId(event.meeting_id.toString(), SECRET_SALT);
                return {
                    ...event,
                    link: `calendar.html?eventId=${hash}-${event.meeting_id}`
                };
            });
            res.status(200).json(events);
        }
    });
});

app.listen(port, () => {
    console.log("Server live on http://localhost:" + port);
});
