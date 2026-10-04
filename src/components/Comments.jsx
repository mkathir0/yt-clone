import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, ChevronDown, ChevronUp, CornerDownRight } from 'lucide-react';
import { fetchVideoComments, fetchCommentReplies } from '../services/youtubeApi';

export default function Comments({ videoId, initialComments = [] }) {
  const [comments, setComments] = useState(initialComments);
  const [newCommentText, setNewCommentText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [likedComments, setLikedComments] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({}); // { [commentId]: boolean }
  const [replyInputOpen, setReplyInputOpen] = useState({}); // { [commentId]: boolean }
  const [replyText, setReplyText] = useState({}); // { [commentId]: string }
  const [loadingReplies, setLoadingReplies] = useState({}); // { [commentId]: boolean }
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Fetch comments when videoId changes
  useEffect(() => {
    let isMounted = true;
    async function loadComments() {
      if (!videoId) return;
      setIsLoadingComments(true);
      try {
        const fetched = await fetchVideoComments(videoId);
        if (isMounted && fetched && fetched.length > 0) {
          setComments(fetched);
        } else if (isMounted && initialComments.length > 0) {
          setComments(initialComments);
        }
      } catch (err) {
        console.error('Failed to load comments:', err);
        if (isMounted && initialComments.length > 0) {
          setComments(initialComments);
        }
      } finally {
        if (isMounted) setIsLoadingComments(false);
      }
    }

    loadComments();
    return () => {
      isMounted = false;
    };
  }, [videoId]);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment = {
      id: `comment-${Date.now()}`,
      author: "You (YouTuber)",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
      text: newCommentText.trim(),
      likes: 0,
      time: "Just now",
      replyCount: 0,
      replies: []
    };

    setComments([newComment, ...comments]);
    setNewCommentText('');
    setIsFocused(false);
  };

  const toggleLikeComment = (commentId) => {
    setLikedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  // Toggle and load comment replies
  const handleToggleReplies = async (comment) => {
    const isCurrentlyExpanded = !!expandedReplies[comment.id];
    
    if (isCurrentlyExpanded) {
      setExpandedReplies(prev => ({ ...prev, [comment.id]: false }));
      return;
    }

    // Expand
    setExpandedReplies(prev => ({ ...prev, [comment.id]: true }));

    // If replies are already present on the comment object, no need to fetch
    if (comment.replies && comment.replies.length > 0) {
      return;
    }

    // Otherwise fetch replies from YouTube API
    setLoadingReplies(prev => ({ ...prev, [comment.id]: true }));
    try {
      const fetchedReplies = await fetchCommentReplies(comment.id);
      if (fetchedReplies && fetchedReplies.length > 0) {
        setComments(prevList => prevList.map(c => {
          if (c.id === comment.id) {
            return { ...c, replies: fetchedReplies };
          }
          return c;
        }));
      }
    } catch (err) {
      console.error('Failed to load replies:', err);
    } finally {
      setLoadingReplies(prev => ({ ...prev, [comment.id]: false }));
    }
  };

  const handleAddReply = (commentId) => {
    const text = replyText[commentId];
    if (!text || !text.trim()) return;

    const newReply = {
      id: `reply-${Date.now()}`,
      author: "You (YouTuber)",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
      text: text.trim(),
      likes: 0,
      time: "Just now"
    };

    setComments(prevList => prevList.map(c => {
      if (c.id === commentId) {
        const updatedReplies = [...(c.replies || []), newReply];
        return {
          ...c,
          replies: updatedReplies,
          replyCount: updatedReplies.length
        };
      }
      return c;
    }));

    // Ensure replies section is open so user sees their new reply
    setExpandedReplies(prev => ({ ...prev, [commentId]: true }));
    setReplyText(prev => ({ ...prev, [commentId]: '' }));
    setReplyInputOpen(prev => ({ ...prev, [commentId]: false }));
  };

  return (
    <section className="comments-section" id="comments-section">
      <div className="comments-header">
        <h3 className="comments-count">
          {isLoadingComments ? 'Loading comments...' : `${comments.length} Comments`}
        </h3>
      </div>

      {/* Add comment input */}
      <form className="add-comment-box" onSubmit={handleAddComment}>
        <img 
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80" 
          alt="Your profile avatar" 
          className="comment-avatar"
        />
        <div className="comment-input-wrapper">
          <input
            type="text"
            className="comment-input"
            placeholder="Add a comment..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            id="new-comment-input"
          />

          {isFocused && (
            <div className="comment-actions">
              <button 
                type="button" 
                className="comment-cancel-btn"
                onClick={() => {
                  setNewCommentText('');
                  setIsFocused(false);
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="comment-submit-btn"
                disabled={!newCommentText.trim()}
                id="submit-comment-btn"
              >
                Comment
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Comments list */}
      <div className="comments-list">
        {comments.map((comment) => {
          const isLiked = !!likedComments[comment.id];
          const displayedLikes = (comment.likes || 0) + (isLiked ? 1 : 0);
          const hasReplies = (comment.replyCount > 0) || (comment.replies && comment.replies.length > 0);
          const isExpanded = !!expandedReplies[comment.id];
          const isLoading = !!loadingReplies[comment.id];
          const isReplying = !!replyInputOpen[comment.id];

          return (
            <div key={comment.id} className="comment-item" id={`comment-thread-${comment.id}`}>
              <img 
                src={comment.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"} 
                alt={comment.author} 
                className="comment-avatar"
                loading="lazy" 
              />
              <div className="comment-content">
                <div className="comment-author-line">
                  <span className="comment-author-name">@{comment.author}</span>
                  <span className="comment-time">{comment.time}</span>
                </div>
                <p className="comment-text" dangerouslySetInnerHTML={{ __html: comment.text }} />

                <div className="comment-reactions">
                  <button 
                    className={`comment-react-btn ${isLiked ? 'active' : ''}`}
                    onClick={() => toggleLikeComment(comment.id)}
                    aria-label="Like comment"
                  >
                    <ThumbsUp size={14} />
                    <span>{displayedLikes > 0 ? displayedLikes : ''}</span>
                  </button>
                  <button className="comment-react-btn" aria-label="Dislike comment">
                    <ThumbsDown size={14} />
                  </button>
                  <button 
                    className="comment-react-btn" 
                    style={{ marginLeft: 6 }}
                    onClick={() => setReplyInputOpen(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                  >
                    <MessageSquare size={14} />
                    <span>Reply</span>
                  </button>
                </div>

                {/* Inline reply box */}
                {isReplying && (
                  <div className="inline-reply-box" style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
                    <CornerDownRight size={16} color="var(--text-secondary)" />
                    <input 
                      type="text"
                      className="comment-input"
                      placeholder={`Reply to @${comment.author}...`}
                      value={replyText[comment.id] || ''}
                      onChange={(e) => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddReply(comment.id);
                      }}
                      style={{
                        flex: 1,
                        padding: '6px 12px',
                        background: 'transparent',
                        borderBottom: '1px solid var(--border-light)',
                        color: '#fff',
                        fontSize: 13
                      }}
                    />
                    <button
                      type="button"
                      className="comment-submit-btn"
                      style={{ padding: '6px 14px', fontSize: 12 }}
                      onClick={() => handleAddReply(comment.id)}
                    >
                      Reply
                    </button>
                    <button
                      type="button"
                      className="comment-cancel-btn"
                      style={{ padding: '6px 10px', fontSize: 12 }}
                      onClick={() => setReplyInputOpen(prev => ({ ...prev, [comment.id]: false }))}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Show Replies button */}
                {hasReplies && (
                  <div className="replies-wrapper" style={{ marginTop: 8 }}>
                    <button 
                      className="show-replies-btn"
                      onClick={() => handleToggleReplies(comment)}
                      aria-expanded={isExpanded}
                      id={`show-replies-btn-${comment.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: 'var(--accent-blue)',
                        fontSize: 13,
                        fontWeight: 600,
                        padding: '6px 12px',
                        borderRadius: 18,
                        background: isExpanded ? 'rgba(62, 166, 255, 0.1)' : 'transparent',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      <span>
                        {isExpanded 
                          ? `Hide ${comment.replyCount || (comment.replies && comment.replies.length) || ''} replies` 
                          : `${comment.replyCount || (comment.replies && comment.replies.length) || ''} replies`}
                      </span>
                    </button>

                    {/* Replies list */}
                    {isExpanded && (
                      <div className="nested-replies-list" style={{ marginLeft: 20, marginTop: 12 }}>
                        {isLoading ? (
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '6px 0' }}>
                            Loading replies...
                          </div>
                        ) : (
                          (comment.replies || []).map((reply) => (
                            <div key={reply.id} className="comment-item reply-item" style={{ marginBottom: 12 }}>
                              <img 
                                src={reply.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"} 
                                alt={reply.author} 
                                className="comment-avatar"
                                style={{ width: 28, height: 28 }}
                                loading="lazy" 
                              />
                              <div className="comment-content">
                                <div className="comment-author-line">
                                  <span className="comment-author-name" style={{ fontSize: 12 }}>@{reply.author}</span>
                                  <span className="comment-time" style={{ fontSize: 11 }}>{reply.time}</span>
                                </div>
                                <p className="comment-text" style={{ fontSize: 13 }} dangerouslySetInnerHTML={{ __html: reply.text }} />
                                <div className="comment-reactions">
                                  <button className="comment-react-btn" aria-label="Like reply">
                                    <ThumbsUp size={12} />
                                    <span>{reply.likes > 0 ? reply.likes : ''}</span>
                                  </button>
                                  <button className="comment-react-btn" aria-label="Dislike reply">
                                    <ThumbsDown size={12} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
