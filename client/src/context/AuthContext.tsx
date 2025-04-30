// AuthContext.tsx
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { handleLogout } from '../utils/api'; // Assuming ye file path hai
interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  username: string | null;
  login: (token: string, username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);


  useEffect(() => {
    const token = Cookies.get('token');
    const storedUsername = sessionStorage.getItem('username');
  
    if (token && storedUsername) {
      setToken(token);
      setUsername(storedUsername);
      setIsAuthenticated(true);
    }
  }, []);
  

  // const login = (newToken: string, newUsername: string) => {
  //   sessionStorage.setItem('username', newUsername);
  //   setToken(newToken);
  //   setUsername(newUsername);
  //   setIsAuthenticated(true);
  // };

  const login = (newToken: string, newUsername: string) => {
    sessionStorage.setItem('username', newUsername);
    Cookies.set('token', newToken); // 🛑 ADD THIS LINE
    setToken(newToken);
    console.log('Cookie set successfully Auth', newToken); // 🛑 ADD THIS LINE
    setUsername(newUsername);
    console.log('Username set successfully Auth', newUsername); // 🛑 ADD THIS LINE
    setIsAuthenticated(true);
  };
  

  // const logout = () => {
  //   sessionStorage.removeItem('token');
  //   sessionStorage.removeItem('username');
  //   setToken(null);
  //   setUsername(null);
  //   setIsAuthenticated(false);
  // };

  // const logout = () => {

  //   console.log('Cookie removed successfully Auth', token ); // 🛑 ADD THIS LINE
  //   Cookies.remove('token'); // 🛑 Remove token from cookie
  //   sessionStorage.removeItem('username');
  //   console.log('Cookie removed successfully Auth', token ); // 🛑 ADD THIS LINE
  //   setToken(null);
  //   setUsername(null);
  //   setIsAuthenticated(false);
  // };

  const logout = async () => {
    const result = await handleLogout();  // server se logout API call karo
    
    if (result) {
      sessionStorage.removeItem('username');
      console.log('Cookie removed successfully Auth', token);
  
      setIsAuthenticated(false);
      setToken(null);
      setUsername(null);
  
      // ✅ Ab user ko redirect karo login page pe
      // window.location.href = '/login';
    } else {
      console.error('Logout failed, please try again.');
    }
  };
  
  
  
  const value = {
    isAuthenticated,
    token,
    username,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
