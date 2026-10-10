import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Shubham Bhatt — Full-Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const assets = join(process.cwd(), "src/assets");
  const [regular, bold, portrait] = await Promise.all([
    readFile(join(assets, "fonts/Geist-Regular.ttf")),
    readFile(join(assets, "fonts/Geist-Bold.ttf")),
    readFile(join(assets, "og-portrait.jpg")),
  ]);
  const portraitSrc = `data:image/jpeg;base64,${portrait.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#09090b", fontFamily: "Geist", position: "relative" }}>
        {/* Grayscale portrait on the right, fading into the background */}
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img> only */}
        <img src={portraitSrc} width={420} height={630} alt="" style={{ position: "absolute", right: 0, top: 0, opacity: 0.55 }} />
        <div style={{ position: "absolute", right: 0, top: 0, width: 420, height: 630, display: "flex", background: "linear-gradient(90deg, #09090b 0%, rgba(9,9,11,0.55) 45%, rgba(9,9,11,0.15) 100%)" }} />

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", width: "100%", height: "100%", position: "relative" }}>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1.5, color: "#f4f4f5" }}>SB.</div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -4.5, lineHeight: 1, color: "#ffffff" }}>Shubham Bhatt</div>
            <div style={{ fontSize: 44, fontWeight: 400, letterSpacing: -1.2, color: "#a1a1aa", marginTop: 22 }}>Full-Stack Developer</div>
            <div style={{ display: "flex", alignItems: "center", marginTop: 44 }}>
              <div style={{ width: 48, height: 2, background: "#3f3f46", marginRight: 20 }} />
              <div style={{ fontSize: 24, fontWeight: 400, letterSpacing: 1, color: "#d4d4d8" }}>React · Next.js · TypeScript · Node.js</div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "Geist", data: bold, weight: 700, style: "normal" },
      ],
    }
  );
}
