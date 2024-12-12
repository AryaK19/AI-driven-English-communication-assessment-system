import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Profile from "./Profile";
import { GithubOutlined } from "@ant-design/icons";

function Navbar(props) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/register");
  };

  const handleGithubClick = () => {
    window.location.href =
      "https://github.com/AryaK19/AI-driven-English-communication-assessment-system/tree/main";
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container px-4">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/images/logo.png" alt="Logo" className="h-24" />
            </Link>
          </div>

          {/* Auth Buttons */}
          {!props.isUserAuthenticated && (
            <div className="hidden md:flex items-center space-x-4">
              <button
                className="px-4 py-2 text-brand-blue hover:text-brand-purple transition-colors duration-200"
                onClick={handleLogin}
              >
                Login
              </button>
              <button
                className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-purple transition-all duration-200 flex items-center space-x-2"
                onClick={handleSignUp}
              >
                <User className="w-4 h-4" />
                <span>Sign Up</span>
              </button>
            </div>
          )}

          {props.isUserAuthenticated && (
            <div className="hidden md:flex items-center space-x-4">
              <GithubOutlined
                onClick={handleGithubClick}
                style={{
                  fontSize: "34px",
                  cursor: "pointer",
                  marginRight: "16px",
                }}
              />
              <Profile />
            </div>
          )}

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
              {!props.isUserAuthenticated && (
                <div className="mt-4 space-y-2">
                  <button
                    className="block w-full px-3 py-2 text-center text-brand-blue hover:text-brand-purple"
                    onClick={handleLogin}
                  >
                    Login
                  </button>
                  <button
                    className="block w-full px-3 py-2 text-center bg-brand-blue text-white rounded-lg hover:bg-brand-purple"
                    onClick={handleSignUp}
                  >
                    Sign Up
                  </button>
                </div>
              )}
              {props.isUserAuthenticated && (
                <div className="mt-4 space-y-2">
                  <GithubOutlined
                    onClick={handleGithubClick}
                    style={{
                      fontSize: "34px",
                      cursor: "pointer",
                      marginRight: "16px",
                    }}
                  />
                  <Profile />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
