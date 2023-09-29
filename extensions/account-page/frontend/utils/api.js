export const fetchProductsFromProxy = async () => {
    try {
        const response = await fetch('/apps/frontend/user/products',
            {
                method: 'GET',
            });
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

export const getProfile = async (customerId) => {
    try {
        console.log(customerId);
        const response = await fetch('/apps/frontend/user/profile?customerId='+customerId,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
        //const savedProfile = await response.json();
    } catch (error) {
        console.error('Error fetching profile:', error);
        return null; // Return null in case of error
    }
}


export const saveProfile = async (profile) => {
    try {
        const response = await fetch('/apps/frontend/user/profile',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profile),
            });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        //const savedProfile = await response.json();
        return true;
    } catch (error) {
        console.error('Error saving profile:', error);
        return null; // Return null in case of error
    }
}
