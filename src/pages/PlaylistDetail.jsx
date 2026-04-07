import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPlaylistByIDService, updatePlaylistService, deletePlaylistService, removeVideoFromPlaylistService } from '../services/playlist.services';
import VideoCard from '../components/VideoCard';
import { FiFolder, FiClock, FiVideo, FiPlay, FiEdit2, FiTrash2, FiX, FiCheck, FiMoreVertical } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const PlaylistDetail = () => {
    const { playlistId } = useParams();
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        fetchPlaylist();
    }, [playlistId]);

    const fetchPlaylist = async () => {
        try {
            const response = await getPlaylistByIDService(playlistId);
            if (response.success) {
                setPlaylist(response.data);
                setEditName(response.data.name);
                setEditDesc(response.data.description);
            }
        } catch (error) {
            console.error('Failed to fetch playlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!editName.trim()) return toast.error('Name is required');
        setUpdateLoading(true);
        try {
            const response = await updatePlaylistService(playlistId, { name: editName, description: editDesc });
            if (response.success) {
                setPlaylist(prev => ({ ...prev, name: editName, description: editDesc }));
                setIsEditing(false);
                toast.success('Playlist updated');
            }
        } catch (err) {
            toast.error('Failed to update playlist');
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this entire playlist?")) return;
        try {
            const response = await deletePlaylistService(playlistId);
            if (response.success) {
                toast.success('Playlist deleted');
                navigate('/playlist');
            }
        } catch (err) {
            toast.error('Failed to delete playlist');
        }
    };

    const handleRemoveVideo = async (videoId) => {
        try {
            const response = await removeVideoFromPlaylistService(playlistId, videoId);
            if (response.success) {
                setPlaylist(prev => ({
                    ...prev,
                    videos: prev.videos.filter(v => v._id !== videoId)
                }));
                toast.success('Video removed from playlist');
            }
        } catch (err) {
            toast.error('Failed to remove video');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!playlist) {
        return (
            <div className="text-center py-20 text-gray-400">
                <h2 className="text-2xl font-bold">Playlist not found</h2>
                <Link to="/" className="text-blue-500 mt-4 block">Go back home</Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1280px] mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8">
            {/* Left side: Playlist Info Card */}
            <div className="w-full lg:w-[360px] flex-shrink-0">
                <div className="bg-gradient-to-b from-[#2a2a2a] to-[#121212] rounded-2xl p-6 border border-gray-800 sticky top-24 shadow-2xl overflow-hidden">
                    <div className="aspect-video bg-gray-800 rounded-xl mb-6 flex items-center justify-center relative overflow-hidden group shadow-lg">
                        {playlist.videos?.[0] ? (
                            <img 
                                src={playlist.videos[0].thumbnail?.thumbnailURL || playlist.videos[0].thumbnail} 
                                className="w-full h-full object-cover opacity-50"
                                alt=""
                            />
                        ) : (
                            <FiFolder className="text-6xl text-gray-600" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                             <FiFolder className="text-4xl text-white/50" />
                        </div>
                    </div>

                    {!isEditing ? (
                        <>
                            <div className="flex items-center justify-between mb-2">
                                <h1 className="text-2xl font-bold text-white leading-tight overflow-hidden break-words">{playlist.name}</h1>
                                <div className="flex gap-2">
                                    <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all"><FiEdit2 /></button>
                                    <button onClick={handleDelete} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-red-500 transition-all"><FiTrash2 /></button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 mb-8 whitespace-pre-wrap">{playlist.description || 'No description'}</p>
                        </>
                    ) : (
                        <div className="flex flex-col gap-4 mb-8">
                            <input 
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="bg-[#0f0f0f] border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none text-xl font-bold transition-all"
                                placeholder="Playlist name"
                            />
                            <textarea 
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                className="bg-[#0f0f0f] border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none h-32 resize-none text-sm transition-all"
                                placeholder="Description"
                            />
                            <div className="flex gap-2">
                                <button onClick={handleUpdate} disabled={updateLoading} className="flex-1 bg-white text-black font-bold py-2 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                                    {updateLoading ? 'Saving...' : <><FiCheck /> Save</>}
                                </button>
                                <button onClick={() => setIsEditing(false)} className="px-4 bg-[#1f1f1f] text-gray-400 py-2 rounded-lg hover:text-white transition-all"><FiX /></button>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-4 text-xs font-bold text-gray-500 border-t border-gray-800 pt-8 mt-auto">
                        <div className="flex items-center gap-3">
                            <FiVideo className="text-lg" /> {playlist.videos?.length || 0} videos
                        </div>
                        <div className="flex items-center gap-3">
                            <FiClock className="text-lg" /> Updated {formatDistanceToNow(new Date(playlist.updatedAt))} ago
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button className="flex-1 bg-white/10 backdrop-blur-md text-white font-bold py-3 rounded-full hover:bg-white/20 transition-all flex items-center justify-center gap-2 shadow-xl border border-white/5">
                            <FiPlay /> Play all
                        </button>
                    </div>
                </div>
            </div>

            {/* Right side: Video List */}
            <div className="flex-1">
                <div className="flex flex-col gap-4">
                    {playlist.videos?.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-3xl text-gray-500 italic flex flex-col items-center">
                            <FiVideo className="text-4xl mb-4 text-gray-700" />
                            This playlist is empty.
                        </div>
                    ) : (
                        playlist.videos.map((video, index) => (
                            <div key={video._id} className="flex gap-4 p-3 rounded-2xl hover:bg-[#121212] transition-colors group relative border border-transparent hover:border-gray-800">
                                <span className="text-gray-600 self-center w-8 text-center font-bold">{index + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="w-full">
                                        <div onClick={(e) => e.preventDefault()} className="pointer-events-auto">
                                             <VideoCard video={video} />
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleRemoveVideo(video._id)}
                                    className="absolute top-4 right-4 p-2.5 bg-black/60 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 hover:bg-black transition-all opacity-0 group-hover:opacity-100 shadow-2xl z-10"
                                    title="Remove from playlist"
                                >
                                    <FiTrash2 className="text-lg" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlaylistDetail;
