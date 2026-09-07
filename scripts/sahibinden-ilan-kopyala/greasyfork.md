<!--
Greasy Fork > script sayfası > "Bilgiyi güncelle" > "Ek bilgi" alanına yapıştır.
Dil olarak "Türkçe" seç; "+ Ek bilgi ekle" ile İngilizce için ikinci bir blok aç.
-->

## Türkçe

Bir araç ilanını yapay zekâya yorumlatmak isteyince sayfayı komple kopyalamak
işe yaramıyor: menüler, öneriler ve reklamlar araya karışıyor, boya/değişen
grafiği ise metne hiç dönüşmüyor.

Bu script sahibinden.com araç ilan sayfasına bir **"İlanı kopyala"** paneli
ekler. Tek tıkla ilanın işe yarar kısmını temiz **Markdown** veya **JSON** olarak
panoya alırsınız; ChatGPT / Claude / Gemini'ye yapıştırıp "bu ilanı değerlendir"
diyebilirsiniz.

**Ne kopyalanıyor**

* Başlık, fiyat, konum, ilan no, link, varsa fiyat değişim tarihçesi
* Künye (marka, model, yıl, km, vites, yakıt, kimden, takas, EİDS izni…)
* **Boya / değişen durumu** — grafikteki her parça tek tek okunur; sağlam
  parçaları listelemek isteğe bağlıdır
* Donanım listesi — istenirse "olmayan" donanımlar da **YOK** olarak yazılır
  (yapay zekânın eksik donanımı uydurmasını engeller)
* Satıcı adı ve hesap açma tarihi (isteğe bağlı)
* İlan açıklaması (isteğe bağlı)

**Seçenekler** panelden açılıp kapanır ve tarayıcıda kalıcı olarak saklanır.
**İndir** ile `.md`/`.json` dosyası kaydedebilir, **Önizle** ile kopyalamadan
önce çıktıyı görebilirsiniz.

**Gizlilik**

* Yalnızca o an açtığınız ilan sayfasında, sayfada zaten görünen bilgileri okur.
* Hiçbir ağ isteği yapmaz, hiçbir veriyi hiçbir yere göndermez.
* **Satıcı telefon numarası bilinçli olarak alınmaz.**

**Sorumluluk reddi**

Bu araç gayriresmîdir ve sahibinden.com ile hiçbir bağlantısı yoktur.
Kullanıcıların kendi tarayıcılarında zaten açık olan verileri kişisel kullanım
amacıyla biçimlendirmesini sağlar; toplu veri çekme yapmaz ve hiçbir veriyi
harici sunuculara iletmez. Sayfa içeriğinin telif hakkı ilan sahibine ve
sahibinden.com'a aittir; elde ettiğiniz çıktıyı kullanırken ilgili sitenin
kullanım koşullarına uymak sizin sorumluluğunuzdadır.

MIT lisanslı. [Serdar Vural](https://serdarvural.dev) tarafından yazıldı.

---

## English

Turkish-only site. This script adds a **"Copy listing"** panel to a
sahibinden.com car listing page and copies the useful part of the page —
specs, paint/replaced panel status per body part, features, seller info and the
description — to your clipboard as clean **Markdown** or **JSON**, ready to paste
into ChatGPT, Claude or Gemini for an assessment.

Options (include intact panels, mark missing features as "not present", include
seller, include description, Markdown vs JSON) are persisted in the browser.
There is also a download and a preview button.

Privacy: reads only what is already visible on the listing page you opened, makes
no network requests, and deliberately does **not** collect the seller's phone
number.

**Disclaimer.** This is an unofficial tool with no affiliation to
sahibinden.com. It formats data that is already open in the user's own browser
for personal use; it does no bulk scraping and sends no data to any external
server. Page content remains the property of the listing owner and
sahibinden.com — complying with that site's terms of use is your responsibility.

MIT licensed. Written by [Serdar Vural](https://serdarvural.dev).
