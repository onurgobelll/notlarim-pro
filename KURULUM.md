# Notlarım Pro — Web Uygulaması

## En basit kullanım
`index.html` dosyasını doğrudan telefonda tarayıcıda açabilirsiniz. Notlar
tarayıcının kendi hafızasında (localStorage) saklanır, internet gerekmez.

## "Ana ekrana ekle" ile gerçek uygulama gibi kullanmak
Bunun çalışması için dosyaların **bir web adresinden** (http/https) sunulması
gerekiyor — `file://` ile doğrudan açıldığında bu özellik çalışmaz. En kolay
ücretsiz yollardan biri:

### Netlify Drop (hesap gerektirmez)
1. https://app.netlify.com/drop adresine git.
2. Bu klasördeki tüm dosyaları (index.html, manifest.webmanifest, sw.js, icons/)
   sürükleyip bırak.
3. Sana verdiği linki telefonda aç.
4. Tarayıcı menüsünden "Ana ekrana ekle" / "Add to Home screen" seç.
5. Artık normal bir uygulama gibi ikonla açılır, tam ekran çalışır.

### GitHub Pages (kalıcı, kendi hesabınla)
1. Yeni bir repository oluştur, bu dosyaları içine yükle.
2. Repository → Settings → Pages → Branch: main, Save.
3. Birkaç dakika sonra verilen adresten aynı şekilde "Ana ekrana ekle".

## Hızlı not kısayolu
Uygulamayı ana ekrana ekledikten sonra ikonuna uzun basarsanız (Android'de
"basılı tut") "Yeni Not" kısayolu çıkar — doğrudan not ekleme ekranını açar.
Bu, sadece ana ekrana eklenmiş (yüklenmiş) sürümde çalışır; tarayıcı sekmesinde
açık kullanırken görünmez.

## Başka uygulamadan not gönderme (Paylaşım hedefi)
Uygulamayı ana ekrana eklediyseniz, telefonda herhangi bir uygulamada (tarayıcı,
haberler, WhatsApp vb.) bir metni seçip "Paylaş" dediğinizde açılan listede
"Notlarım Pro" da çıkar. Seçtiğinizde metin doğrudan yeni not olarak açılır.
Bu da sadece ana ekrana eklenmiş sürümde çalışır, tarayıcı sekmesinde görünmez.

## Bildirimler hakkında
Ayarlar (⚙️) menüsünden bildirimleri açabilirsiniz. Bir notun saati geldiğinde
tarayıcı bildirimi gösterilir — ama bu **sadece uygulama/sekme açıkken** çalışır.
Tarayıcılar, siteler tamamen kapalıyken bildirim göndermeye izin vermiyor
(gerçek arka plan bildirimleri sadece native Android/iOS uygulamalarda mümkün).

## Yedekleme
Notlar sadece o cihazdaki o tarayıcıda saklanır. Telefon değiştirmeden veya
tarayıcı verilerini temizlemeden önce Ayarlar → "Notları dosyaya aktar" ile
yedek alın; yeni cihazda "Yedekten geri yükle" ile geri getirin.
