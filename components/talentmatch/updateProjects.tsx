"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ScrollArea } from "../ui/scroll-area";
import { createTalentProject, deleteTalentProject, updateTalentProject } from "@/actions/talentMatchActions";
import { ArrayInput } from "../misc/ArrayInput";
import { ProfileSection, Project } from "@prisma/client";
import { CalendarIcon, Pencil, PlusSquare } from "lucide-react";
import { useAppDispatch } from "@/lib/hooks";
import { addProject, deleteProject, updateProject } from "@/lib/features/talent_profile/talentProfileSlice";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";

const projectFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  role: z.string().optional(),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  startDate: z.date().optional(),
  endDate: z.date().optional()
});

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


type ProjectFormValues = z.infer<typeof projectFormSchema>;

export function CreateProject({
  talentProfileId,
}: {
  talentProfileId: string;
}) {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch()
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      description: "",
      role: "",
      url: "",
      skills: [],
    },
  });

  async function onSubmit(data: ProjectFormValues) {
    try {
      const result = await createTalentProject(
        {
          ...data
        },
        talentProfileId
      );
      if (result !== 'failed' && result.status === 200) {
        dispatch(addProject({
          ...result.response,
          role: result.response.role || undefined,
          url: result.response.url || undefined,
          startDate: result.response.startDate ? new Date(result.response.startDate).toISOString() : undefined,
          endDate: result.response.endDate ? new Date(result.response.endDate).toISOString() : undefined,
        }))
        setOpen(false);
        form.reset();
      } else {
        toast.error("Failed to create project");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create project");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size={"icon"}><PlusSquare /></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader className="mb-4 px-4">
          <DialogTitle>Add new project</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[75vh]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project title" {...field} />
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
                        placeholder="Describe your project"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your role in the project"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://your-project.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The public URL where this project can be viewed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormDescription>
                      Press &quot;enter&quot; key to add skills
                    </FormDescription>
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

              <div className="grid grid-cols-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date (Optional)</FormLabel>
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
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() ||
                              date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date (Optional)</FormLabel>
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
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() ||
                              date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Leave blank if you&apos;re currently working on the project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit">Submit Project</Button>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function UpdateProject({ project }: { project: ProjectDataType }) {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch()
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: project.title,
      description: project.description,
      role: project.role || "",
      url: project.url || "",
      skills: project.skills,
    },
  });
  useEffect(() => {
    if (project) {
      form.reset({
        title: project.title,
        description: project.description,
        role: project.role || "",
        url: project.url || "",
        skills: project.skills,
      });
    }
  }, [project, form, open]);

  async function onSubmit(data: ProjectFormValues) {
    try {
      const result = await updateTalentProject(data, project.id);
      if (result === "success") {
        dispatch(updateProject({
          ...data,
          id: project.id,
          startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
          endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
        }))
        toast.success("Project updated successfully");
        setOpen(false);
        form.reset();
      } else {
        toast.error("Failed to update project");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update project");
    }
  }

  const handleDelete = async () => {
    if (!project?.id) {
      toast.error("Project ID is missing");
      return;
    }
    try {
      const result = await deleteTalentProject(project.id)
      if (result !== "failed" && result.status === 200) {
        dispatch(deleteProject(project.id))
        setOpen(false);
      } else {
        toast.error("failed to delete project")
      }
    } catch (error) {
      console.log(error)
      toast.error("failed to delete project")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size={"icon"} ><Pencil className="cursor-pointer w-4 h-4 p-0 " /></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader className="mb-4 px-4">
          <DialogTitle>Update Project Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[75vh] p-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project title" {...field} />
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
                        placeholder="Describe your project"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your role in the project"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://your-project.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The public URL where this project can be viewed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormDescription>
                      Press &quot;enter&quot; key to add skills
                    </FormDescription>
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

              <div className="grid grid-cols-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date (Optional)</FormLabel>
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
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() ||
                              date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date (Optional)</FormLabel>
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
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() ||
                              date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Leave blank if you&apos;re currently working on the project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-between w-full items-center">
                <Button variant="destructive" type="button" onClick={handleDelete}>Delete Project</Button>
                <Button type="submit">Update</Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
