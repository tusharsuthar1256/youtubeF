import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserPlaylistsService, deletePlaylistService } from '../services/playlist.services';
import { useAuth } from '../hooks/useAuth';
import { FiFolder, FiTrash2, FiPlus, FiMoreVertical } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Playlists = () => {
    const { userData } = useAuth();
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData?._id) return;
        fetchPlaylists();
    }, [userData]);

    const fetchPlaylists = async () => {
        try {
            const response = await getUserPlaylistsService(userData._id);
            if (response.success) {
                setPlaylists(response.data);
            }
        } catch (error) {
            console.error('Error fetching playlists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this playlist?")) return;

        try {
            const response = await deletePlaylistService(id);
            if (response.success) {
                toast.success('Playlist deleted successfully');
                setPlaylists(prev => prev.filter(p => p._id !== id));
            }
        } catch (error) {
            toast.error('Failed to delete playlist');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1280px] mx-auto p-4 md:p-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 text-white">
                    <FiFolder className="text-3xl text-blue-500" />
                    <h1 className="text-2xl font-bold font-theme">My Playlists</h1>
                </div>
                {/* You could add a Create Playlist button here if needed */}
            </div>

            {playlists.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-[#121212] border border-dashed border-gray-800 rounded-3xl text-gray-400">
                    <FiFolder className="text-6xl mb-4 text-gray-700" />
                    <p className="text-xl font-medium">No playlists created yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {playlists.map(playlist => (
                        <div key={playlist._id} className="group relative">
                            <Link to={`/playlist/${playlist._id}`} className="block">
                                <div className="aspect-video bg-[#1f1f1f] rounded-2xl overflow-hidden border border-gray-800 flex items-center justify-center relative mb-4 shadow-xl transition-all group-hover:border-blue-500/50 group-hover:scale-[1.02]">
                                    {playlist.videos?.[0] ? (
                                        <img 
                                            src={playlist.videos[0].thumbnail?.thumbnailURL || playlist.videos[0].thumbnail} 
                                            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" 
                                            alt={playlist.name} 
                                        />
                                    ) : (
                                        <div className="bg-gray-900 w-full h-full flex items-center justify-center">
                                            <FiFolder className="text-5xl text-gray-700" />
                                        </div>
                                    )}
                                    
                                    <div className="absolute top-0 right-0 bottom-0 w-2/5 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center border-l border-white/5">
                                        <span className="text-2xl font-bold text-white mb-1">{playlist.videos?.length || 0}</span>
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Videos</span>
                                    </div>
                                    
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="bg-white/10 backdrop-blur-md text-white p-3 rounded-full text-xl shadow-2xl">
                                            <FiFolder />
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 overflow-hidden">
                                        <h3 className="font-bold text-white text-lg truncate group-hover:text-blue-400 transition-colors">{playlist.name}</h3>
                                        <p className="text-xs text-gray-400 font-medium mt-1 truncate">{playlist.description || 'No description'}</p>
                                    </div>
                                    <button 
                                        onClick={(e) => handleDelete(e, playlist._id)}
                                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-800 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                        title="Delete Playlist"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Playlists;
