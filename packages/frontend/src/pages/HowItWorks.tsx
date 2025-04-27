import { Helmet } from 'react-helmet';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Mail,
  User,
  FileText,
  PenSquare,
  Send,
  DollarSign,
  Users,
} from 'lucide-react';

const HowItWorks = () => {
  return (
    <>
      <Helmet>
        <title>How It Works | CauseLetter</title>
        <meta
          name="description"
          content="Learn how CauseLetter works to empower your advocacy through letter-writing campaigns."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          {/* Hero */}
          <div className="bg-campaign-primary text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">How CauseLetter Works</h1>
                <p className="text-xl max-w-3xl mx-auto">
                  Our platform connects campaigners with supporters to send impactful physical
                  letters to decision-makers, making voices heard on issues that matter.
                </p>
              </div>
            </div>
          </div>

          {/* For Campaigners */}
          <div className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-campaign-text">For Campaigners</h2>
                <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                  Create and manage letter-writing campaigns for your cause
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="mb-4 text-campaign-accent">
                    <PenSquare className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">1. Start Your Campaign</h3>
                  <p className="text-gray-600">
                    Create an account, pay a one-time campaign setup fee, and provide details about
                    your cause. Our platform makes it easy to set up a professional-looking campaign
                    page.
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="mb-4 text-campaign-accent">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">2. Create Letter Templates</h3>
                  <p className="text-gray-600">
                    Draft effective letter templates that supporters can send. Focus on clear
                    messaging that resonates with decision-makers and inspires action.
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="mb-4 text-campaign-accent">
                    <Users className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">3. Share Your Campaign</h3>
                  <p className="text-gray-600">
                    Promote your campaign through social media, email, or community outreach. The
                    more people you reach, the greater your impact will be.
                  </p>
                </div>
              </div>

              <div className="mt-12 text-center">
                <Link to="/create-campaign">
                  <Button className="bg-campaign-accent hover:bg-campaign-accent/90 text-white">
                    Start Your Campaign
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* For Supporters */}
          <div className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-campaign-text">For Supporters</h2>
                <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                  Support causes you care about by sending impactful letters
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="mb-4 text-campaign-accent">
                    <User className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">1. Find a Campaign</h3>
                  <p className="text-gray-600">
                    Browse campaigns by category or search for specific causes that interest you. No
                    account needed to get started.
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="mb-4 text-campaign-accent">
                    <Mail className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">2. Select Letters</h3>
                  <p className="text-gray-600">
                    Choose from pre-written letter templates provided by the campaign. You can send
                    one or multiple letters to make your voice heard.
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="mb-4 text-campaign-accent">
                    <DollarSign className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">3. Pay for Delivery</h3>
                  <p className="text-gray-600">
                    A small fee covers the cost of printing and mailing your physical letters to
                    decision-makers. Secure payment through our platform.
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="mb-4 text-campaign-accent">
                    <Send className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">4. Letters Delivered</h3>
                  <p className="text-gray-600">
                    We print and mail your letters on your behalf. Physical letters have a powerful
                    impact that digital messages can't match.
                  </p>
                </div>
              </div>

              <div className="mt-12 text-center">
                <Link to="/campaigns">
                  <Button className="bg-campaign-accent hover:bg-campaign-accent/90 text-white">
                    Browse Campaigns
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Why physical letters matter */}
          <div className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-campaign-text">
                  Why Physical Letters Matter
                </h2>
                <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                  In a digital world, physical mail stands out and makes a tangible impact
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle2 className="h-6 w-6 text-campaign-accent" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold">Greater Impact</h3>
                      <p className="text-gray-600">
                        Physical letters are harder to ignore than emails or online petitions. They
                        demonstrate real commitment from constituents.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle2 className="h-6 w-6 text-campaign-accent" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold">Increased Attention</h3>
                      <p className="text-gray-600">
                        Decision-makers and their staff pay more attention to physical mail, giving
                        your message more weight.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle2 className="h-6 w-6 text-campaign-accent" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold">Documented Support</h3>
                      <p className="text-gray-600">
                        Physical letters create a tangible record of public opinion that can be
                        referenced in meetings, hearings, and discussions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle2 className="h-6 w-6 text-campaign-accent" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold">Accessible Advocacy</h3>
                      <p className="text-gray-600">
                        Our platform makes it easy for anyone to send a physical letter without
                        dealing with printing, stamps, or mailing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Teaser */}
          <div className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold text-campaign-text mb-6">Have Questions?</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Visit our FAQ page for more information about campaign creation, letter sending,
                pricing, and more.
              </p>
              <Link to="/faq">
                <Button variant="outline" className="border-campaign-accent text-campaign-accent">
                  View FAQ
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default HowItWorks;
