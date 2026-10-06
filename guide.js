(function () {
  'use strict';
  const C = window.WorkshopContent;

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // Some app views and QR-scanner browsers refuse the Clipboard API. Then select the
  // prompt so the reader can copy it with the system menu.
  function copy(text, promptEl, btn) {
    const done = (ok) => {
      if (!ok) {
        const range = document.createRange();
        range.selectNodeContents(promptEl);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
      btn.textContent = ok ? 'تم النسخ ✓' : 'حدّدنا الأمر، انسخه يدوياً';
      setTimeout(() => { btn.textContent = 'انسخ الأمر'; }, 2500);
    };
    // Hidden-textarea copy works in most in-app browsers that refuse the Clipboard API.
    const legacyCopy = () => {
      const ta = el('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.append(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      return ok;
    };
    try {
      navigator.clipboard.writeText(text).then(() => done(true), () => done(legacyCopy()));
    } catch (e) {
      done(legacyCopy());
    }
  }

  const threads = document.querySelector('[data-threads]');
  for (const t of C.THREADS) {
    const card = el('div', 'thread thread--' + t.id);
    card.append(el('h3', null, t.name), el('p', null, t.question));
    threads.append(card);
  }

  function card(p, i) {
    const box = el('article', 'card');
    const tools = el('div', 'tools');
    for (const id of p.tools) {
      const a = el('a', null, C.TOOLS[id].name);
      a.href = C.TOOLS[id].url;
      a.target = '_blank';
      a.rel = 'noopener';
      tools.append(a);
    }
    const prompt = el('div', 'prompt');
    C.renderPromptInto(prompt, p.segments);
    const btn = el('button', 'copy', 'انسخ الأمر');
    btn.type = 'button';
    btn.id = 'copy-' + p.id;
    btn.addEventListener('click', () => copy(C.promptText(p.segments), prompt, btn));
    box.append(el('h3', null, (i + 1) + '. ' + p.title), el('p', 'problem', p.problem), tools, prompt, btn, el('p', 'tip', p.tip));
    return box;
  }

  const groups = document.querySelector('[data-prompt-groups]');
  for (const g of C.GROUPS) {
    const section = el('section');
    const h = el('h2', null, g.title);
    h.id = 'group-' + g.id;
    section.setAttribute('aria-labelledby', h.id);
    const cards = el('div', 'cards');
    C.PROMPTS.filter((p) => p.group === g.id).forEach((p, i) => cards.append(card(p, i)));
    section.append(h, cards);
    groups.append(section);
  }

  const rules = document.querySelector('[data-rules]');
  for (const r of C.OWNERSHIP_RULES) {
    const card = el('div', 'rule');
    card.append(el('h3', null, r.title), el('p', null, r.text));
    rules.append(card);
  }
})();
