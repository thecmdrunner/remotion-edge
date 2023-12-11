"use client";
import { Button } from "@/components/ui/button";
import { FPS } from "@/constants";
import { useEffect, useState } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LucideInfo, LucideLoader, LucideXCircle } from "lucide-react";
import Link from "next/link";
import { absoluteUrl } from "@/lib/utils";
const ffmpeg = createFFmpeg({ log: true });

export default function HomePage() {
  const [logoColor1, setLogoColor1] = useState("#91EAE4");
  const [logoColor2, setLogoColor2] = useState("#86A8E7");
  const [titleColor, setTitleColor] = useState("#000000");
  const [titleText, setTitleText] = useState("World!");
  const [error, setError] = useState<string | null>(null);
  const [ffmpegLoadStatus, setFFmpegLoadStatus] = useState<
    "idle" | "loading" | "loaded" | "error"
  >("idle");

  const [video, setVideo] = useState<File | null>(null);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);

  const [isFetchingFrames, setIsFetchingFrames] = useState(false);

  const [isConvertingFramesToVideo, setIsConvertingFramesToVideo] =
    useState(false);

  const [totalSeconds, setTotalSeconds] = useState(5);

  const loadFFmpeg = async () => {
    setFFmpegLoadStatus("loading");

    try {
      await ffmpeg.load();
      setFFmpegLoadStatus("loaded");
    } catch (err) {
      console.error(err);
      setFFmpegLoadStatus("error");
      setError(
        ` If you see this error, it means that FFMPEG failed to load. Please refresh the page and try again.`,
      );
    }
  };

  // const convertToGif = async () => {
  //   if (!video) {
  //     return alert("Please upload a video first!");
  //   }

  //   // Write the file to memory
  //   ffmpeg.FS("writeFile", "test.mp4", await fetchFile(video));

  //   // Run the FFMpeg command
  //   await ffmpeg.run(
  //     "-i",
  //     "test.mp4",
  //     "-t",
  //     "2.5",
  //     "-ss",
  //     "2.0",
  //     "-f",
  //     "gif",
  //     "out.gif",
  //   );

  //   // Read the result
  //   const data = ffmpeg.FS("readFile", "out.gif");

  //   // Create a URL
  //   const url = URL.createObjectURL(
  //     new Blob([data.buffer], { type: "image/gif" }),
  //   );
  //   setGif(url);
  // };

  // const convertVideoToMp3 = async () => {
  //   if (!video) {
  //     return alert("Please upload a video first!");
  //   }

  //   console.log(`Converting video to mp3...`, { videoSize: video.size });

  //   // Write the file to memory
  //   ffmpeg.FS("writeFile", "input.mp4", await fetchFile(video));

  //   // Run the FFMpeg command
  //   await ffmpeg.run("-i", "input.mp4", "-q:a", "0", "-map", "a", "output.mp3");

  //   // Read the result
  //   const data = ffmpeg.FS("readFile", "output.mp3");

  //   // Create a URL
  //   const url = URL.createObjectURL(
  //     new Blob([data.buffer], { type: "audio/mp3" }),
  //   );
  //   setAudioUrl(url);
  // };

  const fetchFrames = async () => {
    setIsFetchingFrames(true);
    try {
      // Write the images to memory
      const framesPromises = Array(totalSeconds * FPS)
        .fill(true)
        .map(async (_, i) => {
          const imageUrl = absoluteUrl(`/api/og?frame=${i}&text=${titleText}`);

          const imageRes = await fetch(imageUrl, {
            method: "POST",
            body: JSON.stringify({
              frame: i,
              text: titleText,
            }),
            cache: "no-store",
          });

          // const imageBlob = await imageRes.blob();

          const imageBuffer = await imageRes.arrayBuffer();

          // const imageFile = new File([imageBlob], `image-${i}.png`);

          ffmpeg.FS(
            "writeFile",
            `frame-${i}.png`,
            // @ts-expect-error - this works for now
            await fetchFile(imageBuffer),
          );

          console.log(`Wrote frame ${i + 1} to disk!`, {
            frame: i,
            // size: `${imageBlob.size / 1024} KB`,
            // type: imageBlob.type,
          });
        });

      await Promise.all(framesPromises);

      const fileListAB = await (
        await fetch(`/api/filelist`, {
          method: "POST",
          body: JSON.stringify({
            total: totalSeconds * FPS,
          }),
          cache: "no-store",
        })
      ).arrayBuffer();

      const filelistContents = new TextDecoder("utf-8").decode(fileListAB);

      console.log({ filelistContents });

      const newUint8Array = new Uint8Array(fileListAB);

      ffmpeg.FS("writeFile", `filelist.txt`, newUint8Array);

      console.log(`😎 Wrote all frames to disk!`);
    } catch (err) {
      setError(
        (err as Error)?.message ??
          "Unknown Error while fetching frames for the video",
      );
    } finally {
      setIsFetchingFrames(false);
    }
  };

  const convertFramesToVideo = async () => {
    setIsConvertingFramesToVideo(true);
    try {
      await ffmpeg.run(
        // `-framerate`,
        // `${FPS}`,
        //
        // "concat",

        "-f",
        "concat",
        "-safe",
        "0",

        "-i",
        "filelist.txt",
        // "-i",
        // "frame-%d.png",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-framerate",
        // "30",
        // "-r",
        `${FPS}`,
        //   "-vf",
        //   '"fps=30"',
        "output.mp4",
      );
      // await ffmpeg.run(
      //   `-f`,
      //   "concat",
      //   "-safe",
      //   "0",
      //   "-i",
      //   "filelist.txt",
      //   "-c:v",
      //   "libx264",
      //   "-pix_fmt",
      //   "yuv420p",
      //   "-r",
      //   `${FPS}`,
      //   "-vf",
      //   '"fps=30"',
      //   "output.mp4",
      // );

      const data = ffmpeg.FS("readFile", "output.mp4");

      const videoFile = new File([data.buffer], "output.mp4", {
        type: "video/mp4",
      });

      // Create a URL
      const url = URL.createObjectURL(videoFile);

      console.log(`🔥 Converted frames to video!`, { url, video: videoFile });

      setVideo(videoFile);
      setFinalVideoUrl(url);
    } catch (err) {
      console.error({ error: err });
      setError(
        (err as Error)?.message ??
          "Unknown Error while converting frames to video",
      );
    } finally {
      setIsConvertingFramesToVideo(false);
    }
  };

  useEffect(() => {
    void loadFFmpeg();
  }, []);

  if (ffmpegLoadStatus === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center font-semibold">
        <LucideLoader className="mr-2 h-6 w-6 animate-spin" />
        <p>Loading FFMPEG...</p>
      </div>
    );
  }

  return (
    <main className="flex flex-wrap gap-8">
      <div className="flex max-w-md flex-col gap-y-4 p-4">
        <h1 className="text-lg font-semibold">Render Videos on the browser!</h1>
        <p>
          This uses
          <Link
            href={`https://vercel.com/docs/functions/edge-functions/og-image-generation`}
            className="underline"
          >
            <strong className="px-[1ch] font-mono">@vercel/og</strong>
          </Link>
          to generate frames for the video, based on a `frame` that we pass as a
          param to the og route (just like Remotion).
        </p>

        <p className="flex items-center gap-2.5 rounded-lg bg-gray-200 px-3.5 py-2.5">
          <LucideInfo className="h-4 w-4" /> Make sure to open the console
          first!
        </p>

        <ol className="flex flex-col gap-y-3">
          <li className="flex flex-col gap-y-2.5">
            <span>
              <strong>Step 1:</strong> Set the text and desired video duration.
              The video will be{" "}
              <code className="inline w-max rounded-lg bg-gray-200 px-1 py-1">
                {FPS} fps
              </code>{" "}
              (will be configurable soon).
            </span>
            <div className="flex gap-x-1">
              <div className="flex flex-col">
                <Label className="font-mono">Text</Label>
                <Input
                  min={2}
                  type="text"
                  value={titleText}
                  onChange={(e) => setTitleText(e.target.value)}
                  className="my-2 w-full"
                />
              </div>

              <div className="flex flex-col">
                <Label className="font-mono">Duration (seconds)</Label>
                <Input
                  min={2}
                  type="number"
                  value={totalSeconds}
                  onChange={(e) => setTotalSeconds(Number(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key.toLowerCase() === "backspace") {
                      e.preventDefault();
                      setTotalSeconds(2);
                    }
                  }}
                  className="my-2 w-24"
                />
              </div>
            </div>
          </li>

          <li className="flex flex-col gap-y-2.5">
            <strong>Step 2:</strong> Click the button below to generate{" "}
            {totalSeconds * FPS} frames as PNGs and write them to disk.
            <br />
            <Button loading={isFetchingFrames} onClick={fetchFrames}>
              Fetch all frames
            </Button>
          </li>

          <li className="flex flex-col gap-y-2.5">
            <strong>Step 3:</strong> Click the button below to convert all the
            frames to a video.
            <br />
            <Button
              loading={isConvertingFramesToVideo}
              onClick={convertFramesToVideo}
            >
              Convert to video
            </Button>
          </li>
        </ol>
      </div>

      <div className="flex max-w-xs flex-col gap-y-4 p-4">
        <h2 className="text-xl font-semibold">Result</h2>

        <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-md bg-gray-100 sm:w-96">
          {video && finalVideoUrl ? (
            <video
              controls
              className="object-cover object-center"
              src={finalVideoUrl}
            />
          ) : (
            "No video yet!"
          )}
        </div>

        {error && (
          <div
            className="mb-4 w-full space-y-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-gray-800 dark:text-red-400"
            role="alert"
          >
            <div className="flex items-center gap-3 font-medium">
              <LucideXCircle className="stroke-red-700" /> Error
            </div>
            <span className="block">{error}</span>
          </div>
        )}

        <Button
          onClick={() => {
            const result = ffmpeg.FS("readFile", "output.mp4");

            const video = new Blob([result.buffer], { type: "video/mp4" });

            const url = URL.createObjectURL(video);

            setFinalVideoUrl(url);

            console.log({ asVideo: video, url });
          }}
        >
          debug: Check output.mp4
        </Button>
        <Button
          onClick={() => {
            const file = ffmpeg.FS("readFile", "filelist.txt");
            const result = new TextDecoder("utf-8").decode(file);
            console.log({ result });
          }}
        >
          debug: Check Filelist.txt
        </Button>
      </div>
    </main>
  );
}
