import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          backgroundColor: "#000000",
          backgroundImage: "linear-gradient(135deg, #1d1d1f 0%, #000000 60%)",
          color: "#f5f5f7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 88, fontWeight: 600, lineHeight: 1.05 }}>
          {profile.brand}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#2997ff",
            marginTop: 20,
          }}
        >
          {profile.name} — {profile.role}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            marginTop: 24,
            color: "#86868b",
            maxWidth: 800,
          }}
        >
          {profile.tagline}
        </div>
      </div>
    ),
    { ...size },
  );
}
