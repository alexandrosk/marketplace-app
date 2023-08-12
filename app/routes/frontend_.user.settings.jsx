import {json} from "@remix-run/node";

export async function loader({ request }) {
    const url = new URL(request.url);

    return json(
        {
            products: [
                {
                    id: 1,
                    title: "Product 4",
                    description: "This is product 1",
                    price: 100,
                },
                {
                    id: 2,
                    title: "Product 5",
                    description: "This is product 2",
                    price: 200,

                }
            ]
        }
    );
}
