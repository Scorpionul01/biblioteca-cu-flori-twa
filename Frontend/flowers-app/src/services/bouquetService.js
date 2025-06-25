import axios from 'axios';

// 🌍 CONFIGURARE DINAMICĂ CU CONFIG FILE
// Nu mai trebuie să schimbi codul - doar config.js!

const currentHostname = window.location.hostname;
const isLocalhost = currentHostname === 'localhost';

// 🎯 CONFIGURARE DINAMICĂ - Încărcă din config.js
let AI_MODEL_BRIDGE_URL;
let BACKEND_API_URL;

if (isLocalhost) {
  // Pe localhost folosește serviciile locale
  console.log('🖥️ LOCALHOST MODE');
  AI_MODEL_BRIDGE_URL = 'http://localhost:5001';
  BACKEND_API_URL = 'http://localhost:5002';
} else {
  // Pentru remote access, încearcă să folosească config.js
  if (window.APP_CONFIG) {
    console.log('🌐 REMOTE MODE - folosind config.js');
    AI_MODEL_BRIDGE_URL = window.APP_CONFIG.AI_URL;
    BACKEND_API_URL = window.APP_CONFIG.BACKEND_URL;
  } else {
    // Fallback dacă config.js nu s-a încărcat
    console.warn('⚠️ Config.js nu s-a încărcat - folosind localhost');
    AI_MODEL_BRIDGE_URL = 'http://localhost:5001';
    BACKEND_API_URL = 'http://localhost:5002';
  }
}

console.log('🌐 *** CONFIG DINAMIC ***:', {
    hostname: currentHostname,
    mode: isLocalhost ? 'LOCALHOST' : 'REMOTE',
    configLoaded: !!window.APP_CONFIG,
    AI_MODEL_BRIDGE_URL,
    BACKEND_API_URL
});

// 🖼️ BAZA DE DATE CU IMAGINI din training/flowers_training_data.json (128 flori)
const FLOWERS_IMAGE_DATABASE = {
  // Flori folosite frecvent de AI
  'lalea_roz': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvpwdszptnx9KXofae4tfNSQGYVVMFXZCpTQ&s',
  'leucospermum': 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQ6cfqMCj7Cw8dsY9tXT17i1PPQRNN8O9_BLjVrFNPRMGT-KOQY5UyIYwp1dnRHVr9o188kImRWpA6-fjWtpMv5kw',
  'morning_glory': 'https://www.gardenia.net/wp-content/uploads/2023/05/Ipomoea-Purpurea-Morning-Glory.webp',
  'eucalipt': 'https://golgemma.com/wp-content/uploads/photo-produit-HYDA0013.jpg',
  
  // Trandafiri
  'trandafir_rosu': 'https://curiozitati.md/img/trandafiri/trandafir_rosu.jpg',
  'trandafiri_rosii': 'https://curiozitati.md/img/trandafiri/trandafir_rosu.jpg',
  'trandafir_alb': 'https://images.pexels.com/photos/2166160/pexels-photo-2166160.jpeg',
  'trandafiri_albi': 'https://images.pexels.com/photos/2166160/pexels-photo-2166160.jpeg',
  'trandafir_roz': 'https://www.magnolia.ro/blog/images/gallery/istoria-si-semnificatia-trandafirului-roz/istoria_si_semnificatia_trandafirului_roz.jpg',
  'trandafiri_roz': 'https://www.magnolia.ro/blog/images/gallery/istoria-si-semnificatia-trandafirului-roz/istoria_si_semnificatia_trandafirului_roz.jpg',
  'trandafir_galben': 'https://bulbidevis.ro/183-large_default/trandafir-de-gradina-catarator-galben.jpg',
  
  // Lalele
  'lalea_galbena': 'https://prinde100.wordpress.com/wp-content/uploads/2010/04/img00290-20100417-1508.jpg',
  'lalea_rosie': 'https://gomagcdn.ro/domains2/planteieftine.ro/files/product/original/lalea-rosie-escape-048184.jpg',
  'lalele_colorate': 'https://ruigrokflowerbulbs.com/wp-content/uploads/2022/03/Triumph-Mix-2021_05_07_030971.jpg',
  
  // Garoafe
  'garofita_alba': 'https://scms.machteamsoft.ro/uploads/photos/original/109982-1.jpg',
  'garoafe_albe': 'https://scms.machteamsoft.ro/uploads/photos/original/109982-1.jpg',
  'garofita_rosie': 'https://www.magnolia.ro/blog/wp-content/uploads/2016/07/istoria-si-semnificatiile-au-garoafei.jpg',
  'garoafe_rosii': 'https://www.magnolia.ro/blog/wp-content/uploads/2016/07/istoria-si-semnificatiile-au-garoafei.jpg',
  'garofita_roz': 'https://okflora.r.worldssl.net/files/getfilecdn/25814/garoafe-roz-49-2-w445-h445.webp',
  'garoafe_roz': 'https://okflora.r.worldssl.net/files/getfilecdn/25814/garoafe-roz-49-2-w445-h445.webp',
  
  // Crini
  'crin_alb': 'https://www.gardenexpert.ro/1483-thickbox_default/crin-alb.jpg',
  'crini_albi': 'https://www.gardenexpert.ro/1483-thickbox_default/crin-alb.jpg',
  'crin_roz': 'https://www.magnolia.ro/blog/images/gallery/semnificatia-crinului-ce-mesaj-transmitem-atunci-cand-il-oferim/crini_roz_buchet.jpg',
  'crin_tiger': 'https://upload.wikimedia.org/wikipedia/commons/0/09/Lilium_lancifolium_7757.jpg',
  
  // Alte flori importante
  'floarea_soarelui': 'https://npr.brightspotcdn.com/dims4/default/68545b1/2147483647/strip/true/crop/2048x1536+0+0/resize/1760x1320!/format/webp/quality/90/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2F7c%2F15%2F1d76bc934e8cb103a56d43eedc7b%2Fsunflower-wide.jpg',
  'alstroemeria': 'https://www.thetortoisetable.org.uk/common/files/catalogue/613/large_Alstroemeria_LR_DSCF0862.jpeg',
  'gerbera_roz': 'https://www.magnolia.ro/blog/wp-content/uploads/2017/04/gerbera.jpg'
};

