import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getAllVideosService } from '../services/video.services';
import { searchUsersService } from '../services/auth.services';
import { formatDistanceToNow } from 'date-fns';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [videos, setVideos] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const [videoRes, channelRes] = await Promise.all([
          getAllVideosService({ query, limit: 10 }),
          searchUsersService(query)
        ]);

        if (videoRes.success) {
          setVideos(videoRes.data.videos || videoRes.data.docs || videoRes.data);
        }
        if (channelRes.success) {
          setChannels(channelRes.data);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSearchResults();
  }, [query]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  const noResults = videos.length === 0 && channels.length === 0;

  return (
    <div className="max-w-[1000px] mx-auto p-4 md:p-8 flex flex-col gap-6">
      <h1 className="text-xl font-semibold mb-4 text-white">
        Search results for "{query}"
      </h1>
      
      {noResults ? (
        <div className="text-gray-400 text-center py-10 border border-gray-800 rounded-xl">
          <p className="text-xl mb-2">No results found</p>
          <p className="text-sm">Try different keywords or remove search filters</p>
        </div>
      ) : (
        <>
          {/* Channels Section */}
          {channels.length > 0 && (
            <div className="flex flex-col gap-4 border-b border-gray-800 pb-8">
              <h2 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Channels</h2>
              {channels.map((channel) => (
                <div key={channel._id} className="flex items-center justify-between gap-4 p-4 hover:bg-[#1f1f1f] rounded-2xl transition-all group">
                   <div className="flex items-center gap-6">
                      <Link to={`/profile/${channel.username}`}>
                        <img 
                          src={channel.avatar || 'https://via.placeholder.com/100'} 
                          className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover shadow-lg border-2 border-gray-800 group-hover:border-blue-500 transition-all" 
                          alt="" 
                        />
                      </Link>
                      <div className="flex flex-col">
                        <Link to={`/profile/${channel.username}`} className="text-lg md:text-xl font-bold text-white hover:text-blue-400 transition-colors">
                          {channel.fullName}
                        </Link>
                        <span className="text-sm text-gray-400">@{channel.username}</span>
                      </div>
                   </div>
                   <Link 
                     to={`/profile/${channel.username}`}
                     className="bg-white text-black font-bold px-6 py-2 rounded-full hover:bg-gray-200 transition-all"
                   >
                      View Channel
                   </Link>
                </div>
              ))}
            </div>
          )}

          {/* Videos Section */}
          {videos.length > 0 && (
            <div className="flex flex-col gap-6 mt-4">
               {channels.length > 0 && <h2 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Videos</h2>}
               {videos.map((video) => (
                <div key={video._id} className="flex flex-col sm:flex-row gap-4 group">
                  <Link
                    to={`/watch/${video._id}`}
                    className="relative sm:w-[360px] flex-shrink-0 aspect-video rounded-xl overflow-hidden bg-gray-800"
                  >
                    <img
                      src={video.thumbnail?.thumbnailURL || video.thumbnail || 'https://via.placeholder.com/640x360'}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {video.duration && (
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium tracking-wide">
                        {Math.floor(video.duration / 60)}:
                        {Math.floor(video.duration % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                  </Link>
                  <div className="flex flex-col flex-1 py-1">
                    <Link to={`/watch/${video._id}`}>
                      <h3 className="text-lg md:text-xl font-normal text-white line-clamp-2 md:w-3/4 group-hover:text-blue-400 transition-colors">
                        {video.title}
                      </h3>
                    </Link>
                    <div className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                      <span>{video.views || 0} views</span>
                      <span className="text-[10px]">•</span>
                      <span>
                        {video.createdAt ? formatDistanceToNow(new Date(video.createdAt), { addSuffix: true }) : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-sm text-gray-400 hover:text-white transition-colors">
                      <Link to={`/profile/${video.owner?.username}`}>
                        <img
                          src={video.owner?.avatar || 'https://via.placeholder.com/48'}
                          alt={video.owner?.username}
                          className="w-7 h-7 rounded-full object-cover border border-gray-700"
                        />
                      </Link>
                      <Link to={`/profile/${video.owner?.username}`}>{video.owner?.username || 'User Channel'}</Link>
                    </div>
                    <p className="text-xs text-gray-400 mt-4 line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  </div>
                </div>
               ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Search;
