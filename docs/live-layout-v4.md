# Vanguardistas `/live` Layout — Versión 4.0 (Bottom Sheet Cerrable + FAB)

> Estado guardado: 2025-05-02  
> Desktop igual que v1/v2/v3. Mobile: bottom sheet con 4 niveles (incluyendo hidden) + FAB flotante.

---

## Cambios desde v3

### Desktop (`≥1024px`)
Sin cambios. Split resizable 50/50, paneles flotantes `rounded-[32px]`.

### Mobile (`<1024px`)
**Antes (v3):** Bottom sheet con 3 niveles (collapsed/half/full), nunca se cerraba del todo.  
**Ahora (v4):** Bottom sheet con **4 niveles** incluyendo `hidden`, + **FAB flotante** para reabrir.

---

## Mobile: Bottom Sheet (4 estados)

| Estado | Altura | Qué se ve |
|--------|--------|-----------|
| **Hidden** | `0px` (fuera de pantalla) | Nada — FAB visible |
| **Collapsed** | `80px` | Handle bar + avatar + score + etapa |
| **Half** | `50dvh` | Progreso + Score + Hallazgos |
| **Full** | `85dvh` | Todo el `AnalysisPanel` con scroll |

### Cómo cambiar de estado

- **Handle bar click**: cycle `collapsed → half → full → collapsed`
- **Botón X**: cierra a `hidden`
- **FAB flotante**: abre a `half`

### Animación entre estados
- Spring con `damping: 25, stiffness: 300`
- Cuando pasa a `hidden`: `translateY: "100%"` (sale por abajo)

---

## Componente: `AnalysisSheet.tsx`

### Estructura completa

```tsx
<motion.div
  animate={{
    height: heightMap[state],
    y: state === "hidden" ? "100%" : 0,
  }}
  transition={{ type: "spring", damping: 25, stiffness: 300 }}
  className="fixed bottom-0 left-0 right-0 z-50 ..."
>
  {/* Header: Handle bar + X */}
  <div className="flex items-center justify-center relative">
    <button onClick={cycleState}>
      <div className="w-10 h-1 rounded-full bg-white/20" />
    </button>
    <button onClick={closeSheet} className="absolute right-3 ...">
      <X className="w-3.5 h-3.5" />
    </button>
  </div>

  {/* Compact info — solo en collapsed */}
  <AnimatePresence>
    {state === "collapsed" && (
      <motion.div>...</motion.div>
    )}
  </AnimatePresence>

  {/* AnalysisPanel completo */}
  <div className="flex-1 min-h-0 overflow-y-auto">
    <AnalysisPanel ... />
  </div>
</motion.div>
```

### FAB (Floating Action Button)

```tsx
<AnimatePresence>
  {state === "hidden" && (
    <motion.button
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      onClick={() => setState("half")}
      className="fixed bottom-6 right-4 z-40 ... rounded-full px-3.5 py-2.5"
    >
      <img src="/img/qubra.png" className="w-6 h-6 rounded-full" />
      <span>{score} / 30</span>
      <BarChart3 className="w-3.5 h-3.5 text-[#7A2CFF]" />
    </motion.button>
  )}
</AnimatePresence>
```

**Posición**: `fixed bottom-6 right-4 z-40`
**Estilo**: `rounded-full`, fondo `#0B0B16]/90`, borde sutil, shadow
**Contenido**: Avatar mini + score + icono BarChart3 violeta
**Animación**: Spring con scale + fade

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

---

## `ChatPanel.tsx` — Sin mini-bar, con spacer anti-tapado

### Props (sin cambios desde v1 desktop)
```typescript
interface ChatPanelProps {
  messages: LiveMessage[];
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSend: () => void;
}
```

### Spacer extra para mobile
```tsx
{/* Bottom spacer for scroll */}
<div className="h-6 lg:h-6" />
{/* Extra spacer on mobile for FAB/sheet */}
<div className="h-16 lg:hidden" />
```

### Input con padding extra
```tsx
<div className="... shrink-0 pb-6 lg:pb-4 sm:pb-5">
```

**Razón**: El input del chat nunca queda tapado por el FAB (que está a la derecha) ni por el sheet colapsado. El spacer de `h-16` asegura que el último mensaje siempre scrollea por encima del área del FAB.

---

## Flujo de interacción mobile

1. **Usuario entra a `/live`**
   - Chat visible, sheet en `collapsed` (80px)
   - Ve score + etapa siempre
   - Input del chat completamente accesible

