import { FALLBACK_VIDEOS_20 } from '../data/mockYoutubeData';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Storage key for user-provided API key
const STORAGE_API_KEY = 'yt_api_key';

/**
 * Retrieve active YouTube API key
 * Checks localStorage first, then Vite env variables
 */
export function getApiKey() {
  const localKey = localStorage.getItem(STORAGE_API_KEY);
  if (localKey && localKey.trim()) {
    return localKey.trim();
  }
  return import.meta.env.VITE_YOUTUBE_API_KEY || '';
}

/**
 * Save API key in localStorage
 */
export function setApiKey(key) {
  if (key && key.trim()) {
    localStorage.setItem(STORAGE_API_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_API_KEY);
  }
}

/**
 * Check if a valid API key exists
 */
export function hasApiKey() {
  const key = getApiKey();
  return Boolean(key && key.length > 10);
}

/**
 * Convert ISO 8601 duration (e.g. PT4M33S, PT1H2M10S) to mm:ss format
 */
export function parseDuration(durationStr) {
  if (!durationStr) return '00:00';
  const matches = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!matches) return '00:00';
  const hours = parseInt(matches[1] || '0', 10);
  const minutes = parseInt(matches[2] || '0', 10);
  const seconds = parseInt(matches[3] || '0', 10);

  if (hours > 0) {
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
  return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

/**
 * Format view/like numbers into readable K, M, B strings
 */
export function formatCount(count) {
  if (!count && count !== 0) return '0';
  const num = typeof count === 'string' ? parseInt(count, 10) : count;
  if (isNaN(num)) return '0';
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

/**
 * Convert publication timestamp to relative time (e.g. "2 months ago")
 */
export function formatTimeAgo(dateString) {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}

/**
 * 1. Fetch 20 videos on Empty Search / Initial Load
 * Uses YouTube Videos list with chart=mostPopular, maxResults=20
 */
export async function fetchPopularVideos(maxResults = 20) {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.info('[YouTube API] No API Key set. Using 20-video curated fallback dataset.');
    return {
      videos: FALLBACK_VIDEOS_20.slice(0, maxResults),
      source: 'fallback',
      totalResults: FALLBACK_VIDEOS_20.length
    };
  }

  try {
    const url = `${BASE_URL}/videos?part=snippet,contentDetails,statistics&chart=mostPopular&maxResults=${maxResults}&regionCode=US&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      console.warn('[YouTube API] API error:', data?.error?.message || res.statusText);
      return {
        videos: FALLBACK_VIDEOS_20.slice(0, maxResults),
        source: 'fallback',
        error: data?.error?.message || 'API request failed'
      };
    }

    const videos = data.items.map(item => transformVideoItem(item));
    return {
      videos,
      source: 'api',
      totalResults: data.pageInfo?.totalResults || videos.length
    };
  } catch (err) {
    console.error('[YouTube API] Network exception:', err);
    return {
      videos: FALLBACK_VIDEOS_20.slice(0, maxResults),
      source: 'fallback',
      error: err.message
    };
  }
}

/**
 * 2. Search API: Fetch 20 videos based on search query
 * Uses YouTube Search list with part=snippet, maxResults=20, type=video, q={query}
 * Then enhances with contentDetails/statistics from videos list
 */
export async function searchVideos(query, maxResults = 20) {
  if (!query || !query.trim()) {
    return fetchPopularVideos(maxResults);
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    console.info(`[YouTube API] Searching fallback dataset for: "${query}"`);
    const q = query.toLowerCase().trim();
    const filtered = FALLBACK_VIDEOS_20.filter(v =>
      v.title.toLowerCase().includes(q) ||
      v.channel.name.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q)
    );
    return {
      videos: filtered.slice(0, maxResults),
      source: 'fallback',
      totalResults: filtered.length
    };
  }

  try {
    // Call Search API
    const searchUrl = `${BASE_URL}/search?part=snippet&maxResults=${maxResults}&type=video&q=${encodeURIComponent(query.trim())}&key=${apiKey}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchRes.ok) {
      console.warn('[YouTube API] Search error:', searchData?.error?.message);
      const q = query.toLowerCase().trim();
      const filtered = FALLBACK_VIDEOS_20.filter(v =>
        v.title.toLowerCase().includes(q) ||
        v.channel.name.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q)
      );
      return {
        videos: filtered,
        source: 'fallback',
        error: searchData?.error?.message
      };
    }

    const videoIds = searchData.items.map(item => item.id.videoId).filter(Boolean);
    if (videoIds.length === 0) {
      return { videos: [], source: 'api', totalResults: 0 };
    }

    // Call Video Details API to get full statistics (views, likes, duration)
    const detailsUrl = `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds.join(',')}&key=${apiKey}`;
    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json();

    if (!detailsRes.ok) {
      // Fallback to basic search snippet mapping
      const videos = searchData.items.map(item => transformSearchItem(item));
      return { videos, source: 'api', totalResults: videos.length };
    }

    const videos = detailsData.items.map(item => transformVideoItem(item));
    return {
      videos,
      source: 'api',
      totalResults: searchData.pageInfo?.totalResults || videos.length
    };
  } catch (err) {
    console.error('[YouTube API] Search exception:', err);
    return {
      videos: FALLBACK_VIDEOS_20.slice(0, maxResults),
      source: 'fallback',
      error: err.message
    };
  }
}

