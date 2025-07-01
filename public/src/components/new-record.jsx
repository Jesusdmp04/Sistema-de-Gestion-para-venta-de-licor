import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductByCode, newRecord, addStock } from "../api";

const NewRecord = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [cantidad, setCantidad] = useState("");
  const [cantidadStock, setCantidadStock] = useState("");
  const [loading, setLoading] = useState(true);

  // Actualiza el stock local en sessionStorage
  const updateLocalStock = (codigo_producto, newStock) => {
    const localProducts = JSON.parse(sessionStorage.getItem("local_products")) || [];
    const index = localProducts.findIndex(p => p.codigo_producto === codigo_producto);
    if (index !== -1) {
      localProducts[index].existencia = newStock;
      sessionStorage.setItem("local_products", JSON.stringify(localProducts));
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const localProducts = JSON.parse(sessionStorage.getItem("local_products")) || [];
      let found = localProducts.find(p => p.codigo_producto === code);
      if (found) {
        setProduct(found);
      } else {
        const prodFromApi = await getProductByCode(code);
        if (prodFromApi) setProduct(prodFromApi);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [code]);

  const handleCantidadChange = (e) => {
    setCantidad(e.target.value);
  };

  const handleCantidadStockChange = (e) => {
    setCantidadStock(e.target.value);
  };

  const processSale = async (e) => {
    e.preventDefault();
    const cantNum = Number(cantidad);
    if (!cantNum || cantNum <= 0) {
      alert("⚠️ La cantidad de venta debe ser mayor a 0.");
      return;
    }
    if (cantNum > product.existencia) {
      alert("❌ No hay suficiente stock disponible.");
      return;
    }

    if (product.isLocal) {
      const newStock = product.existencia - cantNum;

      const localSales = JSON.parse(sessionStorage.getItem("local_sales_history")) || [];
      localSales.push({
        id: `sale_${Date.now()}`,
        fecha_venta: new Date().toISOString(),
        nombre_producto: product.nombre,
        cantidad: cantNum,
        precio_unitario: product.precio,
        total: cantNum * product.precio,
        nombre_usuario: JSON.parse(sessionStorage.getItem("user"))?.nombre || "Vendedor Local",
      });
      sessionStorage.setItem("local_sales_history", JSON.stringify(localSales));

      updateLocalStock(product.codigo_producto, newStock);
      setProduct(prev => ({ ...prev, existencia: newStock }));
      setCantidad(""); // limpiar input

      alert("✅ Venta procesada con éxito.");
    } else {
      const record = {
        fecha_venta: new Date().toISOString().split("T")[0],
        producto_id: Number(product.id),
        cantidad: cantNum,
        precio_unitario: Number(product.precio),
        user_id: JSON.parse(sessionStorage.getItem("user")).id,
      };
      await newRecord(record);
      alert("✅ Venta procesada con éxito.");
      window.location.reload();
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    const cantStockNum = Number(cantidadStock);
    if (!cantStockNum || cantStockNum <= 0) {
      alert("⚠️ La cantidad de stock a agregar debe ser mayor a 0.");
      return;
    }

    if (product.isLocal) {
      const newStock = product.existencia + cantStockNum;
      updateLocalStock(product.codigo_producto, newStock);
      setProduct(prev => ({ ...prev, existencia: newStock }));
      setCantidadStock(""); // limpiar input

      alert("📦 Stock agregado con éxito.");
    } else {
      await addStock(product.codigo_producto, cantStockNum);
      alert("📦 Stock agregado con éxito.");
      window.location.reload();
    }
  };

  if (loading) return <div className="text-center mt-10">Cargando producto...</div>;
  if (!product) return <div className="text-center mt-10">Producto no encontrado</div>;

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-blue-900 mb-4 text-center">{product.nombre}</h1>
      
      {product.img && (
        <div className="flex justify-center mb-4">
          <img
            src={product.img}
            alt={product.nombre}
            className="max-h-48 object-contain rounded"
          />
        </div>
      )}

      {/* --- MODIFICACIÓN: Estilo de texto uniforme --- */}
      <div className="text-center mb-6 space-y-1">
        <p className="text-gray-700">
          <span className="font-semibold">Código:</span> {product.codigo_producto}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold">Precio:</span> ${product.precio}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold">Stock actual:</span> {product.existencia}
        </p>
      </div>

      <form onSubmit={processSale} className="mt-4">
        <label className="block mb-2 font-medium text-gray-700">Cantidad a vender</label>
        <input
          type="number"
          min="1"
          value={cantidad}
          onChange={handleCantidadChange}
          placeholder="Ingrese la cantidad"
          className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          Procesar Venta
        </button>
      </form>

      <form onSubmit={handleAddStock} className="mt-6">
        <label className="block mb-2 font-medium text-gray-700">Cantidad a agregar al stock</label>
        <input
          type="number"
          min="1"
          value={cantidadStock}
          onChange={handleCantidadStockChange}
          placeholder="Ingrese la cantidad"
          className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Agregar Stock
        </button>
      </form>
    </div>
  );
};

export default NewRecord;