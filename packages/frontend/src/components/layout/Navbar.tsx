import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User, PenSquare } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // In a real app, this would come from auth state

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleLogin = () => {
    setIsLoggedIn(!isLoggedIn); // For demo purposes only
  };

  const navItems = [
    { name: 'Browse Campaigns', href: '/campaigns' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'About', href: '/about' },
  ];

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <PenSquare className="h-8 w-8 text-campaign-accent" />
              <span className="ml-2 text-xl font-semibold text-campaign-text">GoGetAction</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navItems.map(item => (
              <Link
                key={item.name}
                to={item.href}
                className="text-campaign-text hover:text-campaign-accent transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Login/Sign-up buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className="flex items-center text-campaign-text hover:text-campaign-accent"
                >
                  <User className="h-5 w-5 mr-1" />
                  <span>My Account</span>
                </Link>
                <Button
                  onClick={toggleLogin}
                  variant="outline"
                  className="border-campaign-accent text-campaign-accent hover:bg-campaign-accent hover:text-white"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button
                  onClick={toggleLogin}
                  variant="outline"
                  className="border-campaign-accent text-campaign-accent hover:bg-campaign-accent hover:text-white"
                >
                  Log In
                </Button>
                <Button
                  onClick={toggleLogin}
                  className="bg-campaign-accent hover:bg-campaign-accent/90 text-white"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-campaign-text hover:text-campaign-accent focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-200 animate-fade-in">
            <div className="flex flex-col space-y-3 px-2 pt-2 pb-4">
              {navItems.map(item => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="px-3 py-2 text-campaign-text hover:bg-gray-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <hr className="my-2 border-gray-200" />
              {isLoggedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    className="px-3 py-2 flex items-center text-campaign-text hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5 mr-2" />
                    My Account
                  </Link>
                  <button
                    onClick={() => {
                      toggleLogin();
                      setIsMenuOpen(false);
                    }}
                    className="px-3 py-2 text-campaign-text hover:bg-gray-50 rounded-md text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      toggleLogin();
                      setIsMenuOpen(false);
                    }}
                    className="px-3 py-2 text-campaign-text hover:bg-gray-50 rounded-md text-left"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      toggleLogin();
                      setIsMenuOpen(false);
                    }}
                    className="px-3 py-2 bg-campaign-accent text-white rounded-md text-left"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
