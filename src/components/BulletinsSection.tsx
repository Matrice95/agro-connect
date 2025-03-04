import React, { useState, useEffect } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  FileText,
  Download,
  Search,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Bulletin, searchBulletins, filterBulletinsByDate, sortBulletinsByDate, generatePDF } from '../lib/bulletins';

interface BulletinsSectionProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BulletinsSection({ isOpen, onClose }: BulletinsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [sortAscending, setSortAscending] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState<Bulletin | null>(null);
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [filteredBulletins, setFilteredBulletins] = useState<Bulletin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des bulletins depuis l'API
    const loadBulletins = async () => {
      try {
        // Simulation de données
        const mockBulletins: Bulletin[] = [
          {
            id: '1',
            title: 'Bulletin Agrométéorologique - Région Nord',
            period: {
              start: new Date(2025, 1, 11),
              end: new Date(2025, 1, 20),
            },
            summary: 'Conditions favorables pour les cultures d\'anacarde et de mangue dans la région de Korhogo.',
            content: {
              introduction: 'La décade a été marquée par des conditions météorologiques favorables aux cultures pérennes.',
              weatherConditions: {
                temperature: { average: 28.5, anomaly: 1.2 },
                rainfall: { total: 45.2, anomaly: -5.3 },
                humidity: { average: 65, anomaly: 2.1 },
              },
              ndvi: {
                value: 0.72,
                anomaly: 0.05,
                interpretation: 'Végétation en bon état, légèrement au-dessus de la normale',
              },
              recommendations: [
                'Poursuivre la récolte des mangues Kent et Keitt',
                'Maintenir la surveillance phytosanitaire des vergers',
                'Préparer les opérations post-récolte',
              ],
            },
            regions: ['Korhogo', 'Boundiali', 'Ferkessédougou'],
            crops: ['Anacarde', 'Mangue'],
            isLatest: true,
            publishedAt: new Date(2025, 1, 11),
          },
          // Ajouter d'autres bulletins simulés...
        ];

        setBulletins(mockBulletins);
        setFilteredBulletins(mockBulletins);
      } catch (error) {
        toast.error('Erreur lors du chargement des bulletins');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadBulletins();
    }
  }, [isOpen]);

  useEffect(() => {
    let filtered = bulletins;

    // Appliquer la recherche
    if (searchQuery) {
      filtered = searchBulletins(filtered, searchQuery);
    }

    // Appliquer le filtre de date
    filtered = filterBulletinsByDate(filtered, startOfDay(startDate), endOfDay(endDate));

    // Appliquer le tri
    filtered = sortBulletinsByDate(filtered, sortAscending);

    setFilteredBulletins(filtered);
  }, [searchQuery, startDate, endDate, sortAscending, bulletins]);

  const handleDownload = async (bulletin: Bulletin) => {
    try {
      const pdfDataUri = generatePDF(bulletin);
      const link = document.createElement('a');
      link.href = pdfDataUri;
      link.download = `bulletin_${format(bulletin.period.start, 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Bulletin téléchargé avec succès');
    } catch (error) {
      toast.error('Erreur lors du téléchargement du bulletin');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-green-600 to-blue-600">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Bulletins Agrométéorologiques
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un bulletin..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={format(startDate, 'yyyy-MM-dd')}
                    onChange={(e) => setStartDate(new Date(e.target.value))}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={format(endDate, 'yyyy-MM-dd')}
                    onChange={(e) => setEndDate(new Date(e.target.value))}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={() => setSortAscending(!sortAscending)}
                className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
              >
                <ArrowUpDown className="w-5 h-5 text-gray-500" />
                {sortAscending ? 'Plus récent' : 'Plus ancien'}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
            </div>
          ) : filteredBulletins.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Aucun bulletin trouvé</h3>
              <p className="text-gray-500 mt-1">Modifiez vos critères de recherche pour voir plus de résultats</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBulletins.map((bulletin) => (
                <div
                  key={bulletin.id}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedBulletin?.id === bulletin.id
                      ? 'ring-2 ring-green-500 border-transparent'
                      : bulletin.isLatest
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{bulletin.title}</h3>
                        {bulletin.isLatest && (
                          <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                            Nouveau
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Du {format(bulletin.period.start, 'd MMMM yyyy', { locale: fr })} au{' '}
                        {format(bulletin.period.end, 'd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(bulletin)}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Télécharger
                      </button>
                      <button
                        onClick={() => setSelectedBulletin(selectedBulletin?.id === bulletin.id ? null : bulletin)}
                        className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {selectedBulletin?.id === bulletin.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {selectedBulletin?.id === bulletin.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="prose prose-sm max-w-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Résumé</h4>
                            <p className="text-gray-600">{bulletin.summary}</p>

                            <h4 className="font-medium text-gray-900 mt-4 mb-2">Conditions Météorologiques</h4>
                            <ul className="space-y-2">
                              <li className="flex justify-between">
                                <span className="text-gray-600">Température moyenne:</span>
                                <span className="font-medium">{bulletin.content.weatherConditions.temperature.average}°C</span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-gray-600">Précipitations totales:</span>
                                <span className="font-medium">{bulletin.content.weatherConditions.rainfall.total}mm</span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-gray-600">Humidité relative moyenne:</span>
                                <span className="font-medium">{bulletin.content.weatherConditions.humidity.average}%</span>
                              </li>
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Recommandations</h4>
                            <ul className="space-y-2">
                              {bulletin.content.recommendations.map((recommendation, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-green-500 mt-1">•</span>
                                  <span className="text-gray-600">{recommendation}</span>
                                </li>
                              ))}
                            </ul>

                            <div className="mt-4">
                              <h4 className="font-medium text-gray-900 mb-2">Zones concernées</h4>
                              <div className="flex flex-wrap gap-2">
                                {bulletin.regions.map((region, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 text-sm text-gray-600 bg-gray-100 rounded-full"
                                  >
                                    {region}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}