import { useState, useEffect, useRef } from 'react';
import {
  Video, Maximize, AlertTriangle,
  MapPin, CheckCircle, FileText, User, Circle, Activity, Truck, BarChart2, RefreshCw, XCircle, Edit2,
  Camera, Play, Pause, AlertOctagon, Clock, WifiOff, ExternalLink, Info
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

// ─── Data ─────────────────────────────────────────────────────────────────────

import { mockCameras as cameraList, mockAlerts } from '../data/mockData';
import { useToast } from '../context/ToastContext';
import { CreateIncidentModal } from '../components/CreateIncidentModal';
import { CreateReportModal } from '../components/Modals';
import { VideoReplayModal, CountAdjustModal } from '../components/AdvancedModals';

// ─── Confirmation Modal ────────────────────────────────────────────────────────

function ConfirmIncidentModal({
  open,
  cameraName,
  violationText,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  cameraName: string;
  violationText: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-7 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <AlertOctagon size={22} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-base">Confirmer la création de l'incident</h3>
            <p className="text-gray-500 text-sm mt-0.5">{cameraName}</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-5 text-sm text-red-700 font-medium">
          {violationText}
        </div>
        <p className="text-gray-500 text-sm mb-5">
          Cette action va créer un <strong className="text-gray-800">constat officiel d'inspection</strong> et ouvrir un dossier de non-conformité. Confirmez-vous la détection ?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-sm"
          >
            <FileText size={15} /> Confirmer & Créer l'incident
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 py-2.5 rounded-xl font-bold text-sm transition"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CameraMonitoring() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const passedCameraId = location.state?.selectedCameraId as number | undefined;

  const [selectedCamera, setSelectedCamera] = useState(() => {
    return cameraList.find(c => c.id === passedCameraId) || cameraList[0];
  });
  const [clearedAlerts, setClearedAlerts] = useState<number[]>([]);

  // Confirmation modal — tracks which type of violation triggered it
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalIncidentType, setModalIncidentType] = useState<'zone' | 'epi'>('epi');

  const openModal = (type: 'zone' | 'epi') => {
    setModalIncidentType(type);
    setShowConfirmModal(true);
  };

  // Auto-cycle
  const [autoCycle, setAutoCycle] = useState(false);
  const autoCycleRef = useRef(autoCycle);
  autoCycleRef.current = autoCycle;

  // Last check timestamp
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());

  // Compliance start time — tracks when selected camera became compliant
  const [complianceStartTime, setComplianceStartTime] = useState<Date>(new Date());

  // Frame captured toast
  const [frameCaptured, setFrameCaptured] = useState(false);

  // IA Overlays toggle
  const [showOverlays, setShowOverlays] = useState(true);

  // Manual compliance certification state
  const [certifiedComplianceTime, setCertifiedComplianceTime] = useState<Date | null>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReplayModalOpen, setIsReplayModalOpen] = useState(false);
  const [replayTimestamp, setReplayTimestamp] = useState<string | undefined>(undefined);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isIncidentOpen, setIsIncidentOpen] = useState(false);

  // Maintenance mock data (Image 3 improvements)
  const maintenanceSince = '2h 15min';
  const maintenanceDetails = {
    reason: 'Remplacement objectif caméra suite à détérioration météo',
    technician: 'M. Benali – Technicien SI',
    estimatedReturn: 'Aujourd\'hui à 17h00',
  };
  const uncoveredZones = selectedCamera.status === 'maintenance'
    ? ['Zone A – Côté Ouest']
    : [];

  useEffect(() => {
    if (passedCameraId) {
      const cam = cameraList.find(c => c.id === passedCameraId);
      if (cam) setSelectedCamera(cam);
    }
  }, [passedCameraId]);

  // Auto-cycle effect (Image 2)
  useEffect(() => {
    if (!autoCycle) return;
    const conformList = cameraList.filter(c => c.status === 'active');
    if (conformList.length === 0) return;
    const interval = setInterval(() => {
      if (!autoCycleRef.current) return;
      setSelectedCamera(prev => {
        const idx = conformList.findIndex(c => c.id === prev.id);
        const next = conformList[(idx + 1) % conformList.length];
        setLastCheckTime(new Date());
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [autoCycle]);

  const activeCount = cameraList.filter(c => c.status === 'active').length;
  const totalWorkers = cameraList.filter(c => c.status === 'active').reduce((s, c) => s + c.detections.workers, 0);
  const totalVehicles = cameraList.filter(c => c.status === 'active').reduce((s, c) => s + c.detections.vehicles, 0);
  const alertCount = cameraList.filter(c => c.status === 'active' && (c.detections.vests < c.detections.workers || c.detections.helmets < c.detections.workers) && !clearedAlerts.includes(c.id)).length;

  const missingVests = selectedCamera.detections.workers - selectedCamera.detections.vests;
  const missingHelmets = selectedCamera.detections.workers - selectedCamera.detections.helmets;
  const hasViolation = selectedCamera.status === 'active' && (missingVests > 0 || missingHelmets > 0) && !clearedAlerts.includes(selectedCamera.id);

  // Severity classification (Image 1 improvement)
  const violationSeverity = (missingVests + missingHelmets) >= 3 ? 'CRITIQUE' : 'MODÉRÉ';
  const violationSeverityColor = violationSeverity === 'CRITIQUE'
    ? 'bg-red-700 text-white'
    : 'bg-orange-500 text-white';

  const violationText = missingVests > 0 && missingHelmets > 0
    ? `${missingVests} ouvrier(s) sans gilets et ${missingHelmets} sans casque détecté(s) sur ${selectedCamera.name} — ${selectedCamera.location}`
    : missingVests > 0
      ? `${missingVests} ouvrier(s) détecté(s) sans gilet de sécurité sur ${selectedCamera.name} — ${selectedCamera.location}`
      : `${missingHelmets} ouvrier(s) détecté(s) sans casque de sécurité sur ${selectedCamera.name} — ${selectedCamera.location}`;

  // Compliance duration (Image 2 improvement)
  const getComplianceDuration = () => {
    const diffMs = new Date().getTime() - complianceStartTime.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'moins d\'1 minute';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''}`;
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
  };

  const [cameraFilter, setCameraFilter] = useState<'all' | 'alert' | 'ok' | 'maintenance'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const maintenanceCount = cameraList.filter(c => c.status === 'maintenance').length;
  const okCount = activeCount - alertCount;

  const filteredCameraList = cameraList.filter(cam => {
    if (cameraFilter === 'all') return true;
    if (cameraFilter === 'maintenance') return cam.status === 'maintenance';
    const isAlert = cam.status === 'active' && (cam.detections.vests < cam.detections.workers || cam.detections.helmets < cam.detections.workers) && !clearedAlerts.includes(cam.id);
    if (cameraFilter === 'alert') return isAlert;
    if (cameraFilter === 'ok') return cam.status === 'active' && !isAlert;
    return true;
  });

  const handleIgnore = () => {
    setClearedAlerts(prev => {
      const newCleared = [...prev, selectedCamera.id];
      const nextAlertCam = cameraList.find(c =>
        c.status === 'active' &&
        (c.detections.vests < c.detections.workers || c.detections.helmets < c.detections.workers) &&
        !newCleared.includes(c.id)
      );
      if (nextAlertCam) {
        setTimeout(() => setSelectedCamera(nextAlertCam), 600);
      }
      return newCleared;
    });
  };

  // Reset compliance start when switching cameras
  const handleSelectCamera = (cam: typeof selectedCamera) => {
    setSelectedCamera(cam);
    setLastCheckTime(new Date());
    setComplianceStartTime(new Date());
    setCertifiedComplianceTime(null);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setLastCheckTime(new Date());
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Frame capture handler (Image 1 improvement)
  const handleCaptureFrame = () => {
    setFrameCaptured(true);
    setTimeout(() => setFrameCaptured(false), 3000);
  };

  const formatLastCheck = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="bg-[#F4F7FC] font-sans min-h-full">

      {/* ── Consolidated Header ── */}
      <div className="relative z-30 flex flex-col w-full shadow-sm">
        {/* ── Violation Bar ── */}
        {hasViolation && (
          <div className="bg-red-600 text-white px-6 py-2.5 flex items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3 min-w-0">
              <AlertTriangle size={16} className="shrink-0 animate-pulse" />
              <span className="text-sm font-bold truncate">⚠ Violation EPI en direct — {selectedCamera.name} ({selectedCamera.location})</span>
              <span className={`shrink-0 text-[11px] font-extrabold px-2 py-0.5 rounded-full ${violationSeverityColor}`}>
                {violationSeverity}
              </span>
              {/* Adaptive counter: remaining alerts on OTHER cameras (excludes current) */}
              {(() => {
                const otherAlerts = alertCount - 1; // current camera counts as 1
                if (otherAlerts <= 0) return null;
                return (
                  <span className="shrink-0 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/30">
                    + {otherAlerts} autre{otherAlerts > 1 ? 's' : ''} alerte{otherAlerts > 1 ? 's' : ''} sur le site
                  </span>
                );
              })()}
            </div>
            <button
              onClick={() => setShowConfirmModal(true)}
              title="Action immédiate : ouvre le formulaire de création d'incident avec les données pré-remplies"
              className="shrink-0 bg-white text-red-600 hover:bg-red-50 text-xs font-bold px-3 py-1.5 rounded-lg transition"
            >
              ⚡ Action immédiate →
            </button>
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmIncidentModal
          open={showConfirmModal}
          cameraName={selectedCamera.name}
          violationText={modalIncidentType === 'zone' ? "Alerte Critique : Une violation de zone interdite a été détectée sur cette caméra." : violationText}
          onConfirm={() => {
            setShowConfirmModal(false);
            navigate('/incidents');
          }}
          onCancel={() => setShowConfirmModal(false)}
        />

        {/* Frame Captured Toast */}
        {frameCaptured && (
          <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
            <Camera size={15} className="text-orange-400" />
            Frame capturée et archivée comme preuve
          </div>
        )}

        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 max-w-[1600px] mx-auto">
            <div>
              <h1 className="text-[26px] font-bold text-gray-800 tracking-tight">Surveillance Caméras</h1>
              <p className="text-gray-500 text-[14px] mt-0.5 font-medium">Surveillance IA en direct – caméras fixes sur le chantier</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-site-orange focus-visible:outline-none transition shadow-sm"
                title="Télécharger un PDF de la surveillance actuelle"
                onClick={() => setIsReportModalOpen(true)}
              >
                <BarChart2 size={15} /> Télécharger données (PDF)
              </button>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-site-orange focus-visible:outline-none transition shadow-sm disabled:opacity-60"
                title="Forcer l'actualisation de tous les flux caméra"
              >
                <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
                {isRefreshing ? 'Actualisation...' : 'Tout rafraîchir'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 pb-32 space-y-6 max-w-[1600px] mx-auto">

        {/* ── KPI Cards — "Alertés EPI" is clickable to filter view ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Caméras Actives" value={`${activeCount}/${cameraList.length}`} sub="Caméras opérationnelles" icon={<Video size={20} />} bg="bg-blue-50 text-blue-500" />
          <KpiCard label="Ouvriers Détectés" value={String(totalWorkers)} sub="Sur tous les flux en direct" icon={<User size={20} />} bg="bg-indigo-50 text-indigo-500" />
          {/* Alertes EPI — clickable: filters camera grid to 'En Alerte' */}
          <KpiCard
            label="Alertes EPI"
            value={String(alertCount)}
            sub={alertCount > 0 ? `Cliquer pour filtrer les caméras en alerte` : "Aucune violation détectée"}
            icon={<AlertTriangle size={20} strokeWidth={2.5} />}
            bg="bg-red-50 text-red-500"
            onClick={alertCount > 0 ? () => setCameraFilter('alert') : undefined}
            clickable={alertCount > 0}
          />
          <KpiCard label="Véhicules sur site" value={String(totalVehicles)} sub="Détectés en zone active" icon={<Truck size={20} />} bg="bg-amber-50 text-amber-500" />
        </div>

        {/* ── Camera Grid ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Video size={14} className="text-gray-400" />
              <h2 className="text-gray-700 font-bold text-sm">Caméras du chantier</h2>
              {/* Auto-cycle toggle (Image 2 improvement) */}
              <button
                onClick={() => setAutoCycle(v => !v)}
                title={autoCycle ? 'Arrêter le défilement automatique' : 'Activer le défilement automatique entre caméras (5s)'}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${autoCycle ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
              >
                {autoCycle ? <><Pause size={11} /> Défilement auto ON</> : <><Play size={11} /> Défilement auto</>}
              </button>
            </div>
            <div className="flex bg-gray-100/80 p-1 rounded-lg gap-1 overflow-x-auto hide-scrollbar">
              <button onClick={() => setCameraFilter('all')} className={`px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-colors ${cameraFilter === 'all' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Toutes ({cameraList.length})</button>
              <button onClick={() => setCameraFilter('alert')} className={`px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-colors ${cameraFilter === 'alert' ? 'bg-red-50 text-red-600 shadow-sm border border-red-100' : 'text-gray-500 hover:text-gray-700'}`}>En Alerte {alertCount > 0 && `(${alertCount})`}</button>
              <button onClick={() => setCameraFilter('ok')} className={`px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-colors ${cameraFilter === 'ok' ? 'bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100' : 'text-gray-500 hover:text-gray-700'}`}>Conformes ({okCount})</button>
              <button onClick={() => setCameraFilter('maintenance')} className={`px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-colors ${cameraFilter === 'maintenance' ? 'bg-amber-50 text-amber-600 shadow-sm border border-amber-100' : 'text-gray-500 hover:text-gray-700'}`}>Maintenance {maintenanceCount > 0 && `(${maintenanceCount})`}</button>
            </div>
          </div>
          <div className="flex overflow-x-auto gap-3 px-4 py-4 hide-scrollbar snap-x scroll-smooth">
            {filteredCameraList.map(cam => {
              const camMissingVests = cam.detections.workers - cam.detections.vests;
              const camMissingHelmets = cam.detections.workers - cam.detections.helmets;
              const camAlertCount = cam.status === 'active' && !clearedAlerts.includes(cam.id)
                ? (camMissingVests > 0 ? camMissingVests : 0) + (camMissingHelmets > 0 ? camMissingHelmets : 0)
                : 0;
              return (
                <button
                  key={cam.id}
                  onClick={() => handleSelectCamera(cam)}
                  className={`shrink-0 w-44 snap-start group text-left border-2 rounded-2xl overflow-hidden transition-all shadow-sm hover:shadow-md focus-visible:ring-4 focus-visible:ring-site-orange focus-visible:outline-none focus-visible:border-none
                    ${selectedCamera.id === cam.id
                      ? 'border-[#F97215] ring-2 ring-orange-200'
                      : camAlertCount > 0
                        ? 'border-red-400 hover:border-red-500 ring-2 ring-red-100'
                        : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="aspect-video relative bg-gray-100 overflow-hidden">
                    <ImageWithFallback src={cam.image} alt={cam.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {/* Status badge */}
                    <div className="absolute top-1.5 right-1.5">
                      {cam.status === 'active' ? (
                        <span className="flex items-center gap-1 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
                          <Circle size={5} className="fill-white text-white" /> active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
                          maintenance
                        </span>
                      )}
                    </div>
                    {cam.status === 'active' && (
                      <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-full" title="Flux en direct">
                        <Circle size={5} className="fill-red-500 text-red-500 animate-pulse" />
                      </div>
                    )}
                    {/* Numbered alert badge (Image 1 improvement) */}
                    {camAlertCount > 0 && (
                      <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-red-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow-lg">
                        <AlertTriangle size={9} />
                        {camAlertCount}
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-white">
                    <div className="font-bold text-gray-800 text-[11px]">{cam.name}</div>
                    <div className="text-gray-500 text-[10px] truncate leading-tight">{cam.location}</div>
                    {cam.status === 'active' && (
                      <div className="flex gap-1.5 mt-1">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-600 font-semibold">👷 {cam.detections.workers}</span>
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-600 font-semibold">🚗 {cam.detections.vehicles}</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Live Feed Detail ── */}
        <div className="space-y-4">
          {/* Feed header */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                <Video className="text-[#F97215]" size={24} />
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-1">Surveillance Caméras / Flux en direct</div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-xl font-bold text-gray-800">{selectedCamera.name}</h2>
                  {selectedCamera.status === 'active' ? (
                    <span className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-bold px-2.5 py-1 rounded-full">
                      <Circle size={6} className="fill-emerald-500 text-emerald-500" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-600 text-xs font-bold px-2.5 py-1 rounded-full">
                      Maintenance
                    </span>
                  )}
                  {hasViolation && (
                    <span className="flex items-center gap-1 bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">
                      <AlertTriangle size={11} /> Alerte EPI
                    </span>
                  )}
                </div>
                {/* Zone location link + zone type badge */}
                <button
                  onClick={() => navigate('/map', { state: { zone: selectedCamera.location } })}
                  title={`Voir la zone sur le plan du site : ${selectedCamera.location}`}
                  className="flex items-center gap-1.5 text-sm text-[#F97215] hover:text-orange-600 font-semibold transition-colors group mt-0.5"
                >
                  <MapPin size={12} className="text-[#F97215]" />
                  <span className="underline decoration-transparent group-hover:decoration-orange-300 underline-offset-2 transition-all">{selectedCamera.location}</span>
                  <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                {/* Zone type badge — derived from location name heuristic */}
                {(() => {
                  const loc = selectedCamera.location.toLowerCase();
                  if (loc.includes('périmètre') || loc.includes('entrée') || loc.includes('porte'))
                    return <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-full">📡 Périmètre / Accès</span>;
                  if (loc.includes('risque') || loc.includes('danger') || loc.includes('hauteur'))
                    return <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 bg-red-50 border border-red-200 text-red-600 rounded-full">⚠️ Zone à risque</span>;
                  if (loc.includes('stockage') || loc.includes('matériel'))
                    return <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-full">📦 Stockage</span>;
                  if (loc.includes('équipement') || loc.includes('engin'))
                    return <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 bg-purple-50 border border-purple-200 text-purple-600 rounded-full">🛠 Zone Engins</span>;
                  return <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-500 rounded-full">🚧 Zone de travail</span>;
                })()}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Toggle IA Overlays */}
              {selectedCamera.status === 'active' && (
                <button
                  onClick={() => setShowOverlays(v => !v)}
                  title={showOverlays ? "Masquer temporairement les détections IA pour voir l'image originale" : "Afficher les détections IA"}
                  className={`flex items-center gap-2 px-3 py-2.5 border rounded-xl text-sm font-bold transition shadow-sm ${showOverlays ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50' : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'}`}
                >
                  <User size={15} />
                  <span className="hidden sm:inline">IA {showOverlays ? 'ON' : 'OFF'}</span>
                </button>
              )}
              {/* Replay button for active violations */}
              {selectedCamera.status === 'active' && hasViolation && (
                <button
                  onClick={() => setIsReplayModalOpen(true)}
                  title="Voir la vidéo de l'infraction (30s en arrière)"
                  className="flex items-center gap-2 px-3 py-2.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-sm font-bold transition shadow-sm"
                >
                  <Clock size={15} /> Voir replay 30s
                </button>
              )}
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-bold transition shadow-sm group" title="Agrandir et centrer le flux vidéo">
                <Maximize size={16} className="group-hover:scale-110 transition-transform" /> <span className="hidden sm:inline">Plein écran</span>
              </button>
            </div>
          </div>

          {/* Live video feed */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="relative aspect-video bg-gray-900">
              <ImageWithFallback src={selectedCamera.image} alt={selectedCamera.name} className="w-full h-full object-cover" />

              {/* LIVE badge + timestamp */}
              <div className="absolute top-4 left-4 space-y-2">
                <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <Circle size={8} className="fill-red-500 text-red-500 animate-pulse" />
                  <span className="text-white text-sm font-bold tracking-wide">ENREGISTREMENT EN DIRECT</span>
                </div>
                <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg w-max">
                  <span className="text-white text-sm font-mono">10:23:45 AM</span>
                </div>
              </div>

              {/* Frame Capture button overlay */}
              {selectedCamera.status === 'active' && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleCaptureFrame(); }}
                  title="Capturer et archiver la frame actuelle comme preuve"
                  className="absolute top-4 right-4 z-20 bg-black/70 hover:bg-black/90 text-white backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold tracking-wide transition shadow-lg border border-white/20 hover:border-white/40"
                >
                  <Camera size={15} /> Capturer frame
                </button>
              )}

              {/* AI Detection Overlays */}
              {selectedCamera.status === 'active' && showOverlays && (
                <>
                  <div className="absolute top-1/4 left-1/4 border-2 border-emerald-500 rounded-lg p-1 shadow group cursor-help">
                    <span className="bg-emerald-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">Ouvrier ✓</span>
                    <div className="absolute top-full mt-1 left-0 bg-gray-900 text-white text-[10px] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none w-max z-10 font-medium tracking-wide">
                      IA Confiance: 97%<br />Tracking ID: #842
                    </div>
                  </div>
                  <div className="absolute top-1/3 right-1/3 border-2 border-emerald-500 rounded-lg p-1 shadow group cursor-help">
                    <span className="bg-emerald-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">Casque ✓</span>
                    <div className="absolute top-full mt-1 left-0 bg-gray-900 text-white text-[10px] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none w-max z-10 font-medium tracking-wide">
                      IA Confiance: 94%<br />Port correct: Oui
                    </div>
                  </div>
                  <div className="absolute bottom-1/4 left-1/3 border-2 border-blue-500 rounded-lg p-1 shadow group cursor-help">
                    <span className="bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">Véhicule</span>
                    <div className="absolute top-full mt-1 left-0 bg-gray-900 text-white text-[10px] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none w-max z-10 font-medium tracking-wide">
                      IA Confiance: 96%<br />Type: Engin de chantier
                    </div>
                  </div>
                  {hasViolation && (
                    <div className="absolute top-1/2 right-1/4 border-2 border-red-500 rounded-lg p-1 shadow group cursor-help animate-pulse">
                      <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                        {missingVests > 0 && missingHelmets > 0 ? 'EPI Manquants ⚠' : missingVests > 0 ? 'Gilet Manquant ⚠' : 'Casque Manquant ⚠'}
                      </span>
                      <div className="absolute top-full mt-1 left-0 bg-red-900 text-white text-[10px] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none w-max z-10 font-medium whitespace-nowrap tracking-wide leading-relaxed">
                        IA Confiance: {missingVests > 0 ? 85 : 89}%<br />Alerte: {missingVests > 0 && missingHelmets > 0 ? 'Gilet + Casque absents' : missingVests > 0 ? 'Absence de gilet HV' : 'Absence de casque'}<br />Action requise
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Maintenance overlay */}
              {selectedCamera.status === 'maintenance' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgNDBoNDBWMHgtNDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgMTAgTDEwIDAgTDIwIDAgTDAgMjAgWk00MCAzMCBMMzAgNDAgTDQwIDQwIFoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-20 pointer-events-none" />
                  <div className="text-center relative z-10">
                    <div className="text-amber-400 mb-3 flex justify-center animate-pulse"><AlertTriangle size={48} strokeWidth={1.5} /></div>
                    <div className="text-white font-bold text-xl tracking-tight">Caméra en maintenance</div>
                    <div className="text-gray-400 text-sm mt-1.5 font-medium">Flux vidéo temporairement indisponible</div>
                    {/* Maintenance duration (Image 3 improvement) */}
                    <div className="mt-5 inline-flex items-center justify-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-xl shadow-2xl">
                      <Clock size={15} className="text-amber-400" />
                      <span className="text-amber-50 text-sm font-bold tracking-wide">Hors ligne depuis {maintenanceSince}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Info bar below feed */}
            <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-gray-400" />
                <span className="text-gray-600 text-sm font-medium flex items-center gap-1.5">
                  Orientation : <b className="text-gray-800">{selectedCamera.orientation}</b>
                  {(() => {
                    const match = selectedCamera.orientation.match(/(\d+)°/);
                    const deg = match ? match[1] : 0;
                    return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500" style={{ transform: `rotate(${deg}deg)` }}><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>;
                  })()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-gray-400" />
                <span className={`text-sm font-medium ${selectedCamera.status === 'maintenance' ? 'text-gray-400' : 'text-gray-600'}`}>
                  IPS : <b className={`${selectedCamera.status === 'maintenance' ? 'text-gray-400' : 'text-gray-800'}`}>{selectedCamera.fps}</b>
                </span>
              </div>
              {/* Last check timestamp */}
              {selectedCamera.status === 'active' && (
                <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium">
                  <Clock size={12} />
                  Vérifié à {formatLastCheck(lastCheckTime)}
                </div>
              )}
              {selectedCamera.status === 'active' && (
                <div className="ml-auto flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-600 px-3 py-1.5 rounded-xl text-xs font-bold">
                  <Circle size={6} className="fill-emerald-500 text-emerald-500 animate-pulse" /> Flux actif
                </div>
              )}
            </div>

            {/* Mini Event Timeline Bar — quick at-a-glance history for active cameras */}
            {selectedCamera.status === 'active' && (
              <div className="border-t border-gray-100 px-5 py-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Activity size={10} /> Historique récent — {selectedCamera.name}
                  </span>
                  <button
                    onClick={() => navigate('/alerts', { state: { camera: selectedCamera.name } })}
                    className="text-[10px] font-bold text-[#F97215] hover:text-orange-600 transition-colors flex items-center gap-1"
                  >
                    Voir tout <ExternalLink size={9} />
                  </button>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
                  {(() => {
                    const camAlerts = mockAlerts.filter(a => a.camera === selectedCamera.name);
                    // Build timeline: past events from mockAlerts + 'Maintenant'
                    const timelineEvents = camAlerts.slice(0, 4).map(a => ({
                      time: a.time.replace(':00', '').replace(' AM', '').replace(' PM', ''),
                      label: a.type.replace('Casque de Sécurité Manquant', 'Casque manquant')
                        .replace('Gilet de Sécurité Manquant', 'Gilet manquant')
                        .replace('Distance Dangereuse avec les Engins', 'Proximité engin')
                        .replace('Comportement Risqué en Zone de Levage', 'Comportement risqué')
                        .replace('Zone Interdite Franchie', 'Zone franchie'),
                      color: a.status === 'resolved' ? 'bg-emerald-400' :
                        a.severity === 'critical' ? 'bg-red-600' : 'bg-red-400',
                      resolved: a.status === 'resolved',
                    }));
                    timelineEvents.push({
                      time: 'Maintenant',
                      label: hasViolation ? '⚠ Alerte active' : '✓ Conforme',
                      color: hasViolation ? 'bg-red-500 animate-pulse' : 'bg-emerald-500',
                      resolved: false,
                    });
                    return timelineEvents.map((ev, i, arr) => (
                      <div key={i} className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => { setReplayTimestamp(ev.time); setIsReplayModalOpen(true); }}
                          className="flex flex-col items-center gap-1 hover:bg-gray-100 p-1.5 rounded-lg transition-colors group cursor-pointer"
                          title="Cliquer pour revoir ce moment"
                        >
                          <div className={`w-2.5 h-2.5 rounded-full ${ev.color} ${ev.resolved ? 'opacity-40' : 'group-hover:scale-125 transition-transform'}`} title={ev.label} />
                          <span className="text-[9px] text-gray-400 font-mono whitespace-nowrap">{ev.time}</span>
                          <span className={`text-[9px] font-semibold whitespace-nowrap max-w-[72px] text-center leading-tight ${ev.resolved ? 'text-gray-400 line-through' : 'text-gray-600 group-hover:text-[#F97215]'}`}>{ev.label}</span>
                        </button>
                        {i < arr.length - 1 && <div className="w-8 h-px bg-gray-200 shrink-0 mb-4" />}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* AI Detection results for selected camera */}
          {selectedCamera.status === 'active' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Detections */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-gray-700 font-bold text-sm flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <User size={15} className="text-gray-400" /> Résultats de Détection IA
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Ouvriers détectés', value: selectedCamera.detections.workers, check: null, confidence: 97 },
                    { label: 'Casques détectés', value: selectedCamera.detections.helmets, check: selectedCamera.detections.helmets >= selectedCamera.detections.workers, confidence: selectedCamera.detections.helmets >= selectedCamera.detections.workers ? 94 : 89 },
                    { label: 'Gilets de sécurité', value: selectedCamera.detections.vests, check: selectedCamera.detections.vests >= selectedCamera.detections.workers, confidence: selectedCamera.detections.vests >= selectedCamera.detections.workers ? 92 : 85 },
                    { label: 'Véhicules sur site', value: selectedCamera.detections.vehicles, check: null, confidence: 96 },
                  ].map(item => (
                    <div key={item.label} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${item.check === false ? 'bg-red-50/50 border-red-200' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                      <div className="flex flex-col gap-0.5">
                        <span className={`font-medium text-sm ${item.check === false ? 'text-red-700' : 'text-gray-600'}`}>{item.label}</span>
                        {/* IA Confidence — 3 explicit tiers with tooltip */}
                        {(() => {
                          const pct = item.confidence;
                          const tier = pct >= 90
                            ? { color: 'text-emerald-600', label: `Confiance élevée (${pct}%)`, dot: 'bg-emerald-400', help: 'Conditions optimales pour l\'IA' }
                            : pct >= 80
                              ? { color: 'text-amber-600', label: `Vérification recommandée (${pct}%)`, dot: 'bg-amber-400', help: 'Luminosité ou angle de vue sous-optimal' }
                              : { color: 'text-red-500', label: `Confiance faible (${pct}%) — vérifier manuellement`, dot: 'bg-red-500', help: 'Obstruction partielle ou conditions complexes' };
                          return (
                            <span
                              title={`Niveau de confiance IA : ${pct}%. ${tier.help}`}
                              className={`flex items-center gap-1.5 text-[10px] font-semibold ${tier.color} transition-colors hover:opacity-80 cursor-help w-max`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${tier.dot} shrink-0`} />
                              {tier.label}
                              <Info size={11} className="opacity-70" />
                            </span>
                          );
                        })()}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xl font-extrabold ${item.check === false ? 'text-red-600' : 'text-gray-800'}`}>{item.value}</span>
                        {item.check === true && <CheckCircle size={15} className="text-emerald-500" />}
                        {item.check === false && <AlertTriangle size={15} className="text-red-500" />}
                        {/* Adjust button */}
                        <button
                          onClick={() => setIsAdjustOpen(true)}
                          className="ml-1 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 group relative"
                          title="Ajuster manuellement ce comptage IA (correction de faux négatif/positif)"
                        >
                          <Edit2 size={13} />
                          <span className="absolute bottom-full right-0 mb-1.5 w-max max-w-[160px] bg-gray-800 text-white text-[10px] font-medium px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-10">
                            Ajuster le comptage IA
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* ── Context-Specific Detections (Project-Spec Phase 4) ── */}
                  <div className="mt-2 pt-3 border-t border-gray-100 space-y-2">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Détections Contextuelles IA</div>

                    {/* Proximity: Workers near Machinery */}
                    {(() => {
                      // Simulated: cameras covering 'engin' zones or with vehicles may detect proximity
                      const hasProximityRisk = selectedCamera.detections.vehicles > 0 && selectedCamera.detections.workers > 2;
                      return (
                        <div className={`flex items-start justify-between gap-2 p-3 rounded-xl border transition-colors ${
                          hasProximityRisk ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'
                        }`}>
                          <div className="flex items-start gap-2.5">
                            <Truck size={15} className={`shrink-0 mt-0.5 ${hasProximityRisk ? 'text-red-500' : 'text-gray-400'}`} />
                            <div>
                              <div className={`font-semibold text-sm ${hasProximityRisk ? 'text-red-700' : 'text-gray-600'}`}>
                                Proximité dangereuse engin
                              </div>
                              <div className={`text-[10px] font-semibold mt-0.5 ${hasProximityRisk ? 'text-red-500' : 'text-emerald-600'}`}>
                                {hasProximityRisk
                                  ? `⚠️ ${selectedCamera.detections.workers} ouvriers à moins de 3m d'un engin — Risque collision`
                                  : '✓ Aucune proximité dangereuse détectée'}
                              </div>
                            </div>
                          </div>
                          {hasProximityRisk && (
                            <span className="shrink-0 text-[10px] font-extrabold px-2 py-0.5 bg-red-600 text-white rounded-full animate-pulse">
                              CRITIQUE
                            </span>
                          )}
                        </div>
                      );
                    })()}

                    {/* Posture & Behavior Risk */}
                    {(() => {
                      const hasBehaviorRisk = selectedCamera.detections.workers > 3 && hasViolation;
                      return (
                        <div className={`flex items-start justify-between gap-2 p-3 rounded-xl border transition-colors ${
                          hasBehaviorRisk ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'
                        }`}>
                          <div className="flex items-start gap-2.5">
                            <BarChart2 size={15} className={`shrink-0 mt-0.5 ${hasBehaviorRisk ? 'text-amber-600' : 'text-gray-400'}`} />
                            <div>
                              <div className={`font-semibold text-sm ${hasBehaviorRisk ? 'text-amber-700' : 'text-gray-600'}`}>
                                Posture / Comportement à risque
                              </div>
                              <div className={`text-[10px] font-semibold mt-0.5 ${hasBehaviorRisk ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {hasBehaviorRisk
                                  ? '⚠️ Posture anormale détectée — analyse en cours'
                                  : '✓ Aucun comportement à risque détecté'}
                              </div>
                            </div>
                          </div>
                          {hasBehaviorRisk && (
                            <span className="shrink-0 text-[10px] font-extrabold px-2 py-0.5 bg-amber-500 text-white rounded-full">
                              MODÉRÉ
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                </div>
              </div>

              {/* Status & Location */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-gray-700 font-bold text-sm flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <MapPin size={15} className="text-gray-400" /> Informations & Emplacement
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Emplacement', value: selectedCamera.location },
                    { label: 'Orientation', value: selectedCamera.orientation },
                    { label: 'IPS', value: `${selectedCamera.fps} IPS` },
                    { label: 'Statut', value: selectedCamera.status === 'active' ? '● Actif & Enregistrement' : '⚙ En Maintenance' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-gray-400 font-semibold text-xs uppercase tracking-wide">{item.label}</span>
                      {item.label === 'Emplacement' ? (
                        <button onClick={() => navigate('/map', { state: { zone: selectedCamera.location } })} className="text-[#F97215] hover:text-orange-700 font-bold text-sm text-right flex items-center gap-1.5 focus:outline-none underline decoration-transparent hover:decoration-orange-400 underline-offset-2 transition-all group">
                          {item.value} <ExternalLink size={10} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ) : (
                        <span className="text-gray-700 font-bold text-sm text-right">{item.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent History — dynamic from mockAlerts filtered by camera */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-gray-700 font-bold text-sm flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <Activity size={15} className="text-gray-400" /> Dernières infractions (24h)
                </h3>
                <div className="space-y-3">
                  {(() => {
                    const camAlerts = mockAlerts.filter(a => a.camera === selectedCamera.name);
                    if (camAlerts.length === 0) return (
                      <div className="text-center py-4">
                        <CheckCircle size={28} className="mx-auto text-emerald-400 mb-2" />
                        <p className="text-xs text-gray-400 font-semibold">Aucune infraction enregistrée pour cette caméra</p>
                      </div>
                    );
                    return camAlerts.slice(0, 3).map(a => {
                      // Violation-type icon for visual distinction
                      const isZoneViolation = a.type.toLowerCase().includes('zone');
                      const isHelmet = a.type.toLowerCase().includes('casque');
                      const isVest = a.type.toLowerCase().includes('gilet');
                      const icon = isZoneViolation ? '⛔'
                        : isHelmet ? '⛑'
                          : isVest ? '🦺'
                            : '⚠️';
                      return (
                        <div key={a.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${a.status === 'resolved' ? 'bg-emerald-400' :
                            a.severity === 'critical' ? 'bg-red-600' : 'bg-red-400'
                            }`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                              <span title={isZoneViolation ? 'Violation de zone' : isHelmet ? 'EPI casque' : isVest ? 'EPI gilet' : 'Alerte'}>{icon}</span>
                              {a.type}
                            </div>
                            <div className="text-xs text-gray-500">
                              {a.status === 'resolved' ? '✔ Résolu' : '⚠ Actif'} • {a.time}
                              {a.id > 3 ? ` • Incident #${a.id + 400}` : ''}
                            </div>
                          </div>
                        </div>
                      );
                    });

                  })()}
                  <button
                    onClick={() => navigate('/alerts', { state: { camera: selectedCamera.name, location: selectedCamera.location } })}
                    className="w-full text-center text-xs font-bold text-gray-500 hover:text-[#F97215] py-2 transition-colors"
                  >
                    Voir tout l'historique →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ⛔ Zone Interdite Franchie — CRITIQUE panel (shown BEFORE EPI since more dangerous) */}
          {(() => {
            const activeZoneViolation = mockAlerts.find(
              a => a.camera === selectedCamera.name &&
                a.type === 'Zone Interdite Franchie' &&
                a.status === 'active'
            );
            if (!activeZoneViolation) return null;
            return (
              <div className="bg-red-900 text-white rounded-2xl border border-red-700 shadow-lg p-5 relative overflow-hidden">
                {/* Pulsing background accent */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-800/60 to-red-950/80 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-red-200 text-xl">⛔</span>
                      <h3 className="font-extrabold text-base text-white">Zone Interdite Franchie — CRITIQUE</h3>
                    </div>
                    <span className="bg-red-500 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-red-300 animate-pulse">
                      ACTIF
                    </span>
                  </div>
                  <p className="text-red-100 text-sm mb-4 leading-relaxed">
                    {activeZoneViolation.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-red-100 font-semibold mb-5">
                    <button
                      onClick={() => navigate('/map', { state: { zone: activeZoneViolation.zone } })}
                      className="flex items-center gap-1.5 focus:outline-none hover:text-white transition-colors group"
                      title="Voir la zone critique sur le plan du site"
                    >
                      <MapPin size={13} className="text-red-400 group-hover:text-red-300" />
                      <span className="underline decoration-red-400 decoration-dashed group-hover:decoration-solid underline-offset-4">{activeZoneViolation.zone}</span>
                      <ExternalLink size={10} className="text-red-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <span className="flex items-center gap-1.5 bg-red-950/50 px-2.5 py-1 rounded-md border border-red-800"><Clock size={12} className="text-red-400" /> Détecté à {activeZoneViolation.time}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => openModal('zone')}
                      className="flex-1 bg-white text-red-700 hover:bg-red-50 py-2.5 rounded-xl font-bold text-sm transition shadow-md flex items-center justify-center gap-2"
                    >
                      <AlertTriangle size={15} /> {hasViolation ? "Créer Incident Multiples (Zone + EPI)" : "Créer Incident CRITIQUE"}
                    </button>
                    <button
                      onClick={() => navigate('/alerts')}
                      className="flex-1 bg-red-700 hover:bg-red-600 border border-red-500 text-white py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
                    >
                      Voir l'alerte complète →
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {hasViolation && (
            <div className="relative mt-2 bg-white rounded-2xl border-2 border-red-300 shadow-[0_10px_40px_-10px_rgba(239,68,68,0.3)] p-5 animate-in slide-in-from-bottom-5 duration-300">
              <h3 className="text-gray-700 font-bold text-sm flex items-center gap-2 mb-4 pb-3 border-b border-red-100">
                <AlertTriangle size={15} className="text-red-500" />
                <span className="text-red-600">Violation EPI détectée en direct</span>
                <span className={`ml-auto text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${violationSeverityColor}`}>
                  {violationSeverity}
                </span>
              </h3>
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4 mb-3">
                <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />
                <span className="text-red-700 font-semibold text-sm">{violationText}</span>
              </div>
              {/* Confidence warning — shows when the triggering detection is <90% confidence */}
              {(() => {
                const triggerConf = missingVests > 0
                  ? (selectedCamera.detections.vests >= selectedCamera.detections.workers ? 92 : 85)
                  : (selectedCamera.detections.helmets >= selectedCamera.detections.workers ? 94 : 89);
                if (triggerConf >= 90) return null;
                const isLow = triggerConf < 80;
                const cls = isLow
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'bg-amber-50 border-amber-200 text-amber-700';
                return (
                  <div className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 mb-3 text-xs font-semibold ${cls}`}>
                    <AlertTriangle size={13} className="shrink-0" />
                    <span>
                      Confiance IA : <strong>{triggerConf}%</strong> — {isLow ? 'Confiance faible' : 'Vérification recommandée'} avant de créer un incident officiel.
                      <button
                        onClick={handleCaptureFrame}
                        className="ml-2 underline font-bold hover:opacity-75 transition"
                      >
                        Capturer frame pour vérifier
                      </button>
                    </span>
                  </div>
                );
              })()}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => openModal('epi')}
                  className="flex-[3] bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2"
                >
                  <FileText size={16} /> Confirmer &amp; Créer un Incident
                </button>
                <button
                  onClick={handleIgnore}
                  className="flex-[2] bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2"
                  title="Marquer cette détection comme faux positif et passer à la prochaine alerte"
                >
                  <XCircle size={16} /> Ignorer (Faux Positif)
                </button>
              </div>
            </div>
          )}

          {/* All clear banner — compliance duration + named bidirectional navigation */}
          {selectedCamera.status === 'active' && !hasViolation && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle size={20} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-emerald-700 text-sm flex items-center gap-2">
                    Ouvriers en conformité EPI
                    {certifiedComplianceTime && (
                      <span className="bg-emerald-200 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-sm font-extrabold uppercase tracking-widest shadow-sm">Certifié à {formatLastCheck(certifiedComplianceTime)}</span>
                    )}
                  </div>
                  <div className="text-emerald-600 text-xs mt-0.5 flex flex-wrap items-center gap-x-2">
                    <span>Aucune violation détectée sur {selectedCamera.name}.</span>
                    {/* Compliance duration with tooltip explaining the calculation basis */}
                    <span
                      className="font-bold cursor-help border-b border-dashed border-emerald-400"
                      title="Durée calculée depuis la sélection de cette caméra — pas depuis la dernière détection IA"
                    >
                      Conforme depuis {getComplianceDuration()}.
                    </span>
                    {!certifiedComplianceTime && (
                      <button
                        onClick={() => setCertifiedComplianceTime(new Date())}
                        className="mt-3 sm:mt-0 sm:ml-4 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-md flex items-center gap-2"
                        title="Ajouter au rapport journalier"
                      >
                        <CheckCircle size={14} />
                        Certifier l'inspection conforme
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {/* Named bidirectional navigation — shows target camera name */}
              {!autoCycle && filteredCameraList.length > 1 && (() => {
                const idx = filteredCameraList.findIndex(c => c.id === selectedCamera.id);
                const prevCam = filteredCameraList[(idx - 1 + filteredCameraList.length) % filteredCameraList.length];
                const nextCam = filteredCameraList[(idx + 1) % filteredCameraList.length];
                return (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleSelectCamera(prevCam)}
                      title={`Aller à ${prevCam.name} — ${prevCam.location}`}
                      className="flex items-center gap-2 px-3 py-2 border border-emerald-300 bg-white text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition"
                    >
                      ← {prevCam.name}
                    </button>
                    <button
                      onClick={() => handleSelectCamera(nextCam)}
                      title={`Aller à ${nextCam.name} — ${nextCam.location}`}
                      className="flex items-center gap-2 px-3 py-2 border border-emerald-300 bg-white text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition"
                    >
                      {nextCam.name} →
                    </button>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Maintenance section — uncovered zones shown FIRST (priority), then maintenance details */}
          {selectedCamera.status === 'maintenance' && (
            <div className="space-y-3">

              {/* ① Uncovered zones warning — shown first as highest priority safety alert */}
              {uncoveredZones.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <WifiOff size={18} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-red-700 text-sm mb-1">⚠ Zone(s) non surveillée(s)</div>
                      <div className="text-red-600 text-xs">
                        Les zones suivantes ne sont plus couvertes par aucune caméra active :{' '}
                        <strong>{uncoveredZones.join(', ')}</strong>.
                        Envisagez une inspection de substitution.
                      </div>
                    </div>
                  </div>
                  {/* Action buttons for uncovered zones */}
                  <div className="flex flex-wrap items-center gap-4 ml-7">
                    <button
                      onClick={() => navigate('/drones', { state: { zone: uncoveredZones[0], reason: `Substitution caméra ${selectedCamera.name} hors ligne` } })}
                      className="flex items-center gap-2 text-sm font-extrabold px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition shadow-[0_0_15px_rgba(220,38,38,0.4)] ring-2 ring-offset-1 ring-red-400 animate-pulse"
                    >
                      🚁 Déployer un drone immédiatement →
                    </button>
                    <button
                      onClick={() => addToast('Redirection vers Inspection Photo manuelle (Simulation)', 'info')}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-2.5 bg-white border-2 border-red-200 text-red-700 rounded-xl hover:bg-red-50 transition"
                    >
                      📷 Inspection photo manuelle
                    </button>
                  </div>
                </div>
              )}

              {/* ② Proactive alert: other cameras with active violations */}
              {(() => {
                const otherAlertCams = cameraList.filter(c =>
                  c.id !== selectedCamera.id &&
                  c.status === 'active' &&
                  !clearedAlerts.includes(c.id) &&
                  (c.detections.vests < c.detections.workers || c.detections.helmets < c.detections.workers)
                );
                if (otherAlertCams.length === 0) return null;
                return (
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertTriangle size={18} className="text-orange-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-orange-700 text-sm mb-1">
                        {otherAlertCams.length} violation{otherAlertCams.length > 1 ? 's' : ''} active{otherAlertCams.length > 1 ? 's' : ''} sur d'autres caméras
                      </div>
                      <div className="text-orange-600 text-xs mb-2">
                        {otherAlertCams.map(c => c.name).join(', ')} — des violations EPI nécessitent votre attention.
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {otherAlertCams.slice(0, 3).map(c => (
                          <button
                            key={c.id}
                            onClick={() => handleSelectCamera(c)}
                            className="text-xs font-bold px-3 py-1.5 bg-white border border-orange-200 text-orange-700 rounded-xl hover:bg-orange-100 transition"
                          >
                            Voir {c.name} →
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ③ Maintenance details panel */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shrink-0">
                      <AlertTriangle size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-amber-800 text-sm">Caméra hors ligne — {selectedCamera.name}</div>
                      <div className="text-amber-700 text-xs mt-0.5 flex items-center gap-1.5">
                        <Clock size={11} /> Hors ligne depuis <strong>{maintenanceSince}</strong>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsIncidentOpen(true)}
                    className="bg-white border border-amber-200 hover:bg-amber-100 text-amber-800 py-2.5 px-5 rounded-xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 shrink-0"
                  >
                    Créer un ticket de maintenance
                  </button>
                </div>
                {/* Maintenance detail cards: Motif / Technicien / Retour estimé */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-amber-200 pt-4">
                  {[
                    { label: 'Motif', value: maintenanceDetails.reason },
                    { label: 'Technicien', value: maintenanceDetails.technician },
                    { label: 'Retour estimé', value: maintenanceDetails.estimatedReturn },
                  ].map(item => (
                    <div key={item.label} className="bg-white border border-amber-100 rounded-xl p-3">
                      <div className="text-amber-500 text-[10px] font-bold uppercase tracking-wide mb-1">{item.label}</div>
                      <div className="text-amber-800 text-xs font-semibold">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instantiated Modals */}
      <CreateIncidentModal isOpen={isIncidentOpen} onClose={() => setIsIncidentOpen(false)} />
      <CreateReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
      <VideoReplayModal isOpen={isReplayModalOpen} onClose={() => { setIsReplayModalOpen(false); setReplayTimestamp(undefined); }} timestamp={replayTimestamp} />
      <CountAdjustModal isOpen={isAdjustOpen} onClose={() => setIsAdjustOpen(false)} />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon, bg, onClick, clickable }: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  bg: string;
  onClick?: () => void;
  clickable?: boolean;
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start justify-between gap-2 transition-shadow w-full text-left
        ${clickable ? 'hover:shadow-lg cursor-pointer ring-2 ring-red-100 hover:ring-red-300' : 'hover:shadow-md'}`}
      title={clickable ? 'Cliquer pour filtrer les caméras en alerte' : undefined}
    >
      <div>
        <div className="text-gray-500 text-sm font-medium mb-1.5">{label}</div>
        <div className="text-3xl font-extrabold text-gray-800 mb-1.5">{value}</div>
        <div className={`text-xs font-semibold ${clickable ? 'text-red-400' : 'text-gray-400'}`}>{sub}</div>
      </div>
      <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
        {icon}
        {/* Pulse ring when there are active alerts */}
        {clickable && (
          <span className="absolute inset-0 rounded-xl animate-ping bg-red-400 opacity-20" />
        )}
      </div>
    </Tag>
  );
}

