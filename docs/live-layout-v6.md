# Vanguardistas `/live` Layout — Versión 6.0 (Drawer + Bubble)

> Estado guardado: 2025-05-02  
> Desktop igual que v1-v5. Mobile: drawer desde abajo + burbuja circular flotante.

---

## Cambios desde v5

### Desktop (`≥1024px`)
Sin cambios. Split resizable 50/50, paneles flotantes `rounded-[32px]`.

### Mobile (`<1024px`)
**Antes (v5):** Stacked scroll vertical, análisis arriba / chat abajo.  
**Ahora (v6):** Chat a pantalla completa + **burbuja flotante** + **drawer desde abajo**.

---

## Mobile: Burbuja Flotante

### Diseño
```
    ┌─────────────┐
   ╱               ╲
  │    [avatar]     │  ← círculo 56px
  │                 │
   ╲   [score] 3   ╱   ← badge gradiente morado→rosa
    └─────────────┘
         ↑
    ring violeta pulsante (animate-pulse)
```

### Posición
- `fixed bottom-5 right-5 z-40`

### Estilo
- Círculo perfecto: `w-14 h-14 rounded-full`
- Fondo: `bg-[#0B0B16]/90 backdrop-blur-md`
- Borde: `border-white/[0.1]`
- Shadow: `shadow-lg shadow-black/50`
- **Ring pulsante**: borde `border-[#7A2CFF]/30` con `animate-pulse`

### Contenido
- **Avatar**: `/img/qubra.png` en círculo 40px centrado
- **Badge de score**: esquina superior derecha, `min-w-[22px] h-[22px] rounded-full`
  - Gradient: `from-[#7A2CFF] to-[#FF3CAC]`
  - Texto: `text-[10px] font-bold text-white`
  - Muestra: score actual (ej: "6")

### Animación
```tsx
<motion.button
  initial={{ opacity: 0, scale: 0.6, y: 20 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.6, y: 20 }}
  transition={{ type: "spring", damping: 18, stiffness: 300 }}
/>
```
- Spring más "bouncy" que el FAB anterior (damping: 18 vs 20)
- Scale desde 0.6 para efecto de "pop"

---

## Mobile: Bottom Sheet (Drawer)

Igual que v4, con 4 estados:

| Estado | Altura | Qué se ve |
|--------|--------|-----------|
| **Hidden** | `0px` (fuera de pantalla) | Nada — burbuja visible |
| **Collapsed** | `80px` | Handle bar + avatar + score + etapa |
| **Half** | `50dvh` | Progreso + Score + Hallazgos |
| **Full** | `85dvh` | Todo el `AnalysisPanel` con scroll |

### Header del drawer
- **Handle bar**: clickeable, cycle entre estados
- **Botón X**: cierra a `hidden`

---

## Componente: `AnalysisSheet.tsx`

### Burbuja
```tsx
<AnimatePresence>
  {showBubble && (
    <motion.button
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.6, y: 20 }}
      transition={{ type: "spring", damping: 18, stiffness: 300 }}
      onClick={openSheet}
      className="fixed bottom-5 right-5 z-40"
    >
      <div className="relative w-14 h-14 rounded-full ...">
        {/* Ring pulsante */}
        <div className="absolute inset-0 rounded-full border border-[#7A2CFF]/30 animate-pulse" />
        
        {/* Avatar */}
        <img src="/img/qubra.png" className="w-10 h-10 rounded-full object-cover" />
        
        {/* Score badge */}
        <div className="absolute -top-1 -right-1 ... bg-gradient-to-br from-[#7A2CFF] to-[#FF3CAC]">
          <span className="text-[10px] font-bold text-white">{score}</span>
        </div>
      </div>
    </motion.button>
  )}
</AnimatePresence>
```

### Drawer
Igual que v4. Ver `docs/live-layout-v4.md` para detalles completos del drawer.

---

## Layout Mobile en `LiveContainer.tsx`

```tsx
<div className="lg:hidden relative w-full h-full rounded-[32px] ...">
  <ChatPanel ... />
  <AnalysisSheet ... />
</div>
```

---

## `ChatPanel.tsx`

### Spacer extra para mobile
```tsx
{/* Bottom spacer for scroll */}
<div className="h-6 lg:h-6" />
{/* Extra spacer on mobile for bubble */}
<div className="h-20 lg:hidden" />
```

### Input con padding extra
```tsx
<div className="... shrink-0 pb-8 lg:pb-4 sm:pb-5">
```

