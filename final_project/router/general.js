const express = require('express');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req, res) => {
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
    return new Promise((resolve, reject) => {
        const getBooks = async () => {
            try {
                const response = await axios.get('http://localhost:5000/books');
                resolve(res.status(200).json(response.data));
            } catch (error) {
                reject(res.status(500).json({ message: "Error fetching books" }));
            }
        };
        getBooks();
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    return new Promise((resolve, reject) => {
        const getBookByISBN = async () => {
            try {
                const isbn = req.params.isbn;
                const response = await axios.get(`http://localhost:5000/books/${isbn}`);
                resolve(res.status(200).json(response.data));
            } catch (error) {
                reject(res.status(404).json({ message: "Book not found" }));
            }
        };
        getBookByISBN();
    });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    return new Promise((resolve, reject) => {
        const getBooksByAuthor = async () => {
            try {
                const author = req.params.author;
                const response = await axios.get(`http://localhost:5000/books?author=${author}`);
                const authorBooks = response.data.filter(book => book.author === author);
                if (authorBooks.length > 0) {
                    resolve(res.status(200).json(authorBooks));
                } else {
                    reject(res.status(404).json({ message: "No books found by this author" }));
                }
            } catch (error) {
                reject(res.status(500).json({ message: "Error fetching books" }));
            }
        };
        getBooksByAuthor();
    });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    return new Promise((resolve, reject) => {
        const getBooksByTitle = async () => {
            try {
                const title = req.params.title;
                const response = await axios.get(`http://localhost:5000/books?title=${title}`);
                const titleBooks = response.data.filter(book => book.title === title);
                if (titleBooks.length > 0) {
                    resolve(res.status(200).json(titleBooks));
                } else {
                    reject(res.status(404).json({ message: "No books found with this title" }));
                }
            } catch (error) {
                reject(res.status(500).json({ message: "Error fetching books" }));
            }
        };
        getBooksByTitle();
    });
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book && book.reviews) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "No reviews found for this book" });
    }
});

module.exports.general = public_users;