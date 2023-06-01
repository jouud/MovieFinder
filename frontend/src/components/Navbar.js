import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { useAuth0 } from '@auth0/auth0-react';


const Navbar = ({ searchQuery, setSearchQuery, searchMovies, setMovieResults }) => {
  // Importing authentication-related functions and states from Auth0
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

  return (
    <Container>
      <Logo>
        <LogoLink to="/" onClick={() => setMovieResults([])}>MovieFinder</LogoLink> {/* MovieFinder logo links to the main page */}
      </Logo>

      <SearchContainer>
        {/* Search bar for the user to enter their query */}
        <SearchBar 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          placeholder="Search for your favorite movie..." 
        />

        {/* Search button that calls the searchMovies function when clicked */}
        <SearchButton onClick={searchMovies}>Search</SearchButton>
      </SearchContainer>

      <RightSection>
        {/* Conditional rendering of login and logout buttons based on authentication state */}
        {!isAuthenticated && (
          <Button>
            <StyledNavLink onClick={() => loginWithRedirect()}>Log In</StyledNavLink>
          </Button>
        )}

        {/* When the user is authenticated, the logout button and links to profile and favorites pages are displayed */}
        {isAuthenticated && (
          <Container>
            <Button>
              <StyledNavLink onClick={() => logout()}>Log Out</StyledNavLink>
            </Button> 

            <Button>
              <StyledNavLink to="/Profile">Profile</StyledNavLink>
            </Button>

            <Button>
              <StyledNavLink to="/Favourites">Favourites</StyledNavLink>
            </Button>
          </Container>
        )}        
      </RightSection>
    </Container>
  );
};

export default Navbar;

//styling
const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #393939; // IMDb's navbar color
  padding: 10px;
`;


const Logo = styled.div`
  font-weight: bold;
`;

const LogoLink = styled(NavLink)`
  color: #FFC0CB; // light pink color
  font-size: 1.5em; // larger size
  text-decoration: none;
`;


const SearchContainer = styled.div`
  display: flex;
`;

const SearchBar = styled.input`
  padding: 5px;
  width: 200px;
  color: #333;
  background-color: #fff; // white background
  border: none;
  border-radius: 3px; // rounded corners
  ::placeholder {
    color: #999;
  }
`;


const SearchButton = styled.button`
  margin-left: 10px;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
`;

const Button = styled.button`
  margin-left: 10px;
`;

const StyledNavLink = styled(NavLink)`
  color: #000; // white color
  text-decoration: none;
  
  &:hover {
    color: #FFC0CB;
  }
`;