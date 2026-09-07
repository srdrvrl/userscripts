// ==UserScript==
// @name         Paste Clipboard as File (Claude + Gemini)
// @name:tr      Panoyu Dosya Olarak Yapıştır (Claude + Gemini)
// @namespace    https://serdarvural.dev/userscripts
// @version      3.1.0
// @description  Attach the clipboard text to Claude or Gemini as a .txt file with one click (or Alt+Shift+V), instead of pasting a wall of text into the prompt box.
// @description:tr Panodaki metni tek tıkla (veya Alt+Shift+V ile) .txt dosyası olarak Claude ve Gemini sohbet kutusuna ekler; uzun metni prompt kutusuna yapıştırmak zorunda kalmazsınız.
// @author       Serdar Vural
// @homepageURL  https://serdarvural.dev
// @license      MIT
// @icon         data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2024%2024%27%3E%3Crect%20width%3D%2724%27%20height%3D%2724%27%20rx%3D%275%27%20fill%3D%27%231e8e3e%27/%3E%3Cpath%20d%3D%27M8%205.5h5.2L17%209.3V18a1.2%201.2%200%200%201-1.2%201.2H8A1.2%201.2%200%200%201%206.8%2018V6.7A1.2%201.2%200%200%201%208%205.5z%27%20fill%3D%27%23fff%27/%3E%3Cpath%20d%3D%27M9.2%2012h5.4M9.2%2014.4h5.4M9.2%2016.8h3.2%27%20stroke%3D%27%231e8e3e%27%20stroke-width%3D%271.2%27%20stroke-linecap%3D%27round%27/%3E%3C/svg%3E
// @match        *://claude.ai/*
// @match        *://gemini.google.com/*
// @grant        none
// @run-at       document-idle
// @noframes
// ==/UserScript==

/*
 * Paste Clipboard as File — https://serdarvural.dev
 * MIT License. Copyright (c) 2025 Serdar Vural.
 */

