"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useUserStore } from "@/utils/userStore";
import {
  TalentComponent,
  RecruiterComponent,
  AboutComponent,
} from "./HomeNavbarComponents";
import { Flag, HelpCircle, Menu, Trash } from "lucide-react";
import SideBar, { SideBarItem } from "@/components/home/SideBar";
import { Home, Grid, Boxes } from "lucide-react";
import { usePathname } from "next/navigation";

const RecruiterNavbar = () => {
 
  const [scrolled, setScrolled] = useState(false);

  const { userData } = useUserStore();
  const [initials, setInitials] = useState("Profile");
  const pathname = usePathname();
  const visibleOn = ["/recruiter"];

  const isVisible = visibleOn.some((route) => pathname.startsWith(route));
  

  useEffect(() => {
    const handleScroll = () => {
      const triggerPoint = 1000;
      if (window.scrollY > triggerPoint) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to handle sidebar visibility

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const getUserInitials = () => {
      if (!userData?.name) return "Profile";

      let name = userData.name;

      let arr = name?.trim().split(" ");

      let initials = "";

      for (let i = 0; i < arr.length; i++) {
        if (arr[i].length > 0) initials += arr[i][0].toUpperCase();
      }

      return initials;
    };

    setInitials(getUserInitials);
  }, [userData]);

  if (!isVisible) return null; 

  return (
    <div
      className={`flex justify-end items-center gap-4 bg-[#ffffff20] backdrop-blur-sm transition px-8 fixed top-0 w-full z-50 min-h-[64px]`}
    >
      <div className="flex items-center justify-between absolute top-5 left-0 right-0 z-50 px-4">
        <button
          onClick={toggleSidebar}
          className={`text-2xl p-2 bg-white hover:bg-gray-50 text-black rounded-lg shadow-md ${
            isSidebarOpen ? "hidden" : ""
          } md:hidden`}
        >
          <Menu />
        </button>
        <Link
          href="/"
          className={`absolute md:mt-5 left-1/2 transform -translate-x-1/2 md:left-8 md:transform-none flex items-center h-11 overflow-hidden ${
            scrolled ? "p-1 px-2" : "p-0"
          } max-w-[150px] transition-all duration-300`}
        >
          <Image
            src="/home/navbar/wizelogo.svg"
            height={100}
            width={180}
            alt="logo"
            className="w-auto h-full drop-shadow-md"
          />
        </Link>
        <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
          <SideBarItem icon={<Home />} text="Home" active={true} />
          <SideBarItem icon={<Grid />} text="Talent Match" alert={true} />
          <SideBarItem icon={<Boxes />} text="Interview" />
          <SideBarItem icon={<Flag />} text="Resume" />
          <SideBarItem icon={<HelpCircle />} text="Career" />
          <SideBarItem icon={<Trash />} text="Trash" />
        </SideBar>
      </div>

      <div
        className={`md:flex relative text-sm hidden justify-end border items-center w-${
          scrolled ? "full" : "[600px]"
        } gap-${userData ? 8 : 4} px-[5px] my-2 min-h-[45px] backdrop-blur-md font-medium rounded-lg shadow-sm`}
      >
        <Link
          href={"/"}
          className="transition-all py-2 px-4 rounded-lg duration-300 hover:bg-primary-foreground "
        >
          Home
        </Link>

        <TalentComponent />

        <RecruiterComponent />

        <AboutComponent />

        {userData ? (
          <Link
            href={"/profile"}
            className="flex items-center bg-primary h-[35px] text-white pl-4 pr-2 gap-2 rounded-lg "
          >
            {initials}
            <Image src={"/home/userNavbar.svg"} alt="" height={20} width={20} />
          </Link>
        ) : (
          <Link
            href={"/login"}
            className="flex items-center bg-primary h-[35px] text-white px-4 gap-2 rounded-lg"
          >
            Login / Sign Up
          </Link>
        )}
      </div>
    </div>
  );
};

export default RecruiterNavbar;
