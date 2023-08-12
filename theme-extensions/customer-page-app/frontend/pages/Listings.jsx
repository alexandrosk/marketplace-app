
const ListingsPage = ({products}) => {
    if (!products) {
        return null;
    }
    return (
        <div>
            <h2>Listings Page</h2>
            <ul>
                {products.length > 0 && products.map(product => (
                    <li key={product.id}>{product.title}</li>
                ))}
            </ul>
        </div>
    );
};

export default ListingsPage;
