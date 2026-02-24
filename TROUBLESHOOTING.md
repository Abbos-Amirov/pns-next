# O'zgarishlarni ko'rish bo'yicha yo'riqnoma

Agar qo'shilgan tillar, dark mode, Brand bo'limi va boshqa o'zgarishlar brauzerda ko'rinmasa:

## 1. Dev serverni qayta ishga tushiring

```bash
# Joriy serverni to'xtating (Ctrl+C)
# Keyin qayta ishga tushiring:
yarn dev
```

## 2. Brauzer cache'ini tozalang

- **Chrome/Edge:** `Ctrl+Shift+R` (Windows) yoki `Cmd+Shift+R` (Mac) — Hard refresh
- Yoki: Developer Tools (F12) → Network → "Disable cache" belgisini qo'ying → sahifani yangilang

## 3. Desktop rejimida tekshiring

**Muhim:** Mobil qurilmada yoki tor oynada Top komponenti boshqacha ko'rinadi — faqat oddiy linklar (Home, Products, ...). Dark mode, til tanlash va to'liq logo **faqat desktop** rejimida ko'rinadi.

- Brauzer oynasini kengaytiring (min. 1024px)
- Yoki F12 → Device toolbar'ni yoping (mobil simulyatsiyasiz)

## 4. Qayerda nimalar ko'rinadi

| Element | Joylashuv |
|---------|-----------|
| **Til tanlash** | Navbar o'ngda — globus ikonkasi (jig'a rang) → bosing → English, 한국어, Русский, 中文, 日本語 |
| **Dark mode** | Login/Signup tugmasi yonida — quyosh/oy ikonkasi (ko'k doira) |
| **Brand (Windows/Doors)** | Bosh sahifada HeroSection'dan pastda — scroll qiling pastga |
| **Logo** | Navbar chapda — arched door ikonkasi + PNSWINDOW |

## 5. Tilni o'zgartirish

1. Globus ikonkasini bosing
2. Kerakli tilni tanlang (masalan: 中文 yoki 日本語)
3. Sahifa yangilanadi va matnlar tanlangan tilga o'zgaradi

## 6. Dark mode

1. Quyosh/oy ikonkasini bosing (Login/Signup yonida)
2. Sahifa qora fonga o'zgaradi
3. Qayta bosing — oq fon qaytadi
