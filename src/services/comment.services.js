import api from './api';

export const getVideoCommentsService = async (videoId, page = 1, limit = 10) => {
    const response = await api.get(`/comments/v/${videoId}?page=${page}&limit=${limit}`);
    return response.data;
};

export const addCommentService = async (videoId, content) => {
    const response = await api.post(`/comments/v/${videoId}`, { content });
    return response.data;
};

export const updateCommentService = async (commentId, content) => {
    const response = await api.patch(`/comments/c/${commentId}`, { content });
    return response.data;
};

export const deleteCommentService = async (commentId) => {
    const response = await api.delete(`/comments/c/${commentId}`);
    return response.data;
};
