(() => {
  "use strict";

  const MAX_LEN = 500;
  const LIMIT_MARK = 0.8 * MAX_LEN;

  const form = document.querySelector("#form-consulta");
  const textarea = document.querySelector("#pregunta");
  const counter = document.querySelector("#contador");
  const submitBtn = document.querySelector("#btn-consultar");
  const panel = document.querySelector("#panel-respuesta");
  const statusBadge = document.querySelector("#estado");
  const chips = document.querySelectorAll("[data-sugerencia]");
  const states = [...document.querySelectorAll("[data-state-for]")];

  const errorText = document.querySelector("#texto-error");
  const errorCode = document.querySelector("#codigo-error");
  const resultBody = document.querySelector("#respuesta-texto");
  const resultQuestion = document.querySelector("#respuesta-metadata-pregunta");
  const resultSources = document.querySelector("#respuesta-fuentes");

  // ── Solo aplica en la página del asistente ──────────────────────────────
  if (!form || !textarea || !panel) return;

  const LABELS = {
    vacio: "EN ESPERA",
    cargando: "CONSULTANDO…",
    error: "ERROR",
    exito: "RESPUESTA",
  };

  /** Cambia el estado visible de la ventana de respuesta. */
  function setEstado(nombre) {
    for (const el of states) {
      el.hidden = el.dataset.stateFor !== nombre;
    }
    panel.dataset.estado = nombre;
    statusBadge.dataset.estado = nombre;
    statusBadge.textContent = LABELS[nombre] ?? nombre;
  }

  /** Mantiene el contador 0/500 y avisa al acercarse al límite. */
  function actualizarContador() {
    const len = textarea.value.length;
    counter.textContent = `${len} / ${MAX_LEN}`;
    counter.classList.toggle("is-warning", len >= LIMIT_MARK && len < MAX_LEN);
    counter.classList.toggle("is-limit", len >= MAX_LEN);
  }

  function bloquearFormulario(bloqueado) {
    submitBtn.disabled = bloqueado;
    submitBtn.setAttribute("aria-busy", String(bloqueado));
    submitBtn.innerHTML = bloqueado
      ? '<span class="btn__spinner" aria-hidden="true"></span> Consultando…'
      : "Consultar";
  }

  /** Muestra un error (de red o de la API) en la ventana de respuesta. */
  function mostrarError(code, message) {
    errorCode.textContent = code ?? "R-0";
    if (message) errorText.textContent = message;
    setEstado("error");
  }

  /** Renderiza una respuesta correcta con sus fuentes. */
  function renderResultado(data) {
    resultBody.textContent = data.respuesta ?? "(respuesta vacía)";
    resultQuestion.textContent = data.conversacion?.userMessage ?? data.preguntaUsada ?? "";

    resultSources.replaceChildren();
    const fuentes = data.fuentes ?? [];

    if (fuentes.length > 0) {
      for (const fuente of fuentes) {
        const span = document.createElement("span");
        const juego = fuente.juego ? ` · ${fuente.juego}` : "";
        span.textContent = `${fuente.titulo ?? fuente.fuente}${juego}`;
        span.title = `Información procedente de: ${fuente.fuente}`;
        resultSources.appendChild(span);
      }
    } else {
      const span = document.createElement("span");
      span.textContent = "Sin fuentes recuperadas.";
      span.style.color = "var(--c-dim)";
      resultSources.appendChild(span);
    }

    setEstado("exito");
  }

  /** Envía la pregunta al backend (/api/chat). */
  async function enviarConsulta(pregunta) {
    bloquearFormulario(true);
    setEstado("cargando");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta }),
      });

      const data = await res.json().catch(() => ({ ok: false }));

      if (!res.ok) {
        mostrarError(data?.error?.code, data?.error?.message);
        return;
      }

      renderResultado(data);
    } catch {
      mostrarError(
        "RED",
        "No se pudo conectar con el servidor. Comprueba que `npm start` esté en marcha y recarga la página."
      );
    } finally {
      bloquearFormulario(false);
    }
  }

  // ── Eventos ─────────────────────────────────────────────────────────────
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const pregunta = textarea.value.trim();
    if (pregunta.length === 0) return;
    if (pregunta.length > MAX_LEN) {
      mostrarError("MAX_LEN", `La pregunta supera los ${MAX_LEN} caracteres.`);
      return;
    }
    enviarConsulta(pregunta);
  });

  textarea.addEventListener("input", actualizarContador);
  textarea.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  for (const chip of chips) {
    chip.addEventListener("click", () => {
      textarea.value = chip.dataset.sugerencia;
      actualizarContador();
      textarea.focus();
    });
  }

  // Estado inicial
  actualizarContador();
  setEstado("vacio");
})();