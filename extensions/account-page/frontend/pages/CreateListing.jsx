import React, { useEffect, useState } from "react";
import { PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Undo, SaveAll, Eye, ZoomIn } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@radix-ui/react-select";
import { getSettings } from "../utils/api";

const CreateListing = () => {
  const [variations, setVariations] = useState([{ label: "", quantity: "" }]);
  const [variationInputVisibility, setVariationInputVisibility] =
    useState(false);

  const handleQuantityChange = (index, quantity) => {
    const newVariations = [...variations];
    newVariations[index].quantity = quantity;
    setVariations(newVariations);
  };

  const handleVariationChange = (index, label) => {
    const newVariations = [...variations];
    newVariations[index].label = label;
    setVariations(newVariations);
  };

  const handleVariationInputToggle = () => {
    setVariationInputVisibility(!variationInputVisibility);
  };

  const [settings, setSettings] = useState({}); //[{"key":"test","value":"test"}]);

  useEffect(() => {
    getSettings().then(function (response) {
      setSettings(response);
    });
  }, []);

  function renderCategories(categoriesString) {
    try {
      return JSON.parse(categoriesString).map((category, index) => (
        <DropdownMenuItem key={index}>{category.label}</DropdownMenuItem>
      ));
    } catch (e) {
      console.error("Error parsing allowed categories JSON", e);
      return null;
    }
  }

  return (
    <>
      <div>
        <h3 className="text-lg font-medium">Create Listing</h3>
        <p className="text-sm text-muted-foreground">
          Add a new product to your store.
        </p>
      </div>
      <Separator />
      <main className="mt-10 grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <h3 className="mb-2">Product Image</h3>
              <Input type="file" className="p-2 w-72" />
            </div>
            <div>
              <h3 className="mb-2">Product Name</h3>
              <Input type="text" className="p-2 w-72" />
            </div>
            <div>
              <h3 className="mb-2">Product Category</h3>
              <DropdownMenu>
                <DropdownMenuTrigger className="p-2 w-72 border border-gray-200">
                  Select Category
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {settings?.settings?.allowed_categories &&
                    renderCategories(settings.settings.allowed_categories)}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <h3 className="mb-2">Product Tags</h3>
              <Input
                type="text"
                className="p-2 w-72"
                placeholder="Separate tags with comma"
              />
            </div>
            <div>
              <h3 className="mb-2">Product Variations</h3>
              <div className="flex items-center">
                <Button
                  onClick={handleVariationInputToggle}
                  variant="outline"
                  className="w-max mr-3"
                >
                  <PlusSquare className="h-5 w-5 mr-1" />
                  Add Variation
                </Button>
              </div>
              {variationInputVisibility &&
                variations.map((variation, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      type="text"
                      className="p-2 w-36"
                      value={variation.label}
                      placeholder="Label"
                      onChange={(e) =>
                        handleVariationChange(index, e.target.value)
                      }
                    />
                    <Input
                      type="number"
                      className="p-2 w-36"
                      placeholder="Quantity"
                      value={variation.quantity}
                      onChange={(e) =>
                        handleQuantityChange(index, e.target.value)
                      }
                    />
                    <Input
                      type="number"
                      className="p-2 w-36"
                      placeholder="Price (If different)"
                      value={variation.quantity}
                      onChange={(e) =>
                        handleQuantityChange(index, e.target.value)
                      }
                    />
                  </div>
                ))}
            </div>
            <div>
              <h3 className="mb-2">Delivery Price</h3>
              <Input type="number" className="p-2 w-72" />
            </div>
            <div>
              <h3 className="mb-2">Quantity</h3>
              <Input type="number" className="p-2 w-72" />
            </div>
            <div className="flex justify-end space-x-4 mt-10">
              <Button className="outline">
                <Undo className="h-4 w-4 mr-2" />
                Cancel
              </Button>

              <Button className="outline">
                <SaveAll className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
        <div className="col-span-1 space-y-5">
          <Popover className="shadow rounded-lg">
            <PopoverTrigger asChild>
              <Card className="border p-4 rounded-lg cursor-pointer">
                <CardHeader className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold">
                    Product Name
                  </CardTitle>
                  <Eye className="h-6 w-6" />
                </CardHeader>
                <CardContent className="flex flex-col gap-4 mt-2">
                  <img
                    src="https://via.placeholder.com/150"
                    alt="Product Img"
                    className="rounded-lg"
                  />
                  <div>
                    <CardDescription className="text-gray-500">
                      Category: Electronics
                    </CardDescription>
                    <CardDescription className="text-gray-500">
                      Tags: tag1, tag2
                    </CardDescription>
                  </div>
                  <div>
                    <CardDescription className="text-gray-500">
                      Delivery Price: &#36;5
                    </CardDescription>
                    <CardDescription className="text-gray-500">
                      Quantity: 100
                    </CardDescription>
                  </div>
                </CardContent>
              </Card>
            </PopoverTrigger>
          </Popover>
        </div>
      </main>
    </>
  );
};

export default CreateListing;
