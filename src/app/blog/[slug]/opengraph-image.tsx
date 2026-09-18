import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog";
import { profile } from "@/data/profile";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const title = post?.title ?? profile.brand;
  const excerpt = post?.excerpt ?? profile.tagline;

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
        <div style={{ display: "flex", fontSize: 28, color: "#2997ff", fontWeight: 600 }}>
          {profile.brand}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 60,
            fontWeight: 600,
            lineHeight: 1.15,
            marginTop: 28,
            maxWidth: 980,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            marginTop: 28,
            color: "#86868b",
            maxWidth: 900,
          }}
        >
          {excerpt}
        </div>
      </div>
    ),
    { ...size },
  );
}
