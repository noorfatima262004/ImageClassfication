import { useState, useRef, ChangeEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { uploadImage } from '../utils/api';  // Import uploadImage function
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { Upload, Image as ImageIcon, Check, X } from 'lucide-react';

const Dashboard = () => {
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
      e.target.value = ''; // Reset the input
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setUploadError('Image size should be less than 5MB');
      setSelectedFile(null);
      setPreviewUrl(null);
      e.target.value = ''; // Reset the input
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

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      // Send image to the backend and receive prediction
      const data = await uploadImage(formData);  // Use the uploadImage function from utils/api.ts
      if (!data || !data.predicted_class_name) {
        throw new Error('Invalid response from server');
      }
      setUploadSuccess('Image uploaded successfully!');
      console.log('Prediction data:', data);  // Debugging line
      setPrediction(data.predicted_class_name);  // Assuming the backend sends 'predicted_class'
      
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Image Upload & Analysis</h1>
              </div>
              
              <p className="text-gray-600 mb-6">
                Welcome, <span className="font-medium">{username}</span>! Upload an image below to get predictions.
              </p>
              
              {uploadError && (
                <Alert 
                  type="error" 
                  message={uploadError} 
                  onClose={() => setUploadError('')} 
                />
              )}
              
              {uploadSuccess && (
                <Alert 
                  type="success" 
                  message={uploadSuccess} 
                  onClose={() => setUploadSuccess('')} 
                />
              )}
              
              <div className="mt-6">
                <div className={`border-2 border-dashed rounded-lg p-6 ${
                  previewUrl ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300 bg-gray-50'
                } transition-colors duration-200 ease-in-out`}>
                  
                  {!previewUrl ? (
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4 flex text-sm text-gray-600 justify-center">
                        <label 
                          htmlFor="file-upload" 
                          className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                        >
                          <span>Upload an image</span>
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
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-medium text-gray-900">
                          {selectedFile?.name}
                        </div>
                        <button 
                          onClick={resetUpload}
                          className="ml-2 bg-white rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                          <span className="sr-only">Remove</span>
                          <X size={16} />
                        </button>
                      </div>
                      <div className="flex justify-center">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="max-h-64 max-w-full object-contain rounded-lg" 
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                    isLoading={isUploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload and Analyze
                  </Button>
                </div>
              </div>
              
              {prediction && (
                <div className="mt-8 p-4 bg-indigo-50 border border-indigo-100 rounded-lg animate-fadeIn">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    Analysis Result
                  </h3>
                  <p className="mt-2 text-gray-700">{prediction}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">How It Works</h2>
            <ol className="list-decimal pl-5 space-y-2 text-gray-700">
              <li>Upload an image using the form above</li>
              <li>Our system will analyze the image</li>
              <li>View the predictions and results</li>
            </ol>
            <p className="mt-4 text-gray-600">
              This system uses advanced machine learning algorithms to analyze and classify images.
            </p>
          </div>
        </div>
      </div>
      
      <footer className="mt-8 py-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} ImageLab. All rights reserved.
      </footer>
    </div>
  );
};

export default Dashboard;
