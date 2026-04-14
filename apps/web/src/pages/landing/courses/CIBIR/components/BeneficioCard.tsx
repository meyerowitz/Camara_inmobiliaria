import React from 'react';

interface BeneficioCardProps {
  icon: React.ElementType;
  title: string;
  desc: string;
}

const BeneficioCard = ({ icon: Icon, title, desc }: BeneficioCardProps) => (
  <div
    className="p-8 rounded-[2rem] border transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl bg-white border-slate-200 hover:border-emerald-200"
  >
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors bg-emerald-50"
    >
      <Icon size={26} className="text-emerald-600" />
    </div>
    <h4
      className="text-lg font-black uppercase tracking-tight mb-2 transition-colors text-[#022c22]"
    >
      {title}
    </h4>
    <p className="text-sm leading-relaxed text-slate-500">
      {desc}
    </p>
  </div>
);

export default BeneficioCard;
