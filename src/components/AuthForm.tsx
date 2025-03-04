import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, User, Sun, Building2, Phone, Leaf, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type Mode = 'signin' | 'signup';

export function AuthForm() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registrationCode, setRegistrationCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('');
  const [organization, setOrganization] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    // Ne rediriger vers /geolocation que si l'utilisateur est connecté et qu'on est en mode connexion
    if (session && mode === 'signin') {
      navigate('/geolocation', { replace: true });
    }
  }, [session, mode, navigate]);

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setEmail('');
    setPassword('');
    setRegistrationCode('');
    setFirstName('');
    setLastName('');
    setPosition('');
    setOrganization('');
    setPhone('');
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
    }
    return digits.slice(0, 10).replace(/(\d{2})(?=\d)/g, '$1 ').trim();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        // Vérifier le code d'inscription
        if (registrationCode !== '483445@') {
          throw new Error('Code d\'inscription invalide');
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              registration_code: registrationCode,
              first_name: firstName,
              last_name: lastName,
              position,
              organization,
              phone: phone.startsWith('+225') ? phone : `+225 ${phone}`,
            },
          },
        });

        if (error) throw error;

        // Déconnecter l'utilisateur après l'inscription
        await supabase.auth.signOut();
        
        toast.success('Inscription réussie ! Connectez-vous maintenant.');
        setMode('signin');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        toast.success('Connexion réussie !');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-agro-gradient flex items-center justify-center p-4">
      {/* Bouton retour */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 p-2 text-gray-600 hover:text-gray-900 bg-white/80 hover:bg-white rounded-lg transition-all flex items-center gap-2 shadow-lg backdrop-blur-sm"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Retour à l'accueil</span>
      </button>

      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-blue-500" />
        
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute -top-1 -right-1">
              <Sun className="w-6 h-6 text-yellow-500 logo-shadow animate-pulse" />
            </div>
            <div className="bg-gradient-to-br from-green-100 to-blue-50 p-4 rounded-full">
              <Leaf className="w-8 h-8 text-green-600 logo-shadow" />
            </div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Agro<span className="text-green-600">Connect</span>
          <span className="text-blue-500">+</span>
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {mode === 'signin' 
            ? 'La météo au service de votre agriculture'
            : 'Rejoignez la communauté AgroConnect+'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all"
                      placeholder="KONÉ"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénoms
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all"
                      placeholder="Amadou"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poste occupé
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all"
                    placeholder="Conseiller agricole"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Structure/Organisation
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all"
                    placeholder="ANADER"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={handlePhoneChange}
                    className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all"
                    placeholder="07 07 07 07 07"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code d'inscription
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={registrationCode}
                    onChange={(e) => setRegistrationCode(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all"
                    placeholder="Code unique fourni"
                  />
                </div>
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <span className="mr-1">•</span>
                  Ce code est requis pour créer votre compte
                </p>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all"
                placeholder="votre@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-12 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {mode === 'signin' && (
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-green-600 hover:text-green-500 transition-colors"
                onClick={() => toast.error('Fonctionnalité en développement')}
              >
                Mot de passe oublié ?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              'Chargement...'
            ) : mode === 'signin' ? (
              'Se connecter'
            ) : (
              "S'inscrire"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-gray-600 hover:text-green-600 transition-colors"
          >
            {mode === 'signin' ? (
              "Pas encore de compte ? S'inscrire"
            ) : (
              'Déjà un compte ? Se connecter'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}