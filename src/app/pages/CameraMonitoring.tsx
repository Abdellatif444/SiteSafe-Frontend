import { useState, useEffect, useRef } from "react";
import {
  Video,
  AlertTriangle,
  MapPin,
  CheckCircle,
  FileText,
  User,
  Circle,
  RefreshCw,
  XCircle,
  Edit2,
  Camera,
  Play,
  AlertOctagon,
  Clock,
  ExternalLink,
  Info,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

// ─── Data ─────────────────────────────────────────────────────────────────────

import { mockCameras as cameraList } from "../data/mockData";
import { useToast } from "../context/ToastContext";
import { CreateIncidentModal } from "../components/CreateIncidentModal";
import { CreateReportModal } from "../components/Modals";
import {
  VideoReplayModal,
  CountAdjustModal,
} from "../components/AdvancedModals";

// ─── Confirmation Modal ────────────────────────────────────────────────────────

function ConfirmIncidentModal({
  open,
  cameraName,
  violationText,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  cameraName: string;
  violationText: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-7 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <AlertOctagon size={22} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-base">
              Confirmer la création de l'incident
            </h3>
            <p className="text-gray-500 text-sm mt-0.5">{cameraName}</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-5 text-sm text-red-700 font-medium">
          {violationText}
        </div>
        <p className="text-gray-500 text-sm mb-5">
          Cette action va créer un{" "}
          <strong className="text-gray-800">
            constat officiel d'inspection
          </strong>{" "}
          et ouvrir un dossier de non-conformité. Confirmez-vous la détection ?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-sm"
          >
            <FileText size={15} /> Confirmer & Créer l'incident
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 py-2.5 rounded-xl font-bold text-sm transition"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Non-Conformité Modal ──────────────────────────────────────────────────────

function NonConformiteModal({
  open,
  camera,
  onValidate,
  onReject,
  onClose,
}: {
  open: boolean;
  camera: (typeof cameraList)[0] | null;
  onValidate: (data: { comment: string; assignee: string; priority: string; deadline: string }) => void;
  onReject: () => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [comment, setComment] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState("high");
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });

  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setComment("");
      setAssignee("");
      setPriority("high");
      setDeadline(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split("T")[0];
      });
      setProgress(0);
      setPlaying(false);
      setElapsed(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [open]);

  const startVideo = () => {
    if (playing) return;
    setPlaying(true);
    let t = 0;
    timerRef.current = setInterval(() => {
      t += 0.1;
      setElapsed(t);
      setProgress(Math.min((t / 10) * 100, 100));
      if (t >= 10) clearInterval(timerRef.current!);
    }, 100);
  };

  if (!open || !camera) return null;

  const missingVests = camera.detections.workers - camera.detections.vests;
  const missingHelmets = camera.detections.workers - camera.detections.helmets;

  const violationDesc =
    missingVests > 0 && missingHelmets > 0
      ? `${missingVests} ouvrier(s) sans gilet et ${missingHelmets} sans casque détecté(s)`
      : missingVests > 0
        ? `${missingVests} ouvrier(s) détecté(s) sans gilet de sécurité`
        : `${missingHelmets} ouvrier(s) détecté(s) sans casque de sécurité`;

  const detectedAt = new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3 shrink-0 bg-white z-10">
          <div>
            <h3 className="font-bold text-gray-800 text-base">
              {step === 1 ? "Examen de la violation HSE" : "Configuration de l'incident HSE"}
            </h3>
            {step === 2 && (
              <p className="text-gray-500 text-xs mt-0.5">Affectation et détails de la non-conformité</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition shrink-0 mt-0.5"
          >
            <XCircle size={14} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 custom-scrollbar pb-2">
          {step === 1 ? (
            <>
              {/* Video zone */}
              <div className="relative bg-gray-900 h-[220px] flex items-center justify-center overflow-hidden shrink-0">
                <ImageWithFallback
                  src={camera.image}
                  alt={camera.name}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${playing ? "opacity-50" : "opacity-25"
                    }`}
                />

                {/* Play button */}
                {!playing && (
                  <button
                    onClick={startVideo}
                    className="absolute inset-0 flex items-center justify-center z-10"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95">
                        <Play size={20} className="text-white ml-1" />
                      </div>
                      <span className="text-white/70 text-xs font-medium">
                        Lire le segment (10s)
                      </span>
                    </div>
                  </button>
                )}

                {/* Playing overlays */}
                {playing && (
                  <>
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full">
                      <Circle
                        size={6}
                        className="fill-orange-400 text-orange-400 animate-pulse"
                      />
                      <span className="text-white text-[10px] font-bold tracking-wide">
                        EXTRAIT
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full text-white text-[10px] font-mono">
                      0:{String(Math.min(Math.floor(elapsed), 10)).padStart(2, "0")} / 0:10
                    </div>
                    {/* IA detection bounding box overlay */}
                    <div className="absolute top-1/3 right-1/4 border-2 border-red-500 rounded-lg p-1 animate-pulse z-10">
                      <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        EPI Manquant ⚠
                      </span>
                    </div>
                    {missingVests > 0 && (
                      <div className="absolute top-1/2 left-1/3 border-2 border-orange-400 rounded-lg p-1 z-10">
                        <span className="bg-orange-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Gilet absent
                        </span>
                      </div>
                    )}
                  </>
                )}

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                  <div
                    className="h-1 bg-orange-500 transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Violation info */}
              <div className="mx-5 mt-5 bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3 shadow-sm">
                <AlertTriangle
                  size={18}
                  className="text-orange-500 shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-sm font-bold text-orange-800">
                    {violationDesc}
                  </p>
                  <p className="text-xs text-orange-600 mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md text-[10px] font-bold border border-purple-200/50">
                      IA · 87% confiance
                    </span>
                    <span className="font-medium">Détecté à {detectedAt}</span>
                  </p>
                </div>
              </div>

              {/* Comment - Step 1 */}
              <div className="px-5 mt-4">
                <label className="text-xs text-gray-500 font-medium flex items-center gap-1.5 mb-2">
                  <Edit2 size={13} className="text-gray-400" />
                  Commentaire (optionnel)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  placeholder="Ex : Anomalie confirmée sur vue aérienne, intervention requise..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-white focus:outline-none focus:border-green-300 resize-none transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Actions - Step 1 */}
              <div className="flex gap-4 px-5 py-5 mt-1">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#00A551] hover:bg-[#008A43] text-white py-3 rounded-xl font-bold text-sm transition-all shadow-sm"
                >
                  <CheckCircle size={18} /> Valider
                </button>
                <button
                  onClick={() => onReject()}
                  className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-bold text-sm transition-all shadow-sm"
                >
                  <XCircle size={18} /> Rejeter
                </button>
              </div>
            </>
          ) : (
            <div className="px-6 py-5 space-y-5">
              {/* Affectation */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Affectation *</label>
                <div className="relative">
                  <select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#F97215] focus:bg-white transition-all font-medium text-gray-800 cursor-pointer"
                  >
                    <option value="" disabled>Sélectionner un responsable ou entreprise</option>
                    <option value="chef_chantier">Chef de Chantier Principal</option>
                    <option value="entreprise_a">Entreprise Sous-traitante A</option>
                    <option value="entreprise_b">Entreprise Sous-traitante B</option>
                    <option value="hse_resp">Responsable HSE Zone Ouest</option>
                  </select>
                  <User size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Priorité & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Priorité *</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F97215] focus:bg-white transition-all font-medium text-gray-800 cursor-pointer appearance-none"
                  >
                    <option value="critical">🔴 Critique (Immédiat)</option>
                    <option value="high">🟠 Haute (Sous 24h)</option>
                    <option value="medium">🟡 Moyenne (Sous 48h)</option>
                    <option value="low">⚪ Basse (Info)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Date limite *</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F97215] focus:bg-white transition-all font-medium text-gray-800 text-center"
                  />
                </div>
              </div>

              {/* Commentaire */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Edit2 size={13} className="text-gray-400" />
                  Notes ou Directives (Optionnel)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Ex: Demander à l'équipe de se rapprocher du bureau d'accueil..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#F97215] focus:bg-white resize-none transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Informations Résumé */}
              <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3 flex gap-3 mt-1 items-start">
                <Info size={14} className="text-[#F97215] shrink-0 mt-0.5" />
                <p className="text-xs text-orange-800 font-medium leading-relaxed">
                  La validation créera automatiquement un rapport de non-conformité et notifiera les intéressés. La vidéo source sera jointe au dossier comme pièce à conviction.
                </p>
              </div>

              {/* Actions - Step 2 */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-[0.8] flex items-center justify-center bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-bold text-sm transition-all shadow-sm"
                >
                  Retour
                </button>
                <button
                  onClick={() => onValidate({ comment, assignee, priority, deadline })}
                  disabled={!assignee}
                  className="flex-[1.2] flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm transition-all shadow-[0_4px_14px_rgba(22,163,74,0.25)]"
                >
                  <CheckCircle size={16} /> Confirmer l'incident
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CameraMonitoring() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const passedCameraId = location.state?.selectedCameraId as string | undefined;

  const [selectedCamera, setSelectedCamera] = useState(() => {
    return cameraList.find((c) => c.id === passedCameraId) || cameraList[0];
  });
  const [clearedAlerts, setClearedAlerts] = useState<string[]>([]);

  // ── Confirmation modal ──
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalIncidentType] = useState<"zone" | "epi">("epi");

  // ── Non-conformité modal ──
  const [showNonConformiteModal, setShowNonConformiteModal] = useState(false);
  const [nonConformiteCamera, setNonConformiteCamera] = useState<
    (typeof cameraList)[0] | null
  >(null);

  const openNonConformite = (cam: (typeof cameraList)[0]) => {
    setNonConformiteCamera(cam);
    setShowNonConformiteModal(true);
  };

  // ── Auto-cycle ──
  const [autoCycle] = useState(false);
  const autoCycleRef = useRef(autoCycle);
  autoCycleRef.current = autoCycle;

  // ── Last check timestamp ──
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());

  // ── Compliance start time ──
  const [complianceStartTime, setComplianceStartTime] = useState<Date>(
    new Date(),
  );

  // ── Frame captured toast ──
  const [frameCaptured, setFrameCaptured] = useState(false);

  // ── IA Overlays toggle ──
  const [showOverlays] = useState(true);

  // ── Manual compliance certification ──

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReplayModalOpen, setIsReplayModalOpen] = useState(false);
  const [replayTimestamp, setReplayTimestamp] = useState<string | undefined>(
    undefined,
  );
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isIncidentOpen, setIsIncidentOpen] = useState(false);

  // ── Maintenance mock data ──
  const maintenanceSince = "2h 15min";

  useEffect(() => {
    if (passedCameraId) {
      const cam = cameraList.find((c) => c.id === passedCameraId);
      if (cam) setSelectedCamera(cam);
    }
  }, [passedCameraId]);

  // ── Auto-cycle effect ──
  useEffect(() => {
    if (!autoCycle) return;
    const conformList = cameraList.filter((c) => c.status === "active");
    if (conformList.length === 0) return;
    const interval = setInterval(() => {
      if (!autoCycleRef.current) return;
      setSelectedCamera((prev) => {
        const idx = conformList.findIndex((c) => c.id === prev.id);
        const next = conformList[(idx + 1) % conformList.length];
        setLastCheckTime(new Date());
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [autoCycle]);

  const activeCount = cameraList.filter((c) => c.status === "active").length;
  const alertCount = cameraList.filter(
    (c) =>
      c.status === "active" &&
      (c.detections.vests < c.detections.workers ||
        c.detections.helmets < c.detections.workers) &&
      !clearedAlerts.includes(c.id),
  ).length;

  const missingVests =
    selectedCamera.detections.workers - selectedCamera.detections.vests;
  const missingHelmets =
    selectedCamera.detections.workers - selectedCamera.detections.helmets;
  const hasViolation =
    selectedCamera.status === "active" &&
    (missingVests > 0 || missingHelmets > 0) &&
    !clearedAlerts.includes(selectedCamera.id);


  const violationText =
    missingVests > 0 && missingHelmets > 0
      ? `${missingVests} ouvrier(s) sans gilets et ${missingHelmets} sans casque détecté(s) sur ${selectedCamera.name} — ${selectedCamera.location}`
      : missingVests > 0
        ? `${missingVests} ouvrier(s) détecté(s) sans gilet de sécurité sur ${selectedCamera.name} — ${selectedCamera.location}`
        : `${missingHelmets} ouvrier(s) détecté(s) sans casque de sécurité sur ${selectedCamera.name} — ${selectedCamera.location}`;

  const getComplianceDuration = () => {
    const diffMs = new Date().getTime() - complianceStartTime.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "moins d'1 minute";
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""}`;
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    return m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
  };

  const [cameraFilter, setCameraFilter] = useState<
    "all" | "alert" | "ok" | "maintenance"
  >("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const maintenanceCount = cameraList.filter(
    (c) => c.status === "maintenance",
  ).length;
  const okCount = activeCount - alertCount;

  const filteredCameraList = cameraList.filter((cam) => {
    if (cameraFilter === "all") return true;
    if (cameraFilter === "maintenance") return cam.status === "maintenance";
    const isAlert =
      cam.status === "active" &&
      (cam.detections.vests < cam.detections.workers ||
        cam.detections.helmets < cam.detections.workers) &&
      !clearedAlerts.includes(cam.id);
    if (cameraFilter === "alert") return isAlert;
    if (cameraFilter === "ok") return cam.status === "active" && !isAlert;
    return true;
  });

  const handleSelectCamera = (cam: typeof selectedCamera) => {
    setSelectedCamera(cam);
    setLastCheckTime(new Date());
    setComplianceStartTime(new Date());
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setLastCheckTime(new Date());
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleCaptureFrame = () => {
    setFrameCaptured(true);
    setTimeout(() => setFrameCaptured(false), 3000);
  };

  const formatLastCheck = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="bg-[#F4F7FC] font-sans min-h-full">
      {/* ── Modals ── */}
      <ConfirmIncidentModal
        open={showConfirmModal}
        cameraName={selectedCamera.name}
        violationText={
          modalIncidentType === "zone"
            ? "Alerte Critique : Une violation de zone interdite a été détectée sur cette caméra."
            : violationText
        }
        onConfirm={() => {
          setShowConfirmModal(false);
          navigate("/incidents");
        }}
        onCancel={() => setShowConfirmModal(false)}
      />

      <NonConformiteModal
        open={showNonConformiteModal}
        camera={nonConformiteCamera}
        onValidate={(data) => {
          setShowNonConformiteModal(false);
          const commentPart = data.comment ? " : " + data.comment.substring(0, 40) : "";
          addToast(`Incident créé (Affecté à ${data.assignee})${commentPart}`, "success");
          navigate("/incidents");
        }}
        onReject={() => {
          setShowNonConformiteModal(false);
          addToast("Détection rejetée comme fausse alerte.", "info");
          if (nonConformiteCamera) {
            setClearedAlerts((prev) => [...prev, nonConformiteCamera.id]);
          }
        }}
        onClose={() => setShowNonConformiteModal(false)}
      />

      {/* ── Frame Captured Toast ── */}
      {frameCaptured && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
          <Camera size={15} className="text-orange-400" />
          Frame capturée et archivée comme preuve
        </div>
      )}

      <div className="px-8 py-6 pb-32 space-y-6 max-w-[1600px] mx-auto">
        {/* ── Camera Grid ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Video size={14} className="text-gray-400" />
              <h2 className="text-gray-700 font-bold text-sm">
                Caméras du chantier
              </h2>
            </div>
            {/* Filter tabs */}
            <div className="flex items-center gap-1.5">
              {(
                [
                  { key: "all", label: `Toutes (${cameraList.length})` },
                  { key: "alert", label: `Alertes (${alertCount})` },
                  { key: "ok", label: `OK (${okCount})` },
                  {
                    key: "maintenance",
                    label: `Maintenance (${maintenanceCount})`,
                  },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setCameraFilter(f.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${cameraFilter === f.key
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex overflow-x-auto gap-3 px-4 py-4 hide-scrollbar snap-x scroll-smooth">
            {filteredCameraList.map((cam) => {
              const camMissingVests =
                cam.detections.workers - cam.detections.vests;
              const camMissingHelmets =
                cam.detections.workers - cam.detections.helmets;
              const camHasViolation =
                cam.status === "active" &&
                !clearedAlerts.includes(cam.id) &&
                (camMissingVests > 0 || camMissingHelmets > 0);
              const camAlertCount = camHasViolation
                ? (camMissingVests > 0 ? camMissingVests : 0) +
                (camMissingHelmets > 0 ? camMissingHelmets : 0)
                : 0;

              return (
                <button
                  key={cam.id}
                  onClick={() => handleSelectCamera(cam)}
                  className={`shrink-0 w-44 snap-start group text-left border-2 rounded-2xl overflow-hidden transition-all shadow-sm hover:shadow-md focus-visible:ring-4 focus-visible:ring-site-orange focus-visible:outline-none focus-visible:border-none
                    ${selectedCamera.id === cam.id
                      ? "border-[#F97215] ring-2 ring-orange-200"
                      : camAlertCount > 0
                        ? "border-red-400 hover:border-red-500 ring-2 ring-red-100"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <div className="aspect-video relative bg-gray-100 overflow-hidden">
                    <ImageWithFallback
                      src={cam.image}
                      alt={cam.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Status badge */}
                    <div className="absolute top-1.5 right-1.5">
                      {cam.status === "active" ? (
                        <span className="flex items-center gap-1 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
                          <Circle size={5} className="fill-white text-white" />{" "}
                          active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
                          maintenance
                        </span>
                      )}
                    </div>
                    {cam.status === "active" && (
                      <div
                        className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-full"
                        title="Flux en direct"
                      >
                        <Circle
                          size={5}
                          className="fill-red-500 text-red-500 animate-pulse"
                        />
                      </div>
                    )}
                    {/* Violation count badge on thumbnail */}
                    {camAlertCount > 0 && (
                      <div
                        className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-red-500/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          openNonConformite(cam);
                        }}
                      >
                        <AlertTriangle size={8} className="text-white" />
                        <span className="text-white text-[9px] font-bold">
                          {camAlertCount}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-white">
                    <div className="font-bold text-gray-800 text-[11px]">
                      {cam.name}
                    </div>
                    <div className="text-gray-500 text-[10px] truncate leading-tight">
                      {cam.location}
                    </div>
                    {/* {camHasViolation && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openNonConformite(cam);
                        }}
                        className="mt-1.5 w-full flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg py-1 text-[10px] font-bold transition"
                      >
                        <AlertTriangle size={9} /> Voir non-conformités
                      </button>
                    )} */}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Live Feed Detail ── */}
        <div className="space-y-4">
          {/* Feed header */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                <Video className="text-[#F97215]" size={24} />
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-1">
                  Surveillance Caméras / Flux en direct
                </div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedCamera.name}
                  </h2>
                  {selectedCamera.status === "active" ? (
                    <span className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-bold px-2.5 py-1 rounded-full">
                      <Circle
                        size={6}
                        className="fill-emerald-500 text-emerald-500"
                      />{" "}
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-600 text-xs font-bold px-2.5 py-1 rounded-full">
                      Maintenance
                    </span>
                  )}
                </div>
                {/* Zone location link */}
                <button
                  onClick={() =>
                    navigate("/map", {
                      state: { zone: selectedCamera.location },
                    })
                  }
                  title={`Voir la zone sur le plan du site : ${selectedCamera.location}`}
                  className="flex items-center gap-1.5 text-sm text-[#F97215] hover:text-orange-600 font-semibold transition-colors group mt-0.5"
                >
                  <MapPin size={12} className="text-[#F97215]" />
                  <span className="underline decoration-transparent group-hover:decoration-orange-300 underline-offset-2 transition-all">
                    {selectedCamera.location}
                  </span>
                  <ExternalLink
                    size={11}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {selectedCamera.status === "active" && hasViolation && (
                <button
                  onClick={() => openNonConformite(selectedCamera)}
                  title="Examiner la non-conformité détectée sur cette caméra"
                  className="flex items-center gap-2 px-3 py-2.5 border border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl text-sm font-bold transition shadow-sm"
                >
                  <AlertTriangle size={15} /> Non-conformités
                </button>
              )}
            </div>
          </div>

          {/* ── Live video feed ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="relative aspect-video bg-gray-900">
              <ImageWithFallback
                src={selectedCamera.image}
                alt={selectedCamera.name}
                className="w-full h-full object-cover"
              />

              {/* LIVE badge + timestamp */}
              <div className="absolute top-4 left-4 space-y-2">
                <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <Circle
                    size={8}
                    className="fill-red-500 text-red-500 animate-pulse"
                  />
                  <span className="text-white text-sm font-bold tracking-wide">
                    ENREGISTREMENT EN DIRECT
                  </span>
                </div>
                <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg w-max">
                  <span className="text-white text-sm font-mono">
                    10:23:45 AM
                  </span>
                </div>
              </div>

              {/* Frame Capture button overlay */}
              {selectedCamera.status === "active" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCaptureFrame();
                  }}
                  title="Capturer et archiver la frame actuelle comme preuve"
                  className="absolute top-4 right-4 z-20 bg-black/70 hover:bg-black/90 text-white backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold tracking-wide transition shadow-lg border border-white/20 hover:border-white/40"
                >
                  <Camera size={15} /> Capturer frame
                </button>
              )}

              {/* AI Detection Overlays */}
              {selectedCamera.status === "active" && showOverlays && (
                <>
                  <div className="absolute top-1/4 left-1/4 border-2 border-emerald-500 rounded-lg p-1 shadow group cursor-help">
                    <span className="bg-emerald-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                      Ouvrier ✓
                    </span>
                    <div className="absolute top-full mt-1 left-0 bg-gray-900 text-white text-[10px] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none w-max z-10 font-medium tracking-wide">
                      IA Confiance: 97%
                      <br />
                      Tracking ID: #842
                    </div>
                  </div>
                  <div className="absolute top-1/3 right-1/3 border-2 border-emerald-500 rounded-lg p-1 shadow group cursor-help">
                    <span className="bg-emerald-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                      Casque ✓
                    </span>
                    <div className="absolute top-full mt-1 left-0 bg-gray-900 text-white text-[10px] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none w-max z-10 font-medium tracking-wide">
                      IA Confiance: 94%
                      <br />
                      Port correct: Oui
                    </div>
                  </div>
                  <div className="absolute bottom-1/4 left-1/3 border-2 border-blue-500 rounded-lg p-1 shadow group cursor-help">
                    <span className="bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                      Véhicule
                    </span>
                    <div className="absolute top-full mt-1 left-0 bg-gray-900 text-white text-[10px] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none w-max z-10 font-medium tracking-wide">
                      IA Confiance: 96%
                      <br />
                      Type: Engin de chantier
                    </div>
                  </div>
                  {hasViolation && (
                    <div className="absolute top-1/2 right-1/4 border-2 border-red-500 rounded-lg p-1 shadow group cursor-help animate-pulse">
                      <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                        {missingVests > 0 && missingHelmets > 0
                          ? "EPI Manquants ⚠"
                          : missingVests > 0
                            ? "Gilet Manquant ⚠"
                            : "Casque Manquant ⚠"}
                      </span>
                      <div className="absolute top-full mt-1 left-0 bg-red-900 text-white text-[10px] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none w-max z-10 font-medium whitespace-nowrap tracking-wide leading-relaxed">
                        IA Confiance: {missingVests > 0 ? 85 : 89}%
                        <br />
                        Alerte:{" "}
                        {missingVests > 0 && missingHelmets > 0
                          ? "Gilet + Casque absents"
                          : missingVests > 0
                            ? "Absence de gilet HV"
                            : "Absence de casque"}
                        <br />
                        Action requise
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Maintenance overlay */}
              {selectedCamera.status === "maintenance" && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 overflow-hidden">
                  <div className="absolute inset-0 opacity-20 pointer-events-none" />
                  <div className="text-center relative z-10">
                    <div className="text-amber-400 mb-3 flex justify-center animate-pulse">
                      <AlertTriangle size={48} strokeWidth={1.5} />
                    </div>
                    <div className="text-white font-bold text-xl tracking-tight">
                      Caméra en maintenance
                    </div>
                    <div className="text-gray-400 text-sm mt-1.5 font-medium">
                      Flux vidéo temporairement indisponible
                    </div>
                    <div className="mt-5 inline-flex items-center justify-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-xl shadow-2xl">
                      <Clock size={15} className="text-amber-400" />
                      <span className="text-amber-50 text-sm font-bold tracking-wide">
                        Hors ligne depuis {maintenanceSince}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Info bar below feed */}
            <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 flex flex-wrap items-center gap-6">
              {selectedCamera.status === "active" && (
                <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium">
                  <Clock size={12} />
                  Vérifié à {formatLastCheck(lastCheckTime)}
                </div>
              )}
              {selectedCamera.status === "active" && !hasViolation && (
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                  <CheckCircle size={12} />
                  Conforme depuis {getComplianceDuration()}
                </div>
              )}
              {selectedCamera.status === "active" && hasViolation && (
                <div className="flex items-center gap-1.5 text-red-500 text-xs font-medium">
                  <AlertTriangle size={12} />
                  {missingVests + missingHelmets} violation(s) active(s) —
                  action requise
                </div>
              )}
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  className={`flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition ${isRefreshing ? "animate-spin" : ""
                    }`}
                  title="Actualiser"
                >
                  <RefreshCw size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Instantiated Modals ── */}
      <CreateIncidentModal
        isOpen={isIncidentOpen}
        onClose={() => setIsIncidentOpen(false)}
      />
      <CreateReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
      <VideoReplayModal
        isOpen={isReplayModalOpen}
        onClose={() => {
          setIsReplayModalOpen(false);
          setReplayTimestamp(undefined);
        }}
        timestamp={replayTimestamp}
      />
      <CountAdjustModal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
      />
    </div>
  );
}
