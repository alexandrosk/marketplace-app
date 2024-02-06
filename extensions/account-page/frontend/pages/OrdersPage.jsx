import { DataTable } from "../components/DataTable";

export default function OrdersPage({ vendorId }) {
  return (
    <>
      <div className=" h-full flex-1 flex-col md:flex">
        <div className="flex items-center justify-between">
          <h2>Orders Page</h2>
          {/*<div className="flex items-center space-x-2">*/}
          {/*  <UserNav />*/}
          {/*</div>*/}
        </div>
        <DataTable vendorId={vendorId} />
      </div>
    </>
  );
}
