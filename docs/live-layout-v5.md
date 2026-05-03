# Vanguardistas `/live` Layout — Versión 5.0 (Stacked Scroll Mobile)

> Estado guardado: 2025-05-02  
> Desktop igual que v1-v4. Mobile: stacked vertical, análisis arriba / chat abajo, con resizer horizontal.

---

## Cambios desde v4

### Desktop (`≥1024px`)
Sin cambios. Split resizable 50/50, paneles flotantes `rounded-[32px]`.

### Mobile (`<1024px`)
**Antes (v4):** Bottom sheet con 4 niveles + FAB flotante.  
**Ahora (v5):** Layout apilado verticalmente, análisis arriba / chat abajo, con resizer horizontal.

---

## Mobile: Stacked Scroll

### Estructura

```
┌─────────────────────────────┐  ← rounded-[32px] container
│                             │
│      ANÁLISIS (arriba)      │  ← 20% por defecto
│                             │
├─────────────────────────────┤  ← resizer horizontal
│                             │
│        CHAT (abajo)         │  ← 80% por defecto
│                             │
└─────────────────────────────┘
```

### División por defecto
- **Análisis (arriba)**: `20%` del viewport
- **Chat (abajo)**: `80%` del viewport

### Límites del resize
- **Mínimo análisis**: `15%`
- **Máximo análisis**: `50%`

### Resizer horizontal
- Posición: entre los dos paneles
- Altura: `h-1.5`, se ensancha al hover/drag a `h-3`
- Color: `bg-white/[0.06]`, al drag `bg-white/[0.12]`
- Icono: `GripHorizontal` (aparece al hover/drag)
- Cursor: `row-resize`
- Soporta **mouse y touch** (para mobile nativo)

---

## Layout Mobile en `LiveContainer.tsx`

```tsx
<div
  ref={mobileContainerRef}
  className="lg:hidden flex flex-col w-full h-full rounded-[32px] ... overflow-hidden"
>
  {/* Top — Analysis */}
  <div
    className="flex flex-col overflow-hidden"
    style={{ height: `${mobileSplit}%` }}
  >
    <AnalysisPanel ... />
  </div>

  {/* Horizontal Resizer */}
  <div
    onMouseDown={handleMobileMouseDown}
    onTouchStart={handleMobileMouseDown}
    className={`relative z-20 flex items-center justify-center shrink-0 transition-colors ${
      isMobileDragging
        ? "h-3 bg-white/[0.12]"
        : "h-1.5 hover:h-3 hover:bg-white/[0.08] bg-white/[0.06]"
    }`}
  >
    <GripHorizontal className="w-4 h-4 text-white/40" />
  </div>

  {/* Bottom — Chat */}
  <div
    className="flex flex-col overflow-hidden"
    style={{ height: `${100 - mobileSplit}%` }}
  >
    <ChatPanel ... />
  </div>
</div>
```

### Estado del mobile split
```typescript
const [mobileSplit, setMobileSplit] = useState(20);
const [isMobileDragging, setIsMobileDragging] = useState(false);

const handleMobileMouseMove = (e: MouseEvent | TouchEvent) => {
  const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
  const rect = mobileContainerRef.current.getBoundingClientRect();
  const y = clientY - rect.top;
  const percentage = (y / rect.height) * 100;
  setMobileSplit(Math.max(15, Math.min(50, percentage)));
};
```

---

## Diferencias clave con v4

| Aspecto | v4 (Sheet + FAB) | v5 (Stacked) |
|---------|------------------|--------------|
| **Layout mobile** | Sheet flotante desde abajo | Dos paneles apilados |
| **Análisis** | En sheet, ocultable | Siempre arriba, 20% default |
| **Chat** | Siempre visible debajo | Siempre abajo, 80% default |
| **Resize** | No (snap points) | Sí, drag horizontal |
| **FAB** | Sí, cuando sheet cerrado | No |
| **Scroll** | Sheet scroll interno | Cada panel scroll interno |
| **Cerrar análisis** | Botón X | No se puede cerrar |

---

## Archivos modificados en v5

```
app/live/
├── LiveContainer.tsx              # MOBILE: stacked layout + horizontal resizer
├── components/
│   ├── ChatPanel.tsx              # LIMPIO: sin spacers mobile ni props de sheet
│   ├── AnalysisPanel.tsx          # Sin cambios
│   ├── AnalysisSheet.tsx          # No se usa (queda en codebase por compat)
│   ├── ProgressTracker.tsx        # Sin cambios
│   ├── ScoreMeter.tsx             # Sin cambios
│   ├── InsightCards.tsx           # Sin cambios
│   └── BuyerPersonaBadge.tsx      # Sin cambios
```

---

## Responsive

| Breakpoint | Layout |
|------------|--------|
| `≥1024px` (lg) | Split horizontal 50/50, arrastrable verticalmente |
| `<1024px` | Split vertical 20/80, arrastrable horizontalmente |

---

## Cómo revertir a esta versión

Si el layout se modifica y quieres volver a v5:

1. Reemplazar `LiveContainer.tsx` con el contenido de este doc
2. Reemplazar `ChatPanel.tsx` con el contenido de este doc
3. Los demás componentes (AnalysisPanel, ProgressTracker, etc.) usan los de versiones anteriores

---

## Decisiones de diseño

- **¿Por qué análisis arriba y chat abajo?** El usuario pidió explícitamente "chat abajo y el analisis arriba". Esto hace que el chat (la acción principal) esté más cerca del pulgar al sostener el teléfono.
- **¿Por qué 20/80 por defecto?** El chat es la acción principal, necesita más espacio. 20% para análisis es suficiente para ver score + etapa + progreso.
- **¿Por qué resize horizontal?** El usuario pidió "opcion de rize". El drag horizontal es el patrón natural para dividir pantalla verticalmente.
- **¿Por qué touch support?** En mobile el usuario interactúa con el dedo, no con mouse. El resizer escucha `touchstart`, `touchmove`, `touchend`.
- **¿Por qué límites 15%-50%?** Evita que el análisis sea inútilmente pequeño (<15%) o que el chat sea inusablemente chico (>50% para análisis = <50% para chat).

---

## Posibles mejoras futuras

- **Double-tap resizer**: Doble tap en el resizer para resetear a 20/80.
- **Snap points en mobile**: En vez de resize libre, snap a 20/40/50%.
- **Collapse analysis**: Botón para colapsar análisis a un mini-header (~40px) y darle todo el espacio al chat.
- **Landscape mobile**: En horizontal, quizás volver al split side-by-side en vez de stacked.

---

## Historial de layouts

| Versión | Archivo | Descripción |
|---------|---------|-------------|
| v1 | `docs/live-layout-v1.md` | Tabs mobile (Chat / Análisis) |
| v2 | `docs/live-layout-v2.md` | Mini-bar flotante + drawer |
| v3 | `docs/live-layout-v3.md` | Bottom sheet 3 niveles |
| v4 | `docs/live-layout-v4.md` | Bottom sheet 4 niveles + FAB |
| **v5** | `docs/live-layout-v5.md` | **Stacked scroll (actual)** |
