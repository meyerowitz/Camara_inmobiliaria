export default function LoginModal({ onClose }){
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Fondo oscuro/desenfocado al hacer click fuera cierra el modal */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      ></div>

      {/* Contenedor del Modal */}
      <div className="relative bg-white w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl text-center">
        {/* Botón Cerrar (X) */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-emerald-600 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-gray-600 text-lg mb-10 leading-snug">
          Ingresa tus datos aqui.
        </h2>

        <form className="space-y-6">
          {/* Input Correo */}
          <div className="text-left">
            <div className="relative">
              <input 
                type="email" 
                placeholder="Correo:" 
                className="w-full px-6 py-4 border border-gray-400 rounded-full text-gray-700 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Input Contraseña */}
          <div className="text-left">
            <div className="relative">
              <input 
                type="password" 
                placeholder="Contraseña:" 
                className="w-full px-6 py-4 border border-gray-400 rounded-full text-gray-700 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Link Olvidé mi contraseña */}
          <div className="pt-2">
            <a href="#" className="text-blue-700 hover:underline text-sm font-medium">
              Olvide mi contraseña
            </a>
          </div>

          {/* Botón Iniciar Sesión */}
          <div className="pt-6">
            <button className="px-10 py-3 border-2 border-emerald-400 text-emerald-500 rounded-full font-bold hover:bg-emerald-500 hover:text-white transition-all">
              Inicia Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};