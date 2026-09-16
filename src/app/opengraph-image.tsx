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
          backgroundColor: "#141414",
          backgroundImage: "linear-gradient(135deg, #1a1a1a 0%, #141414 60%)",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#f0973d",
            marginBottom: 24,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {profile.role}
        </div>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 600, lineHeight: 1.1 }}>
          {profile.name}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            marginTop: 24,
            color: "#a3a3a3",
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
