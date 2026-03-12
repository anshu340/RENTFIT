import axiosInstance from "./axiosInstance";

export const submitDamageReport = (formData) => {
  return axiosInstance.post("rentals/damage-report/submit/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getStoreDamageReports = () => {
  return axiosInstance.get("rentals/damage-report/store/");
};

export const takeActionOnDamageReport = (id, data) => {
  return axiosInstance.post(`rentals/damage-report/${id}/action/`, data);
};

export default axiosInstance;