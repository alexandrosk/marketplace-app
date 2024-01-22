import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createProduct, getSettings } from "../utils/api";
import { useEffect, useState } from "react";

const productFormSchema = z.object({
  title: z.string().min(1, "Product name is required."),
  descriptionHtml: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  price: z.string().refine((val) => !Number.isNaN(parseInt(val, 10)), {
    message: "Expected number, received a string",
  }),
  category: z.string(),
  variants: z.record(z.string()).optional(),
  // Add more fields as required
});

const defaultValues = {
  title: "",
  descriptionHtml: "",
  price: 0,
  // Initialize other fields
};

const CreateProductPage = ({ customerId }) => {
  const [configuration, setConfiguration] = useState({});
  const [imagePreviews, setImagePreviews] = useState([]); // State to store image previews
  const [files, setFiles] = useState([]); // State to store image previews
  const [loading, setLoading] = useState(false);
  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const handleImageChange = (event) => {
    const fileList = Array.from(event.target.files);
    const newImagePreviews = fileList.map((file) => URL.createObjectURL(file));

    setImagePreviews(newImagePreviews); // For displaying image previews in UI
    setFiles(fileList); // Store the actual file objects for uploading
  };

  async function onSubmit(data) {
    try {
      const formData = new FormData();
      setLoading(true);

      files.forEach((file, index) => {
        formData.append(`images[${index}]`, file, file.name);
      });

      Object.entries(data).forEach(([key, value]) => {
        if (key === "variants") {
          Object.entries(value).forEach(([variantKey, variantValue]) => {
            formData.append(`variants[${variantKey}]`, variantValue);
          });
        } else {
          formData.append(key, value);
        }
      });
      formData.append("vendorId", customerId);

      const response = await createProduct(formData);
      //add loading until response

      if (response) {
        setLoading(false);
        toast({
          title: "Product Created",
          description: "Your listing has been successfully created.",
        });
      }
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error",
        description: error.message || error,
      });
    }
  }

  useEffect(() => {
    getSettings().then(function (response) {
      setConfiguration(response ?? {});
    });
  }, []);
  return (
    <Form {...form}>
      {loading && (
        <div className="flex items-center justify-center absolute h-full w-full bg-opacity-25 bg-white ">
          <Loader2 className="animate-spin" size={64} />
        </div>
      )}
      <div className={"mb-10"}>
        <h2>Create new listing</h2>
        <div className="text-left">
          <p className="text-sm text-gray-500">
            Use this form to create a new listing. The listing will be reviewed
            by our team before it is published.
          </p>
        </div>
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className=" space-x-8 grid gap-6 md:grid-cols-2 lg:grid-cols-7"
      >
        <div className={"col-span-5 space-y-8"}>
          <FormField
            control={form.control}
            name="images"
            render={({ field: { onChange, value, ...rest } }) => (
              <>
                <FormItem>
                  <FormLabel>Images</FormLabel>
                  <FormControl>
                    <Input
                      multiple
                      type="file"
                      {...rest}
                      onChange={handleImageChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload images for your product. First one will be used as a
                    cover image.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              </>
            )}
          />
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {imagePreviews.map((src, index) => (
              <div
                key={index}
                className="relative group rounded-lg overflow-hidden"
              >
                <img
                  alt={`Uploaded Image ${index + 1}`}
                  className="object-cover w-full h-48"
                  src={src}
                  style={{ aspectRatio: "200/200", objectFit: "cover" }}
                />
                <div className="absolute bottom-0 left-0 bg-white dark:bg-gray-800 bg-opacity-60 p-2 w-full text-center">
                  Image {index + 1}
                </div>
                {/* Implement remove functionality as needed */}
                <Button
                  className="absolute top-0 right-0 m-2"
                  variant="destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    setImagePreviews((prev) =>
                      prev.filter((_, i) => i !== index),
                    );
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="descriptionHtml"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="w-[180px]">
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2">
            {configuration?.variants?.map((variant) => (
              <FormField
                control={form.control}
                name={`variants.${variant.title}`}
                render={({ field }) => (
                  <FormItem className={"w-1/2"}>
                    <FormLabel>{variant.title}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={variant.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue
                            placeholder={
                              variant.value || "Select a" + " " + variant.title
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {JSON.parse(variant.values).map((option) => (
                          <SelectItem value={option.label}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
          {configuration?.settings?.allowed_categories?.length && (
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue
                          placeholder={field.value || "Select a category"}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {configuration?.settings?.allowed_categories?.map(
                        (category) => (
                          <SelectItem value={category.node.id}>
                            {category.node.title}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>

                  <FormDescription>
                    From the list of categories, select the one that best
                    describes your product.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Button type="submit">Create Product</Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateProductPage;
