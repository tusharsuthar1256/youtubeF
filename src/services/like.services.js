import api from './api';

export const getLikedVideosService = async () => {
    // According to standard ChaiAurCode, likes router has an endpoint for liked videos
    const response = await api.get('/like/videos');
    return response.data;
};

export const toggleVideoLikeService = async (videoId) => {
    const response = await api.post(`/like/toggle/v/${videoId}`);
    return response.data;
};
