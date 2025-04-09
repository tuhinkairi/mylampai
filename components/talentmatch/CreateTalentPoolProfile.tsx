"use client";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { CalendarIcon, Check, CirclePlus, LoaderIcon, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { getUserResumesList } from "@/actions/resumeActions";
import { useUserStore } from "@/utils/userStore";
import { createTalentPoolProfile } from "@/actions/talentMatchActions";
import { ArrayInput } from "@/components/misc/ArrayInput";
import { Calendar } from "@/components/ui/calendar";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addCareerProfile } from "@/lib/features/talent_pool_profile/talentPoolProfileSlice";

const profileSchema = z.object({
  resumeId: z.string(),
  role: z
    .string({
      required_error: "Title is required",
    })
    .min(1, {
      message: "Title cannot be empty",
    }),
  targetFor: z.enum(["JOB", "INTERNSHIP"], {
    required_error: "Opportunity is required",
    invalid_type_error: "Must be JOB, or INTERNSHIP",
  }),
  skills: z.array(z.string()),
  availability: z.enum(["FULL_TIME", "PART_TIME", "FREELANCE"], {
    required_error: "Availability is required",
    invalid_type_error: "Must be FULL_TIME, PART_TIME, or FREELANCE",
  }),
  interviewDate: z.date({
    required_error: "Interview date is required",
    invalid_type_error: "Invalid date format",
  }),
  locationPref: z.enum(["Onsite", "Remote", "Hybrid"], {
    required_error: "Location preference is required",
    invalid_type_error: "Must be Onsite, Remote, or Hybrid",
  }),
});

type ResumeList = {
  id: string;
  resumeName: string | null;
  resumeFileText?: string | null;
  resumeUrl: string | null;
}[];

const profileOptions = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Product Manager",
  "Project Manager",
  "Business Analyst",
  "UX Designer",
  "UI Designer",
  "Graphic Designer",
  "QA Engineer",
  "QA Tester",
  "QA Analyst",
];

const locationOptions = [
  "Onsite",
  "Remote",
  "Hybrid",
];

const roundToNearest30 = () => {
  let now = new Date();

  const defaultTime = new Date("2024-12-25");

  if (now < defaultTime) {
    now = defaultTime;
  }

  const minutes = now.getMinutes();
  if (minutes < 15) now.setMinutes(0);
  else if (minutes < 45) now.setMinutes(30);
  else {
    now.setMinutes(0);
    now.setHours(now.getHours() + 1);
  }
  now.setSeconds(0);
  now.setMilliseconds(0);
  return now;
};


type ProfileData = {
  resumeId: string;
  role: string;
  skills: string[];
  targetFor: string;
  locationPref?: "Onsite" | "Remote" | "Hybrid" | null | undefined;
  availability: "FULL_TIME" | "PART_TIME" | "FREELANCE" | "CONTRACT" | null;
  interviewDate: Date;
};

