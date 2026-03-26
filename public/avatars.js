/* ═══════════════════════════════════════
   AVATAR — стандартная иконка пользователя
   Используется как placeholder когда камера выключена
═══════════════════════════════════════ */
window.AVATARS = {
    default: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="uav">
      <circle cx="30" cy="30" r="29.5"/>
    </clipPath>
  </defs>
  <circle cx="30" cy="30" r="30" fill="#3d4559"/>
  <g clip-path="url(#uav)" fill="#8896ad">
    <circle cx="30" cy="22" r="10"/>
    <ellipse cx="30" cy="55" rx="22" ry="15"/>
  </g>
</svg>`
};

window.AVATAR_LABELS = { default: "" };
