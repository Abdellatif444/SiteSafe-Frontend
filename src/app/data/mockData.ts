// src/app/data/mockData.ts

// ─── Dynamic Dates Helpers ────────────────────────────────────────────────────
const today = new Date();
const formatDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const d2 = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${d2}`;
};
export const TODAY_STR = formatDate(today);

const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
export const YESTERDAY_STR = formatDate(yesterday);

const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
export const TOMORROW_STR = formatDate(tomorrow);

const nextDay = new Date(today);
nextDay.setDate(nextDay.getDate() + 2);
export const NEXT_DAY_STR = formatDate(nextDay);

// ─── 1. Cameras & Zones ────────────────────────────────────────────────────────
export type CameraStatus = 'active' | 'maintenance';

export interface Camera {
  id: string; name: string; location: string; status: CameraStatus;
  fps: number; image: string; coords: [number, number]; orientation?: number;
  ipAddress: string; streamUrl: string;
  detections: { workers: number; helmets: number; vests: number; vehicles: number };
}

export const mockCameras: Camera[] = [
  {
    id: 'CAM-01', name: 'CAM-01', location: 'Zone A - Entrée Nord', orientation: 45, status: 'active',
    fps: 30, image: 'https://images.unsplash.com/photo-1723367194881-fe2e53534170?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    coords: [33.5801, -7.5858],
    ipAddress: '192.168.1.100', streamUrl: 'rtsp://192.168.1.100/stream0',
    detections: { workers: 8, helmets: 8, vests: 7, vehicles: 2 },
  },
  {
    id: 'CAM-02', name: 'CAM-02', location: 'Zone B - Zone Centrale', orientation: 45, status: 'active',
    fps: 30,
    image: 'https://images.unsplash.com/photo-1541888056456-cc5faeb9d96c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    coords: [33.5760, -7.5900],
    ipAddress: '192.168.1.101', streamUrl: 'rtsp://192.168.1.101/stream1',
    detections: { workers: 8, helmets: 8, vests: 7, vehicles: 2 },
  },
  {
    id: 'CAM-03', name: 'CAM-03', location: "Zone C - Zone d'Équipement", orientation: 210, status: 'active',
    fps: 30,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    coords: [33.5770, -7.5910],
    ipAddress: '192.168.1.103', streamUrl: 'rtsp://192.168.1.103/stream3',
    detections: { workers: 3, helmets: 3, vests: 3, vehicles: 4 },
  },
  {
    id: 'CAM-04', name: 'CAM-04', location: 'Zone D - Périmètre Sud', orientation: 315, status: 'active',
    fps: 60,
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    coords: [33.5755, -7.5885],
    ipAddress: '192.168.2.201', streamUrl: 'rtsp://192.168.2.201/stream_hd',
    detections: { workers: 12, helmets: 11, vests: 12, vehicles: 3 },
  },
  {
    id: 'CAM-05', name: 'CAM-05', location: 'Zone A - Côté Ouest', orientation: 90, status: 'maintenance',
    fps: 0,
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    coords: [33.5780, -7.5920],
    ipAddress: '192.168.2.202', streamUrl: 'offline',
    detections: { workers: 0, helmets: 0, vests: 0, vehicles: 0 },
  },
  {
    id: 'CAM-06', name: 'CAM-06', location: 'Zone B - Porte Est', orientation: 0, status: 'active',
    fps: 30,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    coords: [33.5745, -7.5915],
    ipAddress: '192.168.3.15', streamUrl: 'rtsp://192.168.3.15/stream_grue',
    detections: { workers: 6, helmets: 6, vests: 6, vehicles: 2 },
  },
];

// Helper: get coords from camera name (used in RealTimeAlerts)
export function getCameraCoords(cameraName: string): { lat: number; lng: number } {
  const cam = mockCameras.find(c => c.name === cameraName);
  return cam ? { lat: cam.coords[0], lng: cam.coords[1] } : { lat: 33.5760, lng: -7.5900 };
}

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
  time: string;         // HH:MM:SS AM/PM
  date: string;         // YYYY-MM-DD
  description: string;
  image: string;
  isNew: boolean;
  assignedTo?: string;
}

export const mockAlerts: AlertData[] = [
  {
    id: 1, type: 'Gilet de Sécurité Manquant', camera: 'CAM-01', zone: mockCameras[0].location,
    severity: 'high', status: 'active', time: '10:23:45 AM', date: TODAY_STR,
    description: 'Ouvrier détecté sans gilet de sécurité dans une zone EPI obligatoire',
    image: mockCameras[0].image,
    isNew: true,
  },
  {
    id: 2, type: 'Distance Dangereuse avec les Engins', camera: 'CAM-03', zone: mockCameras[2].location,
    severity: 'critical', status: 'in-progress', time: '10:15:32 AM', date: TODAY_STR,
    description: "Ouvrier à moins de 3 mètres d'une pelleteuse active",
    image: mockCameras[2].image,
    isNew: false, assignedTo: 'Alex Johnson',
  },
  {
    id: 3, type: 'Casque de Sécurité Manquant', camera: 'CAM-04', zone: mockCameras[3].location,
    severity: 'critical', status: 'active', time: '09:47:18 AM', date: TODAY_STR,
    description: "Ouvrier détecté sans casque de sécurité dans la zone d'opération",
    image: mockCameras[3].image,
    isNew: true,
  },
  {
    id: 4, type: 'Comportement Risqué en Zone de Levage', camera: 'CAM-06', zone: mockCameras[5].location,
    severity: 'medium', status: 'active', time: '08:55:12 AM', date: TODAY_STR,
    description: 'Mouvement rapide identifié sous une charge suspendue (Grue)',
    image: mockCameras[5].image,
    isNew: false,
  },
  // ── Alertes résolues (historique) ──
  {
    id: 5, type: 'Casque de Sécurité Manquant', camera: 'CAM-01', zone: mockCameras[0].location,
    severity: 'high', status: 'resolved', time: '08:15:00 AM', date: TODAY_STR,
    description: "Ouvrier sans casque détecté à l'entrée nord — situation résolue après intervention",
    image: mockCameras[0].image,
    isNew: false, assignedTo: 'Chef de Chantier Sarah',
  },
  {
    id: 6, type: 'Zone Interdite Franchie', camera: 'CAM-04', zone: mockCameras[3].location,
    severity: 'critical', status: 'resolved', time: '15:42:00 PM', date: YESTERDAY_STR,
    description: "Intrusion détectée dans la zone de sécurité restreinte du périmètre sud",
    image: mockCameras[3].image,
    isNew: false, assignedTo: 'Responsable Sécurité John',
  },
  // ── Violation de zone ACTIVE (pour démonstration du panneau CRITIQUE) ──
  {
    id: 7, type: 'Zone Interdite Franchie', camera: 'CAM-01', zone: mockCameras[0].location,
    severity: 'critical', status: 'active', time: '10:22:05 AM', date: TODAY_STR,
    description: "Intrusion active détectée à l'entrée nord — zone de sécurité opérateurs uniquement",
    image: mockCameras[0].image,
    isNew: true,
  },
];

// ─── 3. Incidents ────────────────────────────────────────────────────────────
export type IncidentStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type IncidentPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Incident {
  id: string; title: string; violationType: string;
  priority: IncidentPriority; status: IncidentStatus;
  createdDate: string; updatedDate: string; location: string;
  assignedTo: string | null; company: string;
  reporter: string; description: string;
  deadline: string; images: string[];
}

export const mockIncidents: Incident[] = [
  {
    id: 'INC-001', title: 'Casque de Sécurité Manquant en Zone D', violationType: 'Violation EPI',
    priority: 'critical', status: 'in-progress', createdDate: `${TODAY_STR} 09:47:18`, updatedDate: `${TODAY_STR} 10:35:12`,
    location: mockCameras[3].location, assignedTo: 'Responsable Sécurité John',
    company: 'BuildCorp',
    reporter: 'Système de Détection IA (CAM-04)', deadline: NEXT_DAY_STR,
    description: 'Ouvrier détecté sans casque de sécurité obligatoire dans une zone exigeant des EPI. Action immédiate requise.',
    images: [mockCameras[3].image],
  },
  {
    id: 'INC-002', title: 'Distance Dangereuse par Rapport aux Engins Lourds', violationType: 'Violation de Distance',
    priority: 'critical', status: 'open', createdDate: `${TODAY_STR} 10:15:32`, updatedDate: `${TODAY_STR} 10:15:32`,
    location: mockCameras[2].location, assignedTo: null,
    company: 'ConstructCo',
    reporter: 'Système de Détection IA (CAM-03)', deadline: TOMORROW_STR,
    description: "Ouvrier à moins de 3 mètres d'une pelleteuse en activité. La distance de sécurité minimale est de 5 mètres selon la réglementation HSE.",
    images: [mockCameras[2].image],
  },
  {
    id: 'INC-003', title: 'Gilet de Sécurité Manquant dans la Zone de Travail', violationType: 'Violation EPI',
    priority: 'high', status: 'resolved', createdDate: `${TODAY_STR} 10:23:45`, updatedDate: `${TODAY_STR} 10:50:20`,
    location: mockCameras[0].location, assignedTo: 'Chef de Chantier Sarah',
    company: 'SafetyFirst Ltd',
    reporter: 'Système de Détection IA (CAM-01)', deadline: TODAY_STR,
    description: "Ouvrier sans gilet à haute visibilité dans une zone active. Problème résolu, l'ouvrier a été équipé de l'EPI approprié.",
    images: [mockCameras[0].image],
  },
  {
    id: 'INC-004', title: 'Zone Interdite Franchie (Périmètre Sud)', violationType: 'Intrusion Restreinte',
    priority: 'critical', status: 'closed', createdDate: `${YESTERDAY_STR} 15:42:00`, updatedDate: `${YESTERDAY_STR} 18:30:00`,
    location: mockCameras[3].location, assignedTo: 'Responsable Sécurité John',
    company: 'SecureAccess',
    reporter: 'Système de Détection IA (CAM-04)', deadline: YESTERDAY_STR,
    description: "Intrusion détectée dans la zone de sécurité restreinte. Agent de sécurité dépêché sur place. Rapport complété et incident fermé.",
    images: [mockCameras[3].image],
  },
  {
    id: 'INC-005', title: 'Travail en Hauteur Non Sécurisé', violationType: 'Violation EPI (Harnais)',
    priority: 'critical', status: 'closed', createdDate: `${YESTERDAY_STR} 08:10:00`, updatedDate: `${YESTERDAY_STR} 11:20:00`,
    location: mockCameras[1].location, assignedTo: 'Superviseur HSE Mike',
    company: 'BuildCorp',
    reporter: 'Inspection Manuelle', deadline: YESTERDAY_STR,
    description: "Travail en hauteur sans harnais attaché. Intervention immédiate, formation sécuritaire rappelée à l'équipe. Clos.",
    images: [mockCameras[1].image],
  }
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
    date: TODAY_STR, time: '08:00 AM', status: 'completed', duration: '45 min', drone: 'DRONE-01',
    images: 247, anomalies: 1, flightPath: "Balayage du périmètre avec focus sur l'entrée nord",
  },
  {
    id: 2, name: 'Vérification Périmètre Zone A Ouest', zone: mockCameras[4].location,
    // Mission planifiée pour couvrir CAM-05 (en maintenance) — logique métier cohérente
    date: TODAY_STR, time: '10:30 AM', status: 'cancelled', duration: '30 min', drone: 'DRONE-02',
    images: 0, anomalies: 0, flightPath: 'Zone partiellement couverte malgré caméra en maintenance — inspection annulée',
  },
  {
    id: 3, name: 'Analyse des Mouvements de Véhicules', zone: mockCameras[2].location,
    date: TODAY_STR, time: '14:00 PM', status: 'scheduled', duration: '60 min', drone: 'DRONE-01',
    images: 0, anomalies: 0, flightPath: 'Trajet linéaire le long des voies de circulation des véhicules',
  },
  {
    id: 4, name: 'Suivi Avancement Chantier — Périmètre Complet', zone: 'Toutes Zones',
    date: TOMORROW_STR, time: '07:30 AM', status: 'scheduled', duration: '90 min', drone: 'DRONE-01',
    images: 0, anomalies: 0, flightPath: 'Couverture complète du chantier pour évaluation avancement',
  },
];

export const mockDroneAnomalies = [
  {
    id: 1, type: 'Ouvrier Trop Près de la Machine', location: mockCameras[2].location, timestamp: '10:42 AM', severity: 'Élevé',
    image: mockCameras[2].image,
  },
  {
    id: 2, type: 'Zone Non Conforme au Planning', location: mockCameras[0].location, timestamp: '08:28 AM', severity: 'Moyen',
    image: mockCameras[0].image,
  },
];
