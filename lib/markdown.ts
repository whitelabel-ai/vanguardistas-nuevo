export function cleanMarkdown(markdown: string): string {
  let cleaned = markdown.trim();

  // Corregir títulos pegados al texto
  cleaned = cleaned.replace(/([^\n\s])(\s*)(#{1,6})(\s*)/g, (_, beforeText, _spaces, hashes, afterSpaces) => {
    const properSpacing = afterSpaces.length === 0 ? " " : afterSpaces;
    return beforeText + "\n\n" + hashes + properSpacing;
  });

  // Asegurar espacios después de #
  cleaned = cleaned.replace(/(#{1,6})([^\s#])/g, "$1 $2");

  // Corregir listas pegadas al texto
  cleaned = cleaned.replace(/([^\n])(\s*)([-*]\s)/g, "$1\n\n$3");

  // Normalizar espacios en listas
  cleaned = cleaned.replace(/^(\s*)([-*])([^\s])/gm, "$1$2 $3");

  // Asegurar saltos de línea después de títulos
  cleaned = cleaned.replace(/(#{1,6}\s.*?)([^\n])/g, "$1\n$2");

  // Corregir blockquotes pegados
  cleaned = cleaned.replace(/([^\n])(\s*)(>\s)/g, "$1\n\n$3");

  // Limpiar múltiples saltos de línea
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  // Asegurar que las listas tengan separación adecuada
  cleaned = cleaned.replace(/(\n[-*]\s.*?)(\n)([^-*\n\s])/g, "$1\n\n$3");

  // Corregir texto en negrita/cursiva pegado
  cleaned = cleaned.replace(/([^\s])(\*{1,2}[^*]+\*{1,2})([^\s])/g, "$1 $2 $3");

  return cleaned;
}

export function convertMarkdownToHTML(markdown: string): string {
  let html = markdown;

  // Convertir títulos
  html = html.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Convertir texto en negrita
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");

  // Convertir texto en cursiva
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");

  // Convertir listas
  html = html.replace(/^\* (.*$)/gim, "<li>$1</li>");
  html = html.replace(/^- (.*$)/gim, "<li>$1</li>");

  // Envolver listas en ul
  html = html.replace(/((<li>.*<\/li>\s*)+)/g, "<ul>$1</ul>");

  // Convertir saltos de línea
  html = html.replace(/\n\n/g, "</p><p>");
  html = html.replace(/\n/g, "<br>");

  // Envolver en párrafos
  html = "<p>" + html + "</p>";

  // Limpiar párrafos vacíos
  html = html.replace(/<p><\/p>/g, "");
  html = html.replace(/<p>\s*<\/p>/g, "");

  return html;
}
