import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export const useAuth = (userType) => {
  const navigate = useNavigate();
  
  const checkAuth = useCallback(() => {
    let token;
    let loginPath;
    
    switch (userType) {
      case 'admin':
        token = localStorage.getItem('adminToken');
        loginPath = '/admin-login';
        break;
      case 'staff':
        token = localStorage.getItem('staffToken');
        loginPath = '/staff-login';
        break;
      case 'doctor':
      case 'patient':
      default:
        token = localStorage.getItem('userToken');
        loginPath = '/login';
        break;
    }
    
    if (!token) {
      navigate(loginPath);
      return false;
    }
    return true;
  }, [userType, navigate]);
  
  const logout = useCallback(() => {
    let tokenKey;
    
    switch (userType) {
      case 'admin':
        tokenKey = 'adminToken';
        break;
      case 'staff':
        tokenKey = 'staffToken';
        break;
      case 'doctor':
      case 'patient':
      default:
        tokenKey = 'userToken';
        break;
    }
    
    localStorage.removeItem(tokenKey);
    navigate('/');
  }, [userType, navigate]);
  
  return { checkAuth, logout };
};
