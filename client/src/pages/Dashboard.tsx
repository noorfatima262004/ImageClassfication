import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { uploadImage } from '../utils/api';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { Upload, Image as ImageIcon, Check, X, Globe, Shield, Code, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { token, username } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [prediction, setPrediction] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    setUploadSuccess('');
    setPrediction(null);

    const files = e.target.files;
    if (!files || files.length === 0) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    const file = files[0];
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please select a valid image file (JPG or PNG)');
      setSelectedFile(null);
      setPreviewUrl(null);
      e.target.value = '';
      return;
    }

    // Validate file size
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('Image size should be less than 2MB');
      setSelectedFile(null);
      setPreviewUrl(null);
      e.target.value = '';
      return;
    }

    setSelectedFile(file);

    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select an image to upload');
      return;
    }
  
    const maxSize = 2 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setUploadError('File is too large. Max size is 2MB');
      return;
    }
  
    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');
  
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
  
      const data = await uploadImage(formData);
      if (!data || !data.predicted_class_name) {
        throw new Error('Invalid response from server');
      }
      setUploadSuccess('Image uploaded successfully!');
      setPrediction(data.predicted_class_name);
      
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };
  
  useEffect(() => {
    console.log("Fetching user data...");
    fetch("http://localhost:5000/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        console.log("User data:", data);
        if (!data.user) navigate("/login");
        else setUser(data.user);
      });
  }, []);
  
  const resetUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPrediction(null);
    setUploadError('');
    setUploadSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      <Navbar />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 container mx-auto px-4 py-8"
      >
        <div className="max-w-4xl mx-auto">
          {/* Main Upload Card */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <motion.h1 
                  initial={{ x: -10 }}
                  animate={{ x: 0 }}
                  className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent"
                >
                  Image Upload & Analysis
                </motion.h1>
              </div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-gray-600 mb-6"
              >
                Welcome, <span className="font-medium text-indigo-600">{username}</span>! Upload an image below to get predictions.
              </motion.p>
              
              <AnimatePresence>
                {uploadError && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Alert 
                      type="error" 
                      message={uploadError} 
                      onClose={() => setUploadError('')} 
                    />
                  </motion.div>
                )}
                
                {uploadSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Alert 
                      type="success" 
                      message={uploadSuccess} 
                      onClose={() => setUploadSuccess('')} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="mt-6">
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className={`border-2 border-dashed rounded-xl p-8 ${
                    previewUrl ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                  } transition-all duration-300 ease-in-out`}
                >
                  {!previewUrl ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center"
                    >
                      <ImageIcon className="mx-auto h-14 w-14 text-gray-400 mb-4" />
                      <div className="mt-4 flex text-sm text-gray-600 justify-center">
                        <label 
                          htmlFor="file-upload" 
                          className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none transition-colors duration-200"
                        >
                          <span className="text-lg">Upload an image</span>
                          <input 
                            id="file-upload" 
                            ref={fileInputRef}
                            name="file-upload" 
                            type="file" 
                            className="sr-only" 
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-2 text-gray-500">or drag and drop</p>
                      </div>
                      <p className="text-sm text-gray-500 mt-3">
                        PNG, JPG up to 2MB
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {selectedFile?.name}
                        </div>
                        <button 
                          onClick={resetUpload}
                          className="ml-2 bg-white rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none transition-colors hover:bg-gray-100"
                        >
                          <span className="sr-only">Remove</span>
                          <X size={18} />
                        </button>
                      </div>
                      <div className="flex justify-center">
                        <motion.img 
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                          src={previewUrl} 
                          alt="Preview" 
                          className="max-h-72 max-w-full object-contain rounded-lg shadow-sm border border-gray-200" 
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 flex justify-center"
                >
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                    isLoading={isUploading}
                    className="px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all hover:bg-indigo-700 bg-gradient-to-r from-indigo-600 to-blue-600"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    <span className="font-medium">Upload and Analyze</span>
                  </Button>
                </motion.div>
              </div>
              
              <AnimatePresence>
                {prediction && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl shadow-inner"
                  >
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <Check className="mr-2 h-5 w-5 text-green-500" />
                      Analysis Result
                    </h3>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mt-3 text-gray-700 font-medium text-lg bg-white p-3 rounded-lg shadow-sm border border-gray-200"
                    >
                      {prediction}
                    </motion.p>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                      className="mt-4 h-1.5 bg-gradient-to-r from-indigo-300 to-blue-300 rounded-full"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* How It Works Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8 bg-white rounded-xl shadow-xl overflow-hidden p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200 flex items-center">
              <Globe className="mr-2 text-indigo-600" size={24} />
              How It Works
            </h2>
            <ol className="list-decimal pl-6 space-y-5 text-gray-700">
              <motion.li 
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg leading-relaxed"
              >
                <span className="font-semibold text-indigo-600">Upload an image</span> using the form above
              </motion.li>
              <motion.li 
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.6 }}
                className="text-lg leading-relaxed"
              >
                <span className="font-semibold text-indigo-600">Our system will analyze</span> the image using AI technology
              </motion.li>
              <motion.li 
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.7 }}
                className="text-lg leading-relaxed"
              >
                <span className="font-semibold text-indigo-600">View the predictions</span> and detailed results
              </motion.li>
            </ol>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100"
            >
              <div className="flex items-start">
                <Shield className="flex-shrink-0 mt-1 mr-3 text-indigo-600" size={18} />
                <p className="text-gray-600">
                  This system uses <span className="font-medium text-indigo-600">advanced machine learning algorithms</span> to analyze and classify images with high accuracy.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 py-6 bg-white border-t border-gray-200"
      >
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} ImageLab. All rights reserved.
          </p>
        </div>
      </motion.footer>
    </div>
  );
};

export default Dashboard;