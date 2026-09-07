// ==UserScript==
// @name         Sahibinden İlan Kopyala (AI için)
// @name:en      Sahibinden Listing Copier (for AI)
// @namespace    https://serdarvural.dev/userscripts
// @version      1.2.0
// @description  Araç ilanının künyesini, boya/değişen durumunu (sağlam parçalar dahil), donanımını ve açıklamasını tek tıkla Markdown veya JSON olarak panoya kopyalar; ChatGPT/Claude/Gemini'ye yapıştırıp ilan yorumlatmak için.
// @description:en Copies a sahibinden.com car listing (specs, paint/replaced panels, features, description) to the clipboard as Markdown or JSON, ready to paste into ChatGPT, Claude or Gemini.
// @author       Serdar Vural
// @homepageURL  https://github.com/srdrvrl/userscripts
// @supportURL   https://github.com/srdrvrl/userscripts/issues
// @license      MIT
// @icon         data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2024%2024%27%3E%3Crect%20width%3D%2724%27%20height%3D%2724%27%20rx%3D%275%27%20fill%3D%27%23ffe800%27/%3E%3Cpath%20d%3D%27M4.5%2014.2l1.4-4a2%202%200%200%201%201.9-1.3h8.4a2%202%200%200%201%201.9%201.3l1.4%204v3.6h-2.3v-1.4H6.8v1.4H4.5z%27%20fill%3D%27%23222%27/%3E%3Ccircle%20cx%3D%277.6%27%20cy%3D%2714.6%27%20r%3D%271%27%20fill%3D%27%23ffe800%27/%3E%3Ccircle%20cx%3D%2716.4%27%20cy%3D%2714.6%27%20r%3D%271%27%20fill%3D%27%23ffe800%27/%3E%3C/svg%3E
// @match        https://www.sahibinden.com/ilan/*
// @match        https://sahibinden.com/ilan/*
// @grant        GM_setClipboard
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-idle
// @noframes
// ==/UserScript==

/*
 * Sahibinden İlan Kopyala - https://serdarvural.dev
 * MIT License. Copyright (c) 2025 Serdar Vural.
 *
 * SORUMLULUK REDDİ
 * Bu araç gayriresmîdir ve sahibinden.com ile hiçbir bağlantısı yoktur.
 * Kullanıcının kendi tarayıcısında zaten açık olan tek bir ilan sayfasındaki
 * görünür bilgileri kişisel kullanım için biçimlendirir. Toplu veri çekme
 * (crawling / scraping) yapmaz, sayfayı kendiliğinden gezmez, hiçbir ağ isteği
 * göndermez ve hiçbir veriyi harici bir sunucuya iletmez. Tüm işlem kullanıcının
 * tarayıcısı içinde ve yalnızca kullanıcının tıklamasıyla gerçekleşir.
 * Satıcı telefon numarası bilinçli olarak toplanmaz.
 */

