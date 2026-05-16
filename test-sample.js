// Sample file with intentional issues for BobGuard to detect

const express = require('express');
const mysql = require('mysql');
const app = express();

// SECURITY ISSUE: Hardcoded credentials
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'MySecretPassword123!',
    database: 'users_db'
});

// SECURITY ISSUE: SQL Injection vulnerability
app.get('/user/:id', (req, res) => {
    const userId = req.params.id;
    const query = `SELECT * FROM users WHERE id = ${userId}`;
    
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// PERFORMANCE ISSUE: N+1 query problem
app.get('/posts', async (req, res) => {
    const posts = await db.query('SELECT * FROM posts');
    
    for (let i = 0; i < posts.length; i++) {
        const comments = await db.query(`SELECT * FROM comments WHERE post_id = ${posts[i].id}`);
        posts[i].comments = comments;
    }
    
    res.json(posts);
});

// CODE QUALITY: Missing error handling
app.post('/upload', (req, res) => {
    const file = req.files.upload;
    file.mv('/uploads/' + file.name);
    res.send('File uploaded');
});

// CODE QUALITY: Dead code
function unusedFunction() {
    console.log('This function is never called');
    return 42;
}

// PERFORMANCE: Inefficient algorithm O(n²)
function findDuplicates(arr) {
    const duplicates = [];
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i] === arr[j]) {
                duplicates.push(arr[i]);
            }
        }
    }
    return duplicates;
}

// SECURITY: Insecure random number generation
function generateToken() {
    return Math.random().toString(36).substring(7);
}

// CODE QUALITY: Poor naming
let x = 10;
let y = 20;
function calc(a, b) {
    return a + b;
}

app.listen(3000);
