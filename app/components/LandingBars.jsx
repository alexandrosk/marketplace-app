import { BarChart } from "@shopify/polaris-viz";
import { LineChart } from "@shopify/polaris-viz";
import React from "react";
//if you work with this needs to around <ClientOnly>,  else just remove it
//<ClientOnly fallback={<div></div>} children={() =>
//                 <LandingBars/>
//             }/>

const LandingBars = () => {
  return (
    <div
      style={{
        height: "250px",
      }}
    >
      <LineChart
        theme="Light"
        data={[
          {
            data: [
              {
                key: "Monday",
                value: 3,
              },
              {
                key: "Tuesday",
                value: -7,
              },
              {
                key: "Wednesday",
                value: -7,
              },
              {
                key: "Thursday",
                value: -8,
              },
              {
                key: "Friday",
                value: 50,
              },
              {
                key: "Saturday",
                value: 0,
              },
              {
                key: "Sunday",
                value: 0.1,
              },
            ],
            name: "Sellers",
          },
          {
            data: [
              {
                key: "Monday",
                value: 4,
              },
              {
                key: "Tuesday",
                value: 0,
              },
              {
                key: "Wednesday",
                value: -10,
              },
              {
                key: "Thursday",
                value: 15,
              },
              {
                key: "Friday",
                value: 8,
              },
              {
                key: "Saturday",
                value: 50,
              },
              {
                key: "Sunday",
                value: 0.1,
              },
            ],
            name: "Orders",
          },
          {
            data: [
              {
                key: "Monday",
                value: 7,
              },
              {
                key: "Tuesday",
                value: 0,
              },
              {
                key: "Wednesday",
                value: -15,
              },
              {
                key: "Thursday",
                value: -12,
              },
              {
                key: "Friday",
                value: 50,
              },
              {
                key: "Saturday",
                value: 5,
              },
              {
                key: "Sunday",
                value: 0.1,
              },
            ],
            name: "Products",
          },
        ]}
      />
    </div>
  );
};

export default LandingBars;
