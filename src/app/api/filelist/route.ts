import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

const postSchema = z.object({
  total: z.number(),
});

export async function POST(req: Request) {
  try {
    // const { searchParams } = new URL(request.url);

    // // ?total=<total>
    // const hasTotal = searchParams.has("total");

    // if (!hasTotal) {
    //   return new Response(`Missing total parameter`, { status: 400 });
    // }

    // const total = Number(searchParams.get("total")?.slice(0, 100));

    // if (isNaN(total)) {
    //   return new Response(`Invalid total parameter`, { status: 400 });
    // }

    const { total } = postSchema.parse(await req.json());

    console.log({ total });

    const allFilesStr = Array(total)
      .fill(true)
      .map((_, index) => {
        return `file frame-${index}.png\nduration 0.0333`;
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
