"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  FileEarmarkText,
  FileEarmarkTextFill,
  HeartFill,
  Heart,
  Chat,
  ChatFill
} from "react-bootstrap-icons";
import getUserFromAuth from "@/lib/getUserFromAuth";



const uniKey = () => { return Math.random().toString(36).substr(2, 9) };

export default function NavMain({ talentPoolId }: {
  talentPoolId: string;
}) {
  interface User {
    role: string;
    [key: string]: any;
  }

  const [user, setUser] = useState<User | null>(null);
  const items = [
    {
      title: "Favourites",
      url: `/talentpool/${talentPoolId}/favourites`,
      view: "recruiter",
      icons: [Heart, HeartFill],
      items: [
        { title: "General", url: "#" },
        { title: "Team", url: "#" },
        { title: "Billing", url: "#" },
        { title: "Limits", url: "#" },
      ],
    },
    {
      title: "Chats",
      url: `/talentpool/${talentPoolId}/chats`,
      view: "recruiter",
      icons: [Chat, ChatFill],
      items: [
        { title: "Introduction", url: "#" },
        { title: "Get Started", url: "#" },
        { title: "Tutorials", url: "#" },
        { title: "Changelog", url: "#" },
      ],
    },
    {
      title: "Offers",
      url: `/talentpool/${talentPoolId}/offers`,
      view: "recruiter",
      icons: [FileEarmarkText, FileEarmarkTextFill],
      items: [
        { title: "Genesis", url: "#" },
        { title: "Explorer", url: "#" },
        { title: "Quantum", url: "#" },
      ],
    },
    //   {
    //     title: "Others",
    //     url: "/other",
    //     view: "user",
    //     icons: [Briefcase, BriefcaseFill],
    //     items: [
    //       { title: "Introduction", url: "#" },
    //       { title: "Get Started", url: "#" },
    //       { title: "Tutorials", url: "#" },
    //       { title: "Changelog", url: "#" },
    //     ],
    //   },
  ];
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
