import api from './api';

export const getUserTweetsService = async (userId) => {
    // There is no explicit getUserTweets in their tweet.route.js setup!
    // But standard is /tweets/user/:userId
    const response = await api.get(`/tweets/user/${userId}`);
    return response.data;
};

export const createTweetService = async (content) => {
    const response = await api.post('/tweets', { content });
    return response.data;
};
