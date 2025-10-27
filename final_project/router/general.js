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
public_users.get('/',function (req, res) {
  return res.send(JSON.stringify(books));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  return res.send(JSON.stringify(books[isbn]));
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  return res.send(JSON.stringify(books[author]));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  return res.send(JSON.stringify(books[title]));
});

//  Get book review based on isbn
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.query;
  return res.send(JSON.stringify(books[isbn]));
});

module.exports.general = public_users;
