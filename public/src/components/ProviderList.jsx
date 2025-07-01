import React, { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getProviders, createProvider, deleteProvider } from "../api/providerService";

const ProviderList = () => {
  const [providers, setProviders] = useState([]);
  const [newProvider, setNewProvider] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const data = await getProviders();
      setProviders(
        data.map((provider) => ({
          id: provider.id,
          name: provider.nombre?.trim() || "Sin nombre",
          email: provider.email || "Correo inválido",
          phone: provider.telefono?.trim() || "Sin teléfono",
        }))
      );
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newProvider.name || !newProvider.phone) {
      alert("Por favor, ingresa un nombre y un teléfono.");
      return;
    }
    try {
      await createProvider(newProvider);
      setNewProvider({ name: "", email: "", phone: "" });
      fetchProviders();
    } catch (error) {
      console.error("Error al crear proveedor:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProvider(id);
      fetchProviders();
    } catch (error) {
      console.error("Error al eliminar proveedor:", error);
    }
  };

  const exportPdf = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("proveedores.pdf");
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {/* Título */}
      <h1 className="text-2xl font-bold text-blue-900 mb-6 text-center">Proveedores</h1>

      {/* Botones PDF */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setPreviewMode(true)}
          className="bg-blue-600 text-white font-medium px-5 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Vista Previa PDF
        </button>
        {previewMode && (
          <button
            onClick={exportPdf}
            className="bg-green-600 text-white font-medium px-5 py-2 rounded-md hover:bg-green-700 transition"
          >
            Generar PDF
          </button>
        )}
      </div>

      {/* Formulario de nuevo proveedor */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Nombre"
          value={newProvider.name}
          onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
          className="border border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          placeholder="Correo Electrónico"
          value={newProvider.email}
          onChange={(e) => setNewProvider({ ...newProvider, email: e.target.value })}
          className="border border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Teléfono"
          value={newProvider.phone}
          onChange={(e) => setNewProvider({ ...newProvider, phone: e.target.value })}
          className="border border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleCreate}
          className="bg-green-600 text-white font-medium px-5 py-2 rounded-md hover:bg-green-700 transition"
        >
          Agregar Proveedor
        </button>
      </div>

      {/* Tabla de proveedores normal */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {['Nombre','Correo Electrónico','Teléfono'].map((col, i) => (
                <th
                  key={i}
                  className="px-4 py-2 border-b-2 border-gray-800 text-left text-sm font-semibold text-gray-700"
                >
                  {col}
                </th>
              ))}
              <th className="px-4 py-2 border-b-2 border-gray-800 text-left text-sm font-semibold text-gray-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  Cargando proveedores...
                </td>
              </tr>
            ) : (
              providers.map((provider) => (
                <tr key={provider.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b border-gray-300 text-sm text-gray-800">{provider.name}</td>
                  <td className="px-4 py-2 border-b border-gray-300 text-sm text-gray-800">{provider.email}</td>
                  <td className="px-4 py-2 border-b border-gray-300 text-sm text-gray-800">{provider.phone}</td>
                  <td className="px-4 py-2 border-b border-gray-300 text-sm text-gray-800">
                    <button
                      onClick={() => handleDelete(provider.id)}
                      className="bg-red-500 text-white font-medium px-3 py-1 rounded-md hover:bg-red-600 transition"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Preview sin Acciones */}
      {previewMode && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start p-8 z-50 overflow-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full">
            <div ref={reportRef} className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    {['Nombre','Correo Electrónico','Teléfono'].map((col, i) => (
                      <th
                        key={i}
                        className="px-4 py-2 border-b-2 border-gray-800 text-left text-sm font-semibold text-gray-700"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {providers.map((provider) => (
                    <tr key={provider.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border-b border-gray-300 text-sm text-gray-800">{provider.name}</td>
                      <td className="px-4 py-2 border-b border-gray-300 text-sm text-gray-800">{provider.email}</td>
                      <td className="px-4 py-2 border-b border-gray-300 text-sm text-gray-800">{provider.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setPreviewMode(false)}
                className="bg-gray-600 text-white font-medium px-5 py-2 rounded-md hover:bg-gray-700 transition"
              >
                Cerrar Vista
              </button>
              <button
                onClick={exportPdf}
                className="bg-green-600 text-white font-medium px-5 py-2 rounded-md hover:bg-green-700 transition"
              >
                Generar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderList;
