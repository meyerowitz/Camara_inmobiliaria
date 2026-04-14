/**
 * Forma estándar de todas las respuestas de la API.
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
}

/**
 * Respuesta paginada genérica.
 */
export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    total: number
    page: number
    perPage: number
    totalPages: number
  }
}
