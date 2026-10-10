import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS rounds the corners itself, so this is a full-bleed square
export default async function AppleIcon() {
  const bold = await readFile(join(process.cwd(), "src/assets/fonts/Geist-Bold.ttf"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#09090b", color: "#f4f4f5", fontFamily: "Geist", fontWeight: 700, fontSize: 76, letterSpacing: -4 }}>
        SB.
      </div>
    ),
    { ...size, fonts: [{ name: "Geist", data: bold, weight: 700, style: "normal" }] }
  );
}
