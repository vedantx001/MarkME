import { Link } from 'react-router-dom';
import { 
  Camera, 
  Clock, 
  FileText, 
  Shield, 
  Menu, 
  X,
  ChevronRight,
  Users,
  School
} from 'lucide-react';
import { useState } from 'react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: Camera,
      title: "AI-Powered Attendance",
      description: "Mark attendance in seconds using one photo.",
      gradient: "from-blue-500 to-cyan-400"
    },
    {
      icon: Clock,
      title: "Time-Saving for Teachers",
      description: "Reduce manual effort, focus more on teaching.",
      gradient: "from-cyan-500 to-teal-400"
    },
    {
      icon: FileText,
      title: "Reports for Principals",
      description: "Download weekly/monthly attendance reports.",
      gradient: "from-teal-500 to-green-400"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Data stored safely, accessible anytime.",
      gradient: "from-green-500 to-emerald-400"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <School className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Smart Attendance
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors">
                How it Works
              </a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">
                Contact
              </a>
              <Link 
                to="/auth" 
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
              >
                Sign In
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 animate-fade-in-down">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Features
                </a>
                <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors">
                  How it Works
                </a>
                <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Contact
                </a>
                <Link 
                  to="/auth" 
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg text-center"
                >
                  Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Smart Attendance – 
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {" "}Automating Classroom Attendance
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              A simple, low-cost tool that helps teachers mark attendance with a single class photo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/auth"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span className="font-semibold">Get Started</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center space-x-2">
                <Users className="w-5 h-5" />
                <span className="font-semibold">Watch Demo</span>
              </button>
            </div>

            <div className="flex items-center space-x-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-600">Schools</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">10k+</div>
                <div className="text-sm text-gray-600">Teachers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">98%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
            </div>
          </div>
          
          <div className="relative animate-float">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-3xl blur-3xl opacity-30"></div>
            <div className="relative bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl p-8 shadow-2xl">
              <div className="aspect-video bg-white rounded-xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Camera className="w-24 h-24 text-blue-600 mx-auto" />
                  <p className="text-gray-600 font-medium">Classroom Illustration</p>
                  <div className="flex justify-center space-x-2">
                    <div className="w-12 h-12 bg-blue-200 rounded-full"></div>
                    <div className="w-12 h-12 bg-cyan-200 rounded-full"></div>
                    <div className="w-12 h-12 bg-teal-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-down">
            <h2 className="text-3xl sm:text-4lg:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Smart Attendance?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Revolutionizing attendance management for rural schools with cutting-edge technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                
                <div className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to automated attendance
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Capture", desc: "Take a single photo of the classroom" },
              { step: "2", title: "Process", desc: "AI identifies and marks present students" },
              { step: "3", title: "Report", desc: "Generate instant attendance reports" }
            ].map((item, index) => (
              <div key={index} className="text-center space-y-4 animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your School's Attendance?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of schools already using Smart Attendance
          </p>
          <Link 
            to="/auth"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl hover:shadow-2xl transition-all transform hover:scale-105 font-semibold space-x-2"
          >
            <span>Get Started Now</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <School className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold text-white">Smart Attendance</span>
              </div>
              <p className="text-sm">
                Empowering rural schools with smart technology
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Demo</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 Smart Attendance. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;