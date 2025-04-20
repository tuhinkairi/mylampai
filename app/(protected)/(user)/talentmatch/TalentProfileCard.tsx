import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/utils/userStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Project, TalentProfile } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getProfileExperiences,
  getProfileProjects,
} from "@/actions/talentMatchActions";
import { CreateEducation, UpdateEducationDetails } from "@/components/talentmatch/updateEducation";
import { CreateExperience, UpdateWorkExperiences } from "@/components/talentmatch/updateExperience";
import {
  CreateProject,
  UpdateProject,
} from "@/components/talentmatch/updateProjects";
import { getTalentProfile } from "@/actions/setupProfileActions";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import Image from "next/image";
import { setProjects } from "@/lib/features/talent_profile/talentProfileSlice";
import { UpdateBio } from "@/components/talentmatch/updateBio";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen, Briefcase, Building, Calendar, FileText, GraduationCap, Layers, Layout, PlusSquare, School } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

const ProfileDetail = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) => (
  <div className="flex items-center space-x-2 text-sm">
    {icon}
    <span className="font-medium">{label}:</span>
    <span>{value}</span>
  </div>
);

const TagList = ({ title, items }: { title?: string; items: string[] }) => (
  <div className="flex items-center gap-2">
    {title && <h3 className="font-semibold">{title}</h3>}
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <Badge key={index} variant="secondary">
          {item}
        </Badge>
      ))}
    </div>
  </div>
);

type ExperiencesData = {
  id: string;
  company: string;
  position: string;
  location: string;
  skills: string[];
  startDate: Date;
  endDate?: Date;
  description?: string;
};

type EducationData = {
  id: string;
  school: string;
  degree?: string;
  field?: string;
  grade?: string;
  skills: string[];
  startDate: Date;
  endDate?: Date;
  description?: string;
};

type ProjectDataType = {
  id: string;
  title: string;
  description: string;
  role?: string;
  url?: string;
  startDate?: Date;
  endDate?: Date;
  skills: string[];
};

