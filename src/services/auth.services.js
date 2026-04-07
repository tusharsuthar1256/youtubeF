import api from './api';

export const registerUserService = async (formData) => {
    const response = await api.post('/users/register', formData);
    return response.data;
};

export const loginUserService = async (usernameOrEmail, password) => {
    const response = await api.post('/users/login', {
        email: usernameOrEmail, // The backend handles email or username as one or both, usually username or email
        password,
        username: usernameOrEmail // In case it checks username
    });
    return response.data;
};

export const logoutUserService = async () => {
    const response = await api.post('/users/logout');
    return response.data;
};

export const getCurrentUserService = async () => {
    const response = await api.get('/users/current-user');
    return response.data;
};

export const getUserChannelProfileService = async (username) => {
    const response = await api.get(`/users/c/${username}`);
    return response.data;
};

export const getWatchHistoryService = async () => {
    const response = await api.get('/users/watchHistory');
    return response.data;
};

export const updateAccountDetailsService = async (data) => {
    const response = await api.patch('/users/update-account', data);
    return response.data;
};

export const updateUserAvatarService = async (formData) => {
    const response = await api.patch('/users/avatar', formData);
    return response.data;
};

export const updateUserCoverImageService = async (formData) => {
    const response = await api.patch('/users/cover-image', formData);
    return response.data;
};

export const searchUsersService = async (query) => {
    const response = await api.get(`/users/search?query=${query}`);
    return response.data;
};
