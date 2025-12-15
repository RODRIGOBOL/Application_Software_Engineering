import React, { useState, useEffect } from 'react';
import { DriveContext, Music } from './types';
import { generatePlaylist } from './services/recommendationEngine'; // Moteur local (fallback)
import { getRealTimeContext, watchRealTimeSpeed } from './services/weatherService'; // Services GPS/Météo
import SpotifyService from './services/SpotifyService'; // Nouveau service Spotify
import SensorControls from './components/SensorControls';
import Playlist from './components/Playlist';
import { Activity, MapPin, RefreshCw, AlertTriangle, Music as MusicIcon } from 'lucide-react';

const App: React.FC = () => {
  // --- ÉTAT DU CONTEXTE (Vitesse, Météo, Heure) ---
  const [context, setContext] = useState<DriveContext>({
    speed: 0,
    timeOfDay: new Date().getHours(),
    weather: 'clear'
  });

  // --- ÉTAT DE L'APPLICATION ---
  const [playlist, setPlaylist] = useState<Music[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoMode, setAutoMode] = useState<boolean>(true);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  // --- ÉTAT SPOTIFY ---
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [rawSpotifyTracks, setRawSpotifyTracks] = useState<any[]>([]); // Cache des pistes brutes

  // 1. INITIALISATION : Vérification Auth Spotify & Données Météo/GPS
  useEffect(() => {
    // Vérifier si un token Spotify existe
    const token = localStorage.getItem('spotify_access_token');
    if (token) setIsSpotifyConnected(true);

    // Lancer la détection auto du contexte
    handleAutoDetect();
  }, []);

  // 2. CHARGEMENT INITIAL DES MUSIQUES SPOTIFY (Une fois connecté)
  useEffect(() => {
    if (isSpotifyConnected) {
      loadSpotifyLibrary();
    }
  }, [isSpotifyConnected]);

  // Fonction pour charger la bibliothèque Spotify de l'utilisateur
  const loadSpotifyLibrary = async () => {
    setIsProcessing(true);
    try {
      const playlists = await SpotifyService.getUserPlaylists();
      if (playlists.length > 0) {
        // On récupère les pistes de la première playlist trouvée pour l'exemple
        const tracks = await SpotifyService.getPlaylistTracks(playlists[0].id);
        setRawSpotifyTracks(tracks);
      }
    } catch (error) {
      console.error("Erreur chargement Spotify:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. CAPTEUR DE VITESSE EN TEMPS RÉEL (Si mode Auto actif)
  useEffect(() => {
    if (autoMode) {
      // On s'abonne aux changements de position/vitesse
      const watchId = watchRealTimeSpeed(
        (realSpeed) => {
          setContext(prev => ({ ...prev, speed: realSpeed }));
        },
        (error) => {
          console.warn("Erreur GPS Vitesse:", error);
          // Ne pas passer en erreur fatale, juste ignorer la vitesse
        }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [autoMode]);

  // 4. MOTEUR DE RECOMMANDATION (Déclenché quand le contexte change)
  useEffect(() => {
    setIsProcessing(true);
    
    // Debounce pour éviter de recalculer à chaque km/h de changement
    const timer = setTimeout(() => {
      
      if (isSpotifyConnected && rawSpotifyTracks.length > 0) {
        // --- MODE SPOTIFY ---
        // Ici, on filtrerait idéalement selon les features audio (tempo, energy).
        // Pour ce MVP, on simule un filtrage ou on mélange simplement.
        // TODO: Appeler un algo plus complexe ici qui utilise context.speed vs track.tempo
        
        let adaptedTracks = [...rawSpotifyTracks];

        // Exemple simple : Si on roule vite (>90), on mélange pour avoir du neuf
        if (context.speed > 90) {
           adaptedTracks.sort(() => Math.random() - 0.5);
        }
        
        // Conversion au format de l'app
        const formattedPlaylist: Music[] = adaptedTracks.slice(0, 10).map((t: any) => ({
          id: t.id,
          name: t.name,
          artist: t.artist,
          duration: 180, // Valeur par défaut si API simple
          type: 'pop',   // Type par défaut (à affiner avec l'API Audio Features)
          coverUrl: t.coverUrl || 'https://via.placeholder.com/150'
        }));
        
        setPlaylist(formattedPlaylist);

      } else {
        // --- MODE LOCAL (SIMULATION) ---
        // Utilise le fichier recommendationEngine.ts existant
        const newPlaylist = generatePlaylist(context);
        setPlaylist(newPlaylist);
      }
      
      setIsProcessing(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [context, isSpotifyConnected, rawSpotifyTracks]);


  // --- HANDLERS ---

  const handleAutoDetect = async () => {
    setLocationStatus('loading');
    setIsProcessing(true);
    try {
      // Appel unique pour la Météo + Position initiale
      const realContext = await getRealTimeContext();
      setContext(prev => ({
        ...prev,
        ...realContext // Écrase weather et timeOfDay
      }));
      setLocationStatus('success');
      setAutoMode(true);
    } catch (err) {
      console.error(err);
      setLocationStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualContextChange = (newContext: DriveContext) => {
    if (autoMode) setAutoMode(false);
    setContext(newContext);
  };

  const connectSpotify = () => {
    SpotifyService.authenticate();
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8 flex items-center justify-center text-white">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Header / Info */}
        <div className="lg:col-span-12 mb-4 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-800 pb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
              AdaptiveDrive
            </h1>
            <p className="text-gray-500 text-sm flex items-center gap-2">
              {isSpotifyConnected ? <span className="text-green-500 flex items-center gap-1"><MusicIcon size={12}/> Spotify Connected</span> : "Simulation Mode"} 
              • Real-time Context Engine
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Bouton Spotify */}
            {!isSpotifyConnected && (
              <button 
                onClick={connectSpotify}
                className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-2 px-4 rounded-full text-xs transition-colors flex items-center gap-2"
              >
                <MusicIcon size={14} /> Connecter Spotify
              </button>
            )}

            {/* Indicateur Statut GPS/Météo */}
            <div className={`px-4 py-2 rounded-full border flex items-center gap-2 text-xs font-medium transition-all
              ${locationStatus === 'success' && autoMode ? 'bg-green-900/30 border-green-800 text-green-400' : 
                locationStatus === 'loading' ? 'bg-blue-900/30 border-blue-800 text-blue-400' :
                'bg-yellow-900/20 border-yellow-800 text-yellow-500'}`}>
              
              {locationStatus === 'loading' && <RefreshCw size={14} className="animate-spin" />}
              {locationStatus === 'success' && autoMode && <MapPin size={14} />}
              {(!autoMode || locationStatus === 'error') && <AlertTriangle size={14} />}
              
              {locationStatus === 'loading' ? 'Sync GPS/Météo...' : 
               locationStatus === 'success' && autoMode ? 'Mode Auto : Données Réelles' : 
               'Mode Manuel (Simulation)'}
            </div>

            {/* Réactiver Auto */}
            {!autoMode && (
              <button 
                onClick={handleAutoDetect}
                className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-full border border-gray-700 transition-colors"
              >
                Réactiver Auto
              </button>
            )}
          </div>
        </div>

        {/* Left Column: Sensors (Input) */}
        <div className="lg:col-span-4 space-y-6">
          <SensorControls context={context} onContextChange={handleManualContextChange} />
          
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
            <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
              <Activity size={16} /> Logic Debugger
            </h3>
            <div className="text-xs font-mono text-gray-500 space-y-1">
              <p>Algorithm: {isSpotifyConnected ? "SPOTIFY_FILTER" : "LOCAL_V2"}</p>
              <p>Rule: {context.speed > 90 ? 'HIGH_SPEED_FOCUS' : (context.timeOfDay > 20 || context.timeOfDay < 5) ? 'NIGHT_MODE_RELAX' : 'STANDARD_ADAPTIVE'}</p>
              <p className={autoMode ? "text-green-500" : "text-yellow-500"}>
                Speed Source: {autoMode ? "LIVE GPS (Watch)" : "MANUAL SLIDER"}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Playlist (Output) */}
        <div className="lg:col-span-8 bg-gray-900 rounded-2xl p-6 border border-gray-800 h-[600px] shadow-2xl flex flex-col">
           {isProcessing && playlist.length === 0 ? (
             <div className="flex items-center justify-center h-full text-blue-400 animate-pulse">
               Analyse du contexte...
             </div>
           ) : (
             <Playlist tracks={playlist} />
           )}
        </div>

      </div>
    </div>
  );
};

export default App;