// src/services/spotifyService.ts
import { DriveContext, Music } from '../types';

// REMPLACE CECI PAR TON CLIENT ID SPOTIFY (Depuis le Dashboard Developer)
const CLIENT_ID = "TON_CLIENT_ID_ICI"; 
const REDIRECT_URI = "http://localhost:3000"; // Ou ton URL de prod
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = ["user-read-private", "user-read-email"];

// 1. Authentification
export const loginUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES.join("%20")}&show_dialog=true`;

export const getTokenFromUrl = (): string | null => {
  return window.location.hash
    .substring(1)
    .split("&")
    .reduce((initial: any, item) => {
      let parts = item.split("=");
      initial[parts[0]] = decodeURIComponent(parts[1]);
      return initial;
    }, {}).access_token;
};

// 2. L'ALGORITHME DE DÉCISION (Le "Cerveau")
// Il transforme le contexte (Vitesse, Météo) en paramètres Audio Spotify
const calculateAudioFeatures = (context: DriveContext) => {
  let params = new URLSearchParams();
  params.append("limit", "10");
  params.append("market", "FR");
  
  // Genres de base (Seeds)
  params.append("seed_genres", "pop,rock,electronic");

  // --- LOGIQUE INTELLIGENTE ---
  
  // A. Facteur Vitesse (Impacte le Tempo et l'Énergie)
  if (context.speed > 110) {
    // Autoroute : Très rapide, haute énergie pour la vigilance
    params.set("min_tempo", "130");
    params.set("target_energy", "0.9");
    params.set("seed_genres", "techno,drum-and-bass,hard-rock");
  } else if (context.speed > 50) {
    // Ville/Route : Rythme modéré
    params.set("target_tempo", "100");
    params.set("target_energy", "0.6");
  } else {
    // Bouchons/Arrêt : Calme pour ne pas stresser
    params.set("max_tempo", "90");
    params.set("target_energy", "0.4");
  }

  // B. Facteur Météo (Impacte la "Valence" = positivité de la musique)
  if (context.weather === 'rain' || context.weather === 'snow') {
    // Mauvais temps : Musique un peu plus mélancolique ou "cozy"
    params.set("target_valence", "0.3"); // Triste/Calme
    params.set("target_acousticness", "0.7");
    params.set("seed_genres", "piano,acoustic,rainy-day");
  } else if (context.weather === 'clear') {
    // Beau temps : Musique joyeuse
    params.set("min_valence", "0.8"); // Joyeux
  }

  // C. Facteur Heure (Nuit vs Jour)
  if (context.timeOfDay > 22 || context.timeOfDay < 5) {
    params.set("target_danceability", "0.3"); // Pas trop dansant la nuit
    params.set("seed_genres", "synth-pop,ambient,jazz");
  }

  return params;
};

// 3. Appel API Spotify
export const fetchSmartRecommendations = async (token: string, context: DriveContext): Promise<Music[]> => {
  const queryParams = calculateAudioFeatures(context);
  
  const response = await fetch(`https://api.spotify.com/v1/recommendations?${queryParams.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) throw new Error("Erreur Spotify API");

  const data = await response.json();

  // Mapping pour correspondre à ton interface Music existante
  return data.tracks.map((track: any) => ({
    id: track.id,
    name: track.name,
    artist: track.artists[0].name,
    duration: Math.floor(track.duration_ms / 1000),
    type: 'electro', // Par défaut, ou déduit des genres
    coverUrl: track.album.images[0]?.url || 'https://via.placeholder.com/150'
  }));
};