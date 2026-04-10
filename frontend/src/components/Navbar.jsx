import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const token = localStorage.getItem('token')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isResult = location.pathname === '/result'

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 cursor-pointer bg-transparent border-none"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
               style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
            R
          </div>
          <span className="text-lg font-bold tracking-tight text-surface-900">
            Resume<span className="gradient-text">AI</span>
          </span>
        </button>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {isResult && (
            <button
              onClick={() => navigate('/')}
              className="btn-secondary text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Resume
            </button>
          )}

          {token ? (
            <button onClick={handleLogout} className="btn-secondary text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/login')} className="btn-secondary text-sm hidden sm:block">Log In</button>
              <button onClick={() => navigate('/signup')} className="btn-primary text-sm flex gap-1.5 items-center">
                <span>Sign Up</span>
              </button>
            </div>
          )}

          <span className="badge badge-primary hidden md:inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            AI Powered
          </span>
        </div>
      </div>
    </nav>
  )
}
