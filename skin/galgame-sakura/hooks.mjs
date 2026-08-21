/**
 * Galgame Sakura skin hooks — the trusted escape hatch of the v2 skin
 * contract (x-org.linxin666.skin-center/v1alpha1).
 *
 * 1. Sakura petal drift: 18 petals falling from the top of the viewport,
 *    each with random position / size / duration / drift, looping forever.
 * 2. Backdrop image: paints the sakura wallpaper behind the shell via an
 *    explicit fixed background layer (the skin-center runtime background
 *    media path is not reliably rendered for user skins in this version,
 *    so the hook paints it directly). The layer sits at z-index -2 with
 *    pointer-events: none and aria-hidden, so nothing under it is blocked.
 *
 * Both are pure decoration. Loading this module executes nothing; apply()
 * owns every DOM write and registers its retraction through ctx.onCleanup.
 */

const SCOPE = 'html[data-dsh-skin="galgame-sakura"]'
const PETAL_COUNT = 18

/** Resolve the same-origin asset URL for this skin's backdrop image. */
function assetUrl(ctx, name) {
  const base = ctx.assetBase.replace(/\/+$/, '')
  return `${base}/assets/${name}`
}

/** Petal styles + fall animation, scoped under the skin's own selector. */
const PETAL_CSS = `
${SCOPE} .gal-petal-layer {
  position: fixed; inset: 0; overflow: hidden;
  pointer-events: none; z-index: 9999;
}
${SCOPE} .gal-petal {
  position: absolute; top: -40px; display: block;
  background: linear-gradient(135deg, rgba(255,196,210,.85), rgba(240,158,180,.7));
  border-radius: 150% 0 150% 0;
  opacity: .7;
  box-shadow: 0 0 5px rgba(240,158,180,.3);
  animation: gal-fall linear infinite;
}
${SCOPE} body[data-ds-dark-theme] .gal-petal {
  background: linear-gradient(135deg, rgba(245,160,184,.45), rgba(214,110,150,.3));
}
@keyframes gal-fall {
  0%   { transform: translate3d(0, -40px, 0) rotate(0deg); }
  100% { transform: translate3d(var(--gal-drift, 0px), calc(100vh + 40px), 0) rotate(320deg); }
}
`

export default function defineSkinHooks() {
  return {
    apply(ctx) {
      // 1. Backdrop image layer (painted by the hook, independent of the
      //    skin-center runtime background media path).
      const backdrop = document.createElement('div')
      backdrop.className = 'gal-backdrop'
      backdrop.setAttribute('aria-hidden', 'true')
      Object.assign(backdrop.style, {
        position: 'fixed',
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
        zIndex: '-2',
        pointerEvents: 'none',
        backgroundImage: `url("${assetUrl(ctx, 'sakura-bg.jpg')}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      })
      document.body.append(backdrop)

      // 2. Petal styles.
      const style = document.createElement('style')
      style.setAttribute('data-dsh-skin-petals', '')
      style.textContent = PETAL_CSS
      document.head.append(style)

      // 3. Petal layer inside the fixed 'ambient' decoration layer.
      const layer = document.createElement('div')
      layer.className = 'gal-petal-layer'
      for (let i = 0; i < PETAL_COUNT; i++) {
        const petal = document.createElement('span')
        petal.className = 'gal-petal'
        petal.style.left = `${Math.random() * 100}%`
        petal.style.width = `${8 + Math.random() * 10}px`
        petal.style.height = `${8 + Math.random() * 10}px`
        petal.style.animationDelay = `${Math.random() * 14}s`
        petal.style.animationDuration = `${9 + Math.random() * 9}s`
        petal.style.setProperty('--gal-drift', `${(Math.random() - 0.5) * 140}px`)
        layer.append(petal)
      }
      ctx.layers.ambient.append(layer)

      ctx.onCleanup(() => {
        backdrop.remove()
        style.remove()
        layer.remove()
      })
    },
  }
}
