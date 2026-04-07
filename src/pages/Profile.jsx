import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserChannelProfileService, updateAccountDetailsService, updateUserAvatarService, updateUserCoverImageService } from '../services/auth.services';
import { getAllVideosService } from '../services/video.services';
import { toggleSubscriptionService } from '../services/subscription.services';
import { getUserPlaylistsService, createPlaylistService } from '../services/playlist.services';
import { getUserTweetsService } from '../services/tweet.services';
import VideoCard from '../components/VideoCard';
import { useAuth } from '../hooks/useAuth';
import { FiPlus, FiMessageSquare, FiFolder, FiEdit3, FiCamera, FiX, FiCheck, FiLoader } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const Profile = () => {
  const { username } = useParams();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [activeTab, setActiveTab] = useState('HOME');
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  
  // Edit State
  const [editFullName, setEditFullName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const { status, userData } = useAuth();
  const isOwner = userData?.username === username;

  const handleSubscribeToggle = async () => {
    if (!status) return toast.error('Please login to subscribe!');
    
    try {
      const response = await toggleSubscriptionService(channel._id);
      if (response.success) {
        setChannel((prev) => ({
          ...prev,
          isSubscribed: response.data.subscribed,
          subscribersCount: response.data.subscribed 
            ? prev.subscribersCount + 1 
            : prev.subscribersCount - 1
        }));
        toast.success(response.data.subscribed ? 'Subscribed!' : 'Unsubscribed!');
      }
    } catch (error) {
      console.error('Subscription toggle failed', error);
      toast.error('Failed to toggle subscription');
    }
  };

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const profileRes = await getUserChannelProfileService(username);
      if (profileRes.success) {
        setChannel(profileRes.data);
        setEditFullName(profileRes.data.fullName || '');
        setEditDescription(profileRes.data.description || '');
        const userId = profileRes.data._id;

        const [videosRes, playlistsRes, tweetsRes] = await Promise.allSettled([
          getAllVideosService({ userId }),
          getUserPlaylistsService(userId),
          getUserTweetsService(userId)
        ]);

        if (videosRes.status === 'fulfilled' && videosRes.value.success) {
          setVideos(videosRes.value.data);
        }
        if (playlistsRes.status === 'fulfilled' && playlistsRes.value.success) {
          setPlaylists(playlistsRes.value.data);
        }
        if (tweetsRes.status === 'fulfilled' && tweetsRes.value.success) {
          setTweets(tweetsRes.value.data);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
        const res = await updateAccountDetailsService({
            fullName: editFullName,
            description: editDescription
        });
        if (res.success) {
            setChannel(prev => ({ ...prev, fullName: editFullName, description: editDescription }));
            setShowEditModal(false);
            toast.success('Profile updated successfully');
        }
    } catch (error) {
        toast.error('Failed to update details');
    } finally {
        setEditLoading(false);
    }
  };

  const handleFileUpdate = async (type, file) => {
      setEditLoading(true);
      try {
          const formData = new FormData();
          formData.append(type === 'avatar' ? 'avatar' : 'coverImage', file);
          
          const res = type === 'avatar' 
            ? await updateUserAvatarService(formData)
            : await updateUserCoverImageService(formData);

          if (res.success) {
              setChannel(prev => ({ 
                  ...prev, 
                  [type === 'avatar' ? 'avatar' : 'coverImage']: res.data[type === 'avatar' ? 'avatar' : 'coverImage'] 
              }));
              toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully`);
          }
      } catch (error) {
          toast.error(`Failed to update ${type}`);
      } finally {
          setEditLoading(false);
      }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
        <h2 className="text-2xl font-bold font-theme">Channel not found!</h2>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'HOME':
        return (
          <div className="flex flex-col gap-8">
            {videos.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Uploads</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {videos.slice(0, 4).map(video => <VideoCard key={video._id} video={video} />)}
                </div>
              </div>
            )}
            {playlists.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Playlists</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {playlists.slice(0, 4).map(playlist => (
                    <Link key={playlist._id} to={`/playlist/${playlist._id}`} className="group bg-[#1f1f1f] border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-colors">
                      <div className="aspect-video bg-gray-800 flex items-center justify-center relative">
                        <FiFolder className="text-4xl text-gray-600 group-hover:text-blue-500 transition-colors" />
                        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                           <span className="text-xl font-bold text-white">{playlist.videos?.length || 0}</span>
                           <span className="text-[10px] text-gray-300">VIDEOS</span>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-white line-clamp-1">{playlist.name}</h3>
                        <p className="text-xs text-gray-400 mt-1">Playlist • {formatDistanceToNow(new Date(playlist.updatedAt))} ago</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'VIDEOS':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map(video => <VideoCard key={video._id} video={video} />)}
          </div>
        );
      case 'PLAYLISTS':
        return (
            <div className="flex flex-col gap-6">
                 {isOwner && (
                    <div className="flex justify-end">
                        <button 
                            onClick={() => setShowPlaylistModal(true)}
                            className="bg-white text-black font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition-all flex items-center gap-2"
                        >
                            <FiPlus /> Create Playlist
                        </button>
                    </div>
                 )}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {playlists.map(playlist => (
                        <Link key={playlist._id} to={`/playlist/${playlist._id}`} className="group bg-[#1f1f1f] border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-colors">
                          <div className="aspect-video bg-gray-800 flex items-center justify-center relative">
                            <FiFolder className="text-4xl text-gray-600 group-hover:text-blue-500 transition-colors" />
                            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                               <span className="text-xl font-bold text-white">{playlist.videos?.length || 0}</span>
                               <span className="text-[10px] text-gray-300">VIDEOS</span>
                            </div>
                          </div>
                          <div className="p-3">
                            <h3 className="font-bold text-white line-clamp-1">{playlist.name}</h3>
                            <p className="text-xs text-gray-400 mt-1">Playlist • {formatDistanceToNow(new Date(playlist.updatedAt))} ago</p>
                          </div>
                        </Link>
                      ))}
                 </div>
                 {playlists.length === 0 && (
                    <div className="text-center py-20 border border-dashed border-gray-800 rounded-2xl text-gray-500 italic">
                        No playlists found.
                    </div>
                 )}
            </div>
        );
      case 'COMMUNITY':
        return (
          <div className="max-w-2xl mx-auto flex flex-col gap-6">
            {tweets.map(tweet => (
               <div key={tweet._id} className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6 flex gap-4">
                  <img src={channel.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                  <div className="flex-1">
                     <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-white">{channel.fullName}</span>
                        <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(tweet.createdAt))} ago</span>
                     </div>
                     <p className="text-gray-200 whitespace-pre-wrap">{tweet.content}</p>
                     <div className="flex gap-4 mt-4 text-gray-400">
                        <div className="flex items-center gap-1 cursor-pointer hover:text-white"><FiMessageSquare /> 0</div>
                     </div>
                  </div>
               </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full pb-8">
      {/* Cover Image */}
      <div className="w-full h-32 md:h-64 bg-[#121212] overflow-hidden relative group">
        <img
          src={channel.coverImage || 'https://via.placeholder.com/1500x400'}
          className="w-full h-full object-cover opacity-80"
          alt={`${channel.username} cover`}
        />
        {isOwner && (
            <button 
                onClick={() => coverInputRef.current.click()}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 p-2 rounded-full text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all border border-white/20"
            >
                <FiCamera className="text-xl" />
            </button>
        )}
        <input 
            type="file" 
            hidden 
            ref={coverInputRef} 
            onChange={(e) => handleFileUpdate('coverImage', e.target.files[0])} 
            accept="image/*"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] to-transparent"></div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 -mt-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 border-b border-gray-800 pb-8">
          <div className="relative group">
              <img
                src={channel.avatar || 'https://via.placeholder.com/150'}
                alt={channel.username}
                className="w-24 h-24 md:w-40 md:h-40 rounded-full object-cover border-4 border-[#0f0f0f] shadow-2xl"
              />
              {isOwner && (
                  <button 
                    onClick={() => avatarInputRef.current.click()}
                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"
                  >
                      <FiCamera className="text-2xl" />
                  </button>
              )}
              <input 
                type="file" 
                hidden 
                ref={avatarInputRef} 
                onChange={(e) => handleFileUpdate('avatar', e.target.files[0])} 
                accept="image/*"
              />
          </div>

          <div className="flex flex-col flex-1 text-center md:text-left mt-4 md:mt-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white font-theme tracking-tight flex items-center justify-center md:justify-start gap-3">
                {channel.fullName}
                {isOwner && (
                    <button onClick={() => setShowEditModal(true)} className="p-1.5 hover:bg-gray-800 rounded-full text-gray-400 transition-colors">
                        <FiEdit3 className="text-lg" />
                    </button>
                )}
            </h1>
            <div className="text-gray-400 mt-2 flex gap-2 justify-center md:justify-start flex-wrap items-center">
              <span className="font-semibold text-gray-300">@{channel.username}</span>
              <span className="text-gray-600">•</span>
              <span className="bg-[#272727] px-2 py-0.5 rounded text-xs">{channel.subscribersCount || 0} subscribers</span>
              <span className="text-gray-600">•</span>
              <span>{videos.length} videos</span>
            </div>
            {channel.description && (
              <p className="text-sm text-gray-400 mt-4 line-clamp-2 md:w-3/4 leading-relaxed italic">
                "{channel.description}"
              </p>
            )}
          </div>

          <div className="mt-4 md:mt-12 flex flex-col justify-center">
             {!isOwner ? (
                <button 
                  onClick={handleSubscribeToggle}
                  className={`font-bold rounded-full px-8 py-2.5 transition-all w-full md:w-auto transform active:scale-95 ${
                    channel.isSubscribed 
                    ? 'bg-[#272727] text-white hover:bg-red-600' 
                    : 'bg-white text-black hover:bg-gray-200'
                  }`}
                >
                  {channel.isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
             ) : (
                <div className="flex gap-3">
                    <Link to="/upload" className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-full hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">
                      Upload Video
                    </Link>
                </div>
             )}
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-4 md:gap-10 mb-8 text-gray-400 border-b border-gray-800 font-bold overflow-x-auto no-scrollbar">
          {['HOME', 'VIDEOS', 'PLAYLISTS', 'COMMUNITY'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 transition-all relative ${
                activeTab === tab ? 'text-white border-b-2 border-white' : 'hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="min-h-[300px]">
          {renderTabContent()}
        </div>
      </div>

      {/* Edit Details Modal */}
      {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-[#1f1f1f] rounded-2xl w-full max-w-lg p-6 border border-gray-800 shadow-2xl relative">
                  <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><FiX className="text-xl" /></button>
                  <h2 className="text-2xl font-bold text-white mb-6">Edit Channel</h2>
                  <form onSubmit={handleUpdateDetails} className="flex flex-col gap-5">
                      <div className="flex flex-col gap-2">
                          <label className="text-sm font-bold text-gray-400">Full Name</label>
                          <input 
                            type="text" 
                            className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                            value={editFullName}
                            onChange={(e) => setEditFullName(e.target.value)}
                            placeholder="Your full name"
                          />
                      </div>
                      <div className="flex flex-col gap-2">
                          <label className="text-sm font-bold text-gray-400">Description</label>
                          <textarea 
                            className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none resize-none"
                            rows="4"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Tell viewers about your channel..."
                          ></textarea>
                      </div>
                      <div className="flex gap-4">
                          <button 
                            type="button"
                            onClick={() => avatarInputRef.current.click()}
                            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
                          >
                              <FiCamera /> Change Avatar
                          </button>
                          <button 
                            type="button"
                            onClick={() => coverInputRef.current.click()}
                            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
                          >
                              <FiCamera /> Change Cover
                          </button>
                      </div>
                      <button 
                        type="submit" 
                        disabled={editLoading}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl mt-2 transition-all flex items-center justify-center gap-2"
                      >
                          {editLoading ? <FiLoader className="animate-spin" /> : <FiCheck />}
                          {editLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                  </form>
              </div>
          </div>
      )}
      
      {/* Create Playlist Modal */}
      <CreatePlaylistModal 
        isOpen={showPlaylistModal} 
        onClose={() => setShowPlaylistModal(false)} 
        onCreate={async (name, description) => {
            try {
                const res = await createPlaylistService({ name, description });
                if (res.success) {
                    setPlaylists(prev => [res.data, ...prev]);
                }
            } catch (error) {
                alert('Failed to create playlist');
            }
        }}
      />
      
      {/* Global Loading Overlay for File Uploads */}
      {editLoading && !showEditModal && (
          <div className="fixed bottom-8 right-8 bg-[#1f1f1f] border border-gray-800 p-4 rounded-xl shadow-2xl flex items-center gap-3 z-[100] animate-bounce">
              <FiLoader className="text-blue-500 animate-spin text-xl" />
              <span className="text-white font-bold">Updating profile...</span>
          </div>
      )}
    </div>
  );
};

export default Profile;

// Modal for Playlist Creation
const CreatePlaylistModal = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onCreate(name, desc);
        setLoading(false);
        setName('');
        setDesc('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1f1f1f] rounded-2xl w-full max-w-md p-6 border border-gray-800 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                   <h2 className="text-xl font-bold text-white">New Playlist</h2>
                   <button onClick={onClose} className="text-gray-400 hover:text-white"><FiX className="text-xl" /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Playlist Name</label>
                        <input 
                            type="text" 
                            className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                            placeholder="My awesome playlist"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Description (Optional)</label>
                        <textarea 
                            className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none h-24 resize-none"
                            placeholder="Tell viewers what this playlist is about..."
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                        ></textarea>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-white text-black font-bold py-3 rounded-xl mt-4 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <FiLoader className="animate-spin" /> : <FiPlus />}
                        {loading ? 'Creating...' : 'Create Playlist'}
                    </button>
                </form>
            </div>
        </div>
    );
};
