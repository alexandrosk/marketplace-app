export const fetchProductsFromProxy = async (vendorSlug) => {
  try {
    const response = await fetch(
      "/apps/frontend/user/products?vendorSlug=" + vendorSlug,
      {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "69420",
        },
      },
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const products = await response.json();
    console.log("Products fetched successfully:", products);
    return products; // Return the products array
  } catch (error) {
    console.error("Error fetching products:", error);
    return []; // Return an empty array in case of error
  }
};

export const postOrder = async (order) => {
  try {
    const response = await fetch("/apps/frontend/user/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
      },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      const errorData = await response.json(); // Assuming the server returns a JSON error
      throw new Error(errorData.error || "Network response was not ok");
    }

    return true;
  } catch (error) {
    console.error("Error posting order:", error);
    throw error;
  }
};

export const fetchOrders = async (vendorId) => {
  try {
    const response = await fetch(
      "/apps/frontend/user/orders?vendorId=" + vendorId,
      {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "69420",
        },
      },
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const orders = await response.json();
    console.log("Orders fetched successfully:", orders);
    return orders; // Return the products array
  } catch (error) {
    console.error("Error fetching orders:", error);
    return []; // Return an empty array in case of error
  }
};

export const getProfile = async (customerId) => {
  try {
    console.log(customerId);
    const response = await fetch(
      "/apps/frontend/user/profile?customerId=" + customerId,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
      },
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
    //const savedProfile = await response.json();
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null; // Return null in case of error
  }
};

export const getSettings = async () => {
  try {
    const response = await fetch("/apps/frontend/app/settings", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
      },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
    //const savedProfile = await response.json();
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null; // Return null in case of error
  }
};

export const saveProfile = async (profile) => {
  try {
    const response = await fetch("/apps/frontend/user/profile", {
      method: "POST",
      headers: {
        "ngrok-skip-browser-warning": "69420",
      },
      body: profile,
    });

    if (!response.ok) {
      const errorData = await response.json(); // Assuming the server returns a JSON error
      throw new Error(errorData.error || "Network response was not ok");
    }

    return true;
  } catch (error) {
    console.error("Error saving profile:", error);
    throw error; // Re-throw the error so that calling function can handle it
  }
};

/**
 * NOT JSON, since this needs to upload images
 * @param product
 * @returns {Promise<boolean>}
 */
export const createProduct = async (product) => {
  try {
    const response = await fetch("/apps/frontend/user/products", {
      method: "POST",
      headers: {
        "ngrok-skip-browser-warning": "69420",
      },
      body: product,
    });

    if (!response.ok) {
      const errorData = await response.json(); // Assuming the server returns a JSON error
      throw new Error(errorData.error || "Network response was not ok");
    }

    return true;
  } catch (error) {
    console.error("Error saving product:", error);
    throw error;
  }
};
