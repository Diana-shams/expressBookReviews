const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios'); // Import Axios for making HTTP requests

async function fetchBooks() {
    // Simulating an async operation, replace the URL with an actual endpoint if needed
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (books) {
                resolve(books);
            } else {
                reject('Error: Could not fetch books');
            }
        }, 1000);
    });
}
public_users.get('/', async function (req, res) {
    try {
        const booksList = await fetchBooks(); // Await the Promise to get books
        res.status(200).json(booksList); // Send the fetched books as a response
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch books', error });
    }
});
async function fetchBookByISBN(isbn) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const book = books[isbn]; // Access book using ISBN
            if (book) {
                resolve(book);
            } else {
                reject('Error: Book not found');
            }
        }, 1000);
    });
}

// Route to get book details based on ISBN using async-await
public_users.get('/isbn/:isbn', async (req, res) => {
    const { isbn } = req.params;
    try {
        const book = await fetchBookByISBN(isbn); // Await the Promise to get book details
        res.status(200).json(book); // Send the book details as a response
    } catch (error) {
        res.status(404).json({ message: error });
    }
});
// Function to simulate fetching books by author
async function fetchBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const bookList = Object.values(books);
            const booksByAuthor = bookList.filter(book => book.author.toLowerCase() === author.toLowerCase());
            if (booksByAuthor.length > 0) {
                resolve(booksByAuthor);
            } else {
                reject('Error: No books found by this author');
            }
        }, 1000);
    });
}

// Route to get book details based on the author using async-await
public_users.get('/author/:author', async (req, res) => {
    const { author } = req.params;
    try {
        const books = await fetchBooksByAuthor(author); // Await the Promise to get books by author
        res.status(200).json(books); // Send the list of books as a response
    } catch (error) {
        res.status(404).json({ message: error });
    }
});

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    // Step 1: Check if both username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    // Step 2: Check if the username already exists
    if (isValid(username)) {
      return res.status(409).json({ message: "User already exists!" });
    }
  
    // Step 3: Add the new user to the users array
    users.push({ username, password });
  
    // Step 4: Return a success response
    return res.status(200).json({ message: "User successfully registered. Now you can log in." });
  });
  

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books, null, 2));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    // Retrieve the ISBN from the request parameters
    const isbn = req.params.isbn;
  
    // Find the book using the key as ISBN
    const book = books[isbn];
  
    // Check if the book exists and send the response
    if (book) {
      res.send(JSON.stringify(book, null, 2)); // Send the book details formatted nicely
    } else {
      res.status(404).send({ message: 'Book not found' }); // Send a 404 response if the book is not found
    }
  });
  
// Get book details based on author
// Get book details based on the author
public_users.get('/author/:author', function (req, res) {
    // Step 1: Retrieve the author from the request parameters
    const author = req.params.author;
  
    // Step 2: Get all book objects from the books data
    const bookList = Object.values(books);
  
    // Step 3: Filter books based on the author
    const booksByAuthor = bookList.filter(book => book.author.toLowerCase() === author.toLowerCase());
  
    // Step 4: Check if books by the author were found and send the response
    if (booksByAuthor.length > 0) {
      res.send(JSON.stringify(booksByAuthor, null, 2)); // Send the list of books formatted nicely
    } else {
      res.status(404).send({ message: 'No books found by this author' }); // Send a 404 response if no books are found
    }
  });
  

// Get all books based on title
// Get book details based on the title
public_users.get('/title/:title', function (req, res) {
    // Step 1: Retrieve the title from the request parameters
    const title = req.params.title;
  
    // Step 2: Get all book objects from the books data
    const bookList = Object.values(books);
  
    // Step 3: Filter books based on the title
    const booksByTitle = bookList.filter(book => book.title.toLowerCase() === title.toLowerCase());
  
    // Step 4: Check if books with the title were found and send the response
    if (booksByTitle.length > 0) {
      res.send(JSON.stringify(booksByTitle, null, 2)); // Send the list of books formatted nicely
    } else {
      res.status(404).send({ message: 'No books found with this title' }); // Send a 404 response if no books are found
    }
  });
  

//  Get book review

public_users.get('/review/:isbn', function (req, res) {
    // Retrieve the ISBN from the request parameters
    const isbn = req.params.isbn;
  
    // Find the book using the ISBN key
    const book = books[isbn];
  
    // Check if the book exists and send the review response
    if (book) {
      res.send(JSON.stringify(book.reviews, null, 2)); // Send the book's reviews formatted nicely
    } else {
      res.status(404).send({ message: 'Book not found' }); // Send a 404 response if the book is not found
    }
  });
  

module.exports.general = public_users;
