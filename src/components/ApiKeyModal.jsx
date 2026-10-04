import React, { useState } from 'react';
import { Key, Check, X, ExternalLink, Sparkles } from 'lucide-react';
import { getApiKey, setApiKey } from '../services/youtubeApi';

export default function ApiKeyModal({ isOpen, onClose, onKeySaved }) {
  const [apiKeyInput, setApiKeyInput] = useState(getApiKey());
  const [statusMessage, setStatusMessage] = useState(null);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(apiKeyInput);
    setStatusMessage({ type: 'success', text: apiKeyInput ? 'API Key saved successfully!' : 'API Key removed. Using curated 20-video fallback dataset.' });
    if (onKeySaved) onKeySaved(apiKeyInput);
    setTimeout(() => {
      onClose();
      setStatusMessage(null);
    }, 1200);
  };

  const handleClear = () => {
    setApiKeyInput('');
    setApiKey('');
    setStatusMessage({ type: 'info', text: 'Reset to curated 20-video fallback mode.' });
    if (onKeySaved) onKeySaved('');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Key size={22} color="var(--yt-red)" />
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Google YouTube Data API v3</h3>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
            Enter your Google YouTube Data API v3 key below. The key is securely saved in your browser's <code>localStorage</code> (or can be configured in <code>.env</code> as <code>VITE_YOUTUBE_API_KEY</code>).
          </p>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--text-primary)' }}>
              YouTube API Key
            </label>
            <input
              type="password"
              className="comment-input"
              placeholder="AIzaSy..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-light)',
                color: '#fff',
                fontSize: 14
              }}
            />
          </div>

          <div style={{ 
            background: 'rgba(255, 255, 255, 0.04)', 
            border: '1px solid var(--border-subtle)', 
            borderRadius: 8, 
            padding: 12, 
            marginBottom: 20,
            fontSize: 13,
            color: 'var(--text-secondary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              <Sparkles size={15} color="var(--accent-blue)" />
              <span>Zero-Setup Fallback Mode Enabled</span>
            </div>
            If no API key is provided, or if the YouTube quota (10,000 units/day) is reached, the application automatically loads <strong>20 comprehensive videos</strong> with live playback, full statistics, comments, and replies!
          </div>

          {statusMessage && (
            <div style={{ 
              padding: '10px 14px', 
              borderRadius: 8, 
              marginBottom: 16, 
              fontSize: 13,
              background: statusMessage.type === 'success' ? 'rgba(46, 125, 50, 0.2)' : 'rgba(2, 136, 209, 0.2)',
              color: statusMessage.type === 'success' ? '#81c784' : '#81d4fa',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <Check size={16} />
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a 
              href="https://console.cloud.google.com/apis/credentials" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--accent-blue)' }}
            >
              <span>Get API Key from Google Console</span>
              <ExternalLink size={13} />
            </a>

            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                type="button" 
                onClick={handleClear}
                className="single-action-pill"
                style={{ fontSize: 13 }}
              >
                Clear
              </button>
              <button 
                type="button" 
                onClick={handleSave}
                style={{
                  background: 'var(--yt-red)',
                  color: '#fff',
                  padding: '8px 18px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
