import { useState, useRef, useEffect } from 'react';
import { useUser } from '../context/useUser';
import { usePosts } from '../context/PostContext';
import { FaPaperPlane, FaImage, FaSpinner } from 'react-icons/fa';
import PostCard from '../components/PostCard';
import { toast } from 'react-toastify';

const CommunityPage = () => {
  const { user } = useUser();
  const { posts, loading, createPost, fetchPosts } = usePosts();
  const [newPost, setNewPost] = useState({
    content: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPost.content.trim()) {
      toast.warning('Please write something before posting!');
      return;
    }

    if (!user) {
      toast.error('Please log in to create a post');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('content', newPost.content);
      
      if (newPost.image) {
        formData.append('image', newPost.image);
      }

      // Log form data for debugging
      console.log('Submitting post with:', {
        content: newPost.content,
        hasImage: !!newPost.image,
        imageName: newPost.image?.name
      });

      await createPost(formData);
      
      // Reset form
      setNewPost({ content: '', image: null });
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast.success('Post created successfully!');
    } catch (error) {
      console.error('Error in handlePostSubmit:', error);
      toast.error(error.message || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setNewPost({ ...newPost, image: file });
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setNewPost({ ...newPost, image: null });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('Image removed');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Posts Header Section */}
      <div className="bg-base-200 rounded-lg p-4 md:p-6 mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Share your creation with the community, {user?.firstName || 'Maker'}!
            </h1>
            <p className="text-base-content/70">
              Connect with like-minded creators, share knowledge, and collaborate on exciting projects in a vibrant and inclusive community.
            </p>
          </div>
        </div>
      </div>

      {/* Post Creation Form */}
      <div className="bg-base-100 rounded-lg shadow-lg p-4 mb-6">
        <form onSubmit={handlePostSubmit} className="space-y-4">
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="What's on your mind?"
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            rows={3}
            disabled={isSubmitting}
          />
          
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                type="button"
                className="btn btn-error btn-sm absolute top-2 right-2"
                onClick={handleRemoveImage}
                disabled={isSubmitting}
              >
                Remove
              </button>
            </div>
          )}

          <div className="flex justify-between items-center">
            <label className={`btn btn-ghost btn-sm ${isSubmitting ? 'btn-disabled' : ''}`}>
              <FaImage className="mr-2" />
              Add Image
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isSubmitting}
              />
            </label>
            <button 
              type="submit" 
              className={`btn btn-primary ${isSubmitting ? 'btn-disabled' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <FaPaperPlane className="mr-2" />
                  Post
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-base-content/70">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityPage; 