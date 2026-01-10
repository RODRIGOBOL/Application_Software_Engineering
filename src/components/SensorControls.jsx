import React from 'react';
import { Sun, CloudRain, Snowflake, Cloud, Gauge } from 'lucide-react';

/**
 * Composant pour simuler les capteurs de la voiture (Vitesse, Météo, Temps)
 * * @param {Object} props
 * @param {Object} props.context - L'état actuel (vitesse, météo...)
 * @param {Function} props.onContextChange - Fonction pour mettre à jour l'état
 */
const SensorControls = ({ context, onContextChange }) => {
  
  const handleSpeedChange = (e) => {
    onContextChange({ ...context, speed: parseInt(e.target.value) });
  };

  const handleTimeChange = (e) => {
    onContextChange({ ...context, timeOfDay: parseInt(e.target.value) });
  };

  const setWeather = (w) => {
    onContextChange({ ...context, weather: w });
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-blue-400 flex items-center gap-2">
        <Gauge size={20} /> Car Telemetry & Sensors
      </h2>

      <div className="space-y-6">
        {/* Speed Sensor */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-300">Vehicle Speed</label>
            <span className={`text-sm font-bold ${context.speed > 90 ? 'text-red-400' : 'text-green-400'}`}>
              {context.speed} km/h
            </span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="180" 
            value={context.speed} 
            onChange={handleSpeedChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {context.speed > 90 ? "Fast Mode: Switching to High Energy" : "Cruising Mode: Standard/Relaxed"}
          </p>
        </div>

        {/* Time Sensor */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-300">Local Time</label>
            <span className="text-sm font-bold text-yellow-400">
              {context.timeOfDay}:00
            </span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="23" 
            value={context.timeOfDay} 
            onChange={handleTimeChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
           <div className="flex justify-between text-xs text-gray-500 mt-1">
             <span>Midnight</span>
             <span>Noon</span>
             <span>Midnight</span>
           </div>
        </div>

        {/* Weather API Simulation */}
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">Weather Conditions</label>
          <div className="grid grid-cols-4 gap-2">
            <button 
              onClick={() => setWeather('clear')}
              className={`p-2 rounded-lg flex flex-col items-center justify-center transition-colors ${context.weather === 'clear' ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
            >
              <Sun size={20} />
              <span className="text-xs mt-1">Clear</span>
            </button>
            <button 
              onClick={() => setWeather('cloudy')}
              className={`p-2 rounded-lg flex flex-col items-center justify-center transition-colors ${context.weather === 'cloudy' ? 'bg-gray-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
            >
              <Cloud size={20} />
              <span className="text-xs mt-1">Cloudy</span>
            </button>
            <button 
              onClick={() => setWeather('rain')}
              className={`p-2 rounded-lg flex flex-col items-center justify-center transition-colors ${context.weather === 'rain' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
            >
              <CloudRain size={20} />
              <span className="text-xs mt-1">Rain</span>
            </button>
            <button 
              onClick={() => setWeather('snow')}
              className={`p-2 rounded-lg flex flex-col items-center justify-center transition-colors ${context.weather === 'snow' ? 'bg-indigo-400 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
            >
              <Snowflake size={20} />
              <span className="text-xs mt-1">Snow</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorControls;