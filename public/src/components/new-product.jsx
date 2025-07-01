import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Message from "../components/message";

const NewProduct = ({ handle, value }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    existencia: "",
    img: "",
    price: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendForm = (e) => {
    e.preventDefault();
    const codigo = formData.codigo.toUpperCase();

    // Revisar si ya existe un producto local con ese código
    const localProducts = JSON.parse(sessionStorage.getItem('local_products')) || [];
    const existe = localProducts.some(p => p.codigo_producto === codigo);
    if (existe) {
      alert("Ya existe un producto con ese código.");
      return;
    }

    // Eliminar código del array de productos ocultos si existe
    let hidden = JSON.parse(sessionStorage.getItem('hidden_products')) || [];
    if (hidden.includes(codigo)) {
      hidden = hidden.filter(c => c !== codigo);
      sessionStorage.setItem('hidden_products', JSON.stringify(hidden));
    }

    const product = {
      id: `local_${Date.now()}`,
      nombre: formData.nombre,
      codigo_producto: codigo,
      existencia: Number(formData.existencia),
      img: formData.img,
      precio: Number(formData.price),
      isLocal: true
    };

    localProducts.push(product);
    sessionStorage.setItem('local_products', JSON.stringify(localProducts));

    handle(!value);
    navigate("/dashboard/products");
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-blue-900 mb-4 text-center">
        Agregar Nuevo Producto
      </h1>
      <form onSubmit={sendForm} className="space-y-4">
        {[
          { label: "Nombre", name: "nombre", type: "text", placeholder: "Ingrese el nombre" },
          { label: "Código", name: "codigo", type: "text", placeholder: "Ingrese el código" },
          { label: "Existencia", name: "existencia", type: "number", placeholder: "Cantidad en stock" },
          { label: "Imagen (URL)", name: "img", type: "url", placeholder: "URL de la imagen" },
          { label: "Precio", name: "price", type: "number", placeholder: "Precio unitario" }
        ].map((field) => (
          <div key={field.name} className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">{field.label}</label>
            <input
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        ))}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition"
        >
          Crear Producto
        </button>
      </form>
    </div>
  );
};

export default NewProduct;
