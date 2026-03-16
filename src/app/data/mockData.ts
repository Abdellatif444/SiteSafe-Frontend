// src/app/data/mockData.ts

// ─── 1. Cameras & Zones ────────────────────────────────────────────────────────
export type CameraStatus = 'active' | 'maintenance';

export interface Camera {
  id: number;
  name: string;
  location: string;
  orientation: string;
  status: CameraStatus;
  fps: number;
  image: string;
  coords: [number, number]; // [lat, lng]
  detections: { workers: number; helmets: number; vests: number; vehicles: number };
}

export const mockCameras: Camera[] = [
  {
    id: 1, name: 'CAM-01', location: 'Zone A - Entrée Nord', orientation: 'Nord-Est (45°)', status: 'active',
    fps: 30, image: 'https://images.unsplash.com/photo-1723367194881-fe2e53534170?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    coords: [33.5801, -7.5858],
    detections: { workers: 8, helmets: 8, vests: 7, vehicles: 2 },
  },
  {
    id: 2, name: 'CAM-02', location: 'Zone B - Zone Centrale', orientation: 'Sud (180°)', status: 'active',
    fps: 30, image: 'https://images.unsplash.com/photo-1694521787162-5373b598945c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    coords: [33.5760, -7.5910],
    detections: { workers: 5, helmets: 5, vests: 5, vehicles: 1 },
  },
  {
    id: 3, name: 'CAM-03', location: "Zone C - Zone d'Équipement", orientation: 'Ouest (270°)', status: 'active',
    fps: 25, image: 'https://images.unsplash.com/photo-1649034872337-feaa751786ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    coords: [33.5720, -7.5965],
    detections: { workers: 3, helmets: 3, vests: 3, vehicles: 4 },
  },
  {
    id: 4, name: 'CAM-04', location: 'Zone D - Périmètre Sud', orientation: 'Est (90°)', status: 'active',
    fps: 30, image: 'https://images.unsplash.com/photo-1666137270524-5131ac07314d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    coords: [33.5680, -7.5900],
    detections: { workers: 12, helmets: 11, vests: 12, vehicles: 3 },
  },
  {
    id: 5, name: 'CAM-05', location: 'Zone A - Côté Ouest', orientation: 'Nord (0°)', status: 'maintenance',
    fps: 0, image: 'https://images.unsplash.com/photo-1723367194881-fe2e53534170?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    coords: [33.5795, -7.5930],
    detections: { workers: 0, helmets: 0, vests: 0, vehicles: 0 },
  },
  {
    id: 6, name: 'CAM-06', location: 'Zone B - Porte Est', orientation: 'Sud-Ouest (225°)', status: 'active',
    fps: 30, image: 'https://images.unsplash.com/photo-1694521787162-5373b598945c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    coords: [33.5745, -7.5875],
    detections: { workers: 6, helmets: 6, vests: 6, vehicles: 2 },
  },
];

// ─── 2. Alerts ─────────────────────────────────────────────────────────────
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'active' | 'in-progress' | 'resolved';

export interface AlertData {
  id: number;
  type: string;
  camera: string;
  zone: string;
  severity: AlertSeverity;
  status: AlertStatus;
  time: string;
  date: string;
  description: string;
  image: string;
  isNew: boolean;
  assignedTo?: string;
}

export const mockAlerts: AlertData[] = [
  { 
    id: 1, type: 'Gilet de Sécurité Manquant', camera: 'CAM-01', zone: mockCameras[0].location, 
    severity: 'high', status: 'active', time: '10:23:45 AM', date: '2026-03-09',
    description: 'Ouvrier détecté sans gilet de sécurité dans une zone EPI obligatoire',
    image: mockCameras[0].image,
    isNew: true
  },
  { 
    id: 2, type: 'Distance Dangereuse avec les Engins', camera: 'CAM-03', zone: mockCameras[2].location, 
    severity: 'critical', status: 'in-progress', time: '10:15:32 AM', date: '2026-03-09',
    description: "Ouvrier à moins de 3 mètres d'une pelleteuse active",
    image: mockCameras[2].image,
    isNew: false, assignedTo: 'Alex Johnson'
  },
  { 
    id: 3, type: 'Casque de Sécurité Manquant', camera: 'CAM-04', zone: mockCameras[3].location, 
    severity: 'critical', status: 'active', time: '09:47:18 AM', date: '2026-03-09',
    description: 'Ouvrier détecté sans casque de sécurité dans la zone d\'opération',
    image: mockCameras[3].image,
    isNew: true
  },
  { 
    id: 4, type: 'Comportement Risqué en Zone de Levage', camera: 'CAM-06', zone: mockCameras[5].location, 
    severity: 'medium', status: 'active', time: '08:55:12 AM', date: '2026-03-09',
    description: 'Mouvement rapide identifié sous une charge suspendue (Grue)',
    image: mockCameras[5].image,
    isNew: false
  },
];

