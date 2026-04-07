import api from './api';

export const toggleSubscriptionService = async (channelId) => {
    const response = await api.post(`/subscriptions/c/${channelId}`);
    return response.data;
};

export const getSubscribedChannelsService = async (subscriberId) => {
    const response = await api.get(`/subscriptions/u/${subscriberId}`);
    return response.data;
};

export const getUserChannelSubscribersService = async (channelId) => {
    const response = await api.get(`/subscriptions/c/${channelId}`);
    return response.data;
};
