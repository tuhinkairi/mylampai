"use client";
import { getRecruiterTalentPools } from "@/actions/talentPoolActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, DollarSignIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type TalentPool = {
  id: string;
  title?: string | null;
  skills: string[];
  profiles: string[];
  salary: string;
  createdAt: Date;
  locationPref: string;
};

type TalentPoolResponse = {
  data: TalentPool[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
};

export default function ListTalentPool({ userId }: { userId: string }) {
  const [talentPools, setTalentPools] = useState<TalentPool[]>([]);


  useEffect(() => {
    const fetchTalentPools = async () => {
      try {
        const response = await getRecruiterTalentPools(userId);
        if (response && response.success) {
          if (response?.data) {
            setTalentPools(response.data);
          }
        } else {
          toast.error("Facing some issue,Try again!")
        }
      } catch (error) {
        console.error("Error fetching talent pool data:", error);
      }
    };
    fetchTalentPools()
  }, [])


  return (
    <>
      {talentPools.length == 0 && <div>No Data to show</div>}
      {talentPools.length > 0 &&
        talentPools.map((pool) => (
          <Link href={`/talentpool/${pool.id}`} key={pool.id}>
            <Card className="overflow-hidden w-[22rem]">
              <CardHeader>
                <CardTitle className="text-lg">Developer Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Skills</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {pool.skills.map((skill: any) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {/* <div>
                    <h3 className="font-semibold">Profiles</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {pool.profiles.map((prof: any) => (
                        <Badge key={prof} variant="outline">
                          {prof}
                        </Badge>
                      ))}
                    </div>
                  </div> */}
                  <div className="flex items-center">
                    <DollarSignIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>Salary: ₹{pool.salary}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>Location Preference: {pool.locationPref}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    <span>
                      Created: {new Date(pool.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))
      }
    </>
  );
}
