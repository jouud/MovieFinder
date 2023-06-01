import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useAuth0 } from '@auth0/auth0-react';
import { HiStar } from 'react-icons/hi';
import axios from "axios";
import { useState, useEffect } from "react";

const Home = ({ movieResults, popularMovies }) => {
  const moviesToDisplay = movieResults.length ? movieResults : popularMovies;
  const { isAuthenticated, user } = useAuth0();
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const username =  user?.email;
  
  // Handle click on favorite button
  const handleFavorite = async (e, movieId) => {
    e.preventDefault();
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

  // Fetch the favorite movies for the user
  useEffect(() => {
    const fetchFavoriteMovies = async () => {
      if (isAuthenticated) {
        try {
          const res = await axios.get(`http://localhost:8000/api/getFavoriteMovies?username=${username}`);
          setFavoriteMovies(res.data.map(movie => movie.id)); // set favoriteMovies as an array of movie IDs
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchFavoriteMovies();
  }, [isAuthenticated, user, username]);


  return (
    <PageContainer>
    <PageTitle>Popular Movies:</PageTitle>
    <MovieGrid>
    {moviesToDisplay.map(movie => (
        <MovieLink to={`/movie/${movie.id}`} key={movie.id}>
            <img src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`} alt={movie.title} />
            <h2>{movie.title}</h2>
            <FavoritesButton onClick={(e) => handleFavorite(e, movie.id)}>
            <HiStar size={20} color={favoriteMovies.includes(movie.id) ? '#FFC0CB' : 'white'} />
            </FavoritesButton>
        </MovieLink>
    ))}
</MovieGrid>
</PageContainer>  
  );
};


export default Home;

//styling

const PageContainer = styled.div`
  background-color: #000;
  min-height: 100vh;
  padding: 20px;
`;

const PageTitle = styled.h1`
  text-align: center;
  color: #fff;
  padding-bottom: 20px;
`;
const FavoritesButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
`;

const MovieGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
  gap: 1rem;
  justify-content: center;
  background-color: #000;
  padding: 1rem;
`;

const MovieLink = styled(Link)`
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

  ${FavoritesButton} {
    position: absolute;
    bottom: 15px;
    right: 15px;
  }
`;