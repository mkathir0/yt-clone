import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Mic, 
  Video, 
  Bell, 
  X,
  Play,
  Key
} from 'lucide-react';
import { hasApiKey } from '../services/youtubeApi';

export default function Navbar({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onToggleSidebar,
  onHomeClick,
  onOpenApiKeyModal
}) {
  const [isListening, setIsListening] = useState(false);
  const isKeyActive = hasApiKey();

  const handleMicClick = () => {
    setIsListening(prev => !prev);
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
      }, 3500);
    }
  };

  return (
    <header className="navbar">
      <div className="nav-left">
        <button 
          className="icon-btn" 
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          id="sidebar-toggle-btn"
        >
          <Menu size={22} />
        </button>

        <div className="brand-logo" onClick={onHomeClick} id="brand-logo-btn" style={{ cursor: 'pointer' }}>
          <div className="logo-badge" style={{ backgroundColor: '#ff0000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Play size={14} fill="white" strokeWidth={0} />
          </div>
          <span className="logo-text">
            YouTube
            <span className="country-code" style={{ fontSize: 10, color: 'var(--text-secondary)', marginLeft: 4, fontWeight: 500 }}>CLONE</span>
          </span>
        </div>
      </div>

      <div className="nav-center">
        <form 
          className="search-wrapper" 
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit();
          }}
        >
          <div className="search-input-box">
            <input
              type="text"
              className="search-input"
              placeholder={isListening ? "Listening... Speak now..." : "Search"}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              id="search-input-field"
            />
            {searchQuery && (
              <button 
                type="button" 
                className="search-clear-btn" 
                onClick={onClearSearch}
                aria-label="Clear search query"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <button type="submit" className="search-btn" aria-label="Search" id="search-submit-btn">
            <Search size={20} />
          </button>
        </form>

        <button 
          className={`icon-btn mic-btn ${isListening ? 'active' : ''}`}
          onClick={handleMicClick}
          title={isListening ? "Listening..." : "Search with your voice"}
          id="voice-search-btn"
        >
          <Mic size={20} />
        </button>
      </div>

      <div className="nav-right">
        {/* Google YouTube API v3 configuration button */}
        <button 
          onClick={onOpenApiKeyModal}
          className="api-key-badge-btn"
          title="Configure Google YouTube Data API Key"
          id="api-config-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 18,
            fontSize: 12,
            fontWeight: 600,
            background: isKeyActive ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 255, 255, 0.08)',
            border: `1px solid ${isKeyActive ? 'rgba(76, 175, 80, 0.4)' : 'rgba(255, 255, 255, 0.15)'}`,
            color: isKeyActive ? '#81c784' : 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <Key size={14} color={isKeyActive ? '#81c784' : 'var(--text-secondary)'} />
          <span>{isKeyActive ? 'API Active' : 'API Key'}</span>
        </button>

        <button className="create-btn" title="Create video or post">
          <Video size={18} />
          <span>Create</span>
        </button>

        <div className="badge-wrapper">
          <button className="icon-btn" title="Notifications" id="notifications-btn">
            <Bell size={20} />
          </button>
          <span className="badge-count">9+</span>
        </div>

        <button className="avatar-btn" title="Account profile" id="user-profile-btn">
          <img 
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80" 
            alt="User profile" 
            className="avatar-img"
          />
        </button>
      </div>
    </header>
  );
}
