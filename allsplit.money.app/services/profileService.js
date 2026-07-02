import { apiPost } from "./apiClient";

export const getProfile = async (mobile) => {
  const data = await apiPost("/get-profile", { mobile });
  if (data.success === false && !data.message) {
    return { message: "Failed to load profile", success: false };
  }
  return data;
};

export const updateProfile = async ({ mobile, firstname, lastname }) => {
  const data = await apiPost("/update-profile", {
    mobile,
    firstname: firstname.trim(),
    lastname: lastname.trim(),
  });
  if (data.success === false && !data.message) {
    return { message: "Failed to update profile", success: false };
  }
  return data;
};
