import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import DocumentIssuance from './pages/DocumentIssuance';
import { Revenue } from './pages/Revenue';
import { Login } from './pages/Login';

// Import the Language Provider
import { LanguageProvider } from './context/LanguageContext';

function InnerApp() {
  const location = useLocation();
  // Ensure the check is robust (handles trailing slashes if any)
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation only shows if NOT on login page */}
      {!isLoginPage && <Header />}

      <div className="flex flex-1">
        {!isLoginPage && <Sidebar />}

        <main className={`flex-1 ${!isLoginPage ? 'pt-20 ml-20' : ''} min-h-screen transition-all duration-300`}>
          <div className="p-4 md:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/documents" element={<DocumentIssuance />} />
              <Route path="/analytics" element={<Navigate replace to="/revenue" />} />
              <Route path="/revenue" element={<Revenue />} />
              <Route path="/login" element={<Login />} />
              {/* Fallback route to redirect or show 404 */}
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        {/* InnerApp MUST be inside BrowserRouter to use useLocation(), 
          but it doesn't need to be wrapped in a dummy <Routes> tag.
        */}
        <InnerApp />
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;