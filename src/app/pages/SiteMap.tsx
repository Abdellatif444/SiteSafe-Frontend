import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  Marker,
  Tooltip,
  useMapEvent,
  Polygon,
  Polyline,
  CircleMarker
} from "react-leaflet";
import { useState, useRef, useEffect, useCallback } from "react";
import { Pencil, Trash2, Video, X, Layers, Save, Check, Undo2, LocateFixed, AlertCircle, MapPin, HardHat, Shirt, ShieldCheck, Ban, Link2, Truck, Shield, ChevronDown } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { mockCameras } from '../data/mockData';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Camera icon factory – PTZ style camera seen from the side (like reference image)
const buildCameraIcon = (status: 'active' | 'maintenance') => {
  const ring = status === 'active' ? '#3b82f6' : '#f59e0b';
  const fill = status === 'active' ? '#0f172a' : '#1c1a0a';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">
    <circle cx="19" cy="19" r="18" fill="${fill}" stroke="${ring}" stroke-width="2"/>
    <rect x="11" y="14" width="12" height="9" rx="2" fill="white"/>
    <rect x="16" y="22" width="3" height="3" rx="0.5" fill="white"/>
    <rect x="13" y="24.5" width="9" height="2" rx="1" fill="white"/>
    <rect x="22.5" y="16.5" width="5" height="5" rx="1.5" fill="white"/>
    <circle cx="27" cy="19" r="2" fill="${fill}" stroke="${ring}" stroke-width="1"/>
    <circle cx="27" cy="19" r="0.8" fill="${ring}"/>
  </svg>`;
  return L.divIcon({ html: svg, iconSize: [38, 38], iconAnchor: [19, 19], popupAnchor: [0, -19], className: '' });
};

type DrawMode = "polygon" | "line" | "point" | "camera" | null;

interface DrawnCamera {
  id: string;
  position: [number, number];
  name: string;
}

interface DrawnShape {
  id: string;
  type: 'polygon' | 'line' | 'point';
  points: [number, number][];
  name: string;
  zoneType?: string;
  color?: string;
  hseRule?: string;
  linkedCameraId?: number;
}

const ZONE_TYPES = [
  { value: 'danger', label: 'Zone à risque', color: '#ef4444' },
  { value: 'work', label: 'Zone de travail', color: '#f97316' },
  { value: 'storage', label: 'Zone de stockage', color: '#eab308' },
  { value: 'restrict', label: 'Zone interdite', color: '#7c3aed' },
  { value: 'height', label: 'Travail en hauteur', color: '#0ea5e9' },
  { value: 'road', label: 'Zone de circulation', color: '#22c55e' },
];

const HSE_RULES = [
  { value: '', label: 'Aucune règle spécifique', icon: Shield },
  { value: 'Casque obligatoire', label: 'Casque de sécurité obligatoire', icon: HardHat },
  { value: 'Gilet obligatoire', label: 'Gilet haute visibilité', icon: Shirt },
  { value: 'Casque + Gilet obligatoire', label: 'Casque et Gilet obligatoires', icon: ShieldCheck },
  { value: 'Accès interdit', label: 'Zone d\'accès interdit', icon: Ban },
  { value: 'Harnaç obligatoire', label: 'Harnaç de sécurité obligatoire', icon: Link2 },
  { value: 'Zone machinerie lourde', label: 'Machinerie lourde — 5 m min', icon: Truck },
];

interface PendingShape {
  type: 'polygon' | 'line' | 'point';
  points: [number, number][];
}

// Compute centroid of a polygon (average lat/lng)
const computeCentroid = (points: [number, number][]): [number, number] => {
  const lat = points.reduce((s, p) => s + p[0], 0) / points.length;
  const lng = points.reduce((s, p) => s + p[1], 0) / points.length;
  return [lat, lng];
};

const MapClickHandler = ({
  drawMode,
  onCameraAdd,
}: {
  drawMode: DrawMode;
  onCameraAdd: (pos: [number, number]) => void;
}) => {
  useMapEvent("click", (e: L.LeafletMouseEvent) => {
    if (drawMode === "camera") {
      onCameraAdd([e.latlng.lat, e.latlng.lng]);
    }
  });

  return null;
};

export function SiteMap() {
  const [drawMode, setDrawMode] = useState<DrawMode>(null);
  const [cameras, setCameras] = useState<DrawnCamera[]>([]);
  const [shapes, setShapes] = useState<DrawnShape[]>([]);
  const [mapStyle, setMapStyle] = useState<'osm' | 'satellite'>('osm');
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [cameraPositions, setCameraPositions] = useState<Record<number, [number, number]>>(
    () => Object.fromEntries(mockCameras.map(c => [c.id, c.coords]))
  );
  const [draggingCamId, setDraggingCamId] = useState<number | null>(null);
  // Zone qualification modal
  const [pendingShape, setPendingShape] = useState<PendingShape | null>(null);
  const [editingShapeId, setEditingShapeId] = useState<string | null>(null); // null = create, string = edit
  const [zoneName, setZoneName] = useState('');
  const [zoneNameError, setZoneNameError] = useState(false);
  const [zoneType, setZoneType] = useState(ZONE_TYPES[0].value);
  const [hseRule, setHseRule] = useState('');
  const [hseDropdownOpen, setHseDropdownOpen] = useState(false);
  const [linkedCamera, setLinkedCamera] = useState('');
  const [camDropdownOpen, setCamDropdownOpen] = useState(false);
  const modalOpen = pendingShape !== null || editingShapeId !== null;

  const featureGroupRef = useRef<L.FeatureGroup>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || !drawMode || drawMode === "camera") return;

    const map = mapRef.current;
    const drawnItems = featureGroupRef.current;
    let localPoints: L.LatLng[] = [];
    let tempPolyline: L.Polyline | null = null;

    const createPolygon = (latlngs: L.LatLng[]) => {
      if (latlngs.length >= 3) {
        // Don't add yet — open the zone modal first
        setPendingShape({
          type: 'polygon',
          points: latlngs.map(p => [p.lat, p.lng] as [number, number]),
        });
        setZoneName(`Zone ${shapes.filter(s => s.type === 'polygon').length + 1}`);
        setZoneType(ZONE_TYPES[0].value);
        if (tempPolyline && drawnItems && drawnItems.hasLayer(tempPolyline)) {
          drawnItems.removeLayer(tempPolyline);
        }
        localPoints = [];
        tempPolyline = null;
        setDrawMode(null);
      }
    };

    const createPolyline = (latlngs: L.LatLng[]) => {
      if (latlngs.length >= 2) {
        setShapes((prev) => [...prev, {
          id: `shape-${Date.now()}`,
          type: 'line',
          points: latlngs.map(p => [p.lat, p.lng] as [number, number]),
          name: `Tracé ${prev.filter(s => s.type === 'line').length + 1}`
        }]);
        if (tempPolyline && drawnItems && drawnItems.hasLayer(tempPolyline)) {
          drawnItems.removeLayer(tempPolyline);
        }
        localPoints = [];
        tempPolyline = null;
        setDrawMode(null);
      }
    };

    const updateTempPolyline = (latlngs: L.LatLng[]) => {
      if (drawMode === "polygon" && latlngs.length > 0) {
        if (tempPolyline && drawnItems && drawnItems.hasLayer(tempPolyline)) {
          drawnItems.removeLayer(tempPolyline);
        }
        tempPolyline = L.polyline(latlngs, {
          color: "#E84E1B",
          weight: 2,
          dashArray: "5, 5",
          opacity: 0.8,
        });
        if (drawnItems) {
          drawnItems.addLayer(tempPolyline);
        }
      } else if (drawMode === "line" && latlngs.length > 0) {
        if (tempPolyline && drawnItems && drawnItems.hasLayer(tempPolyline)) {
          drawnItems.removeLayer(tempPolyline);
        }
        tempPolyline = L.polyline(latlngs, {
          color: "#E84E1B",
          weight: 2,
          dashArray: "5, 5",
          opacity: 0.8,
        });
        if (drawnItems) {
          drawnItems.addLayer(tempPolyline);
        }
      }
    };

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      localPoints.push(e.latlng);

      if (drawMode === "point") {
        setShapes((prev) => [...prev, {
          id: `shape-${Date.now()}`,
          type: 'point',
          points: [[e.latlng.lat, e.latlng.lng]],
          name: `Marqueur ${prev.filter(s => s.type === 'point').length + 1}`
        }]);
        localPoints = [];
        setDrawMode(null);
      } else if (drawMode === "polygon" || drawMode === "line") {
        updateTempPolyline(localPoints);
      }
    };

    const handleRightClick = (e: L.LeafletMouseEvent) => {
      e.originalEvent.preventDefault();
      if (drawMode === "polygon" && localPoints.length >= 3) {
        createPolygon(localPoints);
      } else if (drawMode === "line" && localPoints.length >= 2) {
        createPolyline(localPoints);
      }
    };

    const handleDoubleClick = () => {
      if (drawMode === "polygon" && localPoints.length >= 3) {
        createPolygon(localPoints);
      } else if (drawMode === "line" && localPoints.length >= 2) {
        createPolyline(localPoints);
      }
    };

    map.on("click", handleMapClick);
    map.on("contextmenu", handleRightClick);
    map.on("dblclick", handleDoubleClick);

    return () => {
      map.off("click", handleMapClick);
      map.off("contextmenu", handleRightClick);
      map.off("dblclick", handleDoubleClick);
      if (tempPolyline && drawnItems && drawnItems.hasLayer(tempPolyline)) {
        drawnItems.removeLayer(tempPolyline);
      }
    };
  }, [drawMode]);

  const handleAddCamera = (pos: [number, number]) => {
    const newCamera: DrawnCamera = {
      id: `cam-${Date.now()}`,
      position: pos,
      name: `Camera ${cameras.length + 1}`,
    };
    setCameras([...cameras, newCamera]);
  };

  const handleRemoveCamera = (id: string) => {
    setCameras(cameras.filter((cam) => cam.id !== id));
  };

  // Change de curseur sur le canvas Leaflet directement
  useEffect(() => {
    if (mapRef.current) {
      const container = mapRef.current.getContainer();
      container.style.cursor = drawMode ? 'crosshair' : '';
    }
  }, [drawMode]);

  const handleDrawMode = (mode: DrawMode) => {
    setDrawMode(drawMode === mode ? null : mode);
  };

  const clearAll = () => {
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
    }
    setShapes([]);
    setCameras([]);
  };

  const handleRemoveShape = (id: string) => {
    setShapes(shapes.filter((s) => s.id !== id));
    setIsDirty(true);
  };

  const handleUndo = useCallback(() => {
    setShapes(prev => {
      if (prev.length === 0) return prev;
      setIsDirty(true);
      return prev.slice(0, -1);
    });
  }, []);

  // Keyboard shortcut Ctrl+Z
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') handleUndo();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleUndo]);

  const handleSave = () => {
    setIsSaving(true);
    setIsDirty(false);
    setTimeout(() => setIsSaving(false), 2000);
  };

  const confirmZone = () => {
    // Validate: name is required
    if (!zoneName.trim()) { setZoneNameError(true); return; }
    const chosen = ZONE_TYPES.find(z => z.value === zoneType) ?? ZONE_TYPES[0];
    const camId = linkedCamera ? parseInt(linkedCamera) : undefined;

    if (editingShapeId) {
      // Edit mode: update existing shape
      setShapes(prev => prev.map(s =>
        s.id === editingShapeId
          ? { ...s, name: zoneName.trim(), zoneType: chosen.value, color: chosen.color, hseRule: hseRule || undefined, linkedCameraId: camId }
          : s
      ));
      // Re-center camera if re-linked
      const edited = shapes.find(s => s.id === editingShapeId);
      if (camId && edited && edited.type === 'polygon') {
        setCameraPositions(prev => ({ ...prev, [camId]: computeCentroid(edited.points) }));
      }
      setEditingShapeId(null);
    } else {
      // Create mode
      if (!pendingShape) return;
      if (camId && pendingShape.type === 'polygon') {
        setCameraPositions(prev => ({ ...prev, [camId]: computeCentroid(pendingShape.points) }));
      }
      setShapes(prev => [...prev, {
        id: `shape-${Date.now()}`,
        type: pendingShape.type,
        points: pendingShape.points,
        name: zoneName.trim(),
        zoneType: chosen.value,
        color: chosen.color,
        hseRule: hseRule || undefined,
        linkedCameraId: camId,
      }]);
      setPendingShape(null);
    }
    setIsDirty(true);
    setZoneNameError(false);
    setHseRule('');
    setLinkedCamera('');
  };

  // Open modal in edit mode from the layer list
  const openEditModal = (shape: DrawnShape) => {
    setEditingShapeId(shape.id);
    setZoneName(shape.name);
    setZoneType(shape.zoneType ?? ZONE_TYPES[0].value);
    setHseRule(shape.hseRule ?? '');
    setLinkedCamera(shape.linkedCameraId ? String(shape.linkedCameraId) : '');
    setZoneNameError(false);
  };

  // Close modal helper
  const closeModal = () => {
    setPendingShape(null);
    setEditingShapeId(null);
    setZoneNameError(false);
    setHseDropdownOpen(false);
    setCamDropdownOpen(false);
  };

  // Navigate to zone bounds on layer list click
  const zoomToShape = (shape: DrawnShape) => {
    if (!mapRef.current || shape.points.length === 0) return;
    if (shape.type === 'polygon' || shape.type === 'line') {
      const bounds = L.latLngBounds(shape.points.map(p => L.latLng(p[0], p[1])));
      mapRef.current.fitBounds(bounds, { animate: true, padding: [40, 40] });
    } else {
      mapRef.current.setView(shape.points[0], 17, { animate: true });
    }
  };

  // Warn user before navigating away with unsaved changes
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const centerOnSite = () => {
    if (mapRef.current) {
      mapRef.current.setView([33.5731, -7.5898], 15, { animate: true });
    }
  };

  return (
    <div className="h-full flex relative">
      {/* Zone Qualification Modal (create + edit) */}
      {modalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-[480px] max-h-[90vh] flex flex-col">
            <div className="p-7 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between pb-5 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm">
                    {editingShapeId
                      ? <Pencil size={18} className="text-site-orange" strokeWidth={2.5} />
                      : <MapPin size={18} className="text-site-orange" strokeWidth={2.5} />}
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-extrabold text-lg tracking-tight leading-tight">
                      {editingShapeId ? 'Modifier la zone' : 'Qualifier la zone'}
                    </h3>
                    <p className="text-slate-500 text-xs font-medium mt-0.5">{editingShapeId ? 'Mettre à jour les attributs HSE' : 'Définir le type et les règles de sécurité'}</p>
                  </div>
                </div>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-700 w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"><X size={20} strokeWidth={2.5} /></button>
              </div>

              {/* Zone Name — required */}
              <div>
                <label className="block text-[#F97215] text-[10px] mb-1.5 font-bold uppercase tracking-widest">
                  Nom de la zone <span className="text-red-400">*</span>
                </label>
                <input
                  value={zoneName}
                  onChange={e => { setZoneName(e.target.value); if (e.target.value.trim()) setZoneNameError(false); }}
                  className={`w-full bg-white border text-slate-800 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400 placeholder:font-normal shadow-sm ${zoneNameError
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-500/10'
                    : 'border-slate-200 focus:border-site-orange focus:ring-site-orange/10 hover:border-slate-300'
                    }`}
                  placeholder="Ex: Zone d'Équipement - Secteur C"
                />
                {zoneNameError && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span> Le nom de la zone est obligatoire</p>
                )}
              </div>

              {/* Zone Type */}
              <div>
                <label className="block text-[#F97215] text-[10px] mb-2 font-bold uppercase tracking-widest">Type de zone</label>
                <div className="grid grid-cols-2 gap-3">
                  {ZONE_TYPES.map(zt => (
                    <button
                      key={zt.value}
                      onClick={() => {
                        setZoneType(zt.value);
                        const suggestions: Record<string, string> = {
                          danger: 'Casque + Gilet obligatoire',
                          work: 'Casque obligatoire',
                          storage: 'Gilet obligatoire',
                          restrict: 'Accès interdit',
                          height: 'Harnaç obligatoire',
                          road: '',
                        };
                        if (!hseRule) setHseRule(suggestions[zt.value] ?? '');
                      }}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm text-left transition-all shadow-sm ${zoneType === zt.value
                        ? 'border-site-orange bg-orange-50/30 text-slate-900 font-semibold ring-1 ring-site-orange/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 font-medium'
                        }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: zt.color }}></span>
                      <span className="text-[13px]">{zt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* HSE Rule Custom Dropdown */}
              <div className="relative">
                <label className="block text-[#F97215] text-[10px] mb-1.5 font-bold uppercase tracking-widest">Règle HSE associée</label>

                <button
                  type="button"
                  onClick={() => { setHseDropdownOpen(!hseDropdownOpen); setCamDropdownOpen(false); }}
                  className={`w-full bg-white shadow-sm rounded-xl px-4 py-3.5 text-sm flex items-center justify-between transition-all ${hseDropdownOpen ? 'border-site-orange outline-none ring-4 ring-site-orange/10 border' : 'border-slate-200 border hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {hseRule ? (
                      <>
                        {(() => {
                          const rule = HSE_RULES.find(r => r.value === hseRule);
                          const Icon = rule?.icon || Shield;
                          return <Icon size={18} className={rule?.value ? "text-site-orange" : "text-slate-400"} />;
                        })()}
                        <span className="font-semibold text-slate-800">{HSE_RULES.find(r => r.value === hseRule)?.label}</span>
                      </>
                    ) : (
                      <span className="text-slate-400 font-medium">Aucune règle spécifique</span>
                    )}
                  </div>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform ${hseDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {hseDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setHseDropdownOpen(false)}></div>
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden py-1.5 ring-1 ring-slate-900/5 max-h-48 overflow-y-auto custom-scrollbar">
                      {HSE_RULES.map(r => {
                        const Icon = r.icon || Shield;
                        const isSelected = hseRule === r.value;
                        return (
                          <button
                            key={r.value}
                            type="button"
                            onClick={() => { setHseRule(r.value); setHseDropdownOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${isSelected ? 'bg-orange-50/50 text-site-orange font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                              }`}
                          >
                            <Icon size={18} className={isSelected ? "text-site-orange" : r.value ? "text-slate-400" : "text-slate-300"} />
                            {r.label}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Linked Camera Custom Dropdown (with maintenance warning) */}
              <div className="relative">
                <label className="block text-[#F97215] text-[10px] mb-1.5 font-bold uppercase tracking-widest">Lier une caméra à cette zone (optionnel)</label>

                <button
                  type="button"
                  onClick={() => { setCamDropdownOpen(!camDropdownOpen); setHseDropdownOpen(false); }}
                  className={`w-full bg-white shadow-sm rounded-xl px-4 py-3.5 text-sm flex items-center justify-between transition-all ${camDropdownOpen ? 'border-site-orange outline-none ring-4 ring-site-orange/10 border' : 'border-slate-200 border hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    {linkedCamera ? (
                      <>
                        {(() => {
                          const cam = mockCameras.find(c => c.id === parseInt(linkedCamera));
                          const isMaint = cam?.status === 'maintenance';
                          return (
                            <>
                              <Video size={18} className={isMaint ? "text-amber-500" : "text-slate-700"} />
                              <span className={`truncate font-semibold ${isMaint ? 'text-amber-600' : 'text-slate-800'}`}>
                                {cam?.name} — {cam?.location} {isMaint ? '(EN MAINTENANCE)' : ''}
                              </span>
                            </>
                          );
                        })()}
                      </>
                    ) : (
                      <span className="text-slate-400 font-medium">Aucune caméra liée</span>
                    )}
                  </div>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform ${camDropdownOpen ? 'rotate-180 shrink-0' : 'shrink-0'}`} />
                </button>

                {camDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setCamDropdownOpen(false)}></div>
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden py-1.5 max-h-48 overflow-y-auto ring-1 ring-slate-900/5">
                      <button
                        type="button"
                        onClick={() => { setLinkedCamera(''); setCamDropdownOpen(false); }}
                        className={`w-full text-left flex items-center gap-3 px-4 py-3 text-sm transition-colors ${!linkedCamera ? 'bg-slate-50 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                          }`}
                      >
                        <Video size={18} className={!linkedCamera ? "text-slate-800" : "text-slate-300"} />
                        Aucune caméra liée
                      </button>
                      {mockCameras.map(c => {
                        const isMaint = c.status === 'maintenance';
                        const isSelected = linkedCamera === String(c.id);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => { setLinkedCamera(String(c.id)); setCamDropdownOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left border-t border-slate-50 ${isSelected ? 'bg-orange-50/50 text-site-orange font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                              }`}
                          >
                            <Video size={18} className={`shrink-0 ${isMaint ? "text-amber-500" : isSelected ? "text-site-orange" : "text-slate-400"}`} />
                            <div className="min-w-0">
                              <div className={`truncate ${isMaint ? 'text-amber-600 font-semibold' : ''}`}>
                                {c.name} — {c.location}
                              </div>
                              {isMaint && <div className="text-[10.5px] text-amber-500/90 font-bold mt-0.5 uppercase tracking-wide">En maintenance</div>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {linkedCamera && mockCameras.find(c => c.id === parseInt(linkedCamera))?.status === 'maintenance' && (
                  <p className="text-amber-500 font-medium text-xs mt-2 flex items-center gap-1.5">⚠ Cette caméra est en maintenance — couverture partielle</p>
                )}
              </div>

              <div className="flex gap-4 pt-5 mt-3 border-t border-slate-100">
                <button
                  onClick={closeModal}
                  className="flex-[0.8] bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm py-3.5 rounded-xl font-bold text-sm transition-all border border-slate-200"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmZone}
                  className="flex-1 bg-[#F97215] hover:bg-[#E86B11] text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-[0_4px_14px_rgba(249,114,21,0.25)] hover:shadow-[0_4px_20px_rgba(249,114,21,0.4)]"
                >
                  {editingShapeId ? 'Enregistrer les modifications' : 'Confirmer la zone'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls Sidebar */}
      <div className="w-80 bg-[#1C2434] border-r border-[#24303F] p-4 space-y-4 overflow-y-auto shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl text-white mb-1">Outils Cartographiques</h2>
            <p className="text-slate-400 text-sm">Dessiner et gérer le site</p>
          </div>
          {isDirty && (
            <span className="flex items-center gap-1 text-amber-400 text-xs font-medium bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/30 mt-1 shrink-0">
              <AlertCircle size={12} /> Non enregistré
            </span>
          )}
        </div>

        {/* Drawing Tools */}
        <div className="bg-[#24303F] border border-[#2A3648] rounded-xl p-4">
          <h3 className="text-white text-sm mb-4 flex items-center gap-2 font-medium">
            <Pencil size={18} strokeWidth={2.5} />
            Outils de Dessin
          </h3>
          <div className="space-y-2.5">
            {[
              { mode: 'polygon' as DrawMode, label: 'Zone (Polygone)', hint: 'Tracer → Qualifier + Règle HSE' },
              { mode: 'line' as DrawMode, label: 'Ligne / Périmètre', hint: null },
              { mode: 'point' as DrawMode, label: 'Point d\'intérêt', hint: null },
              { mode: 'camera' as DrawMode, label: 'Ajouter Caméra', hint: null },
            ].map(({ mode, label, hint }) => (
              <div key={mode}>
                <button
                  onClick={() => handleDrawMode(mode)}
                  className={`w-full p-3 rounded-lg border transition-colors flex items-center justify-between text-[15px] ${drawMode === mode
                    ? 'bg-site-orange border-site-orange text-white'
                    : 'bg-slate-700/80 border-transparent text-slate-300 hover:text-white hover:bg-slate-600'
                    }`}
                >
                  <span>{label}</span>
                  {drawMode === mode && <X size={16} />}
                </button>
                {hint && (
                  <p className="text-slate-500 text-[10px] mt-1 ml-1">→ {hint}</p>
                )}
              </div>
            ))}
          </div>
          {/* Undo & Clear row */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleUndo}
              disabled={shapes.length === 0}
              title="Annuler le dernier tracé (Ctrl+Z)"
              className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium py-2.5 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Undo2 size={16} /> Annuler
            </button>
            <button
              onClick={clearAll}
              className="flex-1 bg-[#E00000] hover:bg-red-700 text-white font-medium py-2.5 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={16} /> Effacer tout
            </button>
          </div>
        </div>

        {/* Drawn Layers List */}
        {(cameras.length > 0 || shapes.length > 0) && (
          <div className="bg-[#24303F] border border-[#2A3648] rounded-xl p-4 flex flex-col min-h-[180px] max-h-[260px]">
            <h3 className="text-white text-sm mb-3 flex items-center justify-between font-medium shrink-0">
              <span className="flex items-center gap-2"><Layers size={18} strokeWidth={2.5} /> Couches et Éléments</span>
              <span className="text-slate-500 text-xs font-normal">{shapes.length + cameras.length} élément{(shapes.length + cameras.length) > 1 ? 's' : ''}</span>
            </h3>
            <div className="space-y-1.5 overflow-y-auto pr-1 flex-1">
              {shapes.map((shape) => {
                const zt = ZONE_TYPES.find(z => z.value === shape.zoneType);
                return (
                  <div
                    key={shape.id}
                    onClick={() => zoomToShape(shape)}
                    onDoubleClick={(e) => { e.stopPropagation(); openEditModal(shape); }}
                    className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 flex items-center justify-between group cursor-pointer hover:bg-slate-700/80 hover:border-slate-500/60 transition-colors"
                    title="Clic : centrer la carte | Double-clic : modifier la zone"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: zt?.color ?? '#E84E1B' }}></span>
                      <div className="min-w-0">
                        <div className="text-slate-200 text-xs font-semibold truncate">{shape.name}</div>
                        {zt && <div className="text-slate-500 text-[10px]">{zt.label}{shape.linkedCameraId ? ` • 📷 CAM-0${shape.linkedCameraId}` : ''}</div>}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveShape(shape.id); }}
                      className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
              {cameras.map((camera) => (
                <div key={camera.id} className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <Video size={13} className="text-blue-400 shrink-0" />
                    <div className="text-slate-200 text-xs font-semibold truncate max-w-[140px]">{camera.name}</div>
                  </div>
                  <button onClick={() => handleRemoveCamera(camera.id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            {/* Color legend */}
            <div className="mt-3 pt-3 border-t border-slate-700/60 shrink-0">
              <p className="text-slate-600 text-[9px] uppercase tracking-wide mb-1.5 font-medium">Légende</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                {ZONE_TYPES.map(zt => (
                  <div key={zt.value} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: zt.color }}></span>
                    <span className="text-slate-500 text-[10px] truncate">{zt.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Save + Center row */}
        <div className="space-y-2">
          <button
            onClick={centerOnSite}
            className="w-full bg-slate-700/80 hover:bg-slate-600 text-slate-200 font-medium py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 border border-slate-600/50"
          >
            <LocateFixed size={16} /> Centrer sur le chantier
          </button>
          <button
            onClick={handleSave}
            className={`w-full font-medium py-3 px-4 rounded-lg text-[15px] transition-colors flex items-center justify-center gap-2 border ${isSaving
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white border-transparent'
              }`}
          >
            {isSaving ? <Check size={18} /> : <Save size={18} />}
            {isSaving ? 'Enregistré ✓' : 'Enregistrer la carte'}
          </button>
        </div>

        {/* Status */}
        {drawMode && (
          <div className="bg-blue-900 border border-blue-700 rounded-lg p-3">
            <div className="text-blue-200 text-sm font-medium mb-2">
              {drawMode === 'polygon' && "📐 Mode Polygone"}
              {drawMode === 'line' && "📏 Mode Ligne"}
              {drawMode === 'point' && "📍 Mode Point"}
              {drawMode === 'camera' && "📷 Mode Caméra"}
            </div>
            <div className="text-blue-100 text-xs">
              {drawMode === 'polygon' && (
                <>
                  • Cliquer pour ajouter des points
                  <br />• Double-clic ou clic droit pour terminer
                </>
              )}
              {drawMode === 'line' && (
                <>
                  • Cliquer pour ajouter des points
                  <br />• Double-clic ou clic droit pour terminer
                </>
              )}
              {drawMode === 'point' && "• Cliquer pour ajouter un point"}
              {drawMode === 'camera' && "• Cliquer pour placer une caméra"}
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div className={`flex-1 relative ${drawMode ? 'cursor-crosshair' : ''}`}>
        {/* Map Type Switcher */}
        <div className="absolute top-4 right-4 z-[1000] bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 flex gap-1">
          <button
            onClick={() => setMapStyle('osm')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${mapStyle === 'osm' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Plan OSM
          </button>
          <button
            onClick={() => setMapStyle('satellite')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${mapStyle === 'satellite' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Satellite
          </button>
        </div>

        <MapContainer
          center={[33.5731, -7.5898]}
          zoom={13}
          className="h-full w-full"
          attributionControl={false}
          style={{ background: "#0f172a" }}
          ref={(m) => {
            if (m) mapRef.current = m;
          }}
        >
          <TileLayer
            key={mapStyle}
            url={mapStyle === 'osm'
              ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"}
            attribution={mapStyle === 'osm'
              ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              : 'Tiles &copy; Esri &mdash; Source: Esri'}
          />

          <FeatureGroup ref={featureGroupRef} />
          <MapClickHandler drawMode={drawMode} onCameraAdd={handleAddCamera} />

          {/* React Shapes with dynamic zone colors */}
          {shapes.map(shape => {
            const col = shape.color ?? '#E84E1B';
            if (shape.type === 'polygon') return (
              <Polygon key={shape.id} positions={shape.points} pathOptions={{ color: col, fillColor: col, fillOpacity: 0.18, weight: 2 }}>
                <Tooltip sticky className="!bg-[#1a2235] !text-white !text-xs !rounded-lg !border-0 !shadow-xl">
                  <div className="font-bold">{shape.name}</div>
                  {shape.zoneType && <div className="text-slate-300 text-[10px]">{ZONE_TYPES.find(z => z.value === shape.zoneType)?.label}</div>}
                  {shape.hseRule && <div className="text-amber-300 text-[10px] mt-0.5">⚠ {shape.hseRule}</div>}
                  {shape.linkedCameraId && <div className="text-blue-300 text-[10px]">📷 {mockCameras.find(c => c.id === shape.linkedCameraId)?.name}</div>}
                </Tooltip>
              </Polygon>
            );
            if (shape.type === 'line') return <Polyline key={shape.id} positions={shape.points} pathOptions={{ color: col, weight: 3 }} />;
            if (shape.type === 'point') return <CircleMarker key={shape.id} center={shape.points[0]} radius={6} pathOptions={{ color: col, fillColor: col, fillOpacity: 0.8 }} />;
            return null;
          })}

          {/* System Cameras (from mockData) — draggable to reposition */}
          {mockCameras.map((cam) => (
            <Marker
              key={`sys-${cam.id}`}
              position={cameraPositions[cam.id] ?? cam.coords}
              icon={buildCameraIcon(draggingCamId === cam.id ? 'maintenance' : cam.status)}
              draggable={true}
              eventHandlers={{
                dragstart: () => setDraggingCamId(cam.id),
                dragend: (e) => {
                  const { lat, lng } = (e.target as L.Marker).getLatLng();
                  setCameraPositions(prev => ({ ...prev, [cam.id]: [lat, lng] }));
                  setDraggingCamId(null);
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -20]} opacity={1}
                className="!bg-[#1a2235] !border-blue-500 !text-white !text-xs !rounded-lg !shadow-xl !px-3 !py-2">
                <div className="font-bold">{cam.name}</div>
                <div className="text-slate-300 text-[11px]">{cam.location}</div>
                <div className={`mt-1 text-[10px] font-semibold ${cam.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {cam.status === 'active' ? '● ACTIF' : '⚙ MAINTENANCE'}
                </div>
                <div className="text-slate-400 text-[10px] mt-0.5 italic">Glisser pour repositionner</div>
              </Tooltip>
            </Marker>
          ))}

          {/* Manually placed cameras (user added) */}
          {cameras.map((camera) => (
            <Marker key={camera.id} position={camera.position} icon={buildCameraIcon('active')} />
          ))}
        </MapContainer>

        {drawMode === "camera" && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-[1000] flex items-center gap-2">
            <Video size={18} />
            Cliquer sur la carte pour placer la caméra
          </div>
        )}
      </div>
    </div>
  );
}
