const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const bcrypt = require('bcrypt');

public_users.post("/register", async (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  const hashedPassword = await bcrypt.hash(password, 10);

  if (username && password) {
    if (!isValid(username)) {
      users.push({username, password: hashedPassword});
      return res.status(200).json({message: "User successfully registered. Please login."});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
});

// Get the book list available in the shop

//edit this get using promise and callbacks or async await with axios

public_users.get('/', async function (req, res) {
  try {
    // Simulate an API call (or use a real one)
    const fetchBooks = () => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(books), 100);
      });
    };

    const bookData = await fetchBooks();
    res.status(200).json(bookData);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Error fetching books" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = parseInt(req.params.isbn);
  try{
  const fetchBookByIsbn = () => {
    return new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject(new Error('Book not found'));
      }
    });
  };

  const book = await fetchBookByIsbn();
  res.status(200).json(book);
} catch (error) {
  console.error("Error fetching book by ISBN:", error.message);
  res.status(404).json({ message: error.message || "Book not found" });
}
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    const authorParam = req.params.author.toLowerCase().replace(/\s+/g, '');

    const fetchBooksByAuthor = () => {
      return new Promise((resolve) => {
        const booksByAuthor = {};
        for (const [isbn, book] of Object.entries(books)) {
          const bookAuthor = book.author.toLowerCase().replace(/\s+/g, '');
          if (bookAuthor.includes(authorParam)) {
            booksByAuthor[isbn] = book;
          }
        }
        resolve(booksByAuthor);
      });
    };

    const filteredBooks = await fetchBooksByAuthor();

    if (Object.keys(filteredBooks).length === 0) {
      return res.status(404).json({ message: "No books found by this author" });
    }
    res.status(200).json(filteredBooks);
  } catch (error) {
    console.error("Error fetching books by author:", error);
    res.status(500).json({ message: "Error fetching books" });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try {
    const titleParam = req.params.title.toLowerCase().replace(/\s+/g, '');

    const fetchBooksByTitle = () => {
      return new Promise((resolve) => {
        const booksByTitle = {};
        for (const [isbn, book] of Object.entries(books)) {
          const bookTitle = book.title.toLowerCase().replace(/\s+/g, '');
          if (bookTitle.includes(titleParam)) {
            booksByTitle[isbn] = book;
          }
        }
        resolve(booksByTitle);
      });
    };

    const filteredBooks = await fetchBooksByTitle();
    if (Object.keys(filteredBooks).length === 0) {
      return res.status(404).json({ message: "No books found with this title" });
    }
    res.status(200).json(filteredBooks);
  } catch (error) {
    console.error("Error fetching books by title:", error);
    res.status(500).json({ message: "Error fetching books" });
  }
});

//  Get book review based on isbn
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
