import React, { useEffect, useState } from 'react';
import { getLikedVideosService } from '../services/like.services';
import VideoCard from '../components/VideoCard';

const LikedVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
        const response = await getLikedVideosService();
        if (response.success) {
          // The backend usually returns an array of video objects, or an array of like objects populated with video
          const extractedVideos = response.data.map((item) => item.video || item);
          setVideos(extractedVideos);
        }
      } catch (error) {
        console.error('Failed to fetch liked videos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLikedVideos();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Liked Videos</h1>
      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <p className="text-xl">You haven't liked any videos yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
          {videos.map((video) => (
            video && <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedVideos;
