import React, { use, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Textarea } from '../ui/textarea';
import { useForm } from 'react-hook-form';
import { Pencil } from 'lucide-react';
import { setBio } from '@/lib/features/talent_profile/talentProfileSlice';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateTalentBio } from '@/actions/talentMatchActions';

export function UpdateBio() {
    const [open, setOpen] = React.useState(false);
    const dispatch = useAppDispatch();
    const profile = useAppSelector((state) => state.talentProfile);
    const talentProfileId = profile.id;
    const form = useForm({
        defaultValues: {
            bio: profile.bio || "",
        },
    });

    useEffect(() => {
        form.reset({
            bio: profile.bio || "",
        });
    }, [profile.bio, form]);

    async function onSubmit(values: any) {
        if (!talentProfileId) {
            toast.error("Failed to update Bio");
            return;
        }
        const result = await updateTalentBio(talentProfileId, values.bio);

        if (result === "success") {
            dispatch(
                setBio(values.bio)
            );
            toast.success("Bio updated successfully");
            setOpen(false);
            form.reset();
        } else {
            toast.error("Failed to update Bio");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Pencil className="cursor-pointer w-6 h-6 p-1 hover:bg-gray-100 hover:border hover:border-gray-200 hover:rounded"
                />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader className="mb-4 px-4">
                    <DialogTitle>Update Bio</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[50vh] p-4">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4 p-2"
                        >
                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bio</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                rows={6}
                                                placeholder="Describe yourself, your experiences, and what you're looking for"
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
                                    <Button type="submit">Update</Button>
                                </div>
                            </DialogFooter>
                        </form>
                    </Form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
