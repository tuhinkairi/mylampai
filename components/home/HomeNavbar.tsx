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
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import LoginComponent from "../global/Login";
import { useSession } from "next-auth/react";
import { nextAuthLogin } from "@/actions/authActions";
import { signOut } from "next-auth/react";
import { setCookie } from "@/utils/cookieUtils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useRoleStore } from "@/utils/loginStore";
import { usePathname } from "next/navigation";

const HomeNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { data } = useSession();
  const pathname = usePathname();

  const { role, setRole } = useRoleStore();

  const { userData, setUserData } = useUserStore();
  const [initials, setInitials] = useState("Home");
  const hiddenOn = ["/recruiter/"];

  const isHidden = hiddenOn.some((route) =>
    pathname.startsWith(route.replace(/\/$/, ""))
  );
  

  useEffect(() => {
    const handleScroll = () => {
      const triggerPoint = 100;
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

  useEffect(() => {
    if (role === null) return;

    if (!data || !data.user) {
      return;
    }

    const email = data.user.email as string;

    const handleLogin = async (email: string, role: "user" | "recruiter") => {
      const res = await nextAuthLogin({ email, role });

      if (res.status === "success" && res.user && res.accessToken) {
        setUserData(res.user, res.accessToken);
        setCookie("accessToken", res.accessToken);
      } else {
        toast.error(res.message);
      }

      await signOut();
    };

    handleLogin(email, role);
  }, [data, router, role, setUserData]);

  useEffect(() => {
    const getUserInitials = () => {
      if (!userData?.name) return "Home";

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
  
  if (isHidden) return null;

  return (
    <div
      className={`flex justify-end items-center gap-4 bg-transparent transition px-8 fixed top-0 w-full z-50 min-h-[64px]`}
    >
      <Link
        href={"/"}
        className={`flex items-center h-11 overflow-hidden ${
          scrolled ? "p-1 px-2" : "p-0"
        } md:max-w-[150px] max-w-24 w-full absolute left-8 z-10 transition-all duration-300`}
      >
        <Image
          src={"/home/navbar/wizelogo.svg"}
          height={100}
          width={180}
          alt="logo"
          className="w-auto h-full drop-shadow-lg"
        />
      </Link>

      <div className={`flex justify-end backdrop-blur-md rounded-lg md:hidden `}>
        {userData ? (
          <Link
            href={"/talentmatch"}
            className="flex items-center bg-primary py-1.5 text-white text-sm pl-2 pr-2 gap-1 rounded-lg "
          >
            {initials}
            <Image src={"/home/userNavbar.svg"} alt="" height={20} width={20} />
          </Link>
        ) : (
          <Dialog>
            <DialogTrigger>
              <div
                onClick={() => setRole("user")}
                className="flex items-center bg-primary py-1.5 text-white text-sm px-2  gap-1 rounded-lg"
              >
                Login / Sign Up
              </div>
            </DialogTrigger>
            <DialogContent className="bg-transparent border-none max-w-3xl">
              <LoginComponent />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div
        className={`md:flex relative text-sm hidden justify-end border items-center w-${
          scrolled ? "full" : "[600px]"
        } gap-${
          userData ? 6 : 4
        } px-[5px] my-2 min-h-[45px] backdrop-blur-md font-medium rounded-lg shadow-sm`}
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
            href={"/talentmatch"}
            className="flex items-center bg-primary h-[35px] text-white pl-4 pr-2 gap-2 rounded-lg "
          >
            {initials}
            <Image src={"/home/userNavbar.svg"} alt="" height={20} width={20} />
          </Link>
        ) : (
          <Dialog>
            <DialogTrigger>
              <div
                onClick={() => setRole("user")}
                className="flex items-center bg-primary h-[35px] text-white px-4  gap-2 rounded-lg"
              >
                Login / Sign Up
              </div>
            </DialogTrigger>
            <DialogContent className="bg-transparent border-none max-w-3xl">
              <LoginComponent />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default HomeNavbar;
