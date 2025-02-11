"use client";
import Image from "next/image";
import Link from "next/link";
// import Typing from "./Typing";
import { useEffect } from "react";
import InfiniteLogoSlide from "./InfiniteLogoSlide";
import { ArrowRight } from "lucide-react";
import Globe from "@/components/ui/globe";
import { useSession } from "next-auth/react";
import { nextAuthLogin } from "@/actions/authActions";
import { signOut } from "next-auth/react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { setCookie } from "@/utils/cookieUtils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useRoleStore } from "@/utils/loginStore";
import { useUserStore } from "@/utils/userStore";
import LoginComponent from "../global/Login";

export default function HeroSection() {
  const router = useRouter();
  const { data } = useSession();

  const { role, setRole } = useRoleStore();

  const { userData, setUserData } = useUserStore();

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

  return (
    <>
      <div className="flex flex-col select-none bg-[url('/home/herosection-background.svg')] max-w-screen overflow-hidden relative min-h-dvh">
        <div className="absolute w-full h-[150px] bottom-0 bg-gradient-to-b from-transparent to-white z-20"></div>
        <div className="flex flex-col lg:flex-row mt-[70px] relative justify-evenly items-center min-h-1/2 sm:min-h-[calc(100vh-80px)] px-8 gap-6 w-full m-auto">
          <div className="flex flex-col justify-center flex-1 w-full z-10">
            <div className=" relative font-bold lg:ml-10 mb-6 mt-24 sm:mt-0">
              <div className="flex items-center justify-evenly text-sm font-light absolute top-0 -translate-y-[150%] rounded-lg px-4 py-1 gap-2 bg-[#fafafa] border max-w-[300px]">
                Backed by{" "}
                <Image
                  src={"/home/herosection/nsrcel_logo.svg"}
                  width={80}
                  height={40}
                  className="w-auto h-[20px]"
                  alt="IIM Banglore logo"
                />{" "}
                IIM Banglore
              </div>
              <div className=" hidden sm:block font-semibold text-2xl sm:text-[40px] leading-4 sm:leading-10">
                We nurture, assess & match
                <div className="md:mt-2">
                  {" "}
                  <span className="text-primary"> Talent</span> with premium
                  Opportunities
                </div>
              </div>
              <div className="sm:hidden font-bold text-[27px] sm:text-[40px]">
                We nurture, assess & match
                <span className="text-primary"> Talent</span> with premium
                Opportunities
              </div>
            </div>
            <div className="text-muted-foreground text-xs sm:text-base lg:ml-10 mb-9 max-w-[640px]">
              Join the exclusive talent pool with just one application and
              assessment, unlocking access to thousands of premium opportunities
              worldwide.
            </div>
            <div className="flex flex-col sm:flex-row gap-4 relative">
              <div className="hidden md:block absolute bottom-0 z-0 translate-y-full left-1/2 -translate-x-1/2 scale-125 w-[600px] h-[600px] overflow-hidden">
                <Globe />
              </div>

              {userData ? (
                <Link
                  href={"/talentmatch"}
                  className="z-10 flex gap-4 items-center md:w-[225px] h-[45px] justify-center bg-primary rounded-lg text-white text-sm font-semibold py-2 md:py-3 pl-4 md:pl-8 px-2 md:px-3 md:max-w-[300px] hover:bg-primary-dark lg:ml-10"
                >
                  Get hired instantly
                  <ArrowRight size={24} />
                </Link>
              ) : (
                <>
                  <Dialog>
                    <DialogTrigger className="z-10">
                      <div
                        onClick={() => setRole("user")}
                        className=" flex gap-4 items-center md:w-[225px] h-[45px] justify-center bg-primary rounded-lg text-white text-sm font-semibold py-2 md:py-3 pl-4 md:pl-8 px-2 md:px-3 md:max-w-[300px] hover:bg-primary-dark lg:ml-10"
                      >
                        Get hired instantly
                        <ArrowRight size={24} />
                      </div>
                    </DialogTrigger>
                    <DialogContent className="bg-transparent border-none max-w-3xl shadow-none">
                      <LoginComponent />
                    </DialogContent>
                  </Dialog>
                </>
              )}
              {userData ? (
                <Link
                  href={"/recruit"}
                  className="flex gap-4 z-10 items-center md:w-[225px] h-[45px] justify-center rounded-lg border-2 text-sm font-semibold py-2 md:py-3 pl-4  px-2 md:px-3 md:max-w-[300px] lg:ml-5 hover:bg-gray-50"
                >
                  Recruit in no time
                  <ArrowRight size={24} />
                </Link>
              ) : (
                <Dialog>
                  <DialogTrigger className="z-10">
                    <div
                      onClick={() => setRole("recruiter")}
                      className="flex gap-4 z-10 items-center md:w-[225px] h-[45px] justify-center rounded-lg border-2 text-sm font-semibold py-2 md:py-3 pl-4  px-2 md:px-3 md:max-w-[300px] lg:ml-5 hover:bg-gray-50"
                    >
                      {" "}
                      Recruit in no time
                      <ArrowRight size={24} />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="bg-transparent border-none max-w-3xl shadow-none">
                    <LoginComponent />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <div className="bg-[#f1eaff] z-10 p-6 w-full aspect-square max-w-[600px] rounded-2xl">
            <Image
              src={"/home/herosection/wize_hero.svg"}
              alt="HeroSection"
              width={100}
              height={100}
              className="w-full bg-white rounded-2xl py-2 px-2"
            ></Image>
          </div>
        </div>
        <InfiniteLogoSlide />
      </div>
    </>
  );
}
