// React and related libraries
import React, { useState, useEffect } from 'react';
import styled from "styled-components";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Auth0Provider } from '@auth0/auth0-react';
import axios from 'axios';


// Component Imports
import MovieDetail from './MovieDetail';
import Profile from "./Profile";
import Favourites from "./Favourites";
import Home from "./Home";
import Navbar from "./Navbar";

const App = () => {

  // Define state variables for searchQuery, movieResults and popularMovies
  const [searchQuery, setSearchQuery] = useState(''); 
  const [movieResults, setMovieResults] = useState([]); 
  const [popularMovies, setPopularMovies] = useState([]);

  // Function to fetch popular movies from the API
  const fetchPopularMovies = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/getPopularMovies`);
      setPopularMovies(res.data.results);
    } catch(err) {
      console.error(err);
    }
  }

  // useEffect hook to fetch popular movies on component mount
  useEffect(() => {
    fetchPopularMovies();
  }, []);

  // Function to search movies based on the search query
  const searchMovies = async () => { 
    try {
      const res = await axios.get(`http://localhost:8000/api/searchMovies?q=${searchQuery}`);
      console.log(res.data.results);
      setMovieResults(res.data.results);
    } catch(err) {
      console.error(err);
    }
  }

  return (
    // Wrap App in Auth0Provider for authentication
    <Auth0Provider
      domain={'dev-5qr4ufasb7htzfgj.us.auth0.com'}
      clientId={'Xi0qBX77f2BDWc362Xzw0pWdLvA3y6Fa'}
      redirectUri={window.location.origin}
    >
      {/* BrowserRouter and Routes for page routing */}
      <BrowserRouter>
        <Navbar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          searchMovies={searchMovies} 
          setMovieResults={setMovieResults} 
        />
        <Main>
          <Routes>
            <Route path="/" element={<Home movieResults={movieResults} popularMovies={popularMovies} />}  />
            <Route path="/profile" element={<Profile />} />
            <Route path="/favourites" element={<Favourites />} />                
            <Route path="/movie/:id" element={<MovieDetail />} />
          </Routes>
        </Main>
      </BrowserRouter>
    </Auth0Provider>
  );
};

export default App;

//styling

const Main = styled.div`
  background-color: #f5f5f5;
  height: 100vh;
  color: #333;  
`;