(function () {
  'use strict';

  // ------------------------------------------------------------------
  // i18n
  // ------------------------------------------------------------------
  const STRINGS = {
    en: {
      label: '📄 Paste as file',
      tooltip: 'Attach clipboard text as a .txt file (Alt+Shift+V). Shift+click: use the drop method.',
      noEditor: 'Chat input not found.',
      denied: 'Clipboard access denied. Allow clipboard permission for this site.',
      unreadable: 'Could not read the clipboard.',
      empty: 'Clipboard is empty.',
      attached: 'Attached as a file.',
      attachedDrop: 'Attached as a file (drop method).',
      failed: 'Could not attach the file. Try dragging a .txt file instead.',
      busy: 'Still working on the previous attachment…',
    },
    tr: {
      label: '📄 Dosya Yapıştır',
      tooltip: 'Panodaki metni .txt dosyası olarak ekle (Alt+Shift+V). Shift+tık: drop yöntemi.',
      noEditor: 'Sohbet kutusu bulunamadı.',
      denied: 'Pano erişimi reddedildi. Site izinlerinden panoya izin verin.',
      unreadable: 'Pano okunamadı.',
      empty: 'Pano boş.',
      attached: 'Dosya olarak eklendi.',
      attachedDrop: 'Dosya olarak eklendi (drop yöntemi).',
      failed: 'Dosya eklenemedi. Bir .txt dosyasını elle sürükleyip bırakmayı deneyin.',
      busy: 'Önceki ekleme henüz sürüyor…',
    },
  };
  const T = STRINGS[(navigator.language || 'en').toLowerCase().startsWith('tr') ? 'tr' : 'en'];

  // ------------------------------------------------------------------
  // Ayarlar
  // ------------------------------------------------------------------
  const BUTTON_ID = 'paste-as-file-btn';
  const SHORTCUT = { altKey: true, shiftKey: true, key: 'v' }; // Alt+Shift+V
  const ATTACH_POLL_MS = 100;    // "dosya kartı geldi mi" kontrol aralığı
  const ATTACH_TIMEOUT_MS = 3000; // bu süre içinde gelmezse diğer yöntem denenir
  const SWEEP_MS = 2000;         // MutationObserver'ın kaçırdığı SPA render'ları için emniyet taraması

  // ------------------------------------------------------------------
  // Site tanımları
  //   findEditor()     : odaklanıp paste gönderilecek metin alanı
  //   findSlot()       : butonun yerleşeceği yer ({ parent, before }) veya null
  //   findDropTarget() : paste çalışmazsa drop olayının gönderileceği eleman
  //   inputArea()      : "dosya eklendi mi" kontrolü için gözlemlenecek bölge
  //
  // findSlot her zaman var olan bir çıpaya bağlanmalı. Gönder butonu gibi
  // yalnızca metin yazılınca beliren elemanlara bağlanırsa buton hem boş
  // kutuda kaybolur hem de yazmaya başlayınca yer değiştirir.
  // ------------------------------------------------------------------
  const SITES = {
    'claude.ai': {
      name: 'Claude',
      findEditor: () =>
        document.querySelector('.tiptap.ProseMirror') ||
        document.querySelector('div.ProseMirror[contenteditable="true"]') ||
        document.querySelector('div[contenteditable="true"][role="textbox"]'),
      findSlot: (editor) => {
        const scope = (editor && editor.closest('fieldset, form')) || document;

        // 1) Ek dosya / "+" menüsü — metin girilsin girilmesin hep durur
        const anchor =
          scope.querySelector('[data-testid="input-menu-plus"]') ||
          scope.querySelector('button[aria-label*="attach" i]') ||
          scope.querySelector('button[aria-label*="upload" i]') ||
          scope.querySelector('input[type="file"] ~ button');
        if (anchor && anchor.parentElement) {
          return { parent: anchor.parentElement, before: anchor.nextElementSibling };
        }

        // 2) Model seçici de kalıcı bir çıpa
        const model = scope.querySelector('[data-testid="model-selector-dropdown"]');
        if (model && model.parentElement) {
          return { parent: model.parentElement, before: model };
        }

        return null; // yüzen buton devreye girer
      },
      findDropTarget: (editor) => (editor && editor.closest('fieldset')) || editor,
      inputArea: (editor) => (editor && editor.closest('fieldset, form')) || document.body,
    },

    'gemini.google.com': {
      name: 'Gemini',
      findEditor: () =>
        document.querySelector('div.ql-editor[role="textbox"]') ||
        document.querySelector('rich-textarea div[contenteditable="true"]'),
      findSlot: () => {
        // Yeni arayüz: model seçici + mikrofonun olduğu sağ blok
        const trailing = document.querySelector('.trailing-actions-wrapper');
        if (trailing) return { parent: trailing, before: trailing.firstElementChild };
        // Alternatif: soldaki "+" menüsünün yanı
        const leading = document.querySelector('.leading-actions-wrapper');
        if (leading) return { parent: leading, before: null };
        // Eski arayüz
        const old = document.querySelector('.input-area-container .send-button-container');
        if (old) return { parent: old, before: old.firstElementChild };
        return null;
      },
      findDropTarget: (editor) =>
        document.querySelector('[xapfileselectordropzone]') ||
        (editor && editor.closest('.text-input-field')) ||
        editor,
      inputArea: (editor) =>
        (editor && editor.closest('.text-input-field')) ||
        document.querySelector('.input-area-container') ||
        document.body,
    },
  };

  const SITE = SITES[location.hostname];
  if (!SITE) return;

  // ------------------------------------------------------------------
  // Yardımcılar
  // ------------------------------------------------------------------
  // Eleman DOM'da ve gerçekten çizilmiş mi? Gizli veya 0 boyutlu bir kaba
  // buton koymak, butonun "kaybolmuş" görünmesinin en yaygın sebebi.
  function isVisible(el) {
    if (!el || !el.isConnected) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function notify(message, type = 'info') {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
      background: type === 'error' ? '#d93025' : '#1e8e3e', color: '#fff',
      padding: '10px 18px', borderRadius: '8px', zIndex: '2147483647',
      boxShadow: '0 4px 12px rgba(0,0,0,.2)', fontSize: '14px',
      fontFamily: 'system-ui, sans-serif', pointerEvents: 'none',
      transition: 'opacity .3s', opacity: '1',
    });
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; }, 2500);
    setTimeout(() => el.remove(), 3000);
  }

  // ------------------------------------------------------------------
  // Dosya oluşturma ve gönderme
  // ------------------------------------------------------------------
  function makeFileName() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `clipboard_${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}.txt`;
  }

  function buildTransfer(text) {
    const file = new File([text], makeFileName(), { type: 'text/plain' });
    const dt = new DataTransfer();
    dt.items.add(file);
    return dt;
  }

  function dispatchPaste(target, dt) {
    target.dispatchEvent(new ClipboardEvent('paste', {
      clipboardData: dt, bubbles: true, cancelable: true,
    }));
  }

  function dispatchDrop(target, dt) {
    for (const type of ['dragenter', 'dragover', 'drop']) {
      target.dispatchEvent(new DragEvent(type, {
        dataTransfer: dt, bubbles: true, cancelable: true,
      }));
    }
  }

  // Arayüz dosya kartını DOM'a ekleyene kadar bekler. Sabit bir gecikme yerine
  // yoklama yapıyoruz: yavaş makinede 800 ms yetmiyor ve hem paste hem drop
  // tetiklenip dosya iki kez ekleniyordu.
  function waitForAttachment(area, countBefore) {
    return new Promise((resolve) => {
      const deadline = Date.now() + ATTACH_TIMEOUT_MS;
      const tick = () => {
        if (area.getElementsByTagName('*').length > countBefore) return resolve(true);
        if (Date.now() >= deadline) return resolve(false);
        setTimeout(tick, ATTACH_POLL_MS);
      };
      setTimeout(tick, ATTACH_POLL_MS);
    });
  }

  let busy = false;

  async function pasteAsFile({ forceDrop = false } = {}) {
    // Kısayola basılı tutmak veya butona üst üste tıklamak iki dosya eklemesin
    if (busy) {
      notify(T.busy, 'error');
      return;
    }

    const editor = SITE.findEditor();
    if (!editor) {
      notify(T.noEditor, 'error');
      return;
    }

    let text;
    try {
      text = await navigator.clipboard.readText();
    } catch (err) {
      notify(err && err.name === 'NotAllowedError' ? T.denied : T.unreadable, 'error');
      console.error('[PasteAsFile] clipboard:', err);
      return;
    }

    if (!text || !text.trim()) {
      notify(T.empty, 'error');
      return;
    }

    const area = SITE.inputArea(editor);
    const countBefore = area.getElementsByTagName('*').length;

    busy = true;
    try {
      editor.focus();

      if (!forceDrop) {
        dispatchPaste(editor, buildTransfer(text));
        if (await waitForAttachment(area, countBefore)) {
          notify(T.attached);
          return;
        }
      }

      // Paste'i arayüz yakalamadıysa (veya Shift+tık ile zorlandıysa) drop ile dene
      dispatchDrop(SITE.findDropTarget(editor), buildTransfer(text));
      const ok = await waitForAttachment(area, countBefore);
      notify(ok ? T.attachedDrop : T.failed, ok ? 'info' : 'error');
    } finally {
      busy = false;
    }
  }

  // ------------------------------------------------------------------
  // Buton
  // ------------------------------------------------------------------
  function styleInline(btn) {
    Object.assign(btn.style, {
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      height: '28px', padding: '0 10px', margin: '0 4px',
      background: 'rgba(128,128,128,.15)', color: 'inherit',
      border: '1px solid rgba(128,128,128,.35)', borderRadius: '999px',
      font: 'inherit', fontSize: '12px', fontWeight: '500',
      cursor: 'pointer', whiteSpace: 'nowrap', lineHeight: '1',
      flex: '0 0 auto',
    });
  }

  function styleFloating(btn) {
    Object.assign(btn.style, {
      position: 'fixed', right: '20px', bottom: '90px', zIndex: '2147483646',
      height: '34px', padding: '0 14px',
      background: '#1e8e3e', color: '#fff', border: 'none', borderRadius: '999px',
      font: 'system-ui, sans-serif', fontSize: '13px', fontWeight: '600',
      cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,.25)',
    });
  }

  function createButton() {
    const btn = document.createElement('button');
    btn.id = BUTTON_ID;
    btn.type = 'button';
    btn.textContent = T.label;
    btn.title = `${T.tooltip}\nserdarvural.dev`;
    btn.setAttribute('aria-label', T.label);
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      pasteAsFile({ forceDrop: e.shiftKey });
    });
    return btn;
  }

  function ensureButton() {
    const editor = SITE.findEditor();
    if (!editor) return;

    // Buton yerinde ve görünürse dokunma. Her render'da yeniden yerleştirmek
    // butonun zıplamasına ve tıklamanın kaçmasına yol açıyor.
    const existing = document.getElementById(BUTTON_ID);
    if (existing) {
      const stillGood = existing.dataset.floating === '1'
        ? existing.isConnected
        : isVisible(existing) && isVisible(existing.parentElement);
      if (stillGood) return;
      existing.remove();
    }

    const slot = SITE.findSlot(editor);
    const btn = createButton();

    if (slot && isVisible(slot.parent)) {
      const before = slot.before && slot.before.parentElement === slot.parent ? slot.before : null;
      styleInline(btn);
      slot.parent.insertBefore(btn, before);
      // Kap görünür ama buton çizilemiyorsa (taşma/gizleme) yüzen moda düş
      if (isVisible(btn)) return;
      btn.remove();
    }

    styleFloating(btn);
    btn.dataset.floating = '1';
    document.body.appendChild(btn);
  }

  // ------------------------------------------------------------------
  // Başlatma: MutationObserver + emniyet taraması (SPA yeniden render'ları)
  // ------------------------------------------------------------------
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; ensureButton(); });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Sekme arka plandayken boşuna dönmesin
  setInterval(() => {
    if (document.visibilityState === 'visible') ensureButton();
  }, SWEEP_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') ensureButton();
  });

  ensureButton();

  // Klavye kısayolu
  document.addEventListener('keydown', (e) => {
    if (
      e.altKey === SHORTCUT.altKey &&
      e.shiftKey === SHORTCUT.shiftKey &&
      !e.ctrlKey && !e.metaKey &&
      e.key.toLowerCase() === SHORTCUT.key
    ) {
      e.preventDefault();
      pasteAsFile();
    }
  }, true);
})();
