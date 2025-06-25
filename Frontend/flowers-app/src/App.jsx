import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/custom.css';
import './styles/flower-badges.css';
import './styles/bootstrap-overrides.css';
import './styles/direct-overrides.css';
import './styles/search-bar-fixes.css'; // Stiluri pentru bara de căutare
import './styles/image-badge-fix.css';
import './styles/icon-fix.css'; // Rezolvă problema iconiței cu fundal alb

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/common/Navbar';
import AdminPanel from './components/admin/AdminPanel';
import FlowersManagement from './components/admin/FlowersManagement';
import MeaningsManagement from './components/admin/MeaningsManagement';
import Statistics from './components/admin/Statistics';
import FlowerForm from './components/flowers/FlowerForm';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FlowersPage from './pages/FlowersPage';
import FlowerDetailsPage from './pages/FlowerDetailsPage';
import FlowerSearchPage from './pages/FlowerSearchPage';
import AdminPage from './pages/AdminPage';
import BouquetPage from './pages/BouquetPage';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="py-5">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/flowers" element={<FlowersPage />} />
            <Route path="/flowers/:id" element={<FlowerDetailsPage />} />
            <Route path="/flowers/search" element={<FlowerSearchPage />} />
            <Route path="/bouquet" element={<BouquetPage />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminPage />}>
              <Route index element={<AdminPanel />} />
              <Route path="flowers" element={<FlowersManagement />} />
              <Route path="flowers/add" element={<FlowerForm />} />
              <Route path="flowers/edit/:id" element={<FlowerForm />} />
              <Route path="meanings" element={<MeaningsManagement />} />
              <Route path="statistics" element={<Statistics />} />
            </Route>
          </Routes>
        </main>
        <footer className="footer-custom">
          <Container>
            <div className="row">
              <div className="col-md-4 mb-4">
                <h3 className="footer-title">Biblioteca de Flori</h3>
                <p>Descoperă lumea florilor și semnificațiile lor speciale.</p>
                <div className="mt-3">
                  <a href="#" className="me-3"><i className="fab fa-facebook-f text-light"></i></a>
                  <a href="#" className="me-3"><i className="fab fa-instagram text-light"></i></a>
                  <a href="#" className="me-3"><i className="fab fa-pinterest text-light"></i></a>
                </div>
              </div>
              <div className="col-md-4 mb-4">
                <h3 className="footer-title">Linkuri Rapide</h3>
                <div>
                  <a href="/" className="footer-link">Acasă</a>
                  <a href="/flowers" className="footer-link">Toate Florile</a>
                  <a href="/bouquet" className="footer-link">Compune Buchet</a>
                  <a href="/login" className="footer-link">Autentificare</a>
                </div>
              </div>
              <div className="col-md-4 mb-4">
                <h3 className="footer-title">Contact</h3>
                <p><i className="fas fa-envelope me-2"></i> contact@bibliotecaflori.ro</p>
                <p><i className="fas fa-phone me-2"></i> +40 123 456 789</p>
                <p><i className="fas fa-map-marker-alt me-2"></i> Strada Florilor 123, București</p>
              </div>
            </div>
            <div className="footer-bottom">
              <p className="mb-0"><i className="far fa-copyright me-1"></i> 2023 Biblioteca de Flori. Toate drepturile rezervate.</p>
            </div>
          </Container>
        </footer>
      </Router>
    </AuthProvider>
  );
};

export default App;