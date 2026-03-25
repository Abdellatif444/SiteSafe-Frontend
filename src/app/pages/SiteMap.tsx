import React from "react";
import { useLocation } from "react-router";
import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  Marker,
  Tooltip,
  useMapEvent,
  Polygon,
  Polyline,
  CircleMarker,
} from "react-leaflet";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Pencil,
  Trash2,
  Video,
  X,
  Save,
  Check,
  Undo2,
  AlertCircle,
  MapPin,
  HardHat,
  Shirt,
  ShieldCheck,
  Ban,
  Link2,
  Truck,
  Shield,
  ChevronDown,
  Settings,
  RotateCcw,
  Pentagon,
  Camera,
  Layers,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { mockCameras } from "../data/mockData";
import { useAuth } from "../context/AuthContext";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const buildCameraIcon = (status: "active" | "maintenance") => {
  const ring = status === "active" ? "#3b82f6" : "#f59e0b";
  const fill = status === "active" ? "#0f172a" : "#1c1a0a";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">
    <circle cx="19" cy="19" r="18" fill="${fill}" stroke="${ring}" stroke-width="2"/>
    <rect x="11" y="14" width="12" height="9" rx="2" fill="white"/>
    <rect x="16" y="22" width="3" height="3" rx="0.5" fill="white"/>
    <rect x="13" y="24.5" width="9" height="2" rx="1" fill="white"/>
    <rect x="22.5" y="16.5" width="5" height="5" rx="1.5" fill="white"/>
    <circle cx="27" cy="19" r="2" fill="${fill}" stroke="${ring}" stroke-width="1"/>
    <circle cx="27" cy="19" r="0.8" fill="${ring}"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19],
    className: "",
  });
};

type DrawMode = "polygon" | "camera" | null;

interface DrawnCamera {
  id: string;
  position: [number, number];
  name: string;
  zoneLink?: string;
}

interface DrawnShape {
  id: string;
  type: "polygon";
  points: [number, number][];
  name: string;
  zoneType?: string;
  hseRule?: string;
  linkedCameraId?: string;
  entreprise?: string;
  lot?: string;
  createdBy?: string;
  createdAt?: string;
}

interface SavedData {
  zones: DrawnShape[];
  cameras: DrawnCamera[];
  savedAt: string;
}

const ZONE_TYPES = [
  { value: "danger", label: "Zone à risque", color: "#ef4444" },
  { value: "work", label: "Zone de travail", color: "#f97316" },
  { value: "storage", label: "Zone de stockage", color: "#eab308" },
  { value: "restrict", label: "Zone interdite", color: "#7c3aed" },
  { value: "height", label: "Travail en hauteur", color: "#0ea5e9" },
  { value: "road", label: "Zone de circulation", color: "#22c55e" },
];

const HSE_RULES = [
  { value: "", label: "Aucune règle spécifique", icon: Shield },
  { value: "Casque obligatoire", label: "Casque de sécurité obligatoire", icon: HardHat },
  { value: "Gilet obligatoire", label: "Gilet haute visibilité", icon: Shirt },
  { value: "Casque + Gilet obligatoire", label: "Casque et Gilet obligatoires", icon: ShieldCheck },
  { value: "Accès interdit", label: "Zone d'accès interdit", icon: Ban },
  { value: "Harnaç obligatoire", label: "Harnaç de sécurité obligatoire", icon: Link2 },
  { value: "Zone machinerie lourde", label: "Machinerie lourde — 5 m min", icon: Truck },
];

const LOT_OPTIONS = [
  "Lot 01 - Terrassement",
  "Lot 02 - Gros œuvre",
  "Lot 03 - Charpente Métallique",
  "Lot 04 - Electricité",
  "Lot 05 - Plomberie",
  "Lot 06 - Contrôle Accès",
  "Lot 07 - VRD (Voiries et Réseaux)",
];

interface PendingPolygon {
  points: [number, number][];
}

const computeCentroid = (points: [number, number][]): [number, number] => {
  const lat = points.reduce((s, p) => s + p[0], 0) / points.length;
  const lng = points.reduce((s, p) => s + p[1], 0) / points.length;
  return [lat, lng];
};

// ─── Map click handler ────────────────────────────────────────────────────────
const MapClickHandler = ({
  drawMode,
  onCameraClick,
}: {
  drawMode: DrawMode;
  onCameraClick: (pos: [number, number]) => void;
}) => {
  useMapEvent("click", (e: L.LeafletMouseEvent) => {
    if (drawMode === "camera") onCameraClick([e.latlng.lat, e.latlng.lng]);
  });
  return null;
};

