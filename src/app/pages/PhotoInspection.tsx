import { useState } from 'react';
import {
  Camera, Upload, MapPin, Calendar, User,
  AlertTriangle, CheckCircle, X, Download,
  RefreshCw, ScanSearch, Filter, Share2
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useToast } from '../context/ToastContext';
import { TODAY_STR, YESTERDAY_STR } from '../data/mockData';
import { ShareModal, CreateReportModal } from '../components/Modals';
import { CreateIncidentModal } from '../components/CreateIncidentModal';
import { FalsePositiveModal, GenericConfirmModal } from '../components/AdvancedModals';

// ─── Data ─────────────────────────────────────────────────────────────────────

const inspectionPhotos = [
  {
    id: 1, filename: 'inspection_001.jpg',
    uploadedBy: 'user-12', uploaderName: 'Agent de Sécurité Jean', deviceInfo: 'Mobile iOS', timestamp: `${TODAY_STR} 09:15`,
    lot: 'Lot 02 - Gros œuvre',
    location: { lat: 48.8566, lng: 2.3522, zone: 'Zone A - Entrée Nord' },
    image: 'https://images.unsplash.com/photo-1694521787162-5373b598945c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    analysis: {
      workers: 3, helmets: 3, vests: 2, gloves: 3,
      violations: ['Gilet de sécurité manquant - Ouvrier #2'],
      confidence: { helmets: 97, vests: 83, gloves: 91, overall: 87 },
    },
    status: 'violation',
  },
  {
    id: 2, filename: 'inspection_002.jpg',
    uploadedBy: 'user-05', uploaderName: 'Chef de Chantier Sarah', deviceInfo: 'Tablet Android', timestamp: `${TODAY_STR} 10:32`,
    lot: 'Lot 04 - Electricité',
    location: { lat: 48.8570, lng: 2.3515, zone: 'Zone B - Centrale' },
    image: 'https://images.unsplash.com/photo-1649034872337-feaa751786ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    analysis: {
      workers: 2, helmets: 2, vests: 2, gloves: 2,
      violations: [],
      confidence: { helmets: 99, vests: 98, gloves: 96, overall: 98 },
    },
    status: 'compliant',
  },
  {
    id: 3, filename: 'inspection_003.jpg',
    uploadedBy: 'user-12', uploaderName: 'Agent de Sécurité Jean', deviceInfo: 'Mobile iOS', timestamp: `${TODAY_STR} 11:45`,
    lot: 'Lot 01 - Terrassement',
    location: { lat: 48.8562, lng: 2.3530, zone: 'Zone C - Équipements' },
    image: 'https://images.unsplash.com/photo-1666137270524-5131ac07314d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    analysis: {
      workers: 5, helmets: 4, vests: 5, gloves: 3,
      violations: ['Casque manquant - Ouvrier #4', 'Gants manquants - 2 ouvriers'],
      confidence: { helmets: 91, vests: 94, gloves: 78, overall: 85 },
    },
    status: 'violation',
  },
  {
    id: 4, filename: 'inspection_004.jpg',
    uploadedBy: 'user-02', uploaderName: 'Superviseur HSE Mike', deviceInfo: 'Web Upload', timestamp: `${YESTERDAY_STR} 14:20`,
    lot: 'Lot 03 - Charpente Métallique',
    location: { lat: 48.8575, lng: 2.3508, zone: 'Zone A - Ouest' },
    image: 'https://images.unsplash.com/photo-1723367194881-fe2e53534170?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    analysis: {
      workers: 8, helmets: 8, vests: 8, gloves: 8,
      violations: [],
      confidence: { helmets: 99, vests: 99, gloves: 97, overall: 99 },
    },
    status: 'compliant',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function PhotoInspection() {
  const [selectedPhoto, setSelectedPhoto] = useState(inspectionPhotos[0]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'violation' | 'compliant'>('all');
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isFalsePositiveOpen, setIsFalsePositiveOpen] = useState(false);
  const [isCertifyOpen, setIsCertifyOpen] = useState(false);
  
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isReanalyzeOpen, setIsReanalyzeOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCreateIncidentOpen, setIsCreateIncidentOpen] = useState(false);

  const { addToast } = useToast();

  const filtered = filter === 'all' ? inspectionPhotos
    : inspectionPhotos.filter(p => p.status === filter);

  const totalViolations = inspectionPhotos.reduce((s, p) => s + p.analysis.violations.length, 0);
  const compliantCount  = inspectionPhotos.filter(p => p.status === 'compliant').length;

  return (
    <div className="bg-[#F4F7FC] font-sans min-h-full">

      {/* ── Top Bar ── */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 shadow-sm sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-[26px] font-bold text-gray-800 tracking-tight">Inspection par Photo</h1>
            <p className="text-gray-400 text-[14px] mt-0.5 font-medium">Analyse IA des photos de sécurité sur le terrain</p>
          </div>
          <button
            onClick={() => setUploadOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#F97215] text-white rounded-xl text-sm font-bold hover:bg-[#ea660c] transition shadow-md shadow-orange-200 shrink-0"
          >
            <Upload size={16}/> Envoyer une Photo
          </button>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6 max-w-[1600px] mx-auto">

        {/* ── KPI Summary ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Inspections Totales"  value={String(inspectionPhotos.length)} sub="Cette session"             icon={<Camera size={20}/>}       bg="bg-blue-50 text-blue-500"/>
          <KpiCard label="Photos Conformes"   value={String(compliantCount)}          sub="Conformité EPI complète"       icon={<CheckCircle size={20}/>}   bg="bg-emerald-50 text-emerald-500"/>
          <KpiCard label="Photos avec Violations" value={String(inspectionPhotos.length - compliantCount)} sub="Nécessite une action" icon={<AlertTriangle size={20} strokeWidth={2.5}/>} bg="bg-red-50 text-red-500"/>
          <KpiCard label="Violations Totales"   value={String(totalViolations)}         sub="Sur toutes les photos"         icon={<ScanSearch size={20}/>}    bg="bg-amber-50 text-amber-500"/>
        </div>

        {/* ── Photo Gallery ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Gallery filter bar */}
          <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
            <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5"><Filter size={13}/> Filtre :</span>
            {(['all', 'violation', 'compliant'] as const).map(v => (
              <button
                key={v}
                onClick={() => setFilter(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors capitalize focus-visible:ring-2 focus-visible:ring-site-orange focus-visible:outline-none focus-visible:border-none
                  ${filter === v
                    ? 'bg-[#F97215] text-white border-orange-400 shadow-sm'
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
              >
                {v === 'all' ? 'Toutes les photos' : v === 'violation' ? '⚠ Violations' : '✓ Conformes'}
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-500 font-semibold">{filtered.length} sur {inspectionPhotos.length} photos</span>
          </div>

          {/* Grid of photos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-5">
            {filtered.map(photo => (
              <button
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className={`group text-left border-2 rounded-2xl overflow-hidden transition-all shadow-sm hover:shadow-md focus-visible:ring-4 focus-visible:ring-site-orange focus-visible:outline-none focus-visible:border-none
                  ${selectedPhoto.id === photo.id
                    ? 'border-[#F97215] ring-2 ring-orange-200 shadow-orange-100'
                    : 'border-gray-200 hover:border-gray-300'}`}
              >
                {/* Thumbnail */}
                <div className="aspect-video relative overflow-hidden bg-gray-100">
                  <ImageWithFallback src={photo.image} alt={photo.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                  {/* Status badge */}
                  <div className="absolute top-2 right-2">
                    {photo.status === 'compliant' ? (
                      <span className="flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                        <CheckCircle size={10}/> Conforme
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                        <AlertTriangle size={10}/> {photo.analysis.violations.length} violation{photo.analysis.violations.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {/* Selected overlay */}
                  {selectedPhoto.id === photo.id && (
                    <div className="absolute inset-0 border-2 border-[#F97215]/60 bg-orange-500/5"/>
                  )}
                </div>
                {/* Caption */}
                <div className="p-3 bg-white">
                  <div className="font-bold text-gray-800 text-[13px] truncate">{photo.filename}</div>
                  <div className="text-gray-500 text-[11px] flex items-center gap-1 mt-0.5"><User size={9}/> {photo.uploadedBy}</div>
                  <div className="text-gray-500 text-[11px] flex items-center gap-1 mt-0.5"><Calendar size={9}/> {photo.timestamp}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Photo Detail Section ── */}
        <div className="space-y-5">
          {/* Detail header */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                  <Camera className="text-[#F97215]" size={24}/>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-1">Inspection par Photo / Détail</div>
                  <h3 className="font-bold text-gray-800 text-[15px]">{selectedPhoto.uploaderName}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-gray-500 text-xs">ID: {selectedPhoto.uploadedBy}</p>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <p className="text-gray-500 text-xs">{selectedPhoto.deviceInfo}</p>
                  </div>
                  <p className="text-gray-500 text-sm">Analyse de la photo d'inspection sur le terrain</p>
                </div>
              </div>
              {selectedPhoto.status === 'compliant' ? (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-2.5 rounded-xl font-bold text-sm shrink-0">
                  <CheckCircle size={18}/> Conformité EPI confirmée
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl font-bold text-sm shrink-0">
                  <AlertTriangle size={18}/> {selectedPhoto.analysis.violations.length} Violations
                </div>
              )}
            </div>
            {/* Meta  */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Importé par',      value: selectedPhoto.uploadedBy },
                { label: 'Horodatage',        value: selectedPhoto.timestamp },
                { label: 'Emplacement',         value: selectedPhoto.location.zone },
                { label: 'Lot Technique',  value: selectedPhoto.lot },
              ].map(m => (
                <div key={m.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wide mb-1">{m.label}</div>
                  <div className="text-gray-700 text-[13px] font-semibold leading-snug">{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Photo with AI overlays */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
              <ScanSearch size={15} className="text-gray-400"/>
              <h3 className="text-gray-700 font-bold text-sm">Photo avec Calques de Détection IA</h3>
            </div>
            <div className="aspect-video relative bg-gray-100">
              <ImageWithFallback src={selectedPhoto.image} alt={selectedPhoto.filename} className="w-full h-full object-contain"/>
              {/* AI Detection Overlays */}
              <div className="absolute top-1/4 left-1/4 border-2 border-emerald-500 rounded-lg p-1 shadow">
                <span className="bg-emerald-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">Ouvrier ✓</span>
              </div>
              <div className="absolute top-1/3 right-1/3 border-2 border-emerald-500 rounded-lg p-1 shadow">
                <span className="bg-emerald-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">Casque ✓</span>
              </div>
              {selectedPhoto.status === 'violation' && (
                <div className="absolute bottom-1/3 left-1/2 border-2 border-red-500 rounded-lg p-1 shadow">
                  <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">EPI Manquant ⚠</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Analysis + GPS side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* AI Detection Results */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-gray-700 font-bold text-sm flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <ScanSearch size={15} className="text-gray-400"/> Résultats de Détection IA
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Ouvriers Détectés',      value: selectedPhoto.analysis.workers,  check: null, conf: null },
                  { label: 'Casques Détectés',       value: selectedPhoto.analysis.helmets,  check: selectedPhoto.analysis.helmets === selectedPhoto.analysis.workers, conf: selectedPhoto.analysis.confidence.helmets },
                  { label: 'Gilets Détectés',  value: selectedPhoto.analysis.vests,    check: selectedPhoto.analysis.vests === selectedPhoto.analysis.workers, conf: selectedPhoto.analysis.confidence.vests },
                  { label: 'Gants Détectés',        value: selectedPhoto.analysis.gloves,   check: selectedPhoto.analysis.gloves === selectedPhoto.analysis.workers, conf: selectedPhoto.analysis.confidence.gloves },
                ].map(item => (
                  <div key={item.label} className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-gray-600 font-medium text-sm">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-800 text-xl font-extrabold">{item.value}</span>
                        {item.check === true  && <CheckCircle size={16} className="text-emerald-500"/>}
                        {item.check === false && <AlertTriangle size={16} className="text-red-500"/>}
                      </div>
                    </div>
                    {item.conf !== null && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              item.conf >= 90 ? 'bg-emerald-500' : item.conf >= 75 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${item.conf}%` }}
                          />
                        </div>
                        <span className={`text-[11px] font-bold shrink-0 ${
                          item.conf >= 90 ? 'text-emerald-600' : item.conf >= 75 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          Confiance IA : {item.conf}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Overall confidence score */}
                <div className="mt-1 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-wide">Score Global Analyse</span>
                  <span className={`text-sm font-extrabold px-3 py-1 rounded-full ${
                    selectedPhoto.analysis.confidence.overall >= 90
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : selectedPhoto.analysis.confidence.overall >= 75
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {selectedPhoto.analysis.confidence.overall}% de confiance
                  </span>
                </div>
              </div>
            </div>

            {/* GPS Location */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-gray-700 font-bold text-sm flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <MapPin size={15} className="text-gray-400"/> Emplacement GPS
              </h3>
              <div className="aspect-[4/3] bg-gray-50 border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center">
                <MapPin className="text-gray-300 mb-2" size={40}/>
                <div className="text-gray-600 font-semibold text-sm">Vue de la Carte</div>
                <div className="text-gray-500 text-xs mt-1 font-medium">{selectedPhoto.location.zone}</div>
                <div className="text-gray-400 text-xs mt-0.5">
                  {selectedPhoto.location.lat.toFixed(6)}, {selectedPhoto.location.lng.toFixed(6)}
                </div>
                <button className="mt-3 px-4 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 shadow-sm flex items-center gap-1.5">
                  <MapPin size={11}/> Voir sur le plan
                </button>
              </div>
            </div>
          </div>

          {/* Violations */}
          {selectedPhoto.analysis.violations.length > 0 && (
            <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-5">
              <h3 className="text-gray-700 font-bold text-sm flex items-center gap-2 mb-4 pb-3 border-b border-red-100">
                <AlertTriangle size={15} className="text-red-500"/>
                <span className="text-red-600">Violations de Sécurité Détectées</span>
              </h3>
              <div className="space-y-2 mb-4">
                {selectedPhoto.analysis.violations.map((v, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 bg-red-50 hover:bg-red-100/50 border border-red-100 rounded-xl p-3.5 group transition-colors">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5"/>
                      <span className="text-red-700 font-semibold text-sm">{v}</span>
                    </div>
                    <button onClick={() => setIsFalsePositiveOpen(true)} className="text-red-400 hover:text-red-600 hover:bg-red-200 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 shrink-0 mt-[-4px]" title="Ignorer (Signaler comme Faux Positif IA)">
                      <X size={15}/>
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  onClick={() => setIsFalsePositiveOpen(true)}
                  className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2"
                >
                  <X size={15}/> Faux Positif Global
                </button>
                <Btn color="red" icon={<AlertTriangle size={15}/>} label="Créer Incident"
                    onClick={() => setIsCreateIncidentOpen(true)}
                />
              </div>
            </div>
          )}

          {/* Compliant banner */}
          {selectedPhoto.analysis.violations.length === 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle size={20} className="text-white"/>
                </div>
                <div>
                  <div className="font-bold text-emerald-700 text-sm">Toutes les exigences EPI sont respectées</div>
                  <div className="text-emerald-600 text-xs mt-0.5">Aucune violation de sécurité n'a été détectée sur cette photo.</div>
                </div>
              </div>
              <button 
                onClick={() => setIsCertifyOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition flex items-center justify-center gap-2 shrink-0"
              >
                <CheckCircle size={16}/> Certifier Conforme
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-gray-700 font-bold text-sm flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <Btn color="blue"    icon={<Download size={15}/>}   label="Télécharger la Photo" onClick={() => setIsDownloadOpen(true)}/>
              <Btn color="slate"   icon={<Share2 size={15}/>}     label="Partager la photo" onClick={() => setIsShareModalOpen(true)}/>
              <Btn color="slate"   icon={<RefreshCw size={15}/>}  label="Ré-analyser" onClick={() => setIsReanalyzeOpen(true)}/>
              <Btn color="red"     icon={<X size={15}/>}          label="Supprimer la Photo" onClick={() => setIsDeleteOpen(true)}/>
            </div>
            <div className="flex gap-2 w-full mt-2">
              <button 
                onClick={() => setIsReportModalOpen(true)}
                className="flex-1 py-1.5 border-2 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Download size={14}/> Télécharger PDF
              </button>
              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="flex-1 py-1.5 border-2 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Share2 size={14}/> Partager
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Upload Dialog ── */}
      {uploadOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-gray-800 text-lg font-bold">Importer une photo d'inspection</h3>
                <p className="text-gray-400 text-sm mt-0.5">L'IA analysera automatiquement la conformité EPI</p>
              </div>
              <button onClick={() => setUploadOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg">
                <X size={20}/>
              </button>
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-orange-300 hover:bg-orange-50/30 transition-all cursor-pointer mb-4">
              <Upload className="mx-auto text-gray-300 mb-3" size={40}/>
              <p className="text-gray-600 font-semibold text-sm">Cliquez pour importer ou glissez-déposez</p>
              <p className="text-gray-400 text-xs mt-1">JPG, PNG jusqu'à 10 Mo</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setUploadOpen(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 bg-white text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
                Annuler
              </button>
              <button 
                onClick={() => { addToast('Photo importée et analysée avec succès (Simulation)', 'success'); setUploadOpen(false); }}
                className="flex-1 px-4 py-2.5 bg-[#F97215] text-white rounded-xl text-sm font-bold hover:bg-[#ea660c] transition shadow-sm"
              >
                Importer &amp; Analyser
              </button>
            </div>
          </div>
        </div>
      )}

      <CreateIncidentModal isOpen={isCreateIncidentOpen} onClose={() => setIsCreateIncidentOpen(false)} />
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
      <CreateReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
      <FalsePositiveModal isOpen={isFalsePositiveOpen} onClose={() => setIsFalsePositiveOpen(false)} />
      <GenericConfirmModal
        isOpen={isCertifyOpen}
        onClose={() => setIsCertifyOpen(false)}
        title="Certifier la conformité de la zone"
        subtitle="Validation officielle pour le registre HSE"
        description="Vous êtes sur le point de certifier manuellement qu'aucune violation des règles de sécurité n'est présente sur cette image. Cette action confirmera l'analyse de l'IA et sera archivée de manière inaltérable."
        actionLabel="Certifier Conforme"
        actionColor="emerald"
        onConfirm={() => addToast("Conformité certifiée et enregistrée définitivement dans le registre HSE", 'success')}
      />

      {/* --- Residual Modals --- */}
      <CreateReportModal isOpen={isDownloadOpen} onClose={() => setIsDownloadOpen(false)} />
      
      <GenericConfirmModal
          isOpen={isReanalyzeOpen}
          onClose={() => setIsReanalyzeOpen(false)}
          title="Relancer l'Analyse IA"
          subtitle="Nouvelle passe de vérification"
          description="L'IA va repasser sur cette image pour détecter toute anomalie qui aurait pu être manquée."
          actionLabel="Ré-analyser l'image"
          actionColor="blue"
          onConfirm={() => addToast("Nouvelle analyse IA terminée, aucun nouveau problème détecté. (Simulation)", "success")}
      />

      <GenericConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          title="Supprimer la Photo"
          subtitle="Cette action est irréversible."
          description="Êtes-vous sûr de vouloir supprimer définitivement cette preuve du journal d'inspection de ce projet ?"
          actionLabel="Supprimer définitivement"
          actionColor="red"
          onConfirm={() => addToast("Preuve photographique supprimée avec succès. (Simulation)", "success")}
      />
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

type BtnColor = 'amber' | 'emerald' | 'blue' | 'slate' | 'red';
function Btn({ label, icon, color, onClick }: { label: string; icon: React.ReactNode; color: BtnColor; onClick?: () => void }) {
  const { addToast } = useToast();
  const s: Record<BtnColor, string> = {
    amber:   'bg-amber-500 hover:bg-amber-600 text-white',
    emerald: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    blue:    'bg-blue-500 hover:bg-blue-600 text-white',
    red:     'bg-red-500 hover:bg-red-600 text-white',
    slate:   'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700',
  };
  return (
    <button 
      onClick={onClick || (() => addToast(`Action simulée : ${label}`, 'info'))}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm ${s[color]}`}
    >
      {icon}{label}
    </button>
  );
}
