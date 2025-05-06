import { WebSocketProvider } from "@/hooks/interviewersocket/webSocketContext";
import { auth } from "@/lib/authlib";
import { redirect } from "next/navigation";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await auth();
  // const {setRecruiterId}= usejobCreateStore()
  
  if (!user || user?.role !== "recruiter") {
    // setRecruiterId(user?.id)
    redirect("/not-found");
  }

  return <WebSocketProvider>{children}</WebSocketProvider>;
}