(function () {
  'use strict';

  /* ---------------------------------------------------------------
   * Ayarlar (tarayıcıda kalıcı)
   * ------------------------------------------------------------- */
  const DEFAULTS = {
    includeIntact: true,      // Boya/değişen bölümünde sağlam parçaları da listele
    includeMissing: false,    // Donanımda olmayanları "Yok" olarak listele
    includeSeller: true,      // Satıcı adı + hesap tarihi (telefon eklenmez)
    includeDescription: true,
    format: 'md',             // 'md' | 'json'
  };
  const load = () => Object.assign({}, DEFAULTS, GM_getValue('opts', {}));
  const save = (o) => GM_setValue('opts', o);

  /* ---------------------------------------------------------------
   * Parça isimleri (grafikteki class -> Türkçe)
   * ------------------------------------------------------------- */
  const PART_NAMES = {
    'front-bumper': 'Ön Tampon',
    'front-hood': 'Motor Kaputu',
    'roof': 'Tavan',
    'front-right-mudguard': 'Sağ Ön Çamurluk',
    'front-right-door': 'Sağ Ön Kapı',
    'rear-right-door': 'Sağ Arka Kapı',
    'rear-right-mudguard': 'Sağ Arka Çamurluk',
    'front-left-mudguard': 'Sol Ön Çamurluk',
    'front-left-door': 'Sol Ön Kapı',
    'rear-left-door': 'Sol Arka Kapı',
    'rear-left-mudguard': 'Sol Arka Çamurluk',
    'rear-hood': 'Bagaj Kapağı',
    'rear-bumper': 'Arka Tampon',
  };

  // Sıralama önemli: "local-painted-new" içinde "painted-new" da geçiyor.
  function partStatus(className) {
    if (className.includes('local-painted-new')) return 'Lokal Boyalı';
    if (className.includes('painted-new')) return 'Boyalı';
    if (className.includes('changed-new')) return 'Değişen';
    if (className.includes('original-new') || className.includes('original')) return 'Orijinal';
    return 'Belirtilmemiş';
  }

  const txt = (el) => (el ? el.innerText.trim() : '');

  /* ---------------------------------------------------------------
   * Satıcı bilgisi
   *
   * Sahibinden ilan detayında üç ayrı satıcı kutusu düzeni var:
   *   A) Bireysel      : .username-info-area h5 > span   (isim bazen ::before)
   *   B) Kurumsal/klasik: .username-info-area h5          (span yok)
   *   C) Premium galeri : .user-info-module > .user-info-agent h3
   * Üçünde de mağaza adı, hesap tarihi ve yetki belge no farklı yerlerde durur.
   * Telefon numarası hiçbir düzende bilinçli olarak alınmıyor.
   * ------------------------------------------------------------- */
  function collectSeller() {
    const nameEl =
      document.querySelector('.username-info-area h5 span') ||
      document.querySelector('.username-info-area h5') ||
      document.querySelector('.user-info-agent h3');

    let name = txt(nameEl);
    if (!name && nameEl) {
      // İsim CSS ::before ile basılıyor olabilir
      name = getComputedStyle(nameEl, '::before').content.replace(/^["']|["']$/g, '');
      if (name === 'none') name = '';
    }

    const store =
      txt(document.querySelector('.storeBox .storeInfo')) ||
      txt(document.querySelector('.user-info-store-name'));

    // Premium düzende hesap tarihi rozet ipucundaki <strong> içinde:
    // "<strong>Kasım 2008</strong> tarihinden itibaren ... hesap sahibidir."
    const registered =
      txt(document.querySelector('.userRegistrationDate span')) ||
      txt(document.querySelector('#badge strong'));

    const license = txt(document.querySelector('.user-info-license-id-value'));

    return { name, store, registered, license };
  }

  /* ---------------------------------------------------------------
   * Veri toplama
   * ------------------------------------------------------------- */
  function collect(opts) {
    const data = {
      url: location.href.split('?')[0],
      title: txt(document.querySelector('.classifiedDetailTitle h1')),
      id: (document.getElementById('classifiedId')?.dataset.classifiedid ||
           txt(document.getElementById('classifiedId')) ||
           (location.pathname.match(/-(\d+)\/?(?:\?|$)/) || [])[1] || ''),
      price: txt(document.querySelector('.classified-price-wrapper')) ||
             (document.getElementById('favoriteClassifiedPrice')?.value || '').trim(),
      location: Array.from(document.querySelectorAll('.classifiedInfo h2 a')).map(txt).filter(Boolean).join(' / '),
      priceHistory: [],
      info: {},
      bodywork: { summary: {}, parts: {} },
      features: {},
      description: '',
      seller: null,
    };

    // Künye
    document.querySelectorAll('.classifiedInfoList li').forEach((li) => {
      const label = txt(li.querySelector('strong')).replace(/:$/, '');
      const value = txt(li.querySelector('span'));
      if (label) data.info[label] = value;
    });
    const eids = document.querySelector('.uiBox.certification');
    if (eids) {
      data.info['EİDS'] = /iznine sahiptir/i.test(txt(eids))
        ? 'Ticaret Bakanlığı EİDS ilan verme izni var'
        : txt(eids).slice(0, 120);
    }

    // Fiyat tarihçesi (varsa)
    document.querySelectorAll('.price-history-table tr').forEach((tr) => {
      const tds = tr.querySelectorAll('td');
      if (tds.length < 2) return;
      const date = txt(tds[0].querySelector('.inner-date')) || txt(tds[0]);
      const price = txt(tds[1]).replace(/\s+/g, ' ');
      if (date && price) data.priceHistory.push({ date, price });
    });

    // Boya / değişen – grafikteki tüm parçalar
    const parts = document.querySelectorAll('.car-parts > div');
    parts.forEach((part) => {
      const key = part.className.trim().split(/\s+/)[0];
      const name = PART_NAMES[key] || key.replace(/-/g, ' ');
      data.bodywork.parts[name] = partStatus(part.className);
    });

    // Boya / değişen – sağdaki metin listesi (kategori -> parçalar)
    let cat = '';
    document.querySelectorAll('.car-damage-info-list ul li').forEach((li) => {
      if (li.classList.contains('pair-title')) {
        cat = txt(li);
        data.bodywork.summary[cat] = data.bodywork.summary[cat] || [];
      } else if (li.classList.contains('selected-damage') && cat) {
        data.bodywork.summary[cat].push(txt(li));
      }
    });

    // Grafik yoksa listeden türet
    if (!parts.length) {
      Object.entries(data.bodywork.summary).forEach(([c, list]) => {
        const status = c.replace(/\s*Parçalar$/i, '').trim();
        list.forEach((p) => (data.bodywork.parts[p] = status));
      });
    }

    // Donanım
    document.querySelectorAll('#classifiedProperties h3, .classifiedOtherDetails h3').forEach((h3) => {
      const section = txt(h3);
      const ul = h3.nextElementSibling;
      if (!ul || ul.tagName !== 'UL') return;
      if (/boyalı|değişen|hasar/i.test(section)) return;

      const have = [], missing = [];
      ul.querySelectorAll('li').forEach((li) => {
        const t = txt(li);
        if (!t) return;
        (li.classList.contains('selected') ? have : missing).push(t);
      });
      if (!have.length && !missing.length) return;
      data.features[section] = { have, missing };
    });

    // Açıklama
    if (opts.includeDescription) {
      data.description = txt(document.getElementById('classifiedDescription'));
    }

    // Satıcı (telefon bilinçli olarak alınmıyor)
    if (opts.includeSeller) data.seller = collectSeller();

    return data;
  }

  /* ---------------------------------------------------------------
   * Markdown
   * ------------------------------------------------------------- */
  function toMarkdown(d, opts) {
    const L = [];
    L.push(`# ${d.title || 'İlan'}`);
    L.push('');
    L.push(`**Fiyat:** ${d.price || 'Belirtilmemiş'}`);
    if (d.location) L.push(`**Konum:** ${d.location}`);
    if (d.id) L.push(`**İlan No:** ${d.id}`);
    L.push(`**Link:** ${d.url}`);
    if (d.priceHistory.length) {
      L.push(`**Fiyat tarihçesi:** ${d.priceHistory.map((h) => `${h.date}: ${h.price}`).join(' → ')} → şu an: ${d.price}`);
    }
    L.push('');

    L.push('## İlan Bilgileri');
    Object.entries(d.info).forEach(([k, v]) => L.push(`- **${k}:** ${v}`));
    L.push('');

    L.push('## Boya / Değişen Durumu');
    const partEntries = Object.entries(d.bodywork.parts);
    const problem = partEntries.filter(([, s]) => s !== 'Orijinal');
    const intact = partEntries.filter(([, s]) => s === 'Orijinal');

    if (!problem.length) {
      L.push('- Boyalı veya değişen parça işaretlenmemiş (hatasız).');
    } else {
      const grouped = {};
      problem.forEach(([p, s]) => (grouped[s] = grouped[s] || []).push(p));
      Object.entries(grouped).forEach(([s, list]) => L.push(`- **${s}:** ${list.join(', ')}`));
    }
    if (opts.includeIntact && intact.length) {
      L.push(`- **Orijinal (sağlam):** ${intact.map(([p]) => p).join(', ')}`);
    }
    L.push('');

    if (opts.includeMissing) {
      L.push('## Donanım');
      L.push('Her özellik açıkça işaretlenmiştir: **VAR** = araçta mevcut, **YOK** = araçta bulunmuyor.');
      L.push('');
      Object.entries(d.features).forEach(([section, f]) => {
        L.push(`### ${section}`);
        if (f.have.length) L.push(`- **VAR:** ${f.have.join(', ')}`);
        if (f.missing.length) L.push(`- **YOK:** ${f.missing.join(', ')}`);
        L.push('');
      });
    } else {
      L.push('## Donanım (sadece araçta mevcut olanlar)');
      Object.entries(d.features).forEach(([section, f]) => {
        if (!f.have.length) return;
        L.push(`### ${section}`);
        f.have.forEach((i) => L.push(`- ${i}`));
        L.push('');
      });
    }

    if (d.seller && Object.values(d.seller).some(Boolean)) {
      L.push('## Satıcı');
      if (d.seller.store) L.push(`- **Mağaza:** ${d.seller.store}`);
      if (d.seller.name) L.push(`- **Ad:** ${d.seller.name}`);
      if (d.seller.license) L.push(`- **Yetki belge no:** ${d.seller.license}`);
      if (d.seller.registered) L.push(`- **Hesap açma tarihi:** ${d.seller.registered}`);
      L.push('');
    }

    if (opts.includeDescription && d.description) {
      L.push('## Açıklama');
      L.push(d.description);
      L.push('');
    }
    return L.join('\n').trim() + '\n';
  }

  function toJSON(d, opts) {
    const out = JSON.parse(JSON.stringify(d));
    if (!opts.includeIntact) {
      out.bodywork.parts = Object.fromEntries(
        Object.entries(out.bodywork.parts).filter(([, s]) => s !== 'Orijinal')
      );
    }
    if (!opts.includeMissing) {
      Object.keys(out.features).forEach((k) => {
        out.features[k] = out.features[k].have;
      });
    }
    return JSON.stringify(out, null, 2);
  }

  /* ---------------------------------------------------------------
   * Pano + bildirim
   * ------------------------------------------------------------- */
  function copy(text) {
    try { GM_setClipboard(text, 'text'); return Promise.resolve(); }
    catch (e) { return navigator.clipboard.writeText(text); }
  }

  function download(text, filename) {
    const type = filename.endsWith('.json') ? 'application/json' : 'text/markdown';
    const blob = new Blob([text], { type: type + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function toast(msg, ok = true) {
    let t = document.getElementById('sik-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'sik-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.className = ok ? 'ok' : 'err';
    t.classList.add('show');
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* ---------------------------------------------------------------
   * Panel
   * ------------------------------------------------------------- */
  const CSS = `
    #sik-panel{border:1px solid #d9dde3;border-radius:4px;background:#fff;margin:10px 0;
      font:13px/1.45 Arial,Helvetica,sans-serif;color:#333;overflow:hidden}
    #sik-panel .sik-head{background:#f7f8fa;border-bottom:1px solid #e3e6ea;padding:8px 12px;
      font-weight:bold;font-size:13px;display:flex;justify-content:space-between;align-items:center;gap:8px}
    #sik-panel .sik-head small{font-weight:normal;color:#888}
    #sik-panel .sik-head a{color:#888;text-decoration:none}
    #sik-panel .sik-head a:hover{text-decoration:underline}
    #sik-panel .sik-body{padding:10px 12px}
    #sik-panel label{display:flex;align-items:center;gap:7px;margin:0 0 6px;cursor:pointer}
    #sik-panel input[type=checkbox]{margin:0;width:15px;height:15px;cursor:pointer}
    #sik-panel .sik-fmt{display:flex;gap:14px;margin:4px 0 10px;padding-top:8px;border-top:1px dashed #e3e6ea}
    #sik-panel .sik-fmt label{margin:0}
    #sik-panel .sik-btns{display:flex;gap:8px}
    #sik-panel button{flex:1;border:0;border-radius:3px;padding:9px 10px;font-weight:bold;
      font-size:13px;cursor:pointer;transition:filter .12s}
    #sik-panel button:hover{filter:brightness(.94)}
    #sik-panel button:focus-visible{outline:2px solid #0d6efd;outline-offset:2px}
    #sik-panel .sik-copy{background:#ffe800;color:#222}
    #sik-panel .sik-dl,#sik-panel .sik-view{background:#e9ecf1;color:#333}
    #sik-out{display:none;margin-top:10px;width:100%;box-sizing:border-box;height:220px;
      font:12px/1.4 Consolas,Menlo,monospace;border:1px solid #d9dde3;border-radius:3px;padding:8px;resize:vertical}
    #sik-toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,12px);opacity:0;
      pointer-events:none;padding:10px 16px;border-radius:4px;color:#fff;font:bold 13px Arial,sans-serif;
      z-index:99999;transition:opacity .18s,transform .18s}
    #sik-toast.show{opacity:1;transform:translate(-50%,0)}
    #sik-toast.ok{background:#1e8e3e}
    #sik-toast.err{background:#c62828}
    @media (prefers-reduced-motion:reduce){#sik-toast,#sik-panel button{transition:none}}
  `;

  function injectCSS() {
    if (document.getElementById('sik-style')) return;
    const style = document.createElement('style');
    style.id = 'sik-style';
    style.textContent = CSS;
    (document.head || document.documentElement).appendChild(style);
  }

  function buildPanel() {
    const opts = load();
    const panel = document.createElement('div');
    panel.id = 'sik-panel';
    panel.innerHTML = `
      <div class="sik-head">
        <span>İlanı kopyala <small>AI araçları için</small></span>
        <a href="https://serdarvural.dev" target="_blank" rel="noopener noreferrer"><small>serdarvural.dev</small></a>
      </div>
      <div class="sik-body">
        <label><input type="checkbox" data-k="includeIntact"> Sağlam (orijinal) parçaları da listele</label>
        <label><input type="checkbox" data-k="includeMissing"> Olmayan donanımları "Yok" olarak ekle</label>
        <label><input type="checkbox" data-k="includeSeller"> Satıcı adı ve hesap tarihi</label>
        <label><input type="checkbox" data-k="includeDescription"> İlan açıklaması</label>
        <div class="sik-fmt">
          <label><input type="radio" name="sik-fmt" value="md"> Markdown</label>
          <label><input type="radio" name="sik-fmt" value="json"> JSON</label>
        </div>
        <div class="sik-btns">
          <button type="button" class="sik-copy">Panoya kopyala</button>
          <button type="button" class="sik-dl">İndir</button>
          <button type="button" class="sik-view">Önizle</button>
        </div>
        <textarea id="sik-out" readonly spellcheck="false"></textarea>
      </div>`;

    // Durumu yükle
    panel.querySelectorAll('input[type=checkbox]').forEach((cb) => {
      cb.checked = !!opts[cb.dataset.k];
      cb.addEventListener('change', () => { opts[cb.dataset.k] = cb.checked; save(opts); });
    });
    panel.querySelectorAll('input[name=sik-fmt]').forEach((r) => {
      r.checked = r.value === opts.format;
      r.addEventListener('change', () => { opts.format = r.value; save(opts); });
    });

    const build = () => {
      const d = collect(opts);
      const text = opts.format === 'json' ? toJSON(d, opts) : toMarkdown(d, opts);
      const slug = (d.title || 'ilan').toLowerCase()
        .replace(/[çğıöşü]/g, (c) => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' }[c]))
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
      const filename = `sahibinden-${d.id || 'ilan'}-${slug}.${opts.format === 'json' ? 'json' : 'md'}`;
      return { text, filename };
    };

    const out = panel.querySelector('#sik-out');
    panel.querySelector('.sik-dl').addEventListener('click', () => {
      try {
        const { text, filename } = build();
        download(text, filename);
        toast('İndirildi: ' + filename);
      } catch (e) {
        console.error(e);
        toast('İndirilemedi: ' + e.message, false);
      }
    });
    panel.querySelector('.sik-copy').addEventListener('click', () => {
      try {
        copy(build().text).then(
          () => toast('Panoya kopyalandı'),
          () => toast('Kopyalanamadı – Önizle ile elle kopyalayın', false)
        );
      } catch (e) {
        console.error(e);
        toast('Veri okunamadı: ' + e.message, false);
      }
    });
    panel.querySelector('.sik-view').addEventListener('click', (ev) => {
      const showing = out.style.display === 'block';
      if (showing) { out.style.display = 'none'; ev.target.textContent = 'Önizle'; return; }
      out.value = build().text;
      out.style.display = 'block';
      ev.target.textContent = 'Gizle';
    });

    return panel;
  }

  const CONTAINER_SEL = '.classifiedOtherBoxesContainer';
  // Panel iletişim (satıcı) kutusunun hemen altına girer. Bu kutu sayfanın
  // kalıcı parçası; güvenlik uyarısı kutusu ise her ilanda yok ve yeri
  // değişebiliyor, o yüzden ona çıpalanmıyor. Böylece panel aradaki
  // div-gpt-ad-* reklam slotlarının da üstünde kalır.
  // .user-info-module = premium galeri düzenindeki iletişim kutusu
  const AFTER_SEL = '.classifiedUserBox, .classified-owner-info, .user-info-module';
  const FALLBACK_BEFORE_SEL = '.safety-warnnings-box';

  // Çıpa container'ın doğrudan çocuğu olmayabilir; insertBefore yalnızca
  // doğrudan çocuk kabul ettiği için container altındaki üst atasını buluyoruz.
  // (Aksi halde NotFoundError atıp panel hiç eklenmiyor.)
  function directChild(container, el) {
    while (el && el.parentElement && el.parentElement !== container) el = el.parentElement;
    return el && el.parentElement === container ? el : null;
  }

  let panel = null;

  // Dönüş: panel nihai konumuna yerleşti mi? İletişim kutusu sayfaya geç
  // geliyorsa panel önce en alta konur, kutu belirince yukarı taşınır;
  // konumu yükleme hızına göre oynamasın diye.
  function mount() {
    const container = document.querySelector(CONTAINER_SEL);
    if (!container) return false;

    // Scriptin eski bir sürümü hâlâ kuruluysa onun paneline karışma
    const existing = document.getElementById('sik-panel');
    if (existing && existing !== panel) return true;

    if (!panel) { injectCSS(); panel = buildPanel(); }

    // 1) İletişim kutusunun hemen altı
    const after = directChild(container, container.querySelector(AFTER_SEL));
    if (after && after !== panel) {
      if (panel.previousElementSibling !== after) {
        container.insertBefore(panel, after.nextSibling);
      }
      return true;
    }

    // 2) Eski davranış: güvenlik kutusunun üstü
    const before = directChild(container, container.querySelector(FALLBACK_BEFORE_SEL));
    if (before) {
      if (panel.nextElementSibling !== before) container.insertBefore(panel, before);
      return true;
    }

    if (!panel.isConnected) container.appendChild(panel); // geçici konum
    return false;
  }

  if (!mount()) {
    // Sayfa geç yükleniyorsa bekle; süresiz dinlemeyi önlemek için zaman aşımı koy.
    const obs = new MutationObserver(() => {
      if (mount()) { obs.disconnect(); clearTimeout(giveUp); }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    const giveUp = setTimeout(() => obs.disconnect(), 15000);
  }
})();
