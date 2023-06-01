import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styled from "styled-components";
import { useAuth0 } from '@auth0/auth0-react';
import { HiStar } from "react-icons/hi";

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const { isAuthenticated } = useAuth0();
  const { user } = useAuth0();
  const [favoriteMovies, setFavoriteMovies] = useState([]); // Initialize with an empty array
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const username = user?.email;


  // Handles comment submission
  const handleCommentSubmit = async event => {
    event.preventDefault();

    if (newComment.trim() !== '') {
      try {
        const response = await axios.post('http://localhost:8000/api/postComment', {
          movieId: id,
          content: newComment,
          username: username
        });

        const newCommentData = {
          username: username,
          content: newComment,
          _id: response.data._id
        };

        setComments(prevComments => [newCommentData, ...prevComments]);
        setNewComment('');
      } catch (error) {
        console.error('Error posting comment', error);
      }
    }
  };


  //fetches comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/getComments?movieId=${id}`);
        setComments(response.data);
      } catch (error) {
        console.error('Error fetching comments', error);
      }
    };

    fetchComments();
  }, [id]);


  //handles comment edit
  const handleCommentEdit = (commentId, content) => {
    setEditCommentId(commentId);
    setEditCommentContent(content);
  };


  //handles comment update
  const handleCommentUpdate = async (commentId) => {
    if (!commentId) {
      console.error("Comment id is undefined");
      return;
    }
    try {
      await axios.put('http://localhost:8000/api/editComment', {
        commentId: commentId,
        newContent: editCommentContent
      });

      setComments(prevComments =>
        prevComments.map(comment =>
          comment._id === commentId ? { ...comment, content: editCommentContent } : comment
        )
      );

      setEditCommentId(null);
      setEditCommentContent('');
    } catch (error) {
      console.error('Error editing comment', error);
    }
  };


  //handles comment delete
  const handleCommentDelete = async (commentId) => {
    if (!commentId) {
      console.error("Comment id is undefined");
      return;
    }
    try {
      await axios.delete('http://localhost:8000/api/deleteComment', {
        data: { commentId }
      });

      setComments(prevComments => prevComments.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment', error);
      console.error(`Error response: ${error.response}`);
    }
  };

  //handles comment cancellation
  const handleCommentCancel = () => {
    setEditCommentId(null);
    setEditCommentContent('');
  };

  //checks if a comment is being edited
  const isCommentBeingEdited = (commentId) => {
    return editCommentId === commentId;
  };

  //Checks if the current user is the owner of the comment
  const isCurrentUserCommentOwner = (comment) => {
    return username === comment.username;
  };

  //Handles movie favorite and unfavorite functionality
  const handleFavorite = async (e, movieId) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please log in to add this to your favorites!');
      return;
    }
    if (favoriteMovies.includes(movieId)) {
      // Movie is currently a favorite, so unfavorite it
      try {
        await axios.post('http://localhost:8000/api/removeFavoriteMovie', { movieId, username: username });
        setFavoriteMovies(prev => prev.filter(id => id !== movieId));
      } catch (err) {
        console.error(err);
      }
    } else {
      // Movie is not currently a favorite, so favorite it
      try {
        await axios.post('http://localhost:8000/api/addFavoriteMovie', { movieId, username: username });
        setFavoriteMovies(prev => [...prev, movieId]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  //fetches favorite movies
  useEffect(() => {
    const fetchFavoriteMovies = async () => {
      if (isAuthenticated) {
        try {
          const res = await axios.get(`http://localhost:8000/api/getFavoriteMovies?username=${username}`);
          setFavoriteMovies(res.data.map(movie => movie.id));
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchFavoriteMovies();
  }, [isAuthenticated, user, username]);

  //fetches movie
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=f549403fdea812edaa41d0d879d55bc8`);
        setMovie(res.data);
      } catch(err) {
        console.error(err);
      }
    };

    fetchMovie();
  }, [id]);

  if (!movie) return null;

  return (
    <MovieContainer>
        <h1>{movie.title}</h1>
        <FavoritesButton onClick={(e) => handleFavorite(e, movie.id)}>
            <HiStar size={20} color={favoriteMovies.includes(movie.id) ? '#FFC0CB' : '#FFFFFF'} />
        </FavoritesButton>
        <img src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`} alt={movie.title} />
        <p>{movie.overview}</p>
        <p>Release Date: {movie.release_date}</p>
        <p>Rating: {movie.vote_average}</p>

        <h2>Comments</h2>

      {isAuthenticated && (
        <CommentForm onSubmit={handleCommentSubmit}>
          <CommentTextArea
            placeholder="Enter your comment here..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <CommentSubmitButton type="submit">Post Comment</CommentSubmitButton>
        </CommentForm>
      )}

      <CommentsSection>
        {comments.map(comment => (
          <CommentCard key={comment._id}>
            <div>
              <CommentUsername>{comment.username}</CommentUsername>
              {isCommentBeingEdited(comment._id) ? (
                <CommentTextArea
                  value={editCommentContent}
                  onChange={(e) => setEditCommentContent(e.target.value)}
                />
              ) : (
                <CommentContent>{comment.content}</CommentContent>
              )}
            </div>
            {isCurrentUserCommentOwner(comment) && (
              <div>
                {isCommentBeingEdited(comment._id) ? (
                  <>
                    <SaveButton onClick={() => handleCommentUpdate(comment._id)}>Save</SaveButton>
                    <CancelButton onClick={handleCommentCancel}>Cancel</CancelButton>
                  </>
                ) : (
                  <EditButton onClick={() => handleCommentEdit(comment._id, comment.content)}>Edit</EditButton>
                )}
                <DeleteButton onClick={() => handleCommentDelete(comment._id)}>Delete</DeleteButton>
              </div>
            )}
          </CommentCard>
        ))}
      </CommentsSection>
    </MovieContainer>
  );
};

export default MovieDetail;

// styling

const CommentForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 20px;
`;

const CommentTextArea = styled.textarea`
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  border: none;
  resize: none;
`;

const CommentSubmitButton = styled.button`
  padding: 10px;
  background-color: #FFC0CB;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;

const CommentsSection = styled.div`
  width: 100%;
`;

const CommentCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #444;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
`;

const CommentUsername = styled.h3`
  color: #FFC0CB;
  margin: 0;
`;

const CommentContent = styled.p`
  color: #FFF;
  margin: 0;
  grid-column: 1 / -1;
`;

const DeleteButton = styled.button`
  padding: 5px;
  background-color: #FF0000;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #b30000;
  }
`;

const SaveButton = styled.button`
  padding: 5px;
  background-color: #008000;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #006400;
  }
`;

const EditButton = styled.button`
  padding: 5px;
  background-color: #6495ED;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #4169E1;
  }
`;

const CancelButton = styled.button`
  padding: 5px;
  background-color: #FF4500;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #FF6347;
  }
`;

const MovieContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 900px;
  padding: 15px;
  color: #fff;
  background-color: #333;
  margin: 50px auto;
  border-radius: 10px;
`;

const FavoritesButton = styled.button`
  margin-bottom: 15px;
  background: none;
  border: none;
  cursor: pointer;
`;