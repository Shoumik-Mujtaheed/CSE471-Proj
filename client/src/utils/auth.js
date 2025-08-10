// client/src/utils/auth.js

export const isAdminLoggedIn = () => {
  return !!localStorage.getItem('adminToken');
};

export const isUserLoggedIn = () => {
  return !!localStorage.getItem('userToken');
};

export const logoutAdmin = () => {
  localStorage.removeItem('adminToken');
};

export const logoutUser = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userData');
};

// Add this new function for role-based routing
export const getUserRole = () => {
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      return user.role;
    }
    return null;
  } catch {
    return null;
  }
};
