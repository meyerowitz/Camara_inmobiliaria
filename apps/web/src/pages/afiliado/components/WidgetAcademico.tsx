import React from 'react';
import { GraduationCap, ArrowRight, ChevronRight } from 'lucide-react';
import DashboardCard from './DashboardCard';

interface Course {
  title: string;
  level: string;
  price: string;
  img: string;
  tag?: string;
}

const DEFAULT_COURSES: Course[] = [
  {
    title: 'PREANI 2026',
    level: 'Diplomado UCAB',
    price: '$120.00',
    img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=400',
    tag: 'Destacado',
  },
  {
    title: 'Diplomado en Valuación',
    level: 'Especialización',
    price: '$250.00',
    img: 'https://images.unsplash.com/photo-1454165833767-027eeef1596e?auto=format&fit=crop&q=80&w=400',
    tag: 'Nuevo',
  },
  {
    title: 'Marketing Inmobiliario',
    level: 'Webinar',
    price: 'Gratis',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400',
  },
  {
    title: 'Ética y Leyes',
    level: 'Taller',
    price: '$45.00',
    img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=400',
  },
];

interface WidgetAcademicoProps {
  courses?: Course[];
  onViewAll?: () => void;
}

const WidgetAcademico = ({ courses = DEFAULT_COURSES, onViewAll }: WidgetAcademicoProps) => (
  <DashboardCard
    title="Catálogo Académico Destacado"
    icon={GraduationCap}
    actionText="Ver todo el catálogo"
    actionIcon={ArrowRight}
    onAction={onViewAll}
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 py-2">
      {courses.map((course, i) => (
        <div key={i} className="group cursor-pointer">
          <div className="relative h-44 rounded-2xl overflow-hidden shadow-sm border border-emerald-100/50">
            <img
              src={course.img}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#022c22]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {/* Badge */}
            {course.tag && (
              <div
                className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg ${
                  course.tag === 'Destacado' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              >
                {course.tag}
              </div>
            )}
            {/* Price */}
            <div className="absolute bottom-3 right-3 text-white font-black text-sm drop-shadow-md">
              {course.price}
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mb-1 block">
              {course.level}
            </span>
            <h4 className="font-extrabold text-[#022c22] text-sm group-hover:text-emerald-600 transition-colors leading-tight">
              {course.title}
            </h4>
            <div className="mt-3 flex items-center text-[10px] font-black text-emerald-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
              Formalizar Inscripción <ChevronRight size={12} className="ml-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </DashboardCard>
);

export default WidgetAcademico;
