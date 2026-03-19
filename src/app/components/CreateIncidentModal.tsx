import { useState } from 'react';
import { X, FileText, Camera, MapPin, AlertTriangle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { mockCameras } from '../data/mockData';

interface CreateIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateIncidentModal({ isOpen, onClose }: CreateIncidentModalProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      setIsSubmitting(false);
      addToast('Incident créé avec succès (Simulation)', 'success');
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-[#F97215]">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 leading-tight">Nouvel Incident</h2>
              <p className="text-sm text-gray-500 font-medium">Déclaration manuelle de non-conformité</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 p-2 rounded-lg transition-colors border border-transparent hover:border-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5">
          <div className="space-y-5">
            
            {/* Titre */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Titre de l'incident *</label>
              <input 
                required
                type="text" 
                placeholder="Ex: Ouvrier sans casque en zone de levage" 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F97215] focus:bg-white transition-all"
              />
            </div>

            {/* Grid for two columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Type de violation *</label>
                <div className="relative">
                  <select required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#F97215] focus:bg-white transition-all">
                    <option value="" disabled selected>Sélectionner un type</option>
                    <option value="epi">Non port d'EPI (Casque, Gilet...)</option>
                    <option value="zone">Intrusion Zone Interdite</option>
                    <option value="distance">Distance Dangereuse Engin</option>
                    <option value="chute">Risque de chute / Hauteur</option>
                    <option value="autre">Autre comportement risqué</option>
                  </select>
                  <AlertTriangle size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Niveau de priorité *</label>
                <select required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F97215] focus:bg-white transition-all">
                  <option value="critical">🔴 Critique (Action immédiate)</option>
                  <option value="high">🟠 Haute (Sous 24h)</option>
                  <option value="medium">🟡 Moyenne (Sous 48h)</option>
                  <option value="low">⚪ Basse (Information)</option>
                </select>
              </div>
            </div>

            {/* Emplacement */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Emplacement exact</label>
              <div className="relative">
                <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#F97215] focus:bg-white transition-all">
                  <option value="">Sélectionner une zone existante (Optionnel)</option>
                  {mockCameras.map(cam => (
                    <option key={cam.id} value={cam.location}>{cam.location}</option>
                  ))}
                </select>
                <MapPin size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Description détaillée</label>
              <textarea 
                rows={3}
                placeholder="Décrivez la situation observée, les personnes impliquées et le contexte..." 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F97215] focus:bg-white transition-all resize-none"
              ></textarea>
            </div>

            {/* Upload d'image (Mock) */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 px-6 py-6 text-center hover:bg-gray-100 transition-colors cursor-pointer group">
              <Camera size={24} className="mx-auto text-gray-400 group-hover:text-[#F97215] transition-colors mb-2" />
              <p className="text-sm font-bold text-gray-700">Cliquez pour ajouter des photos</p>
              <p className="text-xs text-gray-500 font-medium mt-1">JPEG, PNG ou PDF (Max 5Mo)</p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#F97215] hover:bg-[#ea660c] text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 min-w-[140px]"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                'Créer Incident'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