2. **Usuario quiere más espacio para el chat**
   - Toca el botón X en el handle bar → sheet se cierra a `hidden`
   - Aparece el FAB en la esquina inferior derecha
   - Chat ocupa casi toda la pantalla

3. **Usuario quiere revisar el diagnóstico**
   - Toca el FAB → sheet abre a `half`
   - Ve progreso, score, hallazgos
   - Puede seguir escribiendo (input visible)

4. **Usuario quiere análisis completo**
   - Toca handle bar → sheet expande a `full` (85dvh)
   - Scroll interno para ver todo el panel
   - Puede cerrar con X para volver al chat

---

## Comparativa de versiones mobile

| Aspecto | v1 Tabs | v2 Mini-Bar + Drawer | v3 Sheet 3 niveles | v4 Sheet 4 niveles + FAB |
|---------|---------|----------------------|-------------------|--------------------------|
| **Siempre visible** | ❌ Tabs | ⚠️ Mini-bar | ✅ Sheet collapsed | ✅ FAB cuando cerrado |
| **Se puede cerrar** | ❌ No | ✅ Drawer sí | ❌ No | ✅ Sí, con X |
| **Info crítica** | En tab | En mini-bar | En sheet | En FAB + sheet |
| **Overlay** | No | Sí | No | No |
| **Input tapado** | No | No | Sí (a veces) | No (spacer extra) |
| **Patrón UI** | Tabs | Modal + bar | Google Maps | Google Maps + FAB |

---

## Archivos modificados en v4

```
app/live/
├── LiveContainer.tsx              # MOBILE: sin cambios desde v3
├── components/
│   ├── AnalysisSheet.tsx          # MODIFICADO: estado "hidden" + FAB + botón X
│   ├── ChatPanel.tsx              # MODIFICADO: spacer extra + padding input
│   ├── AnalysisPanel.tsx          # Sin cambios
│   ├── ProgressTracker.tsx        # Sin cambios
│   ├── ScoreMeter.tsx             # Sin cambios
│   ├── InsightCards.tsx           # Sin cambios
│   └── BuyerPersonaBadge.tsx      # Sin cambios
```

---

## Estado del sheet

```typescript
type SheetState = "hidden" | "collapsed" | "half" | "full";

const [state, setState] = useState<SheetState>("collapsed");

const heightMap: Record<SheetState, string> = {
  hidden: "0px",
  collapsed: "80px",
  half: "50dvh",
  full: "85dvh",
};

const cycleState = () => {
  if (state === "hidden") setState("half");
  else if (state === "collapsed") setState("half");
  else if (state === "half") setState("full");
  else setState("collapsed");
};
```

---

## Decisiones de diseño

- **¿Por qué agregar `hidden`?** El usuario reportó que el sheet tapaba la escritura. Ahora puede cerrarlo completamente.
- **¿Por qué FAB?** Cuando el sheet está cerrado, el usuario necesita una forma rápida de ver el score y reabrir el diagnóstico sin perder el contexto del chat.
- **¿Por qué el FAB muestra score?** Info crítica siempre visible, incluso con el sheet cerrado.
- **¿Por qué spacer de `h-16`?** Asegura que el scroll del chat siempre deje espacio para el FAB/sheet colapsado. El último mensaje nunca queda tapado.
- **¿Por qué padding extra en input?** En mobile (`pb-6`), el input tiene espacio debajo para que no quede pegado al borde de la pantalla ni al FAB.

---

## Cómo revertir a esta versión

Si el layout se modifica y quieres volver a v4:

1. Reemplazar `LiveContainer.tsx` con el contenido de este doc
2. Reemplazar `ChatPanel.tsx` con el contenido de este doc
3. Crear/reemplazar `components/AnalysisSheet.tsx` con el contenido de este doc
4. Los demás componentes (AnalysisPanel, ProgressTracker, etc.) usan los de v1/v2/v3

---

## Posibles mejoras futuras

- **Drag gesture nativo**: Permitir arrastrar el sheet con el dedo, no solo click en handle bar.
- **Backdrop tap**: Al tocar el área del chat cuando el sheet está en `half`/`full`, colapsar a `collapsed`.
- **Auto-hide FAB**: El FAB podría desvanecerse cuando el usuario está scrolleando hacia abajo en el chat, y reaparecer al scrollear hacia arriba.
- **Sheet persistente en scroll**: En `half`, si el usuario scrollea el chat, el sheet podría auto-colapsar a `collapsed`.

---

## Nota sobre API

Modelo Gemini usado en esta versión: `gemini-3.1-flash-lite-preview`  
(Anteriormente `gemini-2.5-flash` tenía quota exceeded en la API key gratuita)
