const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// OpenAI Vision integration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const USE_AI_VISION = !!OPENAI_API_KEY;

class ArtworkAnalyzerService {
  constructor() {
    this.styleKeywords = [
      'abstract', 'impressionist', 'surrealist', 'realist', 'expressionist',
      'minimalist', 'pop art', 'contemporary', 'classical', 'modern',
      'fauvist', 'cubist', 'baroque', 'romantic', 'symbolist'
    ];
  }

  async analyzeImage(imagePath) {
    try {
      // Vérifier que le fichier existe
      await fs.access(imagePath);
      
      // Si OpenAI Vision est disponible, l'utiliser
      if (USE_AI_VISION) {
        return await this.analyzeWithOpenAI(imagePath);
      }
      
      // Sinon, fallback sur l'analyse locale
      return await this.analyzeLocal(imagePath);
    } catch (error) {
      console.error('Erreur analyse image:', error);
      throw new Error(`Impossible d'analyser l'image: ${error.message}`);
    }
  }

  async analyzeWithOpenAI(imagePath) {
    try {
      // Lire l'image et convertir en base64
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = 'image/jpeg'; // On assume JPEG, Sharp va convertir si besoin

      // Analyser avec OpenAI Vision
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Tu es un expert en analyse d'œuvres d'art. Analyse l'image fournie et retourne UNIQUEMENT un objet JSON valide avec cette structure exacte:
              {
                "style": "style artistique détecté (ex: impressionist, abstract, contemporary, minimalist, etc.)",
                "mood": "ambiance générale (ex: serein, dynamique, sombre, lumineux)",
                "colors": ["couleur1", "couleur2", "couleur3", "couleur4", "couleur5"],
                "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
                "description": "description concise de l'œuvre en français",
                "seoTitle": "titre SEO optimisé",
                "seoDescription": "description SEO de 150-160 caractères",
                "suggestedPrice": { "min": 300, "max": 800, "currency": "EUR" }
              }`
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Analyse cette œuvre d\'art et fournis les informations demandées au format JSON.' },
                { 
                  type: 'image_url', 
                  image_url: { url: `data:${mimeType};base64,${base64Image}` }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('OpenAI API error:', error);
        throw new Error('Erreur API OpenAI');
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      // Extraire le JSON de la réponse
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const aiAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      if (!aiAnalysis) {
        throw new Error('Impossible de parser la réponse AI');
      }

      // Obtenir les métadonnées de l'image
      const metadata = await sharp(imagePath).metadata();

      // Convertir les couleurs texte en hex
      const colorPalette = await this.extractColorPalette(imagePath);

      return {
        dimensions: {
          width: metadata.width,
          height: metadata.height,
          aspectRatio: (metadata.width / metadata.height).toFixed(2)
        },
        format: metadata.format,
        estimatedStyle: aiAnalysis.style || 'contemporary',
        mood: aiAnalysis.mood || 'neutre',
        palette: colorPalette,
        aiColors: aiAnalysis.colors || [],
        suggestedTags: aiAnalysis.tags || ['art', 'contemporary'],
        priceRange: aiAnalysis.suggestedPrice || this.estimatePriceRange(metadata, aiAnalysis.style),
        aiDescription: aiAnalysis.description,
        seo: {
          title: aiAnalysis.seoTitle,
          description: aiAnalysis.seoDescription,
          keywords: aiAnalysis.tags?.join(', ')
        },
        analysis: {
          isHorizontal: metadata.width > metadata.height,
          isLargeFormat: (metadata.width * metadata.height) > 4000000,
          dominantColors: colorPalette.slice(0, 3).map(c => c.hex),
          aiGenerated: true
        }
      };
    } catch (error) {
      console.error('Erreur analyse OpenAI:', error);
      // Fallback sur l'analyse locale
      return this.analyzeLocal(imagePath);
    }
  }

  async analyzeLocal(imagePath) {
    // Analyser l'image avec sharp
    const metadata = await sharp(imagePath).metadata();
    const stats = await sharp(imagePath).stats();
    
    // Extraire la palette de couleurs dominantes
    const palette = await this.extractColorPalette(imagePath);
    
    // Détecter le style estimé
    const style = this.estimateStyle(metadata, palette);
    
    // Générer des tags suggérés
    const tags = this.generateTags(metadata, palette, style);
    
    // Calculer une fourchette de prix suggérée
    const priceRange = this.estimatePriceRange(metadata, style);

    return {
      dimensions: {
        width: metadata.width,
        height: metadata.height,
        aspectRatio: (metadata.width / metadata.height).toFixed(2)
      },
      format: metadata.format,
      colorSpace: metadata.space,
      hasAlpha: metadata.hasAlpha,
      palette: palette,
      estimatedStyle: style,
      mood: this.estimateMood(palette),
      suggestedTags: tags,
      priceRange: priceRange,
      aiDescription: null,
      seo: null,
      analysis: {
        isHorizontal: metadata.width > metadata.height,
        isLargeFormat: (metadata.width * metadata.height) > 4000000,
        dominantColors: palette.slice(0, 3).map(c => c.hex),
        aiGenerated: false
      }
    };
  }

  async extractColorPalette(imagePath) {
    try {
      // Redimensionner pour accélérer l'analyse
      const { data, info } = await sharp(imagePath)
        .resize(100, 100, { fit: 'cover' })
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Compter les couleurs
      const colorMap = new Map();
      for (let i = 0; i < data.length; i += info.channels) {
        const r = Math.round(data[i] / 32) * 32;
        const g = Math.round(data[i + 1] / 32) * 32;
        const b = Math.round(data[i + 2] / 32) * 32;
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        
        colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
      }

      // Trier par fréquence et retourner les 5 plus fréquentes
      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([hex, count]) => ({
          hex,
          percentage: Math.round((count / (data.length / info.channels)) * 100)
        }));

      return sortedColors;
    } catch (error) {
      console.error('Erreur extraction palette:', error);
      return [{ hex: '#000000', percentage: 100 }];
    }
  }

  estimateStyle(metadata, palette) {
    // Logique simple basée sur les métadonnées et la palette
    const colorCount = palette.length;
    
    if (colorCount <= 2) return 'minimalist';
    if (colorCount >= 5) return 'expressionist';
    
    // Analyse de la luminosité des couleurs
    const avgBrightness = palette.reduce((sum, color) => {
      const r = parseInt(color.hex.slice(1, 3), 16);
      const g = parseInt(color.hex.slice(3, 5), 16);
      const b = parseInt(color.hex.slice(5, 7), 16);
      return sum + (r + g + b) / 3;
    }, 0) / palette.length;
    
    if (avgBrightness > 200) return 'impressionist';
    if (avgBrightness < 50) return 'surrealist';
    
    return 'contemporary';
  }

  generateTags(metadata, palette, style) {
    const tags = [style];
    
    // Tags basés sur le format
    if (metadata.width > metadata.height) tags.push('paysage');
    if (metadata.height > metadata.width) tags.push('portrait');
    if (Math.abs(metadata.width - metadata.height) < 50) tags.push('carré');
    
    // Tags basés sur la taille
    const pixels = metadata.width * metadata.height;
    if (pixels > 10000000) tags.push('grand format');
    if (pixels < 1000000) tags.push('intime');
    
    // Tags basés sur les couleurs
    const hasWarmColors = palette.some(c => {
      const r = parseInt(c.hex.slice(1, 3), 16);
      const g = parseInt(c.hex.slice(3, 5), 16);
      return r > 150 && g < 100;
    });
    
    const hasCoolColors = palette.some(c => {
      const b = parseInt(c.hex.slice(5, 7), 16);
      return b > 150;
    });
    
    if (hasWarmColors) tags.push('chaud');
    if (hasCoolColors) tags.push('froid');
    
    return [...new Set(tags)]; // Dédupliquer
  }

  estimatePriceRange(metadata, style) {
    // Prix de base selon le style
    const basePrices = {
      'minimalist': { min: 300, max: 800 },
      'abstract': { min: 400, max: 1200 },
      'impressionist': { min: 500, max: 1500 },
      'expressionist': { min: 600, max: 1800 },
      'surrealist': { min: 700, max: 2000 },
      'contemporary': { min: 400, max: 1400 },
      'realist': { min: 500, max: 1600 }
    };
    
    const base = basePrices[style] || { min: 400, max: 1200 };
    
    // Ajuster selon la taille
    const pixels = metadata.width * metadata.height;
    const sizeMultiplier = Math.sqrt(pixels / 1000000); // Basé sur 1MP = 1x
    
    return {
      min: Math.round(base.min * sizeMultiplier),
      max: Math.round(base.max * sizeMultiplier),
      currency: 'EUR'
    };
  }

  estimateMood(palette) {
    // Estimer l'ambiance basée sur les couleurs
    const avgBrightness = palette.reduce((sum, color) => {
      const r = parseInt(color.hex.slice(1, 3), 16);
      const g = parseInt(color.hex.slice(3, 5), 16);
      const b = parseInt(color.hex.slice(5, 7), 16);
      return sum + (r + g + b) / 3;
    }, 0) / palette.length;
    
    if (avgBrightness > 180) return 'lumineux';
    if (avgBrightness < 80) return 'sombre';
    return 'neutre';
  }

  async generateDescription(analysis, title, artist) {
    // Si on a une description AI, l'utiliser
    if (analysis.aiDescription) {
      return {
        short: analysis.aiDescription,
        full: analysis.aiDescription,
        seo: analysis.seo || {
          title: `${title} | ${artist} | ArtFolio`,
          description: `Découvrez "${title}" de ${artist} - Œuvre ${analysis.estimatedStyle}. ` +
                       `Achetez des œuvres d'art originales sur ArtFolio.`,
          keywords: analysis.suggestedTags?.join(', ')
        }
      };
    }
    
    // Sinon, générer une description basique
    const { dimensions, estimatedStyle, suggestedTags, palette } = analysis;
    
    const sizeDesc = dimensions.width > 2000 ? 'grand format' : 'format moyen';
    const colorDesc = palette.length > 3 ? 'riche en couleurs' : 'minimaliste';
    
    return {
      short: `"${title}" - Œuvre ${estimatedStyle} ${sizeDesc} par ${artist}. ${colorDesc}, dimensions ${dimensions.width}x${dimensions.height}px.`,
      full: `"${title}" est une œuvre ${estimatedStyle} réalisée par ${artist}. ` +
            `Cette création ${colorDesc} aux dimensions de ${dimensions.width}x${dimensions.height} pixels ` +
            `explore les thèmes de ${suggestedTags.slice(0, 3).join(', ')}. ` +
            `Palette dominante : ${palette.slice(0, 3).map(c => c.hex).join(', ')}.`,
      seo: {
        title: `${title} | ${artist} | ArtFolio`,
        description: `Découvrez "${title}" de ${artist} - Œuvre ${estimatedStyle} ${sizeDesc}. ` +
                     `Achetez des œuvres d'art originales sur ArtFolio.`,
        keywords: suggestedTags.join(', ')
      }
    };
  }
}

module.exports = new ArtworkAnalyzerService();
