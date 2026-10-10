import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// "SB." monogram in the header logo's style: bold, tight tracking, white on near-black
export default async function Icon() {
  const bold = await readFile(join(process.cwd(), "src/assets/fonts/Geist-Bold.ttf"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#09090b", borderRadius: 6, color: "#f4f4f5", fontFamily: "Geist", fontWeight: 700, fontSize: 15, letterSpacing: -0.9 }}>
        SB.
      </div>
    ),
    { ...size, fonts: [{ name: "Geist", data: bold, weight: 700, style: "normal" }] }
  );
}