export function TalentProfileCard({ talentProfileId }: { talentProfileId: string }) {
  const { userData } = useUserStore();
  const [open, setOpen] = useState(false);
  const [education, setEducation] = useState<EducationData[] | null>(null);
  const [experience, setExperience] = useState<ExperiencesData[] | null>(null);
  const [project, setProject] = useState<ProjectDataType[] | null>(null);
  const [talentProfile, setTalentProfile] = useState<TalentProfile | null>(null)
  const profile = useAppSelector((state) => state.talentProfile)
  const dispatch = useAppDispatch()
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProjDialogOpen, setIsProjDialogOpen] = useState(false)
  const [isEduDialogOpen, setIsEduDialogOpen] = useState(false)
  const [isExpDialogOpen, setIsExpDialogOpen] = useState(false)

  // console.log("profile from redux store__> ", profile)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    // console.log(data);
  };

  // useEffect(() => {
  //   const getTP = async () => {
  //     const res = await getTalentProfile(userData?.id as string)
  //     if (!res) return;
  //     if (res?.data) {
  //       setTalentProfile(res.data);
  //     }
  //   }
  //   try {
  //     getTP();
  //   } catch (error) {
  //     console.error("Error fetching talent profile:", error);
  //   }
  // }, [talentProfileId,userData?.id])

  // const getExperiences = useCallback(async () => {
  //   try {
  //     const experiences = await getProfileExperiences(talentProfileId);
  //     setExperience(experiences);
  //     // console.log(experiences);
  //   } catch (error) {
  //     console.error("Error getting experiences:", error);
  //   }
  // }, [talentProfileId]);



  useEffect(() => {
    setExperience(profile.experiences.map(exp => ({
      ...exp,
      startDate: new Date(exp.startDate),
      endDate: exp.endDate ? new Date(exp.endDate) : undefined,
    })))
  }, [profile.experiences])

  useEffect(() => {
    if (profile.educations.length > 0) {
      setEducation(profile.educations.map(edu => ({
        ...edu,
        startDate: new Date(edu.startDate),
        endDate: edu.endDate ? new Date(edu.endDate) : undefined,
      })))
    }
  }, [profile.educations])

  useEffect(() => {
    if (profile.projects && profile.projects.length > 0) {
      setProject(profile.projects.map(proj => ({
        ...proj,
        startDate: proj.startDate ? new Date(proj.startDate) : undefined,
        endDate: proj.endDate ? new Date(proj.endDate) : undefined,
      })));
    }
  }, [profile.projects])

  const getProjects = useCallback(async () => {
    try {
      if (!profile.projects) {
        const projects = await getProfileProjects(talentProfileId);
        const mappedProjects = projects.map(p => ({
          ...p,
          role: p.role ?? undefined,
          url: p.url ?? undefined,
          startDate: p.startDate ? new Date(p.startDate).toISOString() : undefined,
          endDate: p.endDate ? new Date(p.endDate).toISOString() : undefined,
        }));
        dispatch(setProjects(mappedProjects))
      } else {
        setProject(profile.projects.map((proj: any) => ({
          ...proj,
          startDate: proj.startDate ? new Date(proj.startDate) : undefined,
          endDate: proj.endDate ? new Date(proj.endDate) : undefined,
        })));
      }
    } catch (error) {
      console.error("Error getting projects:", error);
    }
  }, [talentProfileId, dispatch, profile?.projects]);

  // const getEducations = useCallback(async () => {
  //   // if (!userData || !userData.id) return;
  //   try {
  //     const educations = await getUserEducations(talentProfileId);
  //     setEducation(educations);
  //   } catch (error) {
  //     console.error("Error getting educations:", error);
  //   }
  // }, [talentProfileId]);


  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const [shouldShowToggle, setShouldShowToggle] = useState(false);

  useEffect(() => {
    if (profile?.bio && profile.bio.length > 250) {
      setShouldShowToggle(true);
    } else {
      setShouldShowToggle(false);
    }
  }, [profile?.bio]);

  if (!userData) return null;

  return (
    <div className="mx-auto ">
      <div className="flex rounded-t-md items-center gap-4 h-32 bg-[url(/images/background.jpg)] relative bg-opacity-5">
      </div>
      <div className="flex flex-row items-top gap-3 pt-2">
        <Avatar className="h-24 w-24 rounded-lg relative  left-2 shadow-lg ">
          <AvatarImage src={userData?.image} alt={userData?.name} />
          <AvatarFallback className="rounded-lg cursor-default">
            {userData?.name ? userData?.name : "User"}
          </AvatarFallback>
        </Avatar>
        <div className="p-2">
          <h2 className="text-md font-semibold text-gray-700">{userData.name}</h2>
          <div>
            <span className="text-gray-500 text-sm">{profile?.title}</span>
          </div>
        </div>
      </div>
      <div className="flex-col items-center gap-2 mt-2 px-4">
        {/* {testData.verified && (
          <span className="flex items-center justify-center w-4 h-4 bg-violet-500 rounded-full">
            <Check className="w-2 h-2 text-white" />
          </span>
        )} */}

        <div className="p-2 border-b-2 rounded-md shadow-sm">
          <div className="flex justify-between items-center mt-2">
            <h3 className="font-medium text-lg">Bio</h3>
            <UpdateBio />
          </div>

          {shouldShowToggle ? (
            <>
              <p className={`text-muted-foreground text-sm ${!isExpanded ? 'line-clamp-3' : ''}`}>
                {profile.bio}
              </p>
              <button
                onClick={toggleExpand}
                className="text-blue-500 hover:text-blue-700 text-sm focus:outline-none"
              >
                {isExpanded ? 'Read less' : 'Read more'}
              </button>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              {profile?.bio || "No bio available"}
            </p>
          )}
        </div>

        {
          profile.profiles && profile.profiles.length > 0 && (
            <div className="flex gap-2 mt-4 items-center">
              <h3 className="font-semibold">Profiles:</h3>
              <TagList items={profile.profiles} />
            </div>
          )
        }
        {/* 
        {profile?.skills && profile?.profiles && (profile?.skills?.length > 0 || profile?.profiles?.length > 0) && (
          <TagList items={[...profile?.skills, ...profile?.profiles]} />
        )} */}
      </div>
      <Tabs defaultValue="education" className="w-full px-2 mt-8">
        <TabsList className="w-full justify-start p-2 mb-2 gap-2 h-auto">
          <TabsTrigger
            className="py-2"
            value="education"
          // onClick={getEducations}
          >
            Education
          </TabsTrigger>
          <TabsTrigger
            className="py-2"
            value="experience"
          // onClick={getExperiences}
          >
            Experience
          </TabsTrigger>
          <TabsTrigger className="py-2" value="projects" onClick={getProjects}>
            Projects
          </TabsTrigger>
          {/* <TabsTrigger className="py-2" value="skills">
            Skills
          </TabsTrigger> */}

          {/* <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <CirclePlus className="hover:cursor-pointer rounded-full" />
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add another section</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter the title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe in details"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Save</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog> */}
        </TabsList>
        <TabsContent value="education" className="mt-0 flex flex-col gap-2">
          <div className=" flex justify-between items-center ">
            <h1 className='p-4 text-xl font-bold'>Education</h1>
            <CreateEducation talentProfileId={talentProfileId} open={isEduDialogOpen} setOpen={setIsEduDialogOpen} />
          </div>
          {education && education.length > 0 ? education?.map((edu, index) => (
            <div key={index} className="relative border rounded-lg p-4 mb-4">
              <div className="absolute right-4 top-4">
                <UpdateEducationDetails education={edu} />
              </div>
              <div className='flex gap-2'>
                <Image src={'/images/edu_logo.jpeg'} alt="edu_logo" width={40} height={40} className='rounded-md' />
                <h3 className="font-semibold text-lg">{edu.school}</h3>
              </div>
              <p className="text-muted-foreground">
                <span className="">{edu.degree}</span>
                {edu?.field && " - "}
                <span>{edu.field}</span>
              </p>
              <p>
                <span className="text-muted-foreground text-sm">
                  {edu?.startDate?.toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                {edu?.endDate && " - "}
                <span className="text-muted-foreground text-sm">
                  {edu?.endDate?.toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </p>
              <p className="text-muted-foreground">{edu?.description}</p>
              {edu?.skills?.length > 0 && (
                <TagList title="Skills" items={edu.skills} />
              )}
            </div>
          )) : (<div className="flex justify-center w-full">
            <EmptyState
              title="No Education Details Found"
              description="Add your educational background to complete your profile."
              icons={[GraduationCap, School, BookOpen]}
              action={{
                label: <><PlusSquare className="mr-1" />Add Education</>,
                onClick: () => setIsEduDialogOpen(true),
              }}
            />
          </div>)}
        </TabsContent>
        <TabsContent value="experience" className="mt-0 flex flex-col gap-2">
          <div className="flex justify-between items-center ">
            <h1 className='p-4 text-xl font-bold'>Experience</h1>
            <CreateExperience talentProfileId={talentProfileId} open={isExpDialogOpen} setOpen={setIsExpDialogOpen} />
          </div>
          {experience && experience.length > 0 ? experience?.map((exp, index) => (
            <div key={index} className="relative border rounded-lg p-4">
              <div className="absolute right-4 top-4">
                <UpdateWorkExperiences experience={exp} />
              </div>
              <div className='flex gap-2'>
                <Image src={'/images/org_logo.png'} alt="edu_logo" width={40} height={40} className='rounded-md' />
                <h3 className="font-semibold text-lg">{exp.company}</h3>
              </div>
              <div className="text-muted-foreground ml-12">
                <p className="">{exp.position}</p>
                <p>{exp.location}</p>
                <span className="text-muted-foreground text-sm">
                  {exp?.startDate?.toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="text-muted-foreground text-sm">
                  {exp?.endDate && " - "}
                  {exp?.endDate?.toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <ul className='ml-12 list-disc'>
                {exp.description && exp.description.split(/(?:•|\.\s)/).map((item: string) => item.trim().replace(/^[\-\•\*\•]+/, '')).filter((item: string) => item.length > 0).map((item: string, index: number) => (<li key={index}> {item.endsWith('.') ? item : item + '.'}</li>))}</ul>
              {exp?.skills?.length > 0 && (
                <TagList title="Skills" items={exp.skills} />
              )}
            </div>
          )) : (<div className="flex justify-center w-full">
            <EmptyState
              title="No Work Experience Found"
              description="Add your work history to highlight your professional background."
              icons={[Briefcase, Building, Calendar]}
              action={{
                label: <><PlusSquare className="mr-1" />Add Experience</>,
                onClick: () => setIsExpDialogOpen(true),
              }}
            />
          </div>)}
        </TabsContent>
        <TabsContent value="projects" className="mt-0 flex flex-col gap-2">
          <div className="flex justify-between items-center ">
            <h1 className='p-4 text-xl font-bold'>Projects</h1>
            <CreateProject talentProfileId={talentProfileId} open={isProjDialogOpen} setOpen={setIsProjDialogOpen} />
          </div>

          {project && project.length > 0 ? (
            project.map((item, index) => (
              <div key={index} className="relative border rounded-lg p-4 mb-4">
                <div className="absolute right-4 top-2">
                  <UpdateProject project={item} />
                </div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <div className="text-muted-foreground">
                  <span className="text-muted-foreground text-sm">
                    {item?.startDate?.toLocaleDateString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {item?.endDate && " - "}
                    {item?.endDate?.toLocaleDateString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="text-muted-foreground px-2 flex items-center">                <h3 className="font-semibold text-sm">Worked As: </h3>
                  {item?.role}</div>
                <div className="text-muted-foreground px-2 flex items-center">                <h3 className="font-semibold text-sm">View: </h3>{item?.url}</div>
                <div className="text-muted-foreground p-2">{item.description}</div>

                {item.skills.length > 0 && (
                  <TagList title="Skills" items={item.skills} />
                )}
              </div>
            ))
          ) : (<div className="flex justify-center w-full">
            <EmptyState
              title="No Projects Found"
              description="Add your project details to showcase your work."
              icons={[Layout, Layers, FileText]}
              action={{
                label: <><PlusSquare className="mr-1" />Create Project</>,
                onClick: () => setIsProjDialogOpen(true),
              }}
            />
          </div>)}
        </TabsContent>

        {/* <TabsContent value="skills" className="mt-0 flex flex-col gap-2">
          <div className="flex justify-between items-center ">
            <h1 className='p-4 text-xl font-bold'>Skills</h1>
            <CreateProject talentProfileId={talentProfileId} />
          </div>
          {profile?.skills && profile?.skills.length > 0 && (
            <TagList items={profile?.skills} />
          )}

        </TabsContent> */}

      </Tabs>
    </div>
  );
}
