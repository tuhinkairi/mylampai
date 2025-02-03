"use client";
import { createInterview } from "@/actions/interviewActions";
import { useUserStore } from "@/utils/userStore";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import FullScreenLoader from "@/components/global/FullScreenLoader";

export default function CreateInterview() {
  const { userData } = useUserStore();
  const router = useRouter();
  const [Loading, setLoading] = useState(false);

  const handleInterview = useCallback(
    async (userId: string) => {
      try {
        const res = await createInterview(userId);

        if (res.status === "failed") {
          toast.error(res.message);
          return;
        } else if (res.status === "success") {
          toast.success("Interview created successfully");
          setLoading(true);
          router.push(`/interview/${res.interviewId}`);
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
        onClick={() => handleInterview(userData?.id as string)}
      >
        Start New Interview
      </Button>
    </>
  );
}
