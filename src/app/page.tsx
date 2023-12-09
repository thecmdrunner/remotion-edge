"use client";
import { Button } from "@/components/ui/button";
import { FPS, TOTAL_DURATION_IN_FRAMES } from "@/constants";
import { useEffect, useState } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const ffmpeg = createFFmpeg({ log: true });

export default function HomePage() {
  const [logoColor1, setLogoColor1] = useState("#91EAE4");
  const [logoColor2, setLogoColor2] = useState("#86A8E7");
  const [titleColor, setTitleColor] = useState("#000000");
  const [titleText, setTitleText] = useState("Welcome to Remotion");
  const [ffmpegLoadStatus, setFFmpegLoadStatus] = useState<
    "idle" | "loading" | "loaded" | "error"
  >("idle");
  const [ready, setReady] = useState(false);
  const [video, setVideo] = useState<File | null>(null);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  const [gif, setGif] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [isFetchingImages, setIsFetchingImages] = useState(false);

  const loadFFmpeg = async () => {
    await ffmpeg.load();
    setReady(true);
  };

  const convertToGif = async () => {
    if (!video) {
      return alert("Please upload a video first!");
    }

    // Write the file to memory
    ffmpeg.FS("writeFile", "test.mp4", await fetchFile(video));

    // Run the FFMpeg command
    await ffmpeg.run(
      "-i",
      "test.mp4",
      "-t",
      "2.5",
      "-ss",
      "2.0",
      "-f",
      "gif",
      "out.gif",
    );

    // Read the result
    const data = ffmpeg.FS("readFile", "out.gif");

    // Create a URL
    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: "image/gif" }),
    );
    setGif(url);
  };

  const convertVideoToMp3 = async () => {
    if (!video) {
      return alert("Please upload a video first!");
    }

    console.log(`Converting video to mp3...`, { videoSize: video.size });

    // Write the file to memory
    ffmpeg.FS("writeFile", "input.mp4", await fetchFile(video));

    // Run the FFMpeg command
    await ffmpeg.run("-i", "input.mp4", "-q:a", "0", "-map", "a", "output.mp3");

    // Read the result
    const data = ffmpeg.FS("readFile", "output.mp3");

    // Create a URL
    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: "audio/mp3" }),
    );
    setAudioUrl(url);
  };

  const fetchAndWriteFrames = async () => {
    setIsFetchingImages(true);

    // Write the images to memory

    const framesPromises = Array(TOTAL_DURATION_IN_FRAMES)
      .fill(true)
      .map(async (_, i) => {
        const imageUrl = `/api/og?frame=${i}`;

        const imageBlob = await (await fetch(imageUrl)).blob();
        const imageFile = new File([imageBlob], "image.png");

        ffmpeg.FS("writeFile", `frame-${i}.png`, await fetchFile(imageFile));

        console.log(`Wrote frame ${i + 1} to disk!`);
      });

    await Promise.all(framesPromises);

    const fileListAB = await (
      await fetch(`/api/filelist?total=${TOTAL_DURATION_IN_FRAMES}`)
    ).arrayBuffer();

    const filelistContents = new TextDecoder("utf-8").decode(fileListAB);

    console.log({ filelistContents });

    const newUint8Array = new Uint8Array(fileListAB);

    ffmpeg.FS("writeFile", `filelist.txt`, newUint8Array);

    console.log(`😎 Wrote all frames to disk!`);

    setIsFetchingImages(false);
  };

  const convertFramesToVideo = async () => {
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

    await new Promise((resolve) => setTimeout(resolve, 5000));

    const data = ffmpeg.FS("readFile", "output.mp4");

    // Create a URL
    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: "video/mp4" }),
    );

    console.log(`🔥 Converted frames to video!`, { url });

    setVideo(new File([data.buffer], "video.mp4"));
  };

  useEffect(() => {
    void loadFFmpeg();
  }, []);

  return (
    <>
      {ready ? (
        <>
          <input
            type="file"
            onChange={(e) => setVideo(e.target.files?.item(0) ?? null)}
          />
          {video && (
            <video
              controls
              width="250"
              src={URL.createObjectURL(video)}
            ></video>
          )}
          <h3>Result</h3>
          {/* <button onClick={convertVideoToMp3}>Convert</button> */}
          <Button onClick={fetchAndWriteFrames}>1. Fetch all frames</Button>
          <br />
          <Button onClick={convertFramesToVideo}>
            2. Convert to video
          </Button>{" "}
          <br />
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
          {gif && <img src={gif} width="250" />}
          {audioUrl && (
            <audio controls src={audioUrl}>
              Your browser does not support the
              <code>audio</code> element.
            </audio>
          )}
          {finalVideoUrl && <video controls src={finalVideoUrl}></video>}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}
