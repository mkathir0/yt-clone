import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCcw,
  RotateCw,
  Tv,
  Film,
  AlertCircle
} from 'lucide-react';

export default function VideoPlayer({ video, onEnded }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playerMode, setPlayerMode] = useState('html5'); // 'html5' or 'youtube'
  const [hasError, setHasError] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  // Reset when video changes
  useEffect(() => {
    setHasError(false);
    setCurrentTime(0);
    setDuration(0);
    setIsBuffering(false);

    if (playerMode === 'html5' && videoRef.current) {
      videoRef.current.load();
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Autoplay with sound is often blocked by browsers until user clicks
            setIsPlaying(false);
          });
      }
    }
  }, [video?.videoUrl, playerMode]);

  // Format time in mm:ss
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      const muted = newVol === 0;
      videoRef.current.muted = muted;
      setIsMuted(muted);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => console.error(err));
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => console.error(err));
    }
  };

  const skipSeconds = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.code === 'Space' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight' || e.key === 'l') {
        skipSeconds(10);
      } else if (e.key === 'ArrowLeft' || e.key === 'j') {
        skipSeconds(-10);
      } else if (e.key === 'm') {
        toggleMute();
      } else if (e.key === 'f') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, duration]);

  // Controls auto-hide on inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className="player-container" 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      id="main-video-player"
    >
      {/* Player Mode Switcher in top right */}
      <div 
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 40,
          display: 'flex',
          gap: 6,
          background: 'rgba(0, 0, 0, 0.75)',
          padding: '4px 6px',
          borderRadius: 20,
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}
      >
        <button
          onClick={() => setPlayerMode('html5')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 14,
            fontSize: 12,
            fontWeight: 500,
            background: playerMode === 'html5' ? 'var(--yt-red)' : 'transparent',
            color: '#fff'
          }}
          title="Direct HTML5 Video Stream"
        >
          <Film size={13} />
          <span>Native Player</span>
        </button>

        <button
          onClick={() => setPlayerMode('youtube')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 14,
            fontSize: 12,
            fontWeight: 500,
            background: playerMode === 'youtube' ? 'var(--yt-red)' : 'transparent',
            color: '#fff'
          }}
          title="YouTube Iframe Embed Player"
        >
          <Tv size={13} />
          <span>YouTube Embed</span>
        </button>
      </div>

      {playerMode === 'youtube' ? (
        /* YouTube Embed Iframe */
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.youtubeId || 'aqz-KE-bpKQ'}?autoplay=1&rel=0&modestbranding=1`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block'
          }}
        />
      ) : (
        /* Native HTML5 Video Player */
        <>
          <video
            ref={videoRef}
            src={video.videoUrl}
            poster={video.thumbnail}
            className="video-element"
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => {
              setIsBuffering(false);
              setIsPlaying(true);
            }}
            onError={() => {
              setHasError(true);
              setIsPlaying(false);
            }}
            onEnded={() => {
              setIsPlaying(false);
              if (onEnded) onEnded();
            }}
            playsInline
          >
            <source src={video.videoUrl} type="video/mp4" />
          </video>

          {/* Fallback prompt if error */}
          {hasError && (
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(15, 15, 15, 0.95)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                color: '#fff',
                zIndex: 30,
                padding: 24,
                textAlign: 'center'
              }}
            >
              <AlertCircle size={40} color="#ff4444" />
              <p style={{ fontSize: 16, fontWeight: 500 }}>
                Direct video stream requires connection or codec support.
              </p>
              <button
                onClick={() => setPlayerMode('youtube')}
                style={{
                  background: 'var(--yt-red)',
                  color: '#fff',
                  padding: '8px 18px',
                  borderRadius: 20,
                  fontSize: 14,
                  fontWeight: 600
                }}
              >
                Switch to YouTube Embed Player
              </button>
            </div>
          )}

          {/* Center Play Button Overlay when paused */}
          {!isPlaying && !hasError && (
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 20
              }}
              onClick={togglePlay}
            >
              <button 
                className="center-play-button" 
                aria-label="Play video"
                id="center-play-btn"
              >
                <Play size={32} fill="white" strokeWidth={0} />
              </button>
            </div>
          )}

          {/* Custom Controls Overlay */}
          <div className={`player-controls-overlay ${showControls ? 'active' : ''}`}>
            <div className="player-top-bar">
              <span className="player-video-title">{video.title}</span>
            </div>

            <div className="player-bottom-bar" onClick={(e) => e.stopPropagation()}>
              {/* Progress / Seek bar */}
              <div 
                className="progress-bar-container" 
                onClick={handleSeek}
                role="slider"
                aria-valuenow={progressPercent}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div className="progress-bar-filled" style={{ width: `${progressPercent}%` }}>
                  <span className="progress-thumb" />
                </div>
              </div>

              <div className="player-controls-row">
                <div className="player-left-controls">
                  <button 
                    className="player-ctrl-btn" 
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    id="player-play-pause-btn"
                  >
                    {isPlaying ? (
                      <Pause size={22} fill="white" strokeWidth={0} />
                    ) : (
                      <Play size={22} fill="white" strokeWidth={0} />
                    )}
                  </button>

                  <button 
                    className="player-ctrl-btn" 
                    onClick={() => skipSeconds(-10)}
                    title="Rewind 10 seconds (j or ←)"
                  >
                    <RotateCcw size={18} />
                  </button>

                  <button 
                    className="player-ctrl-btn" 
                    onClick={() => skipSeconds(10)}
                    title="Forward 10 seconds (l or →)"
                  >
                    <RotateCw size={18} />
                  </button>

                  <div className="volume-wrapper">
                    <button 
                      className="player-ctrl-btn" 
                      onClick={toggleMute}
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="volume-slider"
                      aria-label="Volume slider"
                    />
                  </div>

                  <span className="time-display">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="player-right-controls">
                  <button 
                    className="player-ctrl-btn" 
                    onClick={toggleFullscreen}
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    id="player-fullscreen-btn"
                  >
                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
