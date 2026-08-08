import QRCode from "qrcode";

export async function generateGuideQrDataUrl(value: string | null | undefined): Promise<string | null> {
  if (!value) return null;
  return QRCode.toDataURL(value, {
    color: { dark: "#000000", light: "#FFFFFF" },
    errorCorrectionLevel: "M",
    margin: 4,
    type: "image/png",
    width: 512,
  });
}
