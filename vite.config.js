import path from 'path';
import { fileURLToPath } from 'url'; // Nécessaire pour recréer __dirname
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

// En mode "module" JS, __dirname n'existe pas, on le recrée ici :
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    // Charge les variables d'environnement
    const env = loadEnv(mode, '.', '');

    return {
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [
            react(), 
            basicSsl()
        ],
        define: {
            // Injection des clés API
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        }
    };
});