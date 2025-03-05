"use client"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPinIcon, ClockIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

interface JobProps {
  job: {
    id: string;
    jobTitle: string;
    skills: string[];
    jobRole: string;
    company: string;
    startDate: Date;
    salary: string;
    location: string;
    availability: string;
  };
}

export function JobCard({ job }: JobProps) {

  const handelRedirect = (url: string) => {
    redirect(url)
  }
  return (
    // <Link href={`/job/${job.id}`}>
    // </Link>
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{job.jobTitle}</CardTitle>
        <p className="text-sm text-muted-foreground">{job.company}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills.map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <MapPinIcon className="w-4 h-4 mr-2" />
            {job.location}
          </div>
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-2" />
            {job.availability}
          </div>
        </div>
      </CardContent>
      <CardFooter className="grid justify-between items-center">
        <p className="text-sm font-semibold">Salary: ${job.salary}</p>
        <div className="spacex-x-2 pt-4">
          <Link href={`/job/${job.id}/evaluation`}>
            <Button className="hover:bg-primary-dark inline-block text-xs mr-2" >
              Show Rounds
            </Button>
          </Link>
          <Link href={`/job/${job.id}`}>
            <Button className="hover:bg-primary-dark inline-block text-xs" >
              Add Rounds
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
