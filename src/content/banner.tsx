import { createRoot } from 'react-dom/client';
import { ReminderBanner } from './ReminderBanner';
import bannerCss from './banner.css?inline';

const HOST_ID = 'gh-refresh-banner-host';

function mount() {
  if (document.getElementById(HOST_ID)) return;

  const host = document.createElement('div');
  host.id = HOST_ID;
  // Inline `all: initial` would have higher specificity than the `:host { font-family }`
  // rule in banner.css and wipe the GitHub font stack — set font properties inline too.
  host.style.all = 'initial';
  host.style.position = 'fixed';
  host.style.top = '0';
  host.style.left = '0';
  host.style.width = '0';
  host.style.height = '0';
  host.style.zIndex = '2147483647';
  host.style.fontFamily =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"';
  host.style.fontSize = '14px';
  host.style.lineHeight = '20px';
  host.style.color = '#1f2328';

  const target = document.documentElement || document.body;
  target.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = bannerCss;
  shadow.appendChild(style);

  const reactRoot = document.createElement('div');
  shadow.appendChild(reactRoot);

  createRoot(reactRoot).render(<ReminderBanner />);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount, { once: true });
} else {
  mount();
}
