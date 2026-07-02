import { apiPost } from "./apiClient";

export const MyOweList = async (formData) => {
  const data = await apiPost("/my-owe-list", formData);
  if (data.success === false && !data.message) {
    return { message: "Failed to fetch My Owe List", success: false };
  }
  return data;
};

export const MyOweAdd = async (formData) => {
  const data = await apiPost("/save-split", formData);
  if (data.success === false && !data.message) {
    return { message: "Failed to save split", success: false };
  }
  return data;
};

export const MyOwePrizeUpdate = async (formData) => {
  const data = await apiPost("/update-price", formData);
  if (data.success === false && !data.message) {
    return { message: "Failed to update price", success: false };
  }
  return data;
};

export const closebill = async (formData) => {
  const data = await apiPost("/close-bill", formData);
  if (data.success === false && !data.message) {
    return { message: "Failed to close bill", success: false };
  }
  return data;
};

export const createdSplitsList = async (formData) => {
  const data = await apiPost("/created-splits-list", formData);
  if (data.status === false) {
    return { message: data.message || "Failed to fetch created splits", success: false };
  }
  return { ...data, success: true };
};

export const markSettled = async (formData) => {
  const data = await apiPost("/mark-settled", formData);
  if (data.success === false && !data.message) {
    return { message: "Failed to mark as settled", success: false };
  }
  return data;
};
