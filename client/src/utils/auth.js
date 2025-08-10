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
};
