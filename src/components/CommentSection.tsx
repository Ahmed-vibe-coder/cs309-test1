import { useState } from 'react';
import { Comment } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ThumbsUp, MessageCircle, Send } from 'lucide-react';

type CommentSectionProps = {
  videoId: string;
  comments: Comment[];
  onCommentAdded: () => void;
};

export const CommentSection = ({ videoId, comments, onCommentAdded }: CommentSectionProps) => {
  const { user, profile } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;

    await supabase.from('comments').insert({
      video_id: videoId,
      user_id: user.id,
      content: newComment,
    });

    setNewComment('');
    onCommentAdded();
  };

  const handleAddReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return;

    await supabase.from('comments').insert({
      video_id: videoId,
      user_id: user.id,
      parent_id: parentId,
      content: replyContent,
    });

    setReplyContent('');
    setReplyingTo(null);
    onCommentAdded();
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) return;

    const { data: existing } = await supabase
      .from('comment_likes')
      .select('*')
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('comment_likes')
        .delete()
        .eq('id', existing.id);
    } else {
      await supabase.from('comment_likes').insert({
        comment_id: commentId,
        user_id: user.id,
      });
    }

    onCommentAdded();
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  };

  return (
    <div className="text-white">
      <h3 className="text-xl font-bold mb-4">{comments.length} Comments</h3>

      {user && (
        <div className="flex gap-3 mb-6">
          {profile?.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
          )}
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full bg-transparent border-b border-gray-600 focus:border-white outline-none resize-none text-white"
              rows={1}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setNewComment('')}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Comment
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            {comment.profiles?.avatar_url && (
              <img
                src={comment.profiles.avatar_url}
                alt={comment.profiles.display_name}
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{comment.profiles?.display_name}</span>
                <span className="text-sm text-gray-400">{getTimeAgo(comment.created_at)}</span>
              </div>
              <p className="text-gray-200 mb-2">{comment.content}</p>
              <div className="flex items-center gap-4 text-sm">
                <button
                  onClick={() => handleLikeComment(comment.id)}
                  className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{comment.like_count}</span>
                </button>
                {user && (
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Reply</span>
                  </button>
                )}
              </div>

              {replyingTo === comment.id && (
                <div className="flex gap-3 mt-4">
                  {profile?.avatar_url && (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`Reply to ${comment.profiles?.display_name}...`}
                      className="w-full bg-transparent border-b border-gray-600 focus:border-white outline-none resize-none text-white"
                      rows={1}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent('');
                        }}
                        className="px-3 py-1 text-gray-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAddReply(comment.id)}
                        disabled={!replyContent.trim()}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 space-y-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3">
                      {reply.profiles?.avatar_url && (
                        <img
                          src={reply.profiles.avatar_url}
                          alt={reply.profiles.display_name}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{reply.profiles?.display_name}</span>
                          <span className="text-xs text-gray-400">{getTimeAgo(reply.created_at)}</span>
                        </div>
                        <p className="text-gray-200 text-sm mb-2">{reply.content}</p>
                        <button
                          onClick={() => handleLikeComment(reply.id)}
                          className="flex items-center gap-1 hover:text-blue-400 transition-colors text-sm"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{reply.like_count}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
