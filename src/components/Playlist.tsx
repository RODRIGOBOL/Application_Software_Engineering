import React from 'react';
import { Music } from '../types';
import { Play, Clock, Music as MusicIcon } from 'lucide-react';

interface PlaylistProps {
  tracks: Music[];
}

const Playlist: React.FC<PlaylistProps> = ({ tracks }) => {
  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <MusicIcon size={48} className="mb-2 opacity-50" />
        <p>No tracks match current conditions.</p>
      </div>
    );
  }

  const currentTrack = tracks[0];
  const upcomingTracks = tracks.slice(1);

  return (
    <div className="flex flex-col h-full">
      {/* Now Playing Hero */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-6 mb-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <MusicIcon size={120} />
        </div>
        
        <div className="flex items-center gap-6 relative z-10">
          <img 
            src={currentTrack.coverUrl} 
            alt={currentTrack.name} 
            className="w-24 h-24 rounded-lg shadow-md object-cover"
          />
          <div>
            <div className="inline-block px-2 py-1 bg-white/20 rounded text-xs uppercase tracking-wider mb-2 backdrop-blur-sm">
              Now Playing • {currentTrack.type}
            </div>
            <h3 className="text-2xl font-bold text-white leading-tight">{currentTrack.name}</h3>
            <p className="text-blue-200 text-lg">{currentTrack.artist}</p>
          </div>
        </div>
      </div>

      {/* Up Next List */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Up Next (Adapted)</h4>
        <div className="overflow-y-auto pr-2 space-y-2 flex-1">
          {upcomingTracks.map((track, index) => (
            <div key={track.id} className="bg-gray-800/50 hover:bg-gray-800 p-3 rounded-lg flex items-center justify-between transition-colors group">
              <div className="flex items-center gap-3">
                <span className="text-gray-500 font-mono text-sm w-4">{index + 1}</span>
                <img src={track.coverUrl} alt="mini cover" className="w-10 h-10 rounded object-cover opacity-80 group-hover:opacity-100" />
                <div>
                  <p className="font-medium text-gray-200 text-sm">{track.name}</p>
                  <p className="text-xs text-gray-500">{track.artist}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">{track.type}</span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={12} /> {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Playlist;