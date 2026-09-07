# Userscripts

[serdarvural.dev](https://serdarvural.dev) — kendim için yazdığım, işe yarar
bulduğum için yayınladığım Tampermonkey / Violentmonkey kullanıcı scriptleri.

Hepsi tek dosya, bağımlılıksız ve derleme gerektirmez. Hiçbiri ağ isteği yapmaz;
tamamı açtığınız sayfanın içinde, sizin tıklamanızla çalışır.

## Scriptler

### 📄 [paste-as-file](scripts/paste-as-file/)

Panodaki uzun metni prompt kutusuna yapıştırmak yerine `.txt` dosyası olarak
ekler. Claude ve Gemini uzun metni ek dosya olarak daha iyi işliyor, sohbet de
okunaklı kalıyor. Tek tık veya <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd>.

`claude.ai` · `gemini.google.com` — [kur](GREASYFORK_PASTE_AS_FILE) ·
[açıklama](scripts/paste-as-file/greasyfork.md)

### 🚗 [sahibinden-ilan-kopyala](scripts/sahibinden-ilan-kopyala/)

Araç ilanının künyesini, boya/değişen durumunu (grafikteki her parça tek tek),
donanımını ve açıklamasını temiz Markdown veya JSON olarak panoya kopyalar.
ChatGPT/Claude/Gemini'ye yapıştırıp ilan yorumlatmak için.

`sahibinden.com` — [kur](GREASYFORK_SAHIBINDEN) ·
[açıklama](scripts/sahibinden-ilan-kopyala/greasyfork.md)

## Kurulum

1. [Tampermonkey](https://www.tampermonkey.net/) veya
   [Violentmonkey](https://violentmonkey.github.io/) kurun.
2. Yukarıdaki **kur** bağlantısına tıklayın.

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

- `@version` alanını **mutlaka** artırın — Greasy Fork aynı sürüm numarasıyla
  güncellemeyi reddeder ve kullanıcılara otomatik güncelleme gitmez.
- Değişikliği [CHANGELOG.md](CHANGELOG.md) dosyasına yazın.
- `@downloadURL` / `@updateURL` **eklemeyin**; Greasy Fork bunları kendisi yönetir.
- Uzun açıklamayı scriptin `greasyfork.md` dosyasından Greasy Fork'taki
  "Ek bilgi" alanına kopyalayın.

## Lisans

[MIT](LICENSE) © Serdar Vural
