import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_MOBILE_KEY = "UserMobile";
const USER_FIRSTNAME_KEY = "UserFirstname";
const USER_LASTNAME_KEY = "UserLastname";

export const normalizePhone = (phone) =>
  String(phone ?? "").replace(/[^\d]/g, "");

export const phonesMatch = (phoneA, phoneB) => {
  const a = normalizePhone(phoneA);
  const b = normalizePhone(phoneB);

  if (!a || !b) {
    return false;
  }

  if (a === b) {
    return true;
  }

  const aLast10 = a.slice(-10);
  const bLast10 = b.slice(-10);

  return aLast10.length === 10 && aLast10 === bLast10;
};

export const findPersonByPhone = (people = [], userMobile) => {
  if (!userMobile) {
    return null;
  }

  return people.find((person) => phonesMatch(person.phone, userMobile)) ?? null;
};

export const getUserMobile = async () => {
  const mobile = await AsyncStorage.getItem(USER_MOBILE_KEY);
  return mobile ?? "";
};

export const setUserMobile = async (mobile) => {
  if (!mobile) {
    return;
  }

  await AsyncStorage.setItem(USER_MOBILE_KEY, String(mobile));
};

export const formatDisplayMobile = (mobile) => {
  const digits = normalizePhone(mobile);
  if (digits.length < 10) {
    return mobile || "—";
  }

  const last10 = digits.slice(-10);
  return `+${digits.slice(0, -10) || "91"} ${last10.slice(0, 5)} ${last10.slice(5)}`;
};

export const getUserFirstname = async () => {
  const value = await AsyncStorage.getItem(USER_FIRSTNAME_KEY);
  return value ?? "";
};

export const getUserLastname = async () => {
  const value = await AsyncStorage.getItem(USER_LASTNAME_KEY);
  return value ?? "";
};

export const setUserProfile = async ({ firstname = "", lastname = "" } = {}) => {
  await AsyncStorage.multiSet([
    [USER_FIRSTNAME_KEY, String(firstname).trim()],
    [USER_LASTNAME_KEY, String(lastname).trim()],
  ]);
};

export const getUserDisplayName = (firstname, lastname) => {
  const name = `${firstname || ""} ${lastname || ""}`.trim();
  return name || "AllSplit User";
};

export const getProfileInitials = (firstname, lastname, mobile) => {
  const first = (firstname || "").trim();
  const last = (lastname || "").trim();

  if (first && last) {
    return `${first[0]}${last[0]}`.toUpperCase();
  }

  if (first) {
    return first.slice(0, 2).toUpperCase();
  }

  const digits = normalizePhone(mobile);
  return digits ? digits.slice(-2) : "?";
};

export const clearUserSession = async () => {
  await AsyncStorage.multiRemove([
    "LoginId",
    USER_MOBILE_KEY,
    USER_FIRSTNAME_KEY,
    USER_LASTNAME_KEY,
  ]);
};
