"use client";
import Link from "next/link";
import React from "react";
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
} from "react-bootstrap-icons";

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

export default function NavMain() {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (

        item.view==="user" ?(<div key={index} className="group">
          <Link
            href={item.url}
            className="flex flex-col gap-1 w-full items-center"
          >
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
        </div>):(<div key={index} className="group">
          <Link
            href={item.url}
            className="flex flex-col gap-1 w-full items-center"
          >
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
        </div>)
      ))}
    </div>
  );
}
