import { addDays, addHours } from 'date-fns';

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
  icon: string;
  probability: number;
}

// Fonction pour calculer la durée d'humectation des feuilles
function calculateLeafWetnessDuration(hourlyHumidity: number[]): number {
  let consecutiveHours = 0;
  let maxConsecutiveHours = 0;
  
  for (const humidity of hourlyHumidity) {
    if (humidity >= 90) {
      consecutiveHours++;
      maxConsecutiveHours = Math.max(maxConsecutiveHours, consecutiveHours);
    } else {
      consecutiveHours = 0;
    }
  }
  
  return maxConsecutiveHours;
}

// Fonction utilitaire pour convertir les codes météo WMO en descriptions et icônes
function getWeatherDescription(code: number): { description: string; icon: string } {
  // Codes WMO: https://open-meteo.com/en/docs
  switch (true) {
    case code === 0:
      return { description: 'Ensoleillé', icon: 'sunny' };
    case code === 1:
    case code === 2:
    case code === 3:
      return { description: 'Partiellement nuageux', icon: 'cloudy' };
    case code >= 51 && code <= 67:
      return { description: 'Bruine', icon: 'drizzle' };
    case code >= 71 && code <= 77:
      return { description: 'Neige', icon: 'cloudy' };
    case code >= 80 && code <= 82:
      return { description: 'Averses', icon: 'rainy' };
    case code >= 95 && code <= 99:
      return { description: 'Orage', icon: 'stormy' };
    default:
      return { description: 'Nuageux', icon: 'cloudy' };
  }
}

export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
  try {
    // Récupérer les données horaires pour calculer la durée d'humectation
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=relative_humidity_2m&current=temperature_2m,relative_humidity_2m,wind_speed_10m,rain,surface_pressure,soil_moisture_0_to_1cm,direct_radiation&timezone=auto`
    );
    
    const data = await response.json();
    const current = data.current;
    
    // Récupérer les 24 dernières heures d'humidité
    const hourlyHumidity = data.hourly.relative_humidity_2m.slice(0, 24);
    const leafWetnessDuration = calculateLeafWetnessDuration(hourlyHumidity);

    return {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      rainfall: current.rain,
      radiation: current.direct_radiation,
      soilMoisture: current.soil_moisture_0_to_1cm * 100, // Convertir en pourcentage
      leafWetnessDuration
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des données météo actuelles:', error);
    throw error;
  }
}

export async function getHourlyForecast(lat: number, lon: number) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,rain,wind_speed_10m&timezone=auto`
    );
    
    const data = await response.json();
    const now = new Date();
    
    return data.hourly.time.slice(0, 24).map((time: string, index: number) => ({
      hour: addHours(now, index),
      temperature: data.hourly.temperature_2m[index],
      humidity: data.hourly.relative_humidity_2m[index],
      rainfall: data.hourly.rain[index],
      windSpeed: data.hourly.wind_speed_10m[index]
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des prévisions horaires:', error);
    throw error;
  }
}

export async function getDailyForecast(lat: number, lon: number): Promise<Forecast[]> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,wind_speed_10m_max,precipitation_probability_max,precipitation_sum,weather_code&timezone=auto`
    );
    
    const data = await response.json();
    
    return data.daily.time.map((time: string, index: number) => {
      const weatherCode = data.daily.weather_code[index];
      const { description, icon } = getWeatherDescription(weatherCode);
      
      return {
        date: new Date(time),
        temperature: (data.daily.temperature_2m_max[index] + data.daily.temperature_2m_min[index]) / 2,
        humidity: data.daily.relative_humidity_2m_max[index],
        windSpeed: data.daily.wind_speed_10m_max[index],
        rainfall: data.daily.precipitation_sum[index],
        description,
        icon,
        probability: data.daily.precipitation_probability_max[index]
      };
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des prévisions quotidiennes:', error);
    throw error;
  }
}

export type { WeatherData, Forecast };