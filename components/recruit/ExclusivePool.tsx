"use client";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import LoginComponent from "../global/Login";
import { ArrowRight } from "lucide-react";
import { useRoleStore } from "@/utils/loginStore";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function ExclusivePool() {
  const { role, setRole } = useRoleStore();
  return (
    <>
      <div className="flex relative justify-between flex-col-reverse sm:flex-row items-center mx-auto max-w-[85%] text-white h-[265px] px-6 sm:px-[50px] rounded-lg bg-[#0d2126] mt-[200px]">
        <div className="flex flex-col items-start justify-center gap-4 max-w-[600px] h-full ">
          <h2 className="text-2xl sm:text-[32px] font-bold max-w-[600px]">
            We nurture, assess & match
            <div className="mt-2">
              {" "}
              <span className="text-primary">Talent</span> with premium
              Opportunities
            </div>
          </h2>
          <p className="font-medium text-sm">
            Join the exclusive talent pool with just one application and
            assessment, unlocking access to thousands of premium opportunities
            worldwide.
          </p>
          <div className="flex mt-4">
            <Dialog>
              <DialogTrigger className="z-10">
                <div
                  onClick={() => setRole("user")}
                  className="flex gap-4 z-10 items-center w-[200px] h-[35px] justify-center rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold md:py-3 pl-4 duration-100 px-2 md:px-3 md:max-w-[300px]"
                >
                  {" "}
                  Get hired instantly
                  <ArrowRight size={24} />
                </div>
              </DialogTrigger>
              <DialogContent className="bg-transparent border-none max-w-3xl shadow-none">
              <VisuallyHidden>
                <DialogTitle>
                  hidden title
                </DialogTitle>
              </VisuallyHidden>
                <LoginComponent />
              </DialogContent>
            </Dialog>
            <Link
              href="/"
              className=" flex gap-4 items-center w-[200px] h-[35px] justify-center border-2 rounded-lg text-sm font-semibold md:py-3 pl-4 md:pl-8 px-2 md:px-3 hover:bg-gray-700 duration-100 md:max-w-[300px] ml-5"
            >
              Know More
              <ArrowRight size={24} />
            </Link>
          </div>
        </div>
        <div className="sm:h-[300px] max-w-[400px] absolute top-0 -translate-y-[60%] right-24">
          <Image
            src="/home/recruit/talent_laptop.svg"
            height={300}
            width={500}
            alt="community"
            className="w-full h-auto"
          />
        </div>
      </div>
    </>
  );
}
