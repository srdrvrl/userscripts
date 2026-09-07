<!--
Greasy Fork > script sayfası > "Bilgiyi güncelle" > "Ek bilgi" alanına yapıştır.
GF bu alanda Markdown kabul eder. Dil olarak "English" seç; altındaki
"+ Ek bilgi ekle" ile Türkçe için ikinci bir blok açıp TR bölümünü oraya koy.
-->

## English

Long prompts are painful to read in a chat box, and both Claude and Gemini handle
a long text far better as an **attachment** than as an inline paste.

This script adds a **📄 Paste as file** button next to the composer. One click
takes whatever is on your clipboard and attaches it as a `.txt` file instead of
dumping it into the prompt.

**Usage**

* Click the button, or press <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd>.
* <kbd>Shift</kbd>+click forces the drag-and-drop method, in case the site's
  paste handler ignores the synthetic event.

**Supported sites**

* claude.ai
* gemini.google.com

**Notes**

* The first use may ask for clipboard permission — that is the browser's own
  prompt, the script only calls `navigator.clipboard.readText()`.
* No network requests, no tracking, no external dependencies. Everything happens
  in your tab.
* Interface follows your browser language (English / Turkish).

MIT licensed. Written by [Serdar Vural](https://serdarvural.dev).

---

## Türkçe

Uzun metinleri sohbet kutusuna yapıştırmak hem okunaksız oluyor hem de Claude ve
Gemini uzun metni **ek dosya** olarak çok daha iyi işliyor.

Bu script sohbet kutusunun yanına bir **📄 Dosya Yapıştır** butonu ekler. Tek
tıkla panodaki metni prompt'a yapıştırmak yerine `.txt` dosyası olarak ekler.

**Kullanım**

* Butona tıklayın veya <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd> yapın.
* <kbd>Shift</kbd>+tık, sürükle-bırak yöntemini zorlar; sitenin paste yakalayıcısı
  sentetik olayı görmezse işe yarar.

**Desteklenen siteler**

* claude.ai
* gemini.google.com

**Notlar**

* İlk kullanımda tarayıcı pano izni isteyebilir; bu tarayıcının kendi sorusudur,
  script yalnızca `navigator.clipboard.readText()` çağırır.
* Ağ isteği yok, takip yok, dış bağımlılık yok. Her şey sekmenizin içinde olur.
* Arayüz tarayıcı dilinize göre Türkçe veya İngilizce gelir.

MIT lisanslı. [Serdar Vural](https://serdarvural.dev) tarafından yazıldı.

---

**Kaynak kod / Source:** <https://github.com/srdrvrl/userscripts>
**Hata bildirimi / Issues:** <https://github.com/srdrvrl/userscripts/issues>
