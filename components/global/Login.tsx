"use client";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUserStore } from "@/utils/userStore";
import { useState } from "react";
import { setCookie } from "@/utils/cookieUtils";
import { handleSendOTP, verifyOTPandLogin } from "@/actions/authActions";
import Globe from "@/components/ui/globe";
import { Linkedin } from "react-bootstrap-icons";
import { useRoleStore } from "@/utils/loginStore";
// import { useSearchParams } from "next/navigation";

const FormSchema = z.object({
  inputemail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  pin: z
    .string()
    .min(6, {
      message: "Your one-time password must be 6 characters.",
    })
    .max(6, {
      message: "Your one-time password must be 6 characters.",
    })
    .refine((value) => /^\d+$/.test(value), {
      message: "Your one-time password must contain only numbers.",
    }),
});

export default function LoginComponent() {
  const router = useRouter();
  const { setUserData } = useUserStore();
  const [showOTP, setshowOTP] = useState(false);
  const [sending, setSending] = useState(false);

  const { role, setRole } = useRoleStore();

  // const searchParams = useSearchParams();
  // const role = searchParams.get("role") === "recruiter" ? "recruiter" : "user";

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      inputemail: "",
      pin: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const res = await verifyOTPandLogin({
        email: data.inputemail,
        otp: data.pin,
      });

      if (res.otpVerified) {
        toast.success("Login successful");

        if (res.user && res.accessToken) {
          setUserData(res.user, res.accessToken);
          setCookie("accessToken", res.accessToken);
          res.user.role=="recruiter"?router.push("/talentpool"):router.push("/talentmatch");
        } else {
          toast.error("Failed to login");
        }
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to login");
    }
  }

  const sendOTPforLogin = async () => {
    setSending(true);
    try {
      if (role === null) return;

      const res = await handleSendOTP(form.getValues("inputemail"), role);

      if (res.otpSent) {
        setshowOTP(true);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to send OTP");
    } finally {
      setSending(false);
    }
  };

  const handleNextAuthLogin = async (method: string) => {
    try {
      await signIn(method);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-white rounded-lg md:rounded-tr-[5.5rem] md:rounded-bl-[5.5rem] p-[10px] gap-2 w-full max-w-[750px] flex flex-col sm:flex-row shadow-md items-center ">
      <div className="justify-evenly flex-col items-center hidden md:flex w-full md:max-w-[300px] bg-primary-foreground rounded-lg md:rounded-tr-5xl md:rounded-bl-5xl p-3 h-full">
        {/* <Image
            src={"/images/Globe.svg"}
            alt="globe"
            className="w-full h-auto hue-rotate-180"
            width={100}
            height={100}
          /> */}
        <Globe
          glowColor={[248 / 255, 250 / 255, 1]}
          baseColor={[248 / 255, 250 / 255, 1]}
        />
        <div className="flex flex-col gap-2 text-gray-500 justify-center items-center p-2">
          <h2 className="font-medium w-full text-nowrap">
            Take the wiZe AI Mock Interview
          </h2>
          <div>
            <p className="text-xs">
              You&apos;ll be taking a 20-minute interview to have your skills
              evaluated. Just relax and take the interview. All the Best!
            </p>
          </div>
          <div className="flex gap-2 text-slate-600 font-medium items-center mt-4">
            <p className="text-xs ">
              {role === "recruiter"
                ? "Login as student?"
                : "Want to hire talent?"}
            </p>
            <div
              onClick={() =>
                setRole(role === "recruiter" ? "user" : "recruiter")
              }
              className="text-xs font-bold text-primary cursor-pointer"
            >
              Continue Here
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:h-full md:min-h-[426px] p-4 flex flex-col justify-center my-auto">
        <div className="flex flex-col mt-6 h-full gap-2">
          <div className="flex items-center justify-center">
            <Image
              src={"/sidebar/wize_logo_whitebg.svg"}
              alt="wiZe logo"
              width={40}
              height={40}
            />
          </div>
          <div className="flex font-medium justify-center text-nowrap items-center">
            <span>Signup or Login to &nbsp;</span>
            <span className="text-primary"> wiZ</span>
            <span>e in seconds</span>
          </div>
          <div className="flex flex-col justify-center items-center px-8 mt-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                <div className="flex flex-col gap-4 items-center justify-center">
                  <div className={`w-full ${showOTP ? "hidden" : ""}`}>
                    <FormField
                      control={form.control}
                      name="inputemail"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Email ID</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Email"
                              {...field}
                              className="shadow-none text-gray-900 py-4 px-2 border rounded-lg space-x-2"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className={`w-full ${!showOTP ? "hidden" : ""}`}>
                    <FormField
                      control={form.control}
                      name="pin"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>OTP</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter OTP"
                              {...field}
                              className="shadow-none text-gray-900 py-4 px-2 border rounded-lg space-x-2"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {!showOTP ? (
                    <Button
                      type="button"
                      disabled={sending}
                      onClick={sendOTPforLogin}
                      className="bg-primary text-slate-50 w-full text-sm sm:font-bold px-2 sm:px-4 py-2 rounded-lg shadow hover:bg-primary"
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="bg-primary text-slate-50 w-full text-sm sm:font-bold px-2 sm:px-4 py-2 rounded-lg shadow hover:bg-primary"
                    >
                      Let&apos;s Go
                    </Button>
                  )}
                </div>
              </form>
            </Form>
            <div className="flex items-center justify-center gap-2 my-[25px] w-full">
              <div className="flex-grow border-t"></div>
              <p className="text-gray-400 text-xs px-2">Or continue with</p>
              <div className="flex-grow border-t"></div>
            </div>

            <div className="flex gap-2 sm:gap-8 justify-center items-center w-full">
              <button
                type="button"
                className="flex items-center justify-center w-full border h-10 rounded-lg space-x-2 "
                onClick={() => handleNextAuthLogin("google")}
              >
                <Image
                  src={"/images/Google_Icons-09-512.png"}
                  alt="google login"
                  width={100}
                  height={100}
                  className="w-6 h-6"
                />
                <span className="text-slate-500 font-bold sm:text-sm">
                  Google
                </span>
              </button>

              <button
                type="button"
                className="flex items-center justify-center w-full border h-10 rounded-lg space-x-2 "
                onClick={() => handleNextAuthLogin("linkedin")}
              >
                <Linkedin className="text-[#0A66C2]" />
                <span className="text-slate-500 font-bold sm:text-sm">
                  LinkedIn
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
