import { PenSquare, Users, Send, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  const steps = [
    {
      icon: <PenSquare className="h-8 w-8 text-campaign-accent" />,
      title: 'Create a Campaign',
      description:
        'Start a campaign for your cause and craft letter templates that effectively communicate your message.',
    },
    {
      icon: <Users className="h-8 w-8 text-campaign-accent" />,
      title: 'Gather Support',
      description:
        'Share your campaign with friends, family, and communities who care about your cause.',
    },
    {
      icon: <Send className="h-8 w-8 text-campaign-accent" />,
      title: 'Send Letters',
      description:
        'Supporters select letter templates and recipients. We handle printing and delivery.',
    },
    {
      icon: <Award className="h-8 w-8 text-campaign-accent" />,
      title: 'Make an Impact',
      description:
        'Decision-makers receive physical letters, making your cause impossible to ignore.',
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-campaign-text sm:text-4xl">How It Works</h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
            Simple steps to make your voice heard and create real change
          </p>
        </div>

        <div className="mt-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl shadow-sm p-6 h-full flex flex-col items-center text-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-campaign-text mb-2">{step.title}</h3>
                  <p className="text-gray-600 flex-grow">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 right-0 w-8 h-0.5 bg-gray-200 transform translate-x-4">
                    <div className="absolute right-0 -top-1 h-3 w-3 rounded-full bg-campaign-accent transform -translate-y-1/2"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/how-it-works"
            className="inline-flex items-center text-campaign-accent hover:underline font-medium"
          >
            Learn more about our process
            <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
