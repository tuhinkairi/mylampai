"use client"
import LoadingGlobal from "@/components/ui/loading";
import { useUserStore } from "@/utils/userStore";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function AuthLayoutContent({ children }: { children: React.ReactNode }) {
  const { userData } = useUserStore();
  const searchParams = useSearchParams();
  const redirecting = searchParams.get("redirect");
  const [state, setState] = useState<boolean>(true);

  useEffect(() => {
    // Checking if we're already on /talentmatch to prevent loops
    if (window.location.pathname === "/talentmatch") {
      setState(false);
      return;
    }

    if (typeof window !== "undefined" && userData?.id) {
      if (!redirecting) {
        setState(false);
        // Using router.push instead of redirect to avoid potential server redirect loops
        window.location.href = "/talentmatch";
      } else {
        // console.log(redirecting);
        setState(false);
        window.location.href = redirecting;
      }
    } else {
      setState(false);
    }
  }, [redirecting, userData]);

  return (
    <>
      {state ? <LoadingGlobal text="" /> : (
        <main className="h-full">{children}</main>
      )}
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<LoadingGlobal text="page" />}>
      <AuthLayoutContent>{children}</AuthLayoutContent>
     </Suspense>
  );
}