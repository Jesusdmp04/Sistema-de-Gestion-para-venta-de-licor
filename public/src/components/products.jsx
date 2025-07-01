import React, { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { getProducts } from "../api";
import Product from "./product";
import NewRecord from "./new-record";
import NewProduct from "./new-product";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [change, setChange] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const apiProducts = await getProducts();
      const localProducts = JSON.parse(sessionStorage.getItem('local_products')) || [];
      const all = [...apiProducts, ...localProducts];
      const unique = all.filter((p, i, arr) =>
        i === arr.findIndex(t => t.codigo_producto === p.codigo_producto)
      );
      const hidden = JSON.parse(sessionStorage.getItem('hidden_products')) || [];
      const visible = unique.filter(p => !hidden.includes(p.codigo_producto));
      setProducts(visible);
    };
    fetchProducts();
  }, [change]);

  const hideProduct = (code) => {
    const hidden = JSON.parse(sessionStorage.getItem('hidden_products')) || [];
    if (!hidden.includes(code)) {
      hidden.push(code);
      sessionStorage.setItem('hidden_products', JSON.stringify(hidden));
    }
    const local = JSON.parse(sessionStorage.getItem('local_products')) || [];
    sessionStorage.setItem(
      'local_products',
      JSON.stringify(local.filter(p => p.codigo_producto !== code))
    );
    setProducts(ps => ps.filter(p => p.codigo_producto !== code));
  };

  const moveProduct = (index, dir) => {
    const arr = [...products];
    const j = index + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[index], arr[j]] = [arr[j], arr[index]];
    setProducts(arr);
  };

  return (
    <Routes>
      <Route path="/" element={
        <>
          <div className="flex w-full relative px-4 justify-between md:justify-center items-center">
            <h2 className="text-xl lg:text-2xl font-semibold py-4">Productos</h2>
            <Link
              to="new-product"
              className="px-2 py-1 md:p-2 md:px-6 md:absolute md:right-0 md:mr-4 rounded-full bg-blue-500 text-white"
            >Agregar Producto</Link>
          </div>

          {products.length > 0 ? (
            <div className="flex-grow md:overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 p-4">
                {products.map((prod, idx) => (
                  <div
                    key={prod.codigo_producto}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="relative bg-white rounded-lg shadow-md p-4 pb-12 hover:shadow-lg transition-shadow"
                  >
                    <Product product={prod} onHide={() => hideProduct(prod.codigo_producto)} />
                    {hoveredIndex === idx && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                        <button
                          onClick={() => moveProduct(idx, -1)}
                          disabled={idx === 0}
                          className="bg-gray-200 hover:bg-gray-300 disabled:opacity-50 px-2 py-1 rounded"
                        >◀</button>
                        <button
                          onClick={() => moveProduct(idx, 1)}
                          disabled={idx === products.length - 1}
                          className="bg-gray-200 hover:bg-gray-300 disabled:opacity-50 px-2 py-1 rounded"
                        >▶</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-600 mt-10">No hay productos actualmente. Agrega uno nuevo.</p>
          )}
        </>
      } />
      <Route path=":code" element={<NewRecord />} />
      <Route path="new-product" element={<NewProduct handle={setChange} value={change} />} />
    </Routes>
  );
};

export default Products;
