import { useState } from "react";
import {
  HardHat, Users, MapPin, AlertTriangle, Plus, Trash2, Edit, CheckCircle,
  ShieldAlert, BookOpen, Settings, X, Search
} from "lucide-react";

// ─── Types & Data ─────────────────────────────────────────────────────────────

type RuleType = "ppe" | "distance" | "zone_access" | "speed_limit";

type Rule = {
  id: number;
  name: string;
  type: RuleType;
  zones: string[];
};

const initialRules: Rule[] = [
  { id: 1, name: "Casque Obligatoire", type: "ppe", zones: ["Zone A", "Zone B"] },
  { id: 2, name: "Distance Machines", type: "distance", zones: ["Zone C"] },
  { id: 3, name: "Accès Restreint", type: "zone_access", zones: ["Zone D - Risque Élevé"] },
  { id: 4, name: "Limites de Vitesse (15km/h)", type: "speed_limit", zones: ["Toutes les routes du site"] },
];

const RT = {
  ppe:         { label: 'EPI',         icon: HardHat,       color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200' },
  distance:    { label: 'Distance',    icon: Users,         color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  zone_access: { label: 'Accès Zone', icon: MapPin,        color: 'text-red-600',    bg: 'bg-red-50 border-red-200' },
  speed_limit: { label: 'Vitesse', icon: AlertTriangle, color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function HSERules() {
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [selectedId, setSelectedId] = useState<number>(initialRules[0].id);

  // Search/filter
  const [searchQuery, setSearchQuery] = useState("");

  // Rule Form (Add)
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleType, setNewRuleType] = useState<RuleType>("ppe");

  // Rule Edit
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [editingRuleName, setEditingRuleName] = useState("");
  const [editingRuleType, setEditingRuleType] = useState<RuleType>("ppe");

  // Zone Form (Add)
  const [newZone, setNewZone] = useState("");

  // Zone Edit
  const [editingZoneIndex, setEditingZoneIndex] = useState<number | null>(null);
  const [editingZoneValue, setEditingZoneValue] = useState("");

  const selectedRule = rules.find(r => r.id === selectedId) || rules[0];

  const filteredRules = rules.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.zones.some(z => z.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  /* ---------------- RULE CRUD ---------------- */

  function addRule(e: React.FormEvent) {
    e.preventDefault();
    if (!newRuleName.trim()) return;
    const rule: Rule = { id: Date.now(), name: newRuleName, type: newRuleType, zones: [] };
    setRules([rule, ...rules]);
    setSelectedId(rule.id);
    setNewRuleName("");
    setShowRuleForm(false);
  }

  function deleteRule(id: number) {
    const updated = rules.filter(r => r.id !== id);
    setRules(updated);
    if (selectedId === id && updated.length) setSelectedId(updated[0].id);
  }

  function startEditRule(rule: Rule, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingRuleId(rule.id);
    setEditingRuleName(rule.name);
    setEditingRuleType(rule.type);
  }

  function saveEditRule(e: React.FormEvent) {
    e.preventDefault();
    const updated = rules.map(rule =>
      rule.id === editingRuleId ? { ...rule, name: editingRuleName, type: editingRuleType } : rule
    );
    setRules(updated);
    setEditingRuleId(null);
  }

  /* ---------------- ZONE CRUD ---------------- */

  function addZone(e: React.FormEvent) {
    e.preventDefault();
    if (!newZone.trim()) return;
    const updated = rules.map(rule =>
      rule.id === selectedRule.id ? { ...rule, zones: [...rule.zones, newZone] } : rule
    );
    setRules(updated);
    setNewZone("");
  }

  function deleteZone(index: number) {
    const updated = rules.map(rule => {
      if (rule.id === selectedRule.id) {
        return { ...rule, zones: rule.zones.filter((_, i) => i !== index) };
      }
      return rule;
    });
    setRules(updated);
  }

  function startEditZone(index: number, value: string) {
    setEditingZoneIndex(index);
    setEditingZoneValue(value);
  }

  function saveEditZone(e: React.FormEvent) {
    e.preventDefault();
    const updated = rules.map(rule => {
      if (rule.id === selectedRule.id) {
        const zones = rule.zones.map((z, i) => i === editingZoneIndex ? editingZoneValue : z);
        return { ...rule, zones };
      }
      return rule;
    });
    setRules(updated);
    setEditingZoneIndex(null);
  }

  /* ---------------- RENDERING ---------------- */

  return (
    <div className="bg-[#F4F7FC] font-sans min-h-full">

      {/* ── Top Bar ── */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 shadow-sm sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-[26px] font-bold text-gray-800 tracking-tight">Gestion des Règles HSE</h1>
            <p className="text-gray-400 text-[14px] mt-0.5 font-medium">Configurez les politiques de sécurité appliquées logiquement à travers les zones</p>
          </div>
          <button
            onClick={() => setShowRuleForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#F97215] text-white rounded-xl text-sm font-bold hover:bg-[#ea660c] transition shadow-md shadow-orange-200 shrink-0"
          >
            <Plus size={16} strokeWidth={3}/> Créer une Règle
          </button>
        </div>
      </div>

      <div className="px-8 py-6 max-w-[1600px] mx-auto space-y-6">

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Règles Actives" value={String(rules.length)} sub="Politiques du système" icon={<BookOpen size={20}/>} bg="bg-blue-50 text-blue-500"/>
          <KpiCard label="Zones Surveillées" value={String(new Set(rules.flatMap(r => r.zones)).size)} sub="Zones protégées distinctes" icon={<MapPin size={20}/>} bg="bg-indigo-50 text-indigo-500"/>
          <KpiCard label="Régulations strictes" value={String(rules.filter(r => r.type === 'ppe').length)} sub="Basées sur le contrôle EPI" icon={<ShieldAlert size={20}/>} bg="bg-emerald-50 text-emerald-500"/>
          <KpiCard label="Dernière MÀJ" value="Aujourd'hui" sub="Synchronisation active" icon={<Settings size={20}/>} bg="bg-amber-50 text-amber-500"/>
        </div>

        {/* ── Main Layout ── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Rules List (Sidebar on desktop) ── */}
          <div className="w-full lg:w-[400px] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden shrink-0">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-gray-800 font-bold text-[15px] flex items-center gap-2 mb-3">
                <BookOpen size={16} className="text-[#F97215]"/> Annuaire des Règles
              </h2>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input
                  type="text"
                  placeholder="Rechercher des règles ou zones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-shadow"
                />
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto p-3 space-y-2">
              {filteredRules.length === 0 ? (
                <div className="text-center py-8 px-4 text-gray-400 font-medium text-sm">
                  Aucune règle ne correspond à votre recherche.
                </div>
              ) : filteredRules.map(rule => {
                const isSelected = selectedId === rule.id;
                const rType = RT[rule.type];
                const Icon = rType.icon;

                return (
                  <button
                    key={rule.id}
                    onClick={() => setSelectedId(rule.id)}
                    className={`w-full text-left p-3.5 rounded-xl border-2 transition-all duration-200
                      ${isSelected ? 'border-[#F97215] bg-orange-50/30' : 'border-transparent bg-white hover:border-gray-200 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${rType.bg}`}>
                          <Icon size={16} className={rType.color}/>
                        </div>
                        <div>
                          <div className={`font-bold text-[14px] leading-snug mb-0.5 ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>{rule.name}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{rType.label}</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-500 text-[11px] font-medium">{rule.zones.length} zone{rule.zones.length > 1 ? 's' : ''} appliquée{rule.zones.length > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Rule Detail & Zones Context ── */}
          <div className="w-full lg:flex-1 space-y-5">
            {selectedRule ? (
              <>
                {/* Rule Header */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    {(() => {
                      const LargeIcon = RT[selectedRule.type].icon;
                      return <LargeIcon size={120} />;
                    })()}
                  </div>
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${RT[selectedRule.type].bg} ${RT[selectedRule.type].color}`}>
                          Type {RT[selectedRule.type].label}
                        </span>
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200">
                          Règle Active
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={(e) => startEditRule(selectedRule, e)} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition flex items-center gap-1.5">
                          <Edit size={14}/> Modifier
                        </button>
                        <button onClick={() => deleteRule(selectedRule.id)} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition flex items-center gap-1.5">
                          <Trash2 size={14}/> Supprimer
                        </button>
                      </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight mb-2">
                      {selectedRule.name}
                    </h2>
                    <p className="text-gray-500 text-sm font-medium">
                      Cette règle dicte les paramètres d'application de l'IA. Assurez-vous que les zones ci-dessous reflètent les contraintes physiques du site pour maintenir un suivi précis des anomalies par drone et caméra.
                    </p>
                  </div>
                </div>

                {/* Zones Applied List */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <h3 className="text-gray-800 font-bold text-[15px] flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400"/> Zones Appliquées ({selectedRule.zones.length})
                    </h3>
                  </div>
                  
                  <div className="p-6">
                    {selectedRule.zones.length === 0 ? (
                      <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-200 rounded-xl mb-4">
                        <MapPin size={32} className="mx-auto text-gray-300 mb-3"/>
                        <p className="text-gray-500 font-medium text-sm">Aucune zone assignée à cette règle pour le moment.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        {selectedRule.zones.map((zone, idx) => (
                          <div key={idx} className="group bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex items-center justify-between hover:border-gray-300 transition-colors">
                            {editingZoneIndex === idx ? (
                              <form onSubmit={saveEditZone} className="flex-1 flex gap-2 w-full">
                                <input autoFocus required value={editingZoneValue} onChange={e => setEditingZoneValue(e.target.value)}
                                  className="flex-1 bg-white border border-gray-300 px-3 py-1.5 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                                <button type="submit" className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle size={16}/></button>
                                <button type="button" onClick={() => setEditingZoneIndex(null)} className="p-1.5 bg-gray-200 text-gray-600 rounded-lg"><X size={16}/></button>
                              </form>
                            ) : (
                              <>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                                    <MapPin size={14} className="text-gray-500"/>
                                  </div>
                                  <span className="font-bold text-gray-700 text-sm truncate">{zone}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button onClick={() => startEditZone(idx, zone)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier la zone"><Edit size={14}/></button>
                                  <button onClick={() => deleteZone(idx)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Retirer la zone"><Trash2 size={14}/></button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add new zone inline form */}
                    <form onSubmit={addZone} className="flex gap-3 items-stretch max-w-md bg-gray-50 p-2 rounded-xl border border-gray-200">
                      <div className="relative flex-1">
                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input type="text" placeholder="Ajouter une nouvelle zone pour cette règle..." required value={newZone} onChange={e => setNewZone(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-transparent rounded-lg text-sm text-gray-800 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-50 transition-all"/>
                      </div>
                      <button type="submit" className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-sm shrink-0">
                        <Plus size={15}/> Ajouter l'Emplacement
                      </button>
                    </form>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center h-full flex flex-col items-center justify-center">
                <BookOpen size={48} className="text-gray-200 mb-4"/>
                <h3 className="text-xl font-bold text-gray-400 mb-2">Aucune Règle Sélectionnée</h3>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">Sélectionnez une règle dans l'annuaire ou créez-en une nouvelle pour gérer ses zones d'application.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Add Rule Modal ── */}
      {showRuleForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-gray-800 text-lg font-bold flex items-center gap-2"><Plus size={20} className="text-[#F97215]"/> Ajouter une Nouvelle Règle</h3>
                <p className="text-gray-400 text-xs font-semibold mt-1">Configurer l'application par intelligence artificielle</p>
              </div>
              <button type="button" onClick={() => setShowRuleForm(false)} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                <X size={20}/>
              </button>
            </div>

            <form onSubmit={addRule} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Nom de la Règle</label>
                <input type="text" placeholder="ex: Harnais Obligatoire" required value={newRuleName} onChange={e => setNewRuleName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Type d'Application</label>
                <select value={newRuleType} onChange={e => setNewRuleType(e.target.value as RuleType)}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all">
                  <option value="ppe">Équipement de Protection Individuelle (EPI)</option>
                  <option value="distance">Proximité des Machines Obligatoire</option>
                  <option value="zone_access">Accès à une Zone Restreinte</option>
                  <option value="speed_limit">Limite de Vitesse des Véhicules</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-2">
                <button type="button" onClick={() => setShowRuleForm(false)}
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition">
                  Annuler
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-3 bg-[#F97215] text-white rounded-xl text-sm font-bold hover:bg-[#ea660c] transition shadow-md shadow-orange-200 flex items-center justify-center gap-2">
                  <CheckCircle size={16}/> Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Rule Modal ── */}
      {editingRuleId !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-gray-800 text-lg font-bold flex items-center gap-2"><Edit size={20} className="text-blue-500"/> Modifier la Règle</h3>
                <p className="text-gray-400 text-xs font-semibold mt-1">Mettre à jour la configuration de la règle HSE</p>
              </div>
              <button type="button" onClick={() => setEditingRuleId(null)} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                <X size={20}/>
              </button>
            </div>

            <form onSubmit={saveEditRule} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Nom de la Règle</label>
                <input autoFocus type="text" required value={editingRuleName} onChange={e => setEditingRuleName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Type d'Application</label>
                <select value={editingRuleType} onChange={e => setEditingRuleType(e.target.value as RuleType)}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                  <option value="ppe">Équipement de Protection Individuelle (EPI)</option>
                  <option value="distance">Proximité des Machines Obligatoire</option>
                  <option value="zone_access">Accès à une Zone Restreinte</option>
                  <option value="speed_limit">Limite de Vitesse des Véhicules</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-2">
                <button type="button" onClick={() => setEditingRuleId(null)}
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition">
                  Annuler
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-md shadow-blue-200 flex items-center justify-center gap-2">
                  <CheckCircle size={16}/> Enregistrer
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