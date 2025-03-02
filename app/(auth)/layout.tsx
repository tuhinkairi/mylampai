"use client"
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
  const [state, setState] = useState<boolean>(true)
  useEffect(() => {
    if (userData) {
      if (!redirecting) {
        setState(false)
        redirect("/talentmatch");
      } else {
        console.log(redirecting)
        setState(false)
        redirect(redirecting);
      }
    }
  }, [redirecting])

  return (
    <>
      {state ? (<>loading ....</>) : (
        <main className="h-full">{children}</main>
      )}
    </>
  );
}
