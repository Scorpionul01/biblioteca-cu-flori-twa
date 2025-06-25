import React, { useState, useEffect } from 'react';
import { Table, Button, Alert, Spinner, Badge, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import flowerService from '../../services/flowerService';

const FlowersManagement = () => {
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [flowerToDelete, setFlowerToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  useEffect(() => {
    fetchFlowers();
  }, []);
  
  const fetchFlowers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const flowersData = await flowerService.getAllFlowers();
      setFlowers(flowersData);
    } catch (err) {
      setError('Eroare la încărcarea florilor. Vă rugăm încercați din nou.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleShowDeleteModal = (flower) => {
    setFlowerToDelete(flower);
    setShowDeleteModal(true);
  };
  
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setFlowerToDelete(null);
  };
  
  const handleDeleteFlower = async () => {
    if (!flowerToDelete) return;
    
    try {
      setDeleting(true);
      
      await flowerService.deleteFlower(flowerToDelete.id);
      
      // Actualizare listă după ștergere
      setFlowers(flowers.filter(flower => flower.id !== flowerToDelete.id));
      
      handleCloseDeleteModal();
    } catch (err) {
      setError('Eroare la ștergerea florii. Vă rugăm încercați din nou.');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Se încarcă...</span>
        </Spinner>
      </div>
    );
  }
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Administrare flori</h2>
        <Button as={Link} to="/admin/flowers/add" variant="success">
          Adaugă floare nouă
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {flowers.length === 0 ? (
        <Alert variant="info">
          Nu există flori în bibliotecă. Adăugați prima floare folosind butonul de mai sus.
        </Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nume</th>
              <th>Nume latin</th>
              <th>Culoare</th>
              <th>Semnificații</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {flowers.map(flower => (
              <tr key={flower.id}>
                <td>{flower.id}</td>
                <td>{flower.name}</td>
                <td>{flower.latinName || <em>Nedefinit</em>}</td>
                <td>
                  <Badge bg="primary">{flower.colorName}</Badge>
                </td>
                <td>
                  {flower.meanings && flower.meanings.length > 0 ? (
                    flower.meanings.map(meaning => (
                      <Badge key={meaning.id} bg="secondary" className="me-1 mb-1">
                        {meaning.name}
                      </Badge>
                    ))
                  ) : (
                    <em>Fără semnificații</em>
                  )}
                </td>
                <td>
                  <Button 
                    as={Link} 
                    to={`/admin/flowers/edit/${flower.id}`} 
                    variant="outline-primary" 
                    size="sm"
                    className="me-2"
                  >
                    Editează
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleShowDeleteModal(flower)}
                  >
                    Șterge
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      
      {/* Modal de confirmare pentru ștergere */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmă ștergerea</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Sunteți sigur că doriți să ștergeți floarea <strong>{flowerToDelete?.name}</strong>?
          Această acțiune nu poate fi anulată.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Anulează
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteFlower}
            disabled={deleting}
          >
            {deleting ? 'Se șterge...' : 'Șterge'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FlowersManagement;