// ─── Toolbar button ───────────────────────────────────────────────────────────
const ToolBtn = ({
  icon: Icon,
  label,
  active = false,
  danger = false,
  success = false,
  disabled = false,
  onClick,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  danger?: boolean;
  success?: boolean;
  disabled?: boolean;
  onClick: () => void;
  badge?: number;
}) => {
  const base =
    "relative group flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-150 focus:outline-none";
  const state = active
    ? "bg-[#F97215] text-white shadow-[0_0_0_2px_rgba(249,114,21,0.4)]"
    : danger
    ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
    : success
    ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
    : disabled
    ? "text-slate-600 cursor-not-allowed"
    : "text-slate-400 hover:text-white hover:bg-slate-700/70";

  return (
    <button
      className={`${base} ${state}`}
      onClick={onClick}
      disabled={disabled}
      title={label}
    >
      <Icon size={20} strokeWidth={2} />
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#F97215] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
      {/* Tooltip */}
      <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#0f172a] border border-slate-700 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl">
        {label}
      </span>
    </button>
  );
};

// ─── Divider ──────────────────────────────────────────────────────────────────
const Divider = () => <div className="w-8 h-px bg-slate-700/60 mx-auto my-1" />;

// ─── Main Component ───────────────────────────────────────────────────────────
export function SiteMap() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const incomingZone = (location.state as { zone?: string } | null)?.zone;

  const [drawMode, setDrawMode] = useState<DrawMode>(null);
  const [mapStyle, setMapStyle] = useState<"osm" | "satellite">("osm");
  const [shapes, setShapes] = useState<DrawnShape[]>([]);
  const [cameras, setCameras] = useState<DrawnCamera[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedData, setSavedData] = useState<SavedData | null>(null);
  const [showLayersPanel, setShowLayersPanel] = useState(false);

  // In-progress polygon points
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);

  // // System cameras positions
  // const [cameraPositions, setCameraPositions] = useState<Record<string, [number, number]>>(
  //   () => Object.fromEntries(mockCameras.map((c) => [c.id, c.coords]))
  // );
  const [draggingCamId, setDraggingCamId] = useState<string | null>(null);

  // ── Zone modal (create / edit) ──
  const [pendingPolygon, setPendingPolygon] = useState<PendingPolygon | null>(null);
  const [editingShapeId, setEditingShapeId] = useState<string | null>(null);
  const [zoneName, setZoneName] = useState("");
  const [zoneNameError, setZoneNameError] = useState(false);
  const [zoneType, setZoneType] = useState(ZONE_TYPES[0].value);
  const [hseRule, setHseRule] = useState("");
  const [hseOpen, setHseOpen] = useState(false);
  const [linkedCamera, setLinkedCamera] = useState("");
  const [camDropOpen, setCamDropOpen] = useState(false);
  const [zoneEntreprise, setZoneEntreprise] = useState("");
  const [zoneLot, setZoneLot] = useState("");

  // ── Camera modal ──
  const [pendingCameraPos, setPendingCameraPos] = useState<[number, number] | null>(null);
  const [camName, setCamName] = useState("");
  const [camX, setCamX] = useState("");
  const [camY, setCamY] = useState("");
  const [camZone, setCamZone] = useState("");

  const featureGroupRef = useRef<L.FeatureGroup>(null);
  const mapRef = useRef<L.Map | null>(null);

  const zoneModalOpen = pendingPolygon !== null || editingShapeId !== null;
  const cameraModalOpen = pendingCameraPos !== null;

  // ── Cursor ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.getContainer().style.cursor = drawMode ? "crosshair" : "";
    }
  }, [drawMode]);

  // ── Polygon drawing logic ─────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || drawMode !== "polygon") return;
    const map = mapRef.current;
    const fg = featureGroupRef.current;
    let pts: L.LatLng[] = [];
    let tempLine: L.Polyline | null = null;

    const refreshLine = () => {
      if (tempLine && fg?.hasLayer(tempLine)) fg.removeLayer(tempLine);
      if (pts.length > 0) {
        tempLine = L.polyline(pts, {
          color: "#F97215",
          weight: 2,
          dashArray: "5,5",
          opacity: 0.9,
        });
        fg?.addLayer(tempLine);
      }
    };

    const finish = () => {
      if (pts.length < 3) return;
      if (tempLine && fg?.hasLayer(tempLine)) fg.removeLayer(tempLine);
      tempLine = null;
      const points = pts.map((p) => [p.lat, p.lng] as [number, number]);
      pts = [];
      setDrawingPoints([]);
      setDrawMode(null);
      // Open zone modal
      setPendingPolygon({ points });
      setZoneName(`Zone ${shapes.filter((s) => s.type === "polygon").length + 1}`);
      setZoneType(ZONE_TYPES[0].value);
      setHseRule("");
      setLinkedCamera("");
      setZoneEntreprise("");
      setZoneLot("");
      setZoneNameError(false);
    };

    const onClick = (e: L.LeafletMouseEvent) => {
      pts.push(e.latlng);
      setDrawingPoints(pts.map((p) => [p.lat, p.lng]));
      refreshLine();
    };

    const onRightClick = (e: L.LeafletMouseEvent) => {
      e.originalEvent.preventDefault();
      finish();
    };

    const onDblClick = () => finish();

    map.on("click", onClick);
    map.on("contextmenu", onRightClick);
    map.on("dblclick", onDblClick);

    return () => {
      map.off("click", onClick);
      map.off("contextmenu", onRightClick);
      map.off("dblclick", onDblClick);
      if (tempLine && fg?.hasLayer(tempLine)) fg.removeLayer(tempLine);
    };
  }, [drawMode]);

  // ── Camera placement ──────────────────────────────────────────────────────
  const handleCameraClick = (pos: [number, number]) => {
    setPendingCameraPos(pos);
    setCamName(`Caméra ${cameras.length + 1}`);
    setCamX(pos[1].toFixed(6));
    setCamY(pos[0].toFixed(6));
    setCamZone("");
    setDrawMode(null);
  };

  // ── Confirm zone modal ────────────────────────────────────────────────────
  const confirmZone = () => {
    if (!zoneName.trim()) { setZoneNameError(true); return; }
    const chosen = ZONE_TYPES.find((z) => z.value === zoneType) ?? ZONE_TYPES[0];
    const camId = linkedCamera || undefined;

    if (editingShapeId) {
      setShapes((prev) =>
        prev.map((s) =>
          s.id === editingShapeId
            ? { ...s, name: zoneName.trim(), zoneType: chosen.value, hseRule: hseRule || undefined, linkedCameraId: camId, entreprise: zoneEntreprise.trim() || undefined, lot: zoneLot || undefined }
            : s
        )
      );
      setEditingShapeId(null);
    } else {
      if (!pendingPolygon) return;
      if (camId) {
        setCameraPositions((prev) => ({ ...prev, [camId]: computeCentroid(pendingPolygon.points) }));
      }
      const newShape: DrawnShape = {
        id: `shape-${Date.now()}`,
        type: "polygon",
        points: pendingPolygon.points,
        name: zoneName.trim(),
        zoneType: chosen.value,
        hseRule: hseRule || undefined,
        linkedCameraId: camId,
        entreprise: zoneEntreprise.trim() || undefined,
        lot: zoneLot || undefined,
        createdBy: currentUser?.id,
        createdAt: new Date().toISOString(),
      };
      setShapes((prev) => [...prev, newShape]);
      setPendingPolygon(null);
    }
    setIsDirty(true);
    setZoneNameError(false);
  };

  // ── Confirm camera modal ──────────────────────────────────────────────────
  const confirmCamera = () => {
    if (!pendingCameraPos) return;
    const lat = parseFloat(camY) || pendingCameraPos[0];
    const lng = parseFloat(camX) || pendingCameraPos[1];
    const newCam: DrawnCamera = {
      id: `cam-${Date.now()}`,
      position: [lat, lng],
      name: camName.trim() || `Caméra ${cameras.length + 1}`,
      zoneLink: camZone || undefined,
    };
    setCameras((prev) => [...prev, newCam]);
    setPendingCameraPos(null);
    setIsDirty(true);
  };

  // ── Undo ─────────────────────────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    setShapes((prev) => {
      if (prev.length === 0) return prev;
      setIsDirty(true);
      return prev.slice(0, -1);
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") handleUndo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleUndo]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    if (!isDirty) return;
    if (confirm("Réinitialiser toutes les zones et caméras non enregistrées ?")) {
      setShapes([]);
      setCameras([]);
      setDrawMode(null);
      setDrawingPoints([]);
      featureGroupRef.current?.clearLayers();
      setIsDirty(false);
    }
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = () => {
  setIsSaving(true);

  const data: SavedData = {
    zones: shapes,
    cameras,
    savedAt: new Date().toISOString(),
  };

  // 🔥 IMPORTANT
  localStorage.setItem("mapData", JSON.stringify(data));

  setSavedData(data);
  setIsDirty(false);

  setTimeout(() => setIsSaving(false), 1800);
};

