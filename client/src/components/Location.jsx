import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { User, Globe, Shield, Code, BarChart2 } from "lucide-react";
import Navbar from "./Navbar";

const Location = () => {
  const features = [
    {
      icon: <Code size={24} className="text-indigo-600" />,
      title: "Cutting-Edge Tech",
      description: "Built with the latest AI and machine learning technologies."
    },
    {
      icon: <BarChart2 size={24} className="text-indigo-600" />,
      title: "Data-Driven",
      description: "Our algorithms continuously improve based on user feedback."
    }
  ];

  const teamMembers = [
    {
      name: "Noor Fatima",
      role: "CEO & Founder",
      bio: "AI specialist with 10+ years in computer vision",
      img: "/image/NoorFatima.jpg"
    },
    
    { 
      name: "Abeer dev branch",
      name: "Abeer main branch new again",
      role: "Lead Developer",
      bio: "Full-stack developer and machine learning engineer",
      img: "/image/NoorFatima.jpg"
    },
  ];

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      {/* Navigation Spacer */}
      <div className="h-16"></div>

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl mb-6">
            About <span className="text-indigo-600">ImageLab</span>
          </h1>
          <p className="mt-5 max-w-3xl mx-auto text-xl text-gray-600">
            Revolutionizing image analysis with AI-powered tools for professionals and enthusiasts alike.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Founded in 2025, ImageLab began as a research project at University's Computer Vision Lab. 
                What started as an academic experiment quickly evolved into a powerful platform used by thousands.
              </p>
              <p className="text-gray-600 mb-6">
                Today, we're proud to serve photographers, medical professionals, security experts, and creative 
                minds across the globe with our cutting-edge image analysis tools.
              </p>
              <Link 
                to="/contact" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Get in touch
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-indigo-50 rounded-xl p-6 h-full"
            >
              <img 
                src="https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                alt="Team working" 
                className="rounded-lg shadow-md w-full h-auto object-cover"
              />
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Choose ImageLab</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-indigo-100 mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-center mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-center">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Meet Our Team</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img 
                  src={member.img} 
                  alt={member.name} 
                  className="w-full h-72  object-center"    
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
                  <p className="text-indigo-600 mb-2">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-indigo-600 rounded-2xl shadow-xl p-8 text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Ready to experience ImageLab?</h2>
          <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
            Join thousands of professionals who trust our platform for their image analysis needs.
          </p>
          <Link 
            to="/signup" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
          >
            Get Started for Free
          </Link>
        </motion.div>
      </motion.section>
    </div>
    </>
  );
};

export default Location;