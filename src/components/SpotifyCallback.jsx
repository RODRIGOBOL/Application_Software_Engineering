import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SpotifyService from '../services/SpotifyService';

/**
 * Page de redirection après l'authentification Spotify.
 * Récupère le code dans l'URL et demande un token d'accès.
 */
export const SpotifyCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Récupération du code d'auth dans l'URL (?code=...)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      SpotifyService.getAccessToken(code)
        .then(() => {
          // Succès : on retourne à l'accueil
          navigate('/');
        })
        .catch((error) => {
          console.error("Erreur lors de l'échange du token :", error);
          // Optionnel : rediriger vers l'accueil même en cas d'erreur
          navigate('/');
        });
    } else {
        // Pas de code ? On renvoie à l'accueil
        navigate('/');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="animate-pulse text-xl">Connexion à Spotify en cours...</div>
    </div>
  );
};