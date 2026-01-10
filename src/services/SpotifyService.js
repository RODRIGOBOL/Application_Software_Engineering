const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

// URLs fournies (Proxy ou simulation)
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"; // J'ai remis la vraie URL Spotify standard, change-la si tu utilises un proxy spécifique
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

class SpotifyService {
  constructor() {
    this.accessToken = localStorage.getItem('spotify_access_token');
  }

  /**
   * 1. Rediriger l'utilisateur vers Spotify pour se connecter
   */
  authenticate() {
    const scopes = [
      "user-read-private",
      "user-read-email",
      "playlist-read-private",
      "playlist-read-collaborative"
    ];
    const loginUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${scopes.join("%20")}&response_type=code&show_dialog=true`;
    window.location.href = loginUrl;
  }

  /**
   * 2. Échanger le code reçu contre un Token d'accès
   * @param {string} code 
   */
  async getAccessToken(code) {
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", REDIRECT_URI);

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + btoa(CLIENT_ID + ":" + CLIENT_SECRET)
    };

    try {
      const response = await fetch(TOKEN_ENDPOINT, {
        method: "POST",
        headers: headers,
        body: params
      });

      if (!response.ok) throw new Error("Erreur authentification Spotify");

      const data = await response.json();
      this.accessToken = data.access_token;
      // On sauvegarde le token pour éviter de se reconnecter à chaque reload
      localStorage.setItem('spotify_access_token', data.access_token);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * 3. Récupérer les playlists
   */
  async getUserPlaylists() {
    if (!this.accessToken) return [];
    
    // Note: Utilisation de l'API officielle Spotify ici
    const response = await fetch("https://api.spotify.com/v1/me/playlists", {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });
    const data = await response.json();
    return data.items || [];
  }

  /**
   * 4. Récupérer les tracks d'une playlist
   * @param {string} playlistId 
   */
  async getPlaylistTracks(playlistId) {
    if (!this.accessToken) return [];

    // Correction de la syntaxe ${playlistId} qui manquait le $ dans ton fichier original
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=20`, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });
    const data = await response.json();
    
    // On nettoie un peu la donnée pour faciliter l'usage
    return data.items.map((item) => ({
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists[0].name,
      uri: item.track.uri,
      coverUrl: item.track.album.images[0]?.url,
      // Ces champs devront être enrichis par l'API Audio Features plus tard pour l'algo
      energy: 0.5, 
      tempo: 100 
    }));
  }
}

export default new SpotifyService();