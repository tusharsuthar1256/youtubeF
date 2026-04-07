import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSubscribedChannelsService } from '../services/subscription.services';
import { useAuth } from '../hooks/useAuth';

const Subscriptions = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userData, status } = useAuth();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!userData?._id) {
          setLoading(false);
          return;
      }
      try {
        const response = await getSubscribedChannelsService(userData._id);
        if (response.success) {
          const extractedChannels = response.data.map((item) => item.channel || item);
          setChannels(extractedChannels);
        }
      } catch (error) {
        console.error('Failed to fetch subscriptions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, [userData]);

  if (!status) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-4">Please log in to view subscriptions</h1>
          </div>
      )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Subscriptions</h1>
      {channels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-[#1f1f1f] rounded-2xl border border-gray-800">
          <p className="text-xl font-semibold">You haven't subscribed to any channels yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {channels.map((channel) => (
            channel && (
              <Link 
                key={channel._id} 
                to={`/profile/${channel.username}`}
                className="bg-[#1f1f1f] border border-gray-800 hover:border-blue-500/50 transition-colors rounded-2xl p-6 flex flex-col items-center text-center group"
              >
                <img 
                  src={channel.avatar || 'https://via.placeholder.com/150'} 
                  alt={channel.username} 
                  className="w-24 h-24 rounded-full object-cover mb-4 group-hover:scale-105 transition-transform"
                />
                <h3 className="font-bold text-lg text-white mb-1 group-hover:text-blue-400 transition-colors truncate w-full">{channel.fullName || channel.username}</h3>
                <span className="text-sm text-gray-400">@{channel.username}</span>
              </Link>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
