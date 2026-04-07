import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUploadCloud, FiImage, FiVideo } from 'react-icons/fi';
import { publishVideoService } from '../services/video.services';

const UploadVideo = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoFile: null,
    thumbnail: null,
  });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.videoFile || !formData.thumbnail) {
      setError('Please provide all fields, including video and thumbnail.');
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    setError('');

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('videoFile', formData.videoFile);
      data.append('thumbnail', formData.thumbnail);

      const response = await publishVideoService(data, (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (response.success) {
        navigate(`/watch/${response.data._id || response.data.video._id || response.data}`);
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to upload video');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-[#1f1f1f] p-8 rounded-2xl shadow-lg border border-gray-800 text-white">
      <div className="flex items-center gap-4 mb-6 border-b border-gray-800 pb-4">
        <div className="bg-[#272727] p-3 rounded-full">
          <FiUploadCloud className="text-2xl text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Video</h1>
      </div>

      {error && <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-4 rounded-xl">{error}</div>}

      <form onSubmit={handleUpload} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-300">Title (required)</label>
          <input
            type="text"
            className="bg-[#272727] border border-gray-600 rounded-lg p-3 outline-none focus:border-blue-400 transition-colors"
            placeholder="Add a title that describes your video"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-300">Description (required)</label>
          <textarea
            className="bg-[#272727] border border-gray-600 rounded-lg p-3 outline-none focus:border-blue-400 transition-colors h-32 resize-none"
            placeholder="Tell viewers about your video"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2 relative">
            <label className="text-sm font-semibold text-gray-300">Video File</label>
            <div className={`border-2 border-dashed ${formData.videoFile ? 'border-blue-400 bg-blue-400/10' : 'border-gray-600 hover:border-blue-400'} rounded-xl p-8 flex flex-col items-center justify-center transition-colors relative`}>
              <FiVideo className={`text-4xl mb-2 ${formData.videoFile ? 'text-blue-400' : 'text-gray-400'}`} />
              <span className="text-sm text-center text-gray-400">
                {formData.videoFile ? formData.videoFile.name : 'Select or drag video'}
              </span>
              <input
                type="file"
                name="videoFile"
                accept="video/*"
                onChange={handleFileChange}
                required
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 relative">
            <label className="text-sm font-semibold text-gray-300">Thumbnail</label>
             <div className={`border-2 border-dashed ${formData.thumbnail ? 'border-blue-400 bg-blue-400/10' : 'border-gray-600 hover:border-blue-400'} rounded-xl p-8 flex flex-col items-center justify-center transition-colors relative`}>
              <FiImage className={`text-4xl mb-2 ${formData.thumbnail ? 'text-blue-400' : 'text-gray-400'}`} />
              <span className="text-sm text-center text-gray-400">
                {formData.thumbnail ? formData.thumbnail.name : 'Select thumbnail'}
              </span>
              <input
                type="file"
                name="thumbnail"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4 pt-4 border-t border-gray-800">
          {loading ? (
            <div className="w-full flex items-center justify-between bg-[#272727] rounded-lg p-4">
              <div className="flex flex-col w-full pr-6">
                 <div className="flex justify-between mb-1">
                   <span className="text-sm font-semibold text-gray-200">
                      {uploadProgress < 100 ? 'Uploading to Server...' : 'Processing on Cloudinary...'}
                   </span>
                   <span className="text-sm text-blue-400 font-bold">{uploadProgress}%</span>
                 </div>
                 <div className="w-full bg-black rounded-full h-2.5 overflow-hidden">
                   <div 
                     className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" 
                     style={{ width: `${uploadProgress}%` }}
                   ></div>
                 </div>
                 {uploadProgress === 100 && (
                   <p className="text-xs text-gray-400 mt-2 italic">Please wait while the video is optimized and published...</p>
                 )}
              </div>
              <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="bg-[#3ea6ff] hover:bg-[#3ea6ff]/80 text-black font-semibold py-2.5 px-8 rounded-sm transition-colors disabled:opacity-50 tracking-wider"
            >
              UPLOAD
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UploadVideo;