const bouquetService = {
  generateBouquet: async (message) => {
    try {
      console.log('🤖 Generez buchet AI pentru mesajul:', message);
      console.log('🌐 Folosesc AI URL:', AI_MODEL_BRIDGE_URL);
      
      // Trimitem direct la AI Model Bridge
      const response = await axios.post(`${AI_MODEL_BRIDGE_URL}/api/recommend`, {
        message: message.trim(),
        language: 'ro'
      });
      
      console.log('✅ Răspuns AI primit:', response.data);
      
      // Verifică structura răspunsului
      if (!response.data || !response.data.success || !response.data.result) {
        console.error('❌ Structură răspuns invalidă:', response.data);
        throw new Error('Răspuns invalid de la serviciul AI - lipsesc câmpuri obligatorii');
      }
      
      const aiData = response.data.result;
      console.log('📊 Date AI procesate:', aiData);
      
      // Procesează florile din suggested_flowers
      const suggestedFlowers = aiData.suggested_flowers || [];
      console.log('🌸 Flori sugerate de AI:', suggestedFlowers);
      
      // Construim buchetul în formatul așteptat de BouquetGenerator
      const bouquet = {
        bouquetName: `Buchet ${aiData.category?.charAt(0).toUpperCase() + aiData.category?.slice(1) || 'Personalizat'}`,
        messageInterpretation: aiData.explanation || 
                              `Am interpretat mesajul tău "${message}" ca fiind despre ${aiData.category || 'dragoste'}`,
        flowers: []
      };
      
      console.log('🎯 Buchet inițial creat:', bouquet);
      
      // Procesăm florile cu imagini
      if (suggestedFlowers.length > 0) {
        console.log('🔄 Procesez florile sugerate cu imagini...');
        
        bouquet.flowers = suggestedFlowers.map((flowerKey, index) => {
          console.log(`🌺 Procesez floarea ${index + 1}: "${flowerKey}"`);
          
          // 🖼️ GĂSEȘTE IMAGINEA pentru floare
          const flowerImage = getFlowerImage(flowerKey);
          
          const flower = {
            flowerId: flowerKey || `ai_flower_${index}`,
            flowerName: formatFlowerName(flowerKey) || `Floare ${index + 1}`,
            reason: getReasonForCategory(aiData.category) || 'Aleasă pentru simbolismul ei unic',
            imageUrl: flowerImage, // 🎉 ACUM ARE IMAGINE!
            quantity: Math.floor(Math.random() * 3) + 3, // 3-5 fire
            color: getFlowerColor(aiData.suggested_colors, index) || 'natural'
          };
          
          console.log(`✅ Floare procesată cu imagine:`, flower);
          return flower;
        });
      } else {
        // Flori default dacă AI nu returnează nimic
        console.log('🔄 Generez flori default cu imagini...');
        bouquet.flowers = generateDefaultFlowers(aiData.category);
      }
      
      // Adăugăm informații suplimentare
      bouquet.aiInsights = {
        category: aiData.category || 'unknown',
        confidence: aiData.confidence || 0.8,
        sentiment: aiData.sentiment_score || 0.5,
        suggestedColors: aiData.suggested_colors || [],
        estimatedPrice: aiData.estimated_price || 0,
        modelUsed: aiData.model_used || false,
        flowersDatabase: aiData.flowers_database_used || false,
        // Debug info
        originalFlowerCount: suggestedFlowers.length,
        processedFlowerCount: bouquet.flowers.length
      };
      
      console.log('🎉 Buchet final generat cu imagini:', bouquet);
      
      return bouquet;
      
    } catch (error) {
      console.error('❌ Eroare la generarea buchetului AI:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Trebuie să te autentifici pentru a folosi funcția AI de generare buchete.');
        } else if (error.response.status === 403) {
          throw new Error('Nu ai permisiunea să folosești această funcționalitate.');
        } else if (error.response.status === 503) {
          throw new Error('Serviciul AI nu este disponibil momentan. Te rugăm să încerci din nou în câteva minute.');
        } else {
          throw new Error(`Eroare server: ${error.response.status} - ${error.response.data?.message || 'Eroare necunoscută'}`);
        }
      } else if (error.request) {
        throw new Error('Nu s-a primit răspuns de la server. Verifică conexiunea și dacă backend-ul rulează.');
      } else {
        throw error;
      }
    }
  }
};

