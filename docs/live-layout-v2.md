# Vanguardistas `/live` Layout — Versión 2.0 (Mini-Bar + Drawer Mobile)

> Estado guardado: 2025-05-02  
> Desktop igual que v1. Mobile reemplazado: tabs → mini-bar flotante + bottom drawer.

---

## Cambios desde v1

### Desktop (`≥1024px`)
Sin cambios. Split resizable 50/50, paneles flotantes `rounded-[32px]`.

### Mobile (`<1024px`)
**Antes (v1):** Tabs Chat/Análisis, un panel a la vez.  
**Ahora (v2):** Chat a pantalla completa + mini-bar flotante + drawer de análisis desde abajo.

---

## Mobile: Mini-Bar Flotante

### Posición
Entre los mensajes y el input del chat. Siempre visible mientras hay datos de análisis.

```tsx
// ChatPanel.tsx — solo visible en mobile (lg:hidden)
<div className="lg:hidden px-6 pb-3 shrink-0">
  <button
    onClick={onOpenAnalysis}
    className="w-full flex items-center justify-between 
               bg-white/[0.04] hover:bg-white/[0.08] 
               backdrop-blur-sm rounded-2xl px-4 py-3"
  >
    {/* Izquierda: etapa + score */}
    <div>
      <span className="text-[10px] uppercase tracking-wider text-[#E8E4F5]/40">
        {etapaActual}  // ej: "Retratar"
      </span>
      <span className="text-sm font-medium text-white">
        {score} <span className="text-white/40">/ 30 puntos</span>
      </span>
    </div>

    {/* Derecha: CTA */}
    <div className="flex items-center gap-2 text-white/40">
      <span className="text-xs">Ver análisis</span>
      <BarChart3 className="w-4 h-4" />
    </div>
  </button>
</div>
```

### Datos mostrados
- **Label superior**: Etapa actual del diagnóstico (Retratar/Descomponer/Reinterpretar/Completado)
- **Score**: Número actual / 30 puntos
- **CTA**: "Ver análisis" + icono `BarChart3`

### Comportamiento
- Al tocar: `onOpenAnalysis()` → abre el drawer
- Hover: `bg-white/[0.08]` para feedback visual
- `backdrop-blur-sm` para integrarse con el fondo

---

## Mobile: Bottom Drawer de Análisis

### Overlay
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className="fixed inset-0 bg-black/60 z-40"
  onClick={() => setShowAnalysisDrawer(false)}
/>
```
- Fondo semitransparente oscuro
- Al tocar cierra el drawer
- Fade in/out 200ms

### Drawer
```tsx
<motion.div
  initial={{ y: "100%" }}
  animate={{ y: 0 }}
  exit={{ y: "100%" }}
  transition={{ type: "spring", damping: 25, stiffness: 300 }}
  className="fixed bottom-0 left-0 right-0 z-50 max-h-[85dvh]"
>
  <div className="bg-[#0B0B16] rounded-t-[32px] border-t border-white/[0.06]">
    {/* Handle bar + X */}
    {/* AnalysisPanel completo */}
  </div>
</motion.div>
```

### Header del drawer
- **Handle bar**: Línea gris `w-10 h-1 rounded-full bg-white/20` centrada
- **Botón X**: `rounded-full bg-white/[0.06]` en esquina derecha
- Ambos en una fila con `justify-between`

### Contenido
- Todo el `AnalysisPanel` renderizado dentro del drawer
- Scroll interno propio
- Altura máxima: `85dvh`

### Animaciones
- Entrada: Spring desde `y: "100%"` (damping: 25, stiffness: 300)
- Salida: Spring hacia abajo
- Overlay: Fade simple

---

## Estructura de archivos modificados

```
app/live/
├── LiveContainer.tsx          # MOBILE: tabs removidos, drawer + overlay agregados
│                              # DESKTOP: igual que v1
├── components/
│   ├── ChatPanel.tsx          # NUEVAS PROPS: analysis?, onOpenAnalysis?
│   │                          # NUEVO: mini-bar flotante (lg:hidden)
│   ├── AnalysisPanel.tsx      # Sin cambios desde v1
│   ├── ProgressTracker.tsx    # Sin cambios desde v1
│   ├── ScoreMeter.tsx         # Sin cambios desde v1
│   ├── InsightCards.tsx       # Sin cambios desde v1
│   └── BuyerPersonaBadge.tsx  # Sin cambios desde v1
```

---

## Props nuevas en ChatPanel

```typescript
interface ChatPanelProps {
  // ... props originales ...
  analysis?: LiveAnalysis;        // NUEVO: datos para el mini-bar
  onOpenAnalysis?: () => void;    // NUEVO: callback para abrir drawer
}
```

### Lógica de renderizado del mini-bar
```typescript
const showMiniBar = analysis && onOpenAnalysis;
// Solo se muestra si:
// 1. Hay datos de análisis disponibles
// 2. Se proporcionó el callback (indica que estamos en mobile)
```

En desktop (`LiveContainer.tsx` desktop branch):  
```tsx
<ChatPanel
  messages={messages}
  input={input}
  setInput={setInput}
  isLoading={isLoading}
  onSend={handleSend}
  // NO se pasan analysis ni onOpenAnalysis → mini-bar no se renderiza
/>
```

En mobile (`LiveContainer.tsx` mobile branch):  
```tsx
<ChatPanel
  messages={messages}
  input={input}
  setInput={setInput}
  isLoading={isLoading}
  onSend={handleSend}
  analysis={analysis}                    // ← PASADO
  onOpenAnalysis={() => setShowAnalysisDrawer(true)}  // ← PASADO
/>
```

---

## Estado en LiveContainer

```typescript
const [showAnalysisDrawer, setShowAnalysisDrawer] = useState(false);
```

- `false` por defecto → drawer cerrado
- `true` → drawer abierto con `AnimatePresence`
- Se cierra: al tocar overlay, al tocar X, o al generar informe

---

## Responsive breakpoints

| Breakpoint | Layout |
|------------|--------|
| `≥1024px` (lg) | Split resizable 50/50. Sin mini-bar, sin drawer. |
| `<1024px` | Chat fullscreen. Mini-bar visible. Drawer desde abajo. |

---

## Cómo revertir a esta versión

Si el layout se modifica y quieres volver a v2:

1. Reemplazar `LiveContainer.tsx` con el contenido de este doc
2. Reemplazar `ChatPanel.tsx` con el contenido de este doc
3. Los demás componentes (AnalysisPanel, ProgressTracker, etc.) usan los de v1

---

## Decisiones de diseño

- **¿Por qué mini-bar y no tabs?** El usuario quiere ver el diagnóstico sin perder el contexto del chat. El mini-bar da info crítica siempre visible sin ocupar toda la pantalla.
- **¿Por qué drawer desde abajo?** Patrón mobile nativo (iOS/Android). Fácil de cerrar deslizando o tocando overlay. No rompe el flujo del chat.
- **¿Por qué spring y no ease?** Spring se siente más natural en mobile, como una hoja física que rebota.
- **¿Por qué max-h 85dvh?** Deja espacio arriba para que el usuario vea que hay algo detrás (el chat), reforzando que es un overlay temporal.

---

## Notas técnicas

- `AnimatePresence` de Framer Motion requiere que el componente drawer esté montado condicionalmente (no solo con CSS `display`).
- El overlay y el drawer deben estar fuera del flujo normal (`fixed`) para no afectar el layout del chat.
- `z-40` para overlay, `z-50` para drawer — asegura que el drawer esté por encima.
- `dvh` en vez de `vh` para evitar problemas con la barra de navegación móvil.
