import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Navbar from '../components/Navbar';
import { UserPlus } from 'lucide-react';
import { signup } from '../utils/api'; // path thora project ke hisaab se adjust kar lena


const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

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

  // const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setError('');
  //   setSuccess('');
    
  //   if (!validateForm()) {
  //     return;
  //   }
    
  //   setIsLoading(true);
    
  //   try {
  //     // API call to your backend should replace this.
  //     // Example API call:
  //     // const response = await api.signup({ username, password });
  //     await new Promise(resolve => setTimeout(resolve, 1000)); // simulate API call
      
  //     setSuccess('Account created successfully! Redirecting to login...');
      
  //     // Redirect to login page after signup
  //     setTimeout(() => {
  //       setUsername('');
  //       setPassword('');
  //       setConfirmPassword('');
  //       navigate('/login');
  //     }, 2000);
  //   } catch (err) {
  //     console.error('Signup error:', err);
  //     setError('Signup failed. Please try again.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
  
    if (!validateForm()) {
      return;
    }
  
    setIsLoading(true);
  
    try {
      console.log("Submitting signup request...");
      await signup(username, password); // ← API call to backend
      console.log("Signup successful!");
  
      setSuccess('Account created successfully! Redirecting to login...');
      
      setTimeout(() => {
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Signup error:', err);
  
      // Now, we handle the error message thrown by signup function
      if (err.message) {
        console.log("Error Message:", err.message);
  
        // Check if the error contains "Username already taken"
        if (err.message.includes('Username already taken')) {
          setError('Username already taken. Please choose another one.');
        } else if (err.message.includes('User already exists')) {
          setError('This username is already registered. Please try a different one.');
        } else {
          // General error message (fallback)
          setError(`Signup failed: ${err.message || 'Please try again.'}`);
        }
      } else {
        // General error handling (e.g., network issues)
        setError('Signup failed. Please try again.');
      }
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
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create an account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Or{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                sign in to your account
              </Link>
            </p>
          </div>
          
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          {success && <Alert type="success" message={success} />}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                Create Account
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      <footer className="mt-8 py-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} ImageLab. All rights reserved.
      </footer>
    </div>
  );
};

export default Signup;
