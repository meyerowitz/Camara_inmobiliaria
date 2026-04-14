import React, { useState, useEffect } from 'react';
import { GraduationCap, ArrowRight, ChevronRight } from 'lucide-react';
import DashboardCard from '@/pages/afiliado/components/DashboardCard';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/config/env';
import Swal from 'sweetalert2';

interface CursoDB {
  id_curso: number;
  nombre: string;
  nivel_academico: string | null;
  precio: string | null;
  imagen_url: string | null;
  estatus: string;
}

interface WidgetAcademicoProps {
  onViewAll?: () => void;
  limit?: number; // Add a limit prop for the maximum number of courses to display.
}

const WidgetAcademico = ({ onViewAll, limit = 4 }: WidgetAcademicoProps) => { // default to 4 for widget usage
  const [courses, setCourses] = useState<CursoDB[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Para obtener info básica y prellenar modal

  useEffect(() => {
    fetch(`${API_URL}/api/public/cursos`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          // Tomar máximo 'limit' para el widget o todos si limit es 0/-1
          setCourses(limit > 0 ? json.data.slice(0, limit) : json.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [limit]);

  const handleInscribir = (curso: CursoDB) => {
    Swal.fire({
      title: `Preinscripción a: ${curso.nombre}`,
      text: 'Se enviará una solicitud de inscripción. Por favor confirma tus datos de contacto básicos (usaremos los de tu cuenta si existen).',
      icon: 'info',
      html: `
        <div class="text-left mt-3">
          <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Nombre Completo</label>
          <input id="swal-nombre" class="w-full border rounded p-2 mb-3" value="${user?.email ? user.email.split('@')[0] : ''}">
          <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Correo Electrónico</label>
          <input id="swal-email" type="email" class="w-full border rounded p-2" value="${user?.email || ''}">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Formalizar Inscripción',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#00D084',
      preConfirm: () => {
        const nombre = (document.getElementById('swal-nombre') as HTMLInputElement).value;
        const email = (document.getElementById('swal-email') as HTMLInputElement).value;
        if (!nombre || !email) {
          Swal.showValidationMessage('Nombre y correo son requeridos');
          return false;
        }
        return { nombre, email };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Enviar POST a API
        fetch(`${API_URL}/api/public/cursos/${curso.id_curso}/preinscribir`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombreCompleto: result.value.nombre,
            email: result.value.email
          })
        })
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            Swal.fire('¡Solicitud enviada!', json.message || 'Te contactaremos pronto.', 'success');
          } else {
            Swal.fire('Atención', json.message || 'Hubo un error al procesar tu solicitud.', 'warning');
          }
        })
        .catch(() => {
          Swal.fire('Error', 'Hubo un fallo de conexión al enviar la solicitud.', 'error');
        });
      }
    });
  };

  return (
    <DashboardCard
      title="Catálogo Académico Destacado"
      icon={GraduationCap}
      actionText="Ver todo el catálogo"
      actionIcon={ArrowRight}
      onAction={onViewAll}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 py-2 min-h-[12rem]">
        {loading ? (
          <div className="col-span-full flex items-center justify-center p-10"><span className="text-sm font-semibold text-slate-400">Cargando cursos...</span></div>
        ) : courses.length === 0 ? (
          <div className="col-span-full flex items-center justify-center p-10"><span className="text-sm font-semibold text-slate-400">Pronto se anunciarán nuevos cursos.</span></div>
        ) : (
          courses.map((course) => (
            <div key={course.id_curso} className="group cursor-pointer" onClick={() => handleInscribir(course)}>
              <div
                className="relative h-44 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center"
                style={{ border: '1px solid var(--color-border-accent)' }}
              >
                {course.imagen_url ? (
                  <img
                    src={course.imagen_url}
                    alt={course.nombre}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <GraduationCap className="text-gray-300 w-16 h-16 group-hover:scale-110 transition-transform duration-500" />
                )}
                {/* Overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(to top, var(--color-primary) 0%, transparent 60%)` }}
                />
                {/* Badge */}
                {course.estatus === 'Próximamente' && (
                  <div
                    className="absolute top-3 left-3 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg bg-blue-500"
                  >
                    Próximamente
                  </div>
                )}
                {/* Price */}
                <div className="absolute bottom-3 right-3 text-white font-black text-sm drop-shadow-md bg-black/40 px-2 py-0.5 rounded">
                  {course.precio || 'Gratis'}
                </div>
              </div>

              <div className="mt-3">
                <span
                  className="text-[9px] font-bold uppercase tracking-widest mb-1 block"
                  style={{ color: 'var(--color-accent-hover)' }}
                >
                  {course.nivel_academico || 'Libre'}
                </span>
                <h4
                  className="font-extrabold text-sm leading-tight transition-colors"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {course.nombre}
                </h4>
                <div
                  className="mt-3 flex items-center text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
                  style={{ color: 'var(--color-accent-hover)' }}
                >
                  Formalizar Inscripción <ChevronRight size={12} className="ml-1" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardCard>
  );
};

export default WidgetAcademico;
