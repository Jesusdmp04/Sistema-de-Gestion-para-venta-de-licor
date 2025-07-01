import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getAllRecords } from "../api";

const SalesHistory = () => {
  const [records, setRecords] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchAll = async () => {
      // Obtener registros de la API y forzar su fecha de venta a la fecha actual
      const apiData = await getAllRecords();
      const today = new Date().toISOString().split('T')[0];
      const normalizedApi = apiData.map(record => ({
        ...record,
        fecha_venta: today
      }));

      // Obtener registros locales
      const local = JSON.parse(sessionStorage.getItem('local_sales_history')) || [];

      setRecords([...normalizedApi, ...local]);
    };
    fetchAll();
  }, []);

  // Filtrar por rango usando solo la parte YYYY-MM-DD
  const filteredRecords = records.filter(item => {
    const recordDate = new Date(item.fecha_venta);
    if (startDate && recordDate < new Date(startDate)) return false;
    if (endDate) {
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      if (recordDate > e) return false;
    }
    return true;
  });

  // Formatear DD/MM/YYYY
  const formatDate = ds => {
    const [y, m, d] = ds.split('T')[0].split('-');
    return `${d.padStart(2,'0')}/${m.padStart(2,'0')}/${y}`;
  };

  const exportPdf = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const w = pdf.internal.pageSize.getWidth();
    const prop = pdf.getImageProperties(img);
    const h = (prop.height * w) / prop.width;
    pdf.addImage(img, "PNG", 0, 0, w, h);
    pdf.save("historial-ventas.pdf");
  };

  return (
    <div className="flex flex-col gap-6 bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold text-blue-900 text-center">Historial de Ventas</h1>

      <div className="flex justify-center gap-4 mb-4">
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>

      <div className="flex justify-center space-x-4 mb-4">
        <button
          onClick={() => setPreviewMode(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Vista Previa PDF
        </button>
        {previewMode && (
          <button
            onClick={exportPdf}
            className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition"
          >
            Descargar PDF
          </button>
        )}
      </div>

      <div ref={reportRef} className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {['Vendedor','Fecha de venta','Producto','Cantidad','Precio','Total'].map((c,i)=>(
                <th
                  key={i}
                  className="px-4 py-2 border-b-2 border-gray-800 text-left text-sm font-semibold text-gray-700"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length > 0 ? (
              [...filteredRecords].reverse().map((item,idx)=>(
                <tr key={item.id||idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b border-gray-300 text-sm text-gray-800">{item.nombre_usuario}</td>
                  <td className="px-4 py-2 border-b border-gray-300 text-sm text-gray-800">{formatDate(item.fecha_venta)}</td>
                  <td className="px-4 py-2 border-b border-gray-300 text-sm text-gray-800">{item.nombre_producto}</td>
                  <td className="px-4 py-2 border-b border-gray-300 text-sm text-gray-800">{item.cantidad}</td>
                  <td className="px-4 py-2 border-b border-gray-300 text-sm text-gray-800">{item.precio_unitario}$</td>
                  <td className="px-4 py-2 border-b border-gray-300 text-sm text-gray-800">{item.total}$</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">No hay ventas en ese rango de fechas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {previewMode && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start p-8 z-50 overflow-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    {['Vendedor','Fecha de venta','Producto','Cantidad','Precio','Total'].map((c,i)=>(
                      <th
                        key={i}
                        className="px-4 py-2 border-b-2 border-gray-800 text-left text-sm font-semibold text-gray-700"
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length > 0 ? (
                    [...filteredRecords].reverse().map((item,idx)=>(
                      <tr key={item.id||idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b border-gray-300 text-sm text-gray-800">{item.nombre_usuario}</td>
                        <td className="px-4 py-2 border-b border-gray-300 text-sm text-gray-800">{formatDate(item.fecha_venta)}</td>
                        <td className="px-4 py-2 border-b border-gray-300 text-sm text-gray-800">{item.nombre_producto}</td>
                        <td className="px-4 py-2 border-b border-gray-300 text-sm text-gray-800">{item.cantidad}</td>
                        <td className="px-4 py-2 border-b border-gray-300 text-sm text-gray-800">{item.precio_unitario}$</td>
                        <td className="px-4 py-2 border-b border-gray-300 text-sm text-gray-800">{item.total}$</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-gray-500">No hay ventas en ese rango de fechas.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button onClick={()=>setPreviewMode(false)} className="bg-gray-600 text-white px-5 py-2 rounded-md hover:bg-gray-700 transition">Cerrar Vista</button>
              <button onClick={exportPdf} className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition">Generar PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;
