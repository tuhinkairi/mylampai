"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import languages from "@/data/languages.json";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { createLanguages } from "@/actions/setupProfileActions";
import { toast } from "sonner";
import { useProfileStore } from "@/utils/profileStore";
import { useUserStore } from "@/utils/userStore";

const languageSchema = z.object({
  language: z.string().min(1, "Language name is required"),
  proficiency: z.enum(["Basic", "Conversational", "Fluent", "Native"]),
});

const formSchema = z.object({
  languages: z
    .array(languageSchema)
    .min(1, "At least one language is required"),
});

type LanguageForm = z.infer<typeof formSchema>;

export function LanguageSelector({
  setStep,
}: {
  setStep: (step: number) => void;
}) {
  const { userData } = useUserStore();
  const { setLanguages } = useProfileStore();

  const form = useForm<LanguageForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      languages: [{ language: "", proficiency: "Basic" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "languages",
  });

  async function onSubmit(data: LanguageForm) {
    try {
      if (!userData || !userData.id) {
        return;
      }
      console.log("updating at id: ",userData.id)
      const res = await createLanguages(data.languages, userData.id);

      if (res.status === 200) {
        setStep(8);
        setLanguages(data.languages);
        toast.success(res.message);
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      console.error("Error adding education:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Language Proficiency</h2>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start space-x-4">
                <FormField
                  control={form.control}
                  name={`languages.${index}.language`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Language</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {languages.map((language) => (
                              <SelectItem
                                key={language.code}
                                value={language.code}
                              >
                                {language.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`languages.${index}.proficiency`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Proficiency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select proficiency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Basic">Basic</SelectItem>
                          <SelectItem value="Conversational">
                            Conversational
                          </SelectItem>
                          <SelectItem value="Fluent">Fluent</SelectItem>
                          <SelectItem value="Native">
                            Native or Bilangual
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => remove(index)}
                    className="mb-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => append({ language: "", proficiency: "Basic" })}
          >
            Add Language
          </Button>
        </div>
        <Button type="submit">Save Languages</Button>
      </form>
    </Form>
  );
}
