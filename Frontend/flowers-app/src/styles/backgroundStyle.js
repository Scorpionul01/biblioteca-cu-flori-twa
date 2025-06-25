// Definim stilul pentru secțiunea hero cu imaginea background.png
const backgroundStyle = {
  heroSection: {
    // Folosim direct imaginea ca fundal, fără gradient
    background: `url('C:/Users/user/Desktop/TWA/background.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: 'white',
    marginBottom: '50px',
    borderRadius: '10px', // Valoare directă în loc de var()
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' // Valoare directă în loc de var()
  }
};

export default backgroundStyle;