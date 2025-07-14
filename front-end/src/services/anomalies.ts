import api from "../api/axiosInstance.js";

const processAnomaly = async (file) => {
    try {
        const formData = new FormData();
        formData.append("filex", file);
        const res = await api.post("/anomalies/export_anomalies/", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res;
    } catch (error) {
        return error;
    }
};

const getAnomalies = async (id) => {
    try {
        const res = await api.get(`/anomalies/${id}`);
        return res
    } catch (error) {
        return error;
    }
}

const deleteAnomaly = async (id) => {
    try {
        const res = await api.delete(`/anomalies/single/${id}/`);

        return res;
    } catch (error) {
        return error;
    }
}

const editAnomaly = async (id, newData) => {
    try {
        const res = await api.put(`/anomalies/single/${id}/`, newData);

        return res;
    } catch (error) {
        return error;
    }
}

const getAnomaly = async (id) => {
    try {
        const res = await api.get(`/anomalies/single/${id}/`);
        console.log((res));
        
        return res
    } catch (error) {
        return error;
    }
}
const getTotalAnomalies = async () => {
    try {
        const res = await api.get(`/anomalies/total_anomalies/`);
        console.log((res));
        
        return res
    } catch (error) {
        return error;
    }
}
const getOpenAnomalies = async () => {
    try {
        const res = await api.get(`/anomalies/kpis/open`);
        console.log((res));
        
        return res
    } catch (error) {
        return error;
    }
}

const getHighAnomalies = async () => {
    try {
        const res = await api.get(`/anomalies/kpis/High_Criticality`);
        console.log((res));
        
        return res
    } catch (error) {
        return error;
    }
}

export {getHighAnomalies, getOpenAnomalies, processAnomaly, getAnomalies, deleteAnomaly, editAnomaly, getAnomaly, getTotalAnomalies }