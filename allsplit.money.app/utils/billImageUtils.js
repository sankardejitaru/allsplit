import * as ImageManipulator from "expo-image-manipulator";

export function getImageUploadMeta(imageUri) {
  const lower = String(imageUri || "").toLowerCase();
  const isJpeg = lower.includes(".jpg") || lower.includes(".jpeg");

  return {
    name: isJpeg ? "bill.jpg" : "bill.png",
    type: isJpeg ? "image/jpeg" : "image/png",
  };
}

export function buildScanFormData(imageUri) {
  const { name, type } = getImageUploadMeta(imageUri);
  const formData = new FormData();

  formData.append("file", {
    uri: imageUri,
    name,
    type,
  });

  return formData;
}

export async function prepareBillImage(imageUri) {
  if (!imageUri || imageUri === "NA") {
    return imageUri;
  }

  try {
    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 1600 } }],
      { compress: 0.72, format: ImageManipulator.SaveFormat.JPEG }
    );

    return result.uri;
  } catch (error) {
    console.log("AllSplit image prep warning:", error?.message ?? error);
    return imageUri;
  }
}
