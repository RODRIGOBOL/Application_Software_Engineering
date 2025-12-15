// src/hooks/useSpeedSensor.ts
import { useState, useEffect } from 'react';

export const useSpeedSensor = () => {
  const [speedKmH, setSpeedKmH] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Géolocalisation non supportée");
      return;
    }

    // Options pour haute précision (indispensable pour la vitesse)
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    const id = navigator.geolocation.watchPosition(
      (position) => {
        // La vitesse est renvoyée en m/s par le navigateur.
        // Si null (appareil immobile), on met 0.
        const speedKpS = position.coords.speed || 0;
        
        // Conversion m/s -> km/h
        const realSpeed = Math.round(speedKpS * 3.6);
        
        setSpeedKmH(realSpeed);
      },
      (err) => setError(err.message),
      options
    );

    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return { speedKmH, error };
};