import { useState, useEffect } from 'react';
import {
  Video, Maximize, AlertTriangle,
  MapPin, CheckCircle, FileText, User, Circle, Activity, Truck, BarChart2, RefreshCw
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

// ─── Data ─────────────────────────────────────────────────────────────────────

import { mockCameras as cameraList } from '../data/mockData';

// ─── Component ────────────────────────────────────────────────────────────────

export function CameraMonitoring() {
  const location = useLocation();
  const navigate = useNavigate();
  const passedCameraId = location.state?.selectedCameraId as number | undefined;

  const [selectedCamera, setSelectedCamera] = useState(() => {
    return cameraList.find(c => c.id === passedCameraId) || cameraList[0];
  });

  useEffect(() => {
    if (passedCameraId) {
      const cam = cameraList.find(c => c.id === passedCameraId);
      if (cam) setSelectedCamera(cam);
    }
  }, [passedCameraId]);
  const activeCount  = cameraList.filter(c => c.status === 'active').length;
  const totalWorkers = cameraList.filter(c => c.status === 'active').reduce((s, c) => s + c.detections.workers, 0);
  const totalVehicles = cameraList.filter(c => c.status === 'active').reduce((s, c) => s + c.detections.vehicles, 0);
  const alertCount   = cameraList.filter(c => c.status === 'active' && c.detections.vests < c.detections.workers).length;

  const hasViolation = selectedCamera.status === 'active' && selectedCamera.detections.vests < selectedCamera.detections.workers;

  return (
    <div className="bg-[#F4F7FC] font-sans min-h-full">

      <div className="bg-white border-b border-gray-200 px-8 py-5 shadow-sm sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-[26px] font-bold text-gray-800 tracking-tight">Surveillance Caméras</h1>
            <p className="text-gray-500 text-[14px] mt-0.5 font-medium">Surveillance IA en direct – caméras fixes sur le chantier</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-site-orange focus-visible:outline-none transition shadow-sm">
              <BarChart2 size={15}/> Exporter le rapport
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-site-orange focus-visible:outline-none transition shadow-sm">
              <RefreshCw size={15}/> Tout rafraîchir
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6 max-w-[1600px] mx-auto">

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Caméras Actives"    value={`${activeCount}/${cameraList.length}`} sub="Caméras opérationnelles" icon={<Video size={20}/>}       bg="bg-blue-50 text-blue-500"/>
          <KpiCard label="Ouvriers Détectés"  value={String(totalWorkers)}  sub="Sur tous les flux en direct"  icon={<User size={20}/>}       bg="bg-indigo-50 text-indigo-500"/>
          <KpiCard label="Alertes EPI"        value={String(alertCount)}    sub="Caméras avec violations" icon={<AlertTriangle size={20} strokeWidth={2.5}/>} bg="bg-red-50 text-red-500"/>
          <KpiCard label="Véhicules sur site" value={String(totalVehicles)} sub="Détectés en zone active" icon={<Truck size={20}/>}       bg="bg-amber-50 text-amber-500"/>
        </div>

        {/* ── Camera Grid (all thumbnails) ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <Video size={14} className="text-gray-400"/>
            <h2 className="text-gray-700 font-bold text-sm">Toutes les caméras — Cliquez pour voir le flux en direct</h2>
            <span className="ml-auto text-xs font-semibold text-gray-400">{activeCount} actives · {cameraList.length - activeCount} en maintenance</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4">
            {cameraList.map(cam => (
              <button
                key={cam.id}
                onClick={() => setSelectedCamera(cam)}
                className={`group text-left border-2 rounded-2xl overflow-hidden transition-all shadow-sm hover:shadow-md focus-visible:ring-4 focus-visible:ring-site-orange focus-visible:outline-none focus-visible:border-none
                  ${selectedCamera.id === cam.id
                    ? 'border-[#F97215] ring-2 ring-orange-200'
                    : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="aspect-video relative bg-gray-100 overflow-hidden">
                  <ImageWithFallback src={cam.image} alt={cam.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                  {/* Status badge */}
                  <div className="absolute top-1.5 right-1.5">
                    {cam.status === 'active' ? (
                      <span className="flex items-center gap-1 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
                        <Circle size={5} className="fill-white text-white"/> active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
                        maintenance
                      </span>
                    )}
                  </div>
                  {/* LIVE dot */}
                  {cam.status === 'active' && (
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded-full">
                      <Circle size={5} className="fill-red-500 text-red-500 animate-pulse"/>
                      <span className="text-white text-[8px] font-bold">DIRECT</span>
                    </div>
                  )}
                  {/* Violation indicator */}
                  {cam.status === 'active' && cam.detections.vests < cam.detections.workers && (
                    <div className="absolute bottom-1.5 left-1.5">
                      <AlertTriangle size={14} className="text-red-500 drop-shadow"/>
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
            ))}
          </div>
        </div>

        {/* ── Live Feed Detail ── */}
        <div className="space-y-4">
          {/* Feed header */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                <Video className="text-[#F97215]" size={24}/>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-1">Surveillance Caméras / Flux en direct</div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-xl font-bold text-gray-800">{selectedCamera.name}</h2>
                  {selectedCamera.status === 'active' ? (
                    <span className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-bold px-2.5 py-1 rounded-full">
                      <Circle size={6} className="fill-emerald-500 text-emerald-500"/> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-600 text-xs font-bold px-2.5 py-1 rounded-full">
                      Maintenance
                    </span>
                  )}
                  {hasViolation && (
                    <span className="flex items-center gap-1 bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">
                      <AlertTriangle size={11}/> Alerte EPI
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm">{selectedCamera.location}</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-bold transition shadow-sm shrink-0">
              <Maximize size={16}/> Plein écran
            </button>
          </div>

          {/* Live video feed */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="relative aspect-video bg-gray-900">
              <ImageWithFallback src={selectedCamera.image} alt={selectedCamera.name} className="w-full h-full object-cover"/>

              {/* LIVE badge + timestamp */}
              <div className="absolute top-4 left-4 space-y-2">
                <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <Circle size={8} className="fill-red-500 text-red-500 animate-pulse"/>
                  <span className="text-white text-sm font-bold tracking-wide">ENREGISTREMENT EN DIRECT</span>
                </div>
                <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <span className="text-white text-sm font-mono">10:23:45 AM</span>
                </div>
              </div>

              {/* AI Detection Overlays */}
              {selectedCamera.status === 'active' && (
                <>
                  <div className="absolute top-1/4 left-1/4 border-2 border-emerald-500 rounded-lg p-1 shadow">
                    <span className="bg-emerald-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">Ouvrier ✓</span>
                  </div>
                  <div className="absolute top-1/3 right-1/3 border-2 border-emerald-500 rounded-lg p-1 shadow">
                    <span className="bg-emerald-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">Casque ✓</span>
                  </div>
                  <div className="absolute bottom-1/4 left-1/3 border-2 border-blue-500 rounded-lg p-1 shadow">
                    <span className="bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">Véhicule</span>
                  </div>
                  {hasViolation && (
                    <div className="absolute top-1/2 right-1/4 border-2 border-red-500 rounded-lg p-1 shadow">
                      <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">Gilet Manquant ⚠</span>
                    </div>
                  )}
                </>
              )}

              {/* Maintenance overlay */}
              {selectedCamera.status === 'maintenance' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center">
                    <div className="text-amber-400 text-4xl mb-2">⚙</div>
                    <div className="text-white font-bold text-lg">Caméra en maintenance</div>
                    <div className="text-gray-400 text-sm mt-1">Flux temporairement indisponible</div>
                  </div>
                </div>
              )}
            </div>

            {/* Info bar below feed */}
            <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-gray-400"/>
                <span className="text-gray-600 text-sm font-medium">Orientation : <b className="text-gray-800">{selectedCamera.orientation}</b></span>
              </div>
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-gray-400"/>
                <span className="text-gray-600 text-sm font-medium">IPS : <b className="text-gray-800">{selectedCamera.fps}</b></span>
              </div>
              {selectedCamera.status === 'active' && (
                <div className="ml-auto flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-600 px-3 py-1.5 rounded-xl text-xs font-bold">
                  <Circle size={6} className="fill-emerald-500 text-emerald-500 animate-pulse"/> Flux actif
                </div>
              )}
            </div>
          </div>

          {/* AI Detection results for selected camera */}
          {selectedCamera.status === 'active' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Detections */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-gray-700 font-bold text-sm flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <User size={15} className="text-gray-400"/> Résultats de Détection IA
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Ouvriers détectés',    value: selectedCamera.detections.workers,  check: null },
                    { label: 'Casques détectés',     value: selectedCamera.detections.helmets,  check: selectedCamera.detections.helmets >= selectedCamera.detections.workers },
                    { label: 'Gilets de sécurité', value: selectedCamera.detections.vests,   check: selectedCamera.detections.vests >= selectedCamera.detections.workers },
                    { label: 'Véhicules sur site',     value: selectedCamera.detections.vehicles, check: null },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                      <span className="text-gray-600 font-medium text-sm">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-800 text-xl font-extrabold">{item.value}</span>
                        {item.check === true  && <CheckCircle size={15} className="text-emerald-500"/>}
                        {item.check === false && <AlertTriangle size={15} className="text-red-500"/>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status & Location */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-gray-700 font-bold text-sm flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <MapPin size={15} className="text-gray-400"/> Informations & Emplacement
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
                      <span className="text-gray-700 font-bold text-sm text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PPE Violation Alert */}
          {hasViolation && (
            <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-5">
              <h3 className="text-gray-700 font-bold text-sm flex items-center gap-2 mb-4 pb-3 border-b border-red-100">
                <AlertTriangle size={15} className="text-red-500"/>
                <span className="text-red-600">Violation EPI détectée en direct</span>
              </h3>
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
                <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5"/>
                <span className="text-red-700 font-semibold text-sm">
                  {selectedCamera.detections.workers - selectedCamera.detections.vests} ouvrier(s) détecté(s) sans gilet de sécurité sur {selectedCamera.name} — {selectedCamera.location}
                </span>
              </div>
                <button
                  onClick={() => navigate('/incidents')}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2"
                >
                  <FileText size={16} /> Créer un rapport d'incident
                </button>
            </div>
          )}

          {/* All clear banner */}
          {selectedCamera.status === 'active' && !hasViolation && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle size={20} className="text-white"/>
              </div>
              <div>
                <div className="font-bold text-emerald-700 text-sm">Ouvriers en conformité EPI</div>
                <div className="text-emerald-600 text-xs mt-0.5">Aucune violation de sécurité détectée sur le flux en direct de {selectedCamera.name}.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon, bg }:
  { label: string; value: string; sub: string; icon: React.ReactNode; bg: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start justify-between gap-2 hover:shadow-md transition-shadow">
      <div>
        <div className="text-gray-500 text-sm font-medium mb-1.5">{label}</div>
        <div className="text-3xl font-extrabold text-gray-800 mb-1.5">{value}</div>
        <div className="text-gray-400 text-xs font-semibold">{sub}</div>
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>{icon}</div>
    </div>
  );
}
