import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, User } from 'lucide-react'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Assessments', path: '/assessments' },
  ]

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/images/logo.png"
                alt="Logo"
                className="h-24"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-gray-600 hover:text-brand-blue transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="px-4 py-2 text-brand-blue hover:text-brand-purple transition-colors duration-200">
              Login
            </button>
            <button className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-purple transition-all duration-200 flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Sign Up</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-brand-blue focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="block px-3 py-2 text-gray-600 hover:text-brand-blue hover:bg-gray-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="mt-4 space-y-2">
                <button className="block w-full px-3 py-2 text-center text-brand-blue hover:text-brand-purple">
                  Login
                </button>
                <button className="block w-full px-3 py-2 text-center bg-brand-blue text-white rounded-lg hover:bg-brand-purple">
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar