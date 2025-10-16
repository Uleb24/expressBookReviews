const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Write code to check if the username is valid
    return !users.find(user => user.username === username);
}

const authenticatedUser = (username, password) => {
    // Write code to check if username and password match the ones we have in records.
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
    // Write your code here
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken, username
        };
        return res.status(200).json({ message: "User successfully logged in", accessToken });
    } else {
        return res.status(401).json({ message: "Invalid username or password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    // Write your code here
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization ? req.session.authorization.username : null;

    if (!isbn || !review || !username) {
        return res.status(400).json({ message: "ISBN, review, and username are required" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    if (books[isbn].reviews[username]) {
        // Modify existing review if the same user posts again
        books[isbn].reviews[username] = review;
        return res.status(200).json({ message: "Review updated successfully" });
    } else {
        // Add new review for a different user
        books[isbn].reviews[username] = review;
        return res.status(201).json({ message: "Review added successfully" });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    // Write your code here
    const isbn = req.params.isbn;
    const username = req.session.authorization ? req.session.authorization.username : null;

    if (!isbn || !username) {
        return res.status(400).json({ message: "ISBN and username are required" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: "Review deleted successfully" });
    } else {
        return res.status(404).json({ message: "Review not found or user not authorized" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;