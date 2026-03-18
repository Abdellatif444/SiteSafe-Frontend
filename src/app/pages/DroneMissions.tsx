import { useState } from 'react';
import {
  Plane, Calendar, MapPin, Clock, Play, Pause,
  CheckCircle, AlertTriangle, Plus, X, List, Image as ImageIcon,
  Route, FileText, Video, Edit2, RotateCw, BatteryLow
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

// ─── Types & Data ─────────────────────────────────────────────────────────────

import { mockDroneMissions as initialMissions, mockDroneAnomalies as detectedAnomalies, Mission } from '../data/mockData';

// ─── Style Config ─────────────────────────────────────────────────────────────

const S = {
  'completed':   { label: 'Terminée',   icon: <CheckCircle size={14}/>,   badge: 'bg-emerald-50 text-emerald-600 border-emerald-200', left: 'border-l-emerald-500' },
  'in-progress': { label: 'En Cours', icon: <Play size={14}/>,          badge: 'bg-blue-50 text-blue-600 border-blue-200',          left: 'border-l-blue-500' },
  'scheduled':   { label: 'Planifiée',   icon: <Clock size={14}/>,         badge: 'bg-slate-100 text-slate-600 border-slate-200',      left: 'border-l-slate-400' },
  'cancelled':   { label: 'Annulée',   icon: <Pause size={14}/>,         badge: 'bg-red-50 text-red-600 border-red-200',             left: 'border-l-red-500' },
};

const SEV = {
  'Critique': 'bg-red-500 text-white',
  'Élevé':     'bg-orange-500 text-white',
  'Moyen':   'bg-amber-500 text-white',
  'Faible':      'bg-slate-500 text-white',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function DroneMissions() {
  const [missionsList, setMissionsList] = useState(initialMissions);
  const [selected, setSelected] = useState<Mission>(initialMissions[0]);
  const [detailOpen, setDetailOpen] = useState(false);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ zone: '', date: '', time: '', drone: '', duration: '' });

  const handleCreateMission = (e: React.FormEvent) => {
    e.preventDefault();
    const newMission: Mission = {
      id: missionsList.length + 1,
      name: 'Nouvelle Mission Drone',
      zone: formData.zone, date: formData.date, time: formData.time, duration: formData.duration, drone: formData.drone,
      status: 'scheduled', images: 0, anomalies: 0, flightPath: '',
    };
    const updatedList = [newMission, ...missionsList];
    setMissionsList(updatedList);
    setSelected(newMission);
    setDetailOpen(true);
    setFormData({ zone: '', date: '', time: '', drone: '', duration: '' });
    setShowForm(false);
  };

  const completed = missionsList.filter(m => m.status === 'completed').length;
  const inProgress = missionsList.filter(m => m.status === 'in-progress').length;
  const totalAnomalies = missionsList.reduce((s, m) => s + m.anomalies, 0);

  return (
    <div className="bg-[#F4F7FC] font-sans min-h-full">
      {/* ── Top Bar ── */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 shadow-sm sticky top-0 z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-gray-800 tracking-tight">Missions Drones</h1>
          <p className="text-gray-500 text-[14px] mt-0.5 font-medium">Programmez et consultez les inspections aériennes de sécurité</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#F97215] text-white rounded-xl text-sm font-bold hover:bg-[#ea660c] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-site-orange focus-visible:outline-none transition shadow-md shadow-orange-200 shrink-0"
        >
          <Plus size={16}/> Nouvelle Mission
        </button>
      </div>

      <div className="px-8 py-6 space-y-6 max-w-[1600px] mx-auto">
        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Total Missions" value={String(missionsList.length)} sub="Toutes planifiées & passées" icon={<List size={20}/>} bg="bg-blue-50 text-blue-500"/>
          <KpiCard label="Vols Actifs" value={String(inProgress)} sub="Actuellement en cours" icon={<Plane size={20}/>} bg="bg-indigo-50 text-indigo-500"/>
          <KpiCard label="Missions Terminées" value={String(completed)} sub="Vols réussis" icon={<CheckCircle size={20}/>} bg="bg-emerald-50 text-emerald-500"/>
          <KpiCard label="Anomalies Totales" value={String(totalAnomalies)} sub="Détectées par l'IA drone" icon={<AlertTriangle size={20}/>} bg="bg-amber-50 text-amber-500"/>
        </div>

        {/* ── Mission List ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="hidden md:grid grid-cols-[2.5fr_1.5fr_1fr_1fr_1fr_auto] px-5 py-3 border-b border-gray-100/80 text-[11px] uppercase tracking-wider text-gray-400 font-bold bg-gray-50/50">
            <span>Détails Mission</span><span>Emplacement</span><span>Date & Heure</span><span>Drone</span><span>Statut</span><span className="text-right">Anomalies</span>
          </div>

          {/* List */}
          <div className="divide-y divide-gray-100">
            {missionsList.map(mission => (
              <div key={mission.id}>
                {/* Row */}
                <button
                  onClick={() => { setSelected(mission); setDetailOpen(open => mission.id === selected.id ? !open : true); }}
                  className={`w-full text-left flex items-start gap-4 px-5 py-4 border-l-4 transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-site-orange focus-visible:outline-none
                    ${S[mission.status].left}
                    ${selected.id === mission.id && detailOpen ? 'bg-orange-50/40' : 'hover:bg-gray-50'}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 hidden sm:flex">
                    <Plane className={mission.status === 'in-progress' ? 'text-blue-500' : 'text-gray-400'} size={20} />
                  </div>
                  <div className="flex-1 min-w-0 md:grid md:grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_auto] md:items-center md:gap-4">
                    <div className="min-w-0 mb-2 md:mb-0">
                      <div className="font-bold text-gray-800 text-sm leading-tight truncate">{mission.name}</div>
                      <div className="text-gray-500 text-xs font-medium">Mission #{mission.id}</div>
                    </div>
                    <div className="text-gray-500 text-xs font-medium hidden md:block">{mission.zone}</div>
                    <div className="hidden md:block">
                      <div className="text-gray-700 text-xs font-semibold">{mission.date}</div>
                      <div className="text-gray-500 text-[11px]">{mission.time}</div>
                    </div>
                    <div className="text-gray-500 text-xs font-bold hidden md:block">{mission.drone}</div>
                    <div className="hidden md:flex items-center">
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${S[mission.status].badge}`}>
                        {S[mission.status].icon} {S[mission.status].label}
                      </span>
                    </div>
                    <div className="hidden md:flex justify-end">
                      {mission.anomalies > 0 ? (
                        <span className="bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-md text-xs font-bold">
                          {mission.anomalies} Alerte{mission.anomalies > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-sm">-</span>
                      )}
                    </div>
                  </div>
                  {/* Mobile badges */}
                  <div className="md:hidden flex flex-wrap gap-2 items-center mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${S[mission.status].badge}`}>{S[mission.status].label}</span>
                    {mission.anomalies > 0 && <span className="bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold">{mission.anomalies} Alertes</span>}
                  </div>
                </button>

                {/* ── Expanded Detail Panel ── */}
                {selected.id === mission.id && detailOpen && (
                  <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-6 space-y-5 shadow-inner">
                    
                    {/* Header Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                            <Plane className="text-[#F97215]" size={24}/>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h2 className="text-xl font-bold text-gray-800">{selected.name}</h2>
                              <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${S[selected.status].badge}`}>
                                {S[selected.status].icon} {S[selected.status].label}
                              </span>
                            </div>
                            <p className="text-gray-500 text-sm">{selected.zone}</p>
                          </div>
                        </div>
                        {selected.status === 'completed' && (
                          <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold transition shadow-sm" title="Vérifier le document certifié de fin d'inspection">
                            <FileText size={15}/> Rapport de Mission
                          </button>
                        )}
                        {selected.status === 'scheduled' && (
                          <div className="hidden sm:flex items-center gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold transition shadow-sm" title="Modifier la planification de la mission">
                              <Edit2 size={15}/> Modifier
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#F97215] text-white hover:bg-[#ea660c] border border-transparent rounded-xl text-sm font-bold transition shadow-md shadow-orange-100" title="Forcer le décollage immédiat du drone">
                              <Play size={15}/> Démarrer
                            </button>
                          </div>
                        )}
                        {selected.status === 'cancelled' && (
                          <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold transition shadow-sm" title="Reprogrammer cette mission">
                            <RotateCw size={15}/> Relancer Mission
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: 'Date & Heure',    value: selected.date, sub: selected.time, icon: <Calendar size={13}/> },
                          { label: 'Durée Est.',  value: selected.duration, icon: <Clock size={13}/> },
                          { label: 'Drone Assigné', value: selected.drone, icon: <Plane size={13}/> },
                          { label: 'Images Capturées',value: String(selected.images), icon: <ImageIcon size={13}/> },
                        ].map(m => (
                          <div key={m.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wide mb-1 flex items-center gap-1.5">{m.icon}{m.label}</div>
                            <div className="text-gray-800 font-bold text-[13px]">{m.value}</div>
                            {m.sub && <div className="text-gray-500 text-xs mt-0.5 font-medium">{m.sub}</div>}
                          </div>
                        ))}
                      </div>

                      {selected.flightPath && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wide mb-1.5 flex items-center gap-1.5"><Route size={13}/> Notes sur la trajectoire</div>
                          <p className="text-gray-700 text-sm font-medium">{selected.flightPath}</p>
                        </div>
                      )}

                      {/* ── Battery Telemetry (only for in-progress missions) ── */}
                      {selected.status === 'in-progress' && (() => {
                        // Simulated live battery: deterministic based on mission id for demo stability
                        const battery = Math.max(8, 78 - (selected.id * 17) % 65);
                        const isLow = battery < 25;
                        const isCritical = battery < 15;
                        const barColor = isCritical ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500';
                        return (
                          <div className={`mt-4 pt-4 border-t ${isCritical ? 'border-red-200 bg-red-50 -mx-5 px-5 pb-3 rounded-b-xl' : 'border-gray-100'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className={`text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 ${isCritical ? 'text-red-600' : 'text-gray-400'}`}>
                                <BatteryLow size={13} className={isCritical ? 'animate-pulse' : ''}/> Télémétrie Batterie (Live)
                              </div>
                              <span className={`text-sm font-extrabold ${isCritical ? 'text-red-600 animate-pulse' : isLow ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {battery}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                              <div 
                                className={`${barColor} h-full rounded-full transition-all duration-500`}
                                style={{ width: `${battery}%` }}
                              />
                            </div>
                            {isCritical && (
                              <div className="mt-2 flex items-center gap-2 text-red-700 text-xs font-bold">
                                <AlertTriangle size={13} className="shrink-0 animate-pulse"/>
                                Batterie critique ! Retour à la base immédiat recommandé.
                              </div>
                            )}
                            {isLow && !isCritical && (
                              <div className="mt-2 text-amber-600 text-xs font-semibold">
                                Batterie faible — Prévoir le retour dans moins de 5 min.
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Detected Anomalies */}
                    {selected.anomalies > 0 ? (
                      <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-5">
                        <h3 className="text-gray-800 font-bold flex items-center gap-2 mb-4 pb-3 border-b border-red-100">
                          <AlertTriangle className="text-red-500" size={18}/> Anomalies de Sécurité Détectées ({selected.anomalies})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {detectedAnomalies.slice(0, selected.anomalies).map((anomaly) => (
                            <div key={anomaly.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                              <div className="aspect-video relative bg-gray-100 overflow-hidden">
                                <ImageWithFallback src={anomaly.image} alt={anomaly.type} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                                <div className="absolute top-2 right-2">
                                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${SEV[anomaly.severity as keyof typeof SEV]}`}>
                                    {anomaly.severity}
                                  </span>
                                </div>
                              </div>
                              <div className="p-4 bg-gray-50 flex-1 flex flex-col">
                                <div className="font-bold text-gray-800 text-sm mb-2 leading-tight">{anomaly.type}</div>
                                <div className="space-y-1.5 mb-3">
                                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium"><MapPin size={13} className="text-gray-400"/> {anomaly.location}</div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium"><Clock size={13} className="text-gray-400"/> {anomaly.timestamp}</div>
                                </div>
                                <button className="mt-auto w-full pt-2 pb-2 text-xs font-bold text-red-600 bg-white hover:bg-red-50 border border-red-100 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm group/btn" title="Valider l'anomalie IA et générer un ticket d'incident formel">
                                  <AlertTriangle size={13} className="group-hover/btn:scale-110 transition-transform"/> Valider et Créer Incident
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : selected.status === 'completed' ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                          <CheckCircle size={20} className="text-white"/>
                        </div>
                        <div>
                          <div className="font-bold text-emerald-700 text-sm">Mission Terminée avec Succès</div>
                          <div className="text-emerald-600 text-xs mt-0.5">Aucune anomalie n'a été détectée lors de cette inspection aérienne.</div>
                        </div>
                      </div>
                    ) : selected.status === 'in-progress' ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center justify-center gap-3">
                         <Video size={20} className="text-blue-500 animate-pulse"/>
                         <span className="font-bold text-blue-700 text-sm">Flux Drone En Direct Actif</span>
                      </div>
                    ) : null}

                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── New Mission Dialog ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-gray-800 text-lg font-bold flex items-center gap-2"><Plane size={20} className="text-[#F97215]"/> Planifier une Mission</h3>
                <p className="text-gray-400 text-xs font-semibold mt-1">Configurer une nouvelle inspection aérienne</p>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                <X size={20}/>
              </button>
            </div>

            <form onSubmit={handleCreateMission} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Zone</label>
                <input type="text" placeholder="ex: Zone A - Secteur Nord" required value={formData.zone} onChange={e => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Date</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Heure</label>
                  <input type="time" required value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Drone</label>
                  <input type="text" placeholder="DRONE-01" required value={formData.drone} onChange={e => setFormData({ ...formData, drone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Durée</label>
                  <input type="text" placeholder="45 min" required value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"/>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition">
                  Annuler
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#F97215] text-white rounded-xl text-sm font-bold hover:bg-[#ea660c] transition shadow-md shadow-orange-200 flex items-center justify-center gap-2">
                  <CheckCircle size={16}/> Planifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
