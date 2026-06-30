import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginRegister from './pages/LoginRegister';
import Dashboard from './pages/Dashboard';
import ReportItem from './pages/ReportItem';
import MyClaims from './pages/MyClaims';
import AdminDashboard from './pages/AdminDashboard';
import AboutApp from './pages/AboutApp';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flexGrow: 1, flexShrink: 0 }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginRegister />} />
                <Route path="/about" element={<AboutApp />} />

                {/* Protected Student Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/report"
                  element={
                    <ProtectedRoute>
                      <ReportItem />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/claims"
                  element={
                    <ProtectedRoute>
                      <MyClaims />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin-Only Route */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Wildcard Catchall redirects to Dashboard */}
                <Route path="*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
