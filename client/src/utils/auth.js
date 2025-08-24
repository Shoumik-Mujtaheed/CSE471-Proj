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
    console.log("getUserRole - userData from localStorage:", userData); // DEBUG
    
    if (userData) {
      const user = JSON.parse(userData);
      console.log("getUserRole - parsed user:", user); // DEBUG
      console.log("getUserRole - user.role:", user.role); // DEBUG
      return user.role;
    }
    console.log("getUserRole - no userData found"); // DEBUG
    return null;
  } catch (error) {
    console.error("getUserRole - parsing error:", error); // DEBUG
    return null;
  }
};
