import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

// ── Mini progress bar ────────────────────────────────────────────────────────
function ProgressBar({ current, total }) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div style={{ height: 2, background: 'rgba(0,212,255,0.1)', borderRadius: 1, overflow: 'hidden' }}>
      <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }}
        style={{ height: '100%', background: '#00d4ff', borderRadius: 1 }} />
    </div>
  );
}

// ── Song item ────────────────────────────────────────────────────────────────
function SongItem({ song, isPlaying, onPlay, onRemove, onFavorite }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 6px', borderRadius: 6,
        background: isPlaying ? 'rgba(0,212,255,0.1)' : 'transparent',
        border: isPlaying ? '1px solid rgba(0,212,255,0.25)' : '1px solid transparent',
        cursor: 'pointer', transition: 'all 0.2s',
        marginBottom: 3,
      }}
      onMouseEnter={e => { if (!isPlaying) e.currentTarget.style.background = 'rgba(0,212,255,0.05)'; }}
      onMouseLeave={e => { if (!isPlaying) e.currentTarget.style.background = 'transparent'; }}
    >
      {/* Thumbnail */}
      <div onClick={onPlay} style={{ width: 32, height: 24, borderRadius: 3, overflow: 'hidden', flexShrink: 0, cursor: 'pointer', position: 'relative' }}>
        {song.thumbnail ? (
          <img src={song.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>🎵</div>
        )}
        {isPlaying && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,212,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.6, repeat: Infinity }} style={{ fontSize: 8 }}>▶</motion.span>
          </div>
        )}
      </div>

      {/* Info */}
      <div onClick={onPlay} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
        <div style={{ color: isPlaying ? '#00d4ff' : '#c0d0e0', fontFamily: 'Rajdhani', fontSize: 11, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {song.title}
        </div>
        <div style={{ color: '#555566', fontFamily: 'Share Tech Mono', fontSize: 9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {song.author}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
        <button onClick={onFavorite} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 10, opacity: song.isFavorite ? 1 : 0.4,
          color: song.isFavorite ? '#ff6b9d' : '#ffffff',
        }}>♥</button>
        <button onClick={onRemove} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 10, color: '#ff4444', opacity: 0.5,
        }}
          onMouseEnter={e => e.target.style.opacity = 1}
          onMouseLeave={e => e.target.style.opacity = 0.5}
        >✕</button>
      </div>
    </motion.div>
  );
}

