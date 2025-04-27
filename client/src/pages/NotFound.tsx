import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto h-24 w-24 rounded-full bg-yellow-100 flex items-center justify-center">
            <AlertTriangle className="h-12 w-12 text-yellow-600" />
          </div>
          
          <h1 className="mt-6 text-4xl font-extrabold text-gray-900">Page Not Found</h1>
          <p className="mt-3 text-lg text-gray-600">
            Sorry, we couldn't find the page you're looking for.
          </p>
          
          <div className="mt-8">
            <Link to="/">
              <Button>
                Go back home
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <footer className="mt-8 py-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} ImageLab. All rights reserved.
      </footer>
    </div>
  );
};

export default NotFound;