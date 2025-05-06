"use client";

import * as React from "react";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";

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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Pencil, PlusSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ArrayInput } from "../misc/ArrayInput";
import { createTalentExperience, deleteTalentExperience, updateTalentExperience } from "@/actions/talentMatchActions";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addExperience, deleteExperience, updateExperience } from "@/lib/features/talent_profile/talentProfileSlice";
import { ScrollArea } from "../ui/scroll-area";

const formSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  location: z.string().min(1, "Location is required"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date().optional(),
  description: z.string().optional(),
  skills: z.array(z.string()),
});

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

type WorkExperience = z.infer<typeof formSchema>;

export function CreateExperience({
  talentProfileId,
  open,
  setOpen
}: {
  talentProfileId: string;
  open:boolean;
  setOpen: (open: boolean) => void;
}) {
  // const [open, setOpen] = React.useState(false);
  const dispatch = useAppDispatch()
  const profile = useAppSelector((state) => state.talentProfile)


  const form = useForm<WorkExperience>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: "",
      position: "",
      description: "",
      location: "",
      skills: [],
    },
  });

  async function onSubmit(values: WorkExperience) {
    const result = await createTalentExperience(values, talentProfileId);

    if (!result.error && result.status === 200 && result.response) {
      dispatch(addExperience({
        ...values,
        id: talentProfileId,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate ? values.endDate.toISOString() : undefined,
      }))
      toast.success("Work experience added successfully");
      setOpen(false);
      form.reset();
    } else {
      toast.error("Failed to add work experience");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size={"icon"}  className={`cursor-pointer ${profile.experiences.length === 0 ? 'hidden' : ''}`} ><PlusSquare /></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Work Experience</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[75vh] p-3">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex w-full gap-4">
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your position" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />{" "}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter location where you had worked"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
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
                        Leave blank if this is your current job
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your responsibilities and achievements"
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
                        placeholder="Enter skills"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Save Experience</Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )

}

export function UpdateWorkExperiences({
  experience,
}: {
  experience: ExperiencesData;
}) {
  const [open, setOpen] = React.useState(false);
  const dispatch = useAppDispatch()

  const form = useForm<WorkExperience>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: experience.company,
      position: experience.position,
      startDate: experience.startDate,
      endDate: experience.endDate || undefined,
      description: experience.description as string,
      location: experience.location as string || "",
      skills: experience.skills,
    },
  });

  useEffect(() => {
    form.reset({
      company: experience.company,
      position: experience.position,
      startDate: experience.startDate,
      endDate: experience.endDate || undefined,
      description: experience.description as string,
      location: experience.location as string || "",
      skills: experience.skills,
    });
  }, [experience, form]);

  async function onSubmit(values: WorkExperience) {
    const result = await updateTalentExperience(values, experience.id);

    if (result === "success") {
      dispatch(updateExperience({
        ...values,
        id: experience.id,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate ? values.endDate.toISOString() : undefined,
      }))
      toast.success("Work experience updated successfully");
      setOpen(false);
      form.reset();
    } else {
      toast.error("Failed to update work experience");
    }
  }


  const handleDelete = async () => {
    if (!experience?.id) {
      toast.error("Experience ID is missing");
      return;
    }
    try {
      const result = await deleteTalentExperience(experience.id)
      if (result !== "failed" && result.status === 200) {
        dispatch(deleteExperience(experience.id))
        setOpen(false);
      } else {
        toast.error("failed to delete experience")
      }
    } catch (error) {
      console.log(error)
      toast.error("failed to delete experience")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size={"icon"}><Pencil className="cursor-pointer w-4 h-4 p-0 " /></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Add Work Experience</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[75vh] p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex w-full gap-4">
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your position" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />{" "}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter location where you had worked"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
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
                              date > new Date() || date < new Date("1900-01-01")
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
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Leave blank if this is your current job
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your responsibilities and achievements"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <div className="flex justify-between w-full items-center">
                  <Button variant="destructive" type="button" onClick={handleDelete}>Delete Project</Button>
                  <Button type="submit">Update</Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
