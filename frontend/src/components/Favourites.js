import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { HiOutlineX } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const Favourites = () => {
  // State for the favourite movies
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  
  // Get the current logged in user
  const { user } = useAuth0();
  const username = user && user.email;

  useEffect(() => {
    // Fetch the favorite movies for the user
    const fetchFavoriteMovies = async () => {
      try {
        if (username) {
          const res = await axios.get(`http://localhost:8000/api/getFavoriteMovies?username=${username}`);
          console.log(res.data);
          setFavoriteMovies(res.data);
        } else {
          // Handle case where username is null or not set
        }
      } catch (err) {
        console.error(err);
        // Handle error
      }
    };

    fetchFavoriteMovies();
  }, [username]);

  // Handle remove favorite movie
  const handleRemoveFavorite = async (movieId) => {
    try {
      await axios.post('http://localhost:8000/api/removeFavoriteMovie', { movieId, username: username });
      setFavoriteMovies((prev) => prev.filter((movie) => movie.id !== movieId)); // update the favoriteMovies state
    } catch (err) {
      console.error(err);
    }
  };

  // Main render method
  return (
    <Container>
      {favoriteMovies.map((movie) => (
        <MovieCard to={`/movie/${movie.id}`} key={movie.id}>
          <MovieInfo>
            <Title>{movie.title}</Title>
            <RemoveButton onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleRemoveFavorite(movie.id);
              }}>
              <HiOutlineX size={20} color="#FFC0CB" />
            </RemoveButton>
          </MovieInfo>
          <img src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`} alt={movie.title} />
        </MovieCard>
      ))}
    </Container>
  );
};

export default Favourites;

//styling

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  min-height: 100vh;
  background-color: black;
  color: white;
`;

const MovieCard = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  text-decoration: none;
  color: #fff;
  position: relative;
  padding-bottom: 40px;

  &:hover {
    background-color: #333;
  }

  img {
    width: 100%;
    height: auto;
  }

  h2 {
    margin-bottom: 10px;
  }
`;

const MovieInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const Title = styled.h2`
  text-align: left;
`;

const RemoveButton = styled.button`
  align-self: flex-end;
  margin-bottom: 20px;
`;