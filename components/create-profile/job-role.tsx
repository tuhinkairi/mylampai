import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProfileStore } from "@/utils/profileStore";
import { updateTitle } from "@/actions/setupProfileActions";
import { toast } from "sonner";

const formSchema = z.object({
  role: z.string().min(1, "Job title is required"),
});

export function ProfessionalRole({
  setStep,
}: {
  setStep: (step: number) => void;
}) {
  const { id, setTitle } = useProfileStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (!id) {
        throw new Error("Profile ID is missing");
      }
  
      
      const res = await updateTitle(values.role, id);

      if (res.status === 200) {
        setTitle(values.role);
        setStep(5);
      } else {
        toast.error("Failed to update job title");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create job");
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
          name="role"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Input placeholder="Enter job role" {...field} />
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
