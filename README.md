# ICONS — Refo Games (React + PixiJS sürümü)

Orijinal tek dosyalık HTML/CSS/DOM oyununun **React + PixiJS** tabanlı, çalışan
tüm sistemleri (mağaza, başarımlar, sandık, günlük ödül, seviye haritası) içeren
tam kapsamlı yeniden yazımı. Görsel katmanın tamamı (HUD dahil) tek bir PixiJS
sahnesi içinde çizilir; React yalnızca durum yönetimi ve bileşen ağacı için kullanılır.

## Kurulum ve çalıştırma

```bash
npm install
npm run dev       # http://localhost:5173
```

Üretim derlemesi:

```bash
npm run build      # dist/ klasörüne derler
npm run preview    # derlenmiş sürümü yerelde önizler
```

> Not: Bu ortamda ağ erişimi kapalı olduğu için `npm install` buradan
> çalıştırılamadı. Kod, `esbuild` ile sözdizimi ve tüm yerel import
> yolları doğrulanarak yazıldı; kendi makinenizde `npm install` sonrası
> doğrudan çalışmalıdır. Bir sorunla karşılaşırsanız Node 18+ kullanmanızı öneririz.

## Klasör yapısı

```
src/
  data/            LEVELS (40 bölüm), STORE_ICONS (58 ikon), ACHIEVEMENTS, müzik parçaları
  game/            saf oyun mantığı: çakışma/kazanma kontrolü, sandık ödül üretimi, başarım kontrolü
  state/           zustand store'ları
    progressStore.js   kalıcı ilerleme (localStorage) — altın, yıldız, seviyeler, envanter
    gameStore.js        aktif oyun oturumu (kalıcı değil)
    uiStore.js          ekran/modal/toast yönlendirmesi
  audio/           WebAudio sentez tabanlı ses efektleri + prosedürel arka plan müziği
  pixi/
    theme.js            renk paleti + sanal tuval boyutu (440×920, letterbox ölçekleme)
    components/         yeniden kullanılabilir Pixi bileşenleri (buton, panel, scroll, modallar…)
    screens/             Home, Levels, Game, Store, Achievements, Settings
  App.jsx           Stage kurulumu, pencereye göre ölçekleme, ekran yönlendirme
  main.jsx          React giriş noktası
```

## Mimari notlar

- **Sanal çözünürlük**: Her ekran 440×920 sanal koordinat sisteminde tasarlanır;
  `App.jsx` bunu gerçek pencere boyutuna "contain" mantığıyla ölçekler
  (mobil oyunlarda yaygın letterbox yaklaşımı). Böylece tüm Pixi çizim kodu
  tek bir referans çözünürlükte kalır.
- **Durum yönetimi**: [zustand](https://github.com/pmndrs/zustand) kullanıldı.
  `progressStore` `persist` middleware ile `localStorage` anahtarı
  `icons_refo_progress_v2` altında saklanır (orijinaldeki `queens_refo_progress_v1`
  anahtarından farklı — eski oyunla çakışmaması için).
- **Sandık/başarım akışı**: Orijinal davranış korundu — sandık ödülü yalnızca
  bir bölüm bitişinde en az bir başarım açıldığında tetiklenir (`WinModal` →
  varsa `AchievementModal` sırayla → `ChestModal` → devam).
- **Kaydırma**: PixiJS'te native DOM scroll olmadığından `ScrollArea.jsx`
  basit bir sürükle-kaydır + maske bileşeni olarak yazıldı (seviyeler,
  mağaza, başarımlar listelerinde kullanılıyor).
- **Ses**: Orijinaldeki WebAudio sentez fonksiyonları (`playCoinChime`,
  `playChestOpenSound`, prosedürel müzik döngüsü vb.) birebir Pixi'den
  bağımsız `src/audio` modüllerine taşındı.

## Bilinçli olarak sadeleştirilen kısımlar

- Orijinaldeki **adım adım, hücreleri spotlight ile işaretleyen ilk seviye
  öğreticisi** yerine, ana ekrandaki "Nasıl Oynanır?" kartı statik bir
  kural özeti modalı açar. Bulmaca kuralları aynıdır, yalnızca anlatım şekli
  basitleştirildi.
- Konfeti/parçacık patlaması ve ekran zoom efektleri gibi mikro animasyonlar,
  temel oyun deneyimini bozmayacak şekilde daha sade tutuldu (ses efektleri
  ve titreşim geri bildirimi tam olarak korunuyor).

## GitHub Pages'e yayınlama

Bu repoda `.github/workflows/deploy.yml` hazır — `main` dalına her push'ta
projeyi otomatik derleyip GitHub Pages'e yayınlar. Kurulum:

1. Repo ayarlarında **Settings → Pages → Build and deployment → Source**
   kısmından **"GitHub Actions"** seçeneğini seç (gh-pages branch değil).
2. `main`'e bir commit gönder (veya Actions sekmesinden workflow'u elle tetikle).
3. Birkaç dakika içinde site `https://<kullanıcı-adın>.github.io/icons-pixi/`
   adresinde yayında olur.

**Önemli:** `vite.config.js` içindeki `base: '/icons-pixi/'` değeri repo adınla
birebir eşleşmeli. Repoyu farklı bir isimle oluşturduysan bu satırı
`base: '/senin-repo-adin/'` olarak güncelle. Kendi custom domain'inde
(`CNAME` ile) yayınlayacaksan `base: '/'` yap.

Elle (Actions kullanmadan) yayınlamak istersen:
```bash
npm run build
npx gh-pages -d dist
```
(bu yöntem için `Settings → Pages → Source`'u `gh-pages` branch olarak ayarlaman gerekir.)

## Oyun verileri



`LEVELS`, `STORE_ICONS`, `ACHIEVEMENTS` ve ödül formülleri (sandık ağırlıkları,
bölüm başına altın = `15 + yıldız×5`, günlük ödül = `10 🪙`) orijinal dosyadan
birebir aktarıldı; bulmaca çözümleri ve zorluk eğrisi değişmedi.