// ── Search result item ────────────────────────────────────────────────────────
function SearchResult({ video, onAdd, added }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '5px 6px', borderRadius: 6,
      background: 'rgba(0,0,0,0.2)', marginBottom: 4,
      border: '1px solid rgba(0,212,255,0.08)',
    }}>
      {video.thumbnail && (
        <img src={video.thumbnail} style={{ width: 36, height: 26, borderRadius: 3, objectFit: 'cover', flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: '#c0d0e0', fontFamily: 'Rajdhani', fontSize: 10, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {video.title}
        </div>
        <div style={{ color: '#555566', fontFamily: 'Share Tech Mono', fontSize: 8 }}>{video.author}</div>
      </div>
      <button onClick={() => onAdd(video)}
        style={{
          background: added ? 'rgba(0,255,136,0.15)' : 'rgba(0,212,255,0.1)',
          border: `1px solid ${added ? 'rgba(0,255,136,0.3)' : 'rgba(0,212,255,0.25)'}`,
          borderRadius: 4, padding: '3px 7px',
          color: added ? '#00ff88' : '#00d4ff',
          fontFamily: 'Orbitron', fontSize: 7, cursor: 'pointer', letterSpacing: 1,
          flexShrink: 0,
        }}
      >{added ? '✓' : '+'}</button>
    </div>
  );
}

// ── Main PlaylistPanel ───────────────────────────────────────────────────────
export default function PlaylistPanel({ onPlaySong, currentVideoId, onAnnounce }) {
  const [playlists, setPlaylists] = useState([]);
  const [expanded, setExpanded] = useState({}); // which playlist is open
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [addingTo, setAddingTo] = useState(null); // which playlist to add to
  const [addedIds, setAddedIds] = useState(new Set());
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showNewInput, setShowNewInput] = useState(false);
  const [activePlaylist, setActivePlaylist] = useState(null); // currently playing playlist
  const [activeIndex, setActiveIndex] = useState(0);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // none, one, all
  const [nowPlaying, setNowPlaying] = useState(null);
  const [showSuggest, setShowSuggest] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const searchTimeout = useRef(null);

  useEffect(() => { loadPlaylists(); }, []);

  // Expose functions for AI commands via window
  useEffect(() => {
    window.zoricPlaylist = {
      createPlaylist: handleCreatePlaylist,
      playPlaylist: handlePlayPlaylist,
      addSongByQuery: handleAiAddSong,
      getPlaylists: () => playlists,
      nextSong: handleNext,
      prevSong: handlePrev,
    };
  }, [playlists, activePlaylist, activeIndex]);

  const loadPlaylists = async () => {
    try {
      const res = await api.get('/playlist');
      setPlaylists(res.data.playlists || []);
    } catch {}
  };

  const handleCreatePlaylist = async (name) => {
    if (!name?.trim()) return;
    try {
      const res = await api.post('/playlist', { name: name.trim() });
      setPlaylists(prev => [res.data.playlist, ...prev]);
      setShowNewInput(false);
      setNewPlaylistName('');
      return res.data.playlist;
    } catch {}
  };

  const handleDeletePlaylist = async (id) => {
    try {
      await api.delete(`/playlist/${id}`);
      setPlaylists(prev => prev.filter(p => p._id !== id));
      if (activePlaylist?._id === id) { setActivePlaylist(null); setNowPlaying(null); }
    } catch {}
  };

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!q.trim()) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(`/playlist/search?query=${encodeURIComponent(q)}`);
        setSearchResults(res.data.videos || []);
      } catch {} finally { setSearching(false); }
    }, 600);
  };

  const handleAddSong = async (playlistId, video) => {
    try {
      const res = await api.post(`/playlist/${playlistId}/songs`, {
        videoId: video.videoId, title: video.title,
        author: video.author, duration: video.duration, thumbnail: video.thumbnail,
      });
      setPlaylists(prev => prev.map(p => p._id === playlistId ? res.data.playlist : p));
      setAddedIds(prev => new Set([...prev, video.videoId]));
    } catch {}
  };

  const handleAiAddSong = async (query, playlistName) => {
    const playlist = playlists.find(p => p.name.toLowerCase().includes(playlistName?.toLowerCase() || ''));
    if (!playlist) return false;
    try {
      const res = await api.get(`/playlist/search?query=${encodeURIComponent(query)}`);
      const video = res.data.videos?.[0];
      if (video) { await handleAddSong(playlist._id, video); return video.title; }
    } catch {}
    return false;
  };

  const handleRemoveSong = async (playlistId, songId) => {
    try {
      const res = await api.delete(`/playlist/${playlistId}/songs/${songId}`);
      setPlaylists(prev => prev.map(p => p._id === playlistId ? res.data.playlist : p));
    } catch {}
  };

  const handleFavorite = async (playlistId, songId) => {
    try {
      const res = await api.patch(`/playlist/${playlistId}/songs/${songId}/favorite`);
      setPlaylists(prev => prev.map(p => p._id === playlistId ? res.data.playlist : p));
    } catch {}
  };

  // Play a song from playlist
  const playSong = (playlist, index) => {
    const songs = shuffleMode
      ? [...playlist.songs].sort(() => Math.random() - 0.5)
      : playlist.songs;
    if (!songs[index]) return;
    const song = songs[index];
    setActivePlaylist(playlist);
    setActiveIndex(index);
    setNowPlaying(song);
    if (onPlaySong) onPlaySong(song.videoId, song);
    if (onAnnounce) onAnnounce(`Ab "${song.title}" chal raha hai 🎵`);
    // Increment play count
    api.patch(`/playlist/${playlist._id}/songs/${song._id}/play`).catch(() => {});
  };

  const handlePlayPlaylist = (playlistName) => {
    const playlist = playlists.find(p => p.name.toLowerCase().includes(playlistName?.toLowerCase() || ''));
    if (playlist && playlist.songs.length > 0) {
      playSong(playlist, 0);
      return playlist.name;
    }
    return null;
  };

  const handleNext = () => {
    if (!activePlaylist) return;
    const songs = activePlaylist.songs;
    let next = activeIndex + 1;
    if (next >= songs.length) {
      if (repeatMode === 'all') next = 0;
      else return;
    }
    playSong(activePlaylist, next);
  };

  const handlePrev = () => {
    if (!activePlaylist) return;
    let prev = activeIndex - 1;
    if (prev < 0) prev = activePlaylist.songs.length - 1;
    playSong(activePlaylist, prev);
  };

  const handleSuggest = async (playlist) => {
    setShowSuggest(playlist._id);
    setSuggestions([]);
    try {
      const res = await api.get(`/playlist/${playlist._id}/suggest`);
      setSuggestions(res.data.videos || []);
    } catch {}
  };

  const handleAutoFill = async (playlist) => {
    try {
      await api.post('/playlist/autofill', { playlistId: playlist._id, mood: playlist.mood || 'popular', count: 5 });
      loadPlaylists();
    } catch {}
  };

  return (
    <div style={{ padding: '0 4px' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 4px', marginBottom: 6,
      }}>
        <span style={{ fontFamily: 'Orbitron', fontSize: 8, color: '#555566', letterSpacing: 2 }}>
          🎵 YOUR PLAYLISTS
        </span>
        <button onClick={() => setShowNewInput(!showNewInput)} style={{
          background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)',
          borderRadius: 4, width: 20, height: 20, color: '#00d4ff',
          cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>+</button>
      </div>

      {/* New playlist input */}
      <AnimatePresence>
        {showNewInput && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: 8, overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: 5 }}>
              <input
                value={newPlaylistName}
                onChange={e => setNewPlaylistName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreatePlaylist(newPlaylistName)}
                placeholder="Playlist name..."
                autoFocus
                style={{
                  flex: 1, background: 'rgba(0,212,255,0.06)',
                  border: '1px solid rgba(0,212,255,0.2)',
                  borderRadius: 5, padding: '5px 8px',
                  color: '#e0e0e0', fontFamily: 'Rajdhani', fontSize: 12,
                  outline: 'none',
                }}
              />
              <button onClick={() => handleCreatePlaylist(newPlaylistName)} style={{
                background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)',
                borderRadius: 5, padding: '5px 8px', color: '#00d4ff',
                fontFamily: 'Orbitron', fontSize: 7, cursor: 'pointer',
              }}>CREATE</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Now Playing mini bar */}
      <AnimatePresence>
        {nowPlaying && (
          <motion.div
            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
            style={{
              background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 8, padding: '8px 10px', marginBottom: 8,
            }}
          >
            <div style={{ fontFamily: 'Orbitron', fontSize: 7, color: '#00d4ff', letterSpacing: 1, marginBottom: 5 }}>
              ▶ NOW PLAYING
            </div>
            <div style={{ color: '#c0f0ff', fontFamily: 'Rajdhani', fontSize: 11, fontWeight: 600, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {nowPlaying.title}
            </div>
            <div style={{ color: '#555566', fontFamily: 'Share Tech Mono', fontSize: 9, marginBottom: 6 }}>
              {nowPlaying.author}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={handlePrev} style={{ background: 'none', border: 'none', color: '#00d4ff', cursor: 'pointer', fontSize: 12 }}>⏮</button>
                <button onClick={handleNext} style={{ background: 'none', border: 'none', color: '#00d4ff', cursor: 'pointer', fontSize: 12 }}>⏭</button>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {/* Shuffle */}
                <button onClick={() => setShuffleMode(!shuffleMode)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 10,
                  color: shuffleMode ? '#00d4ff' : '#444455',
                }}>🔀</button>
                {/* Repeat */}
                <button onClick={() => setRepeatMode(r => r === 'none' ? 'all' : r === 'all' ? 'one' : 'none')} style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 10,
                  color: repeatMode !== 'none' ? '#00d4ff' : '#444455',
                }}>
                  {repeatMode === 'one' ? '🔂' : '🔁'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playlists list */}
      {playlists.length === 0 && (
        <div style={{ color: '#333344', fontFamily: 'Share Tech Mono', fontSize: 9, textAlign: 'center', padding: '10px 0' }}>
          // No playlists yet
        </div>
      )}

      {playlists.map(playlist => (
        <div key={playlist._id} style={{ marginBottom: 6 }}>
          {/* Playlist header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 6px', borderRadius: 7,
            background: activePlaylist?._id === playlist._id ? 'rgba(0,212,255,0.08)' : 'rgba(0,0,0,0.2)',
            border: `1px solid ${activePlaylist?._id === playlist._id ? 'rgba(0,212,255,0.25)' : 'rgba(0,212,255,0.08)'}`,
          }}>
            {/* Expand arrow */}
            <button onClick={() => setExpanded(prev => ({ ...prev, [playlist._id]: !prev[playlist._id] }))} style={{
              background: 'none', border: 'none', color: '#00d4ff', cursor: 'pointer',
              fontSize: 10, padding: 0, flexShrink: 0,
              transform: expanded[playlist._id] ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}>▶</button>

            {/* Name */}
            <span style={{ flex: 1, color: '#c0d0e0', fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {playlist.name}
            </span>

            <span style={{ color: '#444455', fontFamily: 'Share Tech Mono', fontSize: 8, flexShrink: 0 }}>
              {playlist.songs.length}
            </span>

            {/* Play playlist */}
            <button onClick={() => playSong(playlist, 0)} title="Play playlist" style={{
              background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 3, padding: '2px 5px', color: '#00d4ff',
              cursor: 'pointer', fontSize: 9, flexShrink: 0,
            }}>▶</button>

            {/* Add song to this playlist */}
            <button onClick={() => setAddingTo(addingTo === playlist._id ? null : playlist._id)} title="Add song" style={{
              background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)',
              borderRadius: 3, padding: '2px 5px', color: '#00d4ff',
              cursor: 'pointer', fontSize: 11, flexShrink: 0,
            }}>+</button>

            {/* Delete */}
            <button onClick={() => handleDeletePlaylist(playlist._id)} style={{
              background: 'none', border: 'none', color: '#ff4444',
              cursor: 'pointer', fontSize: 10, opacity: 0.4, flexShrink: 0,
            }}
              onMouseEnter={e => e.target.style.opacity = 1}
              onMouseLeave={e => e.target.style.opacity = 0.4}
            >✕</button>
          </div>

          {/* Expanded songs */}
          <AnimatePresence>
            {expanded[playlist._id] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden', paddingLeft: 8, paddingTop: 4 }}
              >
                {playlist.songs.length === 0 && (
                  <div style={{ color: '#333344', fontFamily: 'Share Tech Mono', fontSize: 8, padding: '4px 0' }}>// No songs</div>
                )}
                {playlist.songs.map((song, i) => (
                  <SongItem
                    key={song._id}
                    song={song}
                    isPlaying={nowPlaying?.videoId === song.videoId}
                    onPlay={() => playSong(playlist, i)}
                    onRemove={() => handleRemoveSong(playlist._id, song._id)}
                    onFavorite={() => handleFavorite(playlist._id, song._id)}
                  />
                ))}

                {/* Auto-fill + Suggest */}
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  <button onClick={() => handleAutoFill(playlist)} style={{
                    flex: 1, background: 'rgba(123,47,255,0.08)', border: '1px solid rgba(123,47,255,0.2)',
                    borderRadius: 4, padding: '4px 0', color: '#a060ff',
                    fontFamily: 'Orbitron', fontSize: 7, cursor: 'pointer', letterSpacing: 1,
                  }}>⚡ AUTO FILL</button>
                  <button onClick={() => handleSuggest(playlist)} style={{
                    flex: 1, background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)',
                    borderRadius: 4, padding: '4px 0', color: '#00d4ff',
                    fontFamily: 'Orbitron', fontSize: 7, cursor: 'pointer', letterSpacing: 1,
                  }}>🎯 SUGGEST</button>
                </div>

                {/* Suggestions */}
                <AnimatePresence>
                  {showSuggest === playlist._id && suggestions.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: 6, overflow: 'hidden' }}>
                      <div style={{ fontFamily: 'Orbitron', fontSize: 7, color: '#555566', marginBottom: 5, letterSpacing: 1 }}>SUGGESTIONS:</div>
                      {suggestions.map((v, i) => (
                        <SearchResult key={i} video={v} added={addedIds.has(v.videoId)}
                          onAdd={(video) => { handleAddSong(playlist._id, video); }} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add song search for this playlist */}
          <AnimatePresence>
            {addingTo === playlist._id && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden', paddingLeft: 8, paddingTop: 6 }}>
                <div style={{ fontFamily: 'Orbitron', fontSize: 7, color: '#555566', marginBottom: 5, letterSpacing: 1 }}>
                  ADD TO: {playlist.name.toUpperCase()}
                </div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                  <input
                    value={searchQuery}
                    onChange={e => handleSearch(e.target.value)}
                    placeholder="Search YouTube..."
                    style={{
                      flex: 1, background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(0,212,255,0.15)',
                      borderRadius: 5, padding: '5px 7px',
                      color: '#e0e0e0', fontFamily: 'Rajdhani', fontSize: 11,
                      outline: 'none',
                    }}
                  />
                  {searching && <span style={{ color: '#00d4ff', fontSize: 14, alignSelf: 'center' }}>⟳</span>}
                </div>
                {searchResults.map((v, i) => (
                  <SearchResult key={i} video={v}
                    added={addedIds.has(v.videoId) || playlist.songs.some(s => s.videoId === v.videoId)}
                    onAdd={(video) => handleAddSong(playlist._id, video)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* Global search bar */}
      {!addingTo && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontFamily: 'Orbitron', fontSize: 7, color: '#555566', letterSpacing: 2, marginBottom: 6 }}>🔍 SEARCH YOUTUBE</div>
          <input
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search songs..."
            style={{
              width: '100%', background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(0,212,255,0.15)',
              borderRadius: 6, padding: '6px 8px',
              color: '#e0e0e0', fontFamily: 'Rajdhani', fontSize: 12,
              outline: 'none', boxSizing: 'border-box',
            }}
          />
          {searching && <div style={{ color: '#00d4ff', fontFamily: 'Share Tech Mono', fontSize: 9, marginTop: 4 }}>Searching...</div>}
          {searchResults.length > 0 && !addingTo && (
            <div style={{ marginTop: 6 }}>
              <div style={{ fontFamily: 'Orbitron', fontSize: 7, color: '#555566', letterSpacing: 1, marginBottom: 5 }}>
                SELECT PLAYLIST TO ADD:
              </div>
              {searchResults.map((v, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <SearchResult video={v} added={addedIds.has(v.videoId)} onAdd={() => {}} />
                  {playlists.length > 0 && (
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', paddingLeft: 4 }}>
                      {playlists.map(p => (
                        <button key={p._id} onClick={() => handleAddSong(p._id, v)} style={{
                          background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)',
                          borderRadius: 10, padding: '2px 7px', color: '#8888aa',
                          fontFamily: 'Share Tech Mono', fontSize: 8, cursor: 'pointer',
                        }}>+ {p.name}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
