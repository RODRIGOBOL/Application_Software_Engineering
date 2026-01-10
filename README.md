# AdaptiveDrive 🚗🎵

## Project Overview
AdaptiveDrive is our semester project for the **Web Application Development** course. We wanted to explore how we could make driving safer and more enjoyable by removing the need for drivers to manually change music stations.

The core concept is an "context-aware" algorithm. Instead of a random shuffle, our application analyzes telemetry data (Speed, Time, Weather) to curate a playlist that matches the current driving environment.

[We have made a website available so you don't have to install anything](https://tinyurl.com/adaptativedrive)
>[!NOTE]
>Since we don't have access to a real vehicle's CAN bus, we built a "Sensor Control Panel" on the left side of the app to simulate the inputs.

## How It Works
The application uses a weighted decision engine found in `services/recommendationEngine.ts`.

1.  **Safety First (Speed > 90km/h):** If the driver speeds up, the system assumes highway driving. It switches to high-tempo genres (Rock, Electro, Pop) to help keep the driver alert and focused.
2.  **Morning Commute:** Between 5 AM and 11 AM, if the weather is nice, it prioritizes Acoustic and Pop tracks to wake the driver up gently.
3.  **Night Mode:** Late-night drives (after 8 PM) trigger Jazz and Chill beats for a relaxed atmosphere.
4.  **Weather Response:** If the sensors detect Rain or Snow, the system adapts to "cozy" genres like LoFi/Chill.

## Tech Stack
*   **Frontend:** React (v18+) with TypeScript
*   **Styling:** Tailwind CSS (for the dashboard UI)
*   **Icons:** Lucide React

## Getting started

### Prerequisites
Before running this project, make sure you have installed [Node.js](https://nodejs.org/) (Version 18 or higher).

### Install & Setup

```bash
git clone https://github.com/rodrigobol/application_software_engineering.git
cd application_software_engineering
```
Run this command to install everything at once:
```
npm run setup
```
### Configure Environment Variables

To enable Spotify features you need to: 

+ Create a .env file in the root directory.
+ Add the content of [.env.example](https://github.com/RODRIGOBOL/Application_Software_Engineering/blob/main/.env.example) and modify it with your api keys.

>[!NOTE]
>If you don't have Spotify api keys, the app will run in "Simulation Mode" with local mock data.

### Run the application

Start the secure development server:
```
npm run dev
```


## Project Structure
*   `components/SensorControls.tsx`: Our simulation dashboard.
*   `components/Playlist.tsx`: The visual output of the queue.
*   `services/recommendationEngine.ts`: The logic layer (simulating a backend controller).
*   `types.ts`: TypeScript interfaces for our data models.

## Future Improvements
If we had more time, we would like to:
*   Connect this to the Spotify Web Playback SDK for real audio.
*   Implement the backend with MongoDB/Express (we currently mock the database in `constants.ts`).
*   Add a "Passenger Mode" so others can vote on the queue.

## Team
*   Adam FERRE
*   Franck POKAM
*   Daniel ORDUY REY
*   Victor NAVAS FERNANDEZ
*   Vincent MOULY
