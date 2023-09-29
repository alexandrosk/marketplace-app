import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {toast} from "@/components/ui/use-toast"
import {Textarea} from "@/components/ui/textarea"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {useFieldArray, useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import * as z from "zod"
import {saveProfile} from "../utils/api";


const profileFormSchema = z.object({
    username: z
        .string()
        .min(2, {
            message: "Username must be at least 2 characters.",
        })
        .max(30, {
            message: "Username must not be longer than 30 characters.",
        }),
    title: z
        .string()
})

const defaultValues = {
    bio: "",
    urls: [
        {value: "https://shadcn.com"},
        {value: "http://twitter.com/shadcn"},
    ],
}
const CreateProfilePage = ({isVendor}) => {

    console.log(isVendor);
    const form = useForm({
        resolver: zodResolver(profileFormSchema),
        defaultValues,
        mode: "onChange",
    })

    const {fields, append} = useFieldArray({
        name: "urls",
        control: form.control,
    })

    function onSubmit(data) {
        saveProfile(data);
        toast({
            title: "You submitted the following values:",
            description: (
              <div>
                <p>Your account will go through review and you will notified soon.</p>
                <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
              </div>
            ),
        })
    }

    return (
        <div className="overflow-hidden rounded-[0.5rem] border bg-background shadow mt-4">
            <div className=" space-y-6 p-10 pb-16 md:block">
                <div className="space-y-0.5">
                    <h2 className="text-2xl font-bold tracking-tight">Create Seller Profile</h2>
                    <p className="text-muted-foreground">
                        Setup your info and start selling, your account will require approval from admin.
                    </p>
                </div>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Nike Seller" {...field} />
                      </FormControl>
                      <FormDescription>
                        The public display name of your store.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input placeholder="nike_seller" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is your public slug. Also used with @. You can only change this once every 30 days.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Tell us a little bit about yourself"
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Use this to explain what you do, what you sell, or who you are.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Update profile</Button>
            </form>
        </Form>
            </div>
        </div>
    );
};

export default CreateProfilePage;
