import React from 'react';
import { Mail, Instagram, Linkedin, Facebook, MapPin } from 'lucide-react';

interface RedesSociales {
  instagram?: string;
  linkedin?: string;
  facebook?: string;
}

export interface AfiliadoData {
  id_agremiado: number;
  nombre_completo: string;
  codigo_cibir: string;
  cedula_rif: string;
  foto_url: string;
  redes_sociales: RedesSociales;
}

export const AfiliadoCard = ({ afiliado }: { afiliado: AfiliadoData }) => {
  return (
    <div className="bg-white dark:bg-[#04432f] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-emerald-500/20 hover:border-emerald-200 dark:hover:border-emerald-400 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
      <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
        {/* Foto */}
        <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-emerald-50 dark:bg-[#022c22] border-4 border-emerald-50 dark:border-[#022c22]">
          <img
            src={afiliado.foto_url}
            alt={`Foto de ${afiliado.nombre_completo}`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info principal */}
        <div className="flex-grow space-y-2 w-full">
          <div>
            <h3 className="font-black text-[var(--color-primary)] dark:text-emerald-50 text-lg leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
              {afiliado.nombre_completo}
            </h3>
            <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--color-accent-hover)' }}>
              CIBIR: {afiliado.codigo_cibir || 'En proceso'}
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-500 dark:text-emerald-100 uppercase tracking-widest bg-slate-100 dark:bg-[#022c22] px-3 py-1 rounded-md inline-block border border-transparent dark:border-emerald-500/10">
            C.I. / RIF: {encodeURIComponent(afiliado.cedula_rif).substring(0, 3)}***
          </div>

          <p className="text-sm font-medium text-slate-500 dark:text-emerald-200/60 flex items-center justify-center sm:justify-start gap-1">
             <MapPin size={14} /> Especialista Inmobiliario
          </p>
        </div>

        {/* Redes y Contacto */}
        <div className="flex sm:flex-col gap-2 mt-2 sm:mt-0 items-center justify-center">
           <button className="w-8 h-8 rounded-full bg-slate-50 dark:bg-[#022c22] flex items-center justify-center text-slate-400 dark:text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500 dark:hover:text-[#011a14] transition-colors border border-transparent dark:border-emerald-500/10">
              <Mail size={16} />
           </button>
           <button className="w-8 h-8 rounded-full bg-slate-50 dark:bg-[#022c22] flex items-center justify-center text-slate-400 dark:text-emerald-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-500 dark:hover:text-white transition-colors border border-transparent dark:border-emerald-500/10">
              <Instagram size={16} />
           </button>
           <button className="w-8 h-8 rounded-full bg-slate-50 dark:bg-[#022c22] flex items-center justify-center text-slate-400 dark:text-emerald-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500 dark:hover:text-white transition-colors border border-transparent dark:border-emerald-500/10">
              <Linkedin size={16} />
           </button>
        </div>
      </div>
    </div>
  );
};
