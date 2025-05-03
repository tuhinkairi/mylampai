import { getJob } from "@/actions/careerActions";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  BriefcaseIcon,
  IndianRupeeIcon,
} from "lucide-react";
import ApplyJob from "./apply-job";


const formatDate = (date: string) => format(new Date(date), "PPP");

const JobDetail = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center space-x-2 text-sm">
    {icon}
    <span className="font-medium">{label}:</span>
    <span>{value}</span>
  </div>
);

const TagList = ({ title, items }: { title: string; items: string[] }) => (
  <div className="mt-4">
    <h3 className="font-semibold mb-2">{title}</h3>
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <Badge key={index} variant="secondary">
          {item}
        </Badge>
      ))}
    </div>
  </div>
);

const RoundCard = ({ round }: { round: any }) => (
  <Card className="mt-4">
    <CardHeader>
      <CardTitle className="text-lg">
        Round {round.roundNumber}: {round.roundName}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground mb-2">{round.details}</p>
      <div className="flex items-center space-x-2 text-sm">
        <CalendarIcon className="h-4 w-4" />
        <span>Date: {formatDate(round.roundDate)}</span>
      </div>
      <Badge className="mt-2">{round.roundType}</Badge>
    </CardContent>
  </Card>
);

export default async function JobPage({
  params,
}: {
  params: {
    jobProfileId: string;
  };
}) {
  const param= await params;
  const jobProfile = await getJob(param.jobProfileId);

  return (
    <>
      <div>
        {jobProfile ? (
          <div className="container mx-auto py-8 ">
            <Card className="relative">
              <ApplyJob jobProfileId={param.jobProfileId} />
              <CardHeader>
                <CardTitle>{jobProfile.jobTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{jobProfile.company}</h2>
                    <p className="text-muted-foreground">
                      {jobProfile.jobRole}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <JobDetail
                      icon={<CalendarIcon className="h-4 w-4" />}
                      label="Start Date"
                      value={new Date(jobProfile.startDate).toLocaleDateString(
                        "en-IN",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    />
                    {jobProfile.endDate && (
                      <JobDetail
                        icon={<CalendarIcon className="h-4 w-4" />}
                        label="End Date"
                        value={new Date(jobProfile.endDate).toLocaleDateString(
                          "en-IN",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      />
                    )}
                    <JobDetail
                      icon={<CalendarIcon className="h-4 w-4" />}
                      label="Registration Deadline"
                      value={new Date(
                        jobProfile.registrationDeadline
                      ).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    />
                    <JobDetail
                      icon={<MapPinIcon className="h-4 w-4" />}
                      label="Location"
                      value={jobProfile.location}
                    />
                    <JobDetail
                      icon={<ClockIcon className="h-4 w-4" />}
                      label="Availability"
                      value={jobProfile.availability}
                    />
                    <JobDetail
                      icon={<BriefcaseIcon className="h-4 w-4" />}
                      label="Job Description"
                      value={jobProfile.jobDescription}
                    />
                    {jobProfile.showSalary && <JobDetail
                      icon={<IndianRupeeIcon className="h-4 w-4" />}
                      label="Salary"
                      value={jobProfile.salary}
                    />}
                  </div>

                  <TagList title="Skills" items={jobProfile.skills} />
                  <TagList title="Profiles" items={jobProfile.profiles} />

                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-4">
                      Interview Rounds
                    </h3>
                    {jobProfile.rounds.map((round) => (
                      <RoundCard key={round.id} round={round} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div>Failed to find job</div>
        )}
      </div>
    </>
  );
}