// ─── 3. Incidents ────────────────────────────────────────────────────────────
export type IncidentStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type IncidentPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Incident {
  id: string; title: string; violationType: string;
  priority: IncidentPriority; status: IncidentStatus;
  createdDate: string; updatedDate: string; location: string;
  assignedTo: string | null; company: string; companyInitials: string;
  companyColor: string; reporter: string; description: string;
  deadline: string; images: string[];
}

export const mockIncidents: Incident[] = [
  {
    id: 'INC-001', title: 'Casque de Sécurité Manquant en Zone D', violationType: 'Violation EPI',
    priority: 'critical', status: 'in-progress', createdDate: '2026-03-09 09:47:18', updatedDate: '2026-03-09 10:35:12',
    location: mockCameras[3].location, assignedTo: 'Responsable Sécurité John',
    company: 'BuildCorp', companyInitials: 'BU', companyColor: 'bg-blue-500',
    reporter: 'Système de Détection IA (CAM-04)', deadline: 'Oct 24, 2026',
    description: 'Ouvrier détecté sans casque de sécurité obligatoire dans une zone exigeant des EPI. Action immédiate requise.',
    images: [mockCameras[3].image],
  },
  {
    id: 'INC-002', title: 'Distance Dangereuse par Rapport aux Engins Lourds', violationType: 'Violation de Distance',
    priority: 'critical', status: 'open', createdDate: '2026-03-09 10:15:32', updatedDate: '2026-03-09 10:15:32',
    location: mockCameras[2].location, assignedTo: null,
    company: 'ConstructCo', companyInitials: 'CO', companyColor: 'bg-indigo-500',
    reporter: 'Système de Détection IA (CAM-03)', deadline: 'Oct 25, 2026',
    description: "Ouvrier à moins de 3 mètres d'une pelleteuse en activité. La distance de sécurité minimale est de 5 mètres selon la réglementation HSE.",
    images: [mockCameras[2].image],
  },
  {
    id: 'INC-003', title: 'Gilet de Sécurité Manquant dans la Zone de Travail', violationType: 'Violation EPI',
    priority: 'high', status: 'resolved', createdDate: '2026-03-09 10:23:45', updatedDate: '2026-03-09 10:50:20',
    location: mockCameras[0].location, assignedTo: 'Chef de Chantier Sarah',
    company: 'SafetyFirst Ltd', companyInitials: 'SA', companyColor: 'bg-emerald-500',
    reporter: 'Système de Détection IA (CAM-01)', deadline: 'Oct 22, 2026',
    description: "Ouvrier sans gilet à haute visibilité dans une zone active. Problème résolu, l'ouvrier a été équipé de l'EPI approprié.",
    images: [mockCameras[0].image],
  },
];

// ─── 4. Drones & Missions ────────────────────────────────────────────────────
export type MissionStatus = 'completed' | 'in-progress' | 'scheduled' | 'cancelled';

export interface Mission {
  id: number;
  name: string;
  zone: string;
  date: string;
  time: string;
  status: MissionStatus;
  duration: string;
  drone: string;
  images: number;
  anomalies: number;
  flightPath: string;
}

export const mockDroneMissions: Mission[] = [
  {
    id: 1, name: 'Inspection de Sécurité Matinale', zone: mockCameras[0].location,
    date: '2026-03-09', time: '08:00 AM', status: 'completed', duration: '45 min', drone: 'DRONE-01',
    images: 247, anomalies: 1, flightPath: 'Balayage du périmètre avec focus sur l\'entrée nord',
  },
  {
    id: 2, name: 'Vérification Périmètre Suspendue', zone: mockCameras[4].location,
    date: '2026-03-09', time: '10:30 AM', status: 'cancelled', duration: '30 min', drone: 'DRONE-02',
    images: 0, anomalies: 0, flightPath: 'Zone en maintenance, inspection annulée',
  },
  {
    id: 3, name: 'Analyse des Mouvements de Véhicules', zone: mockCameras[2].location,
    date: '2026-03-09', time: '02:00 PM', status: 'scheduled', duration: '60 min', drone: 'DRONE-01',
    images: 0, anomalies: 0, flightPath: 'Trajet linéaire le long des voies de circulation des véhicules',
  },
];

export const mockDroneAnomalies = [
  {
    id: 1, type: 'Ouvrier Trop Près de la Machine', location: mockCameras[2].location, timestamp: '10:42 AM', severity: 'Élevé',
    image: mockCameras[2].image,
  },
];
