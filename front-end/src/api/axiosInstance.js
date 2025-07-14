import axios from "axios"

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    let user = JSON.parse(localStorage.getItem("taqamorocco_user"))
    if (user) {
      let accessToken = user.access;
      if (
        accessToken &&
        (config.url.startsWith("/authentication/") || config.url.startsWith("/anomalies/") || config.url.startsWith("/maintenance_windows/")  || config.url.startsWith("/authentication/users/") ||
          config.url.startsWith("/authentication/logout"))
      ) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const req = error.config;
    console.log(error.response.data.code);

    if (
      error.response &&
      (error.response.data.code === "token_not_valid") &&
      !req._retry
    ) {
      req._retry = true;
      try {
        const refreshResponse = await axios.get(
          "http://127.0.0.1:8000/authentication/new-access-token",
          { withCredentials: true }
        );
        console.log(refreshResponse);

        const newAccessToken = refreshResponse.data.access;
        localStorage.setItem("access", newAccessToken);
        api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
        req.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(req);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;