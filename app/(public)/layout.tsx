import HomeNavbar from "@/components/home/HomeNavbar";
import Footer from "@/components/global/Footer";

import { Metadata } from "next";

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
   <HomeNavbar/>
   <RecruiterNavbar/>   

      <div className="min-h-screen w-full flex flex-1 flex-col">
        {children}
      </div>
      <Footer />

      <BottomNavBar />
    </>
  );
}
