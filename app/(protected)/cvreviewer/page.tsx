"use client";
import { useState, useEffect } from "react";
import StepOneTwo from "./StepOneTwo";
import FullScreenLoader from "@/components/global/FullScreenLoader";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileSearch, Download, ExternalLink, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/utils/userStore";
import { redirect } from "next/navigation";
import { getUserResumesList } from "@/actions/resumeActions";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

type Resume = {
  id: string;
  resumeName: string | null;
  resumeFileText?: string | null;
  resumeUrl: string | null;
  isAnalysisDone: boolean;
  updatedAt?: string | Date;
  score?: number | null;
};

type ResumeList = Resume[];

const Page: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [resumeList, setResumeList] = useState<ResumeList>([]);
  const { userData } = useUserStore();

  useEffect(() => {
    if (userData && userData.id) {
      const fetchResumeList = async () => {
        setLoading(true);
        try {
          const resumes = await getUserResumesList(userData.id);
          // Filter for resumes where analysis is done
          const analyzedResumes = resumes.filter(res => res.isAnalysisDone === true);
          setResumeList(analyzedResumes);
        } catch (error) {
          console.error("Error fetching resumes:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchResumeList();
    }
  }, [userData]);

  if (userData && !userData.id) {
    redirect("/");
  }

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "Unknown date";
    return format(new Date(dateString), "MMM d, yyyy");
  };

  // Function to get score color class based on score value
  const getScoreColorClass = (score: number | null | undefined) => {
    if (score === null || score === undefined) return "bg-gray-200 text-gray-700";
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="container mx-auto py-8">
      {loading && <FullScreenLoader message="Loading resumes..." />}

      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Past Resumes</h1>
          <p className="text-muted-foreground">Track and review your analyzed resumes</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
              <FileSearch className="h-4 w-4" />
              Analyze New CV
            </Button>
          </DialogTrigger>

          <DialogContent className="max-h-[95vh] max-w-[60vw] bg-primary-foreground">
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center gap-2 mb-3">
                  <FileSearch className="h-6 w-6" />
                  <h3 className="text-lg font-semibold">Get detailed analysis</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Start a new CV reviewer session and analyze your CV.
                </p>
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="w-full">
              <StepOneTwo />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden border border-border">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : resumeList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No analyzed resumes found</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            You haven't analyzed any resumes yet. Start by clicking the "Analyze New CV" button above.
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                Analyze Your First CV
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[95vh] max-w-[60vw] bg-primary-foreground">
              <DialogHeader>
                <DialogTitle>
                  <div className="flex items-center gap-2 mb-3">
                    <FileSearch className="h-6 w-6" />
                    <h3 className="text-lg font-semibold">Get detailed analysis</h3>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="w-full">
                <StepOneTwo />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumeList.map((resume) => (
            <Card key={resume.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold line-clamp-1">
                    {resume.resumeName || "Untitled Resume"}
                  </CardTitle>
                  {/* <Badge className={getScoreColorClass(resume.score)}>
                    {resume.score ? `${resume.score}%` : "No Score"}
                  </Badge> */}
                </div>
                {/* <CardDescription className="flex items-center gap-1 text-sm">
                  <Calendar className="h-3 w-3" />
                  {formatDate(resume.createdAt)}
                </CardDescription> */}
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-2">
                  {resume.resumeFileText ? (
                    (() => {
                      const parsed = JSON.parse(resume.resumeFileText);
                      const description = parsed.Description;
                      return typeof description === "string" ? (
                        <p className="line-clamp-3">{description.substring(0, 150)}...</p>
                      ) : (
                        <p className="italic">No preview available</p>
                      );
                    })()
                  ) : (
                    <p className="italic">No preview available</p>
                  )}

                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2 gap-2">
                {resume.resumeUrl && (
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={resume.resumeUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Link>
                  </Button>
                )}
                <Button className="flex-1 bg-primary hover:bg-primary/90" asChild>
                  <Link href={`/cvreviewer/${resume.id}/analysis`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;