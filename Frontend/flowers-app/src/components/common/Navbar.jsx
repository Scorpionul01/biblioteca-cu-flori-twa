import React, { useContext } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <BootstrapNavbar variant="dark" expand="lg" className="navbar-custom mb-4">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <i className="fas fa-seedling me-2 text-light"></i>
          Biblioteca de Flori
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="nav-link"><i className="fas fa-home me-1"></i> Acasă</Nav.Link>
            <Nav.Link as={Link} to="/flowers" className="nav-link"><i className="fas fa-spa me-1"></i> Toate Florile</Nav.Link>
            <Nav.Link as={Link} to="/bouquet" className="nav-link"><i className="fas fa-magic me-1"></i> Compune Buchet</Nav.Link>
            
            {user && isAdmin() && (
              <Nav.Link as={Link} to="/admin" className="nav-link"><i className="fas fa-user-cog me-1"></i> Administrare</Nav.Link>
            )}
          </Nav>
          
          <Nav>
            {user ? (
              <>
                <Nav.Item className="d-flex align-items-center me-3">
                  <span className="text-light"><i className="fas fa-user-circle me-2"></i>Bun venit, {user.username}</span>
                </Nav.Item>
                <Button variant="outline-light" className="btn-custom-outline" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-1"></i> Deconectare
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="nav-link"><i className="fas fa-sign-in-alt me-1"></i> Autentificare</Nav.Link>
                <Nav.Link as={Link} to="/register" className="nav-link"><i className="fas fa-user-plus me-1"></i> Înregistrare</Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;