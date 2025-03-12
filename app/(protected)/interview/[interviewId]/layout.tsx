"use client";
import { WebSocketProvider } from "@/hooks/interviewersocket/webSocketContext";
import { verifyInterview } from "@/actions/interviewActions";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { use, useEffect, useState } from "react";
import { useUserStore } from "@/utils/userStore";
import { useProfileStore } from "@/utils/profileStore";

export default function InterviewLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ interviewId: string }>;
}) {
  const router = useRouter();
  const { interviewId } = use(params);
  const { userData } = useUserStore();
  const {id}=useProfileStore()
  const [showPage, setShowPage] = useState(false);

  useEffect(() => {
    const verify = async (userId: string) => {
      const res = await verifyInterview({ interviewId, talentProfileId: id as string, interviewType:"mockInterview" });

      if (res.status === "failed") {
        if (res.code === 3) toast.error("Interview not found");
        else toast.error(res.message);
        router.push("/interview");
      } else {
        setShowPage(true);
      }
    };

    if (userData?.id) verify(userData.id);
  }, [userData?.id, interviewId, router]);

  return <WebSocketProvider>{showPage && children}</WebSocketProvider>;
}
