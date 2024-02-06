import * as React from "react";
import { useEffect } from "react";
import { CaretSortIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchOrders, postOrder } from "~/utils/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

export const columns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Order id
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));

      // Format the amount as a dollar amount
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div
        className={
          row.getValue("status") === "UNFULFILLED"
            ? "ring-red-300 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
            : "ring-green-600/20 inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-800 ring-1 ring-inset"
        }
      >
        {row.getValue("status")}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("createdAt")}</div>
    ),
  },
];

export function DataTable({ vendorId }) {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [data, setData] = React.useState([]);

  useEffect(() => {
    fetchOrders(vendorId)
      .then((response) => setData(response.orders))
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <Dialog>
        <DialogContent>
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <DialogDescription>
              <div className="text-muted-foreground">
                Showing {table.getFilteredRowModel().rows.length} of{" "}
                {data.length} orders.
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>

        <div className="flex items-center py-4">
          <Input
            placeholder="Filter by ID..."
            value={table.getColumn("name")?.getFilterValue() ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <Collapsible asChild key={row.id}>
                    <>
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                        <TableCell>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost">View</Button>
                          </CollapsibleTrigger>
                        </TableCell>
                      </TableRow>
                      <CollapsibleContent asChild>
                        <>
                          {row.original.lineItems.map((lineItem) => (
                            <>
                              <TableRow>
                                <TableHead></TableHead>
                                <TableHead>Shipping Address</TableHead>
                                <TableHead>Line Item</TableHead>
                              </TableRow>
                              <TableRow key={row.id}>
                                <TableCell></TableCell>
                                <TableCell>
                                  {Object.values(
                                    row.original.shippingAddress,
                                  ).join(", ")}
                                </TableCell>
                                <TableCell colSpan={3}>
                                  <div className="flex items-center space-x-2">
                                    <div>
                                      <div key={lineItem.id}>
                                        <div
                                          className={
                                            "inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20"
                                          }
                                        >
                                          {lineItem.unfulfilledQuantity}
                                          <strong>&nbsp; to ship!</strong>
                                        </div>
                                        <div>{lineItem.name}</div>
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {lineItem.unfulfilledQuantity > 0 && (
                                    <Popover>
                                      <PopoverTrigger>
                                        <Button variant="outline">Ship</Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-80">
                                        <div className="grid gap-4">
                                          <div className="space-y-2">
                                            <h4 className="font-medium leading-none">
                                              Shipping Details
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                              Add voucher code and tracking url
                                            </p>
                                          </div>
                                          <div className="grid gap-2">
                                            <div className="grid grid-cols-3 items-center gap-4">
                                              <Label htmlFor="voucher">
                                                Voucher
                                              </Label>
                                              <Input
                                                id="voucher"
                                                defaultValue=""
                                                className="col-span-2 h-8"
                                              />
                                            </div>
                                            <div className="grid grid-cols-3 items-center gap-4">
                                              <Label htmlFor="voucher">
                                                Courier Tracking
                                              </Label>
                                              <Input
                                                id="courier_tracking"
                                                defaultValue=""
                                                className="col-span-2 h-8"
                                              />
                                            </div>
                                            <Button
                                              onClick={() => {
                                                // post to backend courier and voucher
                                                //validate courier_tracking is url
                                                if (
                                                  !document.getElementById(
                                                    "courier_tracking",
                                                  )?.value ||
                                                  !document
                                                    .getElementById(
                                                      "courier_tracking",
                                                    )
                                                    ?.value.match(
                                                      /^(http|https):\/\/[^ "]+$/,
                                                    )
                                                ) {
                                                  alert(
                                                    "Please enter a valid courier tracking url",
                                                  );
                                                  return;
                                                }

                                                postOrder({
                                                  order_id: row.original.id,
                                                  line_item_id: lineItem.id,
                                                  fulfillmentDetails: {
                                                    quantity:
                                                      lineItem.unfulfilledQuantity,
                                                    orderId:
                                                      lineItem
                                                        .fulfillmentDetails[0]
                                                        .fulfillmentId,
                                                    itemId:
                                                      lineItem
                                                        .fulfillmentDetails[0]
                                                        .lineItems[0].id,
                                                  },
                                                  voucher:
                                                    document.getElementById(
                                                      "voucher",
                                                    )?.value,
                                                  courier_tracking:
                                                    document.getElementById(
                                                      "courier_tracking",
                                                    )?.value,
                                                }).then((response) => {
                                                  console.log(response);
                                                });
                                              }}
                                            >
                                              Submit
                                            </Button>
                                          </div>
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                  )}
                                </TableCell>
                              </TableRow>
                            </>
                          ))}
                        </>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
