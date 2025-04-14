"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getMockInterviews } from "@/actions/interviewActions";
import { useCallback, useEffect, useState } from "react";
import { useUserStore } from "@/utils/userStore";
import { verifyInterview } from "@/actions/interviewActions";
import { toast } from "sonner";
import FullScreenLoader from "@/components/global/FullScreenLoader";
import { useRouter } from "next/navigation";
import { getCreditBalance, handleCreditUpdate } from "@/actions/creditsAction";
import { useAppSelector } from "@/lib/hooks";
import { Calendar, Clock, FileCheck, FileSearch, FilePlus2, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import InterviewTemplates from "./InterviewTemplates";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CreateInterviewComponent from "./CreateInterview";
import { ScrollArea } from "@/components/ui/scroll-area";

type Interview = {
  id: string;
  interviewState: "In_Progress" | "Scheduled" | "Analysis_Completed";
  interviewFeedback: any[];
  createdAt: Date;
  updatedAt: Date;
  messages: {
    id: string;
    createdAt: Date;
    type: string;
    sender: string;
    response: string;
    code: string | null;
    interviewId: string;
  }[];
  analysis: any[];
};

export default function InterviewsPage() {
  const router = useRouter();
  const { userData } = useUserStore();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const profile = useAppSelector((state) => state.talentProfile);
  const { id } = profile;

  const fetchInterviews = useCallback(async (talentProfileId: string) => {
    try {
      setLoading(true);
      const res = await getMockInterviews(talentProfileId);
      // console.log("interviews:: ", res, " for:: ", talentProfileId);

      // Add mock dates if they don't exist for demonstration
      const interviewsWithDates = res.map((interview, index) => ({
        ...interview,
        interviewState: interview.interviewState as "In_Progress" | "Scheduled" | "Analysis_Completed",
        createdAt: interview.createdAt || new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toISOString()
      }));

      // Sort interviews by date (newest first)
      const sortedInterviews = interviewsWithDates.sort((a: Interview, b: Interview) =>
        new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
      );

      setInterviews(sortedInterviews);
    } catch (error) {
      toast.error("Failed to load interviews");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onSelectInterview = async (interview: Interview, talentProfileId: string) => {
    try {
      setLoading(true);
      const res = await verifyInterview({
        interviewId: interview.id,
        talentProfileId,
        interviewType: "mockInterview"
      });

      if (res.status === "failed") {
        if (res.code === 3) toast.error("Interview not found");
        else toast.error(res.message);
      } else if (res?.data?.interviewState === "Analysis_Completed") {
        router.push(`/interview/${interview.id}/analysis`);
      } else if (interview.interviewState === "In_Progress") {
        router.push(`/interview/${interview.id}`);
      } else {
        toast.info("This interview cannot be accessed at this time");
      }
    } catch (error) {
      toast.error("Failed to access interview");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateCredits = async (email: string) => {
    if (!email) {
      toast.error("User not found, please try again later");
      return;
    }

    try {
      const res = await handleCreditUpdate({ email });
      if (res === "success") {
        toast.success("Got 250 free credits");
        setIsRegistered(true);
      }
    } catch (error) {
      toast.error("Failed to update credits");
      console.error(error);
    }
  };

  useEffect(() => {
    const talentProfileId = id;
    const userId = userData?.id;

    const getCredits = async (userId: string) => {
      try {
        const res = await getCreditBalance(userId);
        if (res.status === "failed") {
          toast.error(res.message);
        } else if (res.status === "success") {
          setIsRegistered(res.isRegistered as boolean);
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (talentProfileId && userId) {
      fetchInterviews(talentProfileId);
      getCredits(userId);
    }
  }, [id, userData, fetchInterviews]);

  const handleCreateInterview = () => {
    router.push('/interview/new');
  };

  const getFilteredInterviews = (status: string) => {
    if (status === "all") return interviews;
    return interviews.filter(interview => interview.interviewState === status);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In_Progress":
        return <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>;
      case "Scheduled":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Scheduled</Badge>;
      case "Analysis_Completed":
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "In_Progress":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case "Scheduled":
        return <Calendar className="h-5 w-5 text-yellow-500" />;
      case "Analysis_Completed":
        return <FileCheck className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8">
      {loading && <FullScreenLoader message="Loading interviews..." />}

      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Interviews</h1>
          <p className="text-muted-foreground">Track and manage your interview practice sessions</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {!isRegistered && (
            <Button
              onClick={() => updateCredits(userData?.email as string)}
              className="flex items-center gap-2"
            >
              <FilePlus2 className="h-4 w-4" />
              Get Free Credits
            </Button>
          )}


          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
                <FileSearch className="h-4 w-4" />
                Start New Interview
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[95vh] max-w-[60vw] bg-primary-foreground">
              <DialogHeader>
                <DialogTitle>
                  <div className="flex items-center gap-2 mb-3">
                    <FileSearch className="h-6 w-6" />
                    <h3 className="text-lg font-semibold">Create a New Interview</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Start a new interview session and practice your skills.
                  </p>
                </DialogTitle>

              </DialogHeader>
              <ScrollArea className=" w-full">
                <CreateInterviewComponent jobDescription="" category="" rubrics={[]} />
              </ScrollArea>
            </DialogContent>

          </Dialog>


          {/* <Button
            onClick={handleCreateInterview}
            className="bg-primary hover:bg-primary/90 flex items-center gap-2"
          >
            <FileSearch className="h-4 w-4" />
            Start New Interview
          </Button> */}
        </div>
      </div>

      <div>
        <InterviewTemplates />
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6 grid grid-cols-4 max-w-md">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="In_Progress">In Progress</TabsTrigger>
          <TabsTrigger value="Scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="Analysis_Completed">Completed</TabsTrigger>
        </TabsList>

        {["all", "In_Progress", "Scheduled", "Analysis_Completed"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-0">
            {loading ? (
              <div className="flex justify-center p-10">
                <div className="animate-pulse">Loading interviews...</div>
              </div>
            ) : getFilteredInterviews(tab).length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {getFilteredInterviews(tab).map((interview, index) => (
                  <Card key={interview.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-medium">
                          Interview #{index + 1}
                        </CardTitle>
                        {getStatusBadge(interview.interviewState)}
                      </div>
                    </CardHeader>

                    <CardContent className="pb-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {interview.createdAt ? format(new Date(interview.createdAt), "MMM d, yyyy") : "Date unavailable"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        {getStatusIcon(interview.interviewState)}
                        <span>
                          {interview.interviewState === "Analysis_Completed" ?
                            `${interview.interviewFeedback?.length || 0} feedback items` :
                            interview.interviewState === "In_Progress" ?
                              "Continue interview" :
                              "Awaiting interview"}
                        </span>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-2">
                      <Button
                        variant={interview.interviewState === "Analysis_Completed" ? "default" : "outline"}
                        className="w-full"
                        onClick={() => onSelectInterview(interview, id as string)}
                        disabled={interview.interviewState === "Scheduled"}
                      >
                        {interview.interviewState === "Analysis_Completed" ?
                          "View Analysis" :
                          interview.interviewState === "In_Progress" ?
                            "Continue Interview" :
                            "Scheduled"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-10 border rounded-lg bg-muted/20">
                <div className="mb-3 inline-flex rounded-full bg-muted p-3">
                  {tab === "all" ?
                    <FileSearch className="h-6 w-6" /> :
                    tab === "In_Progress" ?
                      <MessageSquare className="h-6 w-6" /> :
                      tab === "Scheduled" ?
                        <Calendar className="h-6 w-6" /> :
                        <FileCheck className="h-6 w-6" />}
                </div>
                <h3 className="text-lg font-medium mb-1">No interviews found</h3>
                <p className="text-muted-foreground mb-4">
                  {tab === "all" ?
                    "You haven't participated in any interviews yet." :
                    `You don't have any ${tab.replace("_", " ").toLowerCase()} interviews.`}
                </p>
                <Button onClick={handleCreateInterview}>Start Your First Interview</Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}