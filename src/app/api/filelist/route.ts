import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // ?total=<total>
    const hasTotal = searchParams.has("total");

    if (!hasTotal) {
      return new Response(`Missing total parameter`, { status: 400 });
    }

    const total = Number(searchParams.get("total")?.slice(0, 100));

    if (isNaN(total)) {
      return new Response(`Invalid total parameter`, { status: 400 });
    }

    console.log({ total });

    const allFilesStr = Array(total)
      .fill(true)
      .map((_, index) => {
        return `file frame-${index}.png`;
      })
      .join("\n");

    // console.log(allFilesStr);

    return new NextResponse(allFilesStr, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (err) {
    console.error({ error: err });
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
