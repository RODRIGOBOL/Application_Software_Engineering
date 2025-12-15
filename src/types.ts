// ---------------------------------------------------------
// MODEL: User (Equivalent to backend/models/User.js)
// ---------------------------------------------------------
export interface User {
  id: string;
  username: string;
  
  /** 
   * SECURITY NOTE: 
   * In a real backend (Mongoose), this field must store a HASH (e.g., bcrypt/Argon2), never plain text.
   * COMPLIANCE: Encrypt PII (Personally Identifiable Information) at rest.
   */
  passwordHash: string; 
  
  settings: {
    preferredGenres: string[];
    autoPlay: boolean;
  };
}

// ---------------------------------------------------------
// MODEL: Music (Equivalent to backend/models/Music.js)
// ---------------------------------------------------------
export type MusicType = 'acoustic' | 'rock' | 'jazz' | 'pop' | 'electro' | 'chill' | 'classical';

export interface Music {
  id: string;
  name: string;
  artist: string;
  duration: number; // in seconds
  lyrics?: string;
  type: MusicType;
  coverUrl: string;
}

// ---------------------------------------------------------
// CONTEXT DATA (Simulating Sensors)
// ---------------------------------------------------------
export interface DriveContext {
  speed: number;       // km/h
  timeOfDay: number;   // 24h format (0-23)
  weather: 'clear' | 'rain' | 'snow' | 'cloudy';
}