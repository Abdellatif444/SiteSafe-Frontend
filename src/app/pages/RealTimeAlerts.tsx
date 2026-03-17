import { useState, useEffect } from 'react';
import {
  AlertTriangle, Clock, Video, MapPin, User, CheckCircle,
  Filter, Activity, ShieldAlert, ShieldCheck, Eye, FileText, ArrowLeft, X
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

// ─── Types & Data ─────────────────────────────────────────────────────────────

import { mockAlerts, AlertSeverity, AlertStatus, getCameraCoords } from '../data/mockData';

export interface Alert {
  id: number;
  type: string;
  severity: AlertSeverity;
  status: AlertStatus;
  timestamp: string;
  camera: string;
  zone: string;
  location: { lat: number; lng: number };
  snapshot: string;
  description: string;
  assignedTo: string | null;
}

const initialAlerts: Alert[] = mockAlerts.map(a => ({
  ...a,
  timestamp: `${a.date} ${a.time}`,
  snapshot: a.image,
  location: getCameraCoords(a.camera),   // Casablanca coords from matching camera
  assignedTo: a.assignedTo || null,
}));

// ─── Style Config ─────────────────────────────────────────────────────────────

const SEV: Record<AlertSeverity, string> = {
  critical: 'bg-red-500 text-white',
  high:     'bg-orange-500 text-white',
  medium:   'bg-amber-500 text-white',
  low:      'bg-blue-500 text-white',
};

const STAT: Record<AlertStatus, { label: string; bg: string; icon: React.ReactNode }> = {
  active:       { label: 'Active',         bg: 'bg-red-50 text-red-600 border border-red-200',          icon: <Activity size={14}/> },
  'in-progress': { label: 'Pris en charge', bg: 'bg-amber-50 text-amber-600 border border-amber-200',    icon: <Clock size={14}/> },
  resolved:     { label: 'Résolue',        bg: 'bg-emerald-50 text-emerald-600 border border-emerald-200', icon: <CheckCircle size={14}/> },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function RealTimeAlerts() {
  const location = useLocation();
  const navigate = useNavigate();
  const passedAlertId = location.state?.selectedAlertId as number | undefined;
  // Camera context: passed when coming from CameraMonitoring "Voir tout"
  const passedCamera = location.state?.camera as string | undefined;
  // Use 'zoneName' alias to avoid collision with the 'location' variable from useLocation
  const passedCameraLocation = (location.state as { location?: string } | null)?.location;

  // Séparer les alertes d'origine (fixes) et les alertes générées en temps réel
  const [baseAlerts, setBaseAlerts] = useState(initialAlerts);
  const [simulatedAlerts, setSimulatedAlerts] = useState<Alert[]>([]);
  // La liste des alertes est toujours la fusion des nouvelles simluées + la base historique
  const alerts = [...simulatedAlerts, ...baseAlerts];
  // If a camera was passed, pre-select its first alert
  const firstCamAlert = passedCamera ? initialAlerts.find(a => a.camera === passedCamera) : undefined;
  const [selectedId, setSelectedId] = useState<number>(passedAlertId || firstCamAlert?.id || initialAlerts[0].id);
  const [detailOpen, setDetailOpen] = useState(true);
  // Camera filter: if arrived from a specific camera, pre-filter
  const [cameraFilter, setCameraFilter] = useState<string | null>(passedCamera || null);
  
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AlertStatus | 'all'>('all');

  // Si l'utilisateur clique sur une autre alerte depuis le dashboard
  useEffect(() => {
    if (passedAlertId && alerts.some(a => a.id === passedAlertId)) {
      setSelectedId(passedAlertId);
      setDetailOpen(true);
    }
  }, [passedAlertId, alerts]);


  // Simulation d'alertes temps réel — génère des détections sur des zones réelles du chantier
  useEffect(() => {
    const realZones = [
      { camera: 'CAM-01', zone: 'Zone A - Entrée Nord' },
      { camera: 'CAM-03', zone: "Zone C - Zone d'Équipement" },
      { camera: 'CAM-04', zone: 'Zone D - Périmètre Sud' },
      { camera: 'CAM-06', zone: 'Zone B - Porte Est' },
    ];
    const realTypes = [
      'Accès Non Autorisé Détecté',
      'Casque de Sécurité Manquant',
      'Gilet de Sécurité Manquant',
      'Comportement Dangereux Détecté',
    ];
    const timer = setInterval(() => {
      const pick = realZones[Math.floor(Math.random() * realZones.length)];
      const type = realTypes[Math.floor(Math.random() * realTypes.length)];
      const coords = getCameraCoords(pick.camera);
      const newId = Date.now();
      setNewAlertIds(prev => { const next = new Set(prev); next.add(newId); setTimeout(() => setNewAlertIds(s => { const n2 = new Set(s); n2.delete(newId); return n2; }), 30000); return next; });
      const newAlert: Alert = {
        id: newId,
        type,
        severity: 'high',
        status: 'active',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        camera: pick.camera,
        zone: pick.zone,
        location: { lat: coords.lat + (Math.random() - 0.5) * 0.002, lng: coords.lng + (Math.random() - 0.5) * 0.002 },
        snapshot: 'https://images.unsplash.com/photo-1723367194881-fe2e53534170?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
        description: `Détection automatisée par IA sur ${pick.camera} — ${pick.zone}`,
        assignedTo: null,
      };
      setSimulatedAlerts(prev => [newAlert, ...prev].slice(0, 15)); // On garde max 15 générées
    }, 30000); // 30 sec pour laisser le temps de comprendre
    return () => clearInterval(timer);
  }, []);

  const filteredAlerts = alerts.filter(a => 
    (cameraFilter === null || a.camera === cameraFilter) &&
    (filterSeverity === 'all' || a.severity === filterSeverity) &&
    (filterStatus === 'all' || a.status === filterStatus)
  );

  // When a camera filter is active, KPIs reflect that camera only — coherent with the filtered list
  const kpiBase = cameraFilter
    ? alerts.filter(a => a.camera === cameraFilter)
    : alerts;
  const statActive   = kpiBase.filter(a => a.status === 'active').length;
  const statAck      = kpiBase.filter(a => a.status === 'in-progress').length;
  const statRes      = kpiBase.filter(a => a.status === 'resolved').length;
  const statCritical = kpiBase.filter(a => a.severity === 'critical' && a.status === 'active').length;

  const selectedAlert = alerts.find(a => a.id === selectedId) || alerts[0];

  // Track which alert IDs arrived via real-time simulation (so we can badge them 'NOUVEAU')
  const [newAlertIds, setNewAlertIds] = useState<Set<number>>(new Set());

  // Mock actions (applies to either base or simulated alert)
  const changeStatus = (id: number, newStatus: AlertStatus) => {
    setBaseAlerts(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    setSimulatedAlerts(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  return (
    <div className="bg-[#F4F7FC] font-sans min-h-full">

      {/* ── Camera Context Banner (shown when arriving from CameraMonitoring) ── */}
      {cameraFilter && (
        <div className="bg-orange-50 border-b border-orange-200 px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/cameras', { state: { camera: cameraFilter } })}
              className="flex items-center gap-1.5 text-orange-600 hover:text-orange-800 font-bold text-sm transition-colors"
            >
              <ArrowLeft size={15} /> Retour à {cameraFilter}
            </button>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1.5 text-gray-600 text-sm">
              <MapPin size={13} className="text-orange-400" />
              <span className="font-semibold">{passedCameraLocation}</span>
            </div>
            <span className="bg-orange-100 border border-orange-300 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
              Filtré : alertes de {cameraFilter}
            </span>
          </div>
          <button
            onClick={() => setCameraFilter(null)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 font-semibold transition-colors"
          >
            <X size={13} /> Voir toutes les alertes
          </button>
        </div>
      )}

      {/* ── Top Bar ── */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 shadow-sm sticky top-0 z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-gray-800 tracking-tight">Alertes en temps réel</h1>
          <p className="text-gray-500 text-[14px] mt-0.5 font-medium">Violations de sécurité détectées par l'IA nécessitant une attention</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-gray-50 border border-gray-200 p-1.5 rounded-xl shrink-0">
          <div className="flex items-center gap-2 pl-2 pr-1 border-r border-gray-200">
            <Filter size={15} className="text-gray-400" />
            <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value as AlertSeverity | 'all')}
              className="bg-transparent text-sm font-semibold text-gray-700 focus-visible:ring-2 focus-visible:ring-site-orange focus-visible:outline-none rounded cursor-pointer">
              <option value="all">Priorité : Toutes</option>
              <option value="critical">Priorité : Critique</option>
              <option value="high">Priorité : Élevée</option>
              <option value="medium">Priorité : Moyenne</option>
              <option value="low">Priorité : Basse</option>
            </select>
          </div>
          <div className="flex items-center px-1">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as AlertStatus | 'all')}
              className="bg-transparent text-sm font-semibold text-gray-700 focus:outline-none cursor-pointer">
              <option value="all">Statut : Tous</option>
              <option value="active">Statut : Actif</option>
              <option value="in-progress">Statut : En cours</option>
              <option value="resolved">Statut : Résolu</option>
            </select>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6 max-w-[1600px] mx-auto">
        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Alertes Critiques" value={String(statCritical)} sub="Action immédiate requise" icon={<AlertTriangle size={20}/>} bg="bg-red-50 text-red-500" highlight={statCritical > 0}/>
          <KpiCard label="Alertes Actives" value={String(statActive)} sub="En attente de révision" icon={<Activity size={20}/>} bg="bg-rose-50 text-rose-500"/>
          <KpiCard label="Prises en charge" value={String(statAck)} sub="En cours / investigation" icon={<ShieldAlert size={20}/>} bg="bg-amber-50 text-amber-500"/>
          <KpiCard label="Résolues" value={String(statRes)} sub="Violations fermées aujourd'hui" icon={<ShieldCheck size={20}/>} bg="bg-emerald-50 text-emerald-500"/>
        </div>

        {/* ── Alerts List (Accordion Style) ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-[2.5fr_1.5fr_1.5fr_1fr_1fr] px-5 py-3 border-b border-gray-100/80 text-[11px] uppercase tracking-wider text-gray-400 font-bold bg-gray-50/50">
            <span>Type d'alerte</span><span>Emplacement</span><span>Heure & Source</span><span>Gravité</span><span>Statut</span>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12">
                <ShieldCheck size={48} className="mx-auto text-emerald-500 mb-3 opacity-50"/>
                <h3 className="text-lg font-bold text-gray-800">Aucune alerte ne correspond à vos critères</h3>
                <p className="text-gray-400 text-sm">Les conditions sur le site semblent sécurisées avec ces filtres.</p>
              </div>
            ) : filteredAlerts.map(alert => {
              const isSelected = selectedId === alert.id && detailOpen;
              
              return (
                <div key={alert.id}>
                  {/* Row */}
                  <button
                    onClick={() => { setSelectedId(alert.id); setDetailOpen(open => alert.id === selectedId ? !open : true); }}
                    className={`w-full text-left flex items-center gap-4 px-5 py-4 transition-colors relative
                      ${isSelected ? 'bg-orange-50/40' : 'hover:bg-gray-50'}`}
                  >
                    {/* Active indicator line */}
                    {alert.status === 'active' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"/>}

                    <div className="flex-1 min-w-0 md:grid md:grid-cols-[2.5fr_1.5fr_1.5fr_1fr_1fr] md:items-center md:gap-4 ml-1">
                      <div className="min-w-0 mb-2 md:mb-0 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-bold text-sm leading-tight truncate ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>{alert.type}</h3>
                          {alert.status === 'active' && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"/>}
                          {/* NOUVEAU badge — only shown for real-time simulated alerts (30s window) */}
                          {newAlertIds.has(alert.id) && (
                            <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500 text-white animate-pulse tracking-wider" title="Nouvelle détection IA en temps réel">
                              NOUVEAU
                            </span>
                          )}
                        </div>
                        <div className="text-gray-400 text-xs truncate max-w-sm">{alert.description}</div>
                      </div>
                      
                      <div className="text-gray-600 text-[13px] font-medium hidden md:flex items-center gap-1.5 truncate">
                        <MapPin size={13} className="text-gray-400 shrink-0"/> {alert.zone}
                      </div>
                      
                      <div className="hidden md:block">
                        <div className="text-gray-700 text-[12px] font-bold flex items-center gap-1.5"><Clock size={12} className="text-gray-400"/> {alert.timestamp.split(' ')[1]}</div>
                        <div className="text-gray-400 text-[11px] font-medium flex items-center gap-1.5 mt-0.5"><Video size={11}/> {alert.camera}</div>
                      </div>
                      
                      <div className="hidden md:flex items-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${SEV[alert.severity]}`}>
                          {alert.severity === 'critical' ? 'Critique' : alert.severity === 'high' ? 'Élevée' : alert.severity === 'medium' ? 'Moyenne' : 'Basse'}
                        </span>
                      </div>

                      <div className="hidden md:flex items-center">
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${STAT[alert.status].bg}`}>
                          {STAT[alert.status].icon} {STAT[alert.status].label}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Badges */}
                    <div className="md:hidden flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${SEV[alert.severity]}`}>{alert.severity === 'critical' ? 'Critique' : alert.severity === 'high' ? 'Élevée' : alert.severity === 'medium' ? 'Moyenne' : 'Basse'}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${STAT[alert.status].bg}`}>{STAT[alert.status].label}</span>
                    </div>
                  </button>

                  {/* ── Expanded Detail Panel ── */}
                  {isSelected && (
                    <div className="border-t border-gray-100 bg-gray-50/80 p-5 lg:p-6 shadow-inner animate-in slide-in-from-top-2 duration-200">
                      
                      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
                        
                        {/* Snapshot & Actions (Left) */}
                        <div className="space-y-4">
                          {/* Image Snapshot */}
                          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100/50 flex items-center justify-between">
                              <h3 className="text-gray-800 font-bold text-sm flex items-center gap-2">
                                <Video size={16} className="text-gray-400"/> Capture de l'incident
                              </h3>
                              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition">
                                <Eye size={13} /> Voir le flux en direct
                              </button>
                            </div>
                            <div className="aspect-video relative bg-gray-900 overflow-hidden">
                              <ImageWithFallback src={selectedAlert.snapshot} alt={selectedAlert.type} className="w-full h-full object-cover"/>
                              {/* Overlay Bounding Box */}
                              <div className="absolute top-[30%] left-[45%] w-[15%] h-[40%] border-2 border-red-500 rounded bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.5)] flex flex-col justify-end">
                                <div className="bg-red-500 text-white text-[10px] md:text-xs font-bold px-2 py-1 absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded">
                                  ⚠ {selectedAlert.type}
                                </div>
                              </div>
                              {/* Overlay Data */}
                              <div className="absolute top-3 left-3 flex gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase shadow-lg ${SEV[selectedAlert.severity]}`}>
                                  {selectedAlert.severity}
                                </span>
                              </div>
                              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white font-mono text-xs shadow-lg">
                                {selectedAlert.timestamp} | {selectedAlert.camera}
                              </div>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                            <h3 className="text-gray-800 font-bold text-sm mb-3">Workflow de résolution</h3>
                            <div className="flex flex-wrap gap-2">
                              {selectedAlert.status === 'active' && (
                                <>
                                  <button onClick={() => changeStatus(selectedAlert.id, 'in-progress')} className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold shadow-sm shadow-amber-200 transition flex items-center justify-center gap-2">
                                    <Clock size={16} /> Prendre en charge
                                  </button>
                                  <button onClick={() => changeStatus(selectedAlert.id, 'resolved')} className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-sm shadow-emerald-200 transition flex items-center justify-center gap-2">
                                    <CheckCircle size={16} /> Résoudre immédiatement
                                  </button>
                                </>
                              )}
                              {selectedAlert.status === 'in-progress' && (
                                <button onClick={() => changeStatus(selectedAlert.id, 'resolved')} className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-sm shadow-emerald-200 transition flex items-center justify-center gap-2">
                                  <CheckCircle size={16} /> Marquer comme résolue
                                </button>
                              )}
                              
                              <button className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-bold shadow-sm transition flex items-center justify-center gap-2">
                                <FileText size={16} /> Créer un rapport
                              </button>

                              {(selectedAlert.status === 'in-progress' || selectedAlert.status === 'active') && (
                                <button className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2">
                                  <User size={16} /> Assigner un agent
                                </button>
                              )}
                              
                              {selectedAlert.status !== 'active' && (
                                <button onClick={() => changeStatus(selectedAlert.id, 'active')} className="ml-auto flex sm:flex-none items-center justify-center px-4 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-sm font-bold transition gap-2">
                                  Rouvrir l'alerte
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Details & Location (Right) */}
                        <div className="space-y-4">
                          {/* Alert Info Card */}
                          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 relative overflow-hidden">
                            <AlertTriangle size={80} className={`absolute -right-4 -bottom-4 opacity-5 ${selectedAlert.severity === 'critical' ? 'text-red-500' : 'text-orange-500'}`}/>
                            
                            <h3 className="text-gray-800 font-bold text-sm mb-4 border-b border-gray-100 pb-3">Contexte de l'alerte</h3>
                            <div className="space-y-4">
                              <p className="text-gray-700 text-sm font-medium leading-relaxed">
                                "{selectedAlert.description}"
                              </p>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                  <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wide mb-0.5">Assigné à</div>
                                  <div className={`text-sm font-bold ${selectedAlert.assignedTo ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                                    {selectedAlert.assignedTo || 'Non assigné'}
                                  </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                  <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wide mb-0.5">Statut Actuel</div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${STAT[selectedAlert.status].bg}`}>
                                      {STAT[selectedAlert.status].label}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Map Widget Mock */}
                          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                            <h3 className="text-gray-800 font-bold text-sm mb-3 flex items-center gap-2">
                              <MapPin size={16} className="text-gray-400"/> Zone de détection
                            </h3>
                            <div className="aspect-[4/3] bg-gray-100 rounded-xl border border-gray-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2 animate-pulse relative z-10">
                                  <MapPin className="text-red-500" size={24} />
                                </div>
                                <div className="font-bold text-gray-800 text-sm relative z-10 text-center">{selectedAlert.zone}</div>
                                <div className="text-gray-400 text-xs font-mono mt-1 relative z-10">{selectedAlert.location.lat.toFixed(5)}, {selectedAlert.location.lng.toFixed(5)}</div>
                            </div>
                          </div>

                          {/* Timeline */}
                          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                            <h3 className="text-gray-800 font-bold text-sm mb-4">Chronologie de l'événement</h3>
                            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                              {/* Create Event */}
                              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-red-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-xl bg-gray-50 border border-gray-100">
                                  <div className="font-bold text-gray-800 text-xs">Alerte Déclenchée</div>
                                  <div className="text-gray-400 text-[10px] mt-0.5">{selectedAlert.timestamp}</div>
                                </div>
                              </div>
                              {/* Ack Event */}
                              {(selectedAlert.status === 'in-progress' || selectedAlert.status === 'resolved') && (
                              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-amber-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-xl bg-gray-50 border border-gray-100">
                                  <div className="font-bold text-gray-800 text-xs">Prise en charge</div>
                                  <div className="text-gray-500 text-[10px] truncate mt-0.5">Par {selectedAlert.assignedTo}</div>
                                </div>
                              </div>
                              )}
                              {/* Resolve Event */}
                              {selectedAlert.status === 'resolved' && (
                              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-emerald-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                                  <div className="font-bold text-emerald-700 text-xs">Problème Résolu</div>
                                  <div className="text-emerald-500 text-[10px] mt-0.5">Conditions de sécurité vérifiées</div>
                                </div>
                              </div>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon, bg, highlight = false }:
  { label: string; value: string; sub: string; icon: React.ReactNode; bg: string; highlight?: boolean }) {
  return (
    <div className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start justify-between gap-2 hover:shadow-md transition-shadow ${highlight ? 'ring-2 ring-red-400 shadow-red-100' : ''}`}>
      <div>
        <div className="text-gray-500 text-sm font-medium mb-1.5">{label}</div>
        <div className="text-3xl font-extrabold text-gray-800 mb-1.5 flex items-center gap-2">
          {value} {highlight && <span className="flex w-2 h-2 bg-red-500 rounded-full animate-pulse"/>}
        </div>
        <div className="text-gray-400 text-xs font-semibold">{sub}</div>
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>{icon}</div>
    </div>
  );
}
