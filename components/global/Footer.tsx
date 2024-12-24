"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowBigLeft,
  ArrowRight,
  Copyright,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    toast.info("Subscribing..");

    try {
      const res = await fetch("/api/newsletteremails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast.success("Subscribed!");
        setEmail("");
      }
    } catch (err) {
      toast.error("Failed");
      console.log(err);
    }
  };

  return (
    <>
      <div className="flex flex-col justify-around lg:flex-row gap-8 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.7)] bg-[url('/home/herosection-background.svg')] py-[10px] px-2 md:px-8 mt-16">
        <div className="w-full max-w-[600px] rounded-lg bg-primary-foreground p-4">
          <div className="bg-white w-full rounded-lg py-2 px-8 shadow-br">
            <div className="flex items-center justify-between text-2xl font-bold text-[#00000090] border-b-[1px] pb-2">
              <Image
                className="w-auto h-[35px]"
                src="/home/navbar/wizelogo.svg"
                height={100}
                width={180}
                alt="logo"
              />
            </div>
            <div className="flex w-full flex-col md:flex-row md:gap-0 items-start justify-between p-2 ">
              <div className="w-full flex flex-col items-start justify-between gap-4">
                <h3 className="text-[#8C52FF] font-semibold uppercase">
                  Stay Connected
                </h3>
                <div className="flex gap-4 items-center text-[#697386] text-xs ">
                  <Mail className="text-primary w-4 h-4" />
                  <a href="mailto:info@wize.co.in">info@wize.co.in</a>
                </div>
                <div className="flex gap-4 items-center text-[#697386] text-xs ">
                  <Phone className="text-primary w-4 h-4" />
                  <a href="tel:+91-9244160441"> +91-92441 60441</a>
                </div>
                <div className="flex gap-4 items-center text-[#697386] text-xs ">
                  <MapPin className="text-primary w-4 h-4" />
                  <a
                    href="https://maps.app.goo.gl/33CKfsXymGancg7fA"
                    target="_blank"
                  >
                    IIT Kharagpur (W Bengal) 721302
                  </a>
                </div>
              </div>
              <div className="w-full flex flex-col items-start justify-between gap-2 text-[#00000090]">
                <h3 className="text-[#8C52FF] font-semibold uppercase ">
                  Stay Updated
                </h3>
                <form
                  onSubmit={handleSubmit}
                  className="flex items-center justify-start w-full overflow-hidden  rounded-lg "
                >
                  <input
                    placeholder="Sign Up for our Newsletter"
                    type="email"
                    onChange={handleChange}
                    className="border placeholder:text-[#697386] rounded-tl-lg rounded-bl-lg text-xs w-full h-[30px] outline-none py-2 px-4 "
                  />
                  <button type="submit">
                    <Image
                      className="bg-[#8C52FF] h-[30px] w-[40px] p-2"
                      src={"/home/arrowInput.svg"}
                      height={30}
                      width={30}
                      alt="arrowInput"
                    />
                  </button>
                </form>
                <div className="w-full relative flex items-start gap-4 border rounded-lg py-2 px-3 pr-4">
                  <Image
                    src={"/home/desktop.svg"}
                    height={45}
                    width={45}
                    alt="desktop"
                    className="scale-125"
                  />
                  <div className="text-xs text-left w-full text-[#697386]">
                    Know everything about wiZe in just one call
                  </div>
                  <a
                    href="https://calendly.com/mylamp/wize"
                    target="_blank"
                    className="group absolute flex items-center bottom-0 gap-1 right-4 text-primary text-xs px-2 py-1"
                  >
                    Schedule Call{" "}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-all" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col text-[#697386] justify-between items-start font-medium">
          <div className="w-full flex justify-evenly pt-8 mx-auto min-h-32">
            <div className="flex flex-col justify-start">
              <div className="uppercase mb-4">Talent</div>
              {/* <ul>
                <li className="text-sm hover:text-primary cursor-pointer">
                  Link 1
                </li>
                <li className="text-sm hover:text-primary cursor-pointer">
                  Link 2
                </li>
                <li className="text-sm hover:text-primary cursor-pointer">
                  Link 3
                </li>
              </ul> */}
            </div>
            <div className="flex flex-col justify-start">
              <div className="uppercase mb-4">Recruit</div>
              {/* <ul>
                <li className="text-sm hover:text-primary cursor-pointer">
                  Link 1
                </li>
                <li className="text-sm hover:text-primary cursor-pointer">
                  Link 2
                </li>
                <li className="text-sm hover:text-primary cursor-pointer">
                  Link 3
                </li>
              </ul> */}
            </div>
            <div className="flex flex-col justify-start">
              <div className="uppercase mb-4">Know More</div>
              {/* <ul>
                <li className="text-sm hover:text-primary cursor-pointer">
                  Link 1
                </li>
                <li className="text-sm hover:text-primary cursor-pointer">
                  Link 2
                </li>
                <li className="text-sm hover:text-primary cursor-pointer">
                  Link 3
                </li>
              </ul> */}
            </div>
          </div>
          <div className="pt-[10px] border-t-[1px] flex md:flex-row flex-col-reverse gap-2 justify-between items-center w-full text-xs">
            <div className=" flex items-center ">
              <Copyright className="w-4" /> &nbsp; 2024 All rights reserved,
              wiZe AI
            </div>
            <div className="">
              <span className="hover:text-primary cursor-pointer">
                Privacy Policy
              </span>{" "}
              |{" "}
              <span className="hover:text-primary cursor-pointer">
                Terms of Use
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Link
                href={"https://www.linkedin.com/company/wize-mylamp/"}
                className="w-[30px] h-[30px] border flex items-center justify-center rounded-lg"
                target="_blank"
              >
                <Image
                  className="grayscale opacity-70 hover:opacity-100 hover:grayscale-0"
                  src={"/social/linkedin.svg"}
                  width={16}
                  height={16}
                  alt="linkedin"
                />
              </Link>
              <Link
                href={"https://www.instagram.com/wize.mylamp/"}
                className="w-[30px] h-[30px] border flex items-center justify-center rounded-lg"
                target="_blank"
              >
                <Image
                  className="grayscale opacity-70 hover:opacity-100 hover:grayscale-0"
                  src={"/social/instagram.svg"}
                  width={16}
                  height={16}
                  alt="instagram"
                />
              </Link>
              <Link
                href={"https://x.com/wize_mylamp"}
                className="w-[30px] h-[30px] border flex items-center justify-center rounded-lg"
                target="_blank"
              >
                <Image
                  className="grayscale opacity-70 hover:opacity-100 hover:grayscale-0"
                  src={"/social/twitter-x.svg"}
                  width={16}
                  height={16}
                  alt="twitter"
                />
              </Link>
              <Link
                href={"https://www.youtube.com/@wize-mylamp"}
                className="w-[30px] h-[30px] border flex items-center justify-center rounded-lg"
                target="_blank"
              >
                <Image
                  className="grayscale opacity-70 hover:opacity-100 hover:grayscale-0"
                  src={"/social/youtube.svg"}
                  width={16}
                  height={16}
                  alt="youtube"
                />
              </Link>
            </div>
          </div>
          {/* <div className="mt-4 text-2xl text-center mx-auto translate-y-3">
            Copyright &copy; 2024 myLamp AI - All rights reserved
            <div className="h-[1px] w-full bg-white"></div>
          </div> */}
        </div>
      </div>
    </>
  );
}
