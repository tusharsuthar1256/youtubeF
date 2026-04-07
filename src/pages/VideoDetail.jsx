import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getVideoByIdService, getAllVideosService, updateVideoService, deleteVideoService } from '../services/video.services';
import { toggleSubscriptionService } from '../services/subscription.services';
import { toggleVideoLikeService } from '../services/like.services';
import { getVideoCommentsService, addCommentService } from '../services/comment.services';
import { getUserPlaylistsService, addVideosToPlaylistService, createPlaylistService } from '../services/playlist.services';
import { FiThumbsUp, FiShare2, FiMoreHorizontal, FiX, FiCopy, FiCheck, FiEdit, FiTrash2, FiPlus, FiFolder, FiLoader, FiChevronRight } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import VideoCard from '../components/VideoCard';
import toast from 'react-hot-toast';

const VideoDetail = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [suggestedVideos, setSuggestedVideos] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const { status, userData } = useAuth();

  // Edit/Delete State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editThumbnail, setEditThumbnail] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Playlist State
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [playlistLoading, setPlaylistLoading] = useState(false);
  const [showNewPlaylistForm, setShowNewPlaylistForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

  const thumbnailInputRef = useRef(null);

  useEffect(() => {
    const fetchPageData = async () => {
      setLoading(true);
      try {
        const [videoRes, suggestedRes, commentsRes] = await Promise.allSettled([
          getVideoByIdService(videoId),
          getAllVideosService({ limit: 10 }),
          getVideoCommentsService(videoId)
        ]);

        if (videoRes.status === 'fulfilled' && videoRes.value.success) {
          const vData = videoRes.value.data.video || videoRes.value.data;
          setVideo(vData);
          setEditTitle(vData.title);
          setEditDescription(vData.description);
        }
        if (suggestedRes.status === 'fulfilled' && suggestedRes.value.success) {
          const allVideos = suggestedRes.value.data.videos || suggestedRes.value.data.docs || suggestedRes.value.data;
          setSuggestedVideos(allVideos.filter(v => v._id !== videoId));
        }
        if (commentsRes.status === 'fulfilled' && commentsRes.value.success) {
          setComments(commentsRes.value.data.docs || commentsRes.value.data);
        }
      } catch (error) {
        console.error('Error fetching page data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, [videoId]);

  const handleSubscribeToggle = async () => {
    if (!status) return toast.error('Please login to subscribe!');
    if (!video?.owner?._id) return;

    try {
      const response = await toggleSubscriptionService(video.owner._id);
      if (response.success) {
        setVideo((prev) => ({
          ...prev,
          owner: {
            ...prev.owner,
            isSubscribed: response.data.subscribed,
            subscribersCount: response.data.subscribed 
                ? (prev.owner.subscribersCount || 0) + 1 
                : (prev.owner.subscribersCount || 1) - 1
          }
        }));
        toast.success(response.data.subscribed ? 'Subscribed!' : 'Unsubscribed!');
      }
    } catch (error) {
      console.error('Subscription toggle failed', error);
      toast.error('Failed to toggle subscription');
    }
  };

  const handleLikeToggle = async () => {
    if (!status) return toast.error('Please login to like videos!');
    try {
      const response = await toggleVideoLikeService(videoId);
      if (response.success) {
        setVideo((prev) => ({
          ...prev,
          likes: prev.isLiked ? (prev.likes || 1) - 1 : (prev.likes || 0) + 1,
          isLiked: !prev.isLiked
        }));
        toast.success(response.data.liked ? 'Video liked!' : 'Like removed');
      }
    } catch (error) {
      console.error('Like toggle failed', error);
      toast.error('Failed to toggle like');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!status) return toast.error('Please login to comment!');
    if (!newComment.trim()) return;

    try {
      const response = await addCommentService(videoId, newComment);
      if (response.success) {
        const commentToAdd = response.data.comment || response.data;
        if (!commentToAdd.owner?.username) {
            commentToAdd.owner = userData;
        }
        setComments([commentToAdd, ...comments]);
        setNewComment('');
        toast.success('Comment added!');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleUpdateVideo = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
        const formData = new FormData();
        formData.append('title', editTitle);
        formData.append('description', editDescription);
        if (editThumbnail) formData.append('thumbnail', editThumbnail);

        const response = await updateVideoService(videoId, formData);
        if (response.success) {
            setVideo(prev => ({ 
                ...prev, 
                title: response.data.title, 
                description: response.data.description,
                thumbnail: response.data.thumbnail
            }));
            setShowEditModal(false);
            toast.success('Video updated successfully');
        }
    } catch (error) {
        toast.error('Failed to update video');
    } finally {
        setUpdateLoading(false);
    }
  };

  const handleDeleteVideo = async () => {
      if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) return;
      setIsDeleting(true);
      try {
          const response = await deleteVideoService(videoId);
          if (response.success) {
              toast.success('Video deleted successfully');
              navigate(`/profile/${userData?.username}`);
          }
      } catch (error) {
          toast.error('Failed to delete video');
      } finally {
          setIsDeleting(false);
      }
  };

  const fetchUserPlaylists = async () => {
      if (!userData?._id) return;
      setPlaylistLoading(true);
      try {
          const response = await getUserPlaylistsService(userData._id);
          if (response.success) {
              setUserPlaylists(response.data);
          }
      } catch (error) {
          console.error('Failed to fetch playlists');
          toast.error('Failed to fetch playlists');
      } finally {
          setPlaylistLoading(false);
      }
  };

  const handleAddToPlaylist = async (playlistId) => {
      try {
          const response = await addVideosToPlaylistService(playlistId, videoId);
          if (response.success) {
              toast.success('Video added to playlist');
              setShowPlaylistModal(false);
          }
      } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to add video to playlist');
      }
  };

  const handleCreateAndAdd = async (e) => {
      e.preventDefault();
      if (!newPlaylistName.trim()) return;
      try {
          const createRes = await createPlaylistService({ name: newPlaylistName, description: newPlaylistDesc });
          if (createRes.success) {
              await handleAddToPlaylist(createRes.data._id);
          }
      } catch (error) {
          toast.error('Failed to create playlist');
      }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
      if (showPlaylistModal) {
          fetchUserPlaylists();
      }
  }, [showPlaylistModal]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
        <h2 className="text-2xl font-bold">Video not found</h2>
      </div>
    );
  }

  const isOwner = userData?._id === video.owner?._id;

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:flex gap-8">
      {/* Main Video Section */}
      <div className="flex-1">
        <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-800">
          <video
            src={video.videoFile?.videoURL || video.videoFile}
            controls
            autoPlay
            poster={video.thumbnail?.thumbnailURL || video.thumbnail}
            className="w-full h-full object-contain"
          ></video>
        </div>
        
        <div className="flex items-start justify-between mt-4">
            <h1 className="text-xl md:text-2xl font-bold text-white line-clamp-2 font-theme">
                {video.title}
            </h1>
            {isOwner && (
                <div className="flex gap-2">
                    <button 
                        onClick={() => setShowEditModal(true)}
                        className="p-2.5 bg-[#272727] hover:bg-gray-700 rounded-full text-blue-400 transition-all border border-gray-700"
                        title="Edit Video"
                    >
                        <FiEdit className="text-xl" />
                    </button>
                    <button 
                        onClick={handleDeleteVideo}
                        disabled={isDeleting}
                        className="p-2.5 bg-[#272727] hover:bg-red-900/40 rounded-full text-red-500 transition-all border border-gray-700 disabled:opacity-50"
                        title="Delete Video"
                    >
                        {isDeleting ? <FiLoader className="animate-spin" /> : <FiTrash2 className="text-xl" />}
                    </button>
                </div>
            )}
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-3 gap-4 border-b border-gray-800 pb-5">
          <div className="flex items-center gap-4">
            <Link to={`/profile/${video.owner?.username}`}>
              <img
                src={video.owner?.avatar || 'https://via.placeholder.com/48'}
                alt={video.owner?.username}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-800 hover:border-gray-500 transition-all"
              />
            </Link>
            <div className="flex flex-col">
              <Link to={`/profile/${video.owner?.username}`} className="font-bold text-base text-white hover:text-gray-300 transition-colors">
                {video.owner?.fullName || video.owner?.username || 'User Channel'}
              </Link>
              <span className="text-sm text-gray-400 font-medium">
                {video.owner?.subscribersCount || '1.2M'} subscribers
              </span>
            </div>
            <button 
              onClick={handleSubscribeToggle}
              disabled={!status || isOwner}
              className={`font-bold rounded-full px-6 py-2.5 transition-all ml-2 transform active:scale-95 ${
                !status || isOwner ? 'bg-gray-700 text-gray-400 cursor-not-allowed' :
                video.owner?.isSubscribed 
                ? 'bg-[#272727] text-white hover:bg-red-600 hover:text-white' 
                : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              {isOwner ? 'Owner' : video.owner?.isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <div className={`flex items-center bg-[#272727] rounded-full overflow-hidden border border-gray-700 ${!status ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <button 
                onClick={handleLikeToggle}
                disabled={!status}
                className={`flex items-center gap-2 px-5 py-2 hover:bg-gray-600 transition-all border-r border-gray-700 ${
                  video.isLiked ? 'text-blue-400' : 'text-white'
                }`}
              >
                <FiThumbsUp className={`text-lg transition-transform ${video.isLiked ? 'scale-110' : ''}`} />
                <span className="text-sm font-bold">{video.likes || 0}</span>
              </button>
              <button className="px-4 py-2 hover:bg-gray-600 transition-colors">
                <FiThumbsUp className="text-lg rotate-180 text-gray-400" />
              </button>
            </div>
            
            <button 
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-5 py-2 bg-[#272727] hover:bg-gray-600 rounded-full transition-all font-bold text-sm border border-gray-700"
            >
              <FiShare2 className="text-lg" />
              Share
            </button>

            <button 
              onClick={() => status ? setShowPlaylistModal(true) : alert('Please login to save to playlist')}
              className="flex items-center gap-2 px-5 py-2 bg-[#272727] hover:bg-gray-600 rounded-full transition-all font-bold text-sm border border-gray-700"
            >
              <FiFolder className="text-lg" />
              Save
            </button>
            
            <button className="p-2.5 bg-[#272727] hover:bg-gray-600 rounded-full transition-all border border-gray-700 flex-shrink-0">
              <FiMoreHorizontal className="text-lg" />
            </button>
          </div>
        </div>

        <div className="bg-[#272727]/50 hover:bg-[#272727] cursor-default rounded-xl p-4 mt-4 transition-all group">
          <div className="flex gap-3 text-sm font-bold text-white mb-2">
            <span>{video.views || 0} views</span>
            <span className="text-gray-500">•</span>
            <span>
              {video.createdAt ? formatDistanceToNow(new Date(video.createdAt), { addSuffix: true }) : ''}
            </span>
          </div>
          <p className="text-sm text-gray-200 whitespace-pre-line leading-relaxed">
            {video.description}
          </p>
        </div>

        {/* Comments Section */}
        <div className="mt-8">
           <h3 className="text-xl font-bold text-white mb-6 font-theme">{comments.length} Comments</h3>
           
           {status ? (
              <form onSubmit={handleAddComment} className="flex gap-4 mb-8 group">
                 <img src={userData?.avatar} className="w-10 h-10 rounded-full object-cover shadow-lg" alt="" />
                 <div className="flex-1 flex flex-col gap-2">
                    <input 
                      type="text" 
                      placeholder="Add a comment..." 
                      className="bg-transparent border-b border-gray-700 focus:border-white py-2 outline-none text-sm transition-colors"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div className="flex justify-end gap-3 opacity-0 group-focus-within:opacity-100 transition-opacity">
                       <button type="button" onClick={() => setNewComment('')} className="px-4 py-2 hover:bg-gray-800 rounded-full text-sm font-bold text-gray-400">Cancel</button>
                       <button type="submit" disabled={!newComment.trim()} className="px-4 py-2 bg-blue-500 disabled:bg-gray-700 text-black rounded-full text-sm font-bold transition-colors">Comment</button>
                    </div>
                 </div>
              </form>
           ) : (
              <div className="bg-[#1a1a1a] rounded-xl p-4 mb-8 text-center text-gray-400 border border-dashed border-gray-800">
                  <p>Please <Link to="/login" className="text-blue-400 hover:underline">sign in</Link> to join the discussion.</p>
              </div>
           )}

           <div className="flex flex-col gap-6">
              {comments.map((comment) => (
                 <div key={comment._id} className="flex gap-4">
                    <Link to={`/profile/${comment.owner?.username}`}>
                        <img src={comment.owner?.avatar || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt="" />
                    </Link>
                    <div className="flex-1">
                       <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-white">@{comment.owner?.username}</span>
                          <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                       </div>
                       <p className="text-sm text-gray-200 leading-relaxed">{comment.content}</p>
                       <div className="flex items-center gap-4 mt-2 text-gray-400">
                          <button className="hover:text-white transition-colors"><FiThumbsUp className="text-sm" /></button>
                          <button className="text-xs font-bold hover:text-white transition-colors">REPLY</button>
                       </div>
                    </div>
                 </div>
              ))}
              {comments.length === 0 && <p className="text-center py-10 text-gray-500 italic">No comments yet. Be the first!</p>}
           </div>
        </div>
      </div>

      {/* Suggested Videos */}
      <div className="w-full lg:w-[350px] xl:w-[400px] mt-8 lg:mt-0 flex flex-col gap-4">
        <h4 className="text-white font-bold mb-1 font-theme">Up next</h4>
        {suggestedVideos.map((item) => (
           <Link key={item._id} to={`/watch/${item._id}`} className="group">
              <div className="flex gap-3">
                 <div className="w-40 h-24 bg-gray-800 rounded-xl flex-shrink-0 overflow-hidden relative shadow-lg">
                    <img src={item.thumbnail?.thumbnailURL || item.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="" />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] px-1.5 py-0.5 rounded font-bold text-white">
                        {Math.floor(item.duration / 60)}:{Math.floor(item.duration % 60).toString().padStart(2, '0')}
                    </span>
                 </div>
                 <div className="flex flex-col gap-1 w-full py-0.5">
                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">{item.title}</h3>
                    <p className="text-xs text-gray-400 font-medium">@{item.owner?.username || 'Channel'}</p>
                    <p className="text-[11px] text-gray-500 font-bold">{item.views || 0} views • {formatDistanceToNow(new Date(item.createdAt))} ago</p>
                 </div>
              </div>
           </Link>
        ))}
        {suggestedVideos.length === 0 && <p className="text-gray-500 text-sm italic">Loading recommendations...</p>}
      </div>

      {/* Share Modal */}
      {showShareModal && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1f1f1f] rounded-2xl w-full max-w-md p-6 border border-gray-800 shadow-2xl">
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Share</h2>
                  <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-gray-800 rounded-full text-gray-400"><FiX className="text-xl" /></button>
               </div>
               
               <p className="text-sm text-gray-400 mb-4 font-medium tracking-tight">VIDEO URL</p>
               <div className="flex items-center gap-2 bg-black/50 p-3 rounded-xl border border-gray-800 mb-6">
                  <input type="text" readOnly value={window.location.href} className="bg-transparent flex-1 text-sm text-gray-200 outline-none" />
                  <button onClick={copyToClipboard} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-black hover:bg-gray-200'}`}>
                    {copied ? <FiCheck /> : <FiCopy />} {copied ? 'Copied' : 'Copy'}
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Edit Video Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-[#1f1f1f] rounded-2xl w-full max-w-lg p-6 border border-gray-800 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                   <h2 className="text-2xl font-bold text-white">Edit Video</h2>
                   <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-800 rounded-full text-gray-400"><FiX className="text-xl" /></button>
                </div>
                <form onSubmit={handleUpdateVideo} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-400">Title</label>
                        <input 
                            type="text" 
                            className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-400">Description</label>
                        <textarea 
                            className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none h-32 resize-none"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-400">New Thumbnail (Optional)</label>
                        <button 
                            type="button" 
                            onClick={() => thumbnailInputRef.current.click()}
                            className="w-full bg-[#373737] hover:bg-[#4a4a4a] border border-gray-700 py-4 rounded-xl flex items-center justify-center gap-3 transition-colors"
                        >
                            <FiEdit /> {editThumbnail ? editThumbnail.name : 'Choose new thumbnail'}
                        </button>
                        <input 
                            type="file" 
                            hidden 
                            ref={thumbnailInputRef} 
                            onChange={(e) => setEditThumbnail(e.target.files[0])} 
                            accept="image/*"
                         />
                    </div>
                    <button 
                        type="submit" 
                        disabled={updateLoading}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl mt-4 transition-all flex items-center justify-center gap-2"
                    >
                        {updateLoading ? <FiLoader className="animate-spin" /> : <FiCheck />}
                        {updateLoading ? 'UPDATING...' : 'SAVE CHANGES'}
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Save to Playlist Modal */}
      {showPlaylistModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1f1f1f] rounded-2xl w-full max-w-sm border border-gray-800 shadow-2xl flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <h2 className="font-bold text-white">Save video to...</h2>
                    <button onClick={() => setShowPlaylistModal(false)} className="text-gray-400 hover:text-white"><FiX className="text-xl" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2">
                    {playlistLoading ? (
                        <div className="flex justify-center p-10"><FiLoader className="animate-spin text-2xl text-blue-500" /></div>
                    ) : (
                        <div className="flex flex-col">
                            {userPlaylists.map(pl => (
                                <button 
                                    key={pl._id}
                                    onClick={() => handleAddToPlaylist(pl._id)}
                                    className="flex items-center justify-between p-3 hover:bg-[#272727] rounded-xl transition-all group"
                                >
                                    <div className="flex items-center gap-3 text-white">
                                        <FiFolder className="text-gray-400 group-hover:text-blue-500" />
                                        <span className="text-sm font-medium">{pl.name}</span>
                                    </div>
                                    <FiCheck className="text-emerald-500 opacity-0 group-hover:opacity-100" />
                                </button>
                            ))}
                            {userPlaylists.length === 0 && <p className="text-center py-6 text-gray-500 text-sm italic">You don't have any playlists yet.</p>}
                        </div>
                    )}
                </div>

                {!showNewPlaylistForm ? (
                    <button 
                        onClick={() => setShowNewPlaylistForm(true)}
                        className="p-4 border-t border-gray-800 flex items-center gap-3 text-white hover:bg-[#272727] font-bold text-sm transition-all"
                    >
                        <FiPlus className="text-lg" /> Create new playlist
                    </button>
                ) : (
                    <form onSubmit={handleCreateAndAdd} className="p-4 border-t border-gray-800 flex flex-col gap-3">
                        <input 
                            type="text" 
                            placeholder="Playlist name" 
                            className="bg-[#0f0f0f] border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none"
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            required
                        />
                         <input 
                            type="text" 
                            placeholder="Description" 
                            className="bg-[#0f0f0f] border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none"
                            value={newPlaylistDesc}
                            onChange={(e) => setNewPlaylistDesc(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <button 
                                type="button" 
                                onClick={() => setShowNewPlaylistForm(false)} 
                                className="flex-1 py-2 text-sm font-bold text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="flex-1 py-2 bg-blue-600 rounded-lg text-sm font-bold text-white hover:bg-blue-500"
                            >
                                Create
                            </button>
                        </div>
                    </form>
                )}
            </div>
          </div>
      )}
    </div>
  );
};

export default VideoDetail;

