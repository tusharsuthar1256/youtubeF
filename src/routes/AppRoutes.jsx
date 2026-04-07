import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import ProtectedRoute from './ProtectedRoute';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import VideoDetail from '../pages/VideoDetail';
import UploadVideo from '../pages/UploadVideo';
import Profile from '../pages/Profile';
import Search from '../pages/Search';
import History from '../pages/History';
import LikedVideos from '../pages/LikedVideos';
import Subscriptions from '../pages/Subscriptions';
import Playlists from '../pages/Playlists';
import PlaylistDetail from '../pages/PlaylistDetail';
import Library from '../pages/Library';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/" element={<Layout />}>
                {/* Public Routes inside Layout */}
                <Route index element={<Home />} />
                <Route path="/watch/:videoId" element={<VideoDetail />} />
                <Route path="/search" element={<Search />} />
                <Route path="/profile/:username" element={<Profile />} />
                <Route path="/playlist/:playlistId" element={<PlaylistDetail />} />

                {/* Protected Routes inside Layout */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/upload" element={<UploadVideo />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/playlist" element={<Playlists />} />
                    <Route path="/library" element={<Library />} />
                    <Route path="/liked" element={<LikedVideos />} />
                    <Route path="/subscriptions" element={<Subscriptions />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default AppRoutes;
