import React, { useState, useEffect } from 'react';
import { DriveContext, Music } from './types';
import { generatePlaylist } from './services/recommendationEngine';
import { getRealTimeContext } from './services/weatherService'; // Import du nouveau service
import SensorControls from './components/SensorControls';
import Playlist from './components/Playlist';
import { Activity, MapPin, RefreshCw, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  // Contexte par défaut
  const [context, setContext] = useState<DriveContext>({
    speed: 0,
    timeOfDay: 9, 
    weather: 'clear'
  });

  const [playlist, setPlaylist] = useState<Music[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // États pour la gestion des données réelles
  const [autoMode, setAutoMode] = useState<boolean>(true);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // --- AUTOMATISATION : Chargement des données réelles au démarrage ---
  useEffect(() => {
    handleAutoDetect();
  }, []);

  // Fonction pour déclencher la détection API
  const handleAutoDetect = async () => {
    setLocationStatus('loading');
    setIsProcessing(true);
    try {
      const realContext = await getRealTimeContext();
      
      setContext(prev => ({
        ...prev,
        ...realContext // Écrase weather et timeOfDay avec les vraies données
      }));
      
      setLocationStatus('success');
      setAutoMode(true);
    } catch (err) {
      setLocationStatus('error');
      // On reste sur les valeurs par défaut en cas d'erreur
    } finally {
      setIsProcessing(false);
    }
  };

  // --- LOGIQUE CORE : Mise à jour de la playlist ---
  useEffect(() => {
    setIsProcessing(true);
    const timer = setTimeout(() => {
      const newPlaylist = generatePlaylist(context);
      setPlaylist(newPlaylist);
      setIsProcessing(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [context]);

  // Wrapper pour désactiver le mode auto si l'utilisateur touche aux contrôles
  const handleManualContextChange = (newContext: DriveContext) => {
    if (autoMode) setAutoMode(false); // Passage en manuel dès qu'on touche
    setContext(newContext);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Header / Info */}
        <div className="lg:col-span-12 mb-4 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-800 pb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
              AdaptiveDrive
            </h1>
            <p className="text-gray-500 text-sm">Real-time Contextual Playlist Engine</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Indicateur de statut des données */}
            <div className={`px-4 py-2 rounded-full border flex items-center gap-2 text-xs font-medium transition-all
              ${locationStatus === 'success' && autoMode ? 'bg-green-900/30 border-green-800 text-green-400' : 
                locationStatus === 'loading' ? 'bg-blue-900/30 border-blue-800 text-blue-400' :
                'bg-yellow-900/20 border-yellow-800 text-yellow-500'}`}>
              
              {locationStatus === 'loading' && <RefreshCw size={14} className="animate-spin" />}
              {locationStatus === 'success' && autoMode && <MapPin size={14} />}
              {(!autoMode || locationStatus === 'error') && <AlertTriangle size={14} />}
              
              {locationStatus === 'loading' ? 'Synchronisation Météo/GPS...' : 
               locationStatus === 'success' && autoMode ? 'Mode Auto : Données Réelles' : 
               'Mode Manuel (Simulation)'}
            </div>

            {/* Bouton pour relancer la détection si on est passé en manuel */}
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
          {/* On passe le wrapper handleManualContextChange au lieu de setContext direct */}
          <SensorControls context={context} onContextChange={handleManualContextChange} />
          
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
            <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
              <Activity size={16} /> Logic Debugger
            </h3>
            <div className="text-xs font-mono text-gray-500 space-y-1">
              <p>Current Algorithm State:</p>
              <p>Rule: {context.speed > 90 ? 'HIGH_SPEED_FOCUS' : (context.timeOfDay > 20 || context.timeOfDay < 5) ? 'NIGHT_MODE_RELAX' : 'STANDARD_ADAPTIVE'}</p>
              <p className={autoMode ? "text-green-500" : "text-yellow-500"}>
                Data Source: {autoMode ? "LIVE API (Open-Meteo)" : "USER INPUT"}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Playlist (Output) */}
        <div className="lg:col-span-8 bg-gray-900 rounded-2xl p-6 border border-gray-800 h-[600px] shadow-2xl flex flex-col">
           <Playlist tracks={playlist} />
        </div>

      </div>
    </div>
  );
};

export default App;