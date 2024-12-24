"use client";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";
// import { Button } from "../ui/button";
import Link from "next/link";
// import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
// import LoginComponent from "../global/Login";
// import { ArrowRight } from "lucide-react";
import { useRoleStore } from "@/utils/loginStore";

export default function HowWizeWork() {
  // const { role, setRole } = useRoleStore();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  // const [widthPercent, setWidthPercent] = useState(0);
  const [activeTab, setActiveTab] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    const sticky = stickyRef.current;

    if (!container || !sticky) return;

    const handleScroll = () => {
      const stickyTop = sticky.parentElement?.offsetTop || 0;

      let percentage =
        ((window.scrollY - stickyTop) / window.innerHeight) * 100;

      if (percentage > 200) {
        percentage = 200;
      }
      if (percentage > 170) {
        setActiveTab(3);
      } else if (percentage > 70) {
        setActiveTab(2);
      } else {
        setActiveTab(1);
      }

      if (percentage < 0) {
        percentage = 0;
      }

      container.style.transform = `translateX(calc(-${percentage}vw - 32px))`;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="p-2 md:px-8 pb-12 bg-[url('/home/herosection-background.svg')] bg-center">
      <div className="m-auto max-w-[1300px] h-[100px] flex justify-center items-center w-full gap-4 my-4">
        <div className="h-1 bg-black w-full max-w-[150px] sm:max-w-[200px] md:max-w-[33%] bg-gradient-to-r from-white to-primary"></div>
        <h3 className="w-full text-3xl md:text-4xl font-medium text-center">
          How&nbsp;<span className="text-primary">wiZ</span>e works
        </h3>
        <div className="h-1 bg-black w-full max-w-[150px] sm:max-w-[200px] shadow md:max-w-[33%] bg-gradient-to-r from-primary to-white"></div>
      </div>

      <div className="m-auto border rounded-2xl bg-white shadow-[0_0px_40px_rgba(140,82,255,0.2)]">
        <div className="">
          <div className="md:h-[330vh]">
            <div
              ref={stickyRef}
              className="md:overflow-hidden relative md:sticky md:top-6 md:h-screen"
            >
              <h2 className="text-center pt-10 pb-2 font-bold text-2xl md:text-[40px] px-4 md:px-8">
                Get matched with the right job in just 3 steps
              </h2>
              <p className="text-center mb-8 text-sm md:text-base text-muted-foreground mt-4 px-4 md:px-8 ">
                Upload your resume or create a profile, complete the AI
                interview, and get matched with a job or opportunity based on
                your performance
              </p>
              <div className="flex justify-between items-center md:max-w-[80%] mx-auto text-sm relative">
                <div className="absolute h-[1px] z-0 w-full bg-gray-200">
                  <div
                    className={`h-[1px] z-0 bg-primary transition-all ease-in-out ${
                      activeTab === 1
                        ? "w-0"
                        : activeTab === 2
                        ? "w-1/2"
                        : "w-full"
                    }`}
                  ></div>
                </div>
                <div
                  className={`px-4 py-2 w-full max-w-[120px] text-center font-medium rounded-full z-0 duration-500 ${
                    activeTab === 1
                      ? "text-white bg-primary"
                      : "border border-primary text-muted-foreground bg-white"
                  }`}
                >
                  Upload CV
                </div>
                <div
                  className={`px-4 py-2 w-full max-w-[120px] text-muted-foreground text-center font-medium rounded-full border z-10 duration-500 ${
                    activeTab === 3
                      ? "border-primary z-20 bg-white"
                      : activeTab === 2
                      ? "text-white bg-primary"
                      : " border-gray-200  bg-white"
                  }`}
                >
                  AI Interview
                </div>
                <div
                  className={`px-4 py-2 w-full max-w-[120px] text-center font-medium rounded-full z-10 duration-500 ${
                    activeTab === 3
                      ? "text-white bg-primary"
                      : "text-muted-foreground border-gray-200 border bg-white"
                  }`}
                >
                  Get Hired
                </div>
              </div>

              <div
                ref={containerRef}
                className="absolute top-20 will-change-transform left-0 w-[300vw] h-full hidden md:flex justify-start items-center"
              >
                <div className="flex shadow-lg flex-col bg-[url('/home/howwizework/50.svg')] bg-cover bg-center items-center justify-center gap-4 h-[400px] w-[720px] m-auto border rounded-lg"></div>
                <div className="flex shadow-lg flex-col bg-[url('/home/howwizework/49.svg')] bg-cover bg-center items-center justify-center gap-4 h-[400px] w-[720px] m-auto border rounded-lg"></div>
                <div className="flex shadow-lg flex-col bg-[url('/home/howwizework/offer.svg')] bg-cover bg-center items-center justify-center gap-4 h-[400px] w-[720px] m-auto border rounded-lg"></div>
              </div>
              <div className="md:hidden flex gap-4 p-2 pb-12 pt-8 justify-center items-center flex-col">
                <Image
                  src={"/home/howwizework/50.svg"}
                  alt="how wize works"
                  width={250}
                  height={250}
                  className="w-full rounded-lg overflow-hidden"
                ></Image>
                <div className="my-2 flex flex-col items-center">
                  <div className="bg-primary h-4 w-4 rounded-full"></div>
                  <div className="bg-primary h-8 w-1 "></div>
                  <div className="bg-primary h-4 w-4 rounded-full"></div>
                </div>
                <Image
                  src={"/home/howwizework/49.svg"}
                  alt="how wize works"
                  width={250}
                  height={250}
                  className="w-full rounded-lg overflow-hidden"
                ></Image>
                <div className="my-2 flex flex-col items-center">
                  <div className="bg-primary h-4 w-4 rounded-full"></div>
                  <div className="bg-primary h-8 w-1 "></div>
                  <div className="bg-primary h-4 w-4 rounded-full"></div>
                </div>
                <Image
                  src={"/home/howwizework/offer.svg"}
                  alt="how wize works"
                  width={250}
                  height={250}
                  className="w-full rounded-lg overflow-hidden"
                ></Image>
              </div>
            </div>
          </div>
          {/* <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-center text-muted-foreground">
              Start your career journey here
            </p>
            <Dialog>
              <DialogTrigger className="z-10">
                <div
                  onClick={() => setRole("user")}
                  className=" flex gap-4 items-center w-[120px] h-[45px] justify-center bg-primary rounded-lg text-white text-sm font-semibold py-2 md:py-3 px-2 md:px-3 md:max-w-[300px] hover:bg-primary-dark"
                >
                  Get matched
                </div>
              </DialogTrigger>
              <DialogContent className="bg-transparent border-none max-w-3xl shadow-none">
                <LoginComponent />
              </DialogContent>
            </Dialog>
          </div> */}

          {/* <div className="text-center text-muted-foreground my-8">or</div> */}
          {/* <div>
            <h2 className="text-center mb-2 font-bold text-[40px] px-8">
              Ace Your Next Opportunity the Smarter Way with Us
            </h2>
            <p className="text-center mb-12 text-muted-foreground px-8">
              Either you have to optimise your CV for your next application or
              have to practise for your next interview, improve your chances by
              using our AI CV Reviewer and AI Mock Interviewer
            </p>
          </div> */}
        </div>
        <div className="px-2 md:px-8 pb-8">
          <div className="border bg-primary text-white rounded-[1rem] gap-x-4 gap-y-6 p-4 mt-8 grid grid-cols-12">
            <div className="col-span-12 md:col-span-7 md:hidden block h-full bg-[#ffffff40] backdrop-blur-lg rounded-lg bg-no-repeat bg-cover bg-center ">
              <Image
                src={"/home/howwizework/46.svg"}
                alt="cv review"
                width={600}
                height={400}
                className="w-full aspect-[3/2]"
              ></Image>
            </div>
            <div
              className={`col-span-12 md:col-span-5 flex flex-col gap-4 md:px-12 md:pt-12`}
            >
              <h2 className="text-[28px] md:text-[40px] font-semibold uppercase">
                AI CV Reviewer
              </h2>
              <p className="text-[#efefef]">
                Enhance your resume in just 30 seconds with AI powered CV review
                for personalized feedback and optimization tips!
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex items-start md:items-center gap-2 flex-col md:flex-row">
                  <div className="flex items-center gap-2 w-44">
                    <Image
                      src={"/home/herosection/tickwhite.svg"}
                      alt="tick sign"
                      width={16}
                      height={16}
                      className="rounded-sm"
                    ></Image>
                    <span>Detailed feedback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Image
                      src={"/home/herosection/tickwhite.svg"}
                      alt="tick sign"
                      width={16}
                      height={16}
                      className="rounded-sm"
                    ></Image>
                    <span>Analysis on 10+ parameters</span>
                  </div>
                </div>
                <div className="flex items-start md:items-center gap-2 flex-col md:flex-row">
                  <div className="flex items-center gap-2 w-44">
                    <Image
                      src={"/home/herosection/tickwhite.svg"}
                      alt="tick sign"
                      width={16}
                      height={16}
                      className="rounded-sm"
                    ></Image>
                    <span>Fast and accurate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Image
                      src={"/home/herosection/tickwhite.svg"}
                      alt="tick sign"
                      width={16}
                      height={16}
                      className="rounded-sm"
                    ></Image>
                    <span>Follows industry standards</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 flex">
                <Link
                  href="/cvreviewer"
                  className="md:max-w-[150px] w-full text-sm py-2 bg-white px-4 text-primary text-center hover:bg-gray-50 rounded-md"
                >
                  Try it!
                </Link>
              </div>
            </div>
            <div className="col-span-12 md:col-span-7 hidden md:block h-full bg-[#ffffff40] backdrop-blur-lg rounded-lg bg-no-repeat bg-cover bg-center ">
              <Image
                src={"/home/howwizework/46.svg"}
                alt="cv review"
                width={600}
                height={400}
                className="w-full aspect-[3/2]"
              ></Image>
            </div>
            <div className="col-span-12 md:col-span-7 h-full bg-[#ffffff40] backdrop-blur-lg rounded-lg bg-no-repeat bg-cover bg-center ">
              <Image
                src={"/home/howwizework/47.svg"}
                alt="ai interview"
                width={600}
                height={400}
                className="w-full aspect-[3/2]"
              ></Image>
            </div>
            <div
              className={`col-span-12 sm:col-span-5 flex flex-col gap-4 sm:px-12 sm:pt-12`}
            >
              <h2 className="text-[28px] text-nowrap md:text-[40px] font-semibold uppercase">
                AI Mock Interviewer
              </h2>
              <p className="text-[#efefef]">
                Practice, perfect, and ace your interviews with personalized
                practice, real feedback, and real results!
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex md:items-center items-start flex-col md:flex-row gap-2 ">
                  <div className="flex items-center gap-2 w-44">
                    <Image
                      src={"/home/herosection/tickwhite.svg"}
                      alt="tick sign"
                      width={16}
                      height={16}
                      className="rounded-sm"
                    ></Image>
                    <span>Fully customizable</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Image
                      src={"/home/herosection/tickwhite.svg"}
                      alt="tick sign"
                      width={16}
                      height={16}
                      className="rounded-sm"
                    ></Image>
                    <span>Realistic experience</span>
                  </div>
                </div>
                <div className="flex md:items-center items-start flex-col md:flex-row gap-2 ">
                  <div className="flex items-center gap-2 w-44">
                    <Image
                      src={"/home/herosection/tickwhite.svg"}
                      alt="tick sign"
                      width={16}
                      height={16}
                      className="rounded-sm"
                    ></Image>
                    <span>Built-in compiler</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Image
                      src={"/home/herosection/tickwhite.svg"}
                      alt="tick sign"
                      width={16}
                      height={16}
                      className="rounded-sm"
                    ></Image>
                    <span>Detailed analytics and reports</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 flex">
                <Link
                  href="/interview"
                  className="md:max-w-[150px] w-full text-sm py-2 bg-white px-4 text-primary text-center hover:bg-gray-50 rounded-md"
                >
                  Try it!
                </Link>
              </div>
            </div>
          </div>
          {/* 
          <div className="flex flex-col items-center justify-center gap-4 my-8">
            <p className="text-center text-muted-foreground">
              Improve your chances
            </p>
            <Button className="hover:bg-primary-dark">Experience it</Button>
          </div> */}
        </div>
      </div>
    </div>
  );
}
