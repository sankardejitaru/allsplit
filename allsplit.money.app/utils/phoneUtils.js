export const DEFAULT_COUNTRY_CODE = "91";

export const COUNTRY_OPTIONS = [
  { code: "+91", label: "IN", digits: 10 },
  { code: "+1", label: "US", digits: 10 },
  { code: "+44", label: "UK", digits: 10 },
  { code: "+971", label: "AE", digits: 9 },
];

export function digitsOnly(value) {
  return String(value ?? "").replace(/\D/g, "");
}

export function buildFullMobile(countryCode, localNumber) {
  const cc = digitsOnly(countryCode);
  const local = digitsOnly(localNumber);
  return normalizeParticipantPhone(`${cc}${local}`);
}

export function formatMobileDisplay(fullMobile) {
  return formatPhoneDisplay(fullMobile);
}

/**
 * Canonical storage format: 91 + 10-digit Indian mobile (e.g. 919876543210).
 */
export function normalizeParticipantPhone(
  phone,
  defaultCountryCode = DEFAULT_COUNTRY_CODE
) {
  let digits = digitsOnly(phone);
  if (!digits) {
    return "";
  }

  const expectedLen = defaultCountryCode.length + 10;

  if (digits.startsWith(defaultCountryCode) && digits.length >= expectedLen) {
    return `${defaultCountryCode}${digits.slice(-10)}`;
  }

  digits = digits.replace(/^0+/, "");

  if (digits.startsWith(defaultCountryCode) && digits.length >= expectedLen) {
    return `${defaultCountryCode}${digits.slice(-10)}`;
  }

  if (digits.length === 10) {
    return `${defaultCountryCode}${digits}`;
  }

  if (digits.length > 10) {
    return `${defaultCountryCode}${digits.slice(-10)}`;
  }

  return "";
}

export function formatPhoneDisplay(
  storedPhone,
  defaultCountryCode = DEFAULT_COUNTRY_CODE
) {
  const normalized = normalizeParticipantPhone(storedPhone, defaultCountryCode);
  if (!normalized) {
    return "";
  }

  const local = normalized.slice(-10);
  const country = normalized.slice(0, -10) || defaultCountryCode;
  return `+${country} ${local.slice(0, 5)} ${local.slice(5)}`;
}

function pickBestPhoneFromContact(contact, defaultCountryCode = DEFAULT_COUNTRY_CODE) {
  const numbers = contact.phoneNumbers || [];
  let fallback = "";

  for (const entry of numbers) {
    const raw = entry?.number || entry?.digits || "";
    const normalized = normalizeParticipantPhone(raw, defaultCountryCode);
    if (normalized.length !== defaultCountryCode.length + 10) {
      continue;
    }

    if (!fallback) {
      fallback = normalized;
    }

    return normalized;
  }

  return fallback;
}

export function normalizeDeviceContact(
  contact,
  defaultCountryCode = DEFAULT_COUNTRY_CODE
) {
  const firstname = (contact.givenName || "").trim();
  const lastname = (contact.familyName || "").trim();
  const name =
    contact.displayName ||
    `${firstname} ${lastname}`.trim() ||
    "Unknown";

  const phone = pickBestPhoneFromContact(contact, defaultCountryCode);
  if (!phone) {
    return null;
  }

  return {
    id: `device_${contact.recordID}`,
    firstname,
    lastname,
    name,
    phone,
    source: "device",
  };
}

export function normalizeDbContact(
  contact,
  defaultCountryCode = DEFAULT_COUNTRY_CODE
) {
  const firstname = (contact.firstname || "").trim();
  const lastname = (contact.lastname || "").trim();
  const name = `${firstname} ${lastname}`.trim();
  const phone = normalizeParticipantPhone(contact.phone, defaultCountryCode);

  if (!phone) {
    return null;
  }

  return {
    id: String(contact._id),
    firstname,
    lastname,
    name,
    phone,
    source: "saved",
  };
}

export function getContactInitials(person) {
  const first = (person?.firstname || "").trim();
  const last = (person?.lastname || "").trim();

  if (first && last) {
    return `${first[0]}${last[0]}`.toUpperCase();
  }

  const name = (person?.name || "").trim();
  if (!name) {
    return "?";
  }

  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  return parts[0].slice(0, 2).toUpperCase();
}

export function normalizePerson(person) {
  if (!person) {
    return person;
  }

  return {
    ...person,
    phone: normalizeParticipantPhone(person.phone),
  };
}

export function matchesContactSearch(person, query) {
  const normalizedQuery = String(query ?? "").trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  const queryDigits = normalizedQuery.replace(/\D/g, "");
  const name = (person?.name || "").toLowerCase();
  const firstname = (person?.firstname || "").toLowerCase();
  const lastname = (person?.lastname || "").toLowerCase();
  const displayPhone = formatPhoneDisplay(person?.phone || "").toLowerCase();
  const storedPhone = person?.phone || "";

  return (
    name.includes(normalizedQuery) ||
    firstname.includes(normalizedQuery) ||
    lastname.includes(normalizedQuery) ||
    displayPhone.includes(normalizedQuery) ||
    (queryDigits.length > 0 && storedPhone.includes(queryDigits))
  );
}

export function getSavedContactPhones(savedContacts) {
  const phones = new Set();

  for (const contact of savedContacts || []) {
    const normalized = normalizeDbContact(contact);
    if (normalized?.phone) {
      phones.add(normalized.phone);
    }
  }

  return phones;
}

export function filterDeviceContactsExcludingSaved(deviceContacts, savedContacts) {
  const savedPhones = getSavedContactPhones(savedContacts);

  return (deviceContacts || []).filter(
    (person) => person?.phone && !savedPhones.has(person.phone)
  );
}
