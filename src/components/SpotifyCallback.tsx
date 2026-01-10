import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SpotifyService from '../services/SpotifyService';

export const SpotifyCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      SpotifyService.getAccessToken(code)
        .then(() => {
          navigate('/');
        })
        .catch(console.error);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="animate-pulse text-xl">Connexion à Spotify en cours...</div>
    </div>
  );
};