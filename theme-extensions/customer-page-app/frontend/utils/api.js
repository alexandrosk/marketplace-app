export const fetchProductsFromProxy = async () => {
    try {
        const response = await fetch('/apps/frontend');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const products = await response.json();
        console.log('Products fetched successfully:', products);
        return products; // Return the products array
    } catch (error) {
        console.error('Error fetching products:', error);
        return []; // Return an empty array in case of error
    }
};
