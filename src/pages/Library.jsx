import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserPlaylistsService } from '../services/playlist.services';
import { getWatchHistoryService } from '../services/auth.services';
import { getLikedVideosService } from '../services/like.services';
import VideoCard from '../components/VideoCard';
import { useAuth } from '../hooks/useAuth';
import { FiFolder, FiClock, FiThumbsUp, FiArrowRight } from 'react-icons/fi';

const Library = () => {
    const { userData } = useAuth();
    const [history, setHistory] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [likedVideos, setLikedVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData?._id) return;

        const fetchLibraryData = async () => {
            try {
                const [historyRes, playlistsRes, likedRes] = await Promise.allSettled([
                    getWatchHistoryService(),
                    getUserPlaylistsService(userData._id),
                    getLikedVideosService()
                ]);

                if (historyRes.status === 'fulfilled' && historyRes.value.success) {
                    setHistory(historyRes.value.data.slice(0, 8));
                }
                if (playlistsRes.status === 'fulfilled' && playlistsRes.value.success) {
                    setPlaylists(playlistsRes.value.data);
                }
                if (likedRes.status === 'fulfilled' && likedRes.value.success) {
                    setLikedVideos(likedRes.value.data.slice(0, 8));
                }
            } catch (error) {
                console.error('Error fetching library data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLibraryData();
    }, [userData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1280px] mx-auto p-4 md:p-8 flex flex-col gap-12">
            {/* History Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3 text-white">
                        <FiClock className="text-2xl" />
                        <h2 className="text-xl font-bold">History</h2>
                    </div>
                    <Link to="/history" className="text-blue-500 hover:text-blue-400 font-bold text-sm flex items-center gap-1">
                        See all <FiArrowRight />
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {history.map(video => <VideoCard key={video._id} video={video} />)}
                    {history.length === 0 && <p className="text-gray-500 italic px-2">No watch history yet.</p>}
                </div>
            </section>

            {/* Playlists Section */}
            <section>
                <div className="flex items-center justify-between mb-6 border-t border-gray-800 pt-10">
                    <div className="flex items-center gap-3 text-white">
                        <FiFolder className="text-2xl" />
                        <h2 className="text-xl font-bold">Playlists</h2>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {playlists.map(playlist => (
                        <Link key={playlist._id} to={`/playlist/${playlist._id}`} className="group">
                            <div className="aspect-video bg-[#1f1f1f] rounded-xl overflow-hidden border border-gray-800 flex items-center justify-center relative mb-3">
                                <FiFolder className="text-4xl text-gray-600 group-hover:scale-110 transition-transform" />
                                <div className="absolute top-0 right-0 bottom-0 w-1/3 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                                    <span className="text-xl font-bold text-white">{playlist.videos?.length || 0}</span>
                                    <span className="text-[10px] text-gray-300">VIDEOS</span>
                                </div>
                            </div>
                            <h3 className="font-bold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">{playlist.name}</h3>
                        </Link>
                    ))}
                    {playlists.length === 0 && <p className="text-gray-500 italic px-2">No playlists created.</p>}
                </div>
            </section>

            {/* Liked Videos Section */}
            <section>
                <div className="flex items-center justify-between mb-6 border-t border-gray-800 pt-10">
                    <div className="flex items-center gap-3 text-white">
                        <FiThumbsUp className="text-2xl" />
                        <h2 className="text-xl font-bold">Liked videos</h2>
                    </div>
                    <Link to="/liked" className="text-blue-500 hover:text-blue-400 font-bold text-sm flex items-center gap-1">
                        See all <FiArrowRight />
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {likedVideos.map(item => <VideoCard key={item._id} video={item.video || item} />)}
                    {likedVideos.length === 0 && <p className="text-gray-500 italic px-2">No liked videos yet.</p>}
                </div>
            </section>
        </div>
    );
};

export default Library;
