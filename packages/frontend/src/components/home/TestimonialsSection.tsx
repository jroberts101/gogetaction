import { QuoteIcon } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote:
        'Our campaign to protect local parks gathered over 500 letter submissions in just two weeks. The city council took notice and halted the development plans.',
      author: 'Sarah Chen',
      role: 'Community Organizer',
      image: '/uploads/GoGEtActionImage05.png',
    },
    {
      quote:
        'The letter templates made it easy for our supporters to send meaningful messages. We saw real results when over 200 personalized letters reached state representatives.',
      author: 'Marcus Johnson',
      role: 'Environmental Advocate',
      image: '/uploads/GoGEtActionImage01.png',
    },
    {
      quote:
        'As a small non-profit, we struggled to make our voice heard. This platform changed everything by helping us coordinate an effective letter campaign with minimal overhead.',
      author: 'Elena Rodriguez',
      role: 'Non-profit Director',
      image: '/uploads/GoGEtActionImage03.png',
    },
  ];

  return (
    <section className="py-16 bg-campaign-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Success Stories</h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-white/80">
            Real impact from campaigners like you
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg relative"
            >
              <div className="absolute -top-4 -left-4 text-campaign-accent">
                <QuoteIcon size={32} />
              </div>
              <blockquote className="mt-4">
                <p className="text-lg font-medium italic">{testimonial.quote}</p>
              </blockquote>
              <div className="mt-6 flex items-center">
                <div className="flex-shrink-0">
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src={testimonial.image}
                    alt={testimonial.author}
                  />
                </div>
                <div className="ml-4">
                  <div className="font-medium">{testimonial.author}</div>
                  <div className="text-white/70 text-sm">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
