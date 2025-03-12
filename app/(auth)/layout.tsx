"use client"
import LoadingGlobal from "@/components/ui/loading";
import { useUserStore } from "@/utils/userStore";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userData } = useUserStore();
  const redirecting = useSearchParams().get("redirect")
  const [state, setState] = useState<boolean>()
  useEffect(() => {
    setState(true)
    if (userData?.id) {
      if (!redirecting) {
        setState(false)
        redirect("/talentmatch");
      } else {
        console.log(redirecting)
        setState(false)
        redirect(redirecting);
      }
    } else {

  if(!user){
    console.log("user not found")
    redirect("/");
  }else if (user&&user.role!="recruiter") {
    redirect("/talentmatch");
  }else{
    redirect("/talentpool")
  }

  return (
    <>
      {state ? <LoadingGlobal text="" /> : (
        <main className="h-full">{children}</main>
      )}
    </>
  );
}
