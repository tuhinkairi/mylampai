"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Bookmark, BookmarkMinus } from "lucide-react";
import {
  House,
  HouseFill,
  FileEarmarkText,
  FileEarmarkTextFill,
  CameraVideo,
  CameraVideoFill,
  Briefcase,
  BriefcaseFill,
  PersonCheck,
  PersonFillCheck,
  PersonWorkspace,
} from "react-bootstrap-icons";
import getUserFromAuth from "@/lib/getUserFromAuth";

const items = [
  {
    title: "Talent Match",
    url: "/talentmatch",
    view: "user",
    icons: [PersonCheck, PersonFillCheck],
    items: [
      { title: "General", url: "#" },
      { title: "Team", url: "#" },
      { title: "Billing", url: "#" },
      { title: "Limits", url: "#" },
    ],
  },
  {
    title: "Interview",
    url: "/interview",
    view: "user",
    icons: [CameraVideo, CameraVideoFill],
    items: [
      { title: "Introduction", url: "#" },
      { title: "Get Started", url: "#" },
      { title: "Tutorials", url: "#" },
      { title: "Changelog", url: "#" },
    ],
  },
  {
    title: "Resume",
    url: "/cvreviewer",
    view: "user",
    icons: [FileEarmarkText, FileEarmarkTextFill],
    items: [
      { title: "Genesis", url: "#" },
      { title: "Explorer", url: "#" },
      { title: "Quantum", url: "#" },
    ],
  },
  {
    title: "Career",
    url: "/career",
    view: "user",
    icons: [Briefcase, BriefcaseFill],
    items: [
      { title: "Introduction", url: "#" },
      { title: "Get Started", url: "#" },
      { title: "Tutorials", url: "#" },
      { title: "Changelog", url: "#" },
    ],
  },
  {
    title: "Talent Pool",
    url: "/talentpool",
    view: "recruiter",
    icons: [Bookmark, BookmarkMinus],
    items: [
      { title: "General", url: "#" },
      { title: "Team", url: "#" },
      { title: "Billing", url: "#" },
      { title: "Limits", url: "#" },
    ],
  },
  {
    title: "Create Job",
    url: "/job",
    view: "recruiter",
    icons: [Bookmark, BookmarkMinus],
    items: [
      { title: "General", url: "#" },
      { title: "Team", url: "#" },
      { title: "Billing", url: "#" },
      { title: "Limits", url: "#" },
    ],
  },
];

const uniKey = () => { return Math.random().toString(36).substr(2, 9) };
export default function NavMain() {
  interface User {
    role: string;
    [key: string]: any;
  }

  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    getUserFromAuth().then((data) => {
      setUser(data);
    });
  }, [setUser]);

  return (
    <div key={`${uniKey}`} className="flex flex-col gap-3">
      {items.map((item, index) => (
        user?.role === item.view && (
          <div key={index} className="group">
            <Link href={item.url} className="flex flex-col gap-1 w-full items-center">
              <div className="p-[7px] border border-white group-hover:border-slate-200 rounded-lg">
                {item.icons?.[0] &&
                  React.createElement(item.icons[0], {
                    className:
                      "block w-6 h-6 text-[#697386] group-focus:text-primary group-hover:text-primary group-hover:hidden",
                  })}
                {item.icons?.[1] &&
                  React.createElement(item.icons[1], {
                    className:
                      "hidden w-6 h-6 text-[#697386] group-focus:text-primary group-hover:text-primary group-hover:block",
                  })}
              </div>
              <p className="text-[0.6rem]">{item.title}</p>
            </Link>
          </div>
        )
      ))}

    </div>
  );
}
