import { useState, useRef } from 'react';
import { removeBackground } from '@imgly/background-removal';
import { pipeline, env } from '@xenova/transformers';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import { Rnd } from 'react-rnd';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Layers, MousePointer2, Settings2, Trash2, Eye, EyeOff, Lock, Unlock, RotateCw, Sparkles } from 'lucide-react';
import { toast } from "sonner";

// Configure Xenova to be more resilient for web environments
env.allowLocalModels = false;
env.useBrowserCache = true;

export interface DetectedObject {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
    label: string;
    score: number;
}

export type LayerType = 'background' | 'image' | 'text' | 'logo';

export interface SmartLayer {
    id: string;
    name: string;
    type: LayerType;
    src?: string;
    x: number;
    y: number;
    width: number | string;
    height: number | string;
    rotation: number;
    zIndex: number;
    visible: boolean;
    locked: boolean;
    opacity: number;
    mixBlendMode: React.CSSProperties['mixBlendMode'];
    filters: {
        brightness: number;
        contrast: number;
        blur: number;
        dropShadow?: string;
    };
}

const CANVAS_PRESETS = [
    { id: 'FHD', name: 'Full HD (1920x1080)', width: 1920, height: 1080 },
    { id: 'HD', name: 'HD / YT Thumbnail (1280x720)', width: 1280, height: 720 },
    { id: 'IG_SQ', name: 'Instagram Square (1080x1080)', width: 1080, height: 1080 },
    { id: 'IG_PT', name: 'Instagram Portrait (1080x1350)', width: 1080, height: 1350 },
    { id: 'IG_ST', name: 'Reels / Story (1080x1920)', width: 1080, height: 1920 },
    { id: 'TW_HDR', name: 'Twitter Header (1500x500)', width: 1500, height: 500 },
    { id: 'LI_HDR', name: 'LinkedIn Banner (1584x396)', width: 1584, height: 396 },
    { id: 'A4_PT', name: 'A4 Portrait (2480x3508)', width: 2480, height: 3508 },
    { id: 'A4_LS', name: 'A4 Landscape (3508x2480)', width: 3508, height: 2480 },
    { id: 'A5_PT', name: 'A5 Flyer (1748x2480)', width: 1748, height: 2480 },
];

export default function SmartEditorPage() {
    const { t } = useLanguage();
    const [layers, setLayers] = useState<SmartLayer[]>([]);
    const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);
    const [canvasSize, setCanvasSize] = useState(CANVAS_PRESETS[0]);
    const canvasRef = useRef<HTMLDivElement>(null);

    // Tools State
    const [isMagicLayerLoading, setIsMagicLayerLoading] = useState(false);
    const [isMagicGrabActive, setIsMagicGrabActive] = useState(false);
    const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
    const [isDetectingBoxes, setIsDetectingBoxes] = useState(false);

    const handleStartMagicGrab = async () => {
        if (isMagicGrabActive) {
            setIsMagicGrabActive(false);
            setDetectedObjects([]);
            return;
        }

        const bgLayer = layers.find(l => l.type === 'background') || layers.find(l => l.type === 'image');
        if (!bgLayer || !bgLayer.src) {
            toast.error('Mohon unggah gambar terlebih dahulu.');
            return;
        }

        setIsMagicGrabActive(true);
        setIsDetectingBoxes(true);

        // Yield thread so React can paint the loading state before the CPU gets heavy
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const detector = await pipeline('object-detection', 'Xenova/detr-resnet-50');
            const output = await detector(bgLayer.src, { threshold: 0.5, percentage: true }) as any;
            
            const mappedObjects = output.map((obj: any) => ({
                label: obj.label,
                score: obj.score,
                xmin: obj.box.xmin,
                ymin: obj.box.ymin,
                xmax: obj.box.xmax,
                ymax: obj.box.ymax,
            }));
            
            setDetectedObjects(mappedObjects);
            if (mappedObjects.length > 0) {
                toast.success(`${mappedObjects.length} objek terdeteksi! Klik pada kotak untuk mengambil objek.`);
            } else {
                toast.info('Tidak ada objek spesifik yang terdeteksi.');
            }
        } catch (error) {
            console.error("Detection failed:", error);
            toast.error('Gagal mendeteksi objek. Pastikan koneksi internet stabil.');
            setIsMagicGrabActive(false);
        } finally {
            setIsDetectingBoxes(false);
        }
    };

    const handleGrabDetectedObject = async (obj: DetectedObject) => {
        const bgLayer = layers.find(l => l.type === 'background') || layers.find(l => l.type === 'image');
        if (!bgLayer || !bgLayer.src) return;
        
        setIsMagicGrabActive(false);
        setDetectedObjects([]);
        setIsMagicLayerLoading(true);

        try {
            const bgImg = new Image();
            bgImg.crossOrigin = 'Anonymous';
            bgImg.src = bgLayer.src;
            await new Promise(r => { bgImg.onload = r; bgImg.onerror = r; });

            const cropCanvas = document.createElement('canvas');
            const cx = obj.xmin * bgImg.width;
            const cy = obj.ymin * bgImg.height;
            const cw = (obj.xmax - obj.xmin) * bgImg.width;
            const ch = (obj.ymax - obj.ymin) * bgImg.height;
            
            cropCanvas.width = cw;
            cropCanvas.height = ch;
            const ctx = cropCanvas.getContext('2d');
            if (!ctx) return;
            
            ctx.drawImage(bgImg, cx, cy, cw, ch, 0, 0, cw, ch);
            const cropUrl = cropCanvas.toDataURL('image/png');
            
            const response = await fetch(cropUrl);
            const blob = await response.blob();
            const resultBlob = await removeBackground(blob);
            const newUrl = URL.createObjectURL(resultBlob);

            const layerW = typeof bgLayer.width === 'number' ? bgLayer.width : bgImg.width;
            const layerH = typeof bgLayer.height === 'number' ? bgLayer.height : bgImg.height;

            const extractedLayer: SmartLayer = {
                id: `layer-${Date.now()}-ai-extract`,
                name: `Grab: ${obj.label}`,
                type: 'image',
                x: (typeof bgLayer.x === 'number' ? bgLayer.x : 0) + (obj.xmin * layerW),
                y: (typeof bgLayer.y === 'number' ? bgLayer.y : 0) + (obj.ymin * layerH),
                width: cw * (layerW / bgImg.width),
                height: 'auto',
                rotation: bgLayer.rotation || 0,
                zIndex: layers.length + 5,
                visible: true,
                locked: false,
                opacity: 100,
                mixBlendMode: 'normal',
                filters: { brightness: 100, contrast: 100, blur: 0 },
                src: newUrl
            };

            setLayers(prev => [...prev, extractedLayer]);
            setSelectedLayerIds([extractedLayer.id]);
            toast.success(`Berhasil mengambil objek: ${obj.label}`);
        } catch (e) {
            console.error(e);
            toast.error('Gagal mengambil objek tersebut.');
        } finally {
            setIsMagicLayerLoading(false);
        }
    };

    // Real Magic Layer AI Integration - Now extracts all objects individually
    const handleMagicLayer = async () => {
        const sourceLayer = layers.find(l => l.type === 'background') || layers.find(l => l.type === 'image');

        if (!sourceLayer || !sourceLayer.src) {
            toast.error('Mohon unggah gambar terlebih dahulu.');
            return;
        }

        setIsMagicLayerLoading(true);
        await new Promise(resolve => setTimeout(resolve, 150));

        try {
            // Step 1: Detect all objects
            const detector = await pipeline('object-detection', 'Xenova/detr-resnet-50');
            const detections = await detector(sourceLayer.src, { threshold: 0.5, percentage: true }) as any;

            if (detections.length === 0) {
                // If no specific objects found, fallback to general background removal
                const response = await fetch(sourceLayer.src);
                const blob = await response.blob();
                const resultBlob = await removeBackground(blob);
                const newUrl = URL.createObjectURL(resultBlob);
                
                addLayer({
                    name: 'Extracted Foreground',
                    src: newUrl,
                    x: sourceLayer.x,
                    y: sourceLayer.y,
                    width: sourceLayer.width,
                    height: sourceLayer.height,
                    zIndex: layers.length + 5,
                });
            } else {
                // Step 2: Extract each detected object
                const bgImg = new Image();
                bgImg.crossOrigin = 'Anonymous';
                bgImg.src = sourceLayer.src;
                await new Promise(r => { bgImg.onload = r; bgImg.onerror = r; });

                const newLayers: SmartLayer[] = [];
                const layerW = typeof sourceLayer.width === 'number' ? sourceLayer.width : bgImg.width;
                const layerH = typeof sourceLayer.height === 'number' ? sourceLayer.height : bgImg.height;

                for (const obj of detections) {
                    const cropCanvas = document.createElement('canvas');
                    const cx = obj.box.xmin * bgImg.width;
                    const cy = obj.box.ymin * bgImg.height;
                    const cw = (obj.box.xmax - obj.box.xmin) * bgImg.width;
                    const ch = (obj.box.ymax - obj.box.ymin) * bgImg.height;
                    
                    cropCanvas.width = cw;
                    cropCanvas.height = ch;
                    const ctx = cropCanvas.getContext('2d');
                    if (!ctx) continue;
                    
                    ctx.drawImage(bgImg, cx, cy, cw, ch, 0, 0, cw, ch);
                    const cropUrl = cropCanvas.toDataURL('image/png');
                    
                    const response = await fetch(cropUrl);
                    const blob = await response.blob();
                    const resultBlob = await removeBackground(blob);
                    const newUrl = URL.createObjectURL(resultBlob);

                    const id = `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    newLayers.push({
                        id,
                        name: `Extracted: ${obj.label}`,
                        type: 'image',
                        x: (typeof sourceLayer.x === 'number' ? sourceLayer.x : 0) + (obj.box.xmin * layerW),
                        y: (typeof sourceLayer.y === 'number' ? sourceLayer.y : 0) + (obj.box.ymin * layerH),
                        width: cw * (layerW / bgImg.width),
                        height: 'auto',
                        rotation: sourceLayer.rotation || 0,
                        zIndex: layers.length + newLayers.length + 5,
                        visible: true,
                        locked: false,
                        opacity: 100,
                        mixBlendMode: 'normal',
                        filters: { brightness: 100, contrast: 100, blur: 0 },
                        src: newUrl
                    });
                }

                setLayers(prev => [...prev, ...newLayers]);
                if (newLayers.length > 0) {
                    setSelectedLayerIds([newLayers[newLayers.length - 1].id]);
                    toast.success(`Berhasil memecah ${newLayers.length} layer baru!`);
                }
            }
        } catch (error) {
            console.error("Magic Layer failed:", error);
            toast.error('Gagal memproses Magic Layer. Pastikan koneksi internet stabil.');
        } finally {
            setIsMagicLayerLoading(false);
        }
    };

    // Helper to add a new layer
    const addLayer = (newLayer: Partial<SmartLayer>) => {
        const id = `layer-${Date.now()}`;
        const zIndex = layers.length;
        setLayers((prev) => [
            ...prev,
            {
                id,
                name: `Layer ${zIndex + 1}`,
                type: 'image',
                x: 50,
                y: 50,
                width: 300,
                height: 'auto',
                rotation: 0,
                zIndex,
                visible: true,
                locked: false,
                opacity: 100,
                mixBlendMode: 'normal',
                filters: { brightness: 100, contrast: 100, blur: 0 },
                ...newLayer
            }
        ]);
        setSelectedLayerIds([id]);
    };

    const handleExport = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;
        const canvasEl = canvasRef.current;
        if (!canvasEl) return;
        
        // This is the scale difference between the physical DOM render and the chosen logical Canvas preset
        const domRect = canvasEl.getBoundingClientRect();
        const scaleX = canvas.width / domRect.width;
        const scaleY = canvas.height / domRect.height;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);

        for (const layer of sortedLayers) {
            if (!layer.visible || !layer.src) continue;

            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = layer.src;
            await new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });

            ctx.save();
            
            // X, Y, W, H are tracked by react-rnd in DOM pixels. We multiply by Scale to get true Preset Dimensions
            const x = (typeof layer.x === 'number' ? layer.x : parseFloat(layer.x as string)) * scaleX;
            const y = (typeof layer.y === 'number' ? layer.y : parseFloat(layer.y as string)) * scaleY;
            
            const wStr = String(layer.width).replace('px', '');
            const w = (wStr === 'auto' ? img.width : parseFloat(wStr)) * scaleX;

            let h = (typeof layer.height === 'number' ? layer.height : 0) * scaleY;
            const hStr = String(layer.height).replace('px', '');
            if (hStr === 'auto') {
                h = w * (img.height / img.width);
            } else {
                h = parseFloat(hStr) * scaleY;
            }

            ctx.globalAlpha = layer.opacity / 100;
            ctx.globalCompositeOperation = (layer.mixBlendMode as GlobalCompositeOperation) || 'source-over';
            ctx.filter = `brightness(${layer.filters.brightness}%) contrast(${layer.filters.contrast}%) blur(${layer.filters.blur * scaleX}px)`;

            ctx.translate(x + w / 2, y + h / 2);
            ctx.rotate(layer.rotation * Math.PI / 180);
            ctx.drawImage(img, -w / 2, -h / 2, w, h);
            ctx.restore();
        }

        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `gambaryuk-studio-${canvasSize.id}.png`;
        a.click();
    };

    const handleUpdateLayer = (id: string, updates: Partial<SmartLayer>) => {
        setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
    };

    const handleDeleteLayer = (id: string) => {
        setLayers((prev) => prev.filter((l) => l.id !== id));
        setSelectedLayerIds((prev) => prev.filter((selectedId) => selectedId !== id));
    };

    const handleUploadBg = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const isFirst = layers.length === 0;
            addLayer({ src: url, type: isFirst ? 'background' : 'image', name: isFirst ? 'Background' : 'Gambar', x: 0, y: 0, width: 800, height: 'auto', zIndex: layers.length });
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <Helmet>
                <title>{t('feature.smartEditor.title')} | GambarYuk</title>
                <meta name="description" content={t('feature.smartEditor.desc')} />
            </Helmet>

            {/* Top Toolbar */}
            <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0 rounded-t-2xl">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Layers className="h-5 w-5 text-primary" />
                    <span>Smart AI Editor</span>
                </div>
                <div className="flex flex-1 items-center justify-center gap-2">
                    <Select value={canvasSize.id} onValueChange={(val) => setCanvasSize(CANVAS_PRESETS.find(p => p.id === val) || CANVAS_PRESETS[0])}>
                        <SelectTrigger className="w-[180px] h-8 text-xs bg-muted/50">
                            <SelectValue placeholder="Pilih Ukuran Canvas" />
                        </SelectTrigger>
                        <SelectContent>
                            {CANVAS_PRESETS.map((preset) => (
                                <SelectItem key={preset.id} value={preset.id} className="text-xs">
                                    {preset.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="w-px h-6 bg-border mx-1 hidden md:block"></div>

                    <Button variant={isMagicGrabActive ? "default" : "secondary"} size="sm" onClick={handleStartMagicGrab} disabled={isDetectingBoxes} className={isMagicGrabActive ? 'bg-indigo-600 hover:bg-indigo-700 text-white hidden md:flex' : 'hidden md:flex'}>
                        {isDetectingBoxes ? (
                            <><Layers className="h-4 w-4 mr-2 animate-spin" /> Detecting...</>
                        ) : (
                            <><MousePointer2 className="h-4 w-4 mr-2" /> Magic Grab</>
                        )}
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleMagicLayer} disabled={isMagicLayerLoading}>
                        {isMagicLayerLoading ? <Sparkles className="h-4 w-4 mr-2 animate-bounce text-primary" /> : <Layers className="h-4 w-4 mr-2" />}
                        {isMagicLayerLoading ? 'Scanning...' : 'Magic Layer'}
                    </Button>
                </div>
                <div>
                    <Button variant="default" size="sm" onClick={handleExport}>
                        Export
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden rounded-b-2xl border border-border bg-card">
                {/* Left Sidebar: Layers */}
                <div className="w-64 border-r border-border bg-muted/30 flex flex-col hidden md:flex">
                    <div className="p-4 border-b border-border font-semibold text-sm flex items-center gap-2 bg-card">
                        <Layers className="h-4 w-4" />
                        Layers
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {layers.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-8">
                                No layers yet
                            </div>
                        ) : (
                            [...layers].sort((a, b) => b.zIndex - a.zIndex).map((layer) => (
                                <div
                                    key={layer.id}
                                    className={`flex items-center justify-between p-2 rounded-lg border text-sm transition-colors cursor-pointer ${selectedLayerIds.includes(layer.id) ? 'bg-primary/10 border-primary/50 text-foreground' : 'bg-card border-border hover:bg-muted/50 text-muted-foreground'
                                        }`}
                                    onClick={() => setSelectedLayerIds([layer.id])}
                                >
                                    <div className="flex items-center gap-2 truncate flex-1">
                                        <div className="w-8 h-8 rounded bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center border border-border/50">
                                            {layer.src ? <img src={layer.src} className="w-full h-full object-cover" /> : <div className="w-2 h-2 rounded-full bg-primary/50" />}
                                        </div>
                                        <span className="truncate">{layer.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-60 hover:opacity-100 flex-shrink-0">
                                        <button onClick={(e) => { e.stopPropagation(); handleUpdateLayer(layer.id, { visible: !layer.visible }); }} className="p-1 hover:bg-muted rounded">
                                            {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleUpdateLayer(layer.id, { locked: !layer.locked }); }} className="p-1 hover:bg-muted rounded">
                                            {layer.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}

                        <Button variant="outline" className="w-full mt-4" asChild>
                            <label className="cursor-pointer">
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Gambar
                                <input type="file" accept="image/*" className="hidden" onChange={handleUploadBg} />
                            </label>
                        </Button>
                    </div>
                </div>

                {/* Center: Canvas Area */}
                <div
                    className="flex-1 bg-muted/10 relative overflow-hidden flex items-center justify-center p-8 pattern-dots opacity-100"
                    style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)', backgroundSize: '24px 24px' }}
                    onClick={() => setSelectedLayerIds([])}
                >
                    <div
                        ref={canvasRef}
                        className={`bg-white shadow-md relative overflow-hidden transition-all ${isMagicGrabActive ? 'cursor-crosshair' : ''}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            aspectRatio: `${canvasSize.width} / ${canvasSize.height}`,
                            height: canvasSize.height >= canvasSize.width ? '100%' : 'auto',
                            width: canvasSize.width > canvasSize.height ? '100%' : 'auto',
                            maxHeight: '100%',
                            maxWidth: '100%',
                            backgroundColor: '#fff',
                            backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nY4MxgKMA42DwdBggMGIj07GygAAsZ0cEjl62Z8AAAAASUVORK5CYII=")'
                        }}
                    >
                        {layers.map((layer) => layer.visible && (
                            <Rnd
                                key={layer.id}
                                size={{ width: layer.width, height: layer.height }}
                                position={{ x: layer.x, y: layer.y }}
                                onDragStop={(e, d) => handleUpdateLayer(layer.id, { x: d.x, y: d.y })}
                                onResizeStop={(e, direction, ref, delta, position) => {
                                    handleUpdateLayer(layer.id, {
                                        width: ref.style.width,
                                        height: ref.style.height,
                                        ...position,
                                    });
                                }}
                                disableDragging={layer.locked || isMagicGrabActive}
                                enableResizing={!layer.locked && !isMagicGrabActive && selectedLayerIds.includes(layer.id)}
                                className={`absolute pointer-events-auto ${selectedLayerIds.includes(layer.id) && !layer.locked ? 'ring-1 ring-primary' : ''}`}
                                resizeHandleStyles={selectedLayerIds.includes(layer.id) ? {
                                    bottomRight: { width: '12px', height: '12px', background: 'white', border: '2px solid hsl(var(--primary))', borderRadius: '50%', right: '-6px', bottom: '-6px' },
                                    topRight: { width: '12px', height: '12px', background: 'white', border: '2px solid hsl(var(--primary))', borderRadius: '50%', right: '-6px', top: '-6px' },
                                    bottomLeft: { width: '12px', height: '12px', background: 'white', border: '2px solid hsl(var(--primary))', borderRadius: '50%', left: '-6px', bottom: '-6px' },
                                    topLeft: { width: '12px', height: '12px', background: 'white', border: '2px solid hsl(var(--primary))', borderRadius: '50%', left: '-6px', top: '-6px' },
                                    top: { height: '8px', top: '-4px' },
                                    right: { width: '8px', right: '-4px' },
                                    bottom: { height: '8px', bottom: '-4px' },
                                    left: { width: '8px', left: '-4px' },
                                } : {}}
                                style={{
                                    zIndex: layer.zIndex,
                                }}
                                onClick={(e) => {
                                    if (isMagicGrabActive) return;
                                    e.stopPropagation();
                                    setSelectedLayerIds([layer.id]);
                                }}
                            >
                                <div 
                                    id={`layer-inner-${layer.id}`}
                                    className="w-full h-full relative"
                                    style={{
                                        transform: `rotate(${layer.rotation || 0}deg)`,
                                        opacity: layer.opacity / 100,
                                        mixBlendMode: layer.mixBlendMode as any,
                                        filter: `brightness(${layer.filters.brightness}%) contrast(${layer.filters.contrast}%) blur(${layer.filters.blur}px) ${layer.filters.dropShadow || ''}`
                                    }}
                                >
                                    {layer.src && (
                                        <img src={layer.src} alt={layer.name} className="w-full h-full object-cover pointer-events-none select-none" />
                                    )}

                                    {/* Canva-like Rotation Handle */}
                                    {selectedLayerIds.includes(layer.id) && !layer.locked && !isMagicGrabActive && (
                                        <div 
                                            className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-md border-2 border-primary text-primary flex items-center justify-center cursor-crosshair z-50 pointer-events-auto hover:bg-muted"
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                                const layerInner = document.getElementById(`layer-inner-${layer.id}`);
                                                if (!layerInner) return;
                                                const rect = layerInner.parentElement?.getBoundingClientRect();
                                                if (!rect) return;
                                                const centerX = rect.left + rect.width / 2;
                                                const centerY = rect.top + rect.height / 2;
                                                
                                                const onMove = (em: MouseEvent) => {
                                                    let angle = Math.atan2(em.clientY - centerY, em.clientX - centerX) * 180 / Math.PI;
                                                    handleUpdateLayer(layer.id, { rotation: angle - 90 });
                                                };
                                                const onUp = () => {
                                                    window.removeEventListener('mousemove', onMove);
                                                    window.removeEventListener('mouseup', onUp);
                                                };
                                                window.addEventListener('mousemove', onMove);
                                                window.addEventListener('mouseup', onUp);
                                            }}
                                        >
                                            <RotateCw className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>

                                {/* Magic Grab Detect Overlays */}
                                {isMagicGrabActive && layer.type === 'background' && detectedObjects.map((obj, i) => (
                                    <div 
                                        key={`det-${i}`}
                                        onClick={(e) => { e.stopPropagation(); handleGrabDetectedObject(obj); }}
                                        className="absolute border-2 border-dashed border-indigo-500 bg-indigo-500/20 opacity-0 hover:opacity-100 cursor-pointer transition-opacity z-50 flex items-center justify-center"
                                        style={{
                                            left: `${obj.xmin * 100}%`,
                                            top: `${obj.ymin * 100}%`,
                                            width: `${(obj.xmax - obj.xmin) * 100}%`,
                                            height: `${(obj.ymax - obj.ymin) * 100}%`
                                        }}
                                    >
                                        <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                            Grab ✨ {obj.label}
                                        </span>
                                    </div>
                                ))}
                            </Rnd>
                        ))}
                    </div>
                </div>

                {/* Right Sidebar: Controls */}
                <div className="w-72 border-l border-border bg-muted/30 flex flex-col hidden lg:flex">
                    <div className="p-4 border-b border-border font-semibold text-sm flex items-center gap-2 bg-card">
                        <Settings2 className="h-4 w-4" />
                        Properties
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {selectedLayerIds.length > 0 ? (
                            <>
                                {layers.filter(l => selectedLayerIds.includes(l.id)).map(activeLayer => (
                                    <div key={`controls-${activeLayer.id}`} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium">Layer Type</label>
                                                <span className="text-xs uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
                                                    {activeLayer.type}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-medium">Opacity ({activeLayer.opacity}%)</label>
                                            <input
                                                type="range" min="0" max="100"
                                                value={activeLayer.opacity}
                                                onChange={(e) => handleUpdateLayer(activeLayer.id, { opacity: parseInt(e.target.value) })}
                                                className="w-full"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-medium flex items-center gap-2">Filters</label>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span>Brightness</span>
                                                    <span className="text-muted-foreground">{activeLayer.filters.brightness}%</span>
                                                </div>
                                                <input
                                                    type="range" min="0" max="200" value={activeLayer.filters.brightness}
                                                    onChange={(e) => handleUpdateLayer(activeLayer.id, { filters: { ...activeLayer.filters, brightness: parseInt(e.target.value) } })}
                                                    className="w-full"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span>Contrast</span>
                                                    <span className="text-muted-foreground">{activeLayer.filters.contrast}%</span>
                                                </div>
                                                <input
                                                    type="range" min="0" max="200" value={activeLayer.filters.contrast}
                                                    onChange={(e) => handleUpdateLayer(activeLayer.id, { filters: { ...activeLayer.filters, contrast: parseInt(e.target.value) } })}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-border">
                                            <Button variant="destructive" size="sm" className="w-full" onClick={() => handleDeleteLayer(activeLayer.id)}>
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Layer
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="text-sm text-muted-foreground text-center py-8">
                                Select a layer to edit properties
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
