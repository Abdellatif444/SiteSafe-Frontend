import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp, Calendar, Download, Filter, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

const violationsPerDay = [
  { date: 'Mar 3', violations: 12 },
  { date: 'Mar 4', violations: 8 },
  { date: 'Mar 5', violations: 15 },
  { date: 'Mar 6', violations: 6 },
  { date: 'Mar 7', violations: 9 },
  { date: 'Mar 8', violations: 7 },
  { date: 'Mar 9', violations: 5 },
];

const violationsByType = [
  { type: 'Casque Manquant', count: 18, color: '#ef4444' },
  { type: 'Gilet Manquant', count: 14, color: '#f59e0b' },
  { type: 'Distance Dangereuse', count: 9, color: '#8b5cf6' },
  { type: 'Gants Manquants', count: 8, color: '#3b82f6' },
  { type: 'Accès Zone', count: 6, color: '#ec4899' },
  { type: 'Autres', count: 7, color: '#94a3b8' },
];

const violationsByZone = [
  { zone: 'Zone A', violations: 15, compliance: 94 },
  { zone: 'Zone B', violations: 12, compliance: 95 },
  { zone: 'Zone C', violations: 18, compliance: 91 },
  { zone: 'Zone D', violations: 8, compliance: 97 },
];

const complianceOverTime = [
  { date: 'Mar 3', compliance: 91.5 },
  { date: 'Mar 4', compliance: 93.2 },
  { date: 'Mar 5', compliance: 89.8 },
  { date: 'Mar 6', compliance: 95.1 },
  { date: 'Mar 7', compliance: 94.3 },
  { date: 'Mar 8', compliance: 95.7 },
  { date: 'Mar 9', compliance: 96.2 },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function SafetyReports() {
  return (
    <div className="bg-[#F4F7FC] font-sans min-h-full">
      <div className="bg-white border-b border-gray-200 px-8 py-5 shadow-sm sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-[26px] font-bold text-gray-800 tracking-tight">Rapports & Analyses Sécurité</h1>
            <p className="text-gray-400 text-[14px] mt-0.5 font-medium">Analyse des performances de sécurité sur le chantier</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold transition shadow-sm">
              <Filter size={16} /> Filtrer
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold transition shadow-sm">
              <Calendar size={16} /> 7 Derniers Jours
            </button>
            <button 
              className="flex items-center gap-2 px-5 py-2.5 bg-[#F97215] text-white rounded-xl text-sm font-bold hover:bg-[#ea660c] transition shadow-md shadow-orange-200"
              onClick={() => alert("Génération du registre HSE officiel (Format PDF/Excel) conforme à l'inspection du travail en cours de téléchargement...")}
              title="Télécharger le registre officiel pour la commission HSE"
            >
              <Download size={16} /> Exporter Registre (PDF)
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6 max-w-[1600px] mx-auto">
        
        {/* ── Key Metrics ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiMetric label="Total des Violations" value="62" trend="↓ 18% par rapport à la semaine dernière" isGood={true} />
          <KpiMetric label="Taux de Conformité" value="94.2%" trend="↑ 2.1% par rapport à la semaine dernière" isGood={true} />
          <KpiMetric label="Violations Critiques" value="8" trend="↓ 33% par rapport à la semaine dernière" isGood={true} />
          <KpiMetric label="Temps de Réponse Moy." value="3.2m" trend="↓ 0.8m par rapport à la semaine dernière" isGood={true} />
        </div>

        {/* ── Charts Row 1 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Violations Per Day */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
            <h3 className="text-gray-800 font-bold text-lg mb-6">Violations par Jour</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={violationsPerDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#1e293b', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="violations" fill="#F97215" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Compliance Over Time */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
            <h3 className="text-gray-800 font-bold text-lg mb-6">Taux de Conformité dans le Temps</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={complianceOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis stroke="#64748b" domain={[85, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#1e293b', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="compliance" stroke="#10b981" strokeWidth={4} dot={{ fill: '#10b981', r: 6, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Charts Row 2 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Violations by Type */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
            <h3 className="text-gray-800 font-bold text-lg mb-6">Violations par Type</h3>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <Pie
                    data={violationsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ cx, cy, midAngle, outerRadius, index }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = outerRadius * 1.2;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      const entry = violationsByType[index];
                      // Calculate percentage manually since Recharts default label percent might be an object in some versions
                      const total = violationsByType.reduce((sum, item) => sum + item.count, 0);
                      const percent = (entry.count / total * 100).toFixed(0);
                      return (
                        <text x={x} y={y} fill={entry.color} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight="bold">
                          {`${entry.type}: ${percent}%`}
                        </text>
                      );
                    }}
                    outerRadius={80}
                    innerRadius={50}
                    dataKey="count"
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {violationsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#1e293b', fontWeight: 'bold' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Violations by Zone */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
            <h3 className="text-gray-800 font-bold text-lg mb-6">Violations par Zone</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={violationsByZone} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                  <YAxis type="category" dataKey="zone" stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#1e293b', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="violations" fill="#ef4444" radius={[0, 6, 6, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Detailed Table ── */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-gray-800 font-bold text-lg">Détails des Performances par Zone</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                  <th className="py-3 px-6">Zone</th>
                  <th className="py-3 px-6">Total Violations</th>
                  <th className="py-3 px-6">Taux de Conformité</th>
                  <th className="py-3 px-6">Violation la Plus Fréquente</th>
                  <th className="py-3 px-6">Niveau de Risque</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50/50 transition-colors">
                   <td className="py-4 px-6 font-bold text-gray-800">Zone A - Entrée Nord</td>
                  <td className="py-4 px-6 text-gray-600 font-medium">15</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-full max-w-[120px] bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '94%' }} />
                      </div>
                      <span className="text-emerald-600 font-bold text-sm">94%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600 font-medium">Casque Manquant</td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg text-xs font-bold uppercase tracking-wide">Moyen</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                   <td className="py-4 px-6 font-bold text-gray-800">Zone B - Zone Centrale</td>
                  <td className="py-4 px-6 text-gray-600 font-medium">12</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-full max-w-[120px] bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '95%' }} />
                      </div>
                      <span className="text-emerald-600 font-bold text-sm">95%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600 font-medium">Gilet Manquant</td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-xs font-bold uppercase tracking-wide">Faible</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                   <td className="py-4 px-6 font-bold text-gray-800">Zone C - Zone d'Équipement</td>
                  <td className="py-4 px-6 text-gray-600 font-medium">18</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-full max-w-[120px] bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: '91%' }} />
                      </div>
                      <span className="text-amber-600 font-bold text-sm">91%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600 font-medium">Distance Dangereuse</td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold uppercase tracking-wide">Élevé</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                   <td className="py-4 px-6 font-bold text-gray-800">Zone D - Zone Restreinte</td>
                  <td className="py-4 px-6 text-gray-600 font-medium">8</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-full max-w-[120px] bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '97%' }} />
                      </div>
                      <span className="text-emerald-600 font-bold text-sm">97%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600 font-medium">Accès Zone</td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-xs font-bold uppercase tracking-wide">Faible</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Recommendations ── */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
          <h3 className="text-gray-800 font-bold text-lg mb-6">Recommandations IA Sécurité</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50/50 border border-red-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-red-800 mb-1.5">Zone C - Zone à Haut Risque</h4>
                  <p className="text-red-600/80 text-sm font-medium leading-relaxed">
                    La Zone C (Zone d'Équipement) enregistre 18 violations, le chiffre le plus élevé du site. Une présence accrue des superviseurs et une signalisation de sécurité supplémentaire sont recommandées immédiatement.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <Info size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-blue-800 mb-1.5">Tendance de Conformité EPI</h4>
                  <p className="text-blue-600/80 text-sm font-medium leading-relaxed">
                    Les casques et gilets manquants représentent 51% de toutes les violations. Envisager une formation de remise à niveau sur les exigences EPI obligatoires pour toutes les équipes.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                   <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-800 mb-1.5">Amélioration Générale</h4>
                  <p className="text-emerald-600/80 text-sm font-medium leading-relaxed">
                    Le total des violations a diminué de 18% cette semaine. Le taux de conformité s'est amélioré à 94,2%. Les protocoles de sécurité actuels témoignent d'une forte efficacité.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiMetric({ label, value, trend, isGood }: { label: string; value: string; trend: string; isGood: boolean }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="text-gray-500 font-bold text-xs uppercase tracking-wide">{label}</div>
        {isGood ? (
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
             <TrendingDown size={16} />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
             <TrendingUp size={16} />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-extrabold text-gray-800">{value}</div>
      </div>
      <div className={`mt-2 text-xs font-bold ${isGood ? 'text-emerald-600' : 'text-red-600'}`}>
        {trend}
      </div>
    </div>
  );
}