// Helper functions (same as before)
function getFlowerImage(flowerKey) {
  if (!flowerKey || typeof flowerKey !== 'string') {
    console.warn('⚠️ Invalid flower key pentru imagine:', flowerKey);
    return 'https://via.placeholder.com/200x200/f0f0f0/666?text=Floare';
  }
  
  const normalizedKey = flowerKey.toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  let imageUrl = FLOWERS_IMAGE_DATABASE[normalizedKey];
  
  if (imageUrl) {
    console.log(`🖼️ Imagine găsită pentru "${flowerKey}" (${normalizedKey}):`, imageUrl);
    return imageUrl;
  }
  
  const alternatives = [
    normalizedKey.replace('_', ''),
    normalizedKey.replace('_', '_'),
    normalizedKey.split('_')[0],
    normalizedKey.replace(/s$/, ''),
    normalizedKey + 's',
  ];
  
  for (const alt of alternatives) {
    imageUrl = FLOWERS_IMAGE_DATABASE[alt];
    if (imageUrl) {
      console.log(`🖼️ Imagine găsită cu varianta "${alt}" pentru "${flowerKey}":`, imageUrl);
      return imageUrl;
    }
  }
  
  console.log(`🖼️ Nu s-a găsit imagine pentru "${flowerKey}" (${normalizedKey}), folosesc placeholder`);
  return 'https://via.placeholder.com/200x200/e8f5e8/4a7c59?text=' + encodeURIComponent(flowerKey.slice(0, 10));
}

function formatFlowerName(flowerKey) {
  if (!flowerKey || typeof flowerKey !== 'string') {
    console.warn('⚠️ Invalid flower key:', flowerKey);
    return null;
  }
  
  const flowerNameMap = {
    'trandafiri_rosii': 'Trandafiri Roșii',
    'trandafiri_albi': 'Trandafiri Albi',
    'lalele_roz': 'Lalele Roz',
    'lalea_roz': 'Lalele Roz',
    'garoafe_albe': 'Garoafe Albe',
    'crini_albi': 'Crini Albi',
    'floarea_soarelui': 'Floarea Soarelui',
    'eucalipt': 'Eucalipt',
    'garofita_alba': 'Garoafe Albe',
    'garofita_rosie': 'Garoafe Roșii',
    'crizantema_alba': 'Crizanteme Albe',
    'lalea_galbena': 'Lalele Galbene',
    'garofita_roz': 'Garoafe Roz',
    'amaranthus': 'Amaranthus',
    'anemona': 'Anemone',
    'azalee': 'Azalee',
    'aster': 'Aster',
    'leucospermum': 'Leucospermum',
    'morning_glory': 'Morning Glory'
  };
  
  const mappedName = flowerNameMap[flowerKey.toLowerCase()];
  if (mappedName) {
    console.log(`🏷️ Nume mapat: ${flowerKey} → ${mappedName}`);
    return mappedName;
  }
  
  const formattedName = flowerKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  console.log(`🏷️ Nume formatat: ${flowerKey} → ${formattedName}`);
  return formattedName;
}

