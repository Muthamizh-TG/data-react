
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import edit from './pages/edit';
import admin from './pages/admin';
import approved from './pages/approved';
import AddBusiness from './pages/add'; 

const cors = require('cors');
App.use(cors({
  origin: 'http://localhost:5173',
}));

function App() {
  return (
    <div className="App" style={{ background: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <h1 style={{ color: '#fff', marginBottom: '2em' }}>Project Synapse</h1>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1em' }}>
                <Link to="/add" style={{ width: '200px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', padding: '1em', fontSize: '1em', fontWeight: 'bold', textAlign: 'center', textDecoration: 'none', cursor: 'pointer' }}>Add Business</Link>
                <Link to="/edit" style={{ width: '200px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', padding: '1em', fontSize: '1em', fontWeight: 'bold', textAlign: 'center', textDecoration: 'none', cursor: 'pointer' }}>Edit Business</Link>
                <Link to="/admin" style={{ width: '200px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', padding: '1em', fontSize: '1em', fontWeight: 'bold', textAlign: 'center', textDecoration: 'none', cursor: 'pointer' }}>Admin</Link>
                <Link to="/approved" style={{ width: '200px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', padding: '1em', fontSize: '1em', fontWeight: 'bold', textAlign: 'center', textDecoration: 'none', cursor: 'pointer' }}>Approved Businesses</Link>
              </div>
            </>
          }
        />
        <Route path="/add" element={<PageWithBack component={AddBusiness} />} />
        <Route path="/edit" element={<PageWithBack component={edit} />} />
        <Route path="/admin" element={<PageWithBack component={admin} />} />
        <Route path="/approved" element={<PageWithBack component={approved} />} />
      </Routes>
    </div>
  );
}

function PageWithBack({ component: Component }) {
  const navigate = useNavigate();
  return (
    <div style={{ position: 'relative', Height: '100vh', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      <button
        className="btn btn-light fw-bold position-absolute"
        style={{ top: 60, right: 30, width: '120px', borderRadius: '8px', zIndex: 10 }}
        onClick={() => navigate('/')}
      >
        Back
      </button>
      <Component />
    </div>
  );
}

export default App;
