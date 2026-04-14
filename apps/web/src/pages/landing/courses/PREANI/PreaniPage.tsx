const PreaniPage = () => {
  return (
    <div>
      <h1>Preani</h1>
      <p>Programa de Estudios Académicos Inmobiliarios Nivel Inicial</p>
      <form>
        <input type='text' placeholder='Nombre' className='border border-gray-300 rounded-md p-2' />
        <input type='email' placeholder='Email' className='border border-gray-300 rounded-md p-2' />
        <input type='password' placeholder='Password' className='border border-gray-300 rounded-md p-2' />
        <button type='submit' className='bg-blue-500 text-white rounded-md p-2'>Registrarse</button>
      </form>
    </div>
  )
}

export default PreaniPage