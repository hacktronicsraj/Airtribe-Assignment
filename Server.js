const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(bodyParser.json());

//Create MySQL connection to AWS RDS
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

//Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }
  console.log('Connected to the AWS RDS database.');
});


//Create Course API


app.post('/courses', (req, res) => {
  const { instructorId, name, maxSeats, startDate } = req.body;

  // Validate the required fields
  if (!instructorId || !name || !maxSeats || !startDate) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const query = 'INSERT INTO courses (instructor_id, name, max_seats, start_date) VALUES (?, ?, ?, ?)';
  const values = [instructorId, name, maxSeats, startDate];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error('Error creating course:', err);
      res.status(500).json({ error: 'Failed to create course' });
      return;
    }

    res.status(201).json({ message: 'Course created successfully', courseId: result.insertId });
  });
});

//Update Course Details API

app.put('/courses/:id', (req, res) => {
  const courseId = req.params.id;
  const { name, maxSeats, startDate } = req.body;

  // Validate the required fields
  if (!name || !maxSeats || !startDate) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const query = 'UPDATE courses SET name = ?, max_seats = ?, start_date = ? WHERE id = ?';
  const values = [name, maxSeats, startDate, courseId];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating course:', err);
      res.status(500).json({ error: 'Failed to update course' });
      return;
    }

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    res.json({ message: 'Course updated successfully' });
  });
});

//Course Registration API

app.post('/courses/:id/register', (req, res) => {
  const courseId = req.params.id;
  const { name, email, phone, linkedinProfile, status = 'Pending' } = req.body;
  // Validate the required fields
  if (!name || !email) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  const query = 'INSERT INTO leads (course_id, name, email, phone, linkedin_profile, status) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [courseId, name, email, phone, linkedinProfile, status];
  connection.query(query, values, (err, result) => {
    if (err) {
      console.error('Error registering for course:', err);
      res.status(500).json({ error: 'Failed to register for course' });
      return;
    }
    res.status(201).json({ message: 'Course registration successful', registrationId: result.insertId });
  });
});

//Lead Update API

app.put('/leads/:id', (req, res) => {
  const leadId = req.params.id;
  const { status } = req.body;
  // Validate the required field
  if (!status) {
    res.status(400).json({ error: 'Missing required field: status' });
    return;
  }
  // Validate the status value
  const allowedStatuses = ['Pending', 'Accepted', 'Rejected', 'Waitlisted'];
  if (!allowedStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid status value' });
    return;
  }
  const query = 'UPDATE leads SET status = ? WHERE id = ?';
  const values = [status, leadId];
  connection.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating lead:', err);
      res.status(500).json({ error: 'Failed to update lead' });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }
    res.json({ message: 'Lead updated successfully' });
  });
});
//Lead Search API

app.get('/leads', (req, res) => {
  const { name, email } = req.query;
  let query = 'SELECT * FROM leads';
  const params = [];

  if (name) {
    query += ' WHERE name LIKE ?';
    params.push(`%${name}%`);
  }

  if (email) {
    if (params.length > 0) {
      query += ' AND email LIKE ?';
    } else {
      query += ' WHERE email LIKE ?';
    }
    params.push(`%${email}%`);
  }

  connection.query(query, params, (err, results) => {
    if (err) {
      console.error('Error searching leads:', err);
      res.status(500).json({ error: 'Failed to search leads' });
      return;
    }

    res.json(results);
  });
});

//Add Comment API

app.post('/leads/:id/comments', (req, res) => {
  const leadId = req.params.id;
  const { content } = req.body;

  // Validate the required field
  if (!content) {
    res.status(400).json({ error: 'Missing required field: content' });
    return;
  }

  const query = 'INSERT INTO comments (lead_id, content) VALUES (?, ?)';
  const values = [leadId, content];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error('Error adding comment:', err);
      res.status(500).json({ error: 'Failed to add comment' });
      return;
    }

    res.status(201).json({ message: 'Comment added successfully', commentId: result.insertId });
  });
});

//Start the server

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});