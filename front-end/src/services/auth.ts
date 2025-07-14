import api from "../api/axiosInstance.js";

const signup = async (full_name, email, role, department) => {
  try {
    const res = await api.post(`/authentication/signup/`, {
      full_name,
      email,
      department,
      role,
    });
    return res;
  } catch (error) {
    return error.response;
  }
};

const login = async (email, password) => {
  try {
    const res = await api.post(`/authentication/login/`, { email, password });
    console.log("hahaha");
    
    console.log(res);
    return res.data;
  } catch (error) {
    return error;
  }
};

const logout = async () => {
  try {
    const res = await api.post(`/authentication/logout/`);
    return res.message;
  } catch (error) {
    return error.error;
  }
};

const getRefreshToken = async () => {
  try {
    const res = await api.get(`/authentication/new-access-token/`);
    return res
  } catch (error) {
    return error
  }
};

const getUsers = async () => {
  try {
    const res = await api.get(`/authentication/users/`);
    console.log(res);
    
    return res;
  } catch (error) {
    return error.error;
  }
};

export { signup, login, logout, getRefreshToken, getUsers };
