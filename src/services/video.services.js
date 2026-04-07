import api from './api';

export const getAllVideosService = async (params = {}) => {
    // params can include page, limit, query, sortBy, sortType, userId
    const response = await api.get('/videos', { params });
    return response.data;
};

export const getVideoByIdService = async (videoId) => {
    const response = await api.get(`/videos/${videoId}`);
    return response.data;
};

export const publishVideoService = async (formData, onUploadProgress) => {
    const response = await api.post('/videos', formData, {
        onUploadProgress,
    });
    return response.data;
};

export const updateVideoService = async (videoId, formData) => {
    const response = await api.patch(`/videos/${videoId}`, formData);
    return response.data;
};

export const deleteVideoService = async (videoId) => {
    const response = await api.delete(`/videos/${videoId}`);
    return response.data;
};

// other services can be added based on the requirements (tweets, subscriptions)
