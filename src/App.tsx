// src/App.tsx
import React, { useState, useEffect } from 'react';
import { DriveContext, Music } from './types';
import { getRealTimeContext } from './services/weatherService';
import { loginUrl, getTokenFromUrl, fetchSmartRecommendations } from './services/spotifyService'; // NOUVEAU
import { useSpeedSensor } from './hooks/useSpeedSensor'; // NOUVEAU
import SensorControls from './components/SensorControls';
import Playlist from './components/Playlist';
import { Activity, MapPin, RefreshCw, AlertTriangle, LogIn } from 'lucide-react';
import { generatePlaylist } from './services/recommendationEngine'; // Fallback ancien algo

const App: React.FC = () => {
  // --- 1. GESTION SPOTIFY ---
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);

  useEffect(() => {
    const token = getTokenFromUrl();
    if (token) {
      setSpotifyToken(token);
      window.location.hash = ""; // Nettoyer l'URL
    }
  }, []);

  // --- 2. GESTION CAPTEURS ---
  const { speedKmH } = useSpeedSensor(); // Notre nouveau capteur GPS

  const [context, setContext] = useState<DriveContext>({
    speed: 0,
    timeOfDay: new Date().getHours(), 
    weather: 'clear'
  });

  const [playlist, setPlaylist] = useState<Music[]>([]);
  const [autoMode, setAutoMode] = useState<boolean>(true);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Mise à jour automatique avec le VRAI capteur de vitesse
  useEffect(() => {
    if (autoMode) {
      setContext(prev => ({ ...prev, speed: speedKmH }));
    }
  }, [speedKmH, autoMode]);

  // Initialisation Météo
  useEffect(() => {
    handleAutoDetect();
  }, []);

  const handleAutoDetect = async () => {
    setLocationStatus('loading');
    try {
      const realContext = await getRealTimeContext();
      setContext(prev => ({ ...prev, ...realContext }));
      setLocationStatus('success');
      setAutoMode(true);
    } catch (err) {
      setLocationStatus('error');
    }
  };

  // --- 3. GÉNÉRATION PLAYLIST (HYBRIDE) ---
  useEffect(() => {
    const updateMusic = async () => {
      if (spotifyToken) {
        // Mode PRO : Algorithme Spotify API
        try {
          const tracks = await fetchSmartRecommendations(spotifyToken, context);
          setPlaylist(tracks);
        } catch (e) {
          console.error("Erreur Spotify", e);
        }
      } else {
        // Mode STANDARD : Ancien algorithme local
        const newPlaylist = generatePlaylist(context);
        setPlaylist(newPlaylist);
      }
    };

    // Debounce pour ne pas spammer l'API quand on change les sliders vite
    const timer = setTimeout(updateMusic, 800);
    return () => clearTimeout(timer);
  }, [context, spotifyToken]);

  const handleManualContextChange = (newContext: DriveContext) => {
    if (autoMode) setAutoMode(false);
    setContext(newContext);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Header */}
        <div className="lg:col-span-12 mb-4 flex flex-col md:flex-row items-center justify-between border-b border-gray-800 pb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
              AdaptiveDrive {spotifyToken ? "Pro" : "Lite"}
            </h1>
            <p className="text-gray-500 text-sm">
              {spotifyToken ? "Connecté à Spotify Intelligence" : "Mode Simulation Local"}
            </p>
          </div>

          {!spotifyToken && (
            <a href={loginUrl} className="flex items-center gap-2 bg-[#1DB954] text-black font-bold py-2 px-6 rounded-full hover:bg-green-400 transition">
              <LogIn size={18} /> Connecter Spotify
            </a>
          )}
        </div>

        {/* Colonne Gauche : Capteurs */}
        <div className="lg:col-span-4 space-y-6">
          <SensorControls context={context} onContextChange={handleManualContextChange} />
          
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
            <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
              <Activity size={16} /> Live Data Debug
            </h3>
            <div className="text-xs font-mono text-gray-500 space-y-1">
              <p>GPS Speed Sensor: <span className="text-white">{speedKmH} km/h</span></p>
              <p>Context Logic: {context.speed > 110 ? 'HIGH_SPEED_ENERGY' : 'CRUISING'}</p>
              {spotifyToken && <p className="text-green-500">API Spotify: Active</p>}
            </div>
          </div>
        </div>

        {/* Colonne Droite : Playlist */}
        <div className="lg:col-span-8 bg-gray-900 rounded-2xl p-6 border border-gray-800 h-[600px] shadow-2xl flex flex-col">
           <Playlist tracks={playlist} />
        </div>

      </div>
    </div>
  );
};

export default App;