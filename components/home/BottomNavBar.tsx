"use client";
// import { Home, Folder, Layout, Crown, Plus } from "lucide-react";
import {
  FileEarmarkText,
  FileEarmarkTextFill,
  CameraVideo,
  CameraVideoFill,
  Briefcase,
  BriefcaseFill,
  PersonCheck,
  PersonFillCheck,
} from "react-bootstrap-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore } from "@/utils/userStore";
import { usePathname } from "next/navigation";
import Link from "next/link";

const BottomNavBar = () => {
  const { userData } = useUserStore();
  const pathname = usePathname();

  return (
    <div className="block sm:hidden fixed z-20 drop-shadow-lg bottom-0 left-0 w-full bg-[#fafafa] rounded-t-lg">
      <div className="flex justify-between items-center relative px-4 py-3">
        <Link
          href="/talentmatch"
          className="flex justify-center absolute top-0 left-1/2 -translate-y-1/2 -translate-x-1/2 items-center rounded-lg bg-primary text-white w-12 h-12"
        >
          {pathname === "/talentmatch" ? (
            <PersonFillCheck className="w-6 h-6" />
          ) : (
            <PersonCheck className="w-6 h-6" />
          )}
        </Link>
        <Link
          href="/cvreviewer"
          className="group flex flex-col items-center text-primary w-full"
        >
          {pathname === "/cvreviewer" ? (
            <FileEarmarkTextFill className="w-6 h-6" />
          ) : (
            <FileEarmarkText className="w-6 h-6" />
          )}
          <span className="text-xs mt-1 text-[#697386]">Resume</span>
        </Link>

        <Link
          href={"/interview"}
          className="group flex flex-col items-center text-primary w-full"
        >
          {pathname === "/interview" ? (
            <CameraVideoFill className="w-6 h-6" />
          ) : (
            <CameraVideo className="w-6 h-6" />
          )}
          <span className="text-xs mt-1 text-[#697386]">Interview</span>
        </Link>

        <div className="flex justify-center flex-col items-center w-full translate-y-2">
          <span className="text-xs text-[#697386] text-center">Talent Match</span>
        </div>

        <Link
          href={"/career"}
          className="group flex flex-col items-center text-primary w-full"
        >
          {pathname === "/career" ? (
            <BriefcaseFill className="w-6 h-6" />
          ) : (
            <Briefcase className="w-6 h-6" />
          )}
          <span className="text-xs mt-1 text-[#697386]">Career</span>
        </Link>

        <Link
          href={"/profile"}
          className="group flex flex-col items-center text-primary w-full"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={userData?.image} alt={userData?.name} />
            <AvatarFallback className="rounded-lg">
              {userData?.name
                ? userData?.name
                    .split(/\s+/)
                    .map((word) => word[0].toUpperCase())
                    .join("")
                : "UN"}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs mt-1 text-[#697386]">Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNavBar;
