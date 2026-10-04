import React, { useState, useEffect } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Download, 
  Bookmark, 
  CheckCircle2, 
  Bell, 
  ArrowLeft,
  Check
} from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import Comments from './Comments';
import { fetchVideoDetails } from '../services/youtubeApi';

export default function WatchPage({
  video: initialVideo,
  videoId: propVideoId,
  allVideos = [],
  onSelectVideo,
  onBackToHome
}) {
  const [video, setVideo] = useState(initialVideo);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [_isLoadingDetails, setIsLoadingDetails] = useState(false);

  const activeId = propVideoId || initialVideo?.id || initialVideo?.youtubeId;

  // Persist video_id in localStorage and browser history
  useEffect(() => {
    if (!activeId) return;

    // 1. Save video_id to localStorage
    try {
      localStorage.setItem('youtube_clone_active_video_id', activeId);
      
      // Also maintain recent watch history in localStorage
      const historyRaw = localStorage.getItem('youtube_clone_watch_history');
      let history = historyRaw ? JSON.parse(historyRaw) : [];
      history = [activeId, ...history.filter(id => id !== activeId)].slice(0, 50);
      localStorage.setItem('youtube_clone_watch_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Could not access localStorage for video_id:', e);
    }

    // 2. Sync URL query parameter without full reload
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('v') !== activeId) {
        url.searchParams.set('v', activeId);
        window.history.pushState({ videoId: activeId }, '', url.toString());
      }
    } catch (e) {
      // Ignore in environments where pushState isn't available
    }

    // 3. Fetch comprehensive video details & statistics from YouTube API
    let isMounted = true;
    async function loadDetails() {
      setIsLoadingDetails(true);
      try {
        const details = await fetchVideoDetails(activeId);
        if (isMounted && details) {
          setVideo(prev => ({
            ...(prev || {}),
            ...details
          }));
        }
      } catch (err) {
        console.error('Error fetching video details:', err);
      } finally {
        if (isMounted) setIsLoadingDetails(false);
      }
    }

    loadDetails();
    return () => {
      isMounted = false;
    };
  }, [activeId]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
    } else {
      setIsLiked(true);
      setIsDisliked(false);
      showToast("Added to Liked Videos");
    }
  };

  const handleDislike = () => {
    if (isDisliked) {
      setIsDisliked(false);
    } else {
      setIsDisliked(true);
      setIsLiked(false);
    }
  };

  const handleSubscribe = () => {
    const nextState = !isSubscribed;
    setIsSubscribed(nextState);
    showToast(nextState ? `Subscribed to ${video?.channel?.name || 'Channel'}` : `Unsubscribed from ${video?.channel?.name || 'Channel'}`);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    showToast("Video link copied to clipboard!");
  };

  const handleDownload = () => {
    showToast("Starting high-definition video download...");
  };

  const handleSave = () => {
    const nextState = !isSaved;
    setIsSaved(nextState);
    showToast(nextState ? "Saved to Watch Later playlist" : "Removed from Watch Later");
  };

  if (!video) {
    return (
      <div className="watch-page" style={{ padding: 40, textAlign: 'center' }}>
        <h2>Loading video content...</h2>
        <button onClick={onBackToHome} className="single-action-pill" style={{ marginTop: 20 }}>
          <ArrowLeft size={16} />
          <span>Back to Feed</span>
        </button>
      </div>
    );
  }

  // Filter out current video for the related sidebar
  const relatedVideos = allVideos.filter(v => v.id !== video.id && v.youtubeId !== video.youtubeId);

  return (
    <div className="watch-page" id="watch-page-container">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="toast-notice" role="alert">
          <Check size={18} color="#3ea6ff" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Primary Column */}
      <div className="watch-primary">
        <button 
          onClick={onBackToHome}
          className="single-action-pill"
          style={{ marginBottom: 16 }}
          id="back-to-home-btn"
        >
          <ArrowLeft size={16} />
          <span>Back to Feed</span>
        </button>

        {/* Video Player Integration */}
        <VideoPlayer 
          video={video} 
          onEnded={() => {
            if (relatedVideos.length > 0) {
              onSelectVideo(relatedVideos[0]);
            }
          }}
        />

        {/* Video Information Header */}
        <div className="watch-info">
          <h1 className="watch-title">{video.title}</h1>

          <div className="watch-actions-bar">
            {/* Channel Info */}
            <div className="channel-details">
              <img 
                src={video.channel?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(video.channel?.name || 'Channel')}`} 
                alt={video.channel?.name || 'Channel'} 
                className="channel-avatar-lg"
              />
              <div className="channel-meta">
                <span className="channel-title">
                  {video.channel?.name || 'YouTube Creator'}
                  {video.channel?.verified && (
                    <CheckCircle2 size={15} className="verified-icon" />
                  )}
                </span>
                <span className="channel-sub-count">
                  {video.channel?.subscribers || '1.2M'} subscribers
                </span>
              </div>

              <button 
                className={`subscribe-btn ${isSubscribed ? 'subscribed' : ''}`}
                onClick={handleSubscribe}
                id="subscribe-action-btn"
              >
                {isSubscribed ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Bell size={16} fill="white" />
                    Subscribed
                  </span>
                ) : (
                  'Subscribe'
                )}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="actions-group">
              <div className="action-pill-group">
                <button 
                  className={`action-pill-btn ${isLiked ? 'active' : ''}`}
                  onClick={handleLike}
                  id="like-video-btn"
                >
                  <ThumbsUp size={18} fill={isLiked ? "currentColor" : "none"} />
                  <span>{video.likes || 'Like'}</span>
                </button>
                <div className="pill-divider" />
                <button 
                  className={`action-pill-btn ${isDisliked ? 'active' : ''}`}
                  onClick={handleDislike}
                  id="dislike-video-btn"
                >
                  <ThumbsDown size={18} fill={isDisliked ? "currentColor" : "none"} />
                </button>
              </div>

              <button className="single-action-pill" onClick={handleShare} id="share-video-btn">
                <Share2 size={18} />
                <span>Share</span>
              </button>

              <button className="single-action-pill" onClick={handleDownload} id="download-video-btn">
                <Download size={18} />
                <span>Download</span>
              </button>

              <button 
                className="single-action-pill" 
                onClick={handleSave}
                style={{ color: isSaved ? 'var(--accent-blue)' : 'inherit' }}
                id="save-video-btn"
              >
                <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
                <span>{isSaved ? "Saved" : "Save"}</span>
              </button>
            </div>
          </div>

          {/* Description & Statistics Card */}
          <div className="description-card">
            <div className="description-stats">
              <span><strong>{video.views}</strong> views</span>
              <span>{video.timestamp}</span>
              {video.category && (
                <span style={{ color: 'var(--accent-blue)' }}>#{video.category}</span>
              )}
            </div>

            <p className="description-body" style={{ whiteSpace: 'pre-line' }}>
              {isDescExpanded ? video.description : `${(video.description || '').slice(0, 180)}...`}
            </p>

            {(video.description || '').length > 180 && (
              <button 
                className="toggle-desc-btn"
                onClick={() => setIsDescExpanded(prev => !prev)}
              >
                {isDescExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          {/* Comments Section with Live API & Replies */}
          <Comments 
            key={video.id || video.youtubeId} 
            videoId={video.youtubeId || video.id} 
            initialComments={video.comments || []} 
          />
        </div>
      </div>

      {/* Secondary Column: Related Videos */}
      <aside className="watch-secondary">
        <h4 className="related-header">Up next</h4>
        <div className="related-list">
          {relatedVideos.map((item) => (
            <div 
              key={item.id} 
              className="related-card"
              onClick={() => onSelectVideo(item)}
              role="button"
              tabIndex={0}
              id={`related-video-${item.id}`}
            >
              <div className="related-thumb-wrapper">
                <img 
                  src={item.thumbnail} 
                  alt={item.title} 
                  className="related-thumb-img" 
                  loading="lazy" 
                />
                <span className="duration-badge">{item.duration}</span>
              </div>
              <div className="related-info">
                <h5 className="related-title" title={item.title}>
                  {item.title}
                </h5>
                <span className="related-channel">{item.channel?.name}</span>
                <span className="related-meta">{item.views} views • {item.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
