import React from 'react';
import { CheckCircle2, Play } from 'lucide-react';

export default function VideoCard({ video, onClick }) {
  return (
    <div 
      className="video-card" 
      onClick={() => onClick(video)}
      id={`video-card-${video.id}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(video);
        }
      }}
    >
      <div className="thumbnail-wrapper">
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="thumbnail-img" 
          loading="lazy" 
        />
        <span className="duration-badge">{video.duration}</span>
        <div className="play-hover-overlay">
          <div className="play-overlay-circle">
            <Play size={20} fill="white" strokeWidth={0} />
          </div>
        </div>
      </div>

      <div className="card-info">
        <img 
          src={video.channel.avatar} 
          alt={video.channel.name} 
          className="card-avatar" 
          loading="lazy" 
        />

        <div className="card-text">
          <h3 className="card-title" title={video.title}>
            {video.title}
          </h3>

          <div className="card-channel">
            <span>{video.channel.name}</span>
            {video.channel.verified && (
              <CheckCircle2 size={13} className="verified-icon" />
            )}
          </div>

          <div className="card-meta">
            <span>{video.views} views</span>
            <span> • </span>
            <span>{video.timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
