import axios from 'axios';

// 🎯 CONFIGURAȚIA DINAMICĂ CU CONFIG FILE
// Nu mai trebuie să schimbi codul - doar config.js!

const currentHostname = window.location.hostname;
const isLocalhost = currentHostname === 'localhost';

// 🎯 CONFIGURARE DINAMICĂ - Încărcă din config.js
let AI_MODEL_BRIDGE_URL;

if (isLocalhost) {
  // Pe localhost folosește serviciile locale
  console.log('🖥️ Enhanced: LOCALHOST MODE');
  AI_MODEL_BRIDGE_URL = 'http://localhost:5001';
} else {
  // Pentru remote access, încearcă să folosească config.js
  if (window.APP_CONFIG) {
    console.log('🌐 Enhanced: REMOTE MODE - folosind config.js');
    AI_MODEL_BRIDGE_URL = window.APP_CONFIG.AI_URL;
  } else {
    // Fallback dacă config.js nu s-a încărcat
    console.warn('⚠️ Enhanced: Config.js nu s-a încărcat - folosind localhost');
    AI_MODEL_BRIDGE_URL = 'http://localhost:5001';
  }
}

console.log('🌐 *** Enhanced CONFIG DINAMIC ***:', {
    hostname: currentHostname,
    mode: isLocalhost ? 'LOCALHOST' : 'REMOTE',
    configLoaded: !!window.APP_CONFIG,
    AI_MODEL_BRIDGE_URL
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
  
  // Crizanteme
  'crizantema_alba': 'https://koreafilm.ro/blog/wp-content/uploads/2010/11/crizantema-alba.jpg',
  'crizanteme_albe': 'https://koreafilm.ro/blog/wp-content/uploads/2010/11/crizantema-alba.jpg',
  'crizantema_galbena': 'https://seminteflori.com/wp-content/uploads/2022/03/chrysanthemum-parthenium-dwarf-golden-ball-2.jpg',
  'crizantema_japoneza': 'https://images.finegardening.com/app/uploads/2018/01/23143717/chrysanthemummorifoliumlinda_cc_2_lg_0-thumb1x1.jpg',
  
  // Floarea Soarelui
  'floarea_soarelui': 'https://npr.brightspotcdn.com/dims4/default/68545b1/2147483647/strip/true/crop/2048x1536+0+0/resize/1760x1320!/format/webp/quality/90/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2F7c%2F15%2F1d76bc934e8cb103a56d43eedc7b%2Fsunflower-wide.jpg',
  
  // Alte flori populare din baza de date
  'alstroemeria': 'https://www.thetortoisetable.org.uk/common/files/catalogue/613/large_Alstroemeria_LR_DSCF0862.jpeg',
  'amaranthus': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfUEWgwoWF12okG_YAwrE4VVdEyrNEgR_DDvgU1bYGjc-If9HdQMPIYMCoafUn7O7knjivN_VxYp0z_G_PaDFWNg',
  'anemona': 'https://www.enrose.ro/wp-content/uploads/2021/01/enrose-anemone.jpg',
  'aster': 'https://hort.extension.wisc.edu/files/2024/08/Aster-oblongifolius-October-Skies-CBGlate-summer2-1536x1020.jpg',
  'astilbe': 'https://www.gardenia.net/wp-content/uploads/2023/05/astilbe-chinensis-vision.webp',
  'azalee': 'https://www.glissandogardencenter.ro/wp-content/uploads/2019/05/Rododendron-Germania.jpg',
  'banksia': 'https://www.calyxflowers.com/uploads/banksiacf.jpg',
  'begonie': 'https://lh7-us.googleusercontent.com/gl3C1ZNfkh43qUiydpPbjRgsnTOVQLf0ydAvigN5AfS2DGZeLExjWbpFSaT1Jgo12ZPFn0lcYDjt7ibVQBahhCHHwMTIAFG_lxdWi0LRbddQjzTpal9EpRiGkonF39X4GiE-cpoUzJogGvrc9HAQZA',
  'bougainvillea': 'https://magazin.agrii.ro/media/magefan_blog/Bougainvillea_ingrijire.png',
  'bujor': 'https://bulbiromania.ro/wp-content/uploads/2018/04/peony-3004055_1920-e1697141613992-768x768.jpg',
  'cala': 'https://media.bzi.ro/unsafe/700x700/smart/filters:contrast(5):format(webp)/https://bzi.ro/wp-content/uploads/2022/02/cala-floarea-mortii-9.jpg',
  'camellia': 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQD9vQXZDa8c3gTvVnk-eliRpYSjHpYm2o4Db3Sz33JlAuLq-XilLhRWxfw_tajI_IxC9LazL2sJR7dThRvDLCHOA',
  'celosia': 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQpm61sv6uPDius8EkNJ93FbGPdMFEXPpYveG8nEb7-TwWKw6a9Z9V2OzQ5TPQ7YUZVCBuBO4chtl6tA0THAK1jFg',
  'clopotel_de_texas': 'https://www.livrarefloribucuresti.ro/images/flori/large/magia-florilor-de-lisianthus-GSDlI.jpg',
  'cosmos': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZhv6Xl_9b94L2DmjgqRbT6mwuogxJuMypzp6dGErcEj4vVg5R9u_Ml1oSSP2aCiK5n2JeO0ua8YvxNCPrpExJIQ',
  'dalie': 'https://mariavoichitamiereanu.wordpress.com/wp-content/uploads/2014/10/dalia.jpg',
  'delphinium': 'https://www.famousroses.eu/cdn/shop/files/delphinium-elatum-darwins-blue-indulgence-perene-butasi-trandafiri-gradina-in-ghiveci-sau-radacina-libera-611233.jpg?v=1721375027',
  'dusty_miller': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGPrkvWYw9VSddrj202Sg-AkZDbXxQSF_Hh6cWTcEt7ArC7Mjjy0rIbFtj2STYLQk9XH6WN5H6vdeFETPHLIy69g',
  'feriga_leatherleaf': 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTuS5ARhD1-YFCrZy-dxj-pO5Hcq20a8uiWNx2IRlPiEWwvvh9P92i3M8A9DaCCiplauOTaLV5lGj0mN7yy3dU9rnlvGCRb8kK0YgyE1Q',
  'frezie': 'https://flowers-garden.ro/wp-content/uploads/2020/01/buchet-cadou-cu-frezii-galbene.jpg',
  'gardenie': 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTE8xOpRNmxHbcg7gfWGDfRRqFOS3c-OfbI72f6uiLs2-pDKr2QGdu3_i3XtH8lprEZuWE7qXsbyrYYCTh9-XLevA',
  'gerbera_galbena': 'https://sfatulparintilor.ro/wp-content/uploads/2020/11/Ce-semnifica-culoarea-galben-sfatulparintilor.ro-pixabay_com-baberton-3318688_1920-1400x850.jpg',
  'gerbera_rosie': 'http://www.gradinamea.ro/_files/Image/articole/original/20040828_15_parisperelachaisegerbera.JPG',
  'gerbera_roz': 'https://www.magnolia.ro/blog/wp-content/uploads/2017/04/gerbera.jpg',
  'ghiocel': 'https://cdn.pixabay.com/photo/2016/01/28/16/18/spring-1166564_1280.jpg',
  'glicina': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Chinesischer_Blauregen_Detail_Bl%C3%BCtentraube.JPG/500px-Chinesischer_Blauregen_Detail_Bl%C3%BCtentraube.JPG',
  'gypsophila': 'https://docaperene.ro/cdn/shop/files/GypsophilapaniculataSnowflake1_940x.jpg?v=1739970107',
  'floarea_miresei': 'https://www.aquarelle.md/fileman/buchetul_miresei_din_gypsophila.jpg',
  'hellebore': 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Helleborus_niger_Kaiser.jpg',
  'hortensie_albastra': 'https://www.magnolia.ro/blog/wp-content/uploads/2018/06/ce-semnifica-hortnesiile.jpg',
  'hortensie_verde': 'https://grow.decorexpro.com/wp-content/uploads/2018/10/21-1.jpg',
  'iasomie': 'https://canal33.ro/wp-content/uploads/2024/05/jasmine-3217541_1280-1.jpg',
  'iris': 'https://bloomeria.ro/pub/media/amasty/webp/wysiwyg/blog/ingrijirea-florii-de-iris-crestere-cultivaer-ghiveci_jpg.webp',
  'kangaroo_paw': 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRMiVDDfgVVIOymQkm9fpGEUDuUvQi-HPBp7JjL_XeA51LJXNxM_yv8nBiQiENj9nickgrG3XV06T47bFfLqGI4sg',
  'lacramioare': 'https://c.cdnmp.net/358998178/p/m/1/lacramioare-convallaria-majalis-doreen~2411.jpg',
  'lavanda': 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Single_lavender_flower02.jpg',
  'liliac': 'https://mediacdn.libertatea.ro/unsafe/1260x708/smart/filters:format(webp):contrast(8):quality(75)/https://static4.libertatea.ro/wp-content/uploads/2021/05/liliac-plantare-ingrijire.jpg',
  'lisianthus': 'https://mullerseeds.ro/app/uploads/2024/12/FRS708-01-300x300.jpg',
  'lotus': 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcR_0S52De6QfNLY7-MV35ti6sqWZd_qtFCEnyTSn4goTo6rHImBXLdDTXG-AiQ8dzM4Gjs39DNNVkoLsrWaad61ZQ',
  'mac': 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcS2BNKRQ27ewVI5jzAs3eBtIfFkI62KzSAq2gTh2-nKq7oluhGCevBJfFOxwCgu73x696AcuEXWWAJidpEsJnwNbw',
  'magnolia': 'https://buchetefloria.wordpress.com/wp-content/uploads/2015/02/magnolia_semnificatie.jpg',
  'margarete': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTi7lKe4m72nFhdbjX1fzOWLglPhYrwynnU3kaKvjCuGBO9UD7MwKm1mS6MPoFFEI3FFieoEF6ihC9JgbYg9eSGiQ',
  'muscata': 'https://www.gardenia.net/wp-content/uploads/2023/04/1RYX8vvagYKzgzRPdUndx4PFdPK0FKt7RIqFQOc8-780x520.webp',
  'muscarica': 'https://www.gardenia.net/wp-content/uploads/2023/05/myosotis-sylvatica-forget-me-not-780x520.webp',
  'mustel': 'https://www.springfarma.com/media/wysiwyg/cms/articole/3mus.jpg',
  'narcisa': 'https://horticultura.ro/wp-content/uploads/2024/03/Narcise-Horticultura-Timisoara-1-800x600.jpg',
  'nu_ma_uita': 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Myosotislatifolia.jpg',
  'orhidee_fluture': 'http://www.biaplant.ro/repository/files/f2ab2120a80c93c7d2e37325993608b8.jpg',
  'orhidee_roz': 'https://mathaus.ro/medias/sys_master/root/he8/hcd/h00/9494804561950/Orhidee-Phalaenopsis.jpg',
  'pampas_grass': 'https://florastore.com/cdn/shop/files/2551036_Atmosphere_01_SQ_a74d718e-9f52-4f6f-ad74-fb3ba9118cb6.jpg?v=1744897738&width=1080',
  'petunie': 'https://florariatrias.b-cdn.net/wp-content/uploads/2023/06/PETUNIA-%E2%80%93-FLOAREA-PARFUMATA-DE-EXTERIOR-1-1536x864.jpg',
  'piciorul_cocosului': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Persian_buttercup_%28Ranunculus_asiaticus%29.jpg/500px-Persian_buttercup_%28Ranunculus_asiaticus%29.jpg',
  'pittosporum': 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRu28aqH3G4y_nAOgO7FVfA20vVLh9PjD9prWuawkTO6c3SnfBiOdo2kwtPEubUFTsx9tjfU8aVDbwuKSmaDZhmTA',
  'plumeria': 'https://animals.sandiegozoo.org/sites/default/files/2017-12/plumeria-yellow.jpg',
  'protea': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkW3HPHRrmMI09raTkiPHdJa-VCFiz5yH01LDsY9myDbv_qmZjtb_RZ244XSCRgoy4nTQ-oXAivMoSHv8sSpmFTQ',
  'ranunculus': 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSeqBPKWfIqcG_eC89z5p8ulmJ0flDb2wjEz6JXVrlPYiIKBfuIOfxXwpupe0uvrgRrBu-rBdWWnw8bUntr4Ykx0g',
  'rozmarin_decorativ': 'https://docaperene.ro/cdn/shop/files/Rosmarinusofficinalis.jpg?v=1740486280',
  'ruscus': 'https://innocentiemangonipiante.it/wp-content/themes/yootheme/cache/14/1642694478-1428aff6.jpeg',
  'scabiosa': 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcREtvOdzMXaFc97ayL0Zfg_F_O2esj873aB7Em-tu3Dqc6uPW0cB30GZmaV2HLlMEnCsqMQoggRlZc_GMFMsUHAIg',
  'solidago': 'https://images.squarespace-cdn.com/content/v1/5d9cf6657cc1730bfc60e055/1601138887377-4MGSSG6VHEJ1FH84HDDS/Goldenrod_1.JPG',
  'stephanotis': 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSDbwfXtFgzr1tggPUwrOGVTunrfWtP_z6rrP9tLCv88GcPIfH0qNxFDNCO0BhCFmzrdF54OTF2yBDx53x0swSHeA',
  'stocks': 'https://www.evanthia.nl/_next/image?url=https%3A%2F%2Fcms.evanthia.nl%2Fresources%2Fuploads%2F2021%2F02%2FCentum_Lavender_Matthiola_Incana_Violier_Evanthia_LR_01.jpg&w=1200&q=75',
  'strelitia': 'https://www.magnolia.ro/blog/wp-content/uploads/2016/03/strelizia-reginae-magnolia.jpg',
  'sweet_pea': 'https://d2seqvvyy3b8p2.cloudfront.net/7d0612e1e50abbf91de5d774a34ee74a.jpg',
  'trandafirul_chinezesc': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Hibiscus_Brilliant.jpg/1280px-Hibiscus_Brilliant.jpg',
  'tuberose': 'https://order.eurobulb.nl/549-large_default/polianthes-tuberosa-the-pearl-10524.jpg',
  'viorele': 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Viola_odorata_fg01.JPG',
  'yarrow': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_2gc2axiFn9gtJokCz7TSx-DtZGyIvfr5uuE-GYL9cuI1LlPhBUbfSTVN02TJHm2ZAeZFcrHeDE10cej5Mfwvzw',
  'zambila_alba': 'https://www.prietenulgradinii.ro/cdn/products/bulbi-zambile-albe-snow-crystal-bz013-760.webp',
  'zambila_albastra': 'https://verdena.ro/cdn/shop/products/zambila-struguras-albastru-muscari-armeniacum-ghiveci-cu-12-bulbi-844801.jpg?v=1708075088&width=1500',
  'zambila_roz': 'https://buchetefloria.wordpress.com/wp-content/uploads/2015/02/zambila-roz.jpg',
  'zinnia': 'https://www.plantazia.ro/cdn/shop/files/Seminte-Flori-Carciumarese-_Zinnia-elegans_-galbene1_1280x.gif?v=1684414991'
};

const enhancedBouquetService = {
  // Generează buchet îmbunătățit cu funcționalități noi
  generateEnhancedBouquet: async (message, preferredColors = [], respectLocked = true, diversityLevel = 5, flowerCount = 4) => {
    try {
      console.log('🌟 Generez buchet îmbunătățit pentru:', message);
      console.log('🎨 Culori preferate:', preferredColors);
      console.log('🔢 Numărul de flori:', flowerCount);
      
      // Contactează direct AI Model Bridge
      const response = await axios.post(`${AI_MODEL_BRIDGE_URL}/api/recommend`, {
        message: message.trim(),
        language: 'ro'
      });
      
      console.log('📝 Enhanced response:', response.data);
      
      // Verifică dacă răspunsul este valid
      if (response.data && response.data.success && response.data.result) {
        console.log('✅ Valid AI response found, transforming...');
        return transformAIModelBridgeResponse(response.data.result, flowerCount, message);
      } else {
        console.error('❌ Invalid enhanced response structure:', response.data);
        throw new Error('Răspuns invalid de la serviciul îmbunătățit');
      }
      
    } catch (error) {
      console.error('❌ Eroare la generarea buchetului îmbunătățit:', error);
      throw new Error(`Nu am putut genera buchetul cu culorile selectate: ${error.message}`);
    }
  },

  // Generează variație alternativă pentru același mesaj
  generateAlternativeBouquet: async (message, excludeFlowerIds = []) => {
    try {
      console.log('🔄 Generez variantă alternativă pentru:', message);
      
      // Contactează din nou AI Model Bridge pentru o nouă variantă
      const response = await axios.post(`${AI_MODEL_BRIDGE_URL}/api/recommend`, {
        message: message.trim(),
        language: 'ro'
      });
      
      console.log('📝 Raw alternative response:', response.data);
      
      // Verifică dacă răspunsul este valid
      if (response.data && response.data.success && response.data.result) {
        const transformed = transformAIModelBridgeResponse(response.data.result, 4, message);
        // Marchează ca alternativă
        transformed.bouquetName = `Alternativă: ${transformed.bouquetName}`;
        transformed.aiInsights.isAlternative = true;
        return transformed;
      } else {
        console.error('❌ Invalid response structure:', response.data);
        throw new Error('Răspuns invalid de la serviciul alternativ');
      }
      
    } catch (error) {
      console.error('❌ Eroare la generarea variantei alternative:', error);
      throw handleApiError(error);
    }
  },

  // Generează multiple variații (3 diferite)
  generateMultipleVariations: async (message, count = 3) => {
    try {
      console.log('🎭 Generez', count, 'variații pentru:', message);
      
      const variations = [];
      
      // Generează multiple apeluri pentru a obține variații
      for (let i = 0; i < count; i++) {
        const response = await axios.post(`${AI_MODEL_BRIDGE_URL}/api/recommend`, {
          message: message.trim(),
          language: 'ro'
        });
        
        if (response.data && response.data.success && response.data.result) {
          const transformed = transformAIModelBridgeResponse(response.data.result, 4, message);
          transformed.bouquetName = `Variația ${i + 1}: ${transformed.bouquetName}`;
          transformed.aiInsights.isVariation = true;
          variations.push(transformed);
        }
      }
      
      return variations;
      
    } catch (error) {
      console.error('❌ Eroare la generarea variațiilor:', error);
      throw handleApiError(error);
    }
  },

  // Mock functions pentru funcționalități care nu sunt implementate în AI Model Bridge
  getLockedFlowers: async () => {
    return [];
  },

  lockFlower: async (flowerId, preferredColorId = null, preferredQuantity = null) => {
    console.log('🔒 Mock lock flower:', flowerId);
    return true;
  },

  unlockFlower: async (flowerId) => {
    console.log('🔓 Mock unlock flower:', flowerId);
    return true;
  },

  getAvailableColors: async () => {
    return ['roșu', 'roz', 'alb', 'galben', 'portocaliu', 'mov', 'albastru', 'verde'];
  },

  clearAllLockedFlowers: async () => {
    console.log('🧹 Mock clear all locked flowers');
    return true;
  }
};

// 🖼️ FUNCȚIE PENTRU GĂSIREA IMAGINILOR
function getFlowerImage(flowerKey) {
  if (!flowerKey || typeof flowerKey !== 'string') {
    console.warn('⚠️ Invalid flower key pentru imagine:', flowerKey);
    return 'https://via.placeholder.com/200x200/f0f0f0/666?text=Floare';
  }
  
  // Normalizează numele florii pentru căutare
  const normalizedKey = flowerKey.toLowerCase()
    .trim()
    .replace(/\s+/g, '_')           // înlocuiește spațiile cu _
    .replace(/[^\w]/g, '_')         // înlocuiește caracterele speciale cu _
    .replace(/_+/g, '_')            // înlocuiește multiple _ cu unul singur
    .replace(/^_|_$/g, '');         // elimină _ de la început și sfârșit
  
  // Încearcă să găsească imaginea în baza de date
  let imageUrl = FLOWERS_IMAGE_DATABASE[normalizedKey];
  
  if (imageUrl) {
    console.log(`🖼️ Imagine găsită pentru "${flowerKey}" (${normalizedKey}):`, imageUrl);
    return imageUrl;
  }
  
  // Încearcă variante alternative
  const alternatives = [
    normalizedKey.replace('_', ''),
    normalizedKey.replace('_', '_'),
    normalizedKey.split('_')[0],  // primul cuvânt
    normalizedKey.replace(/s$/, ''), // elimină pluralul
    normalizedKey + 's',             // adaugă pluralul
  ];
  
  for (const alt of alternatives) {
    imageUrl = FLOWERS_IMAGE_DATABASE[alt];
    if (imageUrl) {
      console.log(`🖼️ Imagine găsită cu varianta "${alt}" pentru "${flowerKey}":`, imageUrl);
      return imageUrl;
    }
  }
  
  // Fallback la o imagine placeholder frumoasă
  console.log(`🖼️ Nu s-a găsit imagine pentru "${flowerKey}" (${normalizedKey}), folosesc placeholder`);
  return 'https://via.placeholder.com/200x200/e8f5e8/4a7c59?text=' + encodeURIComponent(flowerKey.slice(0, 10));
}

// Transformă răspunsul de la AI Model Bridge în formatul așteptat de frontend
const transformAIModelBridgeResponse = (apiResponse, requestedFlowerCount = 4, originalMessage = '') => {
  console.log('🔄 Transforming AI Model Bridge response:', apiResponse);
  console.log('🔢 Requested flower count:', requestedFlowerCount);
  
  // Mapare de culori pentru display
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
  
  // Mapare nume flori pentru display frumos
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
  
  // Explicații pentru selecția florilor bazate pe categorie
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
  
  const category = apiResponse.category || 'general';
  const suggestedFlowers = apiResponse.suggested_flowers || [];
  const suggestedColors = apiResponse.suggested_colors || [];
  
  // Limitează florile la numărul cerut
  const limitedFlowers = suggestedFlowers.slice(0, requestedFlowerCount);
  
  console.log(`✂️ Limited flowers from ${suggestedFlowers.length} to ${limitedFlowers.length}`);
  
  return {
    bouquetName: `Buchet ${category.charAt(0).toUpperCase() + category.slice(1)}`,
    messageInterpretation: apiResponse.explanation || 
                         `Am interpretat mesajul "${originalMessage}" ca fiind despre ${category}. ${apiResponse.explanation || ''}`,
    flowers: limitedFlowers.map((flowerKey, index) => ({
      flowerId: flowerKey || `ai_flower_${index}`,
      flowerName: flowerNameMap[flowerKey.toLowerCase()] || 
                 (typeof flowerKey === 'string' ? 
                  flowerKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                  `Floare ${index + 1}`),
      reason: categoryReasons[category] || 'Aleasă pentru frumusețea și simbolismul ei unic',
      imageUrl: getFlowerImage(flowerKey), // 🖼️ ADAUGĂ IMAGINEA!
      quantity: Math.floor(Math.random() * 3) + 3, // 3-5 fire
      color: colorMap[suggestedColors[index]] || colorMap[suggestedColors[0]] || 'natural'
    })),
    aiInsights: {
      category: category,
      confidence: apiResponse.confidence || 0.8,
      sentimentScore: apiResponse.sentiment_score,
      suggestedColors: suggestedColors.map(color => colorMap[color] || color),
      estimatedPrice: apiResponse.estimated_price,
      isAlternative: false,
      isVariation: false,
      flowerCount: limitedFlowers.length,
      requestedCount: requestedFlowerCount,
      modelUsed: apiResponse.model_used || false,
      flowersDatabase: apiResponse.flowers_database_used || false
    }
  };
};

// Gestionează erorile API
const handleApiError = (error) => {
  if (error.response) {
    if (error.response.status === 401) {
      return new Error('Trebuie să te autentifici pentru a folosi funcțiile avansate.');
    } else if (error.response.status === 403) {
      return new Error('Nu ai permisiunea să folosești această funcționalitate.');
    } else if (error.response.status === 500) {
      return new Error('Eroare de server. Te rugăm să încerci din nou.');
    } else {
      return new Error(`Eroare: ${error.response.data?.message || 'Ceva nu a mers bine'}`);
    }
  } else if (error.request) {
    return new Error('Nu s-a primit răspuns de la server. Verifică conexiunea.');
  } else {
    return error;
  }
};

export default enhancedBouquetService;