export default function CreateTalentPoolProfileDialog({
  isCTPPDialogOpen,
  setIsCTPPDialogOpen,
}: {
  isCTPPDialogOpen: boolean;
  setIsCTPPDialogOpen: (open: boolean) => void;
}) {
  const { userData, token } = useUserStore();
  const [resumeList, setResumeList] = useState<ResumeList>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [matchingProfiles, setMatchingProfiles] = useState<string[]>([]);
  const [uploadedResumeId, setUploadedResumeId] = useState<string | null>(
    null
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  const dispatch = useAppDispatch()
  const profile = useAppSelector((state) => state.talentProfile);
  const careerProfiles = useAppSelector(
    (state) => state.talentPoolProfile.talentPoolProfiles
  );
  const id = profile.id;

  const createProfile = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      resumeId: "",
      role: "",
      availability: "FULL_TIME",
      skills: [],
      interviewDate: roundToNearest30(),
      locationPref: "Onsite",
    },
  });

  const handleMatchingProfiles = (value: any) => {
    if (!value.trim()) {
      setMatchingProfiles([]);
      return;
    }
    const matchingProfiles = profileOptions.filter((profile) =>
      profile.toLowerCase().includes(value.toLowerCase())
    );
    setMatchingProfiles(matchingProfiles);
  };

  async function onSubmitProfile(values: z.infer<typeof profileSchema>) {
    if (!userData || !userData.id || !id) return;

    if (!uploadedResumeId && !values.resumeId) {
      createProfile.setError("resumeId", {
        type: "required",
        message: "Please upload a resume",
      });
      toast.error("Please upload a resume");
      return;
    }

    try {
      console.log("values", values);
      const res = await createTalentPoolProfile({
        ...values,
        talentProfileId: id,
        resumeId: values.resumeId || uploadedResumeId || "",
      });

      if (res.status === "success" && res.data) {
        toast.success(res.message);
        console.log("res.data", res.data);
        dispatch(addCareerProfile({
          ...values,
          id: res.data.id,
          resumeUrl: res.data.resume.resumeUrl,
          interviewDate: values.interviewDate.toISOString(),
          interviewId: res.data.interviewId,
        }));
        setIsCTPPDialogOpen(false);
        createProfile.reset();
        setMatchingProfiles([]);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create talent profile");
    }
  }

  const handleResumeUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsUploading(true)
    const file = event.target.files?.[0];
    if (!file) {
      toast.error("No file selected");
      return;
    }

    if (file.size > 1024 * 1024) {
      toast.error("File size should be less than 1MB");
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    if (!userData || !userData.id) return;

    const formData = new FormData();

    formData.append("file", file);

    try {
      // const res = await addUsersResume({body:{resumeFile:file}}, userData.id);
      const formData = new FormData();
      formData.append("resumeFile", file);
      const response = await fetch("/api/resume/add_new", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const res = await response.json();
      console.log("res", res);
      if (res.status === 200 || res.status === 209) {
        setUploadedResumeId(res.resume.id);
        const newResume = {
          id: res.resume.resumeId,
          resumeName: res.resume.resumeName,
          resumeUrl: res.resume.resumeUrl,
        };

        // Update list first, then set the selected resumeId in the next render cycle
        setResumeList((prev) => {
          const updated = [...prev, newResume];
          return updated;
        });

        toast.success("Resume uploaded successfully");


      } else {
        toast.error("Failed to upload resume");
        return null;
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload resume");
      return null;
    } finally {
      setIsUploading(false)
      setIsUploaded(true)
    }
  };

  useEffect(() => {
    if (uploadedResumeId) {
      console.log("resumeId", uploadedResumeId);
      createProfile.setValue("resumeId", uploadedResumeId);
    }
  }, [uploadedResumeId]);

  const handleTitleChange = (value: string) => {
    createProfile.setValue("role", value);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setMatchingProfiles([]);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (matchingProfiles.length === 0) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex < matchingProfiles.length - 1 ? prevIndex + 1 : 0
        );
        break;

      case "ArrowUp":
        event.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : matchingProfiles.length - 1
        );
        break;

      case "Enter":
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < matchingProfiles.length) {
          handleTitleChange(matchingProfiles[selectedIndex]);
          setMatchingProfiles([]);
        }
        break;

      case "Tab":
        if (selectedIndex >= 0 && selectedIndex < matchingProfiles.length) {
          handleTitleChange(matchingProfiles[selectedIndex]);
        }
        setMatchingProfiles([]);

      default:
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!userData || !userData.id) return;

    const fetchResumeList = async () => {
      const resumes = await getUserResumesList(userData.id);
      setResumeList(resumes);
    };

    fetchResumeList();
  }, [userData]);

  return (
    <>
      <Dialog open={isCTPPDialogOpen} onOpenChange={setIsCTPPDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className={`cursor-pointer ${careerProfiles.length === 0 ? 'hidden' : ''}`}
            onClick={() => setIsCTPPDialogOpen(true)}
            disabled={!(careerProfiles.length < 3)}// Ensures it opens on click
            variant="outline"
            size="icon"
          >
            <CirclePlus className="w-8 h-8 text-primary" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Profile</DialogTitle>
          </DialogHeader>
          <Form {...createProfile}>
            <form
              onSubmit={createProfile.handleSubmit(onSubmitProfile)}
              className="space-y-4"
            >
              <div className="flex flex-row item-center justify-between gap-4">
                <div className="w-full">
                  <FormField
                    control={createProfile.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="flex flex-col mt-2 gap-2">
                        <FormLabel>Select Your Profile</FormLabel>
                        <FormControl>
                          <div className="relative w-full group">
                            <Input
                              placeholder="Enter your profile"
                              onChange={(e) => {
                                handleMatchingProfiles(e.target.value);
                                field.onChange(e.target.value);
                              }}
                              onKeyDown={handleKeyDown}
                              value={field.value}
                            />
                            {matchingProfiles.length > 0 && (
                              <div
                                ref={dropdownRef}
                                className="z-10 absolute translate-y-[calc(100%+4px)] bottom-0 flex-col w-full bg-white border border-gray-200 rounded-md shadow-lg p-1 text-muted-foreground  "
                              >
                                {matchingProfiles.map((profile, index) => (
                                  <div
                                    key={index}
                                    onClick={() => {
                                      handleTitleChange(profile);
                                      setMatchingProfiles([]);
                                    }}
                                    className={`cursor-default hover:bg-accent text-sm py-1.5 px-2 rounded-md ${selectedIndex === index
                                      ? "bg-accent text-accent-foreground"
                                      : ""
                                      }`}
                                  >
                                    {profile}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>

                  <FormField
                    control={createProfile.control}
                    name="locationPref"
                    render={({ field }) => (
                      <FormItem className="w-full mt-2 gap-2">
                        <FormLabel> Select Location</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            defaultValue=""
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Select resume" />
                            </SelectTrigger>
                            <SelectContent>
                              {locationOptions.map((item, index) => (
                                <SelectItem
                                  key={index}
                                  value={item}
                                >
                                  {item}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </div>
              </div>

              <FormField
                control={createProfile.control}
                name="skills"
                render={({ field }) => (
                  <FormItem className="flex flex-col mt-2">
                    <FormLabel>
                      Skills &nbsp;&nbsp;
                      <span className="text-xs text-muted-foreground">
                        ( Press &quot;enter&quot; key to add skills )
                      </span>
                    </FormLabel>
                    <FormControl>
                      <ArrayInput
                        value={field?.value || []}
                        onChange={field.onChange}
                        placeholder="Enter your skills"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <FormField
                  control={createProfile.control}
                  name="resumeId"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Select or Upload Resume</FormLabel>
                      <div className="flex gap-4">
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue=""
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select resume" />
                          </SelectTrigger>
                          <SelectContent>
                            {resumeList.map((resume: any, index) => (
                              <SelectItem
                                key={resume.id + index}
                                value={String(resume.id)}
                              >
                                {resume.resumeName || `Resume ${index + 1}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <div className="flex-1">
                          <Label htmlFor="resume-upload" className="sr-only">
                            Upload Resume
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="resume-upload"
                              type="file"
                              accept=".pdf"
                              className="hidden"
                              onChange={handleResumeUpload}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                document
                                  .getElementById("resume-upload")
                                  ?.click();
                              }}
                              className="flex-1"
                            >
                              {isUploading ? (<LoaderIcon className="w-4 h-4 mr-2" />) : (isUploaded ? (<Check className="w-4 h-4 mr-2" />) : <Upload className="w-4 h-4 mr-2" />)}
                              Upload Resume
                            </Button>
                          </div>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-4">
                <FormField
                  control={createProfile.control}
                  name="targetFor"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Looking for</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select opportunity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="JOB">Job</SelectItem>
                          <SelectItem value="INTERNSHIP">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createProfile.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Availability</FormLabel>
                      <Select {...field} defaultValue="FULL_TIME">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FULL_TIME">Full Time</SelectItem>
                          <SelectItem value="PART_TIME">Part Time</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createProfile.control}
                name="interviewDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Schedule Interview</FormLabel>
                    <div className="flex gap-2">
                      <Popover modal={true}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                const currentValue = field.value || new Date();
                                const newDateTime = new Date(date);
                                newDateTime.setHours(currentValue.getHours());
                                newDateTime.setMinutes(
                                  currentValue.getMinutes()
                                );
                                field.onChange(newDateTime);
                              }
                            }}
                            disabled={(date) =>
                              date < new Date() || date < new Date("2024-12-25")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>

                      <Select
                        onValueChange={(time) => {
                          const [hours, minutes] = time.split(":");
                          const newDateTime = new Date(
                            field.value || new Date()
                          );
                          newDateTime.setHours(parseInt(hours));
                          newDateTime.setMinutes(parseInt(minutes));
                          field.onChange(newDateTime);
                        }}
                        value={
                          field.value ? format(field.value, "HH:mm") : undefined
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 * 2 }).map((_, i) => {
                            const hours = Math.floor(i / 2);
                            const minutes = (i % 2) * 30;
                            const time = `${hours
                              .toString()
                              .padStart(2, "0")}:${minutes
                                .toString()
                                .padStart(2, "0")}`;
                            return (
                              <SelectItem key={time} value={time} className="selectedItemBg border-2 border-gray-100 cursor-pointer">
                                {time}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" className="hover:bg-primary-dark">
                  Create Profile
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
