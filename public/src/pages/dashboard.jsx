import { Routes, Route, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Products from "../components/products";
import SalesHistory from "../components/sales-history";
import ProviderList from "../components/ProviderList";

const NAV_ITEMS = [
  { key: 'products', label: 'Productos', emoji: '🛒', path: 'products' },
  { key: 'sales', label: 'Historial', emoji: '🕒', path: 'sales-history' },
  { key: 'providers', label: 'Proveedores', emoji: '🚚', path: 'provider' },
];

const THEMES = [
  { name: 'Original', mainBg: 'bg-gradient-to-br from-blue-50 to-blue-100', headerBg: 'bg-white/90 backdrop-blur-sm', headerText: 'text-blue-900', navText: 'text-blue-800', navHoverText: 'hover:text-blue-600' },
  { name: 'Púrpura', mainBg: 'bg-gradient-to-br from-purple-100 to-purple-200', headerBg: 'bg-purple-600', headerText: 'text-white', navText: 'text-purple-200', navHoverText: 'hover:text-white' },
  { name: 'Verde', mainBg: 'bg-gradient-to-br from-green-100 to-green-200', headerBg: 'bg-green-600', headerText: 'text-white', navText: 'text-green-200', navHoverText: 'hover:text-white' },
  { name: 'Rojo', mainBg: 'bg-gradient-to-br from-red-100 to-red-200', headerBg: 'bg-red-600', headerText: 'text-white', navText: 'text-red-200', navHoverText: 'hover:text-white' },
  { name: 'Rosa', mainBg: 'bg-gradient-to-br from-pink-100 to-pink-200', headerBg: 'bg-pink-500', headerText: 'text-white', navText: 'text-pink-200', navHoverText: 'hover:text-white' },
  { name: 'Azul', mainBg: 'bg-gradient-to-br from-blue-100 to-blue-200', headerBg: 'bg-blue-600', headerText: 'text-white', navText: 'text-blue-200', navHoverText: 'hover:text-white' },
  { name: 'Naranja', mainBg: 'bg-gradient-to-br from-orange-100 to-orange-200', headerBg: 'bg-orange-500', headerText: 'text-white', navText: 'text-orange-200', navHoverText: 'hover:text-white' },
  { name: 'Amarillo', mainBg: 'bg-gradient-to-br from-yellow-100 to-yellow-200', headerBg: 'bg-yellow-500', headerText: 'text-white', navText: 'text-yellow-200', navHoverText: 'hover:text-white' },
  { name: 'Oscuro', mainBg: 'bg-gradient-to-br from-gray-600 to-gray-800', headerBg: 'bg-gray-900', headerText: 'text-white', navText: 'text-gray-300', navHoverText: 'hover:text-white' }
];

const Dashboard = ({ isLogin }) => {
  const [navItems, setNavItems] = useState(NAV_ITEMS);
  const [theme, setTheme] = useState(() => {
    const saved = sessionStorage.getItem("theme");
    return saved ? JSON.parse(saved) : THEMES[0];
  });
  const [showThemePicker, setShowThemePicker] = useState(false);
  const user = JSON.parse(sessionStorage.getItem("user"));
  const navigate = useNavigate();
  const pickerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowThemePicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pickerRef]);

  useEffect(() => {
    if (!isLogin) navigate("/login");
  }, [isLogin, navigate]);

  const swapItems = (index, direction) => {
    const newItems = [...navItems];
    const target = index + direction;
    if (target < 0 || target >= newItems.length) return;
    [newItems[index], newItems[target]] = [newItems[target], newItems[index]];
    setNavItems(newItems);
  };

  const applyTheme = (selectedTheme) => {
    setTheme(selectedTheme);
    sessionStorage.setItem("theme", JSON.stringify(selectedTheme));
    setShowThemePicker(false);
  };

  const handleLogout = () => {
    const count = parseInt(sessionStorage.getItem("logout_count") || "0", 10) + 1;
    sessionStorage.setItem("logout_count", count);

    if (count >= 4) {
      sessionStorage.removeItem("local_sales_history");
      sessionStorage.removeItem("hidden_products");
      sessionStorage.removeItem("product_order");
      sessionStorage.removeItem("theme");
      sessionStorage.setItem("logout_count", "0");
    }

    navigate("/login");
  };

  return (
    isLogin && (
      <div className={`flex flex-col min-h-screen ${theme.mainBg} transition-colors duration-300`}>
        <header className={`fixed top-0 left-0 right-0 ${theme.headerBg} shadow-md z-50 transition-colors duration-300`}>
          <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
            <div className={`${theme.headerText} font-bold text-2xl transition-colors duration-300`}>
              Bienvenido, {user.nombre}
            </div>
            <nav className="flex items-center space-x-4">
              {navItems.map((item, idx) => (
                <div key={item.key} className="relative group">
                  <Link
                    to={item.path}
                    className={`flex items-center ${theme.navText} ${theme.navHoverText} transform hover:scale-110 transition-all duration-200 px-3 py-2 rounded-md font-medium`}
                  >
                    <span className="mr-2 text-2xl">{item.emoji}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => swapItems(idx, -1)} className="bg-white p-1 rounded-full shadow hover:bg-gray-100 text-gray-700">◀</button>
                    <button onClick={() => swapItems(idx, 1)} className="bg-white p-1 rounded-full shadow hover:bg-gray-100 text-gray-700">▶</button>
                  </div>
                </div>
              ))}

              <div className="relative" ref={pickerRef}>
                <button
                  onClick={() => setShowThemePicker(!showThemePicker)}
                  className={`flex items-center ${theme.navText} ${theme.navHoverText} transform hover:scale-110 transition-all duration-200 px-3 py-2 rounded-md font-medium`}
                >
                  <span className="mr-2 text-2xl">🎨</span>
                  <span className="font-medium">Tema</span>
                </button>
                {showThemePicker && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border rounded-lg shadow-xl z-50 p-2">
                    {THEMES.map(t => (
                      <button
                        key={t.name}
                        onClick={() => applyTheme(t)}
                        className="w-full text-left px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <span className={`w-4 h-4 rounded-full mr-3 ${t.headerBg}`}></span>
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className={`ml-4 flex items-center bg-transparent ${theme.navText} px-3 py-2 rounded-md font-medium hover:bg-red-600 hover:text-white transition-all duration-200`}
              >
                <span className="mr-2 text-2xl">🚪</span>
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </nav>
          </div>
        </header>

        <main className="flex-grow pt-20 pb-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto h-full">
            <Routes>
              <Route path="products/*" element={<Products />} />
              <Route path="sales-history/*" element={<SalesHistory />} />
              <Route path="provider/*" element={<ProviderList />} />
            </Routes>
          </div>
        </main>
      </div>
    )
  );
};

export default Dashboard;
