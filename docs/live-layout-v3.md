# Vanguardistas `/live` Layout — Versión 3.0 (Bottom Sheet con Snap Points)

> Estado guardado: 2025-05-02  
> Desktop igual que v1/v2. Mobile reemplazado: mini-bar + drawer → bottom sheet siempre visible con 3 niveles.

---

## Cambios desde v2

### Desktop (`≥1024px`)
Sin cambios. Split resizable 50/50, paneles flotantes `rounded-[32px]`.

### Mobile (`<1024px`)
**Antes (v2):** Chat fullscreen + mini-bar flotante + bottom drawer (overlay).  
**Ahora (v3):** Chat fullscreen + **bottom sheet siempre visible** con 3 niveles de altura (snap points).

---

## Mobile: Bottom Sheet

### Comportamiento
El sheet está **siempre montado** en la parte inferior de la pantalla. El usuario puede hacer click en el handle bar para cycle entre niveles, o dejarlo en cualquier nivel mientras interactúa con el chat.

### Snap Points (3 niveles)

| Nivel | Altura | Qué se ve | Uso |
|-------|--------|-----------|-----|
| **Collapsed** | `80px` | Handle bar + avatar + score + etapa | Info siempre visible, mínima intrusión |
| **Half** | `50dvh` | Header + Progreso + Score + Hallazgos principales | Revisar avance sin perder contexto del chat |
| **Full** | `85dvh` | Todo el `AnalysisPanel` completo | Análisis detallado, scroll interno |

### Animación entre niveles
- **Spring** con `damping: 25, stiffness: 300`
- Al hacer click en el handle bar: cycle `collapsed → half → full → collapsed`
- Transición suave y natural

---

## Componente: `AnalysisSheet.tsx`

### Estructura
```tsx
<motion.div
  animate={{ height: heightMap[state] }}
  transition={{ type: "spring", damping: 25, stiffness: 300 }}
  className="fixed bottom-0 left-0 right-0 z-50 
             bg-[#0B0B16]/95 backdrop-blur-md 
             rounded-t-[32px] border-t border-white/[0.06]"
>
  {/* Handle bar (clickeable) */}
  <button onClick={cycleState}>
    <div className="w-10 h-1 rounded-full bg-white/20" />
  </button>

  {/* Compact info — solo visible en collapsed */}
  <AnimatePresence>
    {state === "collapsed" && (
      <motion.div>...</motion.div>
    )}
  </AnimatePresence>

  {/* Contenido completo — AnalysisPanel */}
  <div className="flex-1 min-h-0 overflow-y-auto">
    <AnalysisPanel ... />
  </div>
</motion.div>
```

### Handle bar
- Siempre visible en todos los niveles
- Clickeable: cycle entre snap points
- Hover: `bg-white/[0.02]`
- Línea gris centrada: `w-10 h-1 rounded-full bg-white/20`

### Compact info (collapsed only)
- Se muestra solo cuando `state === "collapsed"`
- `AnimatePresence` con fade in/out
- Contenido:
  - Avatar mini de Qubra (24px)
  - Score: `"6 / 30"` en `text-[11px] font-medium text-white/90`
  - Etapa: `"Retratar"` en `text-[10px] uppercase tracking-wider text-[#E8E4F5]/40`
  - Icono `ChevronUp` a la derecha
- Clickeable: expande a `half`

### Contenido completo
- Siempre renderizado (incluso en `collapsed`, aunque no se ve)
- `AnalysisPanel` completo con scroll interno
- En `half` y `full`, el usuario scrollea dentro del sheet para ver todo

---

## Layout Mobile en `LiveContainer.tsx`

```tsx
<div className="lg:hidden relative w-full h-full rounded-[32px] ...">
  {/* Chat ocupa todo el contenedor */}
  <ChatPanel ... />

  {/* Sheet overlay fixed bottom */}
  <AnalysisSheet
    analysis={analysis}
    isAnalyzing={isAnalyzing}
    onGenerateInforme={handleGenerateInforme}
    informe={informe}
  />
</div>
```

- Chat ocupa `100%` del contenedor
- Sheet es `fixed bottom-0` con `z-50`
- Chat queda visible detrás del sheet colapsado
- En `full`, el sheet tapa la mayor parte del chat (intencional, como Google Maps)

---

## `ChatPanel.tsx` — Sin mini-bar

En v3, `ChatPanel` **ya no tiene** el mini-bar flotante ni las props `analysis`/`onOpenAnalysis`. El sheet reemplaza esa función por completo.

**Props actuales:**
```typescript
interface ChatPanelProps {
  messages: LiveMessage[];
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSend: () => void;
}
```

---

## Flujo de interacción mobile

