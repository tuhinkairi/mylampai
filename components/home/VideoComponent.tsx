"use client";
import { useRef, useState } from "react";
import Image from "next/image";

export default function VideoComponent() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hideThumbnail, setHideThumbnail] = useState(false);

  const onVideoRefClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setHideThumbnail(true);
      } else {
        videoRef.current.pause();
      }
    }
  };

  return (
    <div className="mb-16 px-4">
      <h3 className="w-full font-medium text-center">
        Feel the magic
      </h3>
      <h2 className="text-center pb-2 font-bold text-[40px] px-8">
        Embed the worlds{" "}
      </h2>
      <div className="max-w-4xl mt-8 rounded-xl overflow-hidden mx-auto shadow-[0_0px_40px_rgba(140,82,255,0.2)] relative">
        <div
          className={`absolute top-0 left-0 z-10 bg-[url('/home/blogImage.svg')] bg-no-repeat bg-cover w-full bg-white h-full flex justify-center items-center ${
            hideThumbnail ? "hidden" : ""
          }`}
        >
          <Image
            src={"/home/video/play_button.svg"}
            alt="play button"
            height={100}
            width={100}
            className="cursor-pointer"
            onClick={onVideoRefClick}
          ></Image>
        </div>
        <video ref={videoRef} controls>
          <source src="/home/video/productdemo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
