"use client";
import { createTalentPool, matchTalentProfile } from "@/actions/talentPoolActions";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  talentPoolSchema,
  TalentPoolFormData,
} from "@/schemas/talentPoolSchema";
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
import { useUserStore } from "@/utils/userStore";
import { ArrayInput } from "@/components/misc/ArrayInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, DollarSignIcon, BriefcaseIcon, ClockIcon, User2Icon } from "lucide-react";
import DetailedProfile from "@/components/talentPool/detailedProfile";
import { cn } from "@/lib/utils";



export default function TalentPoolForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userData } = useUserStore();
  const [fetchedProfiles, setFetchedProfiles] = useState<any[]>([])
  const [openProfile, setOpenProfile] = useState<any>({})

  const form = useForm<TalentPoolFormData>({
    resolver: zodResolver(talentPoolSchema),
    defaultValues: {
      skills: [],
      profiles: [],
      salary: "",
      locationPref: "",
    },
  });

  const onSubmit = async (data: TalentPoolFormData) => {
    setIsSubmitting(true);
    try {
      if (!userData) return;

      // const res = await createTalentPool({
      //   ...data,
      //   userId: userData.id,
      // });
      const res = await matchTalentProfile({ ...data });
      if (Array.isArray(res)) {
        toast.error("Failed to create talent pool");
        setIsSubmitting(false);
        return;
      }
      if (res.status === 200) {
        console.log("result from pool :: ", res.data);
        setFetchedProfiles(res.data)
        toast.success("Successfully created talent pool");
      } else {
        toast.error("Failed to create talent pool");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while submitting the form.");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleOpenProfile = (id: string) => {
    const res = fetchedProfiles.find(profile => profile.id === id);
    setOpenProfile(res)
  }

  useEffect(() => {
    console.log("openProfile--: ", openProfile)
  }, [openProfile])

  return (
    <>
      {/* Smart Search Bar */}
      {/* <div className = "border-2 w-200px p-5 border-blue-700 rounded-md" >
      <div>
        <input value="" placeholder="Enter JD" className="border-2 border-gray-400" />
      </div>
    </div> */}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-w-xl m-auto space-y-8"
        >
          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skills</FormLabel>
                <FormControl>
                  <ArrayInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Enter skills required"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="profiles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profiles</FormLabel>
                <FormControl>
                  <ArrayInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Enter targeting profiles"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary</FormLabel>
                <FormControl>
                  <Input placeholder="Enter salary range" {...field} />
                </FormControl>
                <FormDescription>
                  Specify the salary range for the talent pool.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locationPref"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location Preference</FormLabel>
                <FormControl>
                  <Input placeholder="Enter location preference" {...field} />
                </FormControl>
                <FormDescription>
                  Specify the preferred location for the talent pool.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </Form>

      <div className="flex  gap-4">
        <div className="w-[40%]">
          <h2>Filtered users</h2>
          <div className="m-2">
            {fetchedProfiles.map((profile) => (
              <Card key={profile.id} className={cn('overflow-hidden m-3',profile.id === openProfile?.id
                ? 'border-blue-500 bg-blue-100'
                : 'border-transparent')} onClick={() => handleOpenProfile(profile.id)}>
                <CardHeader>
                  <CardTitle className="text-lg">Developer {profile.id} Profile</CardTitle>
                  <span className="flex gap-2"><User2Icon />{profile.user.name}</span>
                </CardHeader>
                {/* <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Skills</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.skills.map((skill:string) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">Profiles</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.profiles.map((prof:string) => (
                      <Badge key={prof} variant="outline">
                        {prof}
                      </Badge>
                    ))}
                  </div>
                </div>
                {/* <div className="flex items-center">
                  <DollarSignIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>Expected Salary: ${profile.expectedSalary}</span>
                </div> 
                {/* <div className="flex items-center">
                  <MapPinIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>Location Preference: {profile.locationPref}</span>
                </div> 
                <div className="flex items-center">
                  <BriefcaseIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>Experience: {profile.experienceYears} years</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>Availability: {profile.availability}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <span>
                    Created: {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
                 <Button type="button" onClick={() => handleAddUser(profile.userId)}>
                  Add User
                </Button> 
              </div>
            </CardContent> */}
              </Card>
            ))}
          </div>

        </div>
        <div className="w-[59%] pr-4">
          <h2>detailed profile of selected user</h2>
          {fetchedProfiles.length > 0 && openProfile && <DetailedProfile profile={openProfile} />}
        </div>
      </div>

    </>
  );
}
