document.addEventListener('DOMContentLoaded', () => {
  // ── Mobile nav ──────────────────────────────────────────────
  const tog = document.querySelector('.nav-toggle');
  const ul  = document.querySelector('.nav-links');
  if (tog && ul) {
    tog.addEventListener('click', e => {
      e.stopPropagation();
      ul.classList.toggle('open');
    });
    document.addEventListener('click', () => ul.classList.remove('open'));
  }

  // ── Tabs ────────────────────────────────────────────────────
  document.querySelectorAll('[data-tabs]').forEach(wrap => {
    const g = wrap.dataset.tabs;
    wrap.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll(`.tab-btn[data-group="${g}"]`).forEach(b => b.classList.remove('active'));
        document.querySelectorAll(`.tab-panel[data-group="${g}"]`).forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.querySelector(`.tab-panel[data-group="${g}"][data-tab="${btn.dataset.tab}"]`)?.classList.add('active');
      });
    });
  });

  // ── Render move notation ─────────────────────────────────────
  document.querySelectorAll('[data-algo]').forEach(el => {
    el.innerHTML = el.dataset.algo.trim().split(/\s+/).map(m => {
      let c = 'move';
      if (m.includes("'")) c += ' prime';
      else if (/\d/.test(m)) c += ' double';
      if (/^[xyz]/.test(m)) c += ' rotation';
      return `<span class="${c}">${m}</span>`;
    }).join('');
  });

  // ── Sidebar active scroll spy ────────────────────────────────
  const sideLinks = [...document.querySelectorAll('.sidebar-nav a[href^="#"]')];
  if (sideLinks.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          sideLinks.forEach(l => l.classList.remove('active'));
          const a = document.querySelector(`.sidebar-nav a[href="#${e.target.id}"]`);
          if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-15% 0px -70% 0px' });
    sideLinks.forEach(l => {
      const el = document.getElementById(l.getAttribute('href').slice(1));
      if (el) obs.observe(el);
    });
  }

  // ── Copy algorithm on click ──────────────────────────────────
  document.querySelectorAll('.algo-box').forEach(box => {
    const movesEl = box.querySelector('.algo-moves');
    if (!movesEl) return;
    box.style.cursor = 'pointer';
    box.title = 'Klicka för att kopiera algoritmen';
    box.addEventListener('click', () => {
      const text = movesEl.dataset.algo || [...movesEl.querySelectorAll('.move')].map(s => s.textContent).join(' ');
      navigator.clipboard.writeText(text).then(() => {
        const lbl = box.querySelector('.algo-lbl');
        if (!lbl) return;
        const orig = lbl.textContent;
        lbl.textContent = '✓ Kopierad!';
        setTimeout(() => lbl.textContent = orig, 1500);
      }).catch(() => {});
    });
  });
});
