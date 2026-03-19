import React, { useState } from 'react';
import { UploadCloud, Bell, Settings, CheckCircle, HelpCircle, XCircle, PlayCircle, Edit3 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ModalWrapper } from './Modals';

// ─── 1. Upload Proof Modal ──────────────────────────────────────────
export function UploadProofModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      addToast("Preuve de correction téléchargée avec succès. (Simulation)", 'success');
      onClose();
    }, 1200);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Soumettre une Preuve" subtitle="Télécharger une photo de la situation corrigée" icon={<UploadCloud size={20}/>} iconBg="bg-slate-100" iconColor="text-slate-700">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 px-6 py-8 text-center hover:bg-gray-100 transition-colors cursor-pointer group">
          <UploadCloud size={32} className="mx-auto text-gray-400 group-hover:text-blue-500 transition-colors mb-3" />
          <p className="text-sm font-bold text-gray-700">Cliquez ou glissez une image ici</p>
          <p className="text-xs text-gray-500 font-medium mt-1">Format supporté: JPG, PNG (Max 10Mo)</p>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Note explicative (Optionnel)</label>
          <textarea rows={2} placeholder="Précisez ce qui a été corrigé..." className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-400 resize-none"></textarea>
        </div>
        <div className="pt-2 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 rounded-xl">Annuler</button>
          <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm rounded-xl min-w-[130px] flex items-center justify-center">
            {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Envoyer'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

// ─── 2. Reminder Modal ──────────────────────────────────────────────
export function ReminderModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      addToast("Avis de retard et relance envoyés à l'entreprise responsable. (Simulation)", 'success');
      onClose();
    }, 800);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Relancer l'Entreprise" subtitle="Notification formelle de retard d'intervention" icon={<Bell size={20}/>} iconBg="bg-red-100" iconColor="text-red-600">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm font-medium border border-red-100 mb-2">
          Attention: Cet incident a dépassé le délai légal imparti pour sa résolution.
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Destinataire (Resp. Entreprise)</label>
          <input required type="text" defaultValue="Contact principal lié au lot" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500" readOnly />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Méthode de Relance</label>
          <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500">
            <option>Email automatisé (Urgent)</option>
            <option>Notification sur l'Application Partenaire</option>
            <option>SMS au responsable sur site</option>
          </select>
        </div>
        <div className="pt-2 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 rounded-xl">Annuler</button>
          <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl min-w-[130px] flex items-center justify-center">
            {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Envoyer la relance'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

// ─── 3. False Positive Modal ────────────────────────────────────────
export function FalsePositiveModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      addToast("Alerte marquée comme Faux Positif. L'IA a été notifiée pour apprentissage. (Simulation)", 'success');
      onClose();
    }, 700);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Déclarer Faux Positif" subtitle="Amélioration du modèle IA" icon={<XCircle size={20}/>} iconBg="bg-gray-100" iconColor="text-gray-600">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Raison de l'erreur IA</label>
          <select required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-500">
            <option value="" disabled selected>Sélectionner la raison...</option>
            <option>Élément d'environnement confondu avec un EPI (ex: Seau = Casque)</option>
            <option>Mauvaise détection de silhouette (pas une personne)</option>
            <option>Zone d'alerte mal calibrée</option>
            <option>Autre erreur de détection</option>
          </select>
        </div>
        <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 rounded-xl">Annuler</button>
          <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-bold text-sm rounded-xl">Confirmer le rejet</button>
        </div>
      </form>
    </ModalWrapper>
  );
}

// ─── 4. Camera Settings Modal ───────────────────────────────────────
export function CameraSettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addToast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToast("Paramètres de la caméra sauvegardés en temps réel. (Simulation)", 'success');
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Réglages Caméra Vidéo" subtitle="Ajustement des détections intelligentes" icon={<Settings size={20}/>} iconBg="bg-slate-100" iconColor="text-slate-700">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-bold text-gray-700 mb-0">Seuil de Confiance Global</label>
            <span className="text-sm font-bold text-blue-600">85%</span>
          </div>
          <input type="range" min="50" max="99" defaultValue="85" className="w-full accent-blue-600" />
          <p className="text-xs text-gray-500 mt-1">Un seuil plus élevé réduit les faux positifs mais peut manquer des infractions.</p>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700">Modules d'analyse actifs</label>
          <label className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm font-medium text-gray-700">Détection Casque de sécurité</span>
          </label>
          <label className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm font-medium text-gray-700">Détection Gilet Fluo</span>
          </label>
          <label className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm font-medium text-gray-700">Détection Intrusion sous grue</span>
          </label>
        </div>
        <div className="pt-2 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 rounded-xl">Fermer</button>
          <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl">Sauvegarder les réglages</button>
        </div>
      </form>
    </ModalWrapper>
  );
}

