import React, { useEffect, useState } from 'react';
import { getWatchHistoryService } from '../services/auth.services';
import VideoCard from '../components/VideoCard';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getWatchHistoryService();
        if (response.success) {
          setHistory(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch watch history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Watch History</h1>
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <p className="text-xl">Your watch history is empty.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {history.map((video) => (
            <div key={video._id} className="w-full sm:w-[500px]">
              <VideoCard video={video} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
