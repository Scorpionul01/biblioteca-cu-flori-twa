import React, { useContext, useEffect } from 'react';
import { Container, Alert } from 'react-bootstrap';
import { useNavigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminPage = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Verifică dacă utilizatorul este admin
  useEffect(() => {
    if (!user || !isAdmin()) {
      navigate('/login');
    }
  }, [user, isAdmin, navigate]);
  
  if (!user) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          Trebuie să fiți autentificat pentru a accesa panoul de administrare.
        </Alert>
      </Container>
    );
  }
  
  if (!isAdmin()) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          Nu aveți permisiunea de a accesa panoul de administrare.
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <Outlet />
    </Container>
  );
};

export default AdminPage;