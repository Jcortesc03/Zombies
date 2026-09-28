/**
 * Convierte los datos crudos de un juego en "chunks" de texto plano
 * listos para el prompt y para la búsqueda por relevancia.
 */

const normalize = (value) =>
  Array.isArray(value)
    ? value.filter(Boolean).join(". ")
    : typeof value === "string"
      ? value
      : "";

/** Chunk por mapa. `game` es el documento del juego, `mapa` su elemento. */
function mapChunk(game, mapa, source) {
  return {
    tipo: "mapa",
    titulo: mapa.name ?? "Mapa sin nombre",
    texto: [
      `Mapa: ${mapa.name}`,
      `Juego: ${game.title} (${game.release ?? "¿año?"})`,
      mapa.setting && `Ambientación: ${normalize(mapa.setting)}`,
      mapa.characters?.length && `Personajes presentes: ${normalize(mapa.characters)}`,
      mapa.perks?.length && `Perks: ${normalize(mapa.perks)}`,
      mapa.weapons && `Armas: ${normalize(mapa.weapons)}`,
      mapa.mysteries && `Misterios e historia: ${normalize(mapa.mysteries)}`,
      mapa.easterEggs?.length && `Easter eggs: ${normalize(mapa.easterEggs)}`,
      mapa.trivia && `Curiosidades: ${normalize(mapa.trivia)}`,
    ]
      .filter(Boolean)
      .join(". "),
    juego: game.game,
    fuente: `${source}#${encodeURIComponent(mapa.name ?? "mapa")}`,
    keywords: [mapa.name, ...(mapa.characters ?? []), ...(mapa.perks ?? [])].filter(Boolean),
  };
}

/** Chunk por personaje. `game` es el documento, `personaje` su elemento. */
function characterChunk(game, personaje, source) {
  return {
    tipo: "personaje",
    titulo: personaje.name ?? "Personaje sin nombre",
    texto: [
      `Personaje: ${personaje.name}`,
      personaje.alias && `Alias: ${normalize(personaje.alias)}`,
      personaje.affiliation && `Afiliación: ${normalize(personaje.affiliation)}`,
      `Aparece en: ${normalize(personaje.appearances ?? []) || "varios juegos"}`,
      personaje.description && `Descripción: ${normalize(personaje.description)}`,
      personaje.trivia && `Curiosidades: ${normalize(personaje.trivia)}`,
    ]
      .filter(Boolean)
      .join(". "),
    juego: game.game,
    fuente: `${source}#${encodeURIComponent(personaje.name ?? "personaje")}`,
    keywords: [personaje.name, personaje.alias, ...(personaje.appearances ?? [])].filter(Boolean),
  };
}

/** Trocea un documento JSON de un juego en una lista de chunks. */
export function chunkJson(document, source) {
  const chunks = [];

  for (const mapa of document.maps ?? []) chunks.push(mapChunk(document, mapa, source));
  for (const personaje of document.characters ?? []) chunks.push(characterChunk(document, personaje, source));

  return chunks.filter((chunk) => chunk.titulo !== "Mapa sin nombre" || chunk.texto.length > 20);
}