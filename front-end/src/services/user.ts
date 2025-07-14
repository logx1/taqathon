import api from "../api/axiosInstance.js";

const updateUser = async (id, body) => {
  try {
    console.log(typeof(id));
    
    console.log(body);
    
    const res = await api.put(`/authentication/users/${id}`, body);
    console.log(res);

    return res;
  } catch (error) {
    return error.error;
  }
};

const deleteUser = async (id) => {
  try {
    const res = await api.delete(`/authentication/delete_user/${id}`);
    console.log(res);

    return res;
  } catch (error) {
    return error.error;
  }
};

const updateStatus = async (body) => {
  try {
    const res = await api.post(`/authentication/update-status/`, body);
    console.log(res);

    return res;
  } catch (error) {
    return error.error;
  }
};

export { updateUser, deleteUser, updateStatus };
