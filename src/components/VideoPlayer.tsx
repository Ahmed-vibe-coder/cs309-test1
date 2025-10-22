import { Video as VideoType, Comment } from '../lib/supabase';
import { ThumbsUp, ThumbsDown, Share2, Download, Flag, Eye, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';
import { CommentSection } from './CommentSection';

type VideoPlayerProps = {
  video: VideoType;
  onClose: () => void;
};

export const VideoPlayer = ({ video, onClose }: VideoPlayerProps) => {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [userLike, setUserLike] = useState<boolean | null>(null);
  const [localLikes, setLocalLikes] = useState(video.like_count);
  const [localDislikes, setLocalDislikes] = useState(video.dislike_count);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showDescription, setShowDescription] = useState(false);

  useEffect(() => {
    if (user) {
      checkSubscription();
      checkUserLike();
      incrementViewCount();
    }
    loadComments();
  }, [user, video.id]);

  const checkSubscription = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('subscriber_id', user.id)
      .eq('channel_id', video.user_id)
      .maybeSingle();
    setIsSubscribed(!!data);
  };

  const checkUserLike = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('video_likes')
      .select('is_like')
      .eq('user_id', user.id)
      .eq('video_id', video.id)
      .maybeSingle();
    setUserLike(data?.is_like ?? null);
  };

  const incrementViewCount = async () => {
    await supabase
      .from('videos')
      .update({ view_count: video.view_count + 1 })
      .eq('id', video.id);

    if (user) {
      await supabase
        .from('watch_history')
        .insert({
          user_id: user.id,
          video_id: video.id,
        });
    }
  };

  const loadComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(*)')
      .eq('video_id', video.id)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (data) {
      const commentsWithReplies = await Promise.all(
        data.map(async (comment) => {
          const { data: replies } = await supabase
            .from('comments')
            .select('*, profiles(*)')
            .eq('parent_id', comment.id)
            .order('created_at', { ascending: true });
          return { ...comment, replies: replies || [] };
        })
      );
      setComments(commentsWithReplies);
    }
  };

  const handleSubscribe = async () => {
    if (!user) return;

    if (isSubscribed) {
      await supabase
        .from('subscriptions')
        .delete()
        .eq('subscriber_id', user.id)
        .eq('channel_id', video.user_id);
    } else {
      await supabase
        .from('subscriptions')
        .insert({
          subscriber_id: user.id,
          channel_id: video.user_id,
        });
    }
    setIsSubscribed(!isSubscribed);
  };

  const handleLike = async (isLike: boolean) => {
    if (!user) return;

    if (userLike === isLike) {
      await supabase
        .from('video_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('video_id', video.id);

      if (isLike) {
        setLocalLikes(prev => prev - 1);
      } else {
        setLocalDislikes(prev => prev - 1);
      }
      setUserLike(null);
    } else {
      const oldLike = userLike;

      await supabase
        .from('video_likes')
        .upsert({
          user_id: user.id,
          video_id: video.id,
          is_like: isLike,
        });

      if (oldLike === true) {
        setLocalLikes(prev => prev - 1);
        setLocalDislikes(prev => prev + 1);
      } else if (oldLike === false) {
        setLocalDislikes(prev => prev - 1);
        setLocalLikes(prev => prev + 1);
      } else {
        if (isLike) {
          setLocalLikes(prev => prev + 1);
        } else {
          setLocalDislikes(prev => prev + 1);
        }
      }

      setUserLike(isLike);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-y-auto">
      <div className="min-h-screen">
        <button
          onClick={onClose}
          className="fixed top-4 right-4 text-white hover:text-gray-300 text-2xl z-50"
        >
          ✕
        </button>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                <video
                  src={video.video_url}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              </div>

              <h1 className="text-2xl font-bold text-white mb-4">{video.title}</h1>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  {video.profiles?.avatar_url && (
                    <img
                      src={video.profiles.avatar_url}
                      alt={video.profiles.display_name}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-white">{video.profiles?.display_name}</p>
                    <p className="text-sm text-gray-400">
                      {formatNumber(video.profiles?.subscriber_count || 0)} subscribers
                    </p>
                  </div>
                  {user && user.id !== video.user_id && (
                    <button
                      onClick={handleSubscribe}
                      className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                        isSubscribed
                          ? 'bg-gray-700 text-white hover:bg-gray-600'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-gray-800 rounded-full overflow-hidden">
                    <button
                      onClick={() => handleLike(true)}
                      className={`px-4 py-2 flex items-center gap-2 hover:bg-gray-700 transition-colors ${
                        userLike === true ? 'text-blue-500' : 'text-white'
                      }`}
                    >
                      <ThumbsUp className="w-5 h-5" />
                      <span>{formatNumber(localLikes)}</span>
                    </button>
                    <div className="w-px h-6 bg-gray-700"></div>
                    <button
                      onClick={() => handleLike(false)}
                      className={`px-4 py-2 flex items-center gap-2 hover:bg-gray-700 transition-colors ${
                        userLike === false ? 'text-blue-500' : 'text-white'
                      }`}
                    >
                      <ThumbsDown className="w-5 h-5" />
                      <span>{formatNumber(localDislikes)}</span>
                    </button>
                  </div>
                  <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white flex items-center gap-2 transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                  <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white flex items-center gap-2 transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                  <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-colors">
                    <Flag className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-4 text-sm text-gray-300 mb-2">
                  <span className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    {formatNumber(video.view_count + 1)} views
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(video.created_at)}
                  </span>
                </div>
                <p className={`text-gray-300 ${showDescription ? '' : 'line-clamp-2'}`}>
                  {video.description}
                </p>
                <button
                  onClick={() => setShowDescription(!showDescription)}
                  className="text-blue-400 hover:text-blue-300 text-sm mt-2"
                >
                  {showDescription ? 'Show less' : 'Show more'}
                </button>
              </div>

              <CommentSection
                videoId={video.id}
                comments={comments}
                onCommentAdded={loadComments}
              />
            </div>

            <div className="lg:col-span-1">
              <h3 className="text-xl font-bold text-white mb-4">Related Videos</h3>
              <div className="space-y-4">
                <p className="text-gray-400">No related videos available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
