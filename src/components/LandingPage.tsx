import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sun,
  Cloud,
  Droplets,
  LineChart,
  FileText,
  Download,
  Users,
  Leaf,
  ArrowRight,
  ChevronRight,
  CloudSun,
  CloudRain,
  Wind,
  Smartphone,
  Globe,
  Shield,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Menu,
  X,
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <CloudSun className="w-8 h-8 text-blue-500" />,
      title: 'Suivi météo en temps réel',
      description: 'Accédez aux données météorologiques précises et actualisées pour votre exploitation.'
    },
    {
      icon: <LineChart className="w-8 h-8 text-green-500" />,
      title: 'Prévisions sur mesure',
      description: 'Anticipez vos activités grâce à des prévisions météorologiques détaillées sur 7 jours.'
    },
    {
      icon: <FileText className="w-8 h-8 text-orange-500" />,
      title: 'Bulletins agrométéorologiques',
      description: 'Recevez des recommandations personnalisées basées sur vos cultures et les conditions météo.'
    },
    {
      icon: <Download className="w-8 h-8 text-purple-500" />,
      title: 'Exportation des données',
      description: 'Exportez facilement vos données pour une analyse approfondie et un suivi optimal.'
    }
  ];

  const testimonials = [
    {
      quote: "Grâce à AgroConnect+, j'optimise mes interventions sur mes vergers d'anacardiers. Les prévisions sont fiables et les recommandations très pertinentes.",
      author: "Amadou K.",
      role: "Producteur d'anacarde, Korhogo",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
    },
    {
      quote: "L'application m'aide à prendre de meilleures décisions pour la gestion de mes manguiers. Le suivi de l'humectation des feuilles est particulièrement utile.",
      author: "Marie T.",
      role: "Productrice de mangues, Boundiali",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
    },
    {
      quote: "Un outil indispensable pour notre coopérative. Les bulletins agrométéorologiques nous permettent d'anticiper et de mieux planifier nos activités.",
      author: "Ibrahim S.",
      role: "Président de coopérative, Ferkessédougou",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop"
    }
  ];

  const stats = [
    {
      value: '90%',
      label: 'de satisfaction utilisateur'
    },
    {
      value: '85%',
      label: 'de précision des prévisions'
    },
    {
      value: '+45%',
      label: "d'optimisation des interventions"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}>
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2">
              <Leaf className={`w-8 h-8 ${scrolled ? 'text-green-600' : 'text-white'}`} />
              <span className={`text-xl font-bold ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                Agro<span className="text-green-600">Connect</span>
                <span className="text-blue-500">+</span>
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className={`${scrolled ? 'text-gray-600 hover:text-green-600' : 'text-white/90 hover:text-white'} transition-colors`}>
                Fonctionnalités
              </a>
              <a href="#testimonials" className={`${scrolled ? 'text-gray-600 hover:text-green-600' : 'text-white/90 hover:text-white'} transition-colors`}>
                Témoignages
              </a>
              <a href="#contact" className={`${scrolled ? 'text-gray-600 hover:text-green-600' : 'text-white/90 hover:text-white'} transition-colors`}>
                Contact
              </a>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/auth')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    scrolled 
                      ? 'text-green-600 hover:text-green-700' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Connexion
                </button>
                <button
                  onClick={() => navigate('/auth')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  S'inscrire
                </button>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg"
            >
              {isMenuOpen ? (
                <X className={`w-6 h-6 ${scrolled ? 'text-gray-900' : 'text-white'}`} />
              ) : (
                <Menu className={`w-6 h-6 ${scrolled ? 'text-gray-900' : 'text-white'}`} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="max-w-[1440px] mx-auto px-6 py-4">
              <nav className="flex flex-col gap-4">
                <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors py-2">
                  Fonctionnalités
                </a>
                <a href="#testimonials" className="text-gray-600 hover:text-green-600 transition-colors py-2">
                  Témoignages
                </a>
                <a href="#contact" className="text-gray-600 hover:text-green-600 transition-colors py-2">
                  Contact
                </a>
                <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => navigate('/auth')}
                    className="w-full px-4 py-2 text-green-600 hover:text-green-700 transition-colors text-center"
                  >
                    Connexion
                  </button>
                  <button
                    onClick={() => navigate('/auth')}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
                  >
                    S'inscrire
                  </button>
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="min-h-screen relative overflow-hidden">
        {/* Background Image with Parallax Effect */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed transform scale-105"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop')`
          }}
        />

        {/* Animated Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/6 animate-float-slow">
            <Cloud className="w-16 h-16 text-white/20" />
          </div>
          <div className="absolute top-1/3 right-1/4 animate-float-slower">
            <Sun className="w-24 h-24 text-yellow-200/30" />
          </div>
          <div className="absolute bottom-1/4 left-1/3 animate-float">
            <Droplets className="w-12 h-12 text-blue-200/30" />
          </div>
        </div>

        {/* Content */}
        <div className="relative min-h-screen flex items-center">
          <div className="max-w-[1440px] mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
                Prenez des décisions éclairées grâce à l'agriculture connectée
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-12 leading-relaxed">
                Optimisez vos pratiques agricoles avec des données météo précises, des prévisions fiables
                et des recommandations agronomiques personnalisées.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 max-w-2xl mx-auto">
                <button
                  onClick={() => navigate('/auth')}
                  className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 w-full sm:w-auto justify-center shadow-lg hover:shadow-xl transform hover:scale-105 group flex-1"
                >
                  <span className="text-lg whitespace-nowrap">Commencer maintenant</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => {
                    const featuresSection = document.getElementById('features');
                    featuresSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-white/20 transition-all border border-white/30 flex items-center gap-2 w-full sm:w-auto justify-center shadow-lg hover:shadow-xl transform hover:scale-105 group flex-1"
                >
                  <span className="text-lg whitespace-nowrap">En savoir plus</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-white/80">
          <span className="text-sm mb-2">Découvrir</span>
          <div className="w-6 h-10 border-2 border-white/50 rounded-full p-1">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce mx-auto" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
        <div className="max-w-[1440px] mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Fonctionnalités principales
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des outils puissants pour une agriculture moderne et connectée
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
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

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-br from-green-600 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
        </div>
        <div className="max-w-[1440px] mx-auto px-6 relative">
          <div className="grid md:grid-cols-3 gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center transform hover:scale-105 transition-transform">
                <div className="text-5xl font-bold mb-3">{stat.value}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ce qu'en disent nos utilisateurs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez comment AgroConnect+ aide les agriculteurs au quotidien
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-white/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20" />
        </div>
        <div className="max-w-[1440px] mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Prêt à optimiser votre exploitation ?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Rejoignez les agriculteurs qui font confiance à AgroConnect+ pour améliorer leurs pratiques agricoles.
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all inline-flex items-center gap-2 transform hover:scale-105 shadow-lg hover:shadow-xl group"
            >
              <span className="text-lg">Créer un compte gratuitement</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-400 pt-24 pb-12">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 text-white mb-6">
                <Leaf className="w-8 h-8" />
                <span className="text-xl font-bold">
                  Agro<span className="text-green-500">Connect</span>
                  <span className="text-blue-500">+</span>
                </span>
              </div>
              <p className="mb-6">
                La solution agrométéorologique innovante pour une agriculture moderne et connectée.
              </p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6">Produit</h4>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="hover:text-white transition-colors">Fonctionnalités</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Tarifs</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">FAQ</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6">Support</h4>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="hover:text-white transition-colors">Centre d'aide</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Documentation</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Contact</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6">Légal</h4>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">CGU</a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-16 pt-8 text-center">
            <p>&copy; 2025 AgroConnect+. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}