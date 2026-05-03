# Vanguardistas `/live` Layout — Versión 1.0

> Estado guardado: 2025-05-02  
> Layout actual con paneles flotantes redondeados, chat alineado por rol, y estilo laboratorio creativo.

---

## 1. Estructura de archivos

```
app/live/
├── LiveContainer.tsx          # Layout principal, split resizable + tabs mobile
├── page.tsx                   # Entry point, renderiza LiveContainer
├── components/
│   ├── AnalysisPanel.tsx      # Panel izquierdo — diagnóstico
│   ├── ChatPanel.tsx          # Panel derecho — chat con burbujas
│   ├── ProgressTracker.tsx    # Barra de etapas horizontal
│   ├── ScoreMeter.tsx         # Score grande centrado
│   ├── InsightCards.tsx       # Tarjetas de hallazgos por categoría
│   └── BuyerPersonaBadge.tsx  # Badge de perfil detectado
├── hooks/
│   ├── useChatStream.ts       # Streaming del chat (AI SDK)
│   └── useLiveAnalysis.ts     # Análisis en tiempo real de mensajes
├── data/
│   └── bancoPreguntas.ts      # Banco de preguntas + scoring
```

---

## 2. Layout Desktop (≥1024px)

### Comportamiento
- **Split 50/50 por defecto**, arrastrable entre 30% y 70%
- Paneles flotantes con `gap-4` entre ellos
- **Padding alrededor**: `p-5` en desktop
- Fondo: `mesh-gradient-bg-v2` (gradientes animados morado/rosa/turquesa)

### Container
```tsx
<div className="h-[calc(100dvh-5rem)] mt-20 flex mesh-gradient-bg-v2 relative p-3 sm:p-4 lg:p-5">
```

### Panel de Análisis (izquierda)
- `rounded-[32px]`
- `bg-[#0B0B16]/80 backdrop-blur-sm`
- Ancho: `style={{ width: `${split}%` }}`
- **Sin border-r**, paneles separados por gap

### Panel de Chat (derecha)
- `rounded-[32px]`
- `bg-[#0B0B16]/80 backdrop-blur-sm`
- Ancho: `style={{ width: `${100 - split}%` }}`

### Resizer
- Handle flotante centrado en el gap
- `rounded-full`
- Se ensancha al hover (`w-4 → w-6`)
- Cursor `col-resize` al arrastrar
- Límites: 30%–70%

---

## 3. Layout Mobile (<1024px)

### Comportamiento
- Tabs arriba, panel único abajo
- Chat es el panel activo por defecto
- Tabs redondeados (`rounded-2xl`) con fondo activo

### Tab Bar
```tsx
<div className="flex items-center mb-3 shrink-0">
  <button className="flex-1 ... rounded-2xl ...">
    <MessageSquare /> Chat
  </button>
  <button className="flex-1 ... rounded-2xl ...">
    <BarChart3 /> Análisis
  </button>
</div>
```

### Panel activo
- `rounded-[32px]`
- `bg-[#0B0B16]/80 backdrop-blur-sm`
- Ocupa todo el espacio restante

---

## 4. Paleta de colores

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-background` | `#090A12` | Fondo base |
| `--color-card` | `#0B0B16` | Fondo de paneles/cards |
| `--color-violet` | `#7A2CFF` | Acento primario, progreso completado |
| `--color-pink-accent` | `#FF3CAC` | Acento secundario, etapa activa |
| `--color-cyan` | `#00E0FF` | Online dot, input focus |
| `--color-lavender` | `#E8E4F5` | Labels, texto muted |

---

## 5. Componentes detallados

### AnalysisPanel.tsx

**Header**
- Icono `ScanEye` violeta
- Título: "Diagnóstico en vivo"
- Subtítulo dinámico: "Detectando fugas..." / "Esperando primer señal..."

**Secciones (orden)**
1. **Progreso** — label "Fase del diagnóstico" + ProgressTracker
2. **Score** — label "Puntuación de madurez" + ScoreMeter
3. **Hallazgos** — label "Hallazgos detectados" + InsightCards
4. **Perfil** — label "Perfil identificado" + BuyerPersonaBadge
5. **Datos capturados** — grid nombre/empresa/email (condicional)
6. **Botón informe** — `gradient-btn` morado→rosa, aparece a progreso ≥7
7. **Preview informe** — `gradient-border-card` con resumen

**Separadores**
```html
<div class="h-px bg-white/[0.04] rounded-full" />
```

**Footer**
- Izquierda: "Escaneando..." / "Sistema activo"
- Derecha: "{progreso} de 10 señales"

### ChatPanel.tsx

**Header**
- Avatar Qubra: `/img/qubra.png` en círculo 40px con `avatar-pulse-ring`
- Dot online turquesa `#00E0FF` con `online-dot`
- Nombre: "Qubra", status: "En línea" / "Escribiendo..."
- Lado derecho: dot + "Activo"

