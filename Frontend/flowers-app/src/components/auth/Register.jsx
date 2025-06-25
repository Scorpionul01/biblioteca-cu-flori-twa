import React, { useState, useContext } from 'react';
import { Form, Button, Alert, Container, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const { register, error: contextError } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validare manuală pentru potrivirea parolelor
    if (password !== confirmPassword) {
      setLocalError('Parolele nu se potrivesc');
      return;
    }
    
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    setLoading(true);
    setLocalError('');
    
    try {
      const success = await register(username, email, password, confirmPassword);
      
      if (success) {
        navigate('/');
      }
    } catch (error) {
      setLocalError('Înregistrare eșuată. Verificați datele introduse.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <Card className="card-custom" style={{ width: '450px' }}>
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <i className="fas fa-user-plus feature-icon text-primary"></i>
            <h2 className="feature-title mt-3">Înregistrare</h2>
          </div>
          
          {(localError || contextError) && (
            <Alert variant="danger">
              {localError || contextError}
            </Alert>
          )}
          
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formUsername">
              <Form.Label className="form-label-custom"><i className="fas fa-user me-2"></i>Nume utilizator</Form.Label>
              <Form.Control
                type="text"
                placeholder="Introduceți numele de utilizator"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                className="form-control-custom"
              />
              <Form.Control.Feedback type="invalid">
                Numele de utilizator trebuie să aibă minim 3 caractere.
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label className="form-label-custom"><i className="fas fa-envelope me-2"></i>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Introduceți email-ul"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-control-custom"
              />
              <Form.Control.Feedback type="invalid">
                Vă rugăm introduceți un email valid.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label className="form-label-custom"><i className="fas fa-lock me-2"></i>Parolă</Form.Label>
              <Form.Control
                type="password"
                placeholder="Introduceți parola"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="form-control-custom"
              />
              <Form.Control.Feedback type="invalid">
                Parola trebuie să aibă minim 6 caractere.
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formConfirmPassword">
              <Form.Label className="form-label-custom"><i className="fas fa-lock me-2"></i>Confirmare parolă</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirmați parola"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                isInvalid={password !== confirmPassword}
                className="form-control-custom"
              />
              <Form.Control.Feedback type="invalid">
                Parolele nu se potrivesc.
              </Form.Control.Feedback>
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="btn-custom-primary w-100 mt-4" 
              disabled={loading}
            >
              {loading ? <><i className="fas fa-spinner fa-spin me-2"></i>Se procesează...</> : <><i className="fas fa-user-plus me-2"></i>Înregistrare</>}
            </Button>
          </Form>
          
          <div className="w-100 text-center mt-4">
            <div className="floral-divider mb-3">
              <i className="fas fa-spa floral-icon"></i>
            </div>
            Aveți deja cont? <Link to="/login" className="text-primary fw-bold">Autentificați-vă</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;