/* ===========================================================
   icons.js —— 线性 SVG 图标库（替代原 emoji 图标）
   用法：icon('home','icon') 返回内联 <svg> 字符串
=========================================================== */
'use strict';
const ICONS = {
  home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>',
  book:'<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M20 19H6.5a2.5 2.5 0 0 0 0 5H20"/>',
  chat:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  shield:'<path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z"/><path d="M9 12l2 2 4-4"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
  plane:'<path d="M2 12l20-7-7 20-3-8-8-3z"/><path d="M2 12l8 3"/>',
  id:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="12" r="2"/><path d="M14 10h5M14 14h5"/>',
  seat:'<path d="M6 4v9a2 2 0 0 0 2 2h8"/><path d="M6 4h3"/><path d="M8 19h10v-3a2 2 0 0 0-2-2H8"/><path d="M6 15v4"/>',
  scan:'<path d="M4 8V5a1 1 0 0 1 1-1h3"/><path d="M20 8V5a1 1 0 0 0-1-1h-3"/><path d="M4 16v3a1 1 0 0 0 1 1h3"/><path d="M20 16v3a1 1 0 0 1-1 1h-3"/><path d="M4 12h16"/>',
  talk:'<path d="M8 12h.01M12 12h.01M16 12h.01"/><path d="M21 12a8 8 0 1 1-3.6-6.7"/><path d="M21 3l-4 3"/>',
  radio:'<circle cx="12" cy="12" r="2"/><path d="M8.5 8.5a5 5 0 0 0 0 7"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M5.6 5.6a9 9 0 0 0 0 12.8"/><path d="M18.4 5.6a9 9 0 0 1 0 12.8"/>',
  alert:'<path d="M12 2 2 20h20z"/><path d="M12 9v5"/><path d="M12 17h.01"/>',
  handoff:'<path d="M8 12h13"/><path d="M17 7l4 5-4 5"/><path d="M3 6v3a3 3 0 0 0 3 3"/><path d="M3 18v-3a3 3 0 0 1 3-3"/>',
  medical:'<path d="M12 7v10M7 12h10"/><rect x="3" y="3" width="18" height="18" rx="3"/>',
  heart:'<path d="M12 21s-7.5-4.6-10-9.3C.4 8 2 4.5 5.6 4a5 5 0 0 1 6.4 2.3A5 5 0 0 1 18.4 4C22 4.5 23.6 8 22 11.7 19.5 16.4 12 21 12 21z"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/>',
  hotel:'<path d="M3 21V6a2 2 0 0 1 2-2h4v17"/><path d="M13 21V10a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v11"/><path d="M9 8h0M9 12h0M9 16h0"/><path d="M3 21h18"/>',
  play:'<path d="M6 4l14 8-14 8z"/>',
  speaker:'<path d="M4 9v6h4l6 4V5l-6 4z"/><path d="M17 8a5 5 0 0 1 0 8"/>',
  back:'<path d="M15 18l-6-6 6-6"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  star:'<path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 6.9L12 17.3 5.8 20.8l1.6-6.9L2 9.2l7.1-.6z"/>',
  flame:'<path d="M12 2s5 4.5 5 9.5A5 5 0 0 1 7 11.5C7 9 8.5 7.5 8.5 7.5s-.5 3 1.5 3c1 0 1-1 1-2 0-2-1-3-1-3S12 2 12 2z"/><path d="M8.5 14.5a3.5 3.5 0 0 0 7 0c0-1.5-1-2.5-1-2.5s.3 2-1 2-1-1-1-2 1-2 1-2-4 1.5-4 4.5z"/>',
  trophy:'<path d="M8 21h8M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 5H4a3 3 0 0 0 3 5"/><path d="M17 5h3a3 3 0 0 1-3 5"/>',
  bomb:'<circle cx="11" cy="13" r="8"/><path d="M16 7l2-2m0 0l2 1m-2-1l1-2"/>',
  badge:'<circle cx="12" cy="8" r="5"/><path d="M9 13l-2 8 5-3 5 3-2-8"/>',
  robot:'<rect x="4" y="8" width="16" height="12" rx="2"/><circle cx="9" cy="14" r="1.5"/><circle cx="15" cy="14" r="1.5"/><path d="M12 8V4"/><circle cx="12" cy="3" r="1"/>',
  drama:'<circle cx="9" cy="10" r="5"/><circle cx="15" cy="14" r="5"/><path d="M7 9h.01M11 9h.01M13 15h.01M17 15h.01"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  luggage:'<rect x="4" y="7" width="16" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M9 12v4M15 12v4"/>',
  passport:'<rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="9" r="2.5"/><path d="M9 15h6M9 18h6"/>',
  weather:'<path d="M17 17a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1.5A4.5 4.5 0 0 0 7 17z"/>',
  bank:'<path d="M3 10l9-6 9 6"/><path d="M5 10v9M10 10v9M14 10v9M19 10v9"/><path d="M3 21h18"/>',
  wifi:'<path d="M5 13a11 11 0 0 1 14 0"/><path d="M8.5 16.5a6 6 0 0 1 7 0"/><path d="M12 20h.01"/>',
  gavel:'<path d="M13 5l6 6-3 3-6-6z"/><path d="M4 21l7-7"/><path d="M12 15l3-3"/>',
  compass:'<circle cx="12" cy="12" r="9"/><path d="M15 9l-2 6-6 2 2-6z"/>'
};
function icon(name, cls){
  const p = ICONS[name] || ICONS.star;
  return '<svg class="'+(cls||'icon')+'" viewBox="0 0 24 24">'+p+'</svg>';
}
