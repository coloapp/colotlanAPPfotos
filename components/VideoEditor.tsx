// Fix: Create a new VideoEditor component to handle the advanced video generation UI.
import React, { useState } from 'react';
import { Icon } from './Icon';
import Spinner from './Spinner';

interface Socials {
    tiktok: string;
    facebook: string;
    whatsapp: string;
}

interface VideoEditorProps {
    mainImage: string;
    batchImages: string[];
    logoImage: string | null;
    videoUrl: string | null;
    isVideoLoading: boolean;
    loadingMessage: string;
    onCreateVideoAd: (config: { headline: string; socials: Socials }) => void;
    onVideoDownload: () => void;
}

const VideoEditor: React.FC<VideoEditorProps> = ({
    mainImage,
    batchImages,
    logoImage,
    videoUrl,
    isVideoLoading,
    loadingMessage,
    onCreateVideoAd,
    onVideoDownload
}) => {
    const [headline, setHeadline] = useState('');
    const [socials, setSocials] = useState<Socials>({ tiktok: '', facebook: '', whatsapp: '' });
    
    const canGenerate = batchImages.length > 0 && logoImage;

    const handleGenerateClick = () => {
        if (canGenerate) {
            onCreateVideoAd({ headline, socials });
        }
    };
    
    const handleSocialChange = (platform: keyof Socials, value: string) => {
        setSocials(prev => ({ ...prev, [platform]: value }));
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex flex-col items-center mb-6">
                <h3 className="text-xl font-bold mb-2">Director de Comerciales con IA</h3>
                <p className="text-slate-500 max-w-prose text-center">
                    Crea un video profesional estilo revista. El video usará tu diseño principal, los 4 acercamientos del lote de venta y tu logo.
                </p>
            </div>

            {isVideoLoading ? (
                <div className="flex items-center justify-center min-h-[200px]">
                    <Spinner message={loadingMessage} />
                </div>
            ) : videoUrl ? (
                 <div className="flex flex-col gap-4 items-center">
                    <video src={videoUrl} controls autoPlay loop muted className="w-full max-w-2xl rounded-lg shadow-md aspect-video bg-slate-100"></video>
                    <button onClick={onVideoDownload} className="w-full max-w-lg bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-500 transition-all flex items-center justify-center gap-2">
                        <Icon type="save" className="w-5 h-5"/>
                        <span>Descargar Video</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Preview Column */}
                    <div className="flex flex-col gap-2">
                        <h4 className="font-semibold text-slate-700 text-center mb-2">Secuencia del Video</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <img src={mainImage} title="Escena de Apertura" className="w-full aspect-square object-cover rounded-md border-2 border-sky-500" />
                            {batchImages.slice(0, 4).map((src, i) => (
                                <img key={i} src={src} title={`Escena de Detalle ${i+1}`} className="w-full aspect-square object-cover rounded-md border" />
                            ))}
                            {logoImage && (
                                <div className="w-full aspect-square rounded-md border bg-slate-100 flex items-center justify-center p-2" title="Escena de Cierre">
                                     <img src={logoImage} className="max-w-full max-h-full object-contain" />
                                </div>
                            )}
                        </div>
                        {!canGenerate && (
                            <p className="text-center text-sm text-amber-600 mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                Debes generar un "Lote de Venta" para poder crear el video.
                            </p>
                        )}
                    </div>

                    {/* Controls Column */}
                    <div className="flex flex-col gap-6">
                         <div>
                            <label htmlFor="headline" className="block text-sm font-medium text-slate-700 mb-1">Titular (Opcional)</label>
                            <input
                                type="text"
                                id="headline"
                                value={headline}
                                onChange={(e) => setHeadline(e.target.value)}
                                placeholder="Ej: Nueva Colección"
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                            />
                             <p className="text-xs text-slate-500 mt-1">Este texto aparecerá elegantemente en el video.</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-slate-700 mb-2">Redes Sociales (Opcional)</h4>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <Icon type="tiktok" className="w-6 h-6 text-slate-500"/>
                                    <input type="text" value={socials.tiktok} onChange={(e) => handleSocialChange('tiktok', e.target.value)} placeholder="@tuusuario" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm"/>
                                </div>
                                 <div className="flex items-center gap-2">
                                    <Icon type="facebook" className="w-6 h-6 text-slate-500"/>
                                    <input type="text" value={socials.facebook} onChange={(e) => handleSocialChange('facebook', e.target.value)} placeholder="/tu.pagina" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm"/>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Icon type="whatsapp" className="w-6 h-6 text-slate-500"/>
                                    <input type="text" value={socials.whatsapp} onChange={(e) => handleSocialChange('whatsapp', e.target.value)} placeholder="+1 234 567 890" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm"/>
                                </div>
                            </div>
                        </div>
                        <button onClick={handleGenerateClick} disabled={!canGenerate || isVideoLoading} className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 disabled:bg-indigo-300 disabled:cursor-not-allowed">
                            <Icon type="film" className="w-5 h-5"/>
                            <span>Generar Comercial</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoEditor;
