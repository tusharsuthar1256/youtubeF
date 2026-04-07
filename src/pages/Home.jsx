import React, { useEffect, useState } from 'react';
import { getAllVideosService } from '../services/video.services';
import VideoCard from '../components/VideoCard';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await getAllVideosService({ limit: 20 });
        if (data.success) {
          setVideos(data.data.videos || data.data.docs || data.data);
        }
      } catch (error) {
        console.error('Failed to fetch videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-2">
      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
          <h2 className="text-2xl font-bold mb-2">No videos found</h2>
          <p>Be the first one to upload a video!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
