export interface Location {
  id: string;
  name: string;
  coordinates: [number, number];
  description: string;
  crops: {
    name: string;
    description: string;
  }[];
}

// Localités disponibles pour le service
export const availableLocations: Location[] = [
  {
    id: 'korhogo-1',
    name: 'Korhogo',
    coordinates: [9.458, -5.629],
    description: 'Principale ville du nord de la Côte d\'Ivoire, connue pour sa production d\'anacarde et de mangue.',
    crops: [
      {
        name: 'Anacarde',
        description: 'Culture principale de la région, adaptée au climat local avec une excellente production.'
      },
      {
        name: 'Mangue',
        description: 'Variétés Kent et Keitt principalement, exportées vers l\'Europe.'
      }
    ]
  }
];

// Coordonnées des principales villes de Côte d'Ivoire pour la recherche
export const citiesCoordinates: { [key: string]: [number, number] } = {
  'abidjan': [5.359952, -4.008256],
  'bouake': [7.683333, -5.033333],
  'daloa': [6.889167, -6.450278],
  'yamoussoukro': [6.827623, -5.289343],
  'korhogo': [9.458, -5.629],
  'san-pedro': [4.748056, -6.636944],
  'divo': [5.839167, -5.360278],
  'man': [7.412722, -7.552889],
  'gagnoa': [6.133333, -5.883333],
  'abengourou': [6.729682, -3.496333],
  'odienne': [9.516667, -7.566667],
  'seguela': [7.950000, -6.666667],
  'bondoukou': [8.033333, -2.800000],
  'ferkessedougou': [9.600000, -5.200000],
  'soubre': [5.783333, -6.600000]
};