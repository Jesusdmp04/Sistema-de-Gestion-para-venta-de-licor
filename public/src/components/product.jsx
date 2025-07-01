import React, { useState, useRef, useLayoutEffect } from "react";
import { Link } from "react-router-dom";

// Keyframes para la animación marquee
const marqueeStyles = `
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-200%); }
}
`;

const Product = ({ product, onHide }) => {
  const { codigo_producto, nombre, existencia, precio, img } = product;
  const [stock] = useState(existencia);
  const [hoveredArticle, setHoveredArticle] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(false);
  const [duration, setDuration] = useState(30);
  const spanRef = useRef(null);
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    if (spanRef.current && containerRef.current) {
      const width = spanRef.current.offsetWidth;
      const speed = 30; // px/s
      setDuration(width / speed);
    }
  }, [nombre]);

  const animate = hoveredArticle && !hoveredButton;
  const marqueeContent = `${nombre}\u00A0\u00A0${nombre}`;

  const handleDelete = () => {
    // Solo se oculta visualmente, la lógica está en el padre (products.jsx)
    onHide();
  };

  return (
    <article
      ref={containerRef}
      onMouseEnter={() => setHoveredArticle(true)}
      onMouseLeave={() => setHoveredArticle(false)}
      className={`flex flex-col bg-white rounded-lg shadow-md overflow-hidden border transition-opacity duration-300 hover:shadow-lg ${
        stock > 0 ? "opacity-100" : "opacity-50"
      }`}
    >
      <style>{marqueeStyles}</style>

      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors duration-200 z-10"
      >
        ×
      </button>

      <div className="h-40 md:h-48 w-full bg-gray-100">
        <img src={img} alt={nombre} className="w-full h-full object-cover" />
      </div>

      <div className="flex flex-col flex-grow p-4">
        <div className="overflow-hidden whitespace-nowrap mb-2 h-6 relative">
          <span
            ref={spanRef}
            className="absolute text-lg font-semibold whitespace-nowrap text-black"
            style={{
              animation: animate ? `marquee ${duration}s linear infinite` : "none"
            }}
          >
            {marqueeContent}
          </span>
        </div>

        <div className="text-sm mb-4">
          <p className="font-medium text-blue-700 mb-1">Precio por unidad</p>
          <p className="text-black font-bold">{precio}$</p>
        </div>

        <div className="text-sm mb-4">
          <p className="font-medium text-gray-700 mb-1">En Stock</p>
          {stock <= 10 ? (
            <div className="flex items-center text-red-600 font-medium">
              <span className="mr-1">{stock}</span>
              <span className="mr-1">↓</span>
              <span>Stock bajo</span>
            </div>
          ) : (
            <span className="text-gray-800 font-medium">{stock}</span>
          )}
        </div>

        <div className="flex-grow" />

        <Link
          to={`${codigo_producto}`}
          state={{ product }}
          onMouseEnter={() => setHoveredButton(true)}
          onMouseLeave={() => setHoveredButton(false)}
          className="mt-auto bg-green-500 text-white text-center py-2 rounded-lg hover:bg-green-600 transition"
        >
          Vender
        </Link>
      </div>
    </article>
  );
};

export default Product;
