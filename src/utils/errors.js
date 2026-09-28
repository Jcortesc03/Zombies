/** Errores con estado HTTP y código para la API. */
export class AppError extends Error {
  constructor({ status = 500, code = "INTERNAL", message = "Error interno", cause }) {
    super(message, cause ? { cause } : undefined);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}