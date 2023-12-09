import { HEIGHT, WIDTH } from "@/constants";
import { interpolate } from "@/lib/utils/interpolate";
import { Title } from "@/remotion/HelloWorld/Title";
import { ImageResponse } from "next/og";

// App router includes @vercel/og.
// No need to install it.

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // ?frame=<frame>
    const hasFrame = searchParams.has("frame");

    if (!hasFrame) {
      return new Response(`Missing frame parameter`, { status: 400 });
    }

    const frame = Number(searchParams.get("frame")?.slice(0, 100));

    if (isNaN(frame)) {
      return new Response(`Invalid frame parameter`, { status: 400 });
    }
    const opacity = interpolate(frame, [0, 100], [0, 1]);
    const logoTranslation = interpolate(frame, [0, 30], [0, -150]);
    console.log({ frame, opacity });

    return new ImageResponse(
      (
        <div
          style={{
            backgroundColor: "black",
            backgroundSize: "150px 150px",
            height: "100%",
            width: "100%",
            display: "flex",
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            flexWrap: "nowrap",
          }}
        >
          <div
            tw="absolute flex top-0 left-0 right-0 bottom-0 w-full h-full"
            style={{ transform: `translateY(${logoTranslation.toString()}px)` }}
          >
            <Title
              frame={frame}
              titleColor={"red"}
              titleText={"OGGGGGGGGGGGGGGG"}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              justifyItems: "center",
            }}
          >
            <img
              alt="Vercel"
              height={200}
              src="data:image/svg+xml,%3Csvg width='116' height='100' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M57.5 0L115 100H0L57.5 0z' /%3E%3C/svg%3E"
              style={{ margin: "0 30px", opacity }}
              width={232}
            />
          </div>
          <div
            style={{
              fontSize: 60,
              fontStyle: "normal",
              letterSpacing: "-0.025em",
              color: "white",
              marginTop: 30,
              padding: "0 120px",
              lineHeight: 1.4,
              whiteSpace: "pre-wrap",
            }}
          >
            {frame.toString()}
          </div>
        </div>
      ),
      {
        width: WIDTH,
        height: HEIGHT,
      },
    );
  } catch (err) {
    console.error({ error: err });
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
