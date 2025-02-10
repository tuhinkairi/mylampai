import type { Metadata } from "next";
import { auth } from "@/lib/authlib";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/global/Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import BottomNavBar from "@/components/home/BottomNavBar";

export const metadata: Metadata = {
  title: "wiZe (myLampAI)",
  description: "wiZe (myLampAI) - Your career builder",
};

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await auth();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <div className="flex-1 flex">
        <AppSidebar user={user} />
        <ScrollArea className="h-screen w-full flex flex-1 flex-col">
          {children}
        </ScrollArea>
        <BottomNavBar />
      </div>
    </>
  );
}
