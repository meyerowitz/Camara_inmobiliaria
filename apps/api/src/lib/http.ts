import axios, { type AxiosResponse, type AxiosError } from 'axios'

/**
 * Instancia de Axios preconfigurada para consumir servicios externos.
 * Añade interceptores de request/response según sea necesario.
 */
export const httpClient = axios.create({
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor de respuesta: manejo centralizado de errores HTTP
httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Aquí puedes transformar errores de Axios a errores de dominio
    return Promise.reject(error)
  }
)

