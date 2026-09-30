require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve HTML files from public folder
app.use(express.static('public'));

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.log('MySQL connection failed:', err.message);
    } else {
        console.log('Connected to MySQL database!');
    }
});

// Home page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// VIEW students
app.get('/students', (req, res) => {
    db.query('SELECT * FROM students', (err, results) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json(results);
    });
});

// ADD student
app.post('/students', (req, res) => {
    const { name, email, course } = req.body;

    const sql = `
        INSERT INTO students (name, email, course)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [name, email, course], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json({
            message: 'Student added successfully',
            id: result.insertId
        });
    });
});

// UPDATE student
app.put('/students/:id', (req, res) => {
    const { name, email, course } = req.body;
    const { id } = req.params;

    const sql = `
        UPDATE students
        SET name = ?, email = ?, course = ?
        WHERE id = ?
    `;

    db.query(sql, [name, email, course, id], (err) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json({
            message: 'Student updated successfully'
        });
    });
});

// DELETE student
app.delete('/students/:id', (req, res) => {
    const { id } = req.params;

    db.query(
        'DELETE FROM students WHERE id = ?',
        [id],
        (err) => {
            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: 'Student deleted successfully'
            });
        }
    );
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});