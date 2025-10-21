import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import axios from './AxiosInstance';

const Products = () => {

    const [products, setProducts] = useState(null);

    const [showSuccess, setShowSuccess] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    useEffect(() => {
        axios.get('/heimdall/api/products')
          .then(response => {
            setProducts(response.data);
            // console.log(response.data);
          })
          .catch(error => {
            console.error('Error fetching data:', error);
          });
      }, []);

    const handleDelete = async (productId) => {
        setShowModal(false);

        try {
            // Make the DELETE request to Flask, including site ID
            await axios.delete('/heimdall/api/products/deleteproduct', {
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
          console.error('Cannot delete - Live service using this product', err);
          alert('Cannot delete - Live service using this product');
        }
      };

    return ( 
        <div className="min-h-screen bg-base-100 p-4">
            <div className="card w-full shadow-2xl bg-base-200 p-6">
                    <div className="flex justify-end max-w mb-5">
                        <Link to='/products/addproduct' className="btn btn-accent">
                            <Plus size={18} /> Add New Product
                        </Link>
                    </div>
                    <table className="table table-full text-sm">
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
                                        <details className="dropdown dropdown-right dropdown-end">
                                        <summary className="m-1 btn ">...</summary>
                                        <ul className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
                                            <li><Link to={'/products/editproduct/' + product.id}>Edit</Link></li>
                                            <li><button onClick={() => { setShowModal(true); setProductToDelete(product.id) }}>Delete</button></li>
                                        </ul>
                                        </details>
                                    </td>    
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold mb-4">Are you sure?</h3>
                        <div className="flex justify-end gap-4">
                        <button
                            onClick={() => setShowModal(false)}
                            className="btn btn-accent"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleDelete(productToDelete)}
                            className="btn btn-warning"
                        >
                            Yes, delete it
                        </button>
                        </div>
                    </div>
                    </div>
                )}
                {showSuccess && (
                    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 border border-green-300 rounded px-6 py-3 shadow-lg z-50">
                    ✅ Product deleted successfully!
                    </div>
                )}
            </div>
        </div>
     );
}
 
export default Products;