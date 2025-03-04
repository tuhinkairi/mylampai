"use client";
import { Button } from "@/components/ui/button";
import CreateInterview from "./CreateInterview";
import { getMockInterviews } from "@/actions/interviewActions";
import { useCallback, useEffect, useState } from "react";
import { useUserStore } from "@/utils/userStore";
import { verifyMockInterview } from "@/actions/interviewActions";
import { toast } from "sonner";
import FullScreenLoader from "@/components/global/FullScreenLoader";
import { useRouter } from "next/navigation";
import { getCreditBalance, handleCreditUpdate } from "@/actions/creditsAction";
import SpeechRecognition from "@/components/speech-to-text/speechRecognition";
import { TranscriptResult } from "@/types/transcript";
import { WebSocketProvider } from "@/hooks/interviewersocket/webSocketContext";
import { useProfileStore } from "@/utils/profileStore";
// import TranscriptionPage from "@/components/speech-to-text/transcriptionPage";

type Interview = {
  id: string;
};

export default function InterviewsPage() {
  const router = useRouter();
  const { userData } = useUserStore();
  const { id } = useProfileStore();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(true);

  const fetchInterviews = useCallback(async (talentProfileId: string) => {
    const res = await getMockInterviews(talentProfileId);
    setInterviews(res);
  }, []);

  const onSelectInterview = async (interviewId: string, talentProfileId: string) => {
    const res = await verifyMockInterview({ interviewId, talentProfileId });
    
    if (res.status === "failed") {
      if (res.code === 3) toast.error("Interview not found");
      else toast.error(res.message);
    } else {
      setLoading(true);
      router.push(`/interview/${interviewId}`);
    }
  };

  const updateCredits = async (email: string) => {
    if (!email) {
      toast.error("User not found, please try again later");
      return;
    }
    const res = await handleCreditUpdate({ email });
    if (res === "success") {
      toast.success("Got 250 free credits");
      setIsRegistered(true);
    }
  };

  // useEffect(() => {
  //   const talentProfileId = userData?.id;

  //   const getCredits = async (talentProfileId: string) => {
  //     const res = await getCreditBalance(talentProfileId);
  //     console.log(res);
  //     if (res.status === "failed") {
  //       toast.error(res.message);
  //     } else if (res.status === "success")
  //       setIsRegistered(res.isRegistered as boolean);
  //   };
  //   if (talentProfileId) {
  //     fetchInterviews(talentProfileId);
  //     getCredits(talentProfileId);
  //   }
  // }, [userData?.id, fetchInterviews]);

  return (
    <div className="container mx-auto py-8">
      {loading && <FullScreenLoader message="Starting Interview" />}
      <div className="flex justify-between gap-8 items-center mb-6">
        <h1 className="text-3xl font-bold">Past Interviews</h1>
        <CreateInterview/>
        {/* speech recognition integration testing */}
        {/* <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-4">Technical Interview</h1>
          <SpeechRecognition/>
        </div> */}
      </div>
      {!isRegistered && (
        <Button
          className="hover:text-primary"
          onClick={() => updateCredits(userData?.email as string)}
        >
          Get Free Credits
        </Button>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {interviews?.map((interview, index) => (
          <Button
            key={index}
            onClick={() =>
              onSelectInterview(interview.id, id as string)
            }
            className="w-full p-4"
            variant="outline"
          >
            Interview #{index + 1}
          </Button>
        ))}
      </div>
    </div>
  );
}