/**
 * 3. Video Details API: Fetch specific video by ID
 * Uses YouTube Videos list with part=snippet,contentDetails,statistics&id={videoId}
 */
export async function fetchVideoDetails(videoId) {
  if (!videoId) return null;

  // Check fallback list first if matching id
  const fallbackMatch = FALLBACK_VIDEOS_20.find(v => v.id === videoId || v.youtubeId === videoId);

  const apiKey = getApiKey();
  if (!apiKey) {
    return fallbackMatch || FALLBACK_VIDEOS_20[0];
  }

  try {
    const url = `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || !data.items || data.items.length === 0) {
      console.warn('[YouTube API] Details not found or error, using fallback:', data?.error?.message);
      return fallbackMatch || FALLBACK_VIDEOS_20[0];
    }

    return transformVideoItem(data.items[0]);
  } catch (err) {
    console.error('[YouTube API] Video details exception:', err);
    return fallbackMatch || FALLBACK_VIDEOS_20[0];
  }
}

/**
 * 4. Comments & Replies API: Fetch video comments
 * Uses YouTube CommentThreads list with part=snippet,replies&videoId={videoId}&maxResults=20
 */
export async function fetchVideoComments(videoId, maxResults = 20) {
  if (!videoId) return [];

  const fallbackMatch = FALLBACK_VIDEOS_20.find(v => v.id === videoId || v.youtubeId === videoId);
  const fallbackComments = fallbackMatch?.comments || FALLBACK_VIDEOS_20[0].comments;

  const apiKey = getApiKey();
  if (!apiKey) {
    return fallbackComments;
  }

  try {
    const url = `${BASE_URL}/commentThreads?part=snippet,replies&videoId=${videoId}&maxResults=${maxResults}&order=relevance&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || !data.items) {
      console.warn('[YouTube API] Comments error, using fallback:', data?.error?.message);
      return fallbackComments;
    }

    return data.items.map(thread => {
      const topComment = thread.snippet.topLevelComment.snippet;
      const threadReplies = thread.replies?.comments || [];

      return {
        id: thread.id,
        author: topComment.authorDisplayName,
        avatar: topComment.authorProfileImageUrl,
        text: topComment.textDisplay,
        likes: topComment.likeCount,
        time: formatTimeAgo(topComment.publishedAt),
        replyCount: thread.snippet.totalReplyCount || 0,
        replies: threadReplies.map(reply => ({
          id: reply.id,
          author: reply.snippet.authorDisplayName,
          avatar: reply.snippet.authorProfileImageUrl,
          text: reply.snippet.textDisplay,
          likes: reply.snippet.likeCount,
          time: formatTimeAgo(reply.snippet.publishedAt)
        }))
      };
    });
  } catch (err) {
    console.error('[YouTube API] Comments exception:', err);
    return fallbackComments;
  }
}

