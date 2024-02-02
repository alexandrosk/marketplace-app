import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { saveProfile } from "../utils/api";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";

const profileFormSchema = z.object({
  title: z
    .string()
    .min(2, {
      message: "Title must be at least 2 characters.",
    })
    .max(30, {
      message: "Title must not be longer than 30 characters.",
    }),
  enabled: z.boolean(),
  bio: z.string(),
  payment_details: z.string(),
  urls: z.array(
    z.string().url({
      message: "URL must be a valid URL.",
    }),
  ),
});

const ProfilePage = ({ isVendor, profileData }) => {
  //const [profileData, setProfileData] = useState(initProfileData?? null);

  const [image, setImage] = useState(null);
  // Setting up defaultValues based on the fetched profileData
  const defaultValues = profileData
    ? {
        username: profileData?.slug?.value || "",
        title: profileData?.title?.value || "",
        bio: profileData?.bio?.value || "Description goes here",
        payment_details: profileData?.payment_details?.value || "",
        enabled: profileData?.enabled?.value === "true",
        urls: JSON.parse(profileData?.url?.value) || [
          "https://shadcn.com",
          "http://twitter.com/shadcn",
        ],
      }
    : {};

  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    name: "urls",
    control: form.control,
  });
  const [preview, setPreview] = useState(
    profileData?.image?.reference?.image?.originalSrc || null,
  );

  function getImageData(event) {
    // FileList is immutable, so we need to create a new one
    const dataTransfer = new DataTransfer();

    // Add newly uploaded images
    Array.from(event.target.files).forEach((image) =>
      dataTransfer.items.add(image),
    );
    setImage(event.target.files[0]);
    const files = dataTransfer.files;
    const displayUrl = URL.createObjectURL(event.target.files[0]);
    return { files, displayUrl };
  }

  function onSubmit(data) {
    const formData = new FormData();

    // Append other data from the form
    Object.entries(data).forEach(([key, value]) => {
      if (key !== "images") {
        formData.append(key, value);
      }
    });
    formData.append("vendorId", profileData?.id);
    // @ts-ignore
    if (image && image.name) {
      formData.append("image", image, image.name);
    }

    console.log(formData);
    saveProfile(formData).then(function (response) {
      if (response) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      }
    });

    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Form {...form}>
      <h2>Profile Page</h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-5">
        <Avatar className="w-24 h-24">
          <AvatarImage src={preview} />
          <AvatarFallback>BU</AvatarFallback>
        </Avatar>
        <FormField
          control={form.control}
          name="circle_image"
          render={({ field: { onChange, value, ...rest } }) => (
            <>
              <FormItem>
                <FormLabel>Avatar</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    {...rest}
                    onChange={(event) => {
                      const { files, displayUrl } = getImageData(event);
                      setPreview(displayUrl);
                      onChange(files);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Choose best image that bring spirits to your circle.
                </FormDescription>
                <FormMessage />
              </FormItem>
            </>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} />
              </FormControl>
              <FormDescription>
                Your public profile shop title <br />
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          disabled={true}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display handle. And will be linking to your
                collection. <br />
              </FormDescription>
              <FormDescription>
                Use this url to link to your store:{" "}
                <a href={"/collections/" + field.value} target="_blank">
                  {field.value}
                </a>
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
                You can add <span>https URLs</span> and use break spacing to add
                more lines.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Store Enabled</FormLabel>
                <FormDescription>
                  This will enable your store to be visible to the public.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {
          <div>
            {fields.map((field, index) => (
              <FormField
                control={form.control}
                key={field.id}
                placeholder="https://example.com"
                name={`urls.${index}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(index !== 0 && "sr-only")}>
                      URLs
                    </FormLabel>
                    <FormDescription className={cn(index !== 0 && "sr-only")}>
                      Add links to your website, blog, or social media profiles.
                    </FormDescription>
                    <div
                      className={"flex items-center justify-between space-x-2"}
                    >
                      <FormControl className={"w-11/12 inline-block"}>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className=" w-1/12 inline-block"
                        onClick={() => remove(index)}
                      >
                        X
                      </Button>
                    </div>
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => append("")}
            >
              Add URL
            </Button>
          </div>
        }

        <FormField
          control={form.control}
          name="payment_details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment details</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Payment details"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Add your SWIFT or IBAN details here. To receive payments from
                the store admin when you ship the order.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Update profile</Button>
      </form>
    </Form>
  );
};

export default ProfilePage;