function getReasonForCategory(category) {
  const categoryReasons = {
    'sympathy': 'Aleasă pentru simbolismul său de compasiune și pace spirituală',
    'romantic': 'Aleasă pentru simbolismul său de dragoste și pasiune',
    'birthday': 'Aleasă pentru simbolismul său de bucurie și celebrare',
    'friendship': 'Aleasă pentru simbolismul său de prietenie și loialitate',
    'gratitude': 'Aleasă pentru simbolismul său de recunoștință și mulțumire',
    'apology': 'Aleasă pentru simbolismul său de regret și dorința de iertare',
    'celebration': 'Aleasă pentru simbolismul său de bucurie și sărbătoare',
    'mothersday': 'Aleasă pentru simbolismul său de dragoste maternă și grijă',
    'wellness': 'Aleasă pentru simbolismul său de însănătoșire și energie pozitivă'
  };
  
  return categoryReasons[category] || 'Aleasă pentru simbolismul ei în acest context special';
}

function getFlowerColor(suggestedColors, index) {
  if (!suggestedColors || !Array.isArray(suggestedColors)) {
    return 'natural';
  }
  
  const colorMap = {
    'red': 'roșu',
    'white': 'alb', 
    'pink': 'roz',
    'yellow': 'galben',
    'purple': 'mov',
    'blue': 'albastru',
    'green': 'verde',
    'orange': 'portocaliu',
    'natural': 'natural'
  };
  
  const colorKey = suggestedColors[index] || suggestedColors[0] || 'natural';
  const mappedColor = colorMap[colorKey] || colorKey;
  
  console.log(`🎨 Culoare mapată pentru index ${index}: ${colorKey} → ${mappedColor}`);
  return mappedColor;
}

function generateDefaultFlowers(category) {
  console.log('🔄 Generez flori default pentru categoria:', category);
  
  const flowerDatabase = {
    romantic: [
      { name: 'Trandafiri roșii', reason: 'Simbolizează dragostea pasională și devotamentul', color: 'roșu', key: 'trandafir_rosu' },
      { name: 'Bujori roz', reason: 'Exprimă romantismul și afecțiunea profundă', color: 'roz', key: 'bujor' },
      { name: 'Lisianthus alb', reason: 'Reprezintă dragostea pură și sinceră', color: 'alb', key: 'lisianthus' }
    ],
    mothersday: [
      { name: 'Garoafe roz', reason: 'Floarea tradițională a zilei mamei, simbolizând dragostea maternă', color: 'roz', key: 'garofita_roz' },
      { name: 'Trandafiri roz', reason: 'Exprimă aprecierea și iubirea pentru mamă', color: 'roz', key: 'trandafir_roz' },
      { name: 'Lalele', reason: 'Simbolizează dragostea perfectă și grija maternă', color: 'roz', key: 'lalea_roz' }
    ],
    gratitude: [
      { name: 'Floarea-soarelui', reason: 'Simbolizează recunoștința și admirația', color: 'galben', key: 'floarea_soarelui' },
      { name: 'Garoafe roz', reason: 'Exprimă mulțumirea și aprecierea', color: 'roz', key: 'garofita_roz' },
      { name: 'Alstroemeria', reason: 'Reprezintă prietenia durabilă și recunoștința', color: 'mixt', key: 'alstroemeria' }
    ],
    birthday: [
      { name: 'Gerbera multicolore', reason: 'Aduc bucurie și sărbătoresc viața', color: 'mixt', key: 'gerbera_roz' },
      { name: 'Trandafiri colorați', reason: 'Simbolizează viața plină de culoare și bucurie', color: 'mixt', key: 'trandafir_rosu' },
      { name: 'Alstroemeria', reason: 'Reprezintă prietenia și momentele frumoase', color: 'roz', key: 'alstroemeria' }
    ],
    sympathy: [
      { name: 'Crini albi', reason: 'Simbolizează pacea și liniștea sufletească', color: 'alb', key: 'crin_alb' },
      { name: 'Trandafiri albi', reason: 'Exprimă respectul și memoria eternă', color: 'alb', key: 'trandafir_alb' },
      { name: 'Garoafe albe', reason: 'Reprezintă dragostea pură și amintirile frumoase', color: 'alb', key: 'garofita_alba' }
    ]
  };
  
  const categoryFlowers = flowerDatabase[category] || flowerDatabase.romantic;
  console.log(`🌸 Flori default pentru ${category}:`, categoryFlowers);
  
  return categoryFlowers.map((flower, index) => {
    const flowerObj = {
      flowerId: `default_${category}_${index}`,
      flowerName: flower.name,
      reason: flower.reason,
      imageUrl: getFlowerImage(flower.key),
      quantity: Math.floor(Math.random() * 3) + 3,
      color: flower.color
    };
    
    console.log(`🌺 Floare default creată cu imagine:`, flowerObj);
    return flowerObj;
  });
}

export default bouquetService;
