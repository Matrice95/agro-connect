import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Users, Search, Download, Filter, RefreshCw, LogOut, ArrowLeft, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  position: string;
  organization: string;
  phone: string;
  created_at: string;
  access_start: string | null;
  access_end: string | null;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'recent' | 'expired' | 'active'>('all');
  const [editingAccess, setEditingAccess] = useState<string | null>(null);
  const [accessStart, setAccessStart] = useState<string>('');
  const [accessEnd, setAccessEnd] = useState<string>('');

  useEffect(() => {
    checkAdminAccess();
    loadUsers();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) throw error;
      
      if (!data) {
        toast.error('Accès non autorisé');
        navigate('/');
      }
    } catch (error) {
      toast.error('Erreur de vérification des droits d\'accès');
      navigate('/');
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*');
      
      if (error) throw error;

      setUsers(profiles);
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const updateAccessPeriod = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          access_start: accessStart || null,
          access_end: accessEnd || null
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Période d\'accès mise à jour');
      loadUsers();
      setEditingAccess(null);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la période d\'accès');
    }
  };

  const filteredUsers = users.filter(user => {
    const searchTerms = searchQuery.toLowerCase().split(' ');
    const userString = `${user.first_name} ${user.last_name} ${user.email} ${user.organization}`.toLowerCase();
    
    const matchesSearch = searchTerms.every(term => userString.includes(term));
    const now = new Date();
    
    let matchesFilter = true;
    if (filter === 'recent') {
      matchesFilter = new Date(user.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (filter === 'expired') {
      matchesFilter = user.access_end ? new Date(user.access_end) < now : false;
    } else if (filter === 'active') {
      matchesFilter = 
        (!user.access_end || new Date(user.access_end) >= now) &&
        (!user.access_start || new Date(user.access_start) <= now);
    }
    
    return matchesSearch && matchesFilter;
  });

  const exportUsers = () => {
    try {
      const csv = [
        ['Email', 'Nom', 'Prénoms', 'Poste', 'Organisation', 'Téléphone', 'Date d\'inscription', 'Début d\'accès', 'Fin d\'accès'],
        ...filteredUsers.map(user => [
          user.email,
          user.last_name,
          user.first_name,
          user.position,
          user.organization,
          user.phone,
          new Date(user.created_at).toLocaleDateString('fr-FR'),
          user.access_start ? new Date(user.access_start).toLocaleDateString('fr-FR') : 'Non défini',
          user.access_end ? new Date(user.access_end).toLocaleDateString('fr-FR') : 'Non défini'
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Export réussi');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  return (
    <div className="min-h-screen bg-agro-gradient">
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/geolocation')}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">Administration</h1>
                    <p className="text-sm opacity-90">Gestion des utilisateurs</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-4 border-b">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un utilisateur..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">Tous les utilisateurs</option>
                  <option value="active">Accès actif</option>
                  <option value="expired">Accès expiré</option>
                  <option value="recent">Inscrits récents</option>
                </select>
                <button
                  onClick={loadUsers}
                  className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5 text-gray-500" />
                  Actualiser
                </button>
                <button
                  onClick={exportUsers}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Exporter
                </button>
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période d'accès
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscription
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-medium">
                              {user.first_name[0]}{user.last_name[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{user.phone}</div>
                        <div className="text-sm text-gray-500">{user.position}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{user.organization}</div>
                      </td>
                      <td className="px-6 py-4">
                        {editingAccess === user.id ? (
                          <div className="space-y-2">
                            <div>
                              <label className="block text-xs text-gray-500">Début</label>
                              <input
                                type="date"
                                value={accessStart}
                                onChange={(e) => setAccessStart(e.target.value)}
                                className="mt-1 block w-full text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500">Fin</label>
                              <input
                                type="date"
                                value={accessEnd}
                                onChange={(e) => setAccessEnd(e.target.value)}
                                className="mt-1 block w-full text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateAccessPeriod(user.id)}
                                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              >
                                Enregistrer
                              </button>
                              <button
                                onClick={() => setEditingAccess(null)}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-900">
                                {user.access_start ? format(new Date(user.access_start), 'dd/MM/yyyy') : 'Non défini'} 
                                {' → '} 
                                {user.access_end ? format(new Date(user.access_end), 'dd/MM/yyyy') : 'Non défini'}
                              </div>
                              <button
                                onClick={() => {
                                  setEditingAccess(user.id);
                                  setAccessStart(user.access_start?.split('T')[0] || '');
                                  setAccessEnd(user.access_end?.split('T')[0] || '');
                                }}
                                className="text-xs text-green-600 hover:text-green-500 transition-colors"
                              >
                                Modifier
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}