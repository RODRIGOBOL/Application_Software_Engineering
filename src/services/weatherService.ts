import { DriveContext } from '../types';

// Interface pour la réponse brute de l'API Open-Meteo
interface OpenMeteoResponse {
  current_weather: {
    temperature: number;
    windspeed: number;
    weathercode: number;
    is_day: number;
    time: string;
  };
}

/**
 * Mappe les codes WMO (World Meteorological Organization)
 * vers les types définis dans ton application.
 */
const mapWmoToWeatherType = (code: number): DriveContext['weather'] => {
  // 0: Ciel dégagé
  if (code === 0) return 'clear';
  
  // 1-3: Partiellement nuageux ou couvert
  if (code >= 1 && code <= 3) return 'cloudy';
  
  // 45, 48: Brouillard (considéré comme cloudy/gris pour la conduite)
  if (code === 45 || code === 48) return 'cloudy';
  
  // 51-67, 80-82: Bruine ou Pluie
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  
  // 71-77, 85-86: Neige
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'snow';
  
  // 95-99: Orages (Traite comme forte pluie)
  if (code >= 95 && code <= 99) return 'rain';

  return 'clear'; // Par défaut
};

/**
 * Récupère la position GPS de l'utilisateur
 */
const getPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("La géolocalisation n'est pas supportée par ce navigateur."));
    }
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

/**
 * Fonction principale : Récupère Météo + Heure locale réelles
 */
export const getRealTimeContext = async (): Promise<Partial<DriveContext>> => {
  try {
    // 1. Récupération Position (Latitude/Longitude)
    const position = await getPosition();
    const { latitude, longitude } = position.coords;

    // 2. Appel API Open-Meteo
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération météo");
    }

    const data: OpenMeteoResponse = await response.json();

    // 3. Extraction de l'heure locale réelle
    const currentHour = new Date().getHours();

    // 4. Retourne le contexte formaté
    return {
      weather: mapWmoToWeatherType(data.current_weather.weathercode),
      timeOfDay: currentHour,
      // Note : La vitesse (speed) reste simulée car on ne peut pas la lire via le navigateur 
      // sans être en mouvement avec l'API Geolocation en mode 'watchPosition' (complexe pour un MVP web).
    };

  } catch (error) {
    console.error("Context Auto-Detection Failed:", error);
    throw error; // Renvoie l'erreur pour activer le mode manuel dans l'UI
  }
};