useEffect(() => {
  const stored = localStorage.getItem("mapData");

  if (stored) {
    const data: SavedData = JSON.parse(stored);

    setShapes(data.zones || []);
    setCameras(data.cameras || []);
    setSavedData(data);
  }
}, []);

  // ── Remove zone ───────────────────────────────────────────────────────────
  const handleRemoveShape = (id: string) => {
    setShapes((prev) => prev.filter((s) => s.id !== id));
    setIsDirty(true);
  };

  // ── Open edit modal ───────────────────────────────────────────────────────
  const openEditModal = (shape: DrawnShape) => {
    setEditingShapeId(shape.id);
    setZoneName(shape.name);
    setZoneType(shape.zoneType ?? ZONE_TYPES[0].value);
    setHseRule(shape.hseRule ?? "");
    setLinkedCamera(shape.linkedCameraId ?? "");
    setZoneEntreprise(shape.entreprise ?? "");
    setZoneLot(shape.lot ?? "");
    setZoneNameError(false);
  };

  const closeZoneModal = () => {
    setPendingPolygon(null);
    setEditingShapeId(null);
    setZoneNameError(false);
    setHseOpen(false);
    setCamDropOpen(false);
  };

  // ── Zoom to shape ─────────────────────────────────────────────────────────
  const zoomToShape = (shape: DrawnShape) => {
    if (!mapRef.current) return;
    const bounds = L.latLngBounds(shape.points.map((p) => L.latLng(p[0], p[1])));
    mapRef.current.fitBounds(bounds, { animate: true, padding: [40, 40] });
  };

  // ── Unsaved warning ───────────────────────────────────────────────────────
  useEffect(() => {
    const fn = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, [isDirty]);

  useEffect(() => {
  if (!mapRef.current) return;

  // Si tu as des zones -> zoom dessus
  if (shapes.length > 0) {
    const allPoints = shapes.flatMap(s => s.points);
    const bounds = L.latLngBounds(allPoints.map(p => L.latLng(p[0], p[1])));
    mapRef.current.fitBounds(bounds, { padding: [50, 50] });
  }

  // Sinon fallback sur Casablanca
  else {
    mapRef.current.setView([33.5731, -7.5898], 15);
  }
}, [shapes]);



  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col relative">
      {incomingZone && (
        <div className="bg-[#F97215]/10 border-b border-[#F97215]/30 px-5 py-2.5 flex items-center gap-3 shrink-0">
          <MapPin size={15} className="text-[#F97215] shrink-0" />
          <span className="text-sm text-[#E86B11] font-semibold">
            Navigation depuis <strong>Surveillance Caméras</strong> — Cible :{" "}
            <strong>{incomingZone}</strong>
          </span>
        </div>
      )}

      <div className="flex-1 flex relative overflow-hidden">
        {/* ───────────── CAD TOOLBAR ───────────── */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col items-center gap-1 bg-[#131C29]/95 backdrop-blur border border-slate-700/60 rounded-2xl p-2 shadow-2xl shadow-black/50">
          {/* Draw tools */}
          <ToolBtn
            icon={Pentagon}
            label="Dessiner une zone (polygone)"
            active={drawMode === "polygon"}
            onClick={() => setDrawMode(drawMode === "polygon" ? null : "polygon")}
          />
          <ToolBtn
            icon={Camera}
            label="Placer une caméra"
            active={drawMode === "camera"}
            onClick={() => setDrawMode(drawMode === "camera" ? null : "camera")}
          />

          <Divider />

          {/* Layers panel toggle */}
          <ToolBtn
            icon={Layers}
            label="Couches & zones"
            active={showLayersPanel}
            badge={shapes.length + cameras.length}
            onClick={() => setShowLayersPanel((v) => !v)}
          />

          <Divider />

          {/* Undo */}
          <ToolBtn
            icon={Undo2}
            label="Annuler (Ctrl+Z)"
            disabled={shapes.length === 0}
            onClick={handleUndo}
          />
          {/* Reset */}
          <ToolBtn
            icon={RotateCcw}
            label="Réinitialiser"
            danger={isDirty}
            disabled={!isDirty}
            onClick={handleReset}
          />

          <Divider />

          {/* Save */}
          <ToolBtn
            icon={isSaving ? Check : Save}
            label={isSaving ? "Enregistré ✓" : "Enregistrer"}
            success={isSaving}
            onClick={handleSave}
          />

          {/* Dirty indicator */}
          {isDirty && (
            <div className="mt-1" title="Modifications non enregistrées">
              <AlertCircle size={14} className="text-amber-400" />
            </div>
          )}
        </div>

        {/* ───────────── LAYERS PANEL (floating) ───────────── */}
        {showLayersPanel && (
          <div className="absolute left-20 top-4 z-[999] w-72 bg-[#131C29]/95 backdrop-blur border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/60 flex flex-col max-h-[calc(100vh-6rem)] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 shrink-0">
              <span className="text-white text-sm font-bold flex items-center gap-2">
                <Layers size={15} className="text-slate-400" />
                Couches & Éléments
                <span className="bg-slate-700 text-slate-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                  {shapes.length + cameras.length }
                </span>
              </span>
              <button
                onClick={() => setShowLayersPanel(false)}
                className="text-slate-500 hover:text-white w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-700 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {/* Drawn zones */}
              {shapes.length > 0 && (
                <div className="px-3 py-2">
                  <div className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1.5 px-1">
                    Zones dessinées
                  </div>
                  {shapes.map((shape) => {
                    const zt = ZONE_TYPES.find((z) => z.value === shape.zoneType);
                    return (
                      <div
                        key={shape.id}
                        onClick={() => zoomToShape(shape)}
                        className="group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer hover:bg-slate-700/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: zt?.color ?? "#E84E1B" }}
                          />
                          <div className="min-w-0">
                            <div className="text-slate-200 text-xs font-semibold truncate">{shape.name}</div>
                            <div className="text-slate-500 text-[10px] truncate">{zt?.label}</div>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditModal(shape); }}
                            className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-[#F97215] hover:bg-orange-500/10 transition-colors"
                          >
                            <Pencil size={11} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemoveShape(shape.id); }}
                            className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* User cameras */}
              {cameras.length > 0 && (
                <div className="px-3 py-2 border-t border-slate-700/40">
                  <div className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1.5 px-1">
                    Caméras ajoutées
                  </div>
                  {cameras.map((cam) => (
                    <div
                      key={cam.id}
                      className="group flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-700/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Video size={12} className="text-blue-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-slate-200 text-xs font-semibold truncate">{cam.name}</div>
                          {cam.zoneLink && (
                            <div className="text-slate-500 text-[10px] truncate">→ {cam.zoneLink}</div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => { setCameras((prev) => prev.filter((c) => c.id !== cam.id)); setIsDirty(true); }}
                        className="w-6 h-6 flex items-center justify-center rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0 ml-2"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* System cameras */}
              <div className="px-3 py-2 border-t border-slate-700/40">
                <div className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1.5 px-1">
                  Caméras système
                </div>
                {/* {mockCameras.map((cam) => (
                  <div
                    key={cam.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-700/30 transition-colors cursor-pointer"
                    onClick={() => {
                      const pos = cameraPositions[cam.id] ?? cam.coords;
                      mapRef.current?.flyTo(pos, 17, { duration: 0.8 });
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Video size={12} className={cam.status === "active" ? "text-blue-400 shrink-0" : "text-amber-400 shrink-0"} />
                      <div className="min-w-0">
                        <div className="text-slate-200 text-xs font-semibold truncate">{cam.name}</div>
                        <div className="text-slate-500 text-[10px] truncate">{cam.location}</div>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${cam.status === "active" ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/30" : "text-amber-400 bg-amber-400/10 border border-amber-400/30"}`}>
                      {cam.status === "active" ? "● Actif" : "⚙ Maint."}
                    </span>
                  </div>
                ))} */}
              </div>

              {shapes.length === 0 && cameras.length === 0 && (
                <div className="px-4 py-8 text-center text-slate-500 text-xs">
                  Aucune couche. Utilisez les outils pour dessiner des zones ou placer des caméras.
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="px-4 py-3 border-t border-slate-700/50 shrink-0">
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {ZONE_TYPES.map((zt) => (
                  <div key={zt.value} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: zt.color }} />
                    <span className="text-slate-500 text-[10px] truncate">{zt.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ───────────── ZONE MODAL ───────────── */}
        {zoneModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-[480px] max-h-[90vh] flex flex-col">
              <div className="p-7 space-y-5 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100">
                      {editingShapeId ? <Pencil size={18} className="text-[#F97215]" /> : <MapPin size={18} className="text-[#F97215]" />}
                    </div>
                    <div>
                      <h3 className="text-slate-900 font-extrabold text-lg">
                        {editingShapeId ? "Modifier la zone" : "Qualifier la zone"}
                      </h3>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {editingShapeId ? "Mettre à jour les attributs HSE" : "Définir le type et les règles de sécurité"}
                      </p>
                    </div>
                  </div>
                  <button onClick={closeZoneModal} className="text-slate-400 hover:text-slate-700 w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {/* Zone Name */}
                <div>
                  <label className="block text-[#F97215] text-[10px] mb-1.5 font-bold uppercase tracking-widest">
                    Nom de la zone <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={zoneName}
                    onChange={(e) => { setZoneName(e.target.value); if (e.target.value.trim()) setZoneNameError(false); }}
                    className={`w-full bg-white border text-slate-800 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400 shadow-sm ${zoneNameError ? "border-red-300 focus:ring-red-500/10" : "border-slate-200 focus:border-[#F97215] focus:ring-[#F97215]/10 hover:border-slate-300"}`}
                    placeholder="Ex: Zone d'Équipement - Secteur C"
                  />
                  {zoneNameError && <p className="text-red-400 text-xs mt-1.5">⚠ Le nom de la zone est obligatoire</p>}
                </div>

                {/* Zone Type */}
                <div>
                  <label className="block text-[#F97215] text-[10px] mb-2 font-bold uppercase tracking-widest">Type de zone</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {ZONE_TYPES.map((zt) => (
                      <button
                        key={zt.value}
                        onClick={() => setZoneType(zt.value)}
                        className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border text-sm text-left transition-all shadow-sm ${zoneType === zt.value ? "border-[#F97215] bg-orange-50/30 text-slate-900 font-semibold ring-1 ring-[#F97215]/20" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 font-medium"}`}
                      >
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: zt.color }} />
                        <span className="text-[12px]">{zt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* HSE Rule */}
                <div className="relative">
                  <label className="block text-[#F97215] text-[10px] mb-1.5 font-bold uppercase tracking-widest">Règle HSE associée</label>
                  <button
                    type="button"
                    onClick={() => { setHseOpen(!hseOpen); setCamDropOpen(false); }}
                    className={`w-full bg-white shadow-sm rounded-xl px-4 py-3 text-sm flex items-center justify-between transition-all border ${hseOpen ? "border-[#F97215] ring-4 ring-[#F97215]/10" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <div className="flex items-center gap-2.5">
                      {hseRule ? (
                        <>
                          {(() => { const rule = HSE_RULES.find((r) => r.value === hseRule); const Icon = rule?.icon || Shield; return <Icon size={17} className="text-[#F97215]" />; })()}
                          <span className="font-semibold text-slate-800">{HSE_RULES.find((r) => r.value === hseRule)?.label}</span>
                        </>
                      ) : <span className="text-slate-400">Aucune règle spécifique</span>}
                    </div>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${hseOpen ? "rotate-180" : ""}`} />
                  </button>
                  {hseOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setHseOpen(false)} />
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden py-1.5 ring-1 ring-slate-900/5 max-h-48 overflow-y-auto">
                        {HSE_RULES.map((r) => {
                          const Icon = r.icon;
                          return (
                            <button
                              key={r.value}
                              type="button"
                              onClick={() => { setHseRule(r.value); setHseOpen(false); }}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${hseRule === r.value ? "bg-orange-50/50 text-[#F97215] font-bold" : "text-slate-600 hover:bg-slate-50 font-medium"}`}
                            >
                              <Icon size={16} className={hseRule === r.value ? "text-[#F97215]" : "text-slate-400"} />
                              {r.label}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Lot technique */}
                <div>
                  <label className="block text-[#F97215] text-[10px] mb-1.5 font-bold uppercase tracking-widest">Lot technique</label>
                  <select
                    value={zoneLot}
                    onChange={(e) => setZoneLot(e.target.value)}
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#F97215]/10 focus:border-[#F97215] transition-all shadow-sm cursor-pointer"
                  >
                    <option value="">Aucun lot associé</option>
                    {LOT_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                {/* Entreprise */}
                <div>
                  <label className="block text-[#F97215] text-[10px] mb-1.5 font-bold uppercase tracking-widest">Entreprise intervenante</label>
                  <input
                    value={zoneEntreprise}
                    onChange={(e) => setZoneEntreprise(e.target.value)}
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 text-slate-800 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#F97215]/10 focus:border-[#F97215] transition-all placeholder:text-slate-400 shadow-sm"
                    placeholder="Ex: BâtiPro SARL, Technoélec..."
                  />
                </div>

                {/* Lier caméra */}
                <div className="relative">
                  <label className="block text-[#F97215] text-[10px] mb-1.5 font-bold uppercase tracking-widest">Lier une caméra (optionnel)</label>
                  <button
                    type="button"
                    onClick={() => { setCamDropOpen(!camDropOpen); setHseOpen(false); }}
                    className={`w-full bg-white shadow-sm rounded-xl px-4 py-3 text-sm flex items-center justify-between transition-all border ${camDropOpen ? "border-[#F97215] ring-4 ring-[#F97215]/10" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {linkedCamera ? (
                        <>
                          {/* {(() => { const cam = mockCameras.find((c) => c.id === linkedCamera); return <><Video size={16} className={cam?.status === "maintenance" ? "text-amber-500" : "text-slate-600"} /><span className="truncate font-semibold text-slate-800">{cam?.name} — {cam?.location}</span></>; })()} */}
                        </>
                      ) : <span className="text-slate-400">Aucune caméra liée</span>}
                    </div>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform shrink-0 ${camDropOpen ? "rotate-180" : ""}`} />
                  </button>
                  {camDropOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setCamDropOpen(false)} />
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden py-1.5 max-h-48 overflow-y-auto ring-1 ring-slate-900/5">
                        <button type="button" onClick={() => { setLinkedCamera(""); setCamDropOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                          <Video size={15} className="text-slate-300" /> Aucune caméra liée
                        </button>
                        {/* {mockCameras.map((c) => (
                          <button key={c.id} type="button" onClick={() => { setLinkedCamera(String(c.id)); setCamDropOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors border-t border-slate-50 ${linkedCamera === String(c.id) ? "bg-orange-50/50 text-[#F97215] font-bold" : "text-slate-600 hover:bg-slate-50 font-medium"}`}
                          >
                            <Video size={15} className={c.status === "maintenance" ? "text-amber-500" : "text-slate-400"} />
                            <div>
                              <div>{c.name} — {c.location}</div>
                              {c.status === "maintenance" && <div className="text-[10px] text-amber-500 font-bold">En maintenance</div>}
                            </div>
                          </button>
                        ))} */}
                      </div>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button onClick={closeZoneModal} className="flex-[0.8] bg-white text-slate-700 hover:bg-slate-50 py-3 rounded-xl font-bold text-sm border border-slate-200 transition-all">
                    Annuler
                  </button>
                  <button onClick={confirmZone} className="flex-1 bg-[#F97215] hover:bg-[#E86B11] text-white py-3 rounded-xl font-bold text-sm transition-all shadow-[0_4px_14px_rgba(249,114,21,0.25)]">
                    {editingShapeId ? "Enregistrer" : "Confirmer la zone"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ───────────── CAMERA MODAL ───────────── */}
        {cameraModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-[420px]">
              <div className="p-7 space-y-5">
                <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                      <Camera size={18} className="text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-slate-900 font-extrabold text-lg">Ajouter une caméra</h3>
                      <p className="text-slate-500 text-xs mt-0.5">Définir les propriétés de la caméra</p>
                    </div>
                  </div>
                  <button onClick={() => setPendingCameraPos(null)} className="text-slate-400 hover:text-slate-700 w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                    <X size={20} />
                  </button>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-blue-500 text-[10px] mb-1.5 font-bold uppercase tracking-widest">Nom de la caméra</label>
                  <input
                    value={camName}
                    onChange={(e) => setCamName(e.target.value)}
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 text-slate-800 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all placeholder:text-slate-400 shadow-sm"
                    placeholder="Ex: CAM-Sud-01"
                  />
                </div>

                {/* X Y */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-blue-500 text-[10px] mb-1.5 font-bold uppercase tracking-widest">Longitude (X)</label>
                    <input
                      value={camX}
                      onChange={(e) => setCamX(e.target.value)}
                      className="w-full bg-white border border-slate-200 hover:border-slate-300 text-slate-800 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all shadow-sm"
                      placeholder="-7.589800"
                    />
                  </div>
                  <div>
                    <label className="block text-blue-500 text-[10px] mb-1.5 font-bold uppercase tracking-widest">Latitude (Y)</label>
                    <input
                      value={camY}
                      onChange={(e) => setCamY(e.target.value)}
                      className="w-full bg-white border border-slate-200 hover:border-slate-300 text-slate-800 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all shadow-sm"
                      placeholder="33.573100"
                    />
                  </div>
                </div>

                {/* Zone link */}
                <div>
                  <label className="block text-blue-500 text-[10px] mb-1.5 font-bold uppercase tracking-widest">Zone surveillée (optionnel)</label>
                  <select
                    value={camZone}
                    onChange={(e) => setCamZone(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all shadow-sm cursor-pointer"
                  >
                    <option value="">Aucune zone</option>
                    {shapes.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button onClick={() => setPendingCameraPos(null)} className="flex-[0.8] bg-white text-slate-700 hover:bg-slate-50 py-3 rounded-xl font-bold text-sm border border-slate-200">
                    Annuler
                  </button>
                  <button onClick={confirmCamera} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-[0_4px_14px_rgba(59,130,246,0.25)]">
                    Placer la caméra
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ───────────── MAP ───────────── */}
        <div className={`flex-1 relative ${drawMode ? "cursor-crosshair" : ""}`}>
          {/* Map style switcher */}
          <div className="absolute top-4 right-4 z-[1000] bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 flex gap-1">
            <button onClick={() => setMapStyle("osm")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${mapStyle === "osm" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}>Plan OSM</button>
            <button onClick={() => setMapStyle("satellite")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${mapStyle === "satellite" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}>Satellite</button>
          </div>

          {/* Drawing status hint */}
          {drawMode && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-[#131C29]/90 backdrop-blur text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700/60 flex items-center gap-2.5 text-sm font-medium">
              {drawMode === "polygon" && (
                <>
                  <Pentagon size={16} className="text-[#F97215]" />
                  <span>Cliquer pour ajouter des points · <kbd className="bg-slate-700 px-1.5 py-0.5 rounded text-xs font-mono">Clic droit</kbd> ou <kbd className="bg-slate-700 px-1.5 py-0.5 rounded text-xs font-mono">Double-clic</kbd> pour terminer</span>
                  {drawingPoints.length > 0 && <span className="bg-[#F97215]/20 text-[#F97215] text-xs font-bold px-2 py-0.5 rounded-full">{drawingPoints.length} pt{drawingPoints.length > 1 ? "s" : ""}</span>}
                </>
              )}
              {drawMode === "camera" && (
                <>
                  <Camera size={16} className="text-blue-400" />
                  <span>Cliquer sur la carte pour placer la caméra</span>
                </>
              )}
              <button onClick={() => { setDrawMode(null); setDrawingPoints([]); }} className="ml-2 text-slate-400 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Save confirmation toast */}
          {isSaving && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-emerald-500 text-white px-5 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-semibold animate-pulse">
              <Check size={16} /> Carte enregistrée avec succès
            </div>
          )}

          <MapContainer
            center={[33.5731, -7.5898]}
            zoom={15}
            className="h-full w-full"
            attributionControl={false}
            style={{ background: "#0f172a" }}
            ref={(m) => { if (m) mapRef.current = m; }}
          >
            <TileLayer
              key={mapStyle}
              url={mapStyle === "osm"
                ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"}
            />
            <FeatureGroup ref={featureGroupRef} />
            <MapClickHandler drawMode={drawMode} onCameraClick={handleCameraClick} />

            {/* Drawn zones */}
            {shapes.map((shape) => {
              const col = ZONE_TYPES.find((zt) => zt.value === shape.zoneType)?.color ?? "#E84E1B";
              return (
                <Polygon key={shape.id} positions={shape.points} pathOptions={{ color: col, fillColor: col, fillOpacity: 0.18, weight: 2 }}>
                  <Tooltip sticky className="!bg-[#1a2235] !text-white !text-xs !rounded-lg !border-0 !shadow-xl">
                    <div className="font-bold">{shape.name}</div>
                    {shape.zoneType && <div className="text-slate-300 text-[10px]">{ZONE_TYPES.find((z) => z.value === shape.zoneType)?.label}</div>}
                    {shape.hseRule && <div className="text-amber-300 text-[10px] mt-0.5">⚠ {shape.hseRule}</div>}
                    {shape.entreprise && <div className="text-slate-400 text-[10px] mt-0.5">🏢 {shape.entreprise}</div>}
                    {shape.lot && <div className="text-slate-400 text-[10px]">📋 {shape.lot}</div>}
                  </Tooltip>
                </Polygon>
              );
            })}

            {/* System cameras */}
            {/* {mockCameras.map((cam) => {
              const pos = cameraPositions[cam.id] ?? cam.coords;
              return (
                <Marker
                  key={cam.id}
                  position={pos}
                  icon={buildCameraIcon(draggingCamId === cam.id ? "maintenance" : cam.status)}
                  draggable={true}
                  eventHandlers={{
                    dragstart: () => setDraggingCamId(cam.id),
                    dragend: (e) => {
                      const { lat, lng } = (e.target as L.Marker).getLatLng();
                      setCameraPositions((prev) => ({ ...prev, [cam.id]: [lat, lng] }));
                      setDraggingCamId(null);
                    },
                  }}
                >
                  <Tooltip direction="top" offset={[0, -20]} opacity={1}
                    className="!bg-[#1a2235] !border-blue-500/60 !text-white !text-xs !rounded-xl !shadow-2xl !px-3 !py-2.5"
                  >
                    <div className="min-w-[180px]">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <div className="font-bold text-sm">{cam.name}</div>
                        <Settings size={12} className="text-slate-400" />
                      </div>
                      <div className="text-slate-300 text-[11px] mb-2">{cam.location}</div>
                      <div className={`text-[10px] font-semibold ${cam.status === "active" ? "text-emerald-400" : "text-amber-400"}`}>
                        {cam.status === "active" ? "● ACTIF" : "⚙ MAINTENANCE"}
                      </div>
                      <div className="text-slate-500 text-[9px] mt-1.5 italic">Glisser pour repositionner</div>
                    </div>
                  </Tooltip>
                </Marker>
              );
            })}

            {/* User-placed cameras */}
            {cameras.map((camera) => (
              <Marker key={camera.id} position={camera.position} icon={buildCameraIcon("active")}>
                <Tooltip direction="top" offset={[0, -20]} opacity={1}
                  className="!bg-[#1a2235] !text-white !text-xs !rounded-lg !shadow-xl !px-3 !py-2"
                >
                  <div className="font-bold">{camera.name}</div>
                  {camera.zoneLink && <div className="text-slate-400 text-[10px] mt-0.5">→ {camera.zoneLink}</div>}
                  <div className="text-slate-500 text-[10px] mt-0.5">Caméra manuelle</div>
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}