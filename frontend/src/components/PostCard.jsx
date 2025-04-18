import React, { useState, useEffect, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FaThumbsUp, FaComment, FaTrash, FaImage } from 'react-icons/fa';
import { useUser } from '../context/useUser';
import { usePosts } from '../context/PostContext';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PostCard = ({ post, onDelete }) => {
  const { user } = useUser();
  const { likePost, addComment } = usePosts();
  const [commentInput, setCommentInput] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Memoize the image URL to prevent unnecessary recalculations
  const imageUrl = useMemo(() => {
    if (!post?.image) return null;
    if (post.image.startsWith('http')) return post.image;
    
    // Remove any leading slashes and 'uploads/' prefix to avoid duplicates
    const cleanPath = post.image.replace(/^\/+/, '').replace(/^uploads\//, '');
    return `${API_URL.replace(/\/api$/, '')}/uploads/${cleanPath}`;
  }, [post?.image]);

  const handleLike = async () => {
    try {
      await likePost(post._id);
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    try {
      await addComment(post._id, commentInput);
      setCommentInput('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleImageError = (e) => {
    console.error('Error loading image:', {
      error: e,
      imageUrl,
      postImage: post.image
    });
    setImageError(true);
    setImageLoading(false);
  };

  if (!post) {
    console.error('Post is undefined');
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {post.image && (
        <div className="relative aspect-video w-full">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
          {!imageError ? (
            <img
              src={imageUrl}
              alt={post.content}
              className="w-full h-full object-cover"
              loading="lazy"
              onLoad={() => setImageLoading(false)}
              onError={handleImageError}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <span className="text-gray-500">Image not available</span>
            </div>
          )}
        </div>
      )}
      <div className="p-4">
        <p className="text-gray-700 mb-4">{post.content}</p>
        
        {/* Post Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 ${
                post.likes?.includes(user?._id) ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              <FaThumbsUp />
              <span>{post.likes?.length || 0}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 text-gray-500"
            >
              <FaComment />
              <span>{post.comments?.length || 0}</span>
            </button>
          </div>
          {onDelete && (
            <button
              onClick={() => onDelete(post._id)}
              className="text-red-500 hover:text-red-700"
            >
              <FaTrash />
            </button>
          )}
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4">
            <form onSubmit={handleComment} className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 p-2 border rounded"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Post
                </button>
              </div>
            </form>
            <div className="space-y-2">
              {post.comments?.map((comment) => (
                <div key={comment._id} className="bg-gray-50 p-2 rounded">
                  <p className="text-sm font-medium">
                    {comment.author?.firstName} {comment.author?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{comment.content}</p>
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Post Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Posted by {post.author?.firstName} {post.author?.lastName}
          </span>
          <span>
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
