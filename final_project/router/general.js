const express = require('express');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;

const public_users = express.Router();

public_users.post("/register", (req, res) => {
    // Write your code here
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    if (users[username]) {
        return res.status(400).json({ message: "Username already exists" });
    }
    users[username] = { password: password };
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    const books = [
        { title: "Book 1", author: "Author 1", isbn: "ISBN1" },
        { title: "Book 2", author: "Author 2", isbn: "ISBN2" },
        { title: "Book 3", author: "Author 3", isbn: "ISBN3" }
    ];
    return res.status(200).json(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    // Write your code here
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        return res.status(200).json(book);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    // Write your code here
    const author = req.params.author;
    const authorBooks = Object.values(books).filter(book => book.author === author);
    if (authorBooks.length > 0) {
        return res.status(200).json(authorBooks);
    } else {
        return res.status(404).json({ message: "No books found by this author" });
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    // Write your code here
    const title = req.params.title;
    const titleBooks = Object.values(books).filter(book => book.title === title);
    if (titleBooks.length > 0) {
        return res.status(200).json(titleBooks);
    } else {
        return res.status(404).json({ message: "No books found with this title" });
    }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    // Write your code here
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book && book.reviews) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "No reviews found for this book" });
    }
});

module.exports.general = public_users;