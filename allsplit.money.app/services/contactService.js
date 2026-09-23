import { apiGet, apiPost } from "./apiClient";
import { normalizeParticipantPhone } from "../utils/phoneUtils";

export const getContact = async (formData) => {
  const data = await apiGet("/get-contacts", formData);
  if (data.success === false && !data.message) {
    return { message: "Failed to fetch contacts", success: false };
  }
  return data;
};

export const addnewcontact = async (formData) => {
  const data = await apiPost("/add-contacts", {
    ...formData,
    phone: normalizeParticipantPhone(formData.phone),
  });
  if (data.success === false && !data.message) {
    return { message: "Failed to add contact", success: false };
  }
  return data;
};

export const ensureSelfSavedContact = async (phone, firstname = "Self", lastname = "") => {
  const normalized = normalizeParticipantPhone(phone);
  if (!normalized) {
    return { success: false, created: false };
  }

  const data = await apiPost("/ensure-self-contact", {
    phone: normalized,
    firstname,
    lastname,
  });

  if (data.success === false && !data.message) {
    return { message: "Failed to save your contact", success: false, created: false };
  }

  return data;
};

export const createContactInvite = async () => {
  const data = await apiPost("/contact-invite/create", {});
  if (data.success === false && !data.message) {
    return { message: "Failed to create invite", success: false };
  }
  return data;
};

export const acceptContactInvite = async (formData) => {
  const data = await apiPost("/contact-invite/accept", {
    ...formData,
    phone: formData?.phone ? normalizeParticipantPhone(formData.phone) : formData?.phone,
  });
  if (data.success === false && !data.message) {
    return { message: "Failed to join contact", success: false };
  }
  return data;
};
