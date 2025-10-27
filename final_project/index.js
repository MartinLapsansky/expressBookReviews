const express = require('express');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const jwt = require('jsonwebtoken');
const users = require('./router/auth_users.js').users;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
  // 1. Get the token from the header
  const authHeader = req.headers.authorization;

  // 2. Check if token exists and is in the correct format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Invalid or missing token format. Use 'Bearer <token>'" });
  }

  const token = authHeader.split(' ')[1]; // Get the token part after 'Bearer '

  try {
    // 3. Verify the token
    const decoded = jwt.verify(token, "secretKey");
    console.log("Decoded:", decoded);
    console.log("users:", users);

    // 4. Check if user exists (optional but recommended)
    const user = users.find(u => u.username === decoded.username);
    console.log("user find",user)
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 5. Attach user to request object for use in route handlers
    req.user = user;

    // 6. Continue to the next middleware/route
    next();
  } catch (error) {
    console.error("Auth error:", error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
