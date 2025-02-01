import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronFirst,X } from "lucide-react";
import { ReactNode } from "react";
import {ScrollArea} from "@/components/ui/scroll-area"
import { NavUser } from "../global/nav-user";


interface SideBarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  children: ReactNode;
}

// Props for SideBarItem
interface SideBarItemProps {
  icon: ReactNode;
  text: string;
  active?: boolean;
  alert?: boolean;
}
export default function SideBar({ isOpen, toggleSidebar, children }: SideBarProps) {
  // Disable background scrolling when sidebar is open
  if (typeof window !== "undefined") {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }

  return (
      <aside
        className={`fixed top-0 left-0 h-screen z-50 transform transition-all duration-300 ease-in-out bg-white border-r shadow-sm ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
       
        <nav className="h-full flex flex-col overflow-y-auto ">
        <ScrollArea>
          <div className="p-4 pb-2 flex justify-between items-center">
            <Link href={"/"} className={`w-32`}>
              <Image
                src={"/home/navbar/wizelogo.svg"}
                height={200}
                width={180}
                alt="logo"
                className="w-auto h-full drop-shadow-md"
              />
            </Link>
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              <ChevronFirst />
            </button>
          </div>
          <div className="border-t flex p-3">
            <Image
              src={"/sidebar/icon.svg"}
              alt="UserIcon"
              className="w-10 h-10 rounded-md"
              width={10}
              height={10}
            />
            <div className="flex justify-between items-center w-52 ml-3">
              <div className="leading-4">
                <h4 className="font-semibold">Dev</h4>
                <span className="text-xs text-gray-600">Personal</span>
              </div>
            </div>
            <button className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100">
              <ChevronDown />
            </button>
          </div>
          <ul className="flex-2 px-3">{children}</ul>
          <div className="flex flex-col items-center justify-around border-2 border-dashed border-gray-400 m-4 p-4 rounded-md w-72">
            <div className="flex items-center justify-between w-full">
              <h4 className="text-lg font-semibold justify-self-center mx-auto">
                Star designs and folders
              </h4>
              <button className="text-gray-600 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-600 text-center mt-2">
              Star your most important items by selecting the star icon on a design or folder
            </p>
          </div>
          <div className="flex flex-col m-4 p-4">
            <div className="flex items-center">
              <p className="text-xm mr-1">Recent Designs</p>
              <button className="p-0">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="px-4 relative b-4"><NavUser/></div>
          
          </ScrollArea>
        </nav>
       
      </aside>
  );
}



export function SideBarItem({ icon, text, active, alert }:SideBarItemProps) {
  return (
    <li
      className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-lg cursor-pointer transition-colors ${
        active
          ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
          : "hover:bg-indigo-50 text-gray-600"
      }`}
    >
      {icon}
      <span className="w-52 ml-3">{text}</span>
      {alert && <div className="absolute right-2 w-2 h-2 rounded bg-indigo-400"></div>}
    </li>
  );
}
