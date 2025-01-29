"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { addProfiles } from "@/actions/setupProfileActions";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useProfileStore } from "@/utils/profileStore";
import { toast } from "sonner";

const jobCategories = [
  {
    name: "Web, Mobile & Software Dev",
    specialties: [
      "Blockchain, NFT & Cryptocurrency",
      "AI Apps & Integration",
      "Desktop Application Development",
      "Ecommerce Development",
      "Game Design & Development",
      "Mobile Development",
      "Other - Software Development",
      "Product Management & Scrum",
      "QA Testing",
      "Scripts & Utilities",
      "Web & Mobile Design",
      "Web Development",
    ],
  },
  {
    name: "Data Science & Analytics",
    specialties: [
      "A/B Testing",
      "Data Extraction / ETL",
      "Data Mining & Management",
      "Data Visualization",
      "Machine Learning",
      "Quantitative Analysis",
    ],
  },
];

const formSchema = z.object({
  category: z.string(),
  specialties: z
    .array(z.string())
    .min(1, "Select at least one specialty")
    .max(3, "You can select up to 3 specialties"),
});  

export function JobCategoriesSelector({
  setStep,
}: {
  setStep: (step: number) => void;
}) {
  const { id, setProfiles } = useProfileStore();
  const [selectedCategory, setSelectedCategory] = React.useState(
    jobCategories[0].name
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: jobCategories[0].name,
      specialties: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (!id) return;
      const profiles = values.specialties;
      const res = await addProfiles(profiles, id);

      if (res.status === 200) {
        setProfiles(profiles);
        setStep(3);
      } else {
        console.error("Error adding profiles:", res.error);
        toast.error("Error adding profiles");
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Get the specialties for the selected category
  const specialties =
    jobCategories.find((cat) => cat.name === selectedCategory)?.specialties ||
    [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex">
          <div className="w-1/3 pr-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal text-gray-500">
                    Select 1 category
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedCategory(value);
                        form.setValue("specialties", []);
                      }}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <ScrollArea className="">
                        {jobCategories.map((category) => (
                          <div
                            key={category.name}
                            className="flex items-center space-x-2 p-2"
                          >
                            <RadioGroupItem
                              value={category.name}
                              id={category.name}
                            />
                            <label
                              htmlFor={category.name}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {category.name}
                            </label>
                          </div>
                        ))}
                      </ScrollArea>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="w-2/3 pl-4">
            <FormField
              control={form.control}
              name="specialties"
              render={() => (
                <FormItem>
                  <FormLabel className="text-sm font-normal text-gray-500">
                    Now, select 1 to 3 specialties
                  </FormLabel>
                  <div className="h-72">
                    {specialties.map((specialty) => (
                      <FormField
                        key={specialty}
                        control={form.control}
                        name="specialties"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={specialty}
                              className="flex flex-row items-center space-x-3 space-y-0 p-2"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(specialty)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange(
                                          [...field.value, specialty].slice(
                                            0,
                                            3
                                          )
                                        )
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== specialty
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {specialty}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
