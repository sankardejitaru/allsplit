export function parseJoinContactPayload(raw) {
  const value = String(raw || "").trim();
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed && (parsed.t || parsed.token || parsed.phone)) {
      return {
        token: parsed.t || parsed.token || "",
        phone: parsed.phone || parsed.p || "",
        firstname: parsed.firstname || parsed.f || "",
        lastname: parsed.lastname || parsed.l || "",
      };
    }
  } catch {
    // not JSON
  }

  const withoutScheme = value.replace(/^allsplit:\/\//i, "https://allsplit.local/");
  try {
    const url = new URL(withoutScheme);
    const token = url.searchParams.get("t") || url.searchParams.get("token") || "";
    const phone = url.searchParams.get("phone") || url.searchParams.get("p") || "";
    const firstname = url.searchParams.get("firstname") || url.searchParams.get("f") || "";
    const lastname = url.searchParams.get("lastname") || url.searchParams.get("l") || "";
    if (token || phone) {
      return { token, phone, firstname, lastname };
    }
  } catch {
    // ignore
  }

  const tokenMatch = value.match(/[?&]t=([^&]+)/i);
  const phoneMatch = value.match(/[?&](?:phone|p)=([^&]+)/i);
  if (tokenMatch || phoneMatch) {
    return {
      token: tokenMatch ? decodeURIComponent(tokenMatch[1]) : "",
      phone: phoneMatch ? decodeURIComponent(phoneMatch[1]) : "",
      firstname: "",
      lastname: "",
    };
  }

  return null;
}
