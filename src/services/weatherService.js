/**
 * Mappe les codes WMO (World Meteorological Organization)
 * vers les types définis dans ton application.
 * @param {number} code - Code météo WMO
 * @returns {string} 'clear', 'cloudy', 'rain' ou 'snow'
 */
const mapWmoToWeatherType = (code) => {
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
 * Récupère la position GPS de l'utilisateur (Ponctuel)
 * @returns {Promise<GeolocationPosition>}
 */
const getPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("La géolocalisation n'est pas supportée par ce navigateur."));
    }
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

/**
 * Fonction principale : Récupère Météo + Heure locale réelles
 * @returns {Promise<Object>} Contexte partiel (weather + timeOfDay)
 */
export const getRealTimeContext = async () => {
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

    const data = await response.json();

    // 3. Extraction de l'heure locale réelle
    const currentHour = new Date().getHours();

    // 4. Retourne le contexte formaté
    return {
      weather: mapWmoToWeatherType(data.current_weather.weathercode),
      timeOfDay: currentHour,
    };

  } catch (error) {
    console.error("Context Auto-Detection Failed:", error);
    throw error; // Renvoie l'erreur pour activer le mode manuel dans l'UI
  }
};

/**
 * --- NOUVELLE FONCTION ---
 * Surveille la vitesse en temps réel via le GPS du téléphone.
 * Convertit la vitesse de m/s en km/h.
 * @param {function(number):void} onSpeedUpdate - Callback avec la vitesse en km/h
 * @param {function(Object):void} onError - Callback en cas d'erreur
 * @returns {number} ID du watcher (pour le nettoyer plus tard)
 */
export const watchRealTimeSpeed = (onSpeedUpdate, onError) => {
  if (!navigator.geolocation) {
    // Erreur simulée si non supporté
    const error = {
      code: 2,
      message: "Geolocation not supported",
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3
    };
    onError(error);
    return -1;
  }

  // watchPosition retourne un ID (number) pour pouvoir stopper l'écoute plus tard
  return navigator.geolocation.watchPosition(
    (position) => {
      // position.coords.speed est en m/s (ou null si immobile/indisponible)
      const speedMs = position.coords.speed || 0;
      // Conversion m/s -> km/h
      const speedKmh = Math.round(speedMs * 3.6);
      
      onSpeedUpdate(speedKmh);
    },
    (err) => onError(err),
    {
      enableHighAccuracy: true, // Important pour la précision de la vitesse
      timeout: 5000,
      maximumAge: 0
    }
  );
};