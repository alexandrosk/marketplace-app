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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getSettings } from "../utils/api";
import { useEffect, useState } from "react";
import { CheckIcon } from "lucide-react";
import { createProduct } from "../utils/api";

const productFormSchema = z.object({
  title: z.string().min(1, "Product name is required."),
  descriptionHtml: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  price: z.string().refine((val) => !Number.isNaN(parseInt(val, 10)), {
    message: "Expected number, received a string",
  }),
  category: z.string(),
  // Add more fields as required
});

const defaultValues = {
  title: "",
  descriptionHtml: "",
  price: 0,
  // Initialize other fields
};

const CreateProductPage = () => {
  const [configuration, setConfiguration] = useState({});

  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data) {
    try {
      const response = await createProduct(data);

      if (response) {
        toast({
          title: "Product Created",
          description: "Your listing has been successfully created.",
        });
      }
    } catch (error) {
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

          <Button type="submit">Create Product</Button>
        </div>
        <div className="preview col-span-2">
          <div className="space-y-3">
            <span data-state="closed">
              <div className=" rounded-md">
                <img
                  alt="React Rendezvous"
                  loading="lazy"
                  width="250"
                  height="330"
                  decoding="async"
                  data-nimg="1"
                  className="h-auto w-auto object-cover transition-all hover:scale-105 aspect-[3/4] rounded-md"
                  src="https://fakeimg.pl/300x500/000000/ffffff?text=-&font=bebas"
                />
              </div>
            </span>
            <div className="space-y-1 text-sm">
              <h3 className="font-medium leading-none">Title</h3>
              <p className="text-xs text-muted-foreground">Price</p>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default CreateProductPage;
