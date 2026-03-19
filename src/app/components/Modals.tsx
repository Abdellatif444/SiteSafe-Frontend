import React, { useState } from 'react';
import { X, FileText, User, MessageSquare, Share2, Calendar, MapPin, Mail, Send } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { mockCameras } from '../data/mockData';
import { MOCK_USERS } from '../context/AuthContext';

// ─── Base Modal Wrapper ──────────────────────────────────────────────
export interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  children: React.ReactNode;
}

export function ModalWrapper({ isOpen, onClose, title, subtitle, icon, iconBg, iconColor, children }: ModalWrapperProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center ${iconColor}`}>
              {icon}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 leading-tight">{title}</h2>
              <p className="text-sm text-gray-500 font-medium">{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 p-2 rounded-lg transition-colors border border-transparent hover:border-gray-200">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── 1. Create Report Modal ──────────────────────────────────────────
export function CreateReportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      addToast("Rapport d'inspection généré avec succès (Simulation)", 'success');
      onClose();
    }, 1000);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Créer Rapport d'Inspection" subtitle="Générer un rapport PDF complet" icon={<FileText size={20}/>} iconBg="bg-blue-100" iconColor="text-blue-600">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Période d'analyse</label>
          <div className="relative">
            <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-blue-500">
              <option>Aujourd'hui</option>
              <option>Les 7 derniers jours</option>
              <option>Ce mois-ci</option>
            </select>
            <Calendar size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Zones à inclure</label>
          <div className="relative">
            <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-blue-500">
              <option>Toutes les zones (Chantier complet)</option>
              {Array.from(new Set(mockCameras.map(cam => cam.location))).map((zone, idx) => (
                <option key={idx} value={zone}>{zone}</option>
              ))}
            </select>
            <MapPin size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 rounded-xl">Annuler</button>
          <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl min-w-[130px] flex items-center justify-center">
            {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Générer PDF'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

// ─── 2. Assign Agent Modal ──────────────────────────────────────────
export function AssignAgentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      addToast("Agent assigné et notifié avec succès ! (Simulation)", 'success');
      onClose();
    }, 600);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Assigner un agent" subtitle="Déléguer la résolution de l'incident" icon={<User size={20}/>} iconBg="bg-orange-100" iconColor="text-[#F97215]">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Agent / Intervenant assigné</label>
          <select required defaultValue="" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#F97215]">
            <option value="" disabled>Sélectionner un collaborateur</option>
            {MOCK_USERS.filter(u => u.role !== 'admin').map(user => {
              const roleDisplay: Record<string, string> = {
                hse_inspector: 'Inspecteur HSE',
                site_director: 'Directeur',
                site_manager: 'Chef de Chantier',
                auditor: 'Auditeur'
              };
              return (
                <option key={user.id} value={user.id}>{user.name} ({roleDisplay[user.role] || user.role})</option>
              );
            })}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Message d'accompagnement</label>
          <textarea rows={3} placeholder="Optionnel : Précisions pour l'agent..." className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#F97215] resize-none"></textarea>
        </div>
        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 rounded-xl">Annuler</button>
          <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-[#F97215] hover:bg-[#ea660c] text-white font-bold text-sm rounded-xl min-w-[130px] flex items-center justify-center">
            {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Confirmer l\'assignation'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

// ─── 3. Add Comment Modal ──────────────────────────────────────────
export function AddCommentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addToast } = useToast();
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(comment.trim()){
      addToast("Le commentaire a été ajouté au journal. (Simulation)", 'success');
      setComment('');
      onClose();
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Ajouter un commentaire" subtitle="Tracer une suivi de l'incident" icon={<MessageSquare size={20}/>} iconBg="bg-slate-100" iconColor="text-slate-600">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea 
          required 
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4} 
          placeholder="Saisissez votre commentaire officiel pour le journal..." 
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-400 resize-none"
        ></textarea>
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 rounded-xl">Annuler</button>
          <button type="submit" className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm rounded-xl">Ajouter</button>
        </div>
      </form>
    </ModalWrapper>
  );
}

// ─── 4. Share Modal ──────────────────────────────────────────
export function ShareModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addToast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToast("L'élément a été partagé avec succès. (Simulation)", 'success');
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Partager" subtitle="Transférer à un collaborateur" icon={<Share2 size={20}/>} iconBg="bg-blue-100" iconColor="text-blue-600">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Adresse Email</label>
          <div className="relative">
            <input required type="email" placeholder="collaborateur@entreprise.com" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 rounded-xl">Annuler</button>
          <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center gap-2">
            <Send size={15} /> Envoyer
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
