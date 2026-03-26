import { useState } from 'react';
import { Settings, Video, Plane, Users, Save, Plus, Edit, Trash2, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

type ConfigSection = 'general' | 'cameras' | 'drones' | 'users';

// ─── Types ────────────────────────────────────────────────────────────────────

type Camera = { id: number; name: string; ip: string; status: string; zone: string };
type Drone  = { id: number; name: string; model: string; serial: string; status: string };
type User   = { id: number; name: string; role: string; email: string; status: string };

// ─── Initial Data ─────────────────────────────────────────────────────────────

const initialCameras: Camera[] = [
  { id: 1, name: 'CAM-01', ip: '192.168.1.101', status: 'active',      zone: 'Zone A' },
  { id: 2, name: 'CAM-02', ip: '192.168.1.102', status: 'active',      zone: 'Zone B' },
  { id: 3, name: 'CAM-03', ip: '192.168.1.103', status: 'active',      zone: 'Zone C' },
  { id: 4, name: 'CAM-04', ip: '192.168.1.104', status: 'active',      zone: 'Zone D' },
  { id: 5, name: 'CAM-05', ip: '192.168.1.105', status: 'maintenance', zone: 'Zone A' },
];

const initialDrones: Drone[] = [
  { id: 1, name: 'DRONE-01', model: 'DJI Mavic 3', serial: 'DR-001-2024', status: 'disponible' },
  { id: 2, name: 'DRONE-02', model: 'DJI Mavic 3', serial: 'DR-002-2024', status: 'en vol' },
];

const initialUsers: User[] = [
  { id: 1, name: 'John Smith',    role: 'Responsable Sécurité', email: 'john@construction.com',  status: 'actif' },
  { id: 2, name: 'Sarah Johnson', role: 'Chef de Chantier',     email: 'sarah@construction.com', status: 'actif' },
  { id: 3, name: 'Mike Brown',    role: 'Superviseur HSE',      email: 'mike@construction.com',  status: 'actif' },
  { id: 4, name: 'Emma Davis',    role: 'Agent de Sécurité',    email: 'emma@construction.com',  status: 'inactif' },
];

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

function ConfirmDeleteModal({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm mx-4 overflow-hidden">
        <div className="px-6 py-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-base">Confirmer la suppression</h3>
            <p className="text-gray-500 text-sm mt-1">
              Voulez-vous vraiment supprimer <span className="font-semibold text-gray-700">{name}</span> ? Cette action est irréversible.
            </p>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-5">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition">
            Annuler
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition shadow-sm">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Camera Modal ─────────────────────────────────────────────────────────

function AddCameraModal({ onAdd, onClose }: { onAdd: (c: Omit<Camera, 'id'>) => void; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', ip: '', zone: 'Zone A', status: 'active' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.name.trim() && form.ip.trim();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md mx-4">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">Ajouter une Caméra</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 transition"><X size={14} /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="text-gray-500 text-sm mb-1.5 block">Nom de la caméra *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: CAM-07" className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition" />
          </div>
          <div>
            <label className="text-gray-500 text-sm mb-1.5 block">Adresse IP *</label>
            <input value={form.ip} onChange={e => set('ip', e.target.value)} placeholder="192.168.1.XXX" className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-500 text-sm mb-1.5 block">Zone</label>
              <select value={form.zone} onChange={e => set('zone', e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition">
                {['Zone A','Zone B','Zone C','Zone D','Zone E'].map(z => <option key={z}>{z}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-500 text-sm mb-1.5 block">Statut</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition">
                <option value="active">Opérationnelle</option>
                <option value="maintenance">En maintenance</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition">Annuler</button>
          <button disabled={!valid} onClick={() => { onAdd(form); onClose(); }}
            className="flex-1 py-2.5 rounded-xl bg-[#F97215] hover:bg-[#ea660c] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold text-sm transition shadow-sm">
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Drone Modal ──────────────────────────────────────────────────────────

function AddDroneModal({ onAdd, onClose }: { onAdd: (d: Omit<Drone, 'id'>) => void; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', model: 'DJI Mavic 3', serial: '', status: 'disponible' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.name.trim() && form.serial.trim();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md mx-4">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">Enregistrer un Drone</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 transition"><X size={14} /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="text-gray-500 text-sm mb-1.5 block">Identifiant *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: DRONE-03" className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition" />
          </div>
          <div>
            <label className="text-gray-500 text-sm mb-1.5 block">Modèle</label>
            <select value={form.model} onChange={e => set('model', e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition">
              {['DJI Mavic 3','DJI Air 3','DJI Mini 4 Pro','Autel EVO Lite'].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-500 text-sm mb-1.5 block">Numéro de Série *</label>
            <input value={form.serial} onChange={e => set('serial', e.target.value)} placeholder="Ex: DR-003-2024" className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition" />
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition">Annuler</button>
          <button disabled={!valid} onClick={() => { onAdd(form); onClose(); }}
            className="flex-1 py-2.5 rounded-xl bg-[#F97215] hover:bg-[#ea660c] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold text-sm transition shadow-sm">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add User Modal ───────────────────────────────────────────────────────────

function AddUserModal({ onAdd, onClose }: { onAdd: (u: Omit<User, 'id'>) => void; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', role: 'Responsable Sécurité', email: '', status: 'actif' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.name.trim() && form.email.trim();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md mx-4">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">Ajouter un Utilisateur</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 transition"><X size={14} /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="text-gray-500 text-sm mb-1.5 block">Nom complet *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Prénom Nom" className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition" />
          </div>
          <div>
            <label className="text-gray-500 text-sm mb-1.5 block">Email *</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="prenom@construction.com" className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-500 text-sm mb-1.5 block">Rôle</label>
              <select value={form.role} onChange={e => set('role', e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition">
                {['Responsable Sécurité','Chef de Chantier','Superviseur HSE','Agent de Sécurité','Administrateur'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-500 text-sm mb-1.5 block">Statut</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition">
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition">Annuler</button>
          <button disabled={!valid} onClick={() => { onAdd(form); onClose(); }}
            className="flex-1 py-2.5 rounded-xl bg-[#F97215] hover:bg-[#ea660c] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold text-sm transition shadow-sm">
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SystemConfig() {
  const { addToast } = useToast();
  const [activeSection, setActiveSection] = useState<ConfigSection>('general');

  // ── General settings state ──
  const [siteName,  setSiteName]  = useState('Projet de Construction Routière - Autoroute A1');
  const [sitePlace, setSitePlace] = useState('Paris, France');
  const [lat,       setLat]       = useState('48.8566');
  const [lng,       setLng]       = useState('2.3522');
  const [timezone,  setTimezone]  = useState('Europe/Paris (UTC+1)');
  const [lang,      setLang]      = useState('Français');
  const [saving,    setSaving]    = useState(false);

  // ── Camera state ──
  const [cameras,       setCameras]       = useState<Camera[]>(initialCameras);
  const [showAddCamera, setShowAddCamera] = useState(false);
  const [deleteCam,     setDeleteCam]     = useState<Camera | null>(null);

  // ── Drone state ──
  const [drones,       setDrones]       = useState<Drone[]>(initialDrones);
  const [showAddDrone, setShowAddDrone] = useState(false);
  const [deleteDrone,  setDeleteDrone]  = useState<Drone | null>(null);

  // ── User state ──
  const [usersList,    setUsersList]    = useState<User[]>(initialUsers);
  const [showAddUser,  setShowAddUser]  = useState(false);
  const [deleteUser,   setDeleteUser]   = useState<User | null>(null);

  // ── Handlers ──

  const handleSaveGeneral = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    addToast('Paramètres généraux enregistrés avec succès.', 'success');
  };

  const handleAddCamera = (data: Omit<Camera, 'id'>) => {
    setCameras(prev => [...prev, { ...data, id: Date.now() }]);
    addToast(`Caméra ${data.name} ajoutée.`, 'success');
  };
  const handleDeleteCamera = (cam: Camera) => {
    setCameras(prev => prev.filter(c => c.id !== cam.id));
    addToast(`Caméra ${cam.name} supprimée.`, 'info');
    setDeleteCam(null);
  };
  const handleEditCamera = (cam: Camera) => {
    addToast(`Modification de ${cam.name} — fonctionnalité connectée à l'API.`, 'info');
  };

  const handleAddDrone = (data: Omit<Drone, 'id'>) => {
    setDrones(prev => [...prev, { ...data, id: Date.now() }]);
    addToast(`Drone ${data.name} enregistré.`, 'success');
  };
  const handleDeleteDrone = (d: Drone) => {
    setDrones(prev => prev.filter(dr => dr.id !== d.id));
    addToast(`Drone ${d.name} supprimé.`, 'info');
    setDeleteDrone(null);
  };
  const handleEditDrone = (d: Drone) => {
    addToast(`Modification de ${d.name} — fonctionnalité connectée à l'API.`, 'info');
  };

  const handleAddUser = (data: Omit<User, 'id'>) => {
    setUsersList(prev => [...prev, { ...data, id: Date.now() }]);
    addToast(`Utilisateur ${data.name} ajouté.`, 'success');
  };
  const handleDeleteUser = (u: User) => {
    setUsersList(prev => prev.filter(us => us.id !== u.id));
    addToast(`Utilisateur ${u.name} supprimé.`, 'info');
    setDeleteUser(null);
  };
  const handleEditUser = (u: User) => {
    addToast(`Modification de ${u.name} — fonctionnalité connectée à l'API.`, 'info');
  };

  return (
    <>
      {/* ── Modals ── */}
      {showAddCamera && <AddCameraModal onAdd={handleAddCamera} onClose={() => setShowAddCamera(false)} />}
      {showAddDrone  && <AddDroneModal  onAdd={handleAddDrone}  onClose={() => setShowAddDrone(false)} />}
      {showAddUser   && <AddUserModal   onAdd={handleAddUser}   onClose={() => setShowAddUser(false)} />}
      {deleteCam    && <ConfirmDeleteModal name={deleteCam.name}  onConfirm={() => handleDeleteCamera(deleteCam)} onCancel={() => setDeleteCam(null)} />}
      {deleteDrone  && <ConfirmDeleteModal name={deleteDrone.name} onConfirm={() => handleDeleteDrone(deleteDrone)} onCancel={() => setDeleteDrone(null)} />}
      {deleteUser   && <ConfirmDeleteModal name={deleteUser.name}  onConfirm={() => handleDeleteUser(deleteUser)}  onCancel={() => setDeleteUser(null)} />}

      <div className="h-full flex overflow-hidden bg-[#F4F7FC]">
        {/* Config Navigation */}
        <div className="w-[300px] p-6 shrink-0 z-10">
          <div className="bg-[#131C29]/95 backdrop-blur border border-slate-700/60 rounded-2xl flex flex-col py-4 gap-1 h-full shadow-2xl shadow-black/50 overflow-y-auto custom-scrollbar">
            <div className="mb-6 px-6 mt-2">
              <h2 className="text-xl text-white font-bold tracking-tight mb-1">Configuration</h2>
              <p className="text-slate-500 text-xs font-medium">Paramètres du système</p>
            </div>

            {[
              { key: 'general', label: 'Paramètres Généraux', Icon: Settings },
              { key: 'cameras', label: 'Caméras',             Icon: Video    },
              { key: 'drones',  label: 'Drones',              Icon: Plane    },
              { key: 'users',   label: 'Utilisateurs & Permissions', Icon: Users },
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setActiveSection(key as ConfigSection)}
                className={`flex items-center gap-[14px] px-[22px] py-[13px] mx-3 rounded-xl transition-all duration-200 text-[14px] font-medium text-left focus-visible:outline-none ${
                  activeSection === key
                    ? 'bg-[#F97215] text-white shadow-[0_0_0_2px_rgba(249,114,21,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/70'
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Config Content */}
        <div className="flex-1 p-6 overflow-y-auto">

          {/* ── Paramètres Généraux ── */}
          {activeSection === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Paramètres Généraux</h2>
                <p className="text-gray-500 font-medium">Configurez les paramètres système de base</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-gray-800 font-bold text-lg mb-4">Informations du Site</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-500 text-sm mb-2 block">Nom du Site</label>
                    <input value={siteName} onChange={e => setSiteName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition" />
                  </div>
                  <div>
                    <label className="text-gray-500 text-sm mb-2 block">Emplacement du Site</label>
                    <input value={sitePlace} onChange={e => setSitePlace(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-500 text-sm mb-2 block">Latitude du Site</label>
                      <input value={lat} onChange={e => setLat(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-300 transition" />
                    </div>
                    <div>
                      <label className="text-gray-500 text-sm mb-2 block">Longitude du Site</label>
                      <input value={lng} onChange={e => setLng(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-300 transition" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-gray-800 font-bold text-lg mb-4">Préférences Système</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-500 text-sm mb-2 block">Fuseau Horaire</label>
                    <select value={timezone} onChange={e => setTimezone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-300 transition">
                      <option>Europe/Paris (UTC+1)</option>
                      <option>Amérique/New_York (UTC-5)</option>
                      <option>Asie/Tokyo (UTC+9)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-500 text-sm mb-2 block">Langue</label>
                    <select value={lang} onChange={e => setLang(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-300 transition">
                      <option>Français</option>
                      <option>English</option>
                      <option>Español</option>
                    </select>
                  </div>
                </div>
              </div>

              <button onClick={handleSaveGeneral} disabled={saving}
                className="px-6 py-3 bg-[#F97215] hover:bg-[#ea660c] disabled:bg-orange-300 text-white rounded-xl transition-colors flex items-center gap-2 font-bold shadow-md shadow-orange-200">
                {saving ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Enregistrement…</> : <><Save size={18} /> Enregistrer les Modifications</>}
              </button>
            </div>
          )}

          {/* ── Caméras ── */}
          {activeSection === 'cameras' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Configuration des Caméras</h2>
                  <p className="text-gray-500 font-medium">Gérer les caméras de surveillance fixes</p>
                </div>
                <button onClick={() => setShowAddCamera(true)}
                  className="px-4 py-2 bg-[#F97215] hover:bg-[#ea660c] text-white rounded-xl transition-colors flex items-center gap-2 font-bold shadow-sm">
                  <Plus size={18} /> Ajouter
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left text-gray-500 font-semibold py-3 px-4 text-sm">ID Caméra</th>
                      <th className="text-left text-gray-500 font-semibold py-3 px-4 text-sm">Adresse IP</th>
                      <th className="text-left text-gray-500 font-semibold py-3 px-4 text-sm">Zone</th>
                      <th className="text-left text-gray-500 font-semibold py-3 px-4 text-sm">Statut</th>
                      <th className="text-left text-gray-500 font-semibold py-3 px-4 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cameras.map(cam => (
                      <tr key={cam.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="text-gray-800 py-3 px-4 font-semibold">{cam.name}</td>
                        <td className="text-gray-600 py-3 px-4">{cam.ip}</td>
                        <td className="text-gray-600 py-3 px-4">{cam.zone}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${cam.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                            {cam.status === 'active' ? 'Opérationnelle' : 'En maintenance'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <button onClick={() => handleEditCamera(cam)} className="text-gray-400 hover:text-[#F97215] transition-colors p-1.5 rounded-lg hover:bg-orange-50" title="Modifier">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => setDeleteCam(cam)} className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50" title="Supprimer">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {cameras.length === 0 && (
                      <tr><td colSpan={5} className="py-10 text-center text-gray-400 text-sm">Aucune caméra configurée</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Drones ── */}
          {activeSection === 'drones' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Configuration des Drones</h2>
                  <p className="text-gray-500 font-medium">Gérer les drones d'inspection</p>
                </div>
                <button onClick={() => setShowAddDrone(true)}
                  className="px-4 py-2 bg-[#F97215] hover:bg-[#ea660c] text-white rounded-xl transition-colors flex items-center gap-2 font-bold shadow-sm">
                  <Plus size={18} /> Enregistrer un Drone
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left text-gray-500 font-semibold py-3 px-4 text-sm">ID Drone</th>
                      <th className="text-left text-gray-500 font-semibold py-3 px-4 text-sm">Modèle</th>
                      <th className="text-left text-gray-500 font-semibold py-3 px-4 text-sm">Numéro de Série</th>
                      <th className="text-left text-gray-500 font-semibold py-3 px-4 text-sm">Statut</th>
                      <th className="text-left text-gray-500 font-semibold py-3 px-4 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drones.map(d => (
                      <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="text-gray-800 py-3 px-4 font-semibold">{d.name}</td>
                        <td className="text-gray-600 py-3 px-4">{d.model}</td>
                        <td className="text-gray-600 py-3 px-4">{d.serial}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${d.status === 'disponible'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                            {d.status === 'disponible' ? 'Disponible' : 'En vol'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <button onClick={() => handleEditDrone(d)} className="text-gray-400 hover:text-[#F97215] transition-colors p-1.5 rounded-lg hover:bg-orange-50" title="Modifier">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => setDeleteDrone(d)} className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50" title="Supprimer">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {drones.length === 0 && (
                      <tr><td colSpan={5} className="py-10 text-center text-gray-400 text-sm">Aucun drone enregistré</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Utilisateurs ── */}
          {activeSection === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestion des Utilisateurs</h2>
                  <p className="text-gray-500 font-medium">Gérer les utilisateurs et les permissions</p>
                </div>
                <button onClick={() => setShowAddUser(true)}
                  className="px-4 py-2 bg-[#F97215] hover:bg-[#ea660c] text-white rounded-xl transition-colors flex items-center gap-2 font-bold shadow-sm">
                  <Plus size={18} /> Ajouter
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left text-gray-500 font-semibold py-3 px-4 text-sm">Nom</th>
                      <th className="text-left text-gray-500 font-semibold py-3 px-4 text-sm">Rôle</th>
                      <th className="text-left text-gray-500 font-semibold py-3 px-4 text-sm">Email</th>
                      <th className="text-left text-gray-500 font-semibold py-3 px-4 text-sm">Statut</th>
                      <th className="text-left text-gray-500 font-semibold py-3 px-4 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map(u => (
                      <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="text-gray-800 py-3 px-4 font-semibold">{u.name}</td>
                        <td className="text-gray-600 py-3 px-4">{u.role}</td>
                        <td className="text-gray-600 py-3 px-4">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.status === 'actif'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <button onClick={() => handleEditUser(u)} className="text-gray-400 hover:text-[#F97215] transition-colors p-1.5 rounded-lg hover:bg-orange-50" title="Modifier">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => setDeleteUser(u)} className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50" title="Supprimer">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {usersList.length === 0 && (
                      <tr><td colSpan={5} className="py-10 text-center text-gray-400 text-sm">Aucun utilisateur configuré</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
