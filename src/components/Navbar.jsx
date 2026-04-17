import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import i18n from '../i18n/i18n';


export default function Navbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => { 
    logout(); 
    setShowProfileDropdown(false);
    navigate('/login'); 
  };

  const handleEditProfile = () => {
    setShowProfileDropdown(false);
    navigate('/profile');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLanguage = () => {
    const langs = ['en', 'te', 'hi'];
    const currentIndex = langs.indexOf(i18n.language || 'en');
    const newLang = langs[(currentIndex + 1) % langs.length];
    i18n.changeLanguage(newLang);
    localStorage.setItem('fp_language', newLang);
  };

  const navLinks = [
    { to: '/dashboard', label: t('dashboard') },
    { to: '/exercises', label: t('exercises') },
    { to: '/workouts', label: t('workouts') },
    { to: '/progress', label: t('progress') },
    { to: '/subscription', label: t('subscription') },
    { to: '/family', label: t('family') },
    { to: '/settings', label: t('settingsTitle') },
    { to: '/helpdesk', label: t('helpSupport') },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: t('admin') }] : [])
  ];

  return (
    <nav className="glass sticky top-0 z-50 border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg btn-gradient flex items-center justify-center text-white font-bold text-sm">FP</div>
          <span className="font-bold text-lg gradient-text">FitnessPass</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === link.to
                  ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
              style={location.pathname === link.to ? {
                background: 'rgba(108, 99, 255, 0.2)', color: '#6C63FF'
              } : {}}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
            style={{ background: 'rgba(108,99,255,0.15)', color: '#6C63FF', border: '1px solid rgba(108,99,255,0.3)' }}
          >
            🌐 {i18n.language === 'en' ? 'EN' : i18n.language === 'te' ? 'తె' : 'हि'}
          </button>

          {/* Coins */}
          {user && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'rgba(255,193,7,0.15)', color: '#FFC107', border: '1px solid rgba(255,193,7,0.3)' }}>
              🪙 {user.coins || 0}
            </div>
          )}

          {/* Avatar → Profile Dropdown */}
          {user && (
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="w-8 h-8 rounded-full btn-gradient flex items-center justify-center text-white text-sm font-bold hover:opacity-80 transition-opacity"
                title="Profile menu"
              >
                {user.name?.charAt(0).toUpperCase()}
              </button>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border"
                  style={{ 
                    borderColor: 'var(--border)',
                    background: 'rgba(15, 15, 35, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(108, 99, 255, 0.2)'
                  }}>
                  {/* User Info */}
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={handleEditProfile}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    ✏️ Edit Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2 border-t"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex overflow-x-auto pb-2 px-4 gap-1">
        {navLinks.map(link => (
          <Link key={link.to} to={link.to}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              location.pathname === link.to ? 'text-purple-400' : 'text-gray-400'
            }`}>
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
