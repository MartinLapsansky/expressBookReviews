const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const reg_users = express.Router();
const bcrypt = require('bcrypt');

let users = [];

const isValid = (username)=>{
//write code to check is the username is valid return true false
  return users.some(user => user.username === username);

}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  return users.some(user => user.username === username && user.password === password);
}

//create token also during login and sent to client
reg_users.post("/login", async (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  const user = users.find(u => u.username === username);
  console.log("user find",users)
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  try{
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ username }, "secretKey", { expiresIn: '1h' });
    return res.status(200).json({ message: "User successfully logged in", token });

  }
  catch (error){
    console.log("Login error",error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Add a book review
reg_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;

  if (isbn && review) {
    if (books[isbn]) {
      books[isbn].reviews.push(review);
      return res.status(200).json({message: "Review successfully added."});
    } else {
      return res.status(404).json({message: "Book not found!"});
    }
  }
});

module.exports.authenticated = reg_users;
module.exports.isValid = isValid;
module.exports.users = users;
