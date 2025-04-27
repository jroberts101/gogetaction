import { Link } from 'react-router-dom';
import { PenSquare, Facebook, Twitter, Instagram, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and mission */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center">
              <PenSquare className="h-8 w-8 text-campaign-accent" />
              <span className="ml-2 text-xl font-semibold text-campaign-text">GoGetAction</span>
            </Link>
            <p className="mt-4 text-gray-600 max-w-md">
              Empowering communities to advocate for change through targeted campaigns. Make your
              voice heard by supporting causes that matter.
            </p>
            <div className="mt-6 flex space-x-4">
              <a
                href="#"
                className="text-gray-500 hover:text-campaign-accent"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-500 hover:text-campaign-accent" aria-label="Twitter">
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-campaign-accent"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="mailto:contact@causeletter.org"
                className="text-gray-500 hover:text-campaign-accent"
                aria-label="Email"
              >
                <Mail className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Links column 1 */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Platform
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/campaigns"
                  className="text-gray-600 hover:text-campaign-accent transition-colors"
                >
                  Browse Campaigns
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="text-gray-600 hover:text-campaign-accent transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  to="/create-campaign"
                  className="text-gray-600 hover:text-campaign-accent transition-colors"
                >
                  Create a Campaign
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-gray-600 hover:text-campaign-accent transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-gray-600 hover:text-campaign-accent transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Links column 2 */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-gray-600 hover:text-campaign-accent transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-600 hover:text-campaign-accent transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-600 hover:text-campaign-accent transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-600 hover:text-campaign-accent transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm text-center">
            &copy; {new Date().getFullYear()} GoGetAction. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
