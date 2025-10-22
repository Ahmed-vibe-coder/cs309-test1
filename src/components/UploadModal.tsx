import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { X, Upload, Film } from 'lucide-react';

type UploadModalProps = {
  onClose: () => void;
  onUploadComplete: () => void;
};

const DEMO_VIDEOS = [
  {
    title: 'Beautiful Nature Documentary',
    description: 'Explore the wonders of nature in stunning 4K quality',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail_url: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1260',
    duration: 596,
    category: 'Nature',
    tags: ['nature', 'documentary', '4k']
  },
  {
    title: 'Coding Tutorial: React Basics',
    description: 'Learn React fundamentals with this comprehensive tutorial',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail_url: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=1260',
    duration: 653,
    category: 'Education',
    tags: ['coding', 'react', 'tutorial']
  },
  {
    title: 'Amazing Travel Vlog: Japan',
    description: 'Join me on an incredible journey through Japan',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail_url: 'https://images.pexels.com/photos/402028/pexels-photo-402028.jpeg?auto=compress&cs=tinysrgb&w=1260',
    duration: 15,
    category: 'Travel',
    tags: ['travel', 'japan', 'vlog']
  },
  {
    title: 'Cooking Masterclass: Italian Pasta',
    description: 'Learn to make authentic Italian pasta from scratch',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail_url: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=1260',
    duration: 15,
    category: 'Food',
    tags: ['cooking', 'italian', 'pasta']
  },
  {
    title: 'Gaming Highlights: Epic Moments',
    description: 'The most epic gaming moments of the week',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail_url: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=1260',
    duration: 60,
    category: 'Gaming',
    tags: ['gaming', 'highlights', 'epic']
  },
  {
    title: 'Fitness Workout: Full Body',
    description: '30-minute full body workout you can do at home',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnail_url: 'https://images.pexels.com/photos/4162491/pexels-photo-4162491.jpeg?auto=compress&cs=tinysrgb&w=1260',
    duration: 15,
    category: 'Fitness',
    tags: ['fitness', 'workout', 'health']
  }
];

export const UploadModal = ({ onClose, onUploadComplete }: UploadModalProps) => {
  const { user } = useAuth();
  const [selectedDemo, setSelectedDemo] = useState(0);
  const [title, setTitle] = useState(DEMO_VIDEOS[0].title);
  const [description, setDescription] = useState(DEMO_VIDEOS[0].description);
  const [category, setCategory] = useState(DEMO_VIDEOS[0].category);
  const [tags, setTags] = useState(DEMO_VIDEOS[0].tags.join(', '));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDemoChange = (index: number) => {
    setSelectedDemo(index);
    const demo = DEMO_VIDEOS[index];
    setTitle(demo.title);
    setDescription(demo.description);
    setCategory(demo.category);
    setTags(demo.tags.join(', '));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      const demo = DEMO_VIDEOS[selectedDemo];
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      const { error: uploadError } = await supabase.from('videos').insert({
        user_id: user.id,
        title,
        description,
        video_url: demo.video_url,
        thumbnail_url: demo.thumbnail_url,
        duration: demo.duration,
        category,
        tags: tagArray,
        status: 'published'
      });

      if (uploadError) throw uploadError;

      onUploadComplete();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-4xl w-full mx-4 my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Upload className="w-8 h-8 text-red-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Video</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Select Demo Video
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {DEMO_VIDEOS.map((demo, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleDemoChange(index)}
                className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                  selectedDemo === index
                    ? 'border-blue-600 ring-2 ring-blue-600'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <img
                  src={demo.thumbnail_url}
                  alt={demo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <Film className="w-8 h-8 text-white" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Education">Education</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Gaming">Gaming</option>
                <option value="Music">Music</option>
                <option value="Sports">Sports</option>
                <option value="Technology">Technology</option>
                <option value="Travel">Travel</option>
                <option value="Food">Food</option>
                <option value="Nature">Nature</option>
                <option value="Fitness">Fitness</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Uploading...' : 'Upload Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
