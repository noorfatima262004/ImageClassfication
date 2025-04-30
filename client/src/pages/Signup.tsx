import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Navbar from '../components/Navbar';
import { UserPlus } from 'lucide-react';
import { signup } from '../utils/api'; // Adjust path if needed

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<'signup' | 'verify-otp'>('signup');
  const [timeLeft, setTimeLeft] = useState(60);

  const navigate = useNavigate();
  const API_URL = 'http://localhost:5000'; // Replace with your actual API URL
  // Timer countdown for OTP
  useEffect(() => {
    if (step === 'verify-otp' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeft]);

  const validateForm = () => {
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    
    if (!password.trim()) {
      setError('Password is required');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    // Optional: Add additional validation like checking for password strength, etc.
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/; // example pattern
    if (!passwordPattern.test(password)) {
      setError('Password must contain at least one letter and one number');
      return false;
    }
    
    return true;
  };

  // Handle sending OTP
  const handleSendOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
  
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Error response:', errorData, res);
        throw new Error(errorData.error || 'Failed to send OTP');
      }

      setStep('verify-otp');
      setTimeLeft(60); // Reset timer
      setSuccess('OTP sent to your email!');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, otp }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Invalid OTP');
      }

      // If OTP verified, now create account
      await signup(username, password);

      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
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
              <UserPlus className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {step === 'signup' ? 'Create an account' : 'Verify OTP'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {step === 'signup' ? (
                <>Or{' '}
                  <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                    sign in to your account
                  </Link>
                </>
              ) : (
                <span>Enter the OTP sent to your email</span>
              )}
            </p>
          </div>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          {success && <Alert type="success" message={success} />}
          
          {/* Signup Form */}
          {step === 'signup' && (
            <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
              <div className="rounded-md shadow-sm space-y-4">
                <FormInput
                  id="username"
                  label="Username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                />
                
                <FormInput
                  id="password"
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                />
                
                <FormInput
                  id="confirm-password"
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                />
              </div>

              <div>
                <Button 
                  type="submit" 
                  fullWidth 
                  isLoading={isLoading}
                >
                  Send OTP
                </Button>
              </div>
            </form>
          )}

          {/* OTP Verification Form */}
          {step === 'verify-otp' && (
            <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
              <div className="rounded-md shadow-sm space-y-4">
                <FormInput
                  id="otp"
                  label={`Enter OTP (expires in ${timeLeft}s)`}
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP received"
                />
              </div>

              <div>
                <Button 
                  type="submit" 
                  fullWidth 
                  isLoading={isLoading}
                >
                  Verify OTP
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      <footer className="mt-8 py-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} YourCompany. All rights reserved.
      </footer>
    </div>
  );
};

export default Signup;
