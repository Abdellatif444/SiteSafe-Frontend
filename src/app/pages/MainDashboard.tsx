import { Users, HardHat, AlertTriangle, CheckCircle, TrendingUp, Video, MapPin, Play, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const statsData = [
  { label: 'Ouvriers Détectés', value: '127', icon: Users, color: 'bg-blue-50 text-blue-500', change: '+12 aujourd\'hui' },
  { label: 'Machines Actives', value: '18', icon: HardHat, color: 'bg-indigo-50 text-indigo-500', change: '+2 aujourd\'hui' },
  { label: 'Violations Aujourd\'hui', value: '5', icon: AlertTriangle, color: 'bg-red-50 text-red-500', change: '-3 vs hier' },
  { label: 'Score de Sécurité', value: '94%', icon: CheckCircle, color: 'bg-emerald-50 text-emerald-500', change: '+2% cette semaine' },
];

import { mockAlerts, mockCameras } from '../data/mockData';

const recentAlerts = mockAlerts;
const cameras = mockCameras;

export function MainDashboard() {
  const navigate = useNavigate();
  const [alertFilter, setAlertFilter] = useState<'all' | 'high' | 'critical'>('all');

  const filteredAlerts = recentAlerts.filter(alert => {
    if (alertFilter === 'all') return true;
    if (alertFilter === 'high') return alert.severity === 'high';
    if (alertFilter === 'critical') return alert.severity === 'critical';
    return true;
  });

  return (
    <div className="p-8 space-y-8 font-sans max-w-[1600px] mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="text-[28px] text-gray-800 font-bold tracking-tight mb-2">Tableau de Bord de Surveillance</h1>
        <p className="text-gray-500 font-medium">Vue d'ensemble de la sécurité du chantier en temps réel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <button key={stat.label} className="text-left w-full bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-site-orange focus-visible:outline-none transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.color} w-11 h-11 rounded-xl flex items-center justify-center shadow-sm`}>
                  <Icon size={22} strokeWidth={2.5} />
                </div>
                <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg flex items-center gap-1">
                  <TrendingUp size={16} strokeWidth={2.5} />
                </div>
              </div>
              <div className={`text-4xl font-extrabold tracking-tight mb-2 ${stat.label === 'Violations Aujourd\'hui' ? 'text-red-500' : stat.label === 'Score de Sécurité' ? 'text-emerald-500' : 'text-gray-800'}`}>{stat.value}</div>
              <div className="text-gray-600 text-sm font-bold mb-2">{stat.label}</div>
              <div className={`text-[13px] font-semibold ${stat.label === 'Violations Aujourd\'hui' ? 'text-emerald-500' : 'text-emerald-500'}`}>{stat.change}</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg text-gray-800 font-bold tracking-wide flex items-center gap-2">
              Alertes Récentes
              <span className="bg-red-100 text-red-600 text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">2 nouvelles</span>
            </h2>
            <div className="flex flex-wrap gap-1 bg-gray-100/80 p-1 rounded-lg">
              <button 
                onClick={() => setAlertFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap ${alertFilter === 'all' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Toutes
              </button>
              <button 
                onClick={() => setAlertFilter('high')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap ${alertFilter === 'high' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Haute
              </button>
              <button 
                onClick={() => setAlertFilter('critical')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap ${alertFilter === 'critical' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Critique
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {filteredAlerts.length > 0 ? filteredAlerts.map((alert) => (
              <button
                key={alert.id}
                onClick={() => navigate('/alerts', { state: { selectedAlertId: alert.id } })}
                className={`relative w-full text-left border ${alert.isNew ? 'border-blue-200 bg-blue-50/40' : 'border-gray-100 bg-gray-50/50'} rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-gray-300 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-site-orange focus-visible:outline-none transition-all duration-300 group`}
              >
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shadow-sm shrink-0 ${alert.severity === 'critical'
                          ? 'bg-red-500 shadow-red-500/30'
                          : alert.severity === 'high'
                            ? 'bg-[#E84E1B] shadow-[#E84E1B]/30'
                            : 'bg-yellow-500 shadow-yellow-500/30'
                        }`}
                    />
                    <span className={`text-[15px] font-bold ${alert.isNew ? 'text-gray-900' : 'text-gray-800'}`}>{alert.type}</span>
                    {alert.isNew && (
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide border border-blue-200 ml-1">
                        Nouveau
                      </span>
                    )}
                  </div>
                  <div className="text-gray-500 text-xs font-semibold flex flex-wrap items-center gap-2 mt-1">
                    <span className="bg-white px-2.5 py-1 rounded-md border border-gray-200 shadow-sm">{alert.camera}</span>
                    <span className="bg-white px-2.5 py-1 rounded-md border border-gray-200 shadow-sm">{alert.zone}</span>
                    <span className="text-gray-400 ml-1">{alert.time}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-0">
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase shrink-0 ${alert.severity === 'critical'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : alert.severity === 'high'
                          ? 'bg-orange-50 text-[#E84E1B] border border-orange-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                  >
                    {alert.severity === 'critical' ? 'Critique' : alert.severity === 'high' ? 'Haute' : 'Moyenne'}
                  </span>
                  
                  {/* Flèche de survol intégrée */}
                  <div className="w-0 sm:w-5 overflow-hidden flex items-center justify-start shrink-0 text-gray-400">
                    <div className="transform -translate-x-full opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                      <ChevronRight size={20} strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              </button>
            )) : (
              <div className="text-center py-8 text-gray-500 text-sm">Aucune alerte pour ce filtre.</div>
            )}
          </div>
        </div>

        {/* Live Camera Previews */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg text-gray-800 font-bold tracking-wide">Flux Caméras en Direct</h2>
            <div className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-500 rounded-lg">
              <Video size={18} strokeWidth={2.5} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {cameras.map((camera) => (
              <button 
                key={camera.id} 
                onClick={() => navigate('/cameras', { state: { selectedCameraId: camera.id } })}
                className="relative block w-full text-left group cursor-pointer overflow-hidden rounded-xl border border-gray-200 shadow-sm focus-visible:ring-4 focus-visible:ring-site-orange focus-visible:outline-none focus-visible:border-none"
              >
                <div className="aspect-video bg-gray-900 relative">
                  <ImageWithFallback
                    src={camera.image}
                    alt={camera.name}
                    className={`w-full h-full object-cover transition-all duration-500 ${camera.status === 'maintenance' ? 'opacity-40 grayscale' : 'opacity-90 group-hover:opacity-100 group-hover:scale-105'}`}
                  />
                  {camera.status === 'maintenance' && (
                    <div className="absolute inset-0 flex items-center justify-center text-amber-400">
                      <span className="text-3xl drop-shadow-md">⚙</span>
                    </div>
                  )}
                  {/* Play Overlay on Hover */}
                  {camera.status !== 'maintenance' && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-lg">
                        <Play size={20} className="ml-1" fill="currentColor" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-black/5 text-gray-800 text-xs font-bold tracking-wide shadow-sm">
                  {camera.name}
                </div>
                {camera.status === 'active' ? (
                  <div className="absolute top-2 right-2 flex items-center gap-2 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-black/5 shadow-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-500/50" />
                    <span className="text-gray-800 text-xs font-bold tracking-widest uppercase">Direct</span>
                  </div>
                ) : (
                  <div className="absolute top-2 right-2 flex items-center gap-2 bg-gray-100/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-black/5 shadow-sm">
                    <span className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">Maintenance</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Site Map Preview */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg text-gray-800 font-bold tracking-wide">Vue Générale du Chantier</h2>
          <button 
            onClick={() => navigate('/map')}
            className="text-gray-500 hover:text-[#E84E1B] text-sm font-bold transition-colors flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-site-orange focus-visible:outline-none rounded px-2 py-1"
          >
            Voir la carte complète <span className="text-lg leading-none">&rarr;</span>
          </button>
        </div>
        
        <div 
          onClick={() => navigate('/map')}
          className="aspect-[21/9] bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group shadow-inner cursor-pointer"
        >
          {/* Vraie carte interactive en aperçu */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <MapContainer 
              center={[48.8566, 2.3522]} 
              zoom={13} 
              zoomControl={false}
              attributionControl={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              dragging={false}
              className="w-full h-full"
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            </MapContainer>
          </div>
          
          {/* Couche visuelle transparente & boutton (Overlay) */}
          <div className="absolute inset-0 bg-white/40 group-hover:bg-white/10 transition-colors duration-300 z-10 flex flex-col items-center justify-center backdrop-blur-[2px] group-hover:backdrop-blur-none">
            <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mb-4 text-[#F97215] group-hover:-translate-y-2 group-hover:shadow-xl transition-all duration-300">
              <MapPin size={28} strokeWidth={2.5}/>
            </div>
            <div className="bg-white/95 backdrop-blur px-6 py-2.5 rounded-xl shadow-md text-gray-800 font-bold text-sm border border-white/50 group-hover:bg-white transition-all transform group-hover:scale-105">
              Ouvrir la Carte Interactive <span className="text-lg leading-none ml-1">&rarr;</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
