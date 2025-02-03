"use client";
import { WebSocketProvider } from "@/hooks/interviewersocket/webSocketContext";
import { verifyInterview } from "@/actions/interviewActions";
import { redirect, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useUserStore } from "@/utils/userStore";

export default function InterviewLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    interviewId: string;
  };
}) {
  const router = useRouter();
  const interviewId = params.interviewId as string;
  const { userData } = useUserStore();
  const [showPage, setShowPage] = useState(false);

  useEffect(() => {
    const verify = async (userId: string) => {
      const res = await verifyInterview({ interviewId, userId });

      if (res.status === "failed") {
        if (res.code === 3) toast.error("Interview not found");
        else toast.error(res.message);
        router.push("/oldinterview");
      } else {
        setShowPage(true);
      }
    };

    if (userData?.id) verify(userData.id  );
  }, [userData?.id, interviewId, router]);

  return <WebSocketProvider>{showPage && children}</WebSocketProvider>;
}
