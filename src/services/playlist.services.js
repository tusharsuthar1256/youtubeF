import api from './api';

export const getUserPlaylistsService = async (userId) => {
    const response = await api.get(`/playlist/user/${userId}`);
    return response.data;
};

export const getPlaylistByIDService = async (playlistId) => {
    const response = await api.get(`/playlist/${playlistId}`);
    return response.data;
};

export const createPlaylistService = async (data) => {
    const response = await api.post('/playlist', data);
    return response.data;
};

export const deletePlaylistService = async (playlistId) => {
    const response = await api.delete(`/playlist/${playlistId}`);
    return response.data;
};

export const updatePlaylistService = async (playlistId, data) => {
    const response = await api.put(`/playlist/${playlistId}`, data);
    return response.data;
};

export const addVideosToPlaylistService = async (playlistId, videoId) => {
    const response = await api.post(`/playlist/add/${playlistId}/${videoId}`);
    return response.data;
};

export const removeVideoFromPlaylistService = async (playlistId, videoId) => {
    const response = await api.delete(`/playlist/remove/${playlistId}/${videoId}`);
    return response.data;
};
