'use client'
import TalentPoolForm from "./TalentPoolForm";
import { getRecruiterTalentPool } from "@/actions/talentPoolActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, DollarSignIcon } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/authlib";
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffect, useState } from "react";
import { parseJSON } from "date-fns";

type TalentPool = {
  id: string;
  name: string;
  skills: string[];
  profiles:string[];
  salary: number;
  createdAt: string;
  locationPref: string;
};


type TalentPoolResponse = {
  data: TalentPool[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
};

export default async function TalentPoolPage() {
  const user = await auth();

  if (!user || user.role !== "recruiter") {
    return <div>Unauthorized</div>;
  }
  const [talentPools, setTalentPools] = useState<TalentPool[]>([]); 
  const [page, setPage] = useState<number>(1); 
  const [hasMore, setHasMore] = useState<boolean>(true); 

  const fetchTalentPools = async (page: number): Promise<void> => {
    try {
      const response = await getRecruiterTalentPool({}, page, 10);
      // if (!response.ok) {
      //   throw new Error("Failed to fetch data");
      // }

      if (!Array.isArray(response)) {
        const result: TalentPoolResponse = await response.json();
        setTalentPools((prev) => [...prev, ...result.data]);
        setHasMore(page < result.totalPages); 
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.error("Error fetching talent pool data:", error);
    }
  };

  useEffect(() => {
    fetchTalentPools(page); 
  }, [page]);

  const fetchNextPage = () => {
    setPage((prev) => prev + 1); 
  };


  return (
    <div>
      <div>
        <h1>Talent Pools</h1>
        <div className="flex gap-4 p-4">
        <InfiniteScroll
        dataLength={talentPools.length} 
        next={fetchNextPage} 
        hasMore={hasMore} 
        loader={<h4>Loading...</h4>} 
        endMessage={<p>No more data to display.</p>} 
      >
          {talentPools.map((pool) => (
            <Link href={`/talentpool/${pool.id}`} key={pool.id}>
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg">Developer Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold">Skills</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {pool.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold">Profiles</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {pool.profiles.map((prof) => (
                          <Badge key={prof} variant="outline">
                            {prof}
                          </Badge>
                        ))}
                      </div>
                    </div>
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
          ))}

          </InfiniteScroll>
        </div>
      </div>
      <div>
        <h2>Create Talent Pool</h2>
        <TalentPoolForm />
      </div>
    </div>
  );
}
