"use client";
import {
  Lock,
  FileText,
  TvMinimal,
  BriefcaseBusiness,
  CalendarCheck2,
  DollarSignIcon,
  MapPinIcon,
  CalendarIcon,
  SquareUser,
  BookUser,
  BriefcaseIcon,
  User2,
  Clock,
  CalendarCheck,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import TalentMatchCSS from "./Talent.module.css";
import CreateTalentPoolProfileDialog from "../../../../components/talentmatch/CreateTalentPoolProfile";
import { acceptTalentMatch, getTalentMatches, getTalentPoolProfiles } from "@/actions/talentMatchActions";
import { Badge } from "@/components/ui/badge";
import PdfToImage from "@/components/misc/pdftoimg";
import { use, useEffect, useState } from "react";
import { TalentProfileCard } from "./TalentProfileCard";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import LoadingGlobal from "@/components/ui/loading";
import { useUserStore } from "@/utils/userStore";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setId, setResumeUrl } from "@/lib/features/talent_profile/talentProfileSlice";
import { getTalentProfile } from "@/actions/setupProfileActions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { setCareerProfiles } from "@/lib/features/talent_pool_profile/talentPoolProfileSlice";
import { CareerProfileSkeleton } from "@/skeletons/talentmatch/careerProfileSkeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";


type ProfileData = {
  resumeId: string;
  resumeUrl?: string;
  resumeFileText?: string;
  role: string;
  skills: string[];
  targetFor: string;
  locationPref?: "Onsite" | "Remote" | "Hybrid" | null;
  availability: "FULL_TIME" | "PART_TIME" | "FREELANCE" | null;
  interviewState: "pending" | "completed" | "cancelled";
  interviewDate: Date;
  interviewId: string;
};



export default function TalentMatchPage() {
  return (
    // <ClientStoreProvider>
    <TalentMatchContent />
    // </ClientStoreProvider>
  );
}

