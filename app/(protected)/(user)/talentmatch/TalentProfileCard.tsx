import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPinIcon,
  ClockIcon,
  DollarSignIcon,
  BriefcaseIcon,
  AwardIcon,
  CirclePlus,
  Pencil,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUserStore } from "@/utils/userStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Education, Employment, Project, TalentProfile } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCallback, useEffect, useState } from "react";
import { getUserEducations } from "@/actions/profileActions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getProfileEmployments,
  getProfileProjects,
} from "@/actions/talentMatchActions";
import { UpdateEducationDetails } from "@/components/talentmatch/updateEducation";
import { UpdateWorkExperiences } from "@/components/talentmatch/updateExperience";
import {
  CreateProject,
  UpdateProject,
} from "@/components/talentmatch/updateProjects";

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
  <div className="mt-4 flex items-center gap-2">
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

export function TalentProfileCard({ profile }: { profile: TalentProfile }) {
  const { userData } = useUserStore();
  const id = profile.id;

  const [open, setOpen] = useState(false);
  const [education, setEducation] = useState<Education[] | null>(null);
  const [experience, setExperience] = useState<Employment[] | null>(null);
  const [project, setProject] = useState<Project[] | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log(data);
  };

  const getExperiences = useCallback(async () => {
    try {
      const experiences = await getProfileEmployments(id);
      setExperience(experiences);
      console.log(experiences);
    } catch (error) {
      console.error("Error getting experiences:", error);
    }
  }, [id]);

  const getProjects = useCallback(async () => {
    try {
      const projects = await getProfileProjects(id);
      setProject(projects);
    } catch (error) {
      console.error("Error getting projects:", error);
    }
  }, [id]);

  const getEducations = useCallback(async () => {
    if (!userData || !userData.id) return;
    try {
      const educations = await getUserEducations(userData.id);
      setEducation(educations);
    } catch (error) {
      console.error("Error getting educations:", error);
    }
  }, [userData]);

  if (!userData) return null;

  return (
    <div className="mx-auto">
      <div className="flex items-center gap-4 h-32 relative bg-gray-100">
        <Avatar className="h-24 w-24 rounded-lg absolute -bottom-8 left-8 shadow-lg ">
          <AvatarImage src={userData?.image} alt={userData?.name} />
          <AvatarFallback className="rounded-lg cursor-default">
            {userData?.name ? userData?.name : "User"}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="px-8 mt-12">
        <h2 className="text-2xl font-semibold">{userData?.name}</h2>
        <p className="text-muted-foreground">{profile?.title}</p>
        <p className="text-muted-foreground">{profile?.bio}</p>
      </div>
      <div className="px-8">
        {(profile.skills.length > 0 || profile.profiles.length > 0) && (
          <TagList items={[...profile.skills, ...profile.profiles]} />
        )}
      </div>
      <Tabs defaultValue="account" className="w-full px-8 mt-8">
        <TabsList className="w-full justify-start p-2 mb-2 gap-2 h-auto">
          <TabsTrigger
            className="py-2"
            value="education"
            onClick={getEducations}
          >
            Education
          </TabsTrigger>
          <TabsTrigger
            className="py-2"
            value="experience"
            onClick={getExperiences}
          >
            Experience
          </TabsTrigger>
          <TabsTrigger className="py-2" value="projects" onClick={getProjects}>
            Projects
          </TabsTrigger>
          <Dialog open={open} onOpenChange={setOpen}>
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
                    <Button type="submit">Save Education</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </TabsList>
        <TabsContent value="education" className="mt-0 flex flex-col gap-2">
          {education?.map((edu, index) => (
            <div key={index} className="relative border rounded-lg p-4">
              <div className="absolute right-4 top-4">
                <UpdateEducationDetails education={edu} />
              </div>
              <h3 className="font-semibold text-lg">{edu.school}</h3>
              <p className="text-muted-foreground">
                <span className="">{edu.degree}</span>
                &nbsp;-&nbsp;
                <span>{edu.field}</span>
              </p>
              <p>
                <span className="text-muted-foreground text-sm">
                  {edu?.startDate?.toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                &nbsp;-&nbsp;
                <span className="text-muted-foreground text-sm">
                  {edu?.endDate?.toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </p>
              <p className="text-muted-foreground">{edu?.description}</p>
              {edu?.skills.length > 0 && (
                <TagList title="Skills" items={edu.skills} />
              )}
            </div>
          ))}
        </TabsContent>
        <TabsContent value="experience" className="mt-0 flex flex-col gap-2">
          {experience?.map((exp, index) => (
            <div key={index} className="relative border rounded-lg p-4">
              <div className="absolute right-4 top-4">
                <UpdateWorkExperiences experience={exp} />
              </div>
              <h3 className="font-semibold text-lg">{exp.company}</h3>
              <div className="text-muted-foreground">
                <p className="">{exp.position}</p>

                <p>{exp.location}</p>
              </div>
              <p>
                <span className="text-muted-foreground text-sm">
                  {exp?.startDate?.toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="text-muted-foreground text-sm">
                  &nbsp;-&nbsp;
                  {exp?.endDate?.toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </p>
              <p>{exp.description}</p>
              {exp?.skills.length > 0 && (
                <TagList title="Skills" items={exp.skills} />
              )}
            </div>
          ))}
        </TabsContent>
        <TabsContent value="projects" className="mt-0 flex flex-col gap-2">
          {project ? (
            project.map((item, index) => (
              <div key={index} className="relative border rounded-lg p-4">
                <div className="absolute right-4 top-4">
                  <UpdateProject project={item} />
                </div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-muted-foreground">{item?.role}</p>
                <p className="text-muted-foreground">{item?.url}</p>
                <p className="text-muted-foreground">{item.description}</p>

                {item.skills.length > 0 && (
                  <TagList title="Skills" items={item.skills} />
                )}
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center ">
              <CreateProject talentProfileId={profile.id} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
