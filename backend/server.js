"use strict";

// Importing required modules
const express = require("express");
const cors = require('cors');
const { auth } = require('express-openid-connect');
const handlers = require('./handlers');
const morgan = require("morgan");

require('dotenv').config();

// Setting up Express app
const app = express();

// OpenID Connect configuration
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_CLIENT_SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
};

// Using middlewares
app.use(cors());
app.use(morgan('tiny'));
app.use(auth(config));
app.use(express.json());

// API endpoints
app.get("/api/getProfile", handlers.getProfile)
app.post("/api/postProfile", handlers.postProfile)
app.get("/api/searchMovies", handlers.searchMovies)
app.get("/api/getPopularMovies", handlers.getPopularMovies)
app.post("/api/addFavoriteMovie", handlers.addFavoriteMovie)
app.get("/api/getFavoriteMovies", handlers.getFavoriteMovies)
app.post("/api/removeFavoriteMovie", handlers.removeFavoriteMovie)
app.post("/api/postComment", handlers.postComment)
app.get("/api/getComments", handlers.getComments)
app.delete("/api/deleteComment", handlers.deleteComment)
app.put('/api/editComment', handlers.editComment)


      // 404 handler
app.get("*", (req, res) => {
  res.status(404).json({
    status: 404,
    message: "This is obviously not what you are looking for.",
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

// Server setup
const port = 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// shutdown
process.on('SIGINT', () => {
  process.exit();
});

module.exports = app;