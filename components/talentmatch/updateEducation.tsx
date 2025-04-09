"use client";
import { Education } from "@prisma/client";
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
import { updateUserEducation } from "@/actions/profileActions";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { ArrayInput } from "../misc/ArrayInput";
import { useAppDispatch } from "@/lib/hooks";
import { addEducation, deleteEducation, updateEducation } from "@/lib/features/talent_profile/talentProfileSlice";
import { createTalentEducation, deleteTalentEducation } from "@/actions/talentMatchActions";

const formSchema = z.object({
  school: z.string().min(1, "School name is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().optional(),
  grade: z.string().optional(),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date().optional(),
  description: z.string().optional(),
  skills: z.array(z.string()),
});

type EducationSchema = z.infer<typeof formSchema>;

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

export function CreateEducation({ talentProfileId }: { talentProfileId: string }) {
  const [open, setOpen] = React.useState(false);
  const dispatch = useAppDispatch()

  const form = useForm<EducationSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      school: "",
      degree: "",
      field: "",
      grade: "",
      description: "",
      skills: [],
    },
  });

  async function onSubmit(data: EducationSchema) {
    try {
      const result = await createTalentEducation(
        {
          ...data
        },
        talentProfileId
      );
      if (!result.error && result.status === 200 && result.response) {
        dispatch(addEducation({
          ...result.response,
          startDate: result.response.startDate ? new Date(result.response.startDate).toISOString() : "",
          endDate: result.response.endDate ? new Date(result.response.endDate).toISOString() : undefined,
          degree: result.response.degree || undefined,
          field: result.response.field || undefined,
          grade: result.response.grade || undefined,
          description: result.response.description || undefined,
        }))
        setOpen(false);
        form.reset();
      } else {
        toast.error("Failed to create education");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create education");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" ><PlusSquare /></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Add Education Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[75vh] p-3">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="school"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School/Institution</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter school or institution name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="degree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your degree" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="field"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field of Study (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your field of study"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Grade (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter grade" {...field} />
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
                        Leave blank if you&apos;re currently studying here
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
                        placeholder="Describe your studies, achievements, or any other relevant information"
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
                <Button type="submit">Save Education</Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )

}



export function UpdateEducationDetails({
  education,
}: {
  education: EducationData;
}) {
  const [open, setOpen] = React.useState(false);
  const dispatch = useAppDispatch()

  const form = useForm<EducationSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      school: education.school,
      degree: education.degree || "",
      field: education.field || "",
      grade: education.grade || "",
      description: education.description || "",
      startDate: education.startDate,
      endDate: education.endDate || undefined,
      skills: education.skills,
    },
  });

  useEffect(() => {
    form.reset({
      school: education.school,
      degree: education.degree || "",
      field: education.field || "",
      grade: education.grade || "",
      description: education.description || "",
      startDate: education.startDate,
      endDate: education.endDate || undefined,
      skills: education.skills,
    });
  }
    , [education, form]);


  async function onSubmit(values: EducationSchema) {
    const result = await updateUserEducation(values, education.id);

    if (result === "success") {
      dispatch(
        updateEducation({
          ...values,
          id: education.id,
          degree: values.degree || undefined,
          field: values.field || undefined,
          grade: values.grade || undefined,
          description: values.description || undefined,
          startDate: values.startDate ? values.startDate.toISOString() : "",
          endDate: values.endDate ? values.endDate.toISOString() : undefined,
        })
      );
      toast.success("Education details updated successfully");
      setOpen(false);
      form.reset();
    } else {
      toast.error("Failed to update education details");
    }
  }

  const handleDelete = async () => {
    if (!education?.id) {
      toast.error("Education ID is missing");
      return;
    }
    try {
      const result = await deleteTalentEducation(education.id)
      if (result !== "failed" && result.status === 200) {
        dispatch(deleteEducation(education.id))
        setOpen(false);
      } else {
        toast.error("failed to delete education")
      }
    } catch (error) {
      console.log(error)
      toast.error("failed to delete education")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size={"icon"}><Pencil className="cursor-pointer w-4 h-4 p-0 " /></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader className="mb-4 px-4">
          <DialogTitle>Update Education Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[75vh] p-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-2"
            >
              <FormField
                control={form.control}
                name="school"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School/Institution</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter school or institution name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="degree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your degree" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="field"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field of Study (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your field of study"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Grade (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter grade" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
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
                        Leave blank if you&apos;re currently studying here
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
                        rows={6}
                        placeholder="Describe your studies, achievements, or any other relevant information"
                        className="resize-none"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <div className="flex justify-between w-full items-center">
                  <Button variant="destructive" type="button" onClick={handleDelete}>Delete Education</Button>
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
