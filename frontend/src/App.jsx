import { Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Result from './pages/Result'
import Login from './pages/Login'
import Signup from './pages/Signup'

const GOOGLE_CLIENT_ID = "387539609566-1k1rqia6rhi0ensgnjcuamf9823nfiqr.apps.googleusercontent.com";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen flex flex-col bg-pattern">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
        </Routes>
        <Footer />
      </div>
    </GoogleOAuthProvider>
  )
}

export default App
