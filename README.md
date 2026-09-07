# Userscripts

[![lint](https://github.com/srdrvrl/userscripts/actions/workflows/lint.yml/badge.svg)](https://github.com/srdrvrl/userscripts/actions/workflows/lint.yml)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

[serdarvural.dev](https://serdarvural.dev) - kendim için yazdığım, işe yarar
bulduğum için yayınladığım Tampermonkey / Violentmonkey kullanıcı scriptleri.

Hepsi tek dosya, bağımlılıksız ve derleme gerektirmez. Hiçbiri ağ isteği yapmaz;
tamamı açtığınız sayfanın içinde, sizin tıklamanızla çalışır.

## Scriptler

### 📄 paste-as-file

[![sürüm](https://img.shields.io/greasyfork/v/594714?label=s%C3%BCr%C3%BCm)](https://greasyfork.org/scripts/594714)
[![kurulum](https://img.shields.io/greasyfork/dt/594714?label=kurulum)](https://greasyfork.org/scripts/594714)

Panodaki uzun metni prompt kutusuna yapıştırmak yerine `.txt` dosyası olarak
ekler. Claude ve Gemini uzun metni ek dosya olarak daha iyi işliyor, sohbet de
okunaklı kalıyor. Tek tık veya <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd>.

`claude.ai` · `gemini.google.com`

**[⬇ Kur](https://greasyfork.org/scripts/594714)** ·
[açıklama](scripts/paste-as-file/greasyfork.md) ·
[kaynak](scripts/paste-as-file/paste-as-file.user.js)

### 🚗 sahibinden-ilan-kopyala

[![sürüm](https://img.shields.io/greasyfork/v/594715?label=s%C3%BCr%C3%BCm)](https://greasyfork.org/scripts/594715)
[![kurulum](https://img.shields.io/greasyfork/dt/594715?label=kurulum)](https://greasyfork.org/scripts/594715)

Araç ilanının künyesini, boya/değişen durumunu (grafikteki her parça tek tek),
donanımını ve açıklamasını temiz Markdown veya JSON olarak panoya kopyalar.
ChatGPT/Claude/Gemini'ye yapıştırıp ilan yorumlatmak için.

`sahibinden.com`

**[⬇ Kur](https://greasyfork.org/scripts/594715)** ·
[açıklama](scripts/sahibinden-ilan-kopyala/greasyfork.md) ·
[kaynak](scripts/sahibinden-ilan-kopyala/sahibinden-ilan-kopyala.user.js)

## Kurulum

1. [Tampermonkey](https://www.tampermonkey.net/) veya
   [Violentmonkey](https://violentmonkey.github.io/) kurun.
2. Yukarıdaki **Kur** bağlantısına tıklayın.

Greasy Fork üzerinden kurarsanız güncellemeler otomatik gelir. Depodaki
`.user.js` dosyasını doğrudan açarak da kurabilirsiniz, o durumda güncellemeleri
elle almanız gerekir.

## Gizlilik

Bu scriptlerin hiçbiri:

- ağ isteği yapmaz (`GM_xmlhttpRequest`, `fetch`, `XMLHttpRequest` kullanılmaz),
- veri toplamaz, telemetri göndermez, harici sunucuyla konuşmaz,
- sayfayı kendiliğinden gezmez veya toplu veri çekmez.

Kaydedilen tek şey, tarayıcı içinde tutulan kendi ayar tercihleriniz
(`GM_setValue`).

## Sorumluluk reddi

Bu scriptler gayriresmîdir ve hedef aldıkları sitelerle (claude.ai,
gemini.google.com, sahibinden.com) hiçbir bağlantıları yoktur; o sitelerin
sahipleri tarafından desteklenmez veya onaylanmazlar. Yaptıkları iş,
kullanıcının kendi tarayıcısında **zaten açık olan** verileri kişisel kullanım
için biçimlendirmekten ibarettir. Sayfa içeriğinin telif hakkı ilgili site ve
içerik sahiplerine aittir; elde ettiğiniz çıktıyı kullanırken ilgili sitenin
kullanım koşullarına uymak sizin sorumluluğunuzdadır. Scriptler MIT lisansının
öngördüğü şekilde, hiçbir garanti verilmeksizin "olduğu gibi" sunulur.

Scriptler hedef sitelerin HTML yapısına bağlıdır; siteler arayüzlerini
değiştirdiğinde bozulabilirler.

## Geliştirme

```sh
# sözdizimi kontrolü
node --check scripts/<script-adı>/<script-adı>.user.js
```

Yayına alırken:

- `@version` alanını **mutlaka** artırın; Greasy Fork aynı sürüm numarasıyla
  güncellemeyi reddeder ve kullanıcılara otomatik güncelleme gitmez.
- Değişikliği [CHANGELOG.md](CHANGELOG.md) dosyasına yazın.
- `@downloadURL` / `@updateURL` **eklemeyin**; Greasy Fork bunları kendisi yönetir.
- Uzun açıklamayı scriptin `greasyfork.md` dosyasından Greasy Fork'taki
  "Ek bilgi" alanına kopyalayın.

Greasy Fork script sayfaları:
[paste-as-file](https://greasyfork.org/scripts/594714) ·
[sahibinden-ilan-kopyala](https://greasyfork.org/scripts/594715)

## Lisans

[MIT](LICENSE) © Serdar Vural