/**
 * 5. Comments Replies API: Fetch comment replies when "show replies" is clicked
 * Uses YouTube Comments list with part=snippet&parentId={commentId}&maxResults=20
 */
export async function fetchCommentReplies(commentId, maxResults = 20) {
  if (!commentId) return [];

  const apiKey = getApiKey();
  if (!apiKey) {
    // Check fallback items
    for (const v of FALLBACK_VIDEOS_20) {
      for (const c of v.comments) {
        if (c.id === commentId) {
          return c.replies || [];
        }
      }
    }
    return [];
  }

  try {
    const url = `${BASE_URL}/comments?part=snippet&parentId=${commentId}&maxResults=${maxResults}&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || !data.items) {
      console.warn('[YouTube API] Replies fetch error:', data?.error?.message);
      return [];
    }

    return data.items.map(reply => ({
      id: reply.id,
      author: reply.snippet.authorDisplayName,
      avatar: reply.snippet.authorProfileImageUrl,
      text: reply.snippet.textDisplay,
      likes: reply.snippet.likeCount,
      time: formatTimeAgo(reply.snippet.publishedAt)
    }));
  } catch (err) {
    console.error('[YouTube API] Replies exception:', err);
    return [];
  }
}

/**
 * Transform a YouTube API Video resource into internal clean format
 */
function transformVideoItem(item) {
  const snippet = item.snippet || {};
  const stats = item.statistics || {};
  const content = item.contentDetails || {};

  const thumbnails = snippet.thumbnails || {};
  const bestThumb = 
    thumbnails.maxres?.url || 
    thumbnails.standard?.url || 
    thumbnails.high?.url || 
    thumbnails.medium?.url || 
    thumbnails.default?.url ||
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';

  const viewNum = parseInt(stats.viewCount || '0', 10);
  const likeNum = parseInt(stats.likeCount || '0', 10);
  const commentNum = parseInt(stats.commentCount || '0', 10);

  return {
    id: item.id,
    youtubeId: item.id,
    title: snippet.title || 'Untitled Video',
    category: snippet.categoryId || 'General',
    thumbnail: bestThumb,
    duration: parseDuration(content.duration),
    views: formatCount(viewNum),
    viewCount: viewNum,
    likes: formatCount(likeNum),
    likeCount: likeNum,
    commentCount: commentNum,
    timestamp: formatTimeAgo(snippet.publishedAt),
    publishedAt: snippet.publishedAt,
    channel: {
      id: snippet.channelId,
      name: snippet.channelTitle || 'Unknown Channel',
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(snippet.channelTitle || 'YouTube')}`,
      subscribers: '1.2M',
      verified: true
    },
    description: snippet.description || 'No description provided.'
  };
}

/**
 * Transform a YouTube API Search resource into internal clean format
 */
function transformSearchItem(item) {
  const snippet = item.snippet || {};
  const videoId = item.id?.videoId || item.id;
  const thumbnails = snippet.thumbnails || {};
  const bestThumb = 
    thumbnails.high?.url || 
    thumbnails.medium?.url || 
    thumbnails.default?.url ||
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';

  return {
    id: videoId,
    youtubeId: videoId,
    title: snippet.title || 'Untitled Video',
    category: 'General',
    thumbnail: bestThumb,
    duration: '10:00',
    views: '1.2M',
    viewCount: 1200000,
    likes: '85K',
    likeCount: 85000,
    commentCount: 450,
    timestamp: formatTimeAgo(snippet.publishedAt),
    publishedAt: snippet.publishedAt,
    channel: {
      id: snippet.channelId,
      name: snippet.channelTitle || 'Unknown Channel',
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(snippet.channelTitle || 'YouTube')}`,
      subscribers: '500K',
      verified: false
    },
    description: snippet.description || 'No description provided.'
  };
}
