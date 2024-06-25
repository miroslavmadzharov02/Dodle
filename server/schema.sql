CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);

CREATE TABLE Meetings (
    meeting_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    organizer_id INT NOT NULL,
    start_date DATE,
    end_date DATE,
    start_range TIME NOT NULL,
    end_range TIME NOT NULL,
    FOREIGN KEY (organizer_id) REFERENCES Users(user_id)
);

CREATE TABLE TimeSlots (
    timeslot_id INT AUTO_INCREMENT PRIMARY KEY,
    meeting_id INT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    votes_count INT DEFAULT 0,
    FOREIGN KEY (meeting_id) REFERENCES Meetings(meeting_id)
);

CREATE TABLE Votes (
    votes_id INT AUTO_INCREMENT PRIMARY KEY,
    timeslot_id INT NOT NULL,
    voter_name VARCHAR(30) NOT NULL,
    FOREIGN KEY (timeslot_id) REFERENCES TimeSlots(timeslot_id)
);

DELIMITER //

CREATE TRIGGER increment_votes_count
AFTER INSERT ON Votes
FOR EACH ROW
BEGIN
    UPDATE TimeSlots
    SET votes_count = votes_count + 1
    WHERE timeslot_id = NEW.timeslot_id;
END//

CREATE TRIGGER decrement_votes_count
AFTER DELETE ON Votes
FOR EACH ROW
BEGIN
    UPDATE TimeSlots
    SET votes_count = votes_count - 1
    WHERE timeslot_id = OLD.timeslot_id;
END//

DELIMITER ;
