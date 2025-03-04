import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Sun,
  Cloud,
  Droplets,
  Wind,
  Thermometer,
  Calendar,
  AlertTriangle,
  LogOut,
  ArrowLeft,
  Leaf,
  LineChart,
  Settings,
  Download,
  CloudRain,
  Umbrella,
  CloudLightning,
  CloudSun,
  CloudDrizzle,
  Info,
  FileText,
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { format, addDays, addHours, subDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { Chart, defaultChartOptions } from '../lib/chart';
import { getCurrentWeather, getHourlyForecast, getDailyForecast } from '../lib/weather';
import { availableLocations } from '../data/locations';
import { BulletinsSection } from './BulletinsSection';
import { generateCropCalendar, CropEvent, CropCalendar } from '../lib/crops';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainfall: number;
  radiation: number;
  soilMoisture: number;
  leafWetnessDuration: number;
}

interface Forecast {
  date: Date;
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainfall: number;
  description: string;
  icon: React.ReactNode;
  probability: number;
}

interface Area {
  id: string;
  name: string;
  geometry: any;
}

const weatherIcons = {
  sunny: <CloudSun className="w-6 h-6 text-yellow-500" />,
  cloudy: <Cloud className="w-6 h-6 text-gray-500" />,
  rainy: <CloudRain className="w-6 h-6 text-blue-500" />,
  stormy: <CloudLightning className="w-6 h-6 text-purple-500" />,
  drizzle: <CloudDrizzle className="w-6 h-6 text-blue-400" />,
};

const getDiseaseRisk = (leafWetnessDuration: number) => {
  if (leafWetnessDuration <= 3) return 'low';
  if (leafWetnessDuration <= 6) return 'medium';
  return 'high';
};

