import { ImageResponse } from "next/og";

export const alt = "Creos Labs — Custom marketing solutions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          backgroundImage:
            "radial-gradient(circle at 50% 20%, rgba(255,255,255,0.14), rgba(0,0,0,0) 60%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 999,
              border: "3px solid #f5f5f7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                backgroundColor: "#2997ff",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: "#f5f5f7",
              letterSpacing: "-0.02em",
            }}
          >
            Creos Labs
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: 64,
            fontWeight: 600,
            color: "#f5f5f7",
            letterSpacing: "-0.03em",
            textAlign: "center",
            padding: "0 80px",
          }}
        >
          <div style={{ display: "flex" }}>Custom-built</div>
          <div style={{ display: "flex" }}>marketing solutions.</div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 28,
            color: "#86868b",
          }}
        >
          Engineered for your business.
        </div>
      </div>
    ),
    { ...size }
  );
}