**Welcome (sin mensajes)**
- Alineado a la izquierda, max-width 75–85%
- Avatar + label "Qubra" arriba
- Texto grande con `qubra-message-border`
- Subtítulo descriptivo debajo

**Mensajes**
| Rol | Alineación | Burbuja | Border |
|-----|-----------|---------|--------|
| Usuario | `justify-end` | `bg-white/[0.06] rounded-2xl rounded-tr-sm` | Ninguno |
| Qubra | `justify-start` | `bg-white/[0.02] rounded-2xl rounded-tl-sm` | `qubra-message-border` (gradiente vertical morado→rosa) |

- Max-width: 85% mobile, 75% desktop
- Label + avatar arriba de cada burbuja
- Avatar: mini `/img/qubra.png` 16px solo en mensajes Qubra

**Typing indicator**
- 3 dots: violeta, rosa, turquesa (cada uno con delay de pulse)
- Alineado a la izquierda con burbuja Qubra

**Input**
- Caja redondeada: `bg-white/[0.03] rounded-2xl px-4 py-3`
- Textarea sin border interno
- Botón send (icono) a la derecha, color turquesa en hover

### ProgressTracker.tsx

- Track horizontal con 4 pasos
- Track completado: gradiente `morado → rosa → turquesa`
- Dots:
  - Completado: `bg-[#7A2CFF] border-[#7A2CFF]`
  - Activo: anillo rosa `border-[#FF3CAC]` + dot interior + `dot-glow`
  - Futuro: `border-white/20`
- Labels debajo de cada dot, color según estado

### ScoreMeter.tsx

- Número grande (text-5xl) con `glow-text` (sombra violeta)
- Subtítulo: "de {maxScore} puntos"
- Barra fina abajo con gradiente morado→rosa, animada
- Labels extremos: "En desarrollo" / "Avanzado"

### InsightCards.tsx

- Cards con fondo `#0B0B16`
- Bordes redondeados: `rounded-[20px]`
- Borde neón por categoría:
  - Marketing → `border-neon-marketing` (rosa)
  - Procesos → `border-neon-procesos` (turquesa)
  - Tecnología → `border-neon-tecnologia` (morado)
- Icono con color de categoría + título + descripción

### BuyerPersonaBadge.tsx

- Estado vacío: texto placeholder
- Detectado: badge `rounded-full` con borde violeta sutil + dot con glow

---

## 6. CSS Utilities clave (globals.css)

```css
.mesh-gradient-bg-v2       /* Fondo animado con 4 radiales */
.gradient-btn              /* Botón morado→rosa con glow hover */
.gradient-border-card      /* Card con borde degradado real (24px radius) */
.glow-text                 /* Sombra violeta en texto */
.avatar-pulse-ring         /* Ring pulsante alrededor de avatar */
.dot-glow                  /* Glow pulsante en dots */
.qubra-message-border      /* Border-left gradiente vertical */
.border-neon-marketing     /* Borde rosa + glow sutil */
.border-neon-procesos      /* Borde turquesa + glow sutil */
.border-neon-tecnologia    /* Borde morado + glow sutil */
.online-dot                /* Dot turquesa con blink */
```

---

## 7. Responsive breakpoints

| Breakpoint | Layout |
|------------|--------|
| `≥1024px` (lg) | Split 50/50 resizable, ambos paneles visibles |
| `<1024px` | Tabs: Chat / Análisis, un panel a la vez |
| Paddings | `px-6` mobile → `px-8` lg → `px-10` xl |

---

## 8. Cómo revertir a este layout

Si el layout se modifica y quieres volver a esta versión:

1. Reemplazar `LiveContainer.tsx` con el contenido de este doc
2. Reemplazar `ChatPanel.tsx` con el contenido de este doc
3. Reemplazar `AnalysisPanel.tsx` con el contenido de este doc
4. Verificar que `globals.css` incluya las utilities listadas arriba
5. Verificar que `ProgressTracker.tsx`, `ScoreMeter.tsx`, `InsightCards.tsx`, `BuyerPersonaBadge.tsx` estén intactos

---

## 9. Notas de diseño

- **Estilo**: Laboratorio creativo — oscuro + neón + estratégico + futurista
- **Sin bordes rectos**: Todo usa curvas generosas (`rounded-[20px]`, `rounded-[24px]`, `rounded-[32px]`, `rounded-full`)
- **Sin líneas duras**: Separadores son `h-px bg-white/[0.04] rounded-full`
- **Paneles flotan** sobre fondo animado con gap entre ellos
- **Tipografía**: Labels en `text-[10px] uppercase tracking-[0.2em]` color `#E8E4F5]/40`
- **Copy Qubra**: Directo, desafiante, estratégico — "Detectando fugas", "Escaneando estrategia"
