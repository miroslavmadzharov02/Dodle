const express = require('express')
const path = require('path')
const app = express()
const port = process.env.port || 5000

app.use(express.static(path.join(__dirname, '../client/public')));

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

app.listen(port, () => {console.log("Server live on http://localhost:" + port)});