"use client";
import NavMain from "@/components/global/nav-main";
import { NavUser } from "@/components/global/nav-user";
import { useUserStore } from "@/utils/userStore";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  image?: string;
};

export function AppSidebar({ user }: { user: User }) {
  const { setUser } = useUserStore();

  const pathname = usePathname();
  const hiddenOn = ["/create-profile"];


  const isHidden = hiddenOn.some((route) => pathname.startsWith(route));

  useEffect(() => {
    setUser(user);
  }, [setUser, user]);

  if (isHidden||pathname.match(/^\/talentpool\/.*/)) return null;

  return (
    <div className="hidden sm:flex flex-col items-center justify-between py-4 max-w-20 w-full">
      <div className="flex items-center flex-col gap-4">
        <Link href={user.role==="recruiter"?'/talentpool':'/talentmatch'} className="shadow-lg">
          <Image
            src={"/sidebar/wize_logo_whitebg.svg"}
            alt="wiZe logo"
            width={50}
            height={50}
          />
        </Link>
        <NavMain />
      </div>
      <NavUser />
    </div>
  );
}
