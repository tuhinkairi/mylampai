"use client";
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import countries from "@/data/countries.json";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { toast } from "sonner";
import { useUserStore } from "@/utils/userStore";
import { updateProfile, uploadImage } from "@/actions/setupProfileActions";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Schema
const formSchema = z.object({
  dateOfBirth: z
    .date({
      required_error: "Date of birth is required.",
      invalid_type_error: "Invalid date format.",
    })
    .refine(
      (date) => date <= new Date() && date >= new Date("1900-01-01"),
      "Date of birth must be between 1900 and today."
    ),
  country: z.string().min(1, "Country is required."),
  street: z.string().min(1, "Street address is required."),
  city: z.string().min(1, "City is required."),
  state: z.string().min(1, "State/Province is required."),
  zipCode: z
    .string()
    .min(1, "ZIP/Postal code is required.")
    .regex(/^\d{4,10}$/, "Invalid ZIP/Postal code."),
  phone: z
    .string()
    .min(1, "Phone number is required.")
    .regex(/^\+?[0-9]{7,15}$/, "Invalid phone number format."),
});

const imageSchema = z.object({
  profileImage: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 1MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png, and .webp formats are supported."
    ),
});

type PersonalDetailsForm = z.infer<typeof formSchema>;

export function PersonalDetailsForm({
  setStep,
}: {
  setStep: (step: number) => void;
}) {
  const { userData, setUser } = useUserStore();
  const [profileImagePreview, setProfileImagePreview] = React.useState<string>(
    "https://i.pinimg.com/originals/57/3f/22/573f22a1aa17b366f5489745dc4704e1.jpg"
  );
  const router=useRouter()

  const form = useForm<PersonalDetailsForm>({
    resolver: zodResolver(formSchema),
  });

  const imageForm = useForm<z.infer<typeof imageSchema>>({
    resolver: zodResolver(imageSchema),
  });

  async function onSubmit(data: PersonalDetailsForm) {
    try {
      if (!userData || !userData.id) {
        throw new Error("User not found");
      }
      console.log("updating at id: ",userData?.id)
      const res = await updateProfile(data, userData.id);

      if (res.status !== 200) {
        toast.error("Failed to update profile");
      }else{
        router.push("/talentmatch")
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function onImageSubmit(image: File) {
    try {
      if (!userData || !userData.id) {
        throw new Error("User not found");
      }

      if (!image) {
        throw new Error("Profile picture not found");
      }

      const formData = new FormData();

      formData.append("image", image);

      const res = await uploadImage(formData, userData.id);

      if (res.status === 200) {
        toast.success("Profile picture uploaded successfully");

        if (res.data) {
          setUser({ ...userData, image: res.data.imageUrl });
        }
      } else {
        toast.error("Failed to upload profile picture");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error("No file selected");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size should be less than 1MB");
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only .jpg, .jpeg, .png, and .webp formats are supported");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onImageSubmit(file);
  };

  return (
    <div className="flex gap-4">
      <div>
        {profileImagePreview && (
          <Image
            width={100}
            height={100}
            src={profileImagePreview}
            alt="Profile preview"
            className="w-40 h-40 rounded-lg object-cover"
          />
        )}
        <div className="space-x-4">
          <Input
            type="file"
            accept="image/*"
            onChange={(event) => {
              handleImageChange(event);
            }}
          />
        </div>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
          <div className="flex items-start gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="w-[calc(33%-0.5rem)]">
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your phone number" {...field} defaultValue={userData?.phone} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="pt-2">Date of birth</FormLabel>
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
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your street address" {...field} defaultValue={userData?.street} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code} defaultValue={
                            countries.find(c => c.name === userData?.country)?.code
                          } >
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your city" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State/Province</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your state/province" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP/Postal Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your ZIP/Postal code"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit">Save Personal Details</Button>
        </form>
      </Form>
    </div>
  );
}
