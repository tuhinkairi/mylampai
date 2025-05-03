import HomeNavbar from "@/components/home/HomeNavbar";
import Footer from "@/components/global/Footer";
import BottomNavBar from "@/components/home/BottomNavBar";
import RecruiterNavbar from "@/components/home/RecruiterNavbar";

import { Metadata } from "next";
import { Suspense } from "react";
import LoadingGlobal from "@/components/ui/loading";

export const metadata: Metadata = {
  title: "wiZe (myLampAI) | Home",
  description: "We nurture, assess & match talent with premium opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    <Suspense fallback={<LoadingGlobal text= "" />}>
      <HomeNavbar />
      <RecruiterNavbar />

      <div className="min-h-screen w-full flex flex-1 flex-col">{children}</div>
      <Footer />

      <BottomNavBar />
    </Suspense>
    </>
  );
}
