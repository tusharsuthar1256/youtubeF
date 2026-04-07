import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const VideoCard = ({ video }) => {
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    // If the click was on a link, let the link handle it
    if (e.target.closest('a')) return;
    navigate(`/watch/${video._id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="flex flex-col gap-2 group cursor-pointer"
    >
      <div className="relative w-full rounded-xl overflow-hidden aspect-video bg-gray-800">
        <Link to={`/watch/${video._id}`}>
          <img
            src={video.thumbnail?.thumbnailURL || video.thumbnail || 'https://via.placeholder.com/640x360'}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {video.duration && (
            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
              {Math.floor(video.duration / 60)}:{Math.floor(video.duration % 60).toString().padStart(2, '0')}
            </span>
          )}
        </Link>
      </div>

      <div className="flex gap-3 mt-1">
        <Link to={`/profile/${video.owner?.username}`}>
          <img
            src={video.owner?.avatar || 'https://via.placeholder.com/40'}
            alt={video.owner?.username}
            className="w-9 h-9 rounded-full object-cover"
          />
        </Link>
        <div className="flex flex-col overflow-hidden">
          <Link to={`/watch/${video._id}`}>
            <h3 className="text-white font-medium text-sm line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
              {video.title}
            </h3>
          </Link>
          <Link
            to={`/profile/${video.owner?.username}`}
            className="text-gray-400 text-sm mt-1 hover:text-white transition-colors"
          >
            {video.owner?.username || 'User'}
          </Link>
          <div className="text-gray-400 text-xs flex items-center gap-1">
            <span>{video.views || 0} views</span>
            <span className="text-[10px]">•</span>
            <span>
              {video.createdAt ? formatDistanceToNow(new Date(video.createdAt), { addSuffix: true }) : 'Some time ago'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
