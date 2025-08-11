// client/src/utils/auth.js

export const isAdminLoggedIn = () => {
  return !!localStorage.getItem('adminToken');
};

export const logoutAdmin = () => {
  localStorage.removeItem('adminToken');
};

export const logoutUser = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userData');
};



// Update your utils/auth.js
export const getUserRole = () => {
  try {
    const userData = localStorage.getItem('userData');
    console.log("getUserRole - raw userData:", userData); // DEBUG
    
    if (userData) {
      const user = JSON.parse(userData);
      console.log("getUserRole - parsed user:", user); // DEBUG
      console.log("getUserRole - user.role:", user.role); // DEBUG
      return user.role;
    }
    console.log("getUserRole - no userData found, returning null"); // DEBUG
    return null;
  } catch (error) {
    console.error("getUserRole - parsing error:", error); // DEBUG
    return null;
  }
};

export const isUserLoggedIn = () => {
  const hasToken = !!localStorage.getItem('userToken');
  console.log("isUserLoggedIn - token exists:", hasToken); // DEBUG
  return hasToken;
};
