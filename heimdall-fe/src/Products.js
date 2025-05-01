import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Products = () => {

    const [products, setProducts] = useState(null);

    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        axios.get('/products')
          .then(response => {
            setProducts(response.data);
            // console.log(response.data);
          })
          .catch(error => {
            console.error('Error fetching data:', error);
          });
      }, []);

    const handleDelete = async (productId) => {

        try {
            // Make the DELETE request to Flask, including site ID
            await axios.delete('/products/deleteproduct', {
            data: { id: productId }, // sending ?id=123
      });
          // Show success message
          setShowSuccess(true);

          // Remove the deleted site from the list without reloading
          setProducts((prevProducts) => prevProducts.filter(product => product.id !== productId));

          // Wait 1.5 seconds before reloading
          setTimeout(() => {
          setShowSuccess(false);
          }, 1500);
        } catch (err) {
          console.error('Could not delete product', err);
          alert('Could not delete product.');
        }
      };

    return ( 
        <div className="h-screen flex items-center justify-center">
            {/* <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-200"> */}
                {/* <div className="card-body"></div> */}
                    {/* <div className="flex font-sans"> */}
                        <div className="overflow-x-auto">
                            <div className="flex justify-end max-w mb-5">
                                <Link to='/products/addproduct' className="btn btn-accent">Add New Product</Link>
                            </div>
                            <table className="table table-lg">
                            {/* <table className="flex-auto table-auto border-collapse my-10"> */}
                                <thead>
                                    <tr>
                                        <th>Name</th> 
                                        <th>Selling Price</th> 
                                        <th>Cost Price</th> 
                                        <th>More Actions</th>
                                    </tr>
                                </thead> 
                                <tbody>
                                    {products && products.map((product) => (
                                        <tr key={product.id}>
                                            <td>{product.name}</td>
                                            <td>{product.selling_price}</td>
                                            <td>{product.cost_price}</td>
                                            <td>
                                                <details className="dropdown dropdown-left dropdown-end">
                                                <summary className="m-1 btn ">...</summary>
                                                <ul className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
                                                    <li><Link to={'/products/editproduct/' + product.id}>Edit</Link></li>
                                                    <li><button onClick={() => handleDelete(product.id)}>Delete</button></li>
                                                </ul>
                                                </details>
                                            </td>    
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {showSuccess && (
                                <div style={{
                                padding: '10px',
                                marginTop: '10px',
                                backgroundColor: '#d4edda',
                                color: '#155724',
                                border: '1px solid #c3e6cb',
                                borderRadius: '5px'
                                }}>
                                ✅ Site deleted successfully!
                                </div>
                            )}
                        </div>
                    {/* </div> */}
                {/* </div> */}
            {/* </div> */}
        </div> 
     );
}
 
export default Products;