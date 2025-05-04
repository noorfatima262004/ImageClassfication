// Login.tsx
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Navbar from '../components/Navbar';
import { Lock } from 'lucide-react';
import { login } from '../utils/api'; // path should be adjusted


const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [accountLocked, setAccountLocked] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState<number | null>(null);

  const { login: loginToContext } = useAuth(); // Use login function from AuthContext
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => { 
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both Email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await login(username, password);
      console.log('Response status:', response.status);

      if (response.ok) {
        // Successful login
        console.log('Login successful');
        loginToContext('cookie', username);
        navigate('/dashboard');
      } else {
        const data = await response.json();
        
        if (response.status === 403 && data.locked) {
          // Account locked
          setAccountLocked(true);
          setLockoutRemaining(data.lockout_remaining || null);
          setError(data.message || 'Your account has been temporarily locked due to too many failed attempts.');
        } else if (response.status === 401 && data.remaining_attempts !== undefined) {
          // Invalid password with remaining attempts
          setRemainingAttempts(data.remaining_attempts);
          setError(data.message || `Invalid password. ${data.remaining_attempts} attempts remaining before account lockout.`);
        } else {
          // Other error
          setError(data.message || 'Login failed. Please check your credentials and try again.');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <Lock className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Or{' '}
              <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                create a new account
              </Link>
            </p>
          </div>

          {/* Display error message with appropriate styling */}
          {error && (
            <Alert 
              type={accountLocked ? "warning" : remainingAttempts === 1 ? "error" : "info"} 
              message={error} 
              onClose={() => setError('')} 
            />
          )}

          {/* Countdown timer if account is locked */}
          {accountLocked && lockoutRemaining && (
            <div className="text-center p-3 bg-yellow-50 border border-yellow-100 rounded-md">
              <p className="text-yellow-800">
                Account locked for <span className="font-bold">{lockoutRemaining} minutes</span>
              </p>
              <p className="text-sm text-yellow-600 mt-1">
                Please try again later or contact support.
              </p>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <FormInput
                id="username"
                label="Email"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your Email"
                disabled={accountLocked}
              />
              <FormInput
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={accountLocked}
              />
            </div>

            <div>
              <Button 
                type="submit" 
                fullWidth 
                isLoading={isLoading}
                disabled={accountLocked}
              >
                Sign in
              </Button>
            </div>
            
            {remainingAttempts === 1 && !accountLocked && (
              <div className="text-center mt-2">
                <p className="text-sm font-medium text-red-600">
                  Warning: Last attempt before account lockout!
                </p>
              </div>
            )}
            
            {accountLocked && (
              <div className="text-center mt-2">
                <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot your password?
                </Link>
              </div>
            )}
          </form>
        </div>
      </div>

      <footer className="mt-8 py-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} ImageLab. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;



