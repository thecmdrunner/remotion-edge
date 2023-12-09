"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FPS } from "@/constants";
import { HelloWorld } from "@/remotion/HelloWorld";
import { Player } from "@remotion/player";
import { useEffect, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export default function HomePage() {
  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const messageRef = useRef<HTMLParagraphElement | null>(null);

  const [logoColor1, setLogoColor1] = useState("#91EAE4");
  const [logoColor2, setLogoColor2] = useState("#86A8E7");
  const [titleColor, setTitleColor] = useState("#000000");
  const [titleText, setTitleText] = useState("Welcome to Remotion");
  const [video, setVideo] = useState<File | null>(null);
  const [ffmpegLoadStatus, setFFmpegLoadStatus] = useState<
    "idle" | "loading" | "loaded" | "error"
  >("idle");
  const [tempVideoUrl, setTempAviVideoUrl] = useState<string | null>();

  const loadFFMPEG = async () => {
    setFFmpegLoadStatus("loading");
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
      console.log(`[FFMPEG]: ${message}`);
    });
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm",
      ),
    });
    setFFmpegLoadStatus("loaded");
  };

  const transcode = async () => {
    if (!tempVideoUrl) {
      return alert("Please upload a video first!");
    }

    console.log(`Transcoding video...`, { tempVideoUrl });

    const ffmpeg = ffmpegRef.current;

    await ffmpeg.writeFile("input.mp4", await fetchFile(tempVideoUrl));
    await ffmpeg.exec(["-i", "input.mp4", "output.mp4"]);
    const data = await ffmpeg.readFile("output.mp4");

    console.log(`Processed data!`, { data });

    // if (videoRef.current)
    //   videoRef.current.src = URL.createObjectURL(
    //     new Blob([data.buffer], { type: "video/mp4" }),
    //   );
  };

  const convertToMp3 = async () => {
    try {
      // ffmpeg -i input.mp4 -q:a 0 -map a output.mp3

      if (!tempVideoUrl) {
        return alert("Please upload a video first!");
      }

      console.log(`Converting video to mp3...`, { tempVideoUrl });

      const ffmpeg = ffmpegRef.current;

      await ffmpeg.writeFile("input.mp4", await fetchFile(tempVideoUrl));
      await ffmpeg.exec([
        "-i",
        "input.mp4",
        "-q:a",
        "0",
        "-map",
        "a",
        "output.mp3",
      ]);
      const data = await ffmpeg.readFile("output.mp4");

      console.log(`Processed data!`, { data });

      // if (videoRef.current)
      //   videoRef.current.src = URL.createObjectURL(
      //     new Blob([data.buffer], { type: "video/mp4" }),
      //   );
    } catch (err) {
      console.error(`Error converting video to mp3`, err);
    }
  };

  useEffect(() => {
    void loadFFMPEG();
  }, []);

  return (
    <>
      <h2 className="text-2xl">FFMpeg Load Status: {ffmpegLoadStatus}</h2>

      <main className="flex min-h-screen items-center justify-center text-white">
        <div
          id="player"
          className="aspect-video w-96 overflow-hidden rounded-lg"
        >
          <Player
            loop
            controls
            clickToPlay
            allowFullscreen
            showPlaybackRateControl
            moveToBeginningWhenEnded
            spaceKeyToPlayOrPause
            fps={FPS}
            component={HelloWorld}
            compositionWidth={1920}
            compositionHeight={1080}
            durationInFrames={5 * FPS}
            showVolumeControls={false}
            className="object-cover object-center"
            style={{
              height: "100%",
              width: "100%",
            }}
            inputProps={{
              logoColor1,
              logoColor2,
              titleColor,
              titleText,
            }}
          />
        </div>

        <div className="min-h- flex flex-col bg-white p-3.5">
          <Input
            id="logoColor1-picker"
            type="color"
            value={logoColor1}
            className="hidden"
            onChange={({ target: { value } }) => setLogoColor1(value)}
          />

          <Label
            htmlFor="logoColor1-picker"
            className="cursor-pointer rounded-full bg-black px-3 py-2"
          >
            Change Logo Color 1
          </Label>
          <Input
            id="logoColor2-picker"
            type="color"
            value={logoColor2}
            className="hidden"
            onChange={({ target: { value } }) => setLogoColor2(value)}
          />

          <Label
            htmlFor="logoColor2-picker"
            className="cursor-pointer rounded-full bg-black px-3 py-2"
          >
            Change Logo Color 2
          </Label>
          <Input
            id="titleColor-picker"
            type="color"
            value={titleColor}
            className="hidden"
            onChange={({ target: { value } }) => setTitleColor(value)}
          />

          <Label
            htmlFor="titleColor-picker"
            className="cursor-pointer rounded-full bg-black px-3 py-2"
          >
            Change Title Color
          </Label>

          <Button
            type="button"
            variant={"default"}
            onClick={() => {
              //
            }}
          >
            RENDER 🔥
          </Button>

          <Input
            id="avi-picker"
            type="file"
            className="hidden"
            onChange={({ target: { files } }) => {
              const fileToSet = files?.item(0) ?? null;

              if (!fileToSet) {
                return;
              }

              const fileUrl = URL.createObjectURL(fileToSet);

              setTempAviVideoUrl(fileUrl);
            }}
          />

          <Label
            htmlFor="avi-picker"
            className="cursor-pointer rounded-full bg-black px-3 py-2"
          >
            Upload Video
          </Label>

          <Button
            type="button"
            variant={"default"}
            onClick={() => {
              void convertToMp3();
            }}
          >
            Transcode video to mp3 🔥
          </Button>
        </div>

        {tempVideoUrl && (
          <video className="w-72" controls autoPlay muted src={tempVideoUrl} />
        )}
      </main>
    </>
  );
}
