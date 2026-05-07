import { createRoot } from 'react-dom/client';
import { ReminderBanner } from './ReminderBanner';
import bannerCss from './banner.css?inline';

const HOST_ID = 'gh-refresh-banner-host';

function mount() {
  if (document.getElementById(HOST_ID)) return;

  const host = document.createElement('div');
  host.id = HOST_ID;
  host.style.all = 'initial';
  host.style.position = 'fixed';
  host.style.top = '0';
  host.style.left = '0';
  host.style.width = '0';
  host.style.height = '0';
  host.style.zIndex = '2147483647';

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
