"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import cn from "classnames";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addRounds, RoundsType } from "@/actions/createJobActions";
import { toast } from "sonner";
import { useUserStore } from "@/utils/userStore";
import { useState } from "react";
import { error } from "console";
import { useRouter } from "next/navigation";
import LoadingGlobal from "@/components/ui/loading";

const roundSchema = z.object({
  roundName: z.string().min(1, "Round name is required"),
  roundNumber: z.number().int().positive("Round number must be positive"),
  details: z.string(),
  roundType: z.string().min(1, "Round type is required"),
  roundDate: z.date(),
});

const formSchema = z.object({
  rounds: z.array(roundSchema).min(1, "At least one round is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function RoundsForm({ jobProfileId }: { jobProfileId: string }) {
  const { token } = useUserStore();
  const router = useRouter();
  const [round, setRound] = useState<RoundsType>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rounds: [
        {
          roundName: "",
          roundNumber: 1,
          details: "",
          roundType: "",
          roundDate: new Date(),
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "rounds",
    control: form.control,
  });
  // update the rubics

  // fetching rubircs from backend at port:5000 return list of rubics
  async function fetchRubics(job_description: string) {
    try {
      const response = await fetch(`/api/recruiter/rubrics/getrubrics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ "job_description": job_description }),
      });
      if (response.ok) {
        const result = await response.json();
        console.log("rubrics", result.result);
        return result.result;
      }
    } catch (error) {
      console.error("Error fetching Rubircs:", error);
    }

  }
  // update the rubircs in db 
  async function addRubicsToDB(job_description: string, jobRoundId: string) {
    try {
      const rubrics = await fetchRubics(job_description) //return list of rubrics
      if (rubrics) {
        const response = await fetch(`/api/recruiter/rubrics/addrubrics`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ jobRoundId: jobRoundId, rubrics: rubrics }), //sending the round id and list of rubrics
        });

        if (response.ok) {
          const result = await response.json();
          console.log("rubrics", result);
          return result;
        }
      }
    }
    catch (error) {
      console.error("Error updating Rubircs:", error);
    }
  }

  // upload rubics to their regarding rounds
  async function addRubicsToRounds(round_data: RoundsType) {
    try {
      if (round_data.length == 0) {
        throw Error(`round is null ${round_data}`)
      }
      const createdRounds = await Promise.all(
        round_data.map(async (r) => {
          if (r.id) {

            return await addRubicsToDB(r.details, r.id!)
          }
        })
      );
      console.log(createdRounds)
      return { status: "success", data: createdRounds };
    } catch (error: any) {
      console.error("❌ Error adding rounds:", error);
      return { status: "failed", error: error.message };
    }

  }


  // rubics end 
  function onSubmit(data: FormValues) {
    try {
      const rounds = data.rounds.map((round) => ({
        ...round,
        jobProfileId,
      }));
      // loading
      addRounds(rounds).then((result) => {
        if (result.data) {
          setRound(result.data)
          addRubicsToRounds(result.data)
          console.log("this is round data", round)
          form.reset();
          toast.success("Rounds added successfully");
          router.push(`/job/${jobProfileId}/evaluation`)
        }
        // loading end
      });
    } catch (error) {
      toast.error("Error in adding Rounds");

    }
  }

  return (
    <>
      {
        loading ? <LoadingGlobal text="" /> :
          (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                    <FormField
                      control={form.control}
                      name={`rounds.${index}.roundName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Round Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`rounds.${index}.roundNumber`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Round Number</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value, 10))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`rounds.${index}.details`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Details</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`rounds.${index}.roundType`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Round Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select round type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="technical">Technical</SelectItem>
                              <SelectItem value="hr">HR</SelectItem>
                              <SelectItem value="managerial">Managerial</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`rounds.${index}.roundDate`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Round {index} Date</FormLabel>
                          <Popover>
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
                                  date < new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => remove(index)}
                      >
                        Remove Round
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    append({
                      roundName: "",
                      roundNumber: fields.length + 1,
                      details: "",
                      roundType: "",
                      roundDate: new Date(),
                    })
                  }
                >
                  Add Round
                </Button>
                <Button type="submit">Submit</Button>
              </form>
            </Form>
          )
      }
    </>

  );
}