**Razón**: La burbuja es circular y más grande que el FAB anterior (56px vs ~40px de alto). El spacer de `h-20` asegura que el último mensaje siempre scrollee por encima del área de la burbuja.

---

## Comparativa: FAB vs Bubble

| Aspecto | v4 (FAB) | v6 (Bubble) |
|---------|----------|-------------|
| **Forma** | Pill redondeada (`rounded-full px-3.5`) | Círculo perfecto (`w-14 h-14`) |
| **Tamaño** | ~120x40px | 56x56px |
| **Avatar** | Mini (24px) a la izquierda | Grande (40px) centrado |
| **Score** | Inline con texto | Badge esquina sup. derecha |
| **Gradiente** | Solo en score (texto) | Badge con gradiente morado→rosa |
| **Ring** | No | Sí, `animate-pulse` violeta |
| **Shadow** | `shadow-lg shadow-black/40` | `shadow-lg shadow-black/50` |
| **Animación** | Spring scale 0.8 | Spring scale 0.6 (más bouncy) |

---

## Archivos modificados en v6

```
app/live/
├── LiveContainer.tsx              # MOBILE: vuelve a drawer + bubble
├── components/
│   ├── AnalysisSheet.tsx          # Burbuja circular + ring pulsante + badge gradiente
│   ├── ChatPanel.tsx              # Spacer h-20 para bubble, padding pb-8
│   ├── AnalysisPanel.tsx          # Sin cambios
│   ├── ProgressTracker.tsx        # Sin cambios
│   ├── ScoreMeter.tsx             # Sin cambios
│   ├── InsightCards.tsx           # Sin cambios
│   └── BuyerPersonaBadge.tsx      # Sin cambios
```

---

## Flujo de interacción mobile

1. **Usuario entra a `/live`**
   - Chat visible, sheet en `collapsed` (80px)
   - Burbuja no visible (sheet está abierto)

2. **Usuario cierra el sheet con X**
   - Sheet se oculta (`translateY: 100%`)
   - Burbuja aparece con animación spring desde abajo
   - Chat ocupa toda la pantalla

3. **Usuario toca la burbuja**
   - Burbuja desaparece con scale down
   - Sheet abre a `half`
   - Vuelve a ver progreso + score

4. **Usuario expande a `full`**
   - Toca handle bar → sheet 85dvh
   - Puede cerrar con X para volver a burbuja

---

## Decisiones de diseño

- **¿Por qué burbuja y no FAB rectangular?** El usuario pidió explícitamente "una burbuja". Es más amigable visualmente y se diferencia de los botones estándar.
- **¿Por qué ring pulsante?** Atrae la atención sin ser agresivo. Indica que hay algo interactivo ahí.
- **¿Por qué badge de score?** Info crítica siempre visible, incluso sin abrir el drawer.
- **¿Por qué gradiente en el badge?** Refuerza la identidad visual de Vanguardistas (morado→rosa).
- **¿Por qué scale 0.6 en animación?** Hace que la burbuja "aparezca de la nada" con un efecto más juguetón.

---

## Cómo revertir a esta versión

Si el layout se modifica y quieres volver a v6:

1. Reemplazar `LiveContainer.tsx` con el contenido de este doc
2. Reemplazar `ChatPanel.tsx` con el contenido de este doc
3. Crear/reemplazar `components/AnalysisSheet.tsx` con el contenido de este doc
4. Los demás componentes (AnalysisPanel, ProgressTracker, etc.) usan los de versiones anteriores

---

## Historial completo de layouts

| Versión | Archivo | Mobile | Desktop |
|---------|---------|--------|---------|
| v1 | `docs/live-layout-v1.md` | Tabs | Split 50/50 |
| v2 | `docs/live-layout-v2.md` | Mini-bar + drawer | Split 50/50 |
| v3 | `docs/live-layout-v3.md` | Sheet 3 niveles | Split 50/50 |
| v4 | `docs/live-layout-v4.md` | Sheet 4 niveles + FAB | Split 50/50 |
| v5 | `docs/live-layout-v5.md` | Stacked scroll | Split 50/50 |
| **v6** | `docs/live-layout-v6.md` | **Drawer + bubble** | **Split 50/50** |

---

## Posibles iteraciones futuras

- **Badge con color según score**: Rojo (<10), amarillo (10-20), verde (>20).
- **Notificación en burbuja**: Pequeño punto rojo cuando hay nuevos insights.
- **Drag la burbuja**: Permitir arrastrarla a otra posición de la pantalla.
- **Haptic feedback**: Vibración al tocar la burbuja (vía Vibration API).
- **Double-tap bubble**: Abre directamente a `full` en vez de `half`.
