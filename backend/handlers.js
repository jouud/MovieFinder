"use strict";

// Import libraries necessary for API requests (axios) and connecting to MongoDB database
const axios = require('axios');
const { MongoClient, ObjectId  } = require('mongodb');
require('dotenv').config();

// Create MongoDB client and connect to database
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let db;

client.connect()
  .then(() => {
    db = client.db('moviefinder');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });


// Get a user profile based on the provided username
const getProfile = async (req, res) => {
  const username = req.query.username;
  try {
    const result = await db.collection('users').findOne({ username: username });
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    res.status(500).send('Error occurred while fetching profile');
  }
};


// Add a new profile to the database
const postProfile = async (req, res) => {
  const profile = req.body;
  try {
    const result = await db.collection('users').insertOne(profile);
    if (result.insertedId) {
      res.status(201).json(result.ops[0]);
    } else {
      res.status(500).send('Error occurred while creating profile');
    }
  } catch (error) {
    res.status(500).send('Error occurred while creating profile');
  }
};


// Search for movies using an external API
const searchMovies = async (req, res) => {
  const query = req.query.q;
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${query}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).send('Error occurred while fetching movies');
  }
};


// Fetch popular movies from an external API
const getPopularMovies = async (req, res) => {
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API_KEY}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).send('Error occurred while fetching popular movies');
  }
};


// Add a movie to a user's list of favorite movies
const addFavoriteMovie = async (req, res) => {
    const username = req.body.username;
    const movieId = req.body.movieId;

    console.log(`Attempting to add movie ${movieId} to favorites for user ${username}`);

    try {
        const movieResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}`);
        const movie = movieResponse.data;
        console.log('Fetched movie data:', movie);

        const db = client.db('moviefinder');

        const user = await db.collection('users').findOne({ username: username });

        if (user) {
            // Check if movie is already in favorites
            if(user.favorites.some(fav => fav.id === movieId)) {
                console.log('Movie already in favorites');
                res.status(409).send('Movie already in favorites');
            } else {
                const result = await db.collection('users').updateOne({ username: username }, { $push: { favorites: movie } });
                console.log('MongoDB operation result:', result);
                if (result.modifiedCount) {
                    res.status(200).send('Movie added to favorites');
                } else {
                    res.status(500).send('Error occurred while adding favorite movie');
                }
            }
        } else {
            await db.collection('users').insertOne({
                username: username,
                favorites: [movie]
            });
            console.log(`New user ${username} created with favorite movie ${movieId}`);
            res.status(201).send('New user created and movie added to favorites');
        }
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).send('Error occurred while adding favorite movie');
    }
};


// Get a user's favorite movies from the database
  const getFavoriteMovies = async (req, res) => {
    const username = req.query.username;
  console.log("Username:", username);
    try {
      const user = await db.collection('users').findOne({ username: username });
      if (user) {
        res.status(200).json(user.favorites);
      } else {
        res.status(404).send('User not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error occurred while fetching favorite movies');}
  };


// Remove a movie from a user's list of favorite movies
  const removeFavoriteMovie = async (req, res) => {
    const username = req.body.username;
    const movieId = req.body.movieId;

    console.log(`Attempting to remove movie ${movieId} from favorites for user ${username}`);

    try {
        const user = await db.collection('users').findOne({ username: username });
        if (user) {
            // Check if movie is in favorites
            if(user.favorites.some(fav => fav.id === movieId)) {
                const result = await db.collection('users').updateOne({ username: username }, { $pull: { favorites: {id: movieId} } });
                console.log('MongoDB operation result:', result);
                if (result.modifiedCount) {
                    res.status(200).send('Movie removed from favorites');
                } else {
                    res.status(500).send('Error occurred while removing favorite movie');
                }
            } else {
                console.log('Movie not in favorites');
                res.status(409).send('Movie not in favorites');
            }
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).send('Error occurred while removing favorite movie');
    }
};


// Add a comment to a movie
const postComment = async (req, res) => {
  const { username, movieId, content } = req.body;
  const timestamp = new Date();
  try {
    const result = await db.collection('comments').insertOne({ username, movieId, content, timestamp });
    console.log(result);
    if (result.insertedId) {
      console.log('Insertion was successful. InsertedId is:', result.insertedId);
      
      // Retrieve the inserted document
      const insertedComment = await db.collection('comments').findOne({ _id: result.insertedId });
      
      res.status(201).json(insertedComment); // Send the inserted comment data back as response
    } else {
      res.status(500).send('Error occurred while posting comment');
    }
  } catch (error) {
    console.log('Error in postComment:', error);
    res.status(500).send('Error occurred while posting comment');
  }
};


// Get comments for a specific movie
const getComments = async (req, res) => {
  const movieId = req.query.movieId;
  try {
      const comments = await db.collection('comments').find({ movieId }).sort({timestamp: -1}).toArray();
          res.status(200).json(comments);
  } catch (error) {
      res.status(500).send('Error occurred while fetching comments');
  }
};


// Delete a comment from a movie
const deleteComment = async (req, res) => {
  const commentId = req.body.commentId;
  console.log(`Deleting comment: ${commentId}`);

  if (!commentId) {
    res.status(400).send("Invalid comment id");
    return;
  }
  try {
    const result = await db.collection('comments').deleteOne({ _id: new ObjectId(commentId) });
    console.log(`MongoDB operation result: ${result}`);

    if (result.deletedCount) {
      res.status(200).send('Comment deleted');
    } else {
      res.status(404).send('Comment not found');
    }
  } catch (error) {
    console.error('Error deleting comment', error);
    res.status(500).send('Error occurred while deleting comment');
  }
};


// Edit the content of a comment
const editComment = async (req, res) => {
  const commentId = req.body.commentId;
  const newContent = req.body.newContent;

  if (!commentId || !newContent) {
    res.status(400).send("Invalid request");
    return;
  }
  try {
    const result = await db.collection('comments').updateOne({ _id: new ObjectId(commentId) }, { $set: { content: newContent } });

    if (result.modifiedCount) {
      res.status(200).send('Comment updated');
    } else {
      res.status(404).send('Comment not found');
    }
  } catch (error) {
    console.error('Error updating comment', error);
    res.status(500).send('Error occurred while updating comment');
  }
};


// Export the handlers to be used in other files
module.exports = {
  getProfile,
  postProfile,
  searchMovies,
  getPopularMovies,
  addFavoriteMovie,
  getFavoriteMovies,
  removeFavoriteMovie,
  postComment,
  getComments,
  deleteComment,
  editComment 
};