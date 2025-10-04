import { ImageResponse } from "next/og";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";

export const runtime = "edge";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cid: string }> }
) {
  try {
    const { cid } = await params;

    // Fetch the message from database
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.cid, cid));

    // Check if message exists and is public
    if (!message || !message.isPublic) {
      return new Response("Not found", { status: 404 });
    }
    const summary = message.summary || message.content;
    const characters = summary.length;

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg, #FDF2F8 0%, #FFFFFF 50%, #FAF5FF 100%)",
            fontFamily: "system-ui, sans-serif",
            padding: "100px 120px",
            position: "relative",
          }}
        >
          {/* Top section with quote mark and line */}
          <div
            style={{
              position: "absolute",
              top: "60px",
              left: "100px",
              right: "100px",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            {/* Large opening quote mark */}
            <div
              style={{
                fontSize: 180,
                fontWeight: 900,
                color: "#EC4899",
                lineHeight: 0.8,
                marginRight: "60px",
                display: "flex",
                fontFamily: "Georgia, serif",
              }}
            >
              "
            </div>

            {/* Top line */}
            <div
              style={{
                flex: 1,
                height: "2px",
                background: "linear-gradient(90deg, #EC4899 0%, #9333EA 100%)",
                display: "flex",
                marginTop: "40px",
              }}
            />
          </div>

          {/* Quote text */}
          <div
            style={{
              display: "flex",
              fontSize: characters > 20 ? 50 : 72,
              fontWeight: 900,
              color: "#EC4899",
              textAlign: "center",
              lineHeight: 1.3,
              maxWidth: "900px",
              letterSpacing: "-0.02em",
              marginBottom: "40px",
            }}
          >
            {summary}
          </div>

          {/* Bottom section with line and quote mark */}
          <div
            style={{
              position: "absolute",
              bottom: "60px",
              left: "100px",
              right: "100px",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            {/* Bottom line */}
            <div
              style={{
                flex: 1,
                height: "2px",
                background: "linear-gradient(90deg, #EC4899 0%, #9333EA 100%)",
                display: "flex",
                marginBottom: "80px",
              }}
            />

            {/* Large closing quote mark */}
            <div
              style={{
                fontSize: 180,
                fontWeight: 900,
                color: "#EC4899",
                lineHeight: 0.8,
                marginLeft: "60px",
                display: "flex",
                fontFamily: "Georgia, serif",
              }}
            >
              "
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
