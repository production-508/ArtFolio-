# SEO Implementation Guide

## Meta Tags Implémentés

### Index.html (Global)
- ✅ Title optimisé avec keywords
- ✅ Description détaillée (160 chars)
- ✅ Keywords pertinents
- ✅ Canonical URL
- ✅ Robots index/follow
- ✅ Open Graph complet
- ✅ Twitter Cards
- ✅ Favicon + Apple Touch Icon
- ✅ Theme color pour mobile

## Sitemap Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://artfolio-production-ca66.up.railway.app/</loc>
    <priority>1.0</priority>
    <changefreq>daily</changefreq>
  </url>
  <url>
    <loc>https://artfolio-production-ca66.up.railway.app/galerie</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://artfolio-production-ca66.up.railway.app/artistes</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://artfolio-production-ca66.up.railway.app/analyze</loc>
    <priority>0.7</priority>
  </url>
</urlset>
```

## JSON-LD Structured Data

### ArtGallery
```json
{
  "@context": "https://schema.org",
  "@type": "ArtGallery",
  "name": "ArtFolio",
  "description": "Galerie d'art premium avec analyse IA",
  "url": "https://artfolio-production-ca66.up.railway.app/",
  "areaServed": "FR"
}
```

### Product (Œuvres)
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Titre de l'œuvre",
  "image": "url_image",
  "description": "Description",
  "offers": {
    "@type": "Offer",
    "price": "1000.00",
    "priceCurrency": "EUR"
  }
}
```

## Next Steps
- [ ] Générer sitemap.xml dynamique
- [ ] Créer composant SEO pour meta tags dynamiques
- [ ] Ajouter JSON-LD aux pages artistes/œuvres