// ─── 5. Resolution Modal ────────────────────────────────────────────
export function ResolutionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      addToast("Incident formellement marqué comme Résolu et clôturé. (Simulation)", 'success');
      onClose();
    }, 1000);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Marquer comme Résolu" subtitle="Clôture de la non-conformité" icon={<CheckCircle size={20}/>} iconBg="bg-emerald-100" iconColor="text-emerald-600">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Action corrective effectuée</label>
          <select required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500">
            <option value="" disabled selected>Sélectionner l'action de résolution...</option>
            <option>EPI fourni et porté par le personnel</option>
            <option>Zone sécurisée et barrières remises en place</option>
            <option>Sensibilisation sécurité effectuée en direct</option>
            <option>Personnel évacué de la zone de danger</option>
            <option>Autre résolution</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Note de clôture pour le registre</label>
          <textarea required rows={3} placeholder="Obligatoire pour les audits HSE..." className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 resize-none"></textarea>
        </div>
        <div className="pt-2 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 rounded-xl">Annuler</button>
          <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl">Clôturer l'incident</button>
        </div>
      </form>
    </ModalWrapper>
  );
}

// ─── 6. Generic Confirm Modal ───────────────────────────────────────
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  description: string;
  actionLabel: string;
  actionColor: 'blue' | 'red' | 'emerald' | 'amber' | 'slate';
  onConfirm: () => void;
}

export function GenericConfirmModal({ isOpen, onClose, title, subtitle, description, actionLabel, actionColor, onConfirm }: ConfirmModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors = {
    blue: "bg-blue-600 hover:bg-blue-700",
    red: "bg-red-600 hover:bg-red-700",
    emerald: "bg-emerald-600 hover:bg-emerald-700",
    amber: "bg-amber-500 hover:bg-amber-600",
    slate: "bg-slate-700 hover:bg-slate-800",
  };
  
  const iconColors = {
    blue: "bg-blue-100 text-blue-600",
    red: "bg-red-100 text-red-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    slate: "bg-slate-100 text-slate-700",
  };

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirm();
      onClose();
    }, 600);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={title} subtitle={subtitle} icon={<HelpCircle size={20}/>} iconBg={iconColors[actionColor].split(' ')[0]} iconColor={iconColors[actionColor].split(' ')[1]}>
      <div className="space-y-4">
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        <div className="pt-4 flex items-center justify-end gap-3 mt-4">
          <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 rounded-xl">Annuler</button>
          <button type="button" disabled={isSubmitting} onClick={handleConfirm} className={`px-6 py-2.5 text-white font-bold text-sm rounded-xl flex items-center justify-center min-w-[120px] ${colors[actionColor]}`}>
            {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : actionLabel}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ─── 7. Video Replay Modal ──────────────────────────────────────────
export function VideoReplayModal({ isOpen, onClose, timestamp }: { isOpen: boolean; onClose: () => void; timestamp?: string }) {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Replay Incident" subtitle={`Extrait vidéo des 30 secondes précédant l'alerte ${timestamp ? '('+timestamp+')' : ''}`} icon={<PlayCircle size={20}/>} iconBg="bg-blue-100" iconColor="text-blue-600">
      <div className="space-y-4">
        <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden relative flex items-center justify-center group border border-gray-200">
          <div className="absolute inset-0 bg-blue-500/10 animate-pulse mix-blend-overlay"></div>
          <div className="text-white text-center">
            <PlayCircle size={48} className="mx-auto text-blue-400 mb-2 opacity-50 group-hover:scale-110 transition-transform cursor-pointer" />
            <span className="text-sm font-medium opacity-70 font-mono">Lecture du tampon de sécurité...</span>
          </div>
          <div className="absolute bottom-3 left-3 flex gap-2">
            <span className="px-2 py-1 bg-red-600 rounded text-[10px] font-bold text-white uppercase tracking-wider animate-pulse flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span> REC
            </span>
          </div>
        </div>
        <div className="pt-2 flex items-center justify-end gap-3 mt-4">
          <button type="button" onClick={onClose} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm rounded-xl">Fermer la vue</button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ─── 8. Adjust Count Modal ──────────────────────────────────────────
export function CountAdjustModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      addToast("Ajustement du comptage effectué. Le modèle IA a été mis à jour via ce signal. (Simulation)", 'success');
      onClose();
    }, 600);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Ajuster Comptage IA" subtitle="Correction manuelle (Faux négatif / positif)" icon={<Edit3 size={20}/>} iconBg="bg-purple-100" iconColor="text-purple-600">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Valeur corrigée observée</label>
          <input required type="number" min="0" placeholder="Ex: 4" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold focus:ring-2 focus:ring-purple-500 max-w-[120px]" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Type d'erreur constatée</label>
          <select required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500">
            <option value="" disabled selected>Sélectionner la cause probable...</option>
            <option>Manque de visibilité (Occlusion, météo)</option>
            <option>Erreur de détection IA (Objet confondu)</option>
            <option>Élément partiellement hors cadre</option>
            <option>Autre cause</option>
          </select>
        </div>
        <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3 mt-4">
          <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 rounded-xl">Annuler</button>
          <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl min-w-[150px] flex items-center justify-center">
            {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Valider la correction'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
