"use client";
import { WebSocketProvider } from "@/hooks/interviewersocket/webSocketContext";
import { verifyInterview } from "@/actions/interviewActions";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { use, useEffect, useState } from "react";
import { useUserStore } from "@/utils/userStore";
import { useAppSelector } from "@/lib/hooks";

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
  const profile = useAppSelector((state) => state.talentProfile);
  const { id } = profile;
  const [showPage, setShowPage] = useState(false);
  const searchParams = useSearchParams();
  const interviewType = searchParams.get("type") || "mockInterview";

  useEffect(() => {
    const verify = async (userId: string) => {
      const res = await verifyInterview({ interviewId, talentProfileId: id as string, interviewType: interviewType });

      if (res.status === "failed") {
        if (res.code === 3) toast.error("Interview not found");
        else toast.error(res.message);
        router.push("/interview");
      } else {
        setShowPage(true);
      }
    };

    if (userData?.id && interviewType) verify(userData.id);
  }, [userData?.id, interviewId, router]);

  return <WebSocketProvider>{showPage && children}</WebSocketProvider>;
}
