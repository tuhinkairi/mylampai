"use client";
import { createInterview } from "@/actions/interviewActions";
import { useUserStore } from "@/utils/userStore";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import FullScreenLoader from "@/components/global/FullScreenLoader";
import { useProfileStore } from "@/utils/profileStore";
import { useAppSelector } from "@/lib/hooks";

export default function CreateInterview() {
  const router = useRouter();
  const [Loading, setLoading] = useState(false);
  const profile = useAppSelector((state) => state.talentProfile);
  const { id } = profile;

  const handleInterview = useCallback(
    async (talentProfileId: string) => {
      try {
        console.log("talentProfileId", talentProfileId);
        const res = await createInterview(talentProfileId);

        if (res.status === "failed") {
          toast.error(res.message);
          return;
        } else if (res.status === "success") {
          toast.success("Interview created successfully");
          setLoading(true);
          router.push(`/interview/${res.interviewId}?type=mockInterview`);
        }
      } catch (error) {
        console.log(error);
      }
    },
    [router],
  );



  return (
    <>
      {Loading && <FullScreenLoader />}
      <Button
        className="hover:text-primary"
        onClick={() => handleInterview(id as string)}
      >
        Start New Interview
      </Button>
    </>
  );
}
