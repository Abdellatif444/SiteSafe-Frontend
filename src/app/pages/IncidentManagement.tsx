import { useState } from 'react';
import {
  FileText, AlertTriangle, User, Calendar, MapPin,
  CheckCircle, Clock, Filter, Download,
  BarChart2, Image as ImageIcon, MessageSquare, Upload,
  ClipboardCheck, ChevronDown, Bell,
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

// ─── Types ────────────────────────────────────────────────────────────────────

import { mockIncidents as incidents, Incident, IncidentStatus } from '../data/mockData';

// ─── Style config ─────────────────────────────────────────────────────────────

const P = {
  critical: { label: 'Critique', dot: 'bg-red-500',    badge: 'bg-red-50 text-red-600 border border-red-200',    left: 'border-l-red-500' },
  high:     { label: 'Haute',     dot: 'bg-orange-500', badge: 'bg-orange-50 text-orange-600 border border-orange-200', left: 'border-l-orange-400' },
  medium:   { label: 'Moyenne',   dot: 'bg-amber-500',  badge: 'bg-amber-50 text-amber-600 border border-amber-200',  left: 'border-l-amber-400' },
  low:      { label: 'Basse',      dot: 'bg-slate-400',  badge: 'bg-slate-100 text-slate-500 border border-slate-200', left: 'border-l-slate-300' },
};
const S = {
  'open':         { label: 'Ouvert',        badge: 'bg-red-50 text-red-600 border border-red-200'           },
  'in-progress':  { label: 'En cours', badge: 'bg-amber-50 text-amber-600 border border-amber-200'     },
  'resolved':     { label: 'Résolu',    badge: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
  'closed':       { label: 'Fermé',      badge: 'bg-slate-100 text-slate-500 border border-slate-200'    },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function IncidentManagement() {
  const [selected, setSelected]     = useState<Incident>(incidents[0]);
  const [filter, setFilter]          = useState<IncidentStatus | 'all'>('all');
  const [detailOpen, setDetailOpen]  = useState(false);   // mobile only
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = filter === 'all' ? incidents : incidents.filter(i => i.status === filter);

  const handleExport = () => {
    setToastMessage('Le rapport a été exporté avec succès.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="bg-[#F4F7FC] font-sans min-h-full">

      {/* ── Top Bar ── */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 shadow-sm sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-[26px] font-bold text-gray-800 tracking-tight">Gestion des Incidents</h1>
            <p className="text-gray-500 text-[14px] mt-0.5 font-medium">Suivi, gestion et résolution des non-conformités de sécurité.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-site-orange focus-visible:outline-none transition shadow-sm"
            >
              <BarChart2 size={15}/> Exporter le rapport
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6 max-w-[1600px] mx-auto">

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Incidents Totaux"     value={String(incidents.length)}   sub="+12% par rapport au mois dernier" subGreen icon={<FileText size={20}/>}       bg="bg-blue-50 text-blue-500"/>
          <KpiCard label="Risques Critiques" value={String(incidents.filter(i=>i.priority==='critical').length)} sub="Action requise immédiatement" icon={<AlertTriangle size={20} strokeWidth={2.5}/>} bg="bg-red-50 text-red-500"/>
          <KpiCard label="En retard"        value={String(incidents.filter(i=>i.status==='open').length)} sub="Nécessite une attention" icon={<Clock size={20}/>} bg="bg-amber-50 text-amber-500"/>
          <KpiCard label="Résolus ce mois"  value={String(incidents.filter(i=>i.status==='resolved'||i.status==='closed').length)} sub="Taux de conformité 94%" icon={<CheckCircle size={20}/>} bg="bg-emerald-50 text-emerald-500"/>
        </div>

        {/* ── Incident List Table ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Bulk Action Bar (Visible only when items are selected) */}
          {selectedIds.length > 0 && (
            <div className="bg-orange-50 text-orange-800 px-5 py-3 border-b border-orange-100 flex items-center justify-between animate-in fade-in">
              <span className="font-bold text-sm">{selectedIds.length} incident(s) sélectionné(s)</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setToastMessage('Les incidents sélectionnés ont été clôturés.'); setSelectedIds([]); }}
                  className="px-4 py-1.5 bg-[#F97215] text-white rounded-lg text-xs font-bold hover:bg-[#ea660c] shadow-sm transition-colors"
                >
                  Clôturer la sélection
                </button>
                <button 
                  onClick={() => { setToastMessage('Les entreprises responsables ont été relancées.'); setSelectedIds([]); }}
                  className="px-4 py-1.5 bg-white border border-orange-200 text-orange-700 rounded-lg text-xs font-bold hover:bg-orange-100 transition-colors"
                >
                  Relancer les entreprises
                </button>
              </div>
            </div>
          )}

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
            <button className="flex items-center gap-1.5 text-gray-500 text-sm font-semibold border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-white">
              <Filter size={13}/> Filtres
            </button>
            <div className="h-5 w-px bg-gray-200"/>
            <div className="flex items-center gap-1 text-sm text-gray-500 font-medium cursor-pointer select-none">
              Statut :&nbsp;
              <select value={filter} onChange={e => setFilter(e.target.value as IncidentStatus | 'all')}
                className="bg-transparent border-none outline-none text-sm font-semibold text-gray-700 cursor-pointer focus-visible:ring-2 focus-visible:ring-site-orange rounded">
                <option value="all">Tous les statuts</option>
                <option value="open">Ouvert</option>
                <option value="in-progress">En cours</option>
                <option value="resolved">Résolu</option>
                <option value="closed">Fermé</option>
              </select>
              <ChevronDown size={13}/>
            </div>
            <span className="ml-auto text-xs text-gray-500 font-semibold">{filtered.length} sur {incidents.length} incidents</span>
          </div>

          {/* Column headers */}
          <div className="hidden md:grid grid-cols-[30px_auto_2.5fr_1.5fr_1fr_1fr_1fr_auto] gap-2 px-5 py-2.5 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold bg-gray-50/30 items-center">
            <div className="flex justify-center -ml-1">
               <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 text-[#F97215] focus:ring-[#F97215] cursor-pointer"
                  checked={filtered.length > 0 && selectedIds.length === filtered.length}
                  onChange={(e) => setSelectedIds(e.target.checked ? filtered.map(i => i.id) : [])}
               />
            </div>
            <span></span>
            <span>Détails de l'incident</span><span>Emplacement</span><span>Priorité</span><span>Date limite</span><span>Statut</span><span className="text-right">Action</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-100">
            {filtered.map(inc => (
              <div key={inc.id}>
                <div
                  onClick={() => { setSelected(inc); setDetailOpen(open => inc.id === selected.id ? !open : true); }}
                  className={`w-full text-left flex items-start gap-3 md:gap-4 px-5 py-4 border-l-4 transition-colors cursor-pointer
                    ${P[inc.priority].left}
                    ${selected.id === inc.id && detailOpen ? 'bg-orange-50/50' : 'hover:bg-gray-50'}`}
                >
                  {/* Checkbox */}
                  <div className="hidden md:flex w-6 pt-3 justify-center shrink-0 -ml-1">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 text-[#F97215] focus:ring-[#F97215] cursor-pointer"
                      checked={selectedIds.includes(inc.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        setSelectedIds(prev => e.target.checked ? [...prev, inc.id] : prev.filter(id => id !== inc.id));
                      }}
                    />
                  </div>
                  {/* Thumb */}
                  <div className="hidden sm:block w-11 h-11 rounded-xl overflow-hidden border border-gray-200 shrink-0 mt-0.5">
                    <ImageWithFallback src={inc.images[0]} alt={inc.title} className="w-full h-full object-cover"/>
                  </div>
                  {/* Title col */}
                  <div className="flex-1 min-w-0 md:grid md:grid-cols-[1fr_1.5fr_1fr_1fr_1fr_auto] md:items-center md:gap-4">
                    <div className="min-w-0 mb-2 md:mb-0">
                      <div className="font-bold text-gray-800 text-sm leading-tight truncate">{inc.title}</div>
                      <div className="text-gray-500 text-xs font-medium">{inc.id}</div>
                    </div>
                    <div className="text-gray-500 text-xs font-medium hidden md:block">{inc.location}</div>
                    <div className="hidden md:flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${P[inc.priority].dot}`}/>
                      <span className="text-gray-600 text-xs font-semibold">{P[inc.priority].label}</span>
                    </div>
                    <div className="text-gray-500 text-xs hidden md:block">{inc.deadline}</div>
                    <div className="hidden md:block">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${S[inc.status].badge}`}>{S[inc.status].label}</span>
                    </div>
                    <div className="hidden md:flex justify-end">
                      <button className="px-3 py-1.5 bg-[#F97215] text-white rounded-lg text-xs font-semibold hover:bg-[#ea660c] transition">
                        Voir
                      </button>
                    </div>
                  </div>
                  {/* Mobile: badges */}
                  <div className="md:hidden flex gap-2 items-center mt-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${S[inc.status].badge}`}>{S[inc.status].label}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${P[inc.priority].badge}`}>{P[inc.priority].label}</span>
                  </div>
                </div>

                {/* ── Inline Detail Panel (expands under the row) ── */}
                {selected.id === inc.id && detailOpen && (
                  <div className="border-t border-orange-100 bg-orange-50/20 px-5 py-6 space-y-5">

                    {/* Header */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                            <FileText className="text-[#F97215]" size={22}/>
                          </div>
                          <div>
                            {/* Breadcrumb */}
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-semibold mb-1.5">
                              <span>Gestion Sécurité</span><span>/</span><span>Incidents</span><span>/</span>
                              <span className="text-[#F97215] font-bold">{selected.id}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <h2 className="text-lg font-bold text-gray-800">{selected.id}</h2>
                              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${P[selected.priority].badge}`}>{P[selected.priority].label}</span>
                            </div>
                            <p className="text-gray-500 text-sm">{selected.title}</p>
                            <p className="text-gray-500 text-xs">{selected.violationType}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold px-4 py-2 rounded-xl shrink-0 ${S[selected.status].badge}`}>{S[selected.status].label}</span>
                      </div>
                      {/* Meta */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: 'Création',      value: selected.createdDate },
                          { label: 'Dernière MAJ', value: selected.updatedDate },
                          { label: 'Emplacement',     value: selected.location },
                          { label: 'Date Limite',     value: selected.deadline },
                        ].map(m => (
                          <div key={m.label} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                            <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wide mb-1">{m.label}</div>
                            <div className="text-gray-700 text-[13px] font-semibold leading-snug">{m.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <Section title="Description de l'incident" icon={<FileText size={15}/>}>
                      <p className="text-gray-600 text-sm leading-relaxed">{selected.description}</p>
                    </Section>

                    {/* Evidence */}
                    <Section title={`Preuves et Images (${selected.images.length})`} icon={<ImageIcon size={15}/>}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selected.images.map((img, i) => (
                          <div key={i} className="aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                            <ImageWithFallback src={img} alt={`Preuve ${i+1}`} className="w-full h-full object-cover"/>
                          </div>
                        ))}
                      </div>
                    </Section>

                    {/* Assignment + Location side by side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Section title="Assignation" icon={<User size={15}/>}>
                        <div className="space-y-4">
                          <InfoRow label="Signalé par" value={<span>{selected.reporter}</span>}/>
                          <InfoRow label="Assigné à" value={
                            selected.assignedTo
                              ? <span className="flex items-center gap-2">
                                  <Avatar color={selected.companyColor} initials={selected.assignedTo.charAt(0)}/>
                                  {selected.assignedTo}
                                </span>
                              : <span className="text-red-500 italic text-sm font-semibold">Non assigné</span>
                          }/>
                          <InfoRow label="Entreprise" value={
                            <span className="flex items-center gap-2">
                              <Avatar color={selected.companyColor} initials={selected.companyInitials}/>
                              {selected.company}
                            </span>
                          }/>
                        </div>
                        {!selected.assignedTo && (
                          <button className="mt-4 w-full bg-[#F97215] hover:bg-[#ea660c] text-white py-2.5 rounded-xl text-sm font-bold transition shadow-sm flex items-center justify-center gap-2">
                            <User size={14}/> Assigner un agent
                          </button>
                        )}
                      </Section>

                      <Section title="Emplacement" icon={<MapPin size={15}/>}>
                        <div className="aspect-[4/3] bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2">
                          <MapPin className="text-gray-300" size={36}/>
                          <div className="text-gray-500 text-sm font-semibold text-center px-4">{selected.location}</div>
                          <button className="mt-1 px-5 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 shadow-sm flex items-center gap-1.5">
                            <MapPin size={11}/> Voir sur le plan
                          </button>
                        </div>
                      </Section>
                    </div>

                    {/* Actions */}
                    <Section title="Actions rapides" icon={<ClipboardCheck size={15}/>}>
                      <div className="flex flex-wrap gap-3">
                        {selected.status === 'open' && (
                          <><Btn color="amber" icon={<Clock size={14}/>} label="Démarrer l'investigation"/>
                          <Btn color="slate" icon={<User size={14}/>} label="Assigner un agent"/></>
                        )}
                        {selected.status === 'in-progress' && (
                          <><Btn color="emerald" icon={<CheckCircle size={14}/>} label="Marquer comme Résolu"/>
                          <Btn color="slate" icon={<User size={14}/>} label="Réassigner"/></>
                        )}
                        {(selected.status === 'open' || selected.status === 'in-progress') && new Date(selected.deadline) < new Date() && (
                          <Btn color="red" icon={<Bell size={14}/>} label="Relancer l'entreprise (En retard)"/>
                        )}
                        {selected.status === 'resolved' && (
                          <Btn color="blue" icon={<FileText size={14}/>} label="Levée de la non-conformité"/>
                        )}
                        <Btn color="slate" icon={<MessageSquare size={14}/>} label="Ajouter un commentaire"/>
                        <Btn color="slate" icon={<Upload size={14}/>} label="Soumettre preuve de correction"/>
                        <Btn color="slate" icon={<Download size={14}/>} label="Télécharger le rapport"/>
                      </div>
                    </Section>

                    {/* Timeline */}
                    <Section title="Chronologie" icon={<Calendar size={15}/>}>
                      <ol className="relative border-l-2 border-gray-200 ml-4 space-y-5">
                        <TL color="bg-red-500" icon={<AlertTriangle size={12} className="text-white"/>} title="Incident Créé" date={selected.createdDate} note={`Signalé par ${selected.reporter}`}/>
                        {selected.assignedTo && (
                          <TL color="bg-amber-500" icon={<User size={12} className="text-white"/>} title="Incident Assigné" date={selected.updatedDate} note={`Assigné à ${selected.assignedTo}`}/>
                        )}
                        {selected.status === 'in-progress' && (
                          <TL color="bg-blue-500" icon={<Clock size={12} className="text-white"/>} title="Investigation en cours" date={selected.updatedDate} note="Agent sur place pour investigation"/>
                        )}
                        {(selected.status === 'resolved' || selected.status === 'closed') && (
                          <TL color="bg-emerald-500" icon={<CheckCircle size={12} className="text-white"/>} title="Incident Résolu" date={selected.updatedDate} note="Problème corrigé et vérifié"/>
                        )}
                        {selected.status === 'closed' && (
                          <TL color="bg-gray-400" icon={<FileText size={12} className="text-white"/>} title="Incident Fermé" date={selected.updatedDate} note="Dossier fermé, documentation complète"/>
                        )}
                      </ol>
                    </Section>

                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Affichage de <b className="text-gray-700">{filtered.length}</b> sur <b className="text-gray-700">128</b> incidents</span>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-400 cursor-not-allowed">Précédent</button>
              <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-white bg-white">Suivant</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-gray-900 border border-gray-800 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-bounce">
          <CheckCircle size={18} className="text-emerald-400"/>
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, subGreen = false, icon, bg }:
  { label: string; value: string; sub: string; subGreen?: boolean; icon: React.ReactNode; bg: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start justify-between gap-2 hover:shadow-md transition-shadow">
      <div>
        <div className="text-gray-500 text-sm font-medium mb-1.5">{label}</div>
        <div className="text-3xl font-extrabold text-gray-800 mb-1.5">{value}</div>
        <div className={`text-xs font-semibold ${subGreen ? 'text-emerald-500' : 'text-gray-400'}`}>{sub}</div>
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>{icon}</div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="flex items-center gap-2 text-gray-700 font-bold text-sm mb-4 pb-3 border-b border-gray-100">
        <span className="text-gray-400">{icon}</span>{title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wide mb-0.5">{label}</div>
      <div className="text-gray-700 font-semibold text-sm flex items-center gap-2">{value}</div>
    </div>
  );
}

function Avatar({ color, initials }: { color: string; initials: string }) {
  return (
    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${color}`}>
      {initials}
    </span>
  );
}

type BtnColor = 'amber' | 'emerald' | 'blue' | 'slate' | 'red';
function Btn({ label, icon, color }: { label: string; icon: React.ReactNode; color: BtnColor }) {
  const s: Record<BtnColor, string> = {
    amber:   'bg-amber-500 hover:bg-amber-600 text-white',
    emerald: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    blue:    'bg-blue-500 hover:bg-blue-600 text-white',
    red:     'bg-red-500 hover:bg-red-600 text-white',
    slate:   'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700',
  };
  return (
    <button className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm ${s[color]}`}>
      {icon}{label}
    </button>
  );
}

function TL({ color, icon, title, date, note }: { color: string; icon: React.ReactNode; title: string; date: string; note: string }) {
  return (
    <li className="ml-6 relative">
      <div className={`absolute -left-9 top-1 w-7 h-7 rounded-full flex items-center justify-center shadow-sm ${color}`}>{icon}</div>
      <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
        <div className="text-gray-800 font-bold text-sm">{title}</div>
        <div className="text-gray-400 text-xs mt-0.5 font-medium">{date}</div>
        <div className="text-gray-500 text-xs mt-1">{note}</div>
      </div>
    </li>
  );
}
