import { apiPost } from "./apiClient";

export const AUDIT_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "auth", label: "Auth" },
  { id: "split", label: "Splits" },
  { id: "contact", label: "Contacts" },
  { id: "profile", label: "Profile" },
  { id: "scan", label: "Scan" },
  { id: "http", label: "API" },
];

export async function listAuditLogs({
  mobile,
  category,
  status,
  limit = 50,
  skip = 0,
} = {}) {
  return apiPost("/audit-logs/list", {
    mobile,
    category: category && category !== "all" ? category : undefined,
    status: status && status !== "all" ? status : undefined,
    limit,
    skip,
  });
}
