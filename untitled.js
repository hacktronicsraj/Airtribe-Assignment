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


});

//Update Course Details API

app.put('/courses/:id', (req, res) => {


});

//Course Registration API

app.post('/courses/:id/register', (req, res) => {


});

//Lead Update API

app.put('/leads/:id', (req, res) => {


});

//Lead Search API

app.get('/leads', (req, res) => {



});

//Add Comment API

app.post('/leads/:id/comments', (req, res) => {


});

//Start the server

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});