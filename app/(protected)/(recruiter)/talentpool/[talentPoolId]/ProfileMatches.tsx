"use client";
import {
  matchTalentProfile,
} from "@/actions/talentPoolActions";
import { Button } from "@/components/ui/button";
import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  MapPinIcon,
  DollarSignIcon,
  ClockIcon,
  BriefcaseIcon,
  User2Icon,
  Check,
  CheckCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import DetailedProfile from "@/components/talentPool/detailedProfile";
import { ScrollArea } from "@/components/ui/scroll-area";

type TalentPoolData = {
  id: string;
  skills: string[];
  profiles: string[];
  salary: string;
  locationPref: string;
};

interface DeveloperProfile {
  id: string;
  resumeId: string | null;
  interviewId: string | null;
  skills: string[];
  profiles: string[];
  certifications: string[];
  expectedSalary: string | null;
  locationPref: string | null;
  experienceYears: string | null;
  availability: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function ProfileMatches({
  poolData,
}: {
  poolData: TalentPoolData;
}) {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [openProfile, setOpenProfile] = useState<any>({})

  const handleGetProfiles = useCallback(async () => {
    try {
      const res = await matchTalentProfile(poolData);
      if (res && 'success' in res && res.success) {
        // console.log("res in profilematcch:: ", res.data)
        setProfiles(res.data)
      }
    } catch (error) {
      console.error(error);
    }
  }, [poolData]);


  const handleOpenProfile = (id: string) => {
    const res = profiles.find(profile => profile.id === id);
    setOpenProfile(res)
  }

  useEffect(() => {
    // console.log("openProfile--: ", openProfile)
    handleGetProfiles()
  }, [handleGetProfiles])

  useEffect(() => {
    setOpenProfile(profiles[0])
  }, [profiles])

  return (
    <div>
      {/* <h1>Profile Matches</h1> */}

      {/* <Button type="button" onClick={handleGetProfiles}>
          Get Profiles
        </Button> */}

      <div className="flex  gap-4 border-t-4 border-purple-500">
        <ScrollArea className="h-screen w-[40%]">
          {profiles.length == 0 && <div>No Data to show</div>}
          <div className="m-1">
            <h1 className="text-center text-xl font-serif font-bold">Filtered users for this talentPool</h1>
            {profiles.map((profile) => (
              <Button variant="ghost" key={profile.id} className={cn('flex justify-start overflow-hidden mr-3 mb-2 h-12 w-full', profile.id === openProfile?.id
                ? 'border-blue-500 bg-blue-200'
                : 'border-2 border-blue-300')} onClick={() => handleOpenProfile(profile.id)}>
                <div className="text-md flex gap-2 items-center"><User2Icon />{profile?.user?.name}
                  <CheckCircle2 className="text-purple-500" />
                </div>
                {/* <span className="text-gray-500 text-sm">(testData.title)</span> */}
                {/* <div className="space-y-4"> */}
                {/* <div>
                  <h3 className="font-semibold">Skills</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.skills.map((skill:string) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">Profiles</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.profiles.map((prof:string) => (
                      <Badge key={prof} variant="outline">
                        {prof}
                      </Badge>
                    ))}
                  </div>
                </div> */}
                {/* <div className="flex items-center">
                  <DollarSignIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>Expected Salary: ${profile.expectedSalary}</span>
                </div> 
               <div className="flex items-center">
                  <MapPinIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>Location Preference: {profile.locationPref}</span>
                </div> 
                <div className="flex items-center">
                  <BriefcaseIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>Experience: {profile.experienceYears} years</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>Availability: {profile.availability}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <span>
                    Created: {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
                 <Button type="button" onClick={() => handleAddUser(profile.userId)}>
                  Add User
                </Button>  */}
                {/* </div> */}
              </Button>
            ))}
          </div>

        </ScrollArea>
        <div className="w-[59%] mr-1">
          {/* <h2>detailed profile of selected user</h2> */}
          {profiles.length > 0 && openProfile && <DetailedProfile profile={openProfile} talentPoolId={poolData.id} />}
        </div>
      </div>

    </div>
  );
}
