// auth_users.js
const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Utility function to check if a username already exists
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Utility function to authenticate a user
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Registration endpoint
regd_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    if (isValid(username)) {
        return res.status(409).json({ message: "User already exists!" });
    }
    users.push({ username, password });
    return res.status(201).json({ message: "User successfully registered" });
});

// Endpoint for user login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({ username }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = { accessToken, username };
        return res.status(200).json({ message: "User successfully logged in", accessToken });
    } else {
        return res.status(401).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.query;
    const username = req.session.authorization?.username; // Ensure username is correctly retrieved

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    if (!username) {
        return res.status(403).json({ message: "User not authenticated" });
    }

    let bookReviews = books[isbn].reviews;
    if (bookReviews[username]) {
        bookReviews[username] = review;
        return res.status(200).json({ message: "Review updated successfully" });
    } else {
        bookReviews[username] = review;
        return res.status(201).json({ message: "Review added successfully" });
    }
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params; // Get ISBN from the URL parameter
    const username = req.session.authorization?.username; // Get the username from the session

    // Convert ISBN to an integer key to match the book keys in booksdb.js
    const bookKey = parseInt(isbn); // Convert ISBN string to an integer

    // Check if the book exists using the integer key
    const book = books[bookKey];

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if the username is available from the session
    if (!username) {
        return res.status(403).json({ message: "User not authenticated" });
    }

    // Access the reviews of the book
    let bookReviews = book.reviews;

    // Check if the user has a review to delete
    if (bookReviews[username]) {
        // Delete the review
        delete bookReviews[username];
        return res.status(200).json({ message: "Review deleted successfully" });
    } else {
        return res.status(404).json({ message: "Review not found for this user" });
    }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