// The actual page content
function TalentMatchContent() {
  // const user = await auth();
  const router = useRouter();
  const dispatch = useAppDispatch()
  const profile = useAppSelector((state) => state.talentProfile)
  const careerProfiles = useAppSelector((state) => state.talentPoolProfile.talentPoolProfiles)
  const id = profile.id

  const [talentPoolProfiles, setTalentPoolProfiles] = useState<ProfileData[]>();
  const [talentMatches, setTalentMatches] = useState<any[]>([])
  const { userData } = useUserStore();
  const [isLoadingCareerProfiles, setIsLoadingCareerProfiles] = useState(false);

  useEffect(() => {
    if (careerProfiles && careerProfiles.length > 0) {
      const formattedProfiles = careerProfiles.map(profile => ({
        ...profile,
        interviewDate: profile.interviewDate ? new Date(profile.interviewDate) : new Date(),
        interviewState: profile.interviewState || 'pending'
      }));
      setTalentPoolProfiles(formattedProfiles)
    }
    setIsLoadingCareerProfiles(false)
  }, [careerProfiles])

  useEffect(() => {
    const getTalentProfiles = async (id: string) => {
      const res = await getTalentPoolProfiles(id);
      console.log("res: ", res?.data)
      if (res?.status === 200 && res?.data) {
        const profiles = res?.data?.map(profile => ({
          id: profile.id,
          resumeId: profile.resumeId,
          role: profile.role,
          targetFor: profile.targetFor,
          skills: profile.skills,
          locationPref: profile.locationPref as 'Onsite' | 'Remote' | 'Hybrid' | null,
          availability: profile.availability as 'FULL_TIME' | 'PART_TIME' | 'FREELANCE' | null,
          interviewState: profile.interviewState as 'pending' | 'completed' | 'cancelled',
          interviewDate: profile.interviewDate.toISOString(),
          resumeUrl: profile.resume.resumeUrl || "",
          interviewId: profile.interview && profile.interview.id || "",
          resumeFileText: profile.resume.resumeFileText || ""
        }));
        // console.log("talent pool profiles: ", profiles)
        dispatch(setCareerProfiles(profiles))
        // console.log("talent pool profiles: ", profiles)
      }
    };

    const getMatches = async (id: string) => {
      // console.log("match for : ", id)
      const res = await getTalentMatches(id)
      if (res && Array.isArray(res)) {
        setTalentMatches(res);
        // console.log("talentmatches:: ", res)
      } else {
        console.error("Failed to fetch talent matches:", res);
      }
    }

    if (id) {
      setIsLoadingCareerProfiles(true)
      getTalentProfiles(id);
      getMatches(id);
    } else {
      if (!userData) {
        toast.error("User data not found");
        return;
      }
      const checkTalentProfile = async () => {
        const isTalentProfileExist = await getTalentProfile(userData?.id);
        if (isTalentProfileExist && isTalentProfileExist?.status === 200 && isTalentProfileExist?.data) {
          dispatch(setId(isTalentProfileExist?.data.id))
          dispatch(setResumeUrl(isTalentProfileExist?.data.resumeUrl ?? ""))
        }
        checkTalentProfile();
      }
    }
  }, [id]);

  const handleConfirmMatch = async (matchId: string) => {
    try {
      const res = await acceptTalentMatch(matchId);

      if (res === "success") {
        toast.success("Match confirmed successfully");
      } else {
        toast.error("Failed to confirm match");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to confirm match");
    }
  };

  const [isCTPPDialogOpen, setIsCTPPDialogOpen] = useState(false);

  function EmptyStateDefault() {
    return (
      <EmptyState
        title="No Career Profiles Found"
        description="Create a new career profile to get started."
        icons={[FileText, SquareUser, BookUser]}
        action={{
          label: "Create Profile",
          onClick: () => setIsCTPPDialogOpen(true),
        }}
      />
    )
  }

  const handleStartNow = async (interviewId: string, resumeFileText: string, jobRole: string) => {
    try {
      console.log("interviewId: ", interviewId)
      console.log("resumeFileText: ", resumeFileText)

      // const res = await acceptTalentMatch(interviewId);
      // if (res === "success") {
      //   toast.success("Interview started successfully");
      // } else {
      //   toast.error("Failed to start interview");
      // }
      sessionStorage.setItem('interviewData', JSON.stringify({
        pdf_text: resumeFileText,
        job_description: jobRole,
        interview_id: interviewId
      }));

      router.push(`/interview/${interviewId}?type=talent`)
    }
    catch (error) {
      console.error(error);
      toast.error("Failed to start interview");
    }
  }


  if (!id) {
    return <LoadingGlobal text="Profile" />; // or any other placeholder UI
  }

  return (
    <div className="flex sm:flex-row flex-col px-2 py-2 sm:py-0 sm:pr-2">
      <ScrollArea className="h-screen w-full sm:w-5/12 sm:p-4">
        <div className=" sm:h-[calc(100vh-30rem)] flex items-center border rounded-lg ">
          <div
            className={`${TalentMatchCSS.verticalText} h-full text-white rounded-r-lg px-2 text-center bg-primary`}
          >
            Your Matches
          </div>

          <div className="w-full flex flex-col justify-center py-1 overflow-y-auto">
            <ScrollArea className="h-50 overflow-auto" >
              {
                talentMatches.length > 0 && talentMatches.map((pool, index) => (
                  <Card className="overflow-hidden m-2" key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">Developer Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <h3 className="font-semibold mr-2">Skills: </h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {pool.talentPool.skills.map((skill: any) => (
                              <Badge key={skill} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {/* <div>
                        <h3 className="font-semibold">Profiles</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {pool.talentPool.profiles.map((prof: any) => (
                            <Badge key={prof} variant="outline">
                              {prof}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <DollarSignIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>Salary: ₹{pool.talentPool.salary}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>Location Preference: {pool.talentPool.locationPref}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        <span>
                          Created: {new Date(pool.talentPool.createdAt).toLocaleDateString()}
                        </span>
                      </div> */}
                      </div>
                    </CardContent>
                    <CardFooter>
                      {!pool.isMatched
                        ? <Button onClick={() => handleConfirmMatch(pool.id)}>Accept</Button>
                        : <Button disabled>Accepted</Button>
                      }

                    </CardFooter>
                  </Card>
                ))
              }
              {talentMatches.length === 0 && (
                <>
                  <div className="flex flex-col items-center justify-center h-full">
                    <Lock className="w-8 h-8 text-primary" />
                    <div className="text-center max-w-[400px] text-sm text-muted-foreground mt-2 p-4">
                      Complete your profile and attempt the AI interview to be
                      considered for the talent pool.
                    </div>
                  </div>
                </>

              )
              }
            </ScrollArea>
          </div>
        </div>
        <div className="flex flex-col  w-full mt-2  rounded-lg h-[calc(100vh-2rem)]">
          <Tabs defaultValue="career_profile" className="w-full px-2 ">
            <TabsList className="w-full justify-start p-2 mb-2 gap-2 h-auto">
              <TabsTrigger
                value="career_profile"
                className="text-muted-foreground text-sm font-medium h-auto"
              >
                Career Profile
              </TabsTrigger>
              {/* <TabsTrigger
                value="work_preference"
                className="text-muted-foreground text-sm font-medium h-auto"
              >
                Work Preference
              </TabsTrigger> */}
            </TabsList>

            <TabsContent value="career_profile" className="flex-1 flex flex-col overflow-hidden m-0 h-full">
              <div className="flex justify-between items-center shrink-0 ">
                <h1 className='p-4 text-xl font-bold'>Career Profiles</h1>
                {/* {talentPoolProfiles && talentPoolProfiles.length < 3 && ( */}
                <CreateTalentPoolProfileDialog
                  isCTPPDialogOpen={isCTPPDialogOpen}
                  setIsCTPPDialogOpen={setIsCTPPDialogOpen}
                />
                {/* )}  */}
              </div>
              <ScrollArea className="h-[calc(100vh-80px)]">
                {
                  isLoadingCareerProfiles && (<CareerProfileSkeleton />)
                }
                {(!isLoadingCareerProfiles && (!talentPoolProfiles || talentPoolProfiles.length === 0)) ? (
                  <EmptyStateDefault />
                ) : (
                  <div className="flex flex-col gap-4 p-4">
                    {talentPoolProfiles?.map((profile, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 p-6 flex flex-col gap-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                      >
                        {/* Header - Role Title */}
                        <div className="flex items-center gap-3">
                          <div className="bg-primary p-3 rounded-lg">
                            <BriefcaseIcon className="w-3 h-3 text-white" />
                          </div>
                          <h2 className="text-md font-semibold tracking-tight uppercase">
                            {profile.role}
                          </h2>
                        </div>

                        {/* Skills Section */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-gray-700">Experts in</h3>
                          <div className="flex flex-wrap gap-2">
                            {profile.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="px-3 py-1">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Position Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <User2 className="w-4 h-4 text-muted-foreground" /> Looking for
                            </h3>
                            {profile.targetFor && (
                              <Badge variant="outline" className="capitalize px-3 py-1">
                                {profile.targetFor.toLowerCase()}
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" /> Availability
                            </h3>
                            {profile.availability && (
                              <Badge variant="outline" className="capitalize px-3 py-1">
                                {profile.availability?.toLowerCase().replace("_", " ")}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="h-px w-full bg-gray-200"></div>

                        {/* Resume and Interview Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg">
                                <FileText className="w-4 h-4" />
                                <span className="text-sm font-medium">Resume</span>
                              </div>
                              <div className="bg-primary text-white p-2 rounded-lg">
                                <PdfToImage pdfUrl={profile?.resumeUrl || ""} />
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground italic pl-1">resume uploaded</p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg">
                                <CalendarCheck className="w-4 h-4" />
                                <span className="text-sm font-medium">Interview</span>
                              </div>
                              <div className="bg-primary text-white p-2 rounded-lg">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <CalendarCheck className="w-4 h-4" />
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle className="text-lg font-semibold">Interview Details</DialogTitle>
                                    </DialogHeader>

                                    {/* for interview rescheduling and start now functionality */}
                                    <div className="flex flex-col gap-4">
                                      <div className="flex items-center gap-2">
                                        <CalendarCheck2 className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Status</span>
                                      </div>
                                      <p className="text-sm text-gray-700">
                                        {profile.interviewState === "pending"
                                          ? "Pending"
                                          : profile.interviewState === "completed"
                                            ? "Completed"
                                            : "Cancelled"}
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Scheduled On</span>
                                      </div>
                                      <p className="text-sm text-gray-700">
                                        {profile.interviewDate &&
                                          new Date(profile.interviewDate).toLocaleString("en-IN", {
                                            timeZone: "Asia/Kolkata",
                                          })}
                                      </p>

                                      {/* <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Reschedule</span>
                                      </div> */}

                                      <Button
                                        onClick={() => profile.interviewId && profile.resumeFileText && profile.role &&
                                          handleStartNow(profile.interviewId, profile.resumeFileText, profile.role)
                                        }
                                        disabled={!profile.interviewId || !profile.resumeFileText || !profile.role}
                                      >
                                        Start Now
                                      </Button>
                                    </div>
                                  </DialogContent>

                                </Dialog>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground italic pl-1">
                              scheduled on{" "}
                              {profile.interviewDate &&
                                new Date(profile.interviewDate).toLocaleString("en-IN", {
                                  timeZone: "Asia/Kolkata",
                                })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}



              </ScrollArea>
            </TabsContent>

            <TabsContent value="work_preference">
              <ScrollArea className="h-[calc(100vh-80px)]">
                <div className="flex flex-col gap-2 p-2 items-center justify-center h-full">
                  Comming soon
                </div>
              </ScrollArea>
            </TabsContent>

          </Tabs>
        </div>
      </ScrollArea>
      <ScrollArea className="h-screen w-[57.5%]">
        <TalentProfileCard talentProfileId={id} />
      </ScrollArea>
    </div>
  );
}
