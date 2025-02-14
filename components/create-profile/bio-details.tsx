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
import { Textarea } from "../ui/textarea";
import { useProfileStore } from "@/utils/profileStore";
import { updateBio } from "@/actions/setupProfileActions";

const formSchema = z.object({
  bio: z.string().min(1, "Bio is required"),
});

export function BioDetails({ setStep }: { setStep: (step: number) => void }) {
  const { id, setDescription } = useProfileStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (!id) {
        throw new Error("Profile ID is missing");
      }
      const res = await updateBio(values.bio, id);

      if (res.status === 200) {
        setDescription(values.bio);
        setStep(9);
      } else {
        toast.error("Failed to update bio");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update bio");
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
          name="bio"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Textarea placeholder="Enter bio" {...field} />
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
