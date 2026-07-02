import { apiMultipart } from "./apiClient";
import { buildScanFormData, prepareBillImage } from "../utils/billImageUtils";

const SCAN_ENDPOINTS = ["/textract/scan", "/ocr/scan-bill"];

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveUnitPrice(entry) {
  const qty = toNumber(entry.qty, 1) || 1;
  const rate = toNumber(entry.rate, 0);
  const amount = toNumber(entry.amount ?? entry.price, 0);

  if (rate > 0) {
    return rate;
  }

  if (amount > 0 && qty > 0) {
    return Number((amount / qty).toFixed(2));
  }

  return 0;
}

function resolveLineTotal(entry, unitPrice) {
  const amount = toNumber(entry.amount ?? entry.price, 0);
  if (amount > 0) {
    return amount;
  }

  const qty = toNumber(entry.qty, 1);
  return Number((qty * unitPrice).toFixed(2));
}

export function normalizeScanItems(items = []) {
  return items
    .map((entry) => {
      const name = String(entry.name || entry.item || "").trim();
      const qty = toNumber(entry.qty, 1) || 1;
      const rate = resolveUnitPrice(entry);
      const amount = resolveLineTotal(entry, rate);

      return {
        name,
        qty,
        rate,
        amount,
        price: rate,
      };
    })
    .filter((entry) => entry.name && entry.amount > 0);
}

function buildScanMessage(data, itemCount) {
  if (itemCount > 0) {
    const parseMeta = data.parse_meta || {};
    if (parseMeta.header_detected === false) {
      return `Detected ${itemCount} items without a standard bill header. Review before saving.`;
    }
    return `Detected ${itemCount} items from bill.`;
  }

  return data.message || data.detail || "Could not read items from bill";
}

function normalizeScanResponse(data) {
  if (!data) {
    return { success: false, message: "No response from scan service", items: [] };
  }

  const items = normalizeScanItems(data.items);
  const parseMeta = data.parse_meta || null;

  if (items.length > 0) {
    return {
      success: true,
      items,
      parse_meta: parseMeta,
      source: data.source,
      message: buildScanMessage(data, items.length),
    };
  }

  return {
    success: false,
    message: buildScanMessage(data, 0),
    items: [],
    parse_meta: parseMeta,
  };
}

async function postBillScan(path, imageUri) {
  return apiMultipart(path, buildScanFormData(imageUri));
}

export const SendBillScan = async (imageUri) => {
  const preparedUri = await prepareBillImage(imageUri);
  let lastError = "Bill scan failed";
  let lastParseMeta = null;

  for (const path of SCAN_ENDPOINTS) {
    const data = await postBillScan(path, preparedUri);
    const normalized = normalizeScanResponse(data);

    if (normalized.parse_meta) {
      lastParseMeta = normalized.parse_meta;
    }

    if (normalized.success) {
      return {
        ...normalized,
        source: path,
      };
    }

    lastError = normalized.message || lastError;

    if (__DEV__) {
      console.log(`AllSplit scan fallback: ${path} ->`, normalized.message);
    }
  }

  return {
    success: false,
    message: lastError,
    items: [],
    parse_meta: lastParseMeta,
  };
};
