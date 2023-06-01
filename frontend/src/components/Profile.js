import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import styled from 'styled-components';

const Profile = () => {
   // Importing user-related data and authentication state from Auth0
   const { user, isAuthenticated } = useAuth0();
  
   // Logging user details to the console
   console.log(user);
 
   // Rendering user's profile only if the user is authenticated
   return (
    isAuthenticated && user && ( // Add a check for the 'user' object
    
      <ProfileContainer>
        <ProfileImage src={user.picture} alt={user.name} />
        <WelcomeMessage>Welcome back, {user.name}!</WelcomeMessage>
        <UserInfo>{user.email}</UserInfo>
      </ProfileContainer>
    )
  );
  
}

export default Profile;

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #333;
  color: #fff;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  height: 400px;
  margin: auto;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
const ProfileImage = styled.img`
  border-radius: 50%;
  width: 200px;
  height: 200px;
  object-fit: cover;
  border: 2px solid #fff;
  margin-bottom: 20px;
`;

const WelcomeMessage = styled.h2`
  margin-bottom: 10px;
`;

const UserInfo = styled.p`
  font-size: 1.2em;
  color: #FFD700;
`;