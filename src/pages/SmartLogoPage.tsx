import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import { Rnd } from 'react-rnd';
import { Button } from '@/components/ui/button';
import { Sparkles, Image as ImageIcon, Download, Moon, Sun, AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react';

interface LogoLayer {
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
    filter: string;
    dropShadow?: string;
}

export default function SmartLogoPage() {
    const { t } = useLanguage();
    const [bgImage, setBgImage] = useState<string | null>(null);
    const [logo, setLogo] = useState<LogoLayer | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    const handleUploadBg = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setBgImage(URL.createObjectURL(file));
    };

    const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setLogo({ src: URL.createObjectURL(file), x: 50, y: 50, width: 150, height: 150, filter: 'none' });
    };

    const handleAutoContrast = async () => {
        if (!bgImage || !logo || !canvasRef.current) return;
        try {
            const bgImg = new Image();
            bgImg.src = bgImage;
            await new Promise(r => { bgImg.onload = r; bgImg.onerror = r; });

            const domRect = canvasRef.current.getBoundingClientRect();
            const scaleX = bgImg.width / domRect.width;
            const scaleY = bgImg.height / domRect.height;
            
            const sx = logo.x * scaleX;
            const sy = logo.y * scaleY;
            const sw = logo.width * scaleX;
            
            const logoImg = new Image();
            logoImg.src = logo.src;
            await new Promise(r => { logoImg.onload = r; logoImg.onerror = r; });
            const sh = (logoImg.height / logoImg.width) * sw;

            const canvas = document.createElement('canvas');
            canvas.width = sw;
            canvas.height = sh;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            // Draw only the exact region of the background that sits underneath the logo
            ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, sw, sh);
            
            const data = ctx.getImageData(0, 0, sw, sh).data;
            let r = 0, g = 0, b = 0;
            for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i + 1]; b += data[i + 2]; }
            const pixels = data.length / 4;
            const luminance = (0.299 * (r / pixels) + 0.587 * (g / pixels) + 0.114 * (b / pixels));
            
            if (luminance < 128) {
                setLogo(prev => prev ? { ...prev, filter: 'brightness(0) invert(1)', dropShadow: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' } : null);
            } else {
                setLogo(prev => prev ? { ...prev, filter: 'brightness(0)', dropShadow: 'none' } : null);
            }
        } catch (e) { }
    };

    const handleExport = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx || !bgImage) return;

        const bgUrl = bgImage;
        const bgImg = new Image();
        bgImg.src = bgUrl;
        await new Promise(r => { bgImg.onload = r; bgImg.onerror = r; });

        canvas.width = bgImg.width;
        canvas.height = bgImg.height;
        ctx.drawImage(bgImg, 0, 0);

        if (logo && canvasRef.current) {
            const logoImg = new Image();
            logoImg.src = logo.src;
            await new Promise(r => { logoImg.onload = r; logoImg.onerror = r; });

            const domRect = canvasRef.current.getBoundingClientRect();
            const scaleX = canvas.width / domRect.width;
            const scaleY = canvas.height / domRect.height;

            ctx.filter = logo.filter;
            const renderedWidth = logo.width * scaleX;
            const renderedHeight = (logoImg.height / logoImg.width) * renderedWidth;

            ctx.drawImage(logoImg, logo.x * scaleX, logo.y * scaleY, renderedWidth, renderedHeight);
        }

        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png', 1.0);
        a.download = 'smart-logo.png';
        a.click();
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 p-4 max-w-7xl mx-auto min-h-[calc(100vh-8rem)]">
            <Helmet>
                <title>{t('feature.smartLogo.title') || 'Smart Logo'} | GambarYuk</title>
                <meta name="description" content={t('feature.smartLogo.desc') || 'Smart Logo Placer'} />
            </Helmet>

            {/* Params Sidebar */}
            <div className="w-full md:w-80 space-y-6">
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Smart Logo Placer
                    </h2>

                    <div className="space-y-3">
                        <Button variant="outline" className="w-full" asChild>
                            <label className="cursor-pointer">
                                <ImageIcon className="h-4 w-4 mr-2" />
                                1. Upload Gambar Background
                                <input type="file" accept="image/*" className="hidden" onChange={handleUploadBg} />
                            </label>
                        </Button>
                        <Button variant="outline" className="w-full bg-primary/5 border-primary/20" asChild disabled={!bgImage}>
                            <label className={`cursor-pointer ${!bgImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <Sparkles className="h-4 w-4 mr-2 text-primary" />
                                2. Upload Logo (PNG)
                                <input type="file" accept="image/*" className="hidden" onChange={handleUploadLogo} disabled={!bgImage} />
                            </label>
                        </Button>
                    </div>

                    {logo && (
                        <div className="pt-4 border-t border-border space-y-4">
                            <h3 className="text-sm font-semibold">Adaptasi AI Warna Logo</h3>
                            <Button variant="default" className="w-full text-xs shadow-sm bg-primary/90 hover:bg-primary" onClick={handleAutoContrast}>
                                Auto Contrast
                            </Button>
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="secondary" size="sm" onClick={() => setLogo(p => p ? { ...p, filter: 'brightness(0)' } : null)}>
                                    <Moon className="w-3 h-3 mr-1" /> To Black
                                </Button>
                                <Button variant="secondary" size="sm" onClick={() => setLogo(p => p ? { ...p, filter: 'brightness(0) invert(1)' } : null)}>
                                    <Sun className="w-3 h-3 mr-1" /> To White
                                </Button>
                            </div>
                            <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setLogo(p => p ? { ...p, filter: 'none', dropShadow: 'none' } : null)}>
                                Original Color
                            </Button>

                            <div className="pt-2">
                                <h3 className="text-xs font-semibold mb-2">Posisi Cepat</h3>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setLogo(p => p ? { ...p, x: 20, y: 20 } : null)}><AlignLeft className="w-4 h-4" /></Button>
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setLogo(p => p ? { ...p, x: 300, y: 20 } : null)}><AlignCenter className="w-4 h-4" /></Button>
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setLogo(p => p ? { ...p, x: 500, y: 20 } : null)}><AlignRight className="w-4 h-4" /></Button>
                                </div>
                            </div>

                            <Button variant="destructive" size="sm" className="w-full mt-2" onClick={() => setLogo(null)}>
                                <Trash2 className="w-4 h-4 mr-2" /> Hapus Logo
                            </Button>
                        </div>
                    )}
                </div>

                {bgImage && (
                    <Button variant="default" className="w-full h-12" onClick={handleExport}>
                        <Download className="w-5 h-5 mr-2" />
                        Export Gambar
                    </Button>
                )}
            </div>

            {/* Canvas */}
            <div className="flex-1 bg-muted/10 border border-border rounded-xl  overflow-hidden flex items-center justify-center p-4 relative" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)', backgroundSize: '24px 24px' }}>
                {!bgImage ? (
                    <div className="text-center text-muted-foreground flex flex-col items-center">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Upload gambar background untuk mulai</p>
                    </div>
                ) : (
                    <div ref={canvasRef} className="relative shadow-md bg-white w-full max-w-3xl aspect-video overflow-hidden border border-border">
                        <img src={bgImage} alt="Background" className="w-full h-full object-cover pointer-events-none" />
                        {logo && (
                            <Rnd
                                size={{ width: logo.width, height: 'auto' }}
                                position={{ x: logo.x, y: logo.y }}
                                onDragStop={(e, d) => setLogo(p => p ? { ...p, x: d.x, y: d.y } : null)}
                                onResizeStop={(e, direction, ref, delta, position) => {
                                    setLogo(p => p ? { ...p, width: parseInt(ref.style.width), ...position } : null);
                                }}
                                bounds="parent"
                                className="absolute cursor-move group ring-1 ring-transparent hover:ring-primary/50 transition-all"
                            >
                                <img
                                    src={logo.src}
                                    className="w-full h-auto pointer-events-none select-none"
                                    style={{
                                        filter: `${logo.filter} ${logo.dropShadow || ''}`
                                    }}
                                />
                            </Rnd>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
