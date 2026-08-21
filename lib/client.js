/**
 * dsh-galgame-ui — Client half (ModuleLoader format).
 *
 * Registers the Galgame Sakura UI enhancements in the web GUI:
 *  - sakura petal drift overlay (shell.overlay, click-through)
 *  - sidebar brand mark (🌸) and brand title (桜の物語 / Galgame Skin)
 *  - hero brand mark on the empty-conversation screen
 *  - turn-tail pager (▼ ー ─ ─ ▼) after each completed assistant turn
 *  - settings panel (设置 → 🌸 Galgame 皮肤)
 *
 * Pure presentation layer: never touches tokens (the 'galgame-sakura'
 * skin-center skin owns colors/backdrop), never writes the session.
 */
window.__ModuleLoader__.load({
  id: '@local/dsh-galgame-ui',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    const React = require('react');

    const apply = (ctx) => {
      const listeners = new Set();
      const state = { petals: 18, speed: 1, intensity: 1, showTail: true, sound: false };
      const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
      const setState = (patch) => { Object.assign(state, patch); listeners.forEach((fn) => fn()); };

      const playBlip = () => {
        try {
          const AC = (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext));
          if (!AC) return;
          const ac = new AC();
          const o = ac.createOscillator();
          const g = ac.createGain();
          o.connect(g); g.connect(ac.destination);
          o.type = 'sine';
          o.frequency.setValueAtTime(880, ac.currentTime);
          o.frequency.exponentialRampToValueAtTime(1320, ac.currentTime + 0.08);
          g.gain.setValueAtTime(0.12, ac.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.14);
          o.start(); o.stop(ac.currentTime + 0.15);
        } catch (e) { /* 静默 */ }
      };

      const css = `
        .gal-brand-mark { display: inline-flex; align-items: center; justify-content: center; line-height: 1; }
        .gal-brand-title { display: flex; flex-direction: column; line-height: 1.15; gap: 2px; }
        .gal-brand-title-main {
          font-size: 16px; font-weight: 700; letter-spacing: .08em;
          background: linear-gradient(90deg, #e79aae, #f2bfcd);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        body[data-ds-dark-theme] .gal-brand-title-main {
          background: linear-gradient(90deg, #f5a0b8, #f8cdd8);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .gal-brand-title-sub { font-size: 10px; color: var(--dsw-alias-label-secondary); letter-spacing: .18em; text-transform: uppercase; }
        .gal-hero-mark { display: inline-block; font-size: 54px; line-height: 1; filter: drop-shadow(0 4px 12px rgba(224,133,159,.3)); }
        .gal-turn-tail { text-align: center; user-select: none; color: var(--dsw-alias-brand-primary); opacity: .5; font-size: 12px; letter-spacing: .3em; padding: 2px 0; }
        .gal-petal-layer { position: fixed; inset: 0; overflow: hidden; pointer-events: none; z-index: 9999; }
        .gal-petal {
          position: absolute; top: -40px; display: block;
          background: linear-gradient(135deg, rgba(255,196,210,.85), rgba(240,158,180,.7));
          border-radius: 150% 0 150% 0; opacity: .7;
          box-shadow: 0 0 5px rgba(240,158,180,.3); animation: gal-fall linear infinite;
        }
        body[data-ds-dark-theme] .gal-petal { background: linear-gradient(135deg, rgba(245,160,184,.45), rgba(214,110,150,.3)); }
        @keyframes gal-fall {
          0% { transform: translate3d(0, -40px, 0) rotate(0deg); }
          100% { transform: translate3d(var(--gal-drift, 0px), calc(100vh + 40px), 0) rotate(320deg); }
        }
        .gal-settings { display: flex; flex-direction: column; gap: 16px; max-width: 460px; padding: 4px 2px; }
        .gal-setting-row { display: flex; flex-direction: column; gap: 6px; }
        .gal-setting-label { display: flex; justify-content: space-between; align-items: baseline; font-size: 13px; color: var(--dsw-alias-label-primary); }
        .gal-setting-hint { font-size: 11px; color: var(--dsw-alias-label-secondary); }
        .gal-settings input[type=range] { width: 100%; accent-color: var(--dsw-alias-brand-primary); }
        .gal-settings input[type=checkbox] { accent-color: var(--dsw-alias-brand-primary); }
        .gal-settings button {
          align-self: flex-start; border: 1px solid var(--dsw-alias-border-l2);
          border-radius: 10px; background: var(--dsw-alias-bg-layer-1);
          color: var(--dsw-alias-label-primary); padding: 5px 12px; font-size: 13px; cursor: pointer;
        }
      `;
      ctx.effect(() => {
        const tagId = 'galgame-ui/styles';
        if (typeof document === 'undefined' || document.querySelector(`style[data-plugin-css="${tagId}"]`)) return;
        const tag = document.createElement('style');
        tag.dataset.plugin = '@local/dsh-galgame-ui';
        tag.dataset.pluginCss = tagId;
        tag.textContent = css;
        document.head.appendChild(tag);
        return () => tag.remove();
      });

      function Petals() {
        const [, force] = React.useState(0);
        React.useEffect(() => subscribe(() => force((x) => x + 1)), []);
        const count = Math.max(0, Math.min(60, Math.round(state.petals)));
        const petals = React.useMemo(() => Array.from({ length: count }, (_, i) => ({
          key: i, left: Math.random() * 100, delay: Math.random() * 14,
          duration: (9 + Math.random() * 9) / Math.max(0.2, state.speed),
          size: 8 + Math.random() * 10, drift: (Math.random() - 0.5) * 140,
        })), [count, state.speed]);
        const op = Math.max(0.1, Math.min(1, state.intensity));
        return React.createElement('div', { className: 'gal-petal-layer' },
          petals.map((p) => React.createElement('span', {
            key: p.key, className: 'gal-petal',
            style: {
              left: p.left + '%', width: p.size + 'px', height: p.size + 'px',
              animationDelay: p.delay + 's', animationDuration: p.duration + 's',
              '--gal-drift': p.drift + 'px', opacity: op,
            },
          })));
      }

      function TurnTail() {
        if (!state.showTail) return null;
        return React.createElement('div', { className: 'gal-turn-tail' }, '▼ ー ─ ─ ▼');
      }

      function SkinSettings() {
        const [, force] = React.useState(0);
        React.useEffect(() => subscribe(() => force((x) => x + 1)), []);
        const row = (label, hint, control) => React.createElement('div', { className: 'gal-setting-row' },
          React.createElement('div', { className: 'gal-setting-label' }, label), control,
          React.createElement('div', { className: 'gal-setting-hint' }, hint));
        return React.createElement('div', { className: 'gal-settings' },
          row(React.createElement('span', null, ['🌸 花瓣数量  ', React.createElement('b', null, String(state.petals))]),
            '飘落的樱花数量（0 = 关闭动画）', React.createElement('input', {
              type: 'range', min: 0, max: 60, value: state.petals,
              onChange: (e) => setState({ petals: Number(e.target.value) }),
            })),
          row(React.createElement('span', null, ['飘落速度  ', React.createElement('b', null, state.speed.toFixed(1) + 'x')]),
            '花瓣下落速度倍率', React.createElement('input', {
              type: 'range', min: 0.2, max: 3, step: 0.1, value: state.speed,
              onChange: (e) => setState({ speed: Number(e.target.value) }),
            })),
          row(React.createElement('span', null, ['樱花浓度  ', React.createElement('b', null, Math.round(state.intensity * 100) + '%')]),
            '花瓣不透明度（淡雅到浓烈）', React.createElement('input', {
              type: 'range', min: 0.1, max: 1, step: 0.05, value: state.intensity,
              onChange: (e) => setState({ intensity: Number(e.target.value) }),
            })),
          row(React.createElement('span', null, '回合尾饰「▼」'),
            '在每条回复后显示视觉小说式推进符', React.createElement('input', {
              type: 'checkbox', checked: state.showTail,
              onChange: (e) => setState({ showTail: e.target.checked }),
            })),
          row(React.createElement('span', null, '提示音试听'),
            '浏览器限制：无法在消息发送时自动播放，仅可手动试听',
            React.createElement('button', { type: 'button', onClick: playBlip }, '▶ 试听「嗒」')));
      }

      const slots = ctx.get('slots');
      if (slots !== undefined) {
        ctx.effect(() => slots.inject('shell.overlay', () => slots.register(
          { name: 'shell.overlay', id: 'galgame-petals' },
          () => React.createElement(Petals),
        )));
        ctx.effect(() => slots.inject('sidebar.brand.mark', () => slots.register(
          { name: 'sidebar.brand.mark', id: 'galgame-brand', priority: -10 },
          (props) => React.createElement('span', {
            className: 'gal-brand-mark', style: { fontSize: Math.round((props.size || 24) * 0.8) },
          }, '🌸'),
        )));
        ctx.effect(() => slots.inject('sidebar.brand.name', () => slots.register(
          { name: 'sidebar.brand.name', id: 'galgame-brand-name', priority: -10 },
          () => React.createElement('div', { className: 'gal-brand-title' },
            React.createElement('div', { className: 'gal-brand-title-main' }, '桜の物語'),
            React.createElement('div', { className: 'gal-brand-title-sub' }, 'Galgame Skin')),
        )));
        ctx.effect(() => slots.inject('conversation.hero.brand.mark', () => slots.register(
          { name: 'conversation.hero.brand.mark', id: 'galgame-hero-mark', priority: -10 },
          () => React.createElement('span', { className: 'gal-hero-mark' }, '🌸'),
        )));
        ctx.effect(() => slots.inject('conversation.chat.turnTail', () => slots.register(
          { name: 'conversation.chat.turnTail', select: (owner) => (owner && owner.turn ? true : null) },
          () => React.createElement(TurnTail),
        )));
        ctx.effect(() => slots.inject('settings.section', () => slots.register(
          { name: 'settings.section', id: 'galgame-skin', order: 125, label: '🌸 Galgame 皮肤' },
          () => React.createElement(SkinSettings),
        )));
      }
    };

    const inject = ['slots'];

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
