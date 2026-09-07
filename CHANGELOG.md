# Changelog

Sürüm numaraları [Semantic Versioning](https://semver.org/lang/tr/) izler.
Her scriptin sürümü bağımsızdır; Greasy Fork güncellemesi `@version` alanının
artmasıyla tetiklenir.

---

## paste-as-file

### 3.1.0 - İlk Greasy Fork yayını

İlk kişisel sürüm 3.0'dan yayına hazırlık farkları:

**Düzeltildi**
- Claude'da buton, sohbet kutusu boşken kayboluyor veya yanlış yere düşüyordu.
  Yerleşim çıpası artık yalnızca metin yazılınca beliren Gönder butonu değil,
  her zaman var olan ek dosya / "+" menüsü. Yazmaya başlayınca butonun yer
  değiştirmesi de bu sayede bitti.
- Buton görünür durumdayken her SPA render'ında silinip yeniden ekleniyordu;
  artık yerindeyse hiç dokunulmuyor.
- Yerleştirilen kap gizli veya sıfır boyutluysa buton otomatik olarak yüzen
  moda düşüyor.

**Eklendi**
- Arayüz iki dilli (Türkçe / İngilizce), tarayıcı diline göre seçiliyor.
- `@license MIT`, gerçek `@namespace`, `@homepageURL`, `@icon`, `@noframes`.

- Paste'in tutup tutmadığı sabit 800 ms sonra tek sefer kontrol ediliyordu.
  Yavaş makinede veya arayüz takıldığında dosya kartı bu süreden geç geliyor,
  paste tutmuş olmasına rağmen drop da tetikleniyor ve dosya iki kez
  ekleniyordu. Artık 3 sn boyunca yoklanıyor, yalnızca gerçekten gelmediyse
  drop deneniyor.
- Ekleme başarısız olsa bile "eklendi" bildirimi gösteriliyordu; artık iki
  yöntem de tutmazsa hata bildirimi çıkıyor.
- Kısayola basılı tutmak veya butona üst üste tıklamak birden fazla dosya
  ekleyebiliyordu; eşzamanlı çalışma engellendi.

**Değişti**
- Emniyet taraması sekme arka plandayken duruyor (1,5 sn → 2 sn; gizliyken hiç).
- Yayın sürümünden konsol çıktısı kaldırıldı.

---

## sahibinden-ilan-kopyala

### 1.2.0 - İlk Greasy Fork yayını

İlk kişisel sürüm 1.1.1'den yayına hazırlık farkları:

**Düzeltildi**
- Panelin konumu sayfa yükleme hızına göre oynuyordu. Panel artık iletişim
  (satıcı) kutusunun hemen altına, `div-gpt-ad-*` reklam slotlarının üstüne
  giriyor. Kutu sayfaya geç gelirse panel önce geçici konuma konup kutu
  belirince yukarı taşınıyor.
- Çıpa kapsayıcının doğrudan çocuğu değilse `insertBefore` hata atıyor ve panel
  hiç eklenmiyordu; artık kapsayıcı altındaki üst ata hesaplanıyor.
- Satıcı bilgisi yalnızca bireysel ilan düzeninde okunuyordu. Kurumsal ve
  premium galeri ilanlarında `## Satıcı` bölümü boş çıkıyordu. Üç düzen de
  destekleniyor:

  | Alan | Bireysel | Kurumsal | Premium galeri |
  |---|---|---|---|
  | Ad | `.username-info-area h5 span` | `.username-info-area h5` | `.user-info-agent h3` |
  | Mağaza | `.storeBox .storeInfo` | `.storeBox .storeInfo` | `.user-info-store-name` |
  | Hesap tarihi | `.userRegistrationDate span` | `.userRegistrationDate span` | `#badge strong` |

- İndirme sonrası blob URL'i `a.href` üzerinden okunuyordu; `a` DOM'dan
  çıkarıldıktan sonra bu değer güvenilir değil, artık ayrı değişkenden
  serbest bırakılıyor.
- Sayfa hiç yüklenmezse MutationObserver süresiz dinliyordu; 15 sn zaman aşımı
  eklendi.

**Eklendi**
- Galeri ilanlarında yetki belge no (`.user-info-license-id-value`).
- `@license MIT`, gerçek `@namespace`, `@homepageURL`, `@icon`, `@noframes`,
  `@name:en`, `@description:en`.
- Kod başlığına sorumluluk reddi notu.

**Değişti**
- CSS tek sefer, `id="sik-style"` taşıyan bir `<style>` ile enjekte ediliyor.
- Satıcı alanlarının hepsi boşsa `## Satıcı` başlığı hiç basılmıyor.
- Panel başlığına kaynak linki eklendi.