export function Dashboard() {
  const { areaId } = useParams();
  const navigate = useNavigate();
  const [area, setArea] = useState<Area | null>(null);
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<Forecast[]>([]);
  const [selectedCrop, setSelectedCrop] = useState('anacarde');
  const [diseaseRisk, setDiseaseRisk] = useState<'low' | 'medium' | 'high'>('low');
  const [loading, setLoading] = useState(true);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [cropCalendar, setCropCalendar] = useState<CropCalendar | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showEventInfo, setShowEventInfo] = useState<string | null>(null);
  const [showBulletins, setShowBulletins] = useState(false);

  useEffect(() => {
    const loadArea = async () => {
      try {
        const location = availableLocations.find(loc => loc.id === areaId);
        if (!location) {
          throw new Error('Zone non trouvée');
        }

        setArea({
          id: location.id,
          name: location.name,
          geometry: { coordinates: location.coordinates }
        });
        
        // Charger les données météo
        const [current, hourly, daily] = await Promise.all([
          getCurrentWeather(location.coordinates[0], location.coordinates[1]),
          getHourlyForecast(location.coordinates[0], location.coordinates[1]),
          getDailyForecast(location.coordinates[0], location.coordinates[1])
        ]);

        setCurrentWeather(current);
        setHourlyData(hourly);
        setForecast(daily);
        setDiseaseRisk(getDiseaseRisk(current.leafWetnessDuration));
      } catch (error) {
        toast.error('Erreur lors du chargement des données');
        navigate('/geolocation');
      } finally {
        setLoading(false);
      }
    };

    loadArea();
  }, [areaId, navigate]);

  const simulateCropCalendar = useCallback(() => {
    if (!currentWeather) {
      console.warn('Données météo non disponibles');
      return;
    }

    try {
      const calendar = generateCropCalendar(selectedCrop, {
        temperature: currentWeather.temperature,
        humidity: currentWeather.humidity,
        rainfall: currentWeather.rainfall,
        leafWetnessDuration: currentWeather.leafWetnessDuration
      });
      
      setCropCalendar(calendar);
    } catch (error) {
      console.error('Erreur de génération du calendrier:', error);
      toast.error('Erreur lors de la génération du calendrier cultural');
    }
  }, [currentWeather, selectedCrop]);

  // Mettre à jour le calendrier quand la culture ou la météo change
  useEffect(() => {
    if (currentWeather && !loading) {
      simulateCropCalendar();
    }
  }, [selectedCrop, currentWeather, loading, simulateCropCalendar]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const getWindDirection = (speed: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    return directions[Math.floor(Math.random() * directions.length)];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-agro-gradient flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  const temperatureOptions = {
    ...defaultChartOptions,
    scales: {
      x: {
        ...defaultChartOptions.scales?.x,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Température (°C)',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        }
      },
      y2: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Humidité (%)',
        },
        grid: {
          drawOnChartArea: false,
          drawBorder: false,
        }
      }
    }
  };

  const rainfallOptions = {
    ...defaultChartOptions,
    scales: {
      x: {
        ...defaultChartOptions.scales?.x,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        }
      },
      y: {
        type: 'linear' as const,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Précipitations (mm)',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-agro-gradient">
      <BulletinsSection isOpen={showBulletins} onClose={() => setShowBulletins(false)} />
      
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-6">
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
                    <Leaf className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">{area?.name}</h1>
                    <p className="text-sm opacity-90">Tableau de bord agrométéorologique</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toast.error('Fonctionnalité en développement')}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                >
                  <Settings className="w-4 h-4" />
                  Paramètres
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Current conditions */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Sun className="w-5 h-5 text-yellow-500" />
                Conditions météorologiques actuelles
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-4 flex flex-col items-center border border-orange-100">
                  <Thermometer className="w-8 h-8 text-red-500 mb-2" />
                  <span className="text-sm text-gray-600">Température</span>
                  <span className="text-2xl font-bold text-gray-800">
                    {currentWeather?.temperature.toFixed(1)}°C
                  </span>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 flex flex-col items-center border border-blue-100">
                  <Droplets className="w-8 h-8 text-blue-500 mb-2" />
                  <span className="text-sm text-gray-600">Humidité</span>
                  <span className="text-2xl font-bold text-gray-800">
                    {currentWeather?.humidity.toFixed(0)}%
                  </span>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-4 flex flex-col items-center border border-gray-200">
                  <Wind className="w-8 h-8 text-gray-500 mb-2" />
                  <span className="text-sm text-gray-600">Vent</span>
                  <span className="text-2xl font-bold text-gray-800">
                    {currentWeather?.windSpeed.toFixed(1)} m/s
                  </span>
                  <span className="text-sm text-gray-500">
                    {getWindDirection(currentWeather?.windSpeed || 0)}
                  </span>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 flex flex-col items-center border border-blue-100">
                  <CloudRain className="w-8 h-8 text-blue-400 mb-2" />
                  <span className="text-sm text-gray-600">Pluie</span>
                  <span className="text-2xl font-bold text-gray-800">
                    {currentWeather?.rainfall.toFixed(1)} mm
                  </span>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4 flex flex-col items-center border border-yellow-100">
                  <Sun className="w-8 h-8 text-yellow-500 mb-2" />
                  <span className="text-sm text-gray-600">Radiation</span>
                  <span className="text-2xl font-bold text-gray-800">
                    {currentWeather?.radiation.toFixed(0)} W/m²
                  </span>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 flex flex-col items-center border border-green-100">
                  <Droplets className="w-8 h-8 text-green-500 mb-2" />
                  <span className="text-sm text-gray-600">Humidité du sol</span>
                  <span className="text-2xl font-bold text-gray-800">
                    {currentWeather?.soilMoisture.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Disease risk */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Risque de maladies
              </h2>
              <div className={`
                p-4 rounded-lg flex items-center gap-3
                ${diseaseRisk === 'low' ? 'bg-green-50 text-green-700' : ''}
                ${diseaseRisk === 'medium' ? 'bg-yellow-50 text-yellow-700' : ''}
                ${diseaseRisk === 'high' ? 'bg-red-50 text-red-700' : ''}
              `}>
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center
                  ${diseaseRisk === 'low' ? 'bg-green-100' : ''}
                  ${diseaseRisk === 'medium' ? 'bg-yellow-100' : ''}
                  ${diseaseRisk === 'high' ? 'bg-red-100' : ''}
                `}>
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    {diseaseRisk === 'low' && 'Risque faible'}
                    {diseaseRisk === 'medium' && 'Risque modéré'}
                    {diseaseRisk === 'high' && 'Risque élevé'}
                  </h3>
                  <p className="text-sm opacity-90">
                    Durée d'humectation des feuilles : {currentWeather?.leafWetnessDuration.toFixed(1)}h
                  </p>
                  <p className="text-sm mt-1">
                    {diseaseRisk === 'low' && 'Conditions peu favorables aux maladies'}
                    {diseaseRisk === 'medium' && 'Surveillance recommandée'}
                    {diseaseRisk === 'high' && 'Intervention conseillée'}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Seuils de risque</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">≤ 3h</span>
                    <span className="text-sm font-medium text-green-600">Risque faible</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">4-6h</span>
                    <span className="text-sm font-medium text-yellow-600">Risque modéré</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">≥ 7h</span>
                    <span className="text-sm font-medium text-red-600">Risque élevé</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add Bulletin Section */}
          <div className="col-span-12">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-500" />
                    Bulletin Agrométéorologique
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Consultez les bulletins décadaires pour suivre l'évolution des conditions agrométéorologiques
                  </p>
                </div>
                <button
                  onClick={() => setShowBulletins(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Consulter les bulletins
                </button>
              </div>
            </div>
          </div>

          {/* Crop calendar */}
          <div className="col-span-12">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-500" />
                  Calendrier cultural
                </h2>
                <div className="flex gap-2">
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-sm"
                  >
                    <option value="anacarde">Anacarde</option>
                    <option value="mangue">Mangue</option>
                  </select>
                  <button
                    onClick={() => toast.error('Fonctionnalité en développement')}
                    className="px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Configurer
                  </button>
                </div>
              </div>

              {cropCalendar && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-800">Progression du cycle</h3>
                      <span className="text-sm text-gray-600">{cropCalendar.progress.toFixed(0)}%</span>
                    </div>
                    <div className="relative pt-4">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                        <div
                          style={{ width: `${cropCalendar.progress}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 7 }, (_, i) => {
                      const date = addDays(selectedDate, i);
                      const events = cropCalendar.events.filter(e => isSameDay(e.date, date));
                      
                      return (
                        <div
                          key={i}
                          className={`
                            p-3 rounded-lg border transition-all
                            ${events.length > 0 ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}
                          `}
                        >
                          <div className="text-sm font-medium text-gray-600 mb-1">
                            {format(date, 'EEE d MMM', { locale: fr })}
                          </div>
                          {events.map((event, index) => (
                            <div
                              key={index}
                              className="relative"
                              onMouseEnter={() => setShowEventInfo(`${date}-${index}`)}
                              onMouseLeave={() => setShowEventInfo(null)}
                            >
                              <div className="flex items-center gap-1 text-sm">
                                <div className={`
                                  w-2 h-2 rounded-full
                                  ${event.type === 'planting' ? 'bg-green-500' : ''}
                                  ${event.type === 'fertilization' ? 'bg-blue-500' : ''}
                                  ${event.type === 'irrigation' ? 'bg-cyan-500' : ''}
                                  ${event.type === 'harvest' ? 'bg-yellow-500' : ''}
                                  ${event.type === 'treatment' ? 'bg-purple-500' : ''}
                                `} />
                                <span className="truncate">{event.title}</span>
                              </div>
                              {showEventInfo === `${date}-${index}` && (
                                <div className="absolute z-10 left-0 top-full mt-2 w-48 p-3 bg-white rounded-lg shadow-lg border border-gray-200">
                                  <h4 className="font-medium text-gray-800 mb-1">{event.title}</h4>
                                  <p className="text-sm text-gray-600">{event.description}</p>
                                  <div className="mt-2 pt-2 border-t border-gray-100">
                                    <span className={`text-sm ${event.completed ? 'text-green-600' : 'text-gray-500'}`}>
                                      {event.completed ? 'Terminé' : 'À faire'}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-5 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-sm text-gray-600">Plantation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-sm text-gray-600">Fertilisation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-cyan-500" />
                      <span className="text-sm text-gray-600">Irrigation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span className="text-sm text-gray-600">Récolte</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      <span className="text-sm text-gray-600">Traitement</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Weather Forecast Visualization */}
          <div className="col-span-12">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-blue-500" />
                  Prévisions sur 7 jours
                </h2>
                <button
                  onClick={() => toast.error('Fonctionnalité en développement')}
                  className="px-3 py-1.5 text-sm bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Exporter
                </button>
              </div>

              <div className="space-y-6">
                {/* Temperature and Humidity Chart */}
                <div className="h-[300px]">
                  <Line
                    data={{
                      labels: forecast.map(f => format(f.date, 'EEE d MMM', { locale: fr })),
                      datasets: [
                        {
                          label: 'Température (°C)',
                          data: forecast.map(f => f.temperature),
                          borderColor: 'rgb(239, 68, 68)',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          tension: 0.4,
                          fill: true,
                          yAxisID: 'y1',
                        },
                        {
                          label: 'Humidité (%)',
                          data: forecast.map(f => f.humidity),
                          borderColor: 'rgb(59, 130, 246)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          tension: 0.4,
                          fill: true,
                          yAxisID: 'y2',
                        }
                      ],
                    }}
                    options={temperatureOptions}
                  />
                </div>

                {/* Rainfall Chart */}
                <div className="h-[200px]">
                  <Line
                    data={{
                      labels: forecast.map(f => format(f.date, 'EEE d MMM', { locale: fr })),
                      datasets: [
                        {
                          label: 'Précipitations (mm)',
                          data: forecast.map(f => f.rainfall),
                          borderColor: 'rgb(147, 197, 253)',
                          backgroundColor: 'rgba(147, 197, 253, 0.2)',
                          tension: 0.4,
                          fill: true,
                        }
                      ]
                    }}
                    options={rainfallOptions}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}