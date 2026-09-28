/** Responder JSON para rutas no existentes. */
export function notFoundHandler(req, res) {
  res.status(404).json({
    ok: false,
    error: { code: "NOT_FOUND", message: `No existe ${req.method} ${req.originalUrl}` },
  });
}

/** Gestión centralizada de errores. Los AppError tienen status/code propios. */
export function errorHandler(err, req, res, _next) {
  const status = err?.status ?? 500;
  const payload = {
    ok: false,
    error: {
      code: err?.code ?? "INTERNAL",
      message: err?.message ?? "Error interno del servidor.",
    },
  };

  if (status >= 500) {
    console.error(`[error] ${status} ${err?.stack ?? err}`);
  }

  if (res.headersSent) return;

  if (status >= 400 && status < 500) {
    res.status(status).json(payload);
    return;
  }

  res.status(status).json(payload);
}