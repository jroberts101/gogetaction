import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-campaign-primary to-campaign-accent overflow-hidden shadow-xl">
          <div className="px-6 py-12 md:py-16 md:px-12 lg:px-16 lg:py-20 text-center text-white">
            <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to Start Your Campaign?</h2>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto">
              Join hundreds of campaigners who are making a real difference through targeted
              letter-writing campaigns. It takes just minutes to get started.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/create-campaign"
                className="bg-white text-campaign-accent px-8 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition duration-200 ease-in-out"
              >
                Create a Campaign
              </Link>
              <Link
                to="/campaigns"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white/10 transition duration-200 ease-in-out"
              >
                Browse Existing Campaigns
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
