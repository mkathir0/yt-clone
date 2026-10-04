import React from 'react';
import { 
  Home, 
  Flame, 
  Tv2, 
  History, 
  ListVideo, 
  Clock, 
  ThumbsUp, 
  Music2, 
  Gamepad2, 
  Newspaper, 
  Trophy,
  Settings,
  HelpCircle,
  Compass
} from 'lucide-react';

const SUBSCRIPTIONS = [
  { name: "Blender Studio", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80", live: true },
  { name: "Apex Velocity", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80", live: false },
  { name: "TechLab Studio", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=80&q=80", live: false },
  { name: "Earth Unexplored", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80", live: false }
];

export default function Sidebar({
  isCollapsed,
  activeTab,
  onSelectTab,
  onHomeClick
}) {
  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-section">
        <div 
          className={`sidebar-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={onHomeClick}
          id="sidebar-nav-home"
        >
          <Home size={22} />
          {!isCollapsed && <span>Home</span>}
        </div>

        <div 
          className={`sidebar-item ${activeTab === 'shorts' ? 'active' : ''}`}
          onClick={() => onSelectTab('shorts')}
          id="sidebar-nav-shorts"
        >
          <Flame size={22} />
          {!isCollapsed && <span>Shorts</span>}
        </div>

        <div 
          className={`sidebar-item ${activeTab === 'subscriptions' ? 'active' : ''}`}
          onClick={() => onSelectTab('subscriptions')}
          id="sidebar-nav-subscriptions"
        >
          <Tv2 size={22} />
          {!isCollapsed && <span>Subscriptions</span>}
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div className="sidebar-section">
            <span className="sidebar-section-title">You</span>
            <div className="sidebar-item" onClick={() => onSelectTab('history')}>
              <History size={20} />
              <span>History</span>
            </div>
            <div className="sidebar-item" onClick={() => onSelectTab('playlists')}>
              <ListVideo size={20} />
              <span>Playlists</span>
            </div>
            <div className="sidebar-item" onClick={() => onSelectTab('watch-later')}>
              <Clock size={20} />
              <span>Watch Later</span>
            </div>
            <div className="sidebar-item" onClick={() => onSelectTab('liked')}>
              <ThumbsUp size={20} />
              <span>Liked Videos</span>
            </div>
          </div>

          <div className="sidebar-section">
            <span className="sidebar-section-title">Subscriptions</span>
            {SUBSCRIPTIONS.map((sub) => (
              <div 
                key={sub.name} 
                className="sidebar-sub-item"
                onClick={() => onSelectTab(`channel-${sub.name}`)}
              >
                <img src={sub.avatar} alt={sub.name} className="sidebar-sub-avatar" />
                <span style={{ flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {sub.name}
                </span>
                {sub.live && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ff0000' }} />
                )}
              </div>
            ))}
          </div>

          <div className="sidebar-section">
            <span className="sidebar-section-title">Explore</span>
            <div className="sidebar-item" onClick={() => onSelectTab('explore')}>
              <Compass size={20} />
              <span>Explore</span>
            </div>
            <div className="sidebar-item" onClick={() => onSelectTab('music')}>
              <Music2 size={20} />
              <span>Music</span>
            </div>
            <div className="sidebar-item" onClick={() => onSelectTab('gaming')}>
              <Gamepad2 size={20} />
              <span>Gaming</span>
            </div>
            <div className="sidebar-item" onClick={() => onSelectTab('news')}>
              <Newspaper size={20} />
              <span>News</span>
            </div>
            <div className="sidebar-item" onClick={() => onSelectTab('sports')}>
              <Trophy size={20} />
              <span>Sports</span>
            </div>
          </div>

          <div className="sidebar-section" style={{ borderBottom: 'none' }}>
            <div className="sidebar-item">
              <Settings size={20} />
              <span>Settings</span>
            </div>
            <div className="sidebar-item">
              <HelpCircle size={20} />
              <span>Help & Feedback</span>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