1. **Usuario entra a `/live`**
   - Chat visible, sheet en `collapsed` (80px)
   - Ve score + etapa siempre

2. **Usuario quiere ver progreso**
   - Toca handle bar → sheet expande a `half` (50dvh)
   - Ve progreso, score, hallazgos
   - Puede seguir escribiendo en el chat (input visible detrás)

3. **Usuario quiere ver análisis completo**
   - Toca handle bar de nuevo → sheet expande a `full` (85dvh)
   - Ve todo el panel con scroll interno
   - Chat casi tapado, pero puede colapsar el sheet rápidamente

4. **Usuario quiere volver al chat**
   - Toca handle bar → colapsa a `collapsed`
   - O puede tocar el área del chat visible arriba (si hay)

---

## Comparativa de versiones mobile

| Aspecto | v1 Tabs | v2 Mini-Bar + Drawer | v3 Bottom Sheet |
|---------|---------|----------------------|-----------------|
| **Siempre visible** | ❌ No (tabs) | ⚠️ Mini-bar sí, drawer no | ✅ Sheet siempre visible |
| **Info crítica** | En tab separado | En mini-bar | En sheet colapsado |
| **Expansión** | Cambiar de tab | Drawer desde abajo | Snap points animados |
| **Overlay** | No | Sí (oscurece chat) | No (chat siempre visible detrás) |
| **Scroll análisis** | Panel completo | Panel completo | Panel completo + snap |
| **Interacción chat** | Interrumpida al cambiar tab | Chat visible al abrir drawer | Chat siempre accesible |
| **Patrón UI** | Tabs nativas | Modal drawer | Google Maps style |

---

## Archivos modificados en v3

```
app/live/
├── LiveContainer.tsx              # MOBILE: quita drawer, agrega AnalysisSheet
├── components/
│   ├── AnalysisSheet.tsx          # NUEVO: bottom sheet con snap points
│   ├── ChatPanel.tsx              # QUITA: mini-bar, props analysis/onOpenAnalysis
│   ├── AnalysisPanel.tsx          # Sin cambios desde v1/v2
│   ├── ProgressTracker.tsx        # Sin cambios
│   ├── ScoreMeter.tsx             # Sin cambios
│   ├── InsightCards.tsx           # Sin cambios
│   └── BuyerPersonaBadge.tsx      # Sin cambios
```

---

## Estado del sheet

```typescript
type SheetState = "collapsed" | "half" | "full";

const [state, setState] = useState<SheetState>("collapsed");

const heightMap: Record<SheetState, string> = {
  collapsed: "80px",
  half: "50dvh",
  full: "85dvh",
};

const cycleState = () => {
  if (state === "collapsed") setState("half");
  else if (state === "half") setState("full");
  else setState("collapsed");
};
```

---

## Decisiones de diseño

- **¿Por qué sheet siempre visible y no drawer?** El usuario quiere "que el diagnóstico en mobile se vea". Un sheet colapsado muestra score + etapa permanentemente sin interrumpir el chat.
- **¿Por qué 3 niveles?** Collapsed da info esencial. Half permite revisar avance. Full permite análisis detallado. Es el patrón de Google Maps / Apple Maps.
- **¿Por qué no drag nativo?** Framer Motion `drag` + `animate` pueden conflictear. Click en handle bar es más robusto y todos los usuarios entienden el patrón.
- **¿Por qué spring en vez de ease?** Spring se siente físico y natural, como una hoja de papel real que se mueve.
- **¿Por qué el chat queda detrás?** Es intencional. El usuario sabe que el chat está ahí. Puede colapsar el sheet en un tap para volver al chat. Es el comportamiento estándar de bottom sheets.

---

## Cómo revertir a esta versión

Si el layout se modifica y quieres volver a v3:

1. Reemplazar `LiveContainer.tsx` con el contenido de este doc
2. Reemplazar `ChatPanel.tsx` con el contenido de este doc (sin mini-bar)
3. Crear `components/AnalysisSheet.tsx` con el contenido de este doc
4. Los demás componentes (AnalysisPanel, ProgressTracker, etc.) usan los de v1/v2

---

## Posibles mejoras futuras

- **Drag gesture**: Agregar `drag="y"` en el handle bar para que el usuario pueda arrastrar el sheet en vez de solo hacer click.
- **Snap automático al scroll**: Si el usuario scrollea hacia arriba dentro del sheet en estado `half`, podría auto-expandir a `full`.
- **Backdrop blur dinámico**: En `full`, agregar un overlay semitransparente sobre el chat para enfocar la atención en el análisis.
- **Indicador de progreso animado**: Dot pulsante en el handle bar cuando `isAnalyzing` es true.
