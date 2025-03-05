"use client";
import { auth } from "@/lib/authlib";
import {
  Lock,
  FileText,
  TvMinimal,
  BriefcaseBusiness,
  Eye,
  CalendarCheck2,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import TalentMatchCSS from "./Talent.module.css";
import CreateTalentPoolProfileDialog from "./CreateTalentPoolProfile";
import { getTalentPoolProfiles } from "@/actions/talentMatchActions";
import { Badge } from "@/components/ui/badge";
import PdfToImage from "@/components/misc/pdftoimg";
import { useProfileStore } from "@/utils/profileStore";
import { useEffect, useState } from "react";
import { TalentProfileCard } from "./TalentProfileCard";
import LoadingGlobal from "@/components/ui/loading";

type ProfileData = {
  resumeUrl: string;
  role: string;
  skills: string[];
  targetFor: string;
  locationPref?: "onsite" | "remote" | "hybrid" | null;
  availability: "FULL_TIME" | "PART_TIME" | "INTERN" | "CONTRACT" | null;
  interviewStatus: string;
  interviewDate: Date;
};

export default function TalentMatchPage() {
  // const user = await auth();
  const { id } = useProfileStore();
  const [talentPoolProfiles, setTalentPoolProfiles] = useState<ProfileData[]>();

  useEffect(() => {
    const getTalentProfiles = async (id: string) => {
      const res = await getTalentPoolProfiles(id);
      const profiles = res?.map(profile => ({
        ...profile,
        locationPref: profile.locationPref as 'onsite' | 'remote' | 'hybrid' | null,
        availability: profile.availability as 'FULL_TIME' | 'PART_TIME' | 'INTERN' | 'CONTRACT' | null,
      }));
      setTalentPoolProfiles(profiles);
    };

    if (id) {
      getTalentProfiles(id);
    }
  }, [id]);

  if (!id) {
    return <LoadingGlobal text="Profile"/>; // or any other placeholder UI
  }

  return (
    <div className="flex sm:flex-row flex-col px-2 py-2 sm:py-0 sm:pr-2">
      <ScrollArea className="h-screen w-full sm:w-5/12 sm:p-4">
        <div className="h-52 sm:h-[calc(100vh-20rem)] flex items-center border rounded-lg">
          <div
            className={`${TalentMatchCSS.verticalText} h-full text-white rounded-r-lg px-2 text-center bg-primary`}
          >
            Your Matches
          </div>
          <div className="w-full flex flex-col items-center justify-center py-2">
            <Lock className="w-8 h-8 text-primary" />
            <div className="text-center max-w-[400px] text-sm text-muted-foreground mt-2 p-4">
              Complete your profile and attempt the AI interview to be
              considered for the talent pool.
            </div>
          </div>
        </div>
        <div className="flex flex-col border my-4 w-full  rounded-lg h-[calc(100vh-2rem)]">
          <div className="border-b py-3 px-5 flex relative text-sm gap-4 ">
            {talentPoolProfiles && talentPoolProfiles.length < 3 && (
              <CreateTalentPoolProfileDialog />
            )}
            <div className="font-medium cursor-pointer">Career Profile</div>
            <div className="text-muted-foreground">Work Preference</div>
          </div>
          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="flex flex-col gap-2 p-2">
              {talentPoolProfiles?.map((profile, index) => (
                <div
                  key={index}
                  className="border p-4 flex flex-col gap-4 rounded-lg shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <BriefcaseBusiness className="w-12 h-12 bg-primary text-white rounded-lg p-3 " />
                    <h2 className="text-xl font-semibold uppercase">
                      {profile.role}
                    </h2>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Experts in</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 justify-between items-start">
                    <div className="w-full">
                      <h3 className="font-medium mb-2">Looking for</h3>
                      {profile.targetFor && (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="capitalize"
                        >
                          {profile.targetFor.toLowerCase()}
                        </Badge>
                      )}
                    </div>
                    <div className="w-full">
                      <h3 className="font-medium mb-2">Availability</h3>
                      {profile.targetFor && (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="capitalize"
                        >
                          {profile.availability?.toLowerCase().replace("_", " ")}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="border w-full bg-muted-foreground"></div>
                  <div className="flex justify-between flex-col md:flex-row gap-8 sm:gap-4 items-start mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground w-full ">
                      <div className="flex gap-2 justify-center items-center bg-accent text-accent-foreground relative h-8 rounded-lg w-full sm:w-[150px] text-center text-sm">
                        <div className="absolute bottom-0 translate-y-full text-xs italic font-light left-16 w-full">
                          resume uploaded
                        </div>
                        <FileText className="w-4 h-4" /> Resume
                      </div>
                      <div className="bg-primary text-white rounded-lg">
                        <PdfToImage pdfUrl={profile.resumeUrl} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground w-full">
                      <div className="flex gap-2 justify-center items-center bg-accent text-accent-foreground relative h-8 rounded-lg w-full sm:w-[150px] text-center text-sm">
                        <div className="absolute bottom-0 translate-y-full text-xs italic font-light left-12 w-[250px]">
                          scheduled on{" "}
                          {profile.interviewDate &&
                            new Date(profile.interviewDate).toLocaleString(
                              "en-IN",
                              { timeZone: "Asia/Kolkata" }
                            )}
                        </div>
                        <TvMinimal className="w-4 h-4" /> Interview
                      </div>
                      <div className="bg-primary text-white p-2 rounded-lg">
                        <CalendarCheck2 className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </ScrollArea>
      <ScrollArea className="h-screen w-[57.5%]">
        <TalentProfileCard talentProfileId={id} />
      </ScrollArea>
    </div>
  );
}
