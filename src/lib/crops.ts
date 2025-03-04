import { addDays } from 'date-fns';

export interface CropEvent {
  date: Date;
  title: string;
  description: string;
  type: 'planting' | 'fertilization' | 'irrigation' | 'harvest' | 'treatment';
  completed: boolean;
}

export interface CropCalendar {
  crop: string;
  events: CropEvent[];
  progress: number;
}

export interface Crop {
  id: string;
  name: string;
  description: string;
  conditions: {
    temperature: {
      min: number;
      max: number;
      optimal: number;
    };
    humidity: {
      min: number;
      max: number;
      optimal: number;
    };
    rainfall: {
      min: number;
      max: number;
      optimal: number;
    };
    leafWetness: {
      riskThreshold: number;
    };
  };
  calendar: {
    fertilization: {
      frequency: number; // en jours
      description: string;
    };
    irrigation: {
      frequency: number; // en jours
      description: string;
    };
    treatment: {
      frequency: number; // en jours
      description: string;
    };
  };
}

export const crops: Record<string, Crop> = {
  anacarde: {
    id: 'anacarde',
    name: 'Anacarde',
    description: 'Culture principale de la région, adaptée au climat local',
    conditions: {
      temperature: {
        min: 20,
        max: 35,
        optimal: 28
      },
      humidity: {
        min: 40,
        max: 80,
        optimal: 65
      },
      rainfall: {
        min: 15,
        max: 50,
        optimal: 30
      },
      leafWetness: {
        riskThreshold: 6
      }
    },
    calendar: {
      fertilization: {
        frequency: 90,
        description: 'Application d\'engrais NPK'
      },
      irrigation: {
        frequency: 14,
        description: 'Irrigation en période sèche'
      },
      treatment: {
        frequency: 30,
        description: 'Traitement phytosanitaire préventif'
      }
    }
  },
  mangue: {
    id: 'mangue',
    name: 'Mangue',
    description: 'Variétés Kent et Keitt principalement',
    conditions: {
      temperature: {
        min: 22,
        max: 38,
        optimal: 30
      },
      humidity: {
        min: 45,
        max: 85,
        optimal: 70
      },
      rainfall: {
        min: 20,
        max: 60,
        optimal: 35
      },
      leafWetness: {
        riskThreshold: 5
      }
    },
    calendar: {
      fertilization: {
        frequency: 120,
        description: 'Application d\'engrais composé'
      },
      irrigation: {
        frequency: 10,
        description: 'Irrigation régulière'
      },
      treatment: {
        frequency: 21,
        description: 'Traitement contre l\'anthracnose'
      }
    }
  }
};

export function generateCropCalendar(
  crop: string,
  currentWeather: {
    temperature: number;
    humidity: number;
    rainfall: number;
    leafWetnessDuration: number;
  }
): CropCalendar {
  // Vérification des paramètres
  if (!crop || !currentWeather) {
    throw new Error('Paramètres invalides pour la génération du calendrier');
  }

  const cropData = crops[crop];
  if (!cropData) {
    throw new Error(`Culture non trouvée: ${crop}`);
  }

  const today = new Date();
  const events: CropEvent[] = [];

  try {
    // Vérifier les conditions météorologiques
    const needsIrrigation = currentWeather.rainfall < cropData.conditions.rainfall.min;
    const diseaseRisk = currentWeather.leafWetnessDuration > cropData.conditions.leafWetness.riskThreshold;
    const stressConditions = 
      currentWeather.temperature > cropData.conditions.temperature.max ||
      currentWeather.temperature < cropData.conditions.temperature.min ||
      currentWeather.humidity > cropData.conditions.humidity.max ||
      currentWeather.humidity < cropData.conditions.humidity.min;

    // Ajouter les événements en fonction des conditions
    if (needsIrrigation) {
      events.push({
        date: today,
        title: 'Irrigation nécessaire',
        description: `Précipitations insuffisantes (${currentWeather.rainfall.toFixed(1)}mm). Irrigation recommandée pour maintenir l'humidité optimale.`,
        type: 'irrigation',
        completed: false
      });
    }

    if (diseaseRisk) {
      events.push({
        date: today,
        title: 'Traitement préventif recommandé',
        description: `Durée d'humectation élevée (${currentWeather.leafWetnessDuration.toFixed(1)}h). Risque de maladies fongiques.`,
        type: 'treatment',
        completed: false
      });
    }

    if (stressConditions) {
      const stressFactors = [];
      if (currentWeather.temperature > cropData.conditions.temperature.max) {
        stressFactors.push('température élevée');
      }
      if (currentWeather.temperature < cropData.conditions.temperature.min) {
        stressFactors.push('température basse');
      }
      if (currentWeather.humidity > cropData.conditions.humidity.max) {
        stressFactors.push('humidité élevée');
      }
      if (currentWeather.humidity < cropData.conditions.humidity.min) {
        stressFactors.push('humidité basse');
      }

      events.push({
        date: today,
        title: 'Conditions de stress',
        description: `Attention: ${stressFactors.join(', ')}. Surveillance accrue recommandée.`,
        type: 'treatment',
        completed: false
      });
    }

    // Ajouter les événements de fertilisation planifiés
    const nextFertilization = addDays(today, cropData.calendar.fertilization.frequency);
    events.push({
      date: nextFertilization,
      title: 'Fertilisation planifiée',
      description: `${cropData.calendar.fertilization.description} pour ${cropData.name}`,
      type: 'fertilization',
      completed: false
    });

    // Ajouter les événements spécifiques à la culture
    if (crop === 'anacarde') {
      // Période de récolte pour l'anacarde (février-avril)
      const isHarvestSeason = today.getMonth() >= 1 && today.getMonth() <= 3;
      if (isHarvestSeason) {
        events.push({
          date: today,
          title: 'Période de récolte',
          description: 'Période optimale pour la récolte des noix d\'anacarde',
          type: 'harvest',
          completed: false
        });
      }
    } else if (crop === 'mangue') {
      // Période de récolte pour la mangue (mars-mai)
      const isHarvestSeason = today.getMonth() >= 2 && today.getMonth() <= 4;
      if (isHarvestSeason) {
        events.push({
          date: today,
          title: 'Période de récolte',
          description: 'Période optimale pour la récolte des mangues',
          type: 'harvest',
          completed: false
        });
      }
    }

    // Calculer la progression
    const completedEvents = events.filter(e => e.completed).length;
    const progress = events.length > 0 ? (completedEvents / events.length) * 100 : 0;

    return {
      crop,
      events,
      progress
    };
  } catch (error) {
    console.error('Erreur lors de la génération du calendrier:', error);
    throw new Error('Erreur lors de la génération du calendrier cultural');
  }
}