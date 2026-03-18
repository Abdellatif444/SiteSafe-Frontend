import { useState } from 'react';
import { Settings, Video, Plane, Users, Save, Plus, Edit, Trash2, Bell, Shield } from 'lucide-react';

type ConfigSection = 'general' | 'cameras' | 'drones' | 'users' | 'notifications' | 'ai';

const cameras = [
  { id: 1, name: 'CAM-01', ip: '192.168.1.101', status: 'active', zone: 'Zone A' },
  { id: 2, name: 'CAM-02', ip: '192.168.1.102', status: 'active', zone: 'Zone B' },
  { id: 3, name: 'CAM-03', ip: '192.168.1.103', status: 'active', zone: 'Zone C' },
  { id: 4, name: 'CAM-04', ip: '192.168.1.104', status: 'active', zone: 'Zone D' },
  { id: 5, name: 'CAM-05', ip: '192.168.1.105', status: 'maintenance', zone: 'Zone A' },
];

const drones = [
  { id: 1, name: 'DRONE-01', model: 'DJI Mavic 3', serial: 'DR-001-2024', status: 'disponible' },
  { id: 2, name: 'DRONE-02', model: 'DJI Mavic 3', serial: 'DR-002-2024', status: 'en vol' },
];

const users = [
  { id: 1, name: 'John Smith', role: 'Responsable Sécurité', email: 'john@construction.com', status: 'actif' },
  { id: 2, name: 'Sarah Johnson', role: 'Chef de Chantier', email: 'sarah@construction.com', status: 'actif' },
  { id: 3, name: 'Mike Brown', role: 'Superviseur HSE', email: 'mike@construction.com', status: 'actif' },
  { id: 4, name: 'Emma Davis', role: 'Agent de Sécurité', email: 'emma@construction.com', status: 'inactif' },
];

export function SystemConfig() {
  const [activeSection, setActiveSection] = useState<ConfigSection>('general');

  return (
    <div className="h-full flex">
      {/* Config Navigation */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-2">
        <div className="mb-4">
          <h2 className="text-xl text-white mb-2">Configuration</h2>
          <p className="text-slate-400 text-sm">Paramètres du système</p>
        </div>

        <button
          onClick={() => setActiveSection('general')}
          className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${activeSection === 'general'
              ? 'bg-orange-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
        >
          <Settings size={20} />
          Paramètres Généraux
        </button>

        <button
          onClick={() => setActiveSection('cameras')}
          className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${activeSection === 'cameras'
              ? 'bg-orange-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
        >
          <Video size={20} />
          Caméras
        </button>

        <button
          onClick={() => setActiveSection('drones')}
          className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${activeSection === 'drones'
              ? 'bg-orange-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
        >
          <Plane size={20} />
          Drones
        </button>

        <button
          onClick={() => setActiveSection('users')}
          className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${activeSection === 'users'
              ? 'bg-orange-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
        >
          <Users size={20} />
          Utilisateurs & Permissions
        </button>

        <button
          onClick={() => setActiveSection('notifications')}
          className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${activeSection === 'notifications'
              ? 'bg-orange-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
        >
          <Bell size={20} />
          Notifications
        </button>

        <button
          onClick={() => setActiveSection('ai')}
          className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${activeSection === 'ai'
              ? 'bg-orange-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
        >
          <Shield size={20} />
          Paramètres IA
        </button>
      </div>

      {/* Config Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeSection === 'general' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl text-white mb-2">Paramètres Généraux</h2>
              <p className="text-slate-400">Configurez les paramètres système de base</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-white text-lg mb-4">Informations du Site</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Nom du Site</label>
                  <input
                    type="text"
                    defaultValue="Projet de Construction Routière - Autoroute A1"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Emplacement du Site</label>
                  <input
                    type="text"
                    defaultValue="Paris, France"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">Latitude du Site</label>
                    <input
                      type="text"
                      defaultValue="48.8566"
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">Longitude du Site</label>
                    <input
                      type="text"
                      defaultValue="2.3522"
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-white text-lg mb-4">Préférences Système</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Fuseau Horaire</label>
                  <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2">
                    <option>Europe/Paris (UTC+1)</option>
                    <option>Amérique/New_York (UTC-5)</option>
                    <option>Asie/Tokyo (UTC+9)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Langue</label>
                  <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2">
                    <option>Français</option>
                    <option>English</option>
                    <option>Español</option>
                  </select>
                </div>
              </div>
            </div>

            <button className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Save size={20} />
              Enregistrer les Modifications
            </button>
          </div>
        )}

        {activeSection === 'cameras' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl text-white mb-2">Configuration des Caméras</h2>
                <p className="text-slate-400">Gérer les caméras de surveillance fixes</p>
              </div>
              <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <Plus size={20} />
                Ajouter
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-800/50">
                    <th className="text-left text-slate-400 py-3 px-4">ID Caméra</th>
                    <th className="text-left text-slate-400 py-3 px-4">Adresse IP</th>
                    <th className="text-left text-slate-400 py-3 px-4">Zone</th>
                    <th className="text-left text-slate-400 py-3 px-4">Statut</th>
                    <th className="text-left text-slate-400 py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cameras.map((camera) => (
                    <tr key={camera.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                      <td className="text-white py-3 px-4 font-medium">{camera.name}</td>
                      <td className="text-slate-300 py-3 px-4">{camera.ip}</td>
                      <td className="text-slate-300 py-3 px-4">{camera.zone}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded text-sm ${camera.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                            }`}
                        >
                          {camera.status === 'active' ? 'Opérationnelle' : 'En maintenance'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button className="text-slate-400 hover:text-white transition-colors p-1">
                            <Edit size={16} />
                          </button>
                          <button className="text-slate-400 hover:text-red-400 transition-colors p-1">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'drones' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl text-white mb-2">Configuration des Drones</h2>
                <p className="text-slate-400">Gérer les drones d'inspection</p>
              </div>
              <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <Plus size={20} />
                Enregistrer un Drone
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-800/50">
                    <th className="text-left text-slate-400 py-3 px-4">ID Drone</th>
                    <th className="text-left text-slate-400 py-3 px-4">Modèle</th>
                    <th className="text-left text-slate-400 py-3 px-4">Numéro de Série</th>
                    <th className="text-left text-slate-400 py-3 px-4">Statut</th>
                    <th className="text-left text-slate-400 py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drones.map((drone) => (
                    <tr key={drone.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                      <td className="text-white py-3 px-4 font-medium">{drone.name}</td>
                      <td className="text-slate-300 py-3 px-4">{drone.model}</td>
                      <td className="text-slate-300 py-3 px-4">{drone.serial}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded text-sm ${drone.status === 'disponible'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-blue-500/20 text-blue-400'
                            }`}
                        >
                          {drone.status === 'disponible' ? 'Disponible' : 'En vol'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button className="text-slate-400 hover:text-white transition-colors p-1">
                            <Edit size={16} />
                          </button>
                          <button className="text-slate-400 hover:text-red-400 transition-colors p-1">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl text-white mb-2">Gestion des Utilisateurs</h2>
                <p className="text-slate-400">Gérer les utilisateurs et les permissions</p>
              </div>
              <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <Plus size={20} />
                Ajouter
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-800/50">
                    <th className="text-left text-slate-400 py-3 px-4">Nom</th>
                    <th className="text-left text-slate-400 py-3 px-4">Rôle</th>
                    <th className="text-left text-slate-400 py-3 px-4">Email</th>
                    <th className="text-left text-slate-400 py-3 px-4">Statut</th>
                    <th className="text-left text-slate-400 py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                      <td className="text-white py-3 px-4 font-medium">{user.name}</td>
                      <td className="text-slate-300 py-3 px-4">{user.role}</td>
                      <td className="text-slate-300 py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded text-sm ${user.status === 'active'
                              ? 'bg-green-600/20 text-green-400'
                              : 'bg-slate-600/20 text-slate-400'
                            }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button className="text-slate-400 hover:text-white transition-colors p-1">
                            <Edit size={16} />
                          </button>
                          <button className="text-slate-400 hover:text-red-400 transition-colors p-1">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl text-white mb-2">Paramètres de Notification</h2>
              <p className="text-slate-400">Configurer les notifications d'alerte</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-white text-lg mb-4">Notifications par Email</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer text-slate-300 hover:text-white transition-colors">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                  <span>Violations critiques</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-slate-300 hover:text-white transition-colors">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                  <span>Violations de haute priorité</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-slate-300 hover:text-white transition-colors">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span>Violations de priorité moyenne</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-slate-300 hover:text-white transition-colors">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                  <span>Rapports de sécurité quotidiens</span>
                </label>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-white text-lg mb-4">Notifications SMS</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer text-slate-300 hover:text-white transition-colors">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                  <span>Violations critiques uniquement</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-slate-300 hover:text-white transition-colors">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span>Mises à jour des incidents</span>
                </label>
              </div>
            </div>

            <button className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Save size={20} />
              Enregistrer
            </button>
          </div>
        )}

        {activeSection === 'ai' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl text-white mb-2">Paramètres de Détection IA</h2>
              <p className="text-slate-400">Configurer les paramètres du modèle IA</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-white text-lg mb-4">Seuils de Confiance de Détection</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-slate-400 text-sm">Détection d'Ouvrier</label>
                    <span className="text-white">85%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    defaultValue="85"
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-slate-400 text-sm">Détection EPI (Casque)</label>
                    <span className="text-white">90%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    defaultValue="90"
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-slate-400 text-sm">Détection EPI (Gilet)</label>
                    <span className="text-white">85%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    defaultValue="85"
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-slate-400 text-sm">Détection de Véhicule</label>
                    <span className="text-white">88%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    defaultValue="88"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-white text-lg mb-4">Paramètres de Traitement</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Taux de Traitement des Images</label>
                  <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2">
                    <option>1 image par seconde</option>
                    <option>2 images par seconde</option>
                    <option selected>5 images par seconde</option>
                    <option>10 images par seconde</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Modèle IA</label>
                  <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2">
                    <option>YOLOv8 - Rapide (Recommandé)</option>
                    <option>YOLOv8 - Précis</option>
                    <option>Modèle Personnalisé</option>
                  </select>
                </div>
              </div>
            </div>

            <button className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Save size={20} />
              Enregistrer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
