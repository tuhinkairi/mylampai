import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { updateHourlyRate } from "@/actions/setupProfileActions";
import { setRate } from "@/lib/features/talent_profile/talentProfileSlice";

const formSchema = z.object({
  rate: z.string().min(1, "Hourly rate is required"),
});

export function HourlyRate({ setStep }: { setStep: (step: number) => void }) {
  const dispatch=useAppDispatch()
  const profile=useAppSelector((state)=>state.talentProfile)
  const id=profile.id

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rate: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (!id) {
        throw new Error("Profile ID is missing");
      }
      const res = await updateHourlyRate(values.rate, id);

      if (res.status === 200) {
        dispatch(setRate(values.rate));
        setStep(10);
      } else {
        toast.error("Failed to update hourly rate");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update hourly rate");
    }
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-3xl space-y-4"
      >
        <FormField
          control={form.control}
          name="rate"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Input placeholder="Enter your hourly rate" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          Submit
        </Button>
      </form>
    </Form>
  );
}
