import { DriveContext, Music } from '../types';
import { MUSIC_LIBRARY } from '../constants';

/**
 * LOGIC CORE: musicController
 * 
 * This service simulates the backend controller that would normally receive 
 * telemetry data from the car and return a playlist.
 */

// Integration Points:
// - Weather API (e.g., OpenWeatherMap) would be called here in a real app.
// - GPS/Speed API would be passed via the `context` object.

export const generatePlaylist = (context: DriveContext): Music[] => {
  const { speed, timeOfDay, weather } = context;

  console.log(`Analyzing Context: Speed=${speed}, Time=${timeOfDay}, Weather=${weather}`);

  let preferredTypes: string[] = [];

  // --- RULE 1: High Speed (Safety/Focus) ---
  // If driving fast, maintain concentration with rhythm (Rock, Pop, Electro)
  if (speed > 90) {
    preferredTypes.push('rock', 'electro', 'pop');
  } 
  
  // --- RULE 2: Morning & Mild (Wake up gently) ---
  // Morning (5AM - 11AM) and Weather is Clear or Cloudy (not storming)
  else if (timeOfDay >= 5 && timeOfDay < 12 && (weather === 'clear' || weather === 'cloudy')) {
    preferredTypes.push('acoustic', 'chill', 'pop');
  }

  // --- RULE 3: Night Drive (Relaxation) ---
  // Night (8PM - 5AM)
  else if (timeOfDay >= 20 || timeOfDay < 5) {
    preferredTypes.push('jazz', 'chill', 'slow');
  }

  // --- Fallback / Default Scenarios ---
  else if (weather === 'rain' || weather === 'snow') {
    // Cozy vibes for bad weather
    preferredTypes.push('chill', 'jazz', 'acoustic');
  } else {
    // Middle of the day, normal speed
    preferredTypes.push('pop', 'rock', 'electro');
  }

  // SEARCH & FILTER (Simulating database query)
  // In Mongoose: Music.find({ type: { $in: preferredTypes } }).limit(10)
  const playlist = MUSIC_LIBRARY.filter(song => preferredTypes.includes(song.type));

  // If filter is too strict and returns nothing, fallback to mixed
  if (playlist.length === 0) {
    return MUSIC_LIBRARY.slice(0, 5); 
  }

  // Randomize order (Fisher-Yates shuffle simulation)
  return playlist.sort(() => Math.random() - 0.5);
};