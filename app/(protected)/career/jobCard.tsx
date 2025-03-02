import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, ClockIcon, Dot, Share, Share2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";


interface JobProps {
  job: {
    id: string;
    jobTitle: string;
    jobDescription: string;
    company: string;
    startDate: Date;
    endDate: Date | null;
    registrationDeadline: Date;
    skills: string[];
    salary: string;
    location: string;
    availability: string;
  };
}

export function Job({ job }: JobProps) {
  const handelShare = () => {
    navigator.clipboard.writeText(`${window.location.host}/login?redirect=/career/${job.id}`)
    toast.success("copy to clipboard");
  }
  return (
    <div className="inline-block">
      <Card className="flex flex-col h-full">
        <CardHeader>
          <div className="flex justify-between w-full ">
            <CardTitle>{job.jobTitle}</CardTitle>
            <button onClick={handelShare}>
              <Share2 color="gray" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">{job.company}</p>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm mb-4">{job.jobDescription}</p>
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
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {job.endDate
                ? `Duration: ${Math.floor(
                  (new Date(job.endDate).getTime() -
                    new Date(job.startDate).getTime()) /
                  (1000 * 60 * 60 * 24)
                )} days`
                : "Ongoing"}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <p className="text-sm font-semibold">Salary: ${job.salary}</p>
          <p className="text-xs text-muted-foreground">
            Apply by:{" "}
            {job.registrationDeadline
              ? new Date(job.registrationDeadline).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
              : "No deadline available"}
          </p>
          <div>
          <Link href={`${window.location}/${job.id}`} target="_blank">
              <Button className="clear-both" >Apply</Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>

  );
}
