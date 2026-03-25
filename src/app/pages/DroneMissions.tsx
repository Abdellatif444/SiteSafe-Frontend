import { useState, useEffect, useRef } from 'react';
import {
  Plane, Calendar, MapPin, Clock, Play,
  CheckCircle, AlertTriangle, Plus, X, Circle,
  FileText, Video, Edit2, RotateCw, BatteryLow,
  XCircle, Edit, Filter, Search, ChevronDown, SlidersHorizontal
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useToast } from '../context/ToastContext';
import { CreateIncidentModal } from '../components/CreateIncidentModal';
import { CreateReportModal } from '../components/Modals';
import { GenericConfirmModal } from '../components/AdvancedModals';

// ─── Types & Data ─────────────────────────────────────────────────────────────

import { mockDroneMissions as initialMissions, mockDroneAnomalies as detectedAnomalies, Mission } from '../data/mockData';

// ─── Style Config ─────────────────────────────────────────────────────────────

const S = {
  'completed':   { label: 'Terminée',  icon: <CheckCircle size={13}/>, badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'in-progress': { label: 'En Cours',  icon: <Circle size={13}/>,      badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  'scheduled':   { label: 'Planifiée', icon: <Clock size={13}/>,       badge: 'bg-slate-100 text-slate-600 border-slate-200' },
  'cancelled':   { label: 'Annulée',   icon: <XCircle size={13}/>,     badge: 'bg-red-50 text-red-600 border-red-200' },
};

// ─── Filter types ─────────────────────────────────────────────────────────────

type FilterState = {
  search: string;
  drone: string;
  date: string;
  status: string;
  zone: string;
};

const EMPTY_FILTERS: FilterState = { search: '', drone: '', date: '', status: '', zone: '' };

function hasActiveFilters(f: FilterState) {
  return Object.values(f).some(v => v !== '');
}

// ─── Non-Conformité Modal ─────────────────────────────────────────────────────

function NonConformiteModal({
  open, anomaly, missionName, onValidate, onReject, onClose,
}: {
  open: boolean;
  anomaly: { id: number; type: string; location: string; timestamp: string; severity: string; image: string } | null;
  missionName: string;
  onValidate: (comment: string) => void;
  onReject: (comment: string) => void;
  onClose: () => void;
}) {
  const [comment, setComment] = useState('');
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open) {
      setComment(''); setProgress(0); setPlaying(false); setElapsed(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [open]);

  const startVideo = () => {
    if (playing) return;
    setPlaying(true);
    let t = 0;
    timerRef.current = setInterval(() => {
      t += 0.1; setElapsed(t);
      setProgress(Math.min((t / 10) * 100, 100));
      if (t >= 10) clearInterval(timerRef.current!);
    }, 100);
  };

  if (!open || !anomaly) return null;

  const severityColor =
    anomaly.severity === 'Critique' ? 'bg-red-500 text-white' :
    anomaly.severity === 'Élevé'    ? 'bg-orange-500 text-white' :
    anomaly.severity === 'Moyen'    ? 'bg-amber-500 text-white' :
                                      'bg-slate-500 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
          <div>
            
            <h3 className="font-bold text-gray-800 text-base">Examen de la violation HSE</h3>
            
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition shrink-0 mt-0.5">
            <XCircle size={14} />
          </button>
        </div>
        {/* Video */}
        <div className="relative bg-gray-900 h-48 flex items-center justify-center overflow-hidden">
          <ImageWithFallback src={anomaly.image} alt={anomaly.type}
            className={`w-full h-full object-cover transition-opacity duration-300 ${playing ? 'opacity-50' : 'opacity-25'}`} />
          {!playing && (
            <button onClick={startVideo} className="absolute inset-0 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95">
                  <Play size={20} className="text-white ml-1" />
                </div>
                <span className="text-white/70 text-xs font-medium">Lire le segment (10s)</span>
              </div>
            </button>
          )}
          {playing && (
            <>
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full">
                <Circle size={6} className="fill-orange-400 text-orange-400 animate-pulse" />
                <span className="text-white text-[10px] font-bold tracking-wide">EXTRAIT DRONE</span>
              </div>
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full text-white text-[10px] font-mono">
                0:{String(Math.min(Math.floor(elapsed), 10)).padStart(2, '0')} / 0:10
              </div>
              <div className="absolute top-1/3 right-1/4 border-2 border-red-500 rounded-lg p-1 animate-pulse z-10">
                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">{anomaly.type} ⚠</span>
              </div>
            </>
          )}
          <div className="absolute bottom-3 left-3 z-10">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm ${severityColor}`}>{anomaly.severity}</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <div className="h-1 bg-orange-500 transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
        </div>
        {/* Info */}
        <div className="mx-5 mt-4 bg-orange-50 border border-orange-200 rounded-xl p-3.5 flex gap-3">
          <AlertTriangle size={16} className="text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-800">{anomaly.type}</p>
            <p className="text-xs text-orange-600 mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full text-[10px] font-bold">IA Drone · 91% confiance</span>
              Détecté à {anomaly.timestamp}
            </p>
          </div>
        </div>
        {/* Comment */}
        <div className="px-5 mt-4">
          <label className="text-xs text-gray-500 font-medium flex items-center gap-1 mb-1.5">
            <Edit size={11} /> Commentaire (optionnel)
          </label>
          <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2}
            placeholder="Ex : Anomalie confirmée sur vue aérienne, intervention requise…"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:border-orange-300 focus:bg-white resize-none transition" />
        </div>
        {/* Actions */}
        <div className="flex gap-3 px-5 py-4">
          <button onClick={() => onValidate(comment)}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold text-sm transition shadow-sm">
            <CheckCircle size={15} /> Valider 
          </button>
          <button onClick={() => onReject(comment)}
            className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-red-300 hover:text-red-600 text-gray-600 py-2.5 rounded-xl font-bold text-sm transition">
            <XCircle size={15} /> Rejeter
          </button>
        </div>
        
      </div>
    </div>
  );
}

// ─── Filter Chip ──────────────────────────────────────────────────────────────

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-[11px] font-semibold px-2.5 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="text-orange-400 hover:text-orange-600 transition">
        <X size={10} />
      </button>
    </span>
  );
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────

function FilterPanel({
  filters, onChange, onReset, missions,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onReset: () => void;
  missions: Mission[];
}) {
  const uniqueDrones = [...new Set(missions.map(m => m.drone).filter(Boolean))].sort();
  const uniqueZones  = [...new Set(missions.map(m => m.zone).filter(Boolean))].sort();

  const set = (key: keyof FilterState, val: string) => onChange({ ...filters, [key]: val });
  const active = hasActiveFilters(filters);

  return (
    <div >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
         
          {active && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {Object.values(filters).filter(v => v !== '').length}
            </span>
          )}
        </div>
        {active && (
          <button onClick={onReset} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 font-semibold transition">
            <X size={12} /> Réinitialiser tout
          </button>
        )}
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">

        {/* Search name */}
        <div className="relative xl:col-span-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input type="text" placeholder="Rechercher par nom de mission…"
            value={filters.search}
            onChange={e => set('search', e.target.value)}
            className={`w-full pl-8 pr-8 py-2 bg-gray-50 border rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition placeholder-gray-400
              ${filters.search ? 'border-orange-300 bg-orange-50/50' : 'border-gray-200'}`}
          />
          {filters.search && (
            <button onClick={() => set('search', '')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={12} />
            </button>
          )}
        </div>

        {/* Status */}
        <div className="relative">
          <select value={filters.status} onChange={e => set('status', e.target.value)}
            className={`w-full appearance-none pl-3 pr-7 py-2 bg-gray-50 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition cursor-pointer
              ${filters.status ? 'border-orange-300 bg-orange-50/50 text-orange-700' : 'border-gray-200 text-gray-500'}`}
          >
            <option value="">Tous les statuts</option>
            <option value="in-progress">En cours</option>
            <option value="scheduled">Planifiée</option>
            <option value="completed">Terminée</option>
            <option value="cancelled">Annulée</option>
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Zone */}
        <div className="relative">
          {uniqueZones.length > 0 ? (
            <>
              <select value={filters.zone} onChange={e => set('zone', e.target.value)}
                className={`w-full appearance-none pl-3 pr-7 py-2 bg-gray-50 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition cursor-pointer
                  ${filters.zone ? 'border-orange-300 bg-orange-50/50 text-orange-700' : 'border-gray-200 text-gray-500'}`}
              >
                <option value="">Toutes les zones</option>
                {uniqueZones.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </>
          ) : (
            <>
              <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="text" placeholder="Zone…" value={filters.zone} onChange={e => set('zone', e.target.value)}
                className={`w-full pl-8 pr-3 py-2 bg-gray-50 border rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition placeholder-gray-400
                  ${filters.zone ? 'border-orange-300 bg-orange-50/50' : 'border-gray-200'}`}
              />
            </>
          )}
        </div>

        {/* Drone */}
        <div className="relative">
          {uniqueDrones.length > 0 ? (
            <>
              <select value={filters.drone} onChange={e => set('drone', e.target.value)}
                className={`w-full appearance-none pl-3 pr-7 py-2 bg-gray-50 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition cursor-pointer
                  ${filters.drone ? 'border-orange-300 bg-orange-50/50 text-orange-700' : 'border-gray-200 text-gray-500'}`}
              >
                <option value="">Tous les drones</option>
                {uniqueDrones.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </>
          ) : (
            <>
              <Plane size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="text" placeholder="Drone…" value={filters.drone} onChange={e => set('drone', e.target.value)}
                className={`w-full pl-8 pr-3 py-2 bg-gray-50 border rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition placeholder-gray-400
                  ${filters.drone ? 'border-orange-300 bg-orange-50/50' : 'border-gray-200'}`}
              />
            </>
          )}
        </div>

        {/* Date */}
        <div className="relative">
          <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
          <input type="date" value={filters.date} onChange={e => set('date', e.target.value)}
            className={`w-full pl-8 pr-8 py-2 bg-gray-50 border rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition
              ${filters.date ? 'border-orange-300 bg-orange-50/50' : 'border-gray-200'}`}
          />
          {filters.date && (
            <button onClick={() => set('date', '')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      

      {/* Active filter chips */}
      {active && (
        <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
          {filters.search && <FilterChip label={`Nom : "${filters.search}"`} onRemove={() => set('search', '')} />}
          {filters.status && <FilterChip label={`Statut : ${S[filters.status as keyof typeof S]?.label ?? filters.status}`} onRemove={() => set('status', '')} />}
          {filters.zone && <FilterChip label={`Zone : ${filters.zone}`} onRemove={() => set('zone', '')} />}
          {filters.drone && <FilterChip label={`Drone : ${filters.drone}`} onRemove={() => set('drone', '')} />}
          {filters.date && <FilterChip label={`Date : ${filters.date}`} onRemove={() => set('date', '')} />}
        </div>
      )}
    </div>
  );
}

// ─── Mission Card ─────────────────────────────────────────────────────────────

function MissionCard({
  mission, anomalies, onOpenAnomaly, onStartMission, onRestartMission, onOpenReport, onEditMission,
}: {
  mission: Mission;
  anomalies: typeof detectedAnomalies;
  onOpenAnomaly: (anomaly: typeof detectedAnomalies[0]) => void;
  onStartMission: () => void;
  onRestartMission: () => void;
  onOpenReport: () => void;
  onEditMission: () => void;
}) {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const videoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startLiveVideo = () => {
    if (videoPlaying) return;
    setVideoPlaying(true);
    let t = 0;
    videoTimerRef.current = setInterval(() => {
      t += 0.5;
      setVideoProgress(Math.min((t / 60) * 100, 100));
      if (t >= 60) { clearInterval(videoTimerRef.current!); setVideoProgress(100); }
    }, 500);
  };

  const missionAnomalies = anomalies.slice(0, mission.anomalies);
  const hasAnomalies = mission.anomalies > 0;
  const battery = Math.max(8, 78 - (mission.id * 17) % 65);
  const isLow = battery < 25;
  const isCritical = battery < 15;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md ${hasAnomalies ? 'border-red-200' : 'border-gray-200'}`}>
      <div className={`h-1 w-full ${
        mission.status === 'in-progress' ? 'bg-blue-500' :
        mission.status === 'completed'   ? 'bg-emerald-500' :
        mission.status === 'cancelled'   ? 'bg-red-400' : 'bg-slate-300'
      }`} />

      {(mission.status === 'in-progress' || mission.status === 'completed') ? (
        <div className="relative aspect-video bg-gray-900 overflow-hidden">
          <ImageWithFallback src={missionAnomalies[0]?.image || ''} alt={mission.name}
            className={`w-full h-full object-cover transition-opacity duration-500 ${videoPlaying ? 'opacity-60' : 'opacity-40'}`} />
          {videoPlaying && hasAnomalies && (
            <div className="absolute top-1/3 right-1/4 border-2 border-red-500 rounded-lg p-1 animate-pulse z-10">
              <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Anomalie ⚠</span>
            </div>
          )}
          {mission.status === 'in-progress' && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full z-10">
              <Circle size={6} className="fill-red-500 text-red-500 animate-pulse" />
              <span className="text-white text-[10px] font-bold tracking-wide">EN DIRECT</span>
            </div>
          )}
          {mission.status === 'completed' && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full z-10">
              <CheckCircle size={10} className="text-emerald-400" />
              <span className="text-white text-[10px] font-bold tracking-wide">ENREGISTREMENT</span>
            </div>
          )}
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full z-10">
            <span className="text-white text-[10px] font-mono">{mission.time}</span>
          </div>
          {!videoPlaying && (
            <button onClick={startLiveVideo} className="absolute inset-0 flex items-center justify-center z-10 group">
              <div className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition group-hover:scale-105">
                <Play size={18} className="text-white ml-0.5" />
              </div>
            </button>
          )}
          {videoPlaying && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div className="h-1 bg-orange-400 transition-all duration-500" style={{ width: `${videoProgress}%` }} />
            </div>
          )}
          {hasAnomalies && (
            <div className="absolute bottom-3 right-3 z-20">
              <button onClick={() => onOpenAnomaly(missionAnomalies[0])}
                className="flex items-center gap-1.5 bg-red-500/90 hover:bg-red-600/90 backdrop-blur-sm text-white px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition shadow-lg animate-pulse hover:animate-none">
                <AlertTriangle size={11} />
                {mission.anomalies} alerte{mission.anomalies > 1 ? 's' : ''} détectée{mission.anomalies > 1 ? 's' : ''}
              </button>
            </div>
          )}
          {mission.status === 'in-progress' && (
            <div className={`absolute bottom-3 left-3 z-10 flex items-center gap-1.5 px-2 py-1 rounded-lg backdrop-blur-sm ${
              isCritical ? 'bg-red-500/80' : isLow ? 'bg-amber-500/80' : 'bg-black/50'
            }`}>
              <BatteryLow size={11} className={isCritical ? 'text-white animate-pulse' : isLow ? 'text-white' : 'text-white/70'} />
              <span className="text-white text-[10px] font-bold">{battery}%</span>
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-video bg-gray-50 flex items-center justify-center border-b border-gray-100">
          <div className="text-center">
            <div className={`w-12 h-12 rounded-2xl mx-auto mb-2 flex items-center justify-center ${mission.status === 'scheduled' ? 'bg-slate-100' : 'bg-red-50'}`}>
              <Plane size={22} className={mission.status === 'scheduled' ? 'text-slate-400' : 'text-red-300'} />
            </div>
            <p className="text-gray-400 text-xs font-medium">
              {mission.status === 'scheduled' ? 'Mission Planifiée' : 'Mission annulée'}
            </p>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-800 text-sm leading-tight truncate">{mission.name}</h3>
            <p className="text-gray-400 text-[11px] font-medium mt-0.5">Mission #{mission.id}</p>
          </div>
          <span className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${S[mission.status].badge}`}>
            {S[mission.status].icon} {S[mission.status].label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <MapPin size={12} className="text-gray-400 shrink-0" /><span className="truncate">{mission.zone}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Plane size={12} className="text-gray-400 shrink-0" /><span className="truncate">{mission.drone}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Calendar size={12} className="text-gray-400 shrink-0" /><span>{mission.date}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Clock size={12} className="text-gray-400 shrink-0" /><span>{mission.time}</span>
          </div>
        </div>

        {hasAnomalies && (
          <div className="mb-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-500 shrink-0" />
              <span className="text-red-700 text-xs font-semibold">
                {mission.anomalies} violation{mission.anomalies > 1 ? 's' : ''} HSE détectée{mission.anomalies > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {missionAnomalies.map((anomaly) => (
                <button key={anomaly.id} onClick={() => onOpenAnomaly(anomaly)}
                  title={`Examiner : ${anomaly.type} — ${anomaly.severity}`}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition hover:scale-110 active:scale-95 shadow-sm ${
                    anomaly.severity === 'Critique' ? 'bg-red-500 hover:bg-red-600' :
                    anomaly.severity === 'Élevé'    ? 'bg-orange-500 hover:bg-orange-600' :
                    anomaly.severity === 'Moyen'    ? 'bg-amber-500 hover:bg-amber-600' :
                                                      'bg-slate-500 hover:bg-slate-600'
                  }`}>
                  <AlertTriangle size={13} className="text-white" />
                </button>
              ))}
            </div>
          </div>
        )}

        {!hasAnomalies && mission.status === 'completed' && (
          <div className="mb-3 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center gap-2">
            <CheckCircle size={13} className="text-emerald-500 shrink-0" />
            <span className="text-emerald-700 text-xs font-semibold">Aucune anomalie détectée</span>
          </div>
        )}

        <div className="flex gap-2 pt-3 border-t border-gray-100">
          {mission.status === 'scheduled' && (
            <>
              <button onClick={onEditMission}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition">
                <Edit2 size={13} /> Modifier
              </button>
              <button onClick={onStartMission}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#F97215] hover:bg-[#ea660c] text-white rounded-xl text-xs font-bold transition shadow-sm shadow-orange-200">
                <Play size={13} /> Démarrer
              </button>
            </>
          )}
          {mission.status === 'cancelled' && (
            <button onClick={onRestartMission}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold transition">
              <RotateCw size={13} /> Relancer
            </button>
          )}
          {mission.status === 'in-progress' && (
            <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold">
              <Video size={13} className="animate-pulse" /> Mission en vol
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DroneMissions() {
  const [missionsList, setMissionsList] = useState(initialMissions);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', zone: '', date: '', time: '', drone: '', duration: '', flightPath: '' });

  // ── Filter state ──
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const { addToast } = useToast();
  const [isIncidentOpen, setIsIncidentOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isConfirmStartOpen, setIsConfirmStartOpen] = useState(false);
  const [isConfirmRestartOpen, setIsConfirmRestartOpen] = useState(false);
  const [pendingMissionId, setPendingMissionId] = useState<number | null>(null);

  // ── Non-Conformité Modal ──
  const [showNonConformiteModal, setShowNonConformiteModal] = useState(false);
  const [activeAnomaly, setActiveAnomaly] = useState<typeof detectedAnomalies[0] | null>(null);
  const [activeMissionName, setActiveMissionName] = useState('');
  const [rejectedAnomalies, setRejectedAnomalies] = useState<number[]>([]);

  const openAnomaly = (anomaly: typeof detectedAnomalies[0], missionName: string) => {
    setActiveAnomaly(anomaly);
    setActiveMissionName(missionName);
    setShowNonConformiteModal(true);
  };

  // ── Filter logic ──
  const filteredMissions = missionsList.filter(m => {
    if (filters.search && !m.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.status && m.status !== filters.status) return false;
    if (filters.zone && m.zone !== filters.zone) return false;
    if (filters.drone && m.drone !== filters.drone) return false;
    if (filters.date && m.date !== filters.date) return false;
    return true;
  });

  const handleCreateMission = (e: React.FormEvent) => {
    e.preventDefault();
    const newMission: Mission = {
      id: missionsList.length + 1,
      name: formData.name || 'Nouvelle Mission Drone',
      zone: formData.zone, date: formData.date, time: formData.time,
      duration: formData.duration, drone: formData.drone,
      status: 'scheduled', images: 0, anomalies: 0, flightPath: formData.flightPath,
    };
    setMissionsList([newMission, ...missionsList]);
    setFormData({ name: '', zone: '', date: '', time: '', drone: '', duration: '', flightPath: '' });
    setShowForm(false);
    addToast('Mission planifiée avec succès.', 'success');
  };

  const completed      = missionsList.filter(m => m.status === 'completed').length;
  const inProgress     = missionsList.filter(m => m.status === 'in-progress').length;
  const scheduled      = missionsList.filter(m => m.status === 'scheduled').length;
  const totalAnomalies = missionsList.reduce((s, m) => s + m.anomalies, 0);
  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className="bg-[#F4F7FC] font-sans min-h-full">

      {/* ── Non-Conformité Modal ── */}
      <NonConformiteModal
        open={showNonConformiteModal}
        anomaly={activeAnomaly}
        missionName={activeMissionName}
        onValidate={(comment) => {
          setShowNonConformiteModal(false);
          addToast({ type: 'success', message: `Non-conformité validée — incident créé${comment ? ' : ' + comment.slice(0, 40) : ''}` });
          setIsIncidentOpen(true);
        }}
        onReject={(comment) => {
          setShowNonConformiteModal(false);
          if (activeAnomaly) setRejectedAnomalies(prev => [...prev, activeAnomaly.id]);
          addToast({ type: 'info', message: 'Détection rejetée comme fausse alerte.' });
        }}
        onClose={() => setShowNonConformiteModal(false)}
      />

    
         

      <div className="px-8 py-6 pb-32 space-y-5 max-w-[1600px] mx-auto">

        {/* ── Filter Panel ── */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(EMPTY_FILTERS)}
            missions={missionsList}
          />

          {/* ── New Mission ── */}
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#F97215] text-white rounded-xl text-sm font-bold hover:bg-[#ea660c] transition shadow-md shadow-orange-200"
            >
              <Plus size={16} /> Nouvelle Mission
            </button>

        </div>
          
        


        {/* ── Results count when filters active ── */}
        {hasActiveFilters(filters) && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">
              <span className="font-bold text-gray-700">{filteredMissions.length}</span>{' '}
              mission{filteredMissions.length !== 1 ? 's' : ''} trouvée{filteredMissions.length !== 1 ? 's' : ''} sur {missionsList.length}
            </p>
            <button onClick={() => setFilters(EMPTY_FILTERS)}
              className="text-xs text-orange-500 hover:text-orange-700 font-bold transition flex items-center gap-1">
              <X size={12} /> Effacer les filtres
            </button>
          </div>
        )}

        {/* ── Cards Grid ── */}
        {filteredMissions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredMissions.map(mission => (
              <MissionCard
                key={mission.id}
                mission={mission}
                anomalies={detectedAnomalies.filter(a => !rejectedAnomalies.includes(a.id))}
                onOpenAnomaly={(anomaly) => openAnomaly(anomaly, mission.name)}
                onStartMission={() => { setPendingMissionId(mission.id); setIsConfirmStartOpen(true); }}
                onRestartMission={() => { setPendingMissionId(mission.id); setIsConfirmRestartOpen(true); }}
                onOpenReport={() => setIsReportOpen(true)}
                onEditMission={() => setShowForm(true)}
              />
            ))}
          </div>
        ) : hasActiveFilters(filters) ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-600 text-base mb-1">Aucune mission ne correspond</h3>
            <p className="text-gray-400 text-sm mb-4">Essayez de modifier ou supprimer vos filtres actifs.</p>
            <button onClick={() => setFilters(EMPTY_FILTERS)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-bold transition">
              <X size={14} /> Effacer les filtres
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-4">
              <Plane size={28} className="text-[#F97215]" />
            </div>
            <h3 className="font-bold text-gray-700 text-lg mb-1">Aucune mission planifiée</h3>
            <p className="text-gray-400 text-sm mb-5">Créez votre première mission d'inspection drone pour commencer.</p>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#F97215] text-white rounded-xl text-sm font-bold hover:bg-[#ea660c] transition shadow-md shadow-orange-100">
              <Plus size={16} /> Nouvelle Mission
            </button>
          </div>
        )}
      </div>

      {/* ── New Mission Dialog ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-gray-800 text-lg font-bold flex items-center gap-2">
                  <Plane size={20} className="text-[#F97215]" /> Planifier une Mission
                </h3>
                
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateMission} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Nom de la mission <span className="text-red-400">*</span></label>
                <input type="text" placeholder="ex: Inspection Zone Nord – Semaine 24" required
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Zone <span className="text-red-400">*</span></label>
                <input type="text" placeholder="ex: Zone A – Secteur Nord" required
                  value={formData.zone} onChange={e => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Date <span className="text-red-400">*</span></label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Heure <span className="text-red-400">*</span></label>
                  <input type="time" required value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Drone <span className="text-red-400">*</span></label>
                <input type="text" placeholder="DRONE-01" required
                  value={formData.drone} onChange={e => setFormData({ ...formData, drone: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition">
                  Annuler
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#F97215] text-white rounded-xl text-sm font-bold hover:bg-[#ea660c] transition shadow-md shadow-orange-200 flex items-center justify-center gap-2">
                  <CheckCircle size={16} /> Planifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <CreateIncidentModal isOpen={isIncidentOpen} onClose={() => setIsIncidentOpen(false)} />
      <CreateReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />

      <GenericConfirmModal
        isOpen={isConfirmStartOpen}
        onClose={() => setIsConfirmStartOpen(false)}
        title="Démarrer le Décollage"
        subtitle="Forcer la mission immédiate"
        description="Êtes-vous sûr de vouloir forcer le décollage immédiat de ce drone en ignorant sa planification initiale ?"
        actionLabel="Démarrer le Drone"
        actionColor="emerald"
        onConfirm={() => {
          if (pendingMissionId !== null) {
            setMissionsList(prev => prev.map(m => m.id === pendingMissionId ? { ...m, status: 'in-progress' as const } : m));
          }
          addToast('Décollage initié avec succès.', 'success');
        }}
      />

      <GenericConfirmModal
        isOpen={isConfirmRestartOpen}
        onClose={() => setIsConfirmRestartOpen(false)}
        title="Relancer la Mission"
        subtitle="Reprogrammer cette inspection"
        description="Vous êtes sur le point de nettoyer le statut de cette mission annulée pour la replanifier dans les vols à venir."
        actionLabel="Relancer la Mission"
        actionColor="blue"
        onConfirm={() => {
          if (pendingMissionId !== null) {
            setMissionsList(prev => prev.map(m => m.id === pendingMissionId ? { ...m, status: 'scheduled' as const } : m));
          }
          addToast('Mission reprogrammée avec succès.', 'success');
        }}
      />
    </div>
  );
}