import api from "../api/axiosInstance.js";

const getMaintenanceWindows = async () => {
    try {
        const res = await api.get(`/maintenance_windows/`);
        return res
    } catch (error) {
        return error;
    }
}

const getMaintenanceWindow = async (id) => {
    try {
        const res = await api.get(`/maintenance_windows/${id}`);
        return res
    } catch (error) {
        return error;
    }
}

const addMaintenanceWindow = async (info) => {
    const { name, type, description, start_date, end_date } = info
    try {
        const res = await api.post(`/maintenance_windows/`, {
            name,
            description,
            type,
            start_date, end_date
        });
        return res;
    } catch (error) {
        return error;
    }
}

const deleteMaintenanceWindow = async (id) => {
    try {
        const res = await api.delete(`/maintenance_windows/${id}/`);
        console.log(res);
        
        return res;
    } catch (error) {
        return error;
    }
}

const editMaintenanceWindow = async (id, newData) => {
    try {
        const res = await api.put(`/maintenance_windows/${id}/`, newData);
        console.log(res);
        
        return res;
    } catch (error) {
        return error;
    }
}

export { getMaintenanceWindows, getMaintenanceWindow, addMaintenanceWindow, deleteMaintenanceWindow, editMaintenanceWindow }