import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CategoryRibbon from './components/CategoryRibbon';
import VideoCard from './components/VideoCard';
import WatchPage from './components/WatchPage';
import ApiKeyModal from './components/ApiKeyModal';
import { CATEGORIES } from './data/videos';
import { FALLBACK_VIDEOS_20 } from './data/mockYoutubeData';
import { fetchPopularVideos, searchVideos, fetchVideoDetails, hasApiKey } from './services/youtubeApi';
import { SearchX, Loader2, Sparkles, CheckCircle } from 'lucide-react';

export default function App() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState('fallback'); // 'api' | 'fallback'
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [activeVideo, setActiveVideo] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiNotice, setApiNotice] = useState(null);

  /**
   * 1. Empty Search: Initial load of 20 videos
   */
  const loadInitialVideos = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchPopularVideos(20);
      setVideos(response.videos || FALLBACK_VIDEOS_20);
      setDataSource(response.source || 'fallback');
    } catch (err) {
      console.error('Error fetching popular videos:', err);
      setVideos(FALLBACK_VIDEOS_20);
      setDataSource('fallback');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 2. Search Videos: Query-based fetching
   */
  const executeSearch = useCallback(async (query) => {
    setIsLoading(true);
    try {
      const response = await searchVideos(query, 20);
      setVideos(response.videos || []);
      setDataSource(response.source || 'fallback');
      setActiveVideo(null); // Return to grid view to see results
    } catch (err) {
      console.error('Error searching videos:', err);
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check URL params and localStorage on initial mount
  useEffect(() => {
    async function initApp() {
      // 1. First fetch the 20 videos
      await loadInitialVideos();

      // 2. Check if a video_id is specified in URL query params (?v=...)
      const urlParams = new URLSearchParams(window.location.search);
      const urlVideoId = urlParams.get('v');

      // 3. Or check localStorage for previously active video
      const storedVideoId = localStorage.getItem('youtube_clone_active_video_id');

      const targetId = urlVideoId || storedVideoId;

      if (targetId) {
        try {
          const detail = await fetchVideoDetails(targetId);
          if (detail) {
            setActiveVideo(detail);
          }
        } catch (e) {
          console.warn('Failed to restore active video:', e);
        }
      }
    }

    initApp();

    // Listen to browser popstate (back/forward navigation)
    const handlePopState = async (_e) => {
      const params = new URLSearchParams(window.location.search);
      const vId = params.get('v');
      if (vId) {
        const detail = await fetchVideoDetails(vId);
        if (detail) setActiveVideo(detail);
      } else {
        setActiveVideo(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [loadInitialVideos]);

  /**
   * Select and navigate to a video
   * Handles local storage and URL updating
   */
  const handleSelectVideo = (video) => {
    setActiveVideo(video);
    try {
      localStorage.setItem('youtube_clone_active_video_id', video.id || video.youtubeId);
      const url = new URL(window.location.href);
      url.searchParams.set('v', video.id || video.youtubeId);
      window.history.pushState({ videoId: video.id }, '', url.toString());
    } catch (_err) {
      // safe fallback
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Navigate back to feed
   */
  const handleHomeClick = () => {
    setActiveVideo(null);
    setSearchQuery("");
    setSubmittedSearch("");
    setSelectedCategory("All");
    setActiveTab("home");

    try {
      localStorage.removeItem('youtube_clone_active_video_id');
      const url = new URL(window.location.href);
      url.searchParams.delete('v');
      window.history.pushState({}, '', url.pathname);
    } catch (_err) {
      // safe fallback
    }

    loadInitialVideos();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) {
      handleClearSearch();
      return;
    }
    setSubmittedSearch(searchQuery.trim());
    setSelectedCategory("All");
    executeSearch(searchQuery.trim());
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSubmittedSearch("");
    loadInitialVideos();
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    if (activeVideo) {
      setActiveVideo(null);
      const url = new URL(window.location.href);
      url.searchParams.delete('v');
      window.history.pushState({}, '', url.pathname);
    }

    if (category === "All") {
      loadInitialVideos();
    } else {
      executeSearch(category);
    }
  };

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      handleHomeClick();
    } else if (tab === 'history') {
      setActiveVideo(null);
      // Filter videos by watch history in localStorage
      try {
        const hist = JSON.parse(localStorage.getItem('youtube_clone_watch_history') || '[]');
        if (hist.length > 0) {
          const matched = FALLBACK_VIDEOS_20.filter(v => hist.includes(v.id) || hist.includes(v.youtubeId));
          setVideos(matched.length > 0 ? matched : FALLBACK_VIDEOS_20);
        }
      } catch (e) {
        // fallback
      }
    } else {
      setActiveVideo(null);
      executeSearch(tab);
    }
  };

  const handleKeySaved = () => {
    setApiNotice(hasApiKey() ? 'Connected to Google YouTube Data API v3' : 'Switched to 20-video curated fallback dataset');
    setTimeout(() => setApiNotice(null), 3500);
    loadInitialVideos();
  };

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
        onHomeClick={handleHomeClick}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeySaved={handleKeySaved}
      />

      {/* Floating Notice when API key changes */}
      {apiNotice && (
        <div className="toast-notice" role="alert">
          <CheckCircle size={18} color="#81c784" />
          <span>{apiNotice}</span>
        </div>
      )}

      <div className="main-body">
        {/* Left Sidebar (hidden on watch page or collapsed) */}
        {!activeVideo && (
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            onHomeClick={handleHomeClick}
          />
        )}

        {/* Content Area */}
        <main 
          className={`content-area ${
            activeVideo 
              ? 'no-sidebar' 
              : isSidebarCollapsed 
                ? 'with-collapsed-sidebar' 
                : 'with-sidebar'
          }`}
        >
          {activeVideo ? (
            /* Watch View with Video Player */
            <WatchPage
              video={activeVideo}
              videoId={activeVideo.id || activeVideo.youtubeId}
              allVideos={videos.length > 0 ? videos : FALLBACK_VIDEOS_20}
              onSelectVideo={handleSelectVideo}
              onBackToHome={() => {
                setActiveVideo(null);
                const url = new URL(window.location.href);
                url.searchParams.delete('v');
                window.history.pushState({}, '', url.pathname);
              }}
            />
          ) : (
            /* Home / Explore Feed */
            <>
              {/* Category Ribbons */}
              <CategoryRibbon
                categories={CATEGORIES}
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
              />

              <div className="feed-container">
                {/* Search result indicator if search query active */}
                {submittedSearch && (
                  <div className="results-info-bar">
                    <span>
                      Results for <strong>"{submittedSearch}"</strong> ({videos.length} videos found)
                    </span>
                    <button className="reset-search-btn" onClick={handleClearSearch}>
                      Clear Search
                    </button>
                  </div>
                )}

                {/* Data Source & 20 Videos status indicator */}
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 14px',
                    marginBottom: 16,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    fontSize: 12,
                    color: 'var(--text-secondary)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={14} color="var(--accent-blue)" />
                    <span>
                      {dataSource === 'api' 
                        ? 'Live data fetched from Google YouTube Data API v3' 
                        : 'Displaying 20 videos on initial load (Search API & Fallback ready)'}
                    </span>
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {videos.length} Videos Loaded
                  </span>
                </div>

                {isLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 12 }}>
                    <Loader2 size={36} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Fetching 20 videos from YouTube...</span>
                  </div>
                ) : videos.length > 0 ? (
                  <div className="video-grid" id="main-video-grid">
                    {videos.map((video) => (
                      <VideoCard
                        key={video.id || video.youtubeId}
                        video={video}
                        onClick={handleSelectVideo}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-feed">
                    <SearchX size={56} color="#666" />
                    <h2>No videos match your criteria</h2>
                    <p>Try searching for different keywords or select "All" from the ribbon.</p>
                    <button 
                      className="empty-btn"
                      onClick={() => {
                        handleClearSearch();
                        setSelectedCategory("All");
                      }}
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
