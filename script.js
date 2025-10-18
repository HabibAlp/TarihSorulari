/* ===============================
   AYARLAR ve DURUM
==================================*/
const QUESTION_DURATION = 60; // her soru 60 sn
const POINTS_PER_CORRECT = 10; // 10 soru x 10 = 100
const SHUFFLE_QUESTIONS = true;
const SHUFFLE_OPTIONS = true;

const QUIZ_KEY = 'tanzimat-quiz';
const SETTINGS_KEY = `${QUIZ_KEY}:settings`;
const DEFAULT_SETTINGS = { fontScale: 1, tts: false };

// Google Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyCX7fDvq6hm7a1RE190Bk1c675IvLDtRcY'; // Buraya API key'inizi yazın
// Google Cloud AI Companion API endpoint (with CORS proxy)
const GEMINI_API_URL =
  'https://cors-anywhere.herokuapp.com/https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

let settings = loadSettings();
function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
      : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}
function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/* ===============================
   ELEMANLAR
==================================*/
const el = {
  timer: document.getElementById('timer'),
  progress: document.getElementById('progress'),
  score: document.getElementById('score'),
  restartBtn: document.getElementById('restartBtn'),
  qTitle: document.getElementById('q-title'),
  fieldset: document.getElementById('optionsFieldset'),
  submitBtn: document.getElementById('submitBtn'),
  nextBtn: document.getElementById('nextBtn'),
  showSolutionBtn: document.getElementById('showSolutionBtn'),
  feedback: document.getElementById('feedback'),
  solutionBox: document.getElementById('solutionBox'),
  solutionText: document.getElementById('solutionText'),
  resultCard: document.getElementById('resultCard'),
  scoreLine: document.getElementById('scoreLine'),
  playAgainBtn: document.getElementById('playAgainBtn'),
  // araçlar
  fontMinus: document.getElementById('fontMinus'),
  fontPlus: document.getElementById('fontPlus'),
  ttsToggle: document.getElementById('ttsToggle'),
};

let state = {
  questions: [],
  index: 0,
  secondsLeft: QUESTION_DURATION,
  timerId: null,
  score: 0,
  wrongAnswers: [], // Yanlış cevapları takip et
};

/* ===============================
   SORULAR (10 adet – Tanzimat)
==================================*/
const QUESTIONS = [
  {
    id: 'tan-01',
    q: "Tanzimat Fermanı'nın (1839) hazırlanmasında en etkili isim aşağıdakilerden hangisidir?",
    options: [
      {
        text: 'Mustafa Reşid Paşa',
        correct: true,
        explain:
          "Fermanın baş mimarıdır; 3 Kasım 1839'da Gülhane'de ilan edilmiştir.",
      },
      {
        text: 'Âli Paşa',
        correct: false,
        explain: 'Tanzimat önderlerindendir; ancak Fermanın mimarı değildir.',
      },
      {
        text: 'Fuad Paşa',
        correct: false,
        explain:
          'Dönemin önemli devlet adamıdır ama Ferman sürecinin baş aktörü değildir.',
      },
      {
        text: 'Mithat Paşa',
        correct: false,
        explain: 'Daha çok Kanun-i Esasi süreciyle öne çıkar.',
      },
    ],
  },
  {
    id: 'tan-02',
    q: 'Tanzimat Fermanı’nın temel vaatleri arasında doğrudan yer almayan hangisidir?',
    options: [
      {
        text: 'Meşrutiyetin ilanı',
        correct: true,
        explain:
          "Meşrutiyet 1876'da ilan edilmiştir; Tanzimat Fermanında yoktur.",
      },
      {
        text: 'Can, mal ve namus güvenliği',
        correct: false,
        explain: 'Fermanın temel güvencelerindendir.',
      },
      {
        text: 'Vergi ve askerlikte düzenleme',
        correct: false,
        explain: 'Vergilerin adil toplanması ve askerlikte düzen esastır.',
      },
      {
        text: 'Hukukun üstünlüğü ve yargı güvencesi',
        correct: false,
        explain: 'Keyfî uygulamaları sınırlamayı amaçlar.',
      },
    ],
  },
  {
    id: 'tan-03',
    q: 'Islahat Fermanı (1856) ile özellikle vurgulanan ilke hangisidir?',
    options: [
      {
        text: 'Gayrimüslimlere eşit vatandaşlık haklarının genişletilmesi',
        correct: true,
        explain: 'Eşitlik ve din-mezhep özgürlüğü alanları genişletilmiştir.',
      },
      {
        text: 'Saltanatın kaldırılması',
        correct: false,
        explain: 'Saltanat 1922’de kaldırılmıştır.',
      },
      {
        text: 'Anayasanın kabulü',
        correct: false,
        explain: "1876'da Kanun-i Esasi kabul edilmiştir.",
      },
      {
        text: 'Kapitülasyonların kaldırılması',
        correct: false,
        explain: 'Kapitülasyonlar Lozan (1923) ile kaldırılmıştır.',
      },
    ],
  },
  {
    id: 'tan-04',
    q: 'Aşağıdakilerden hangisi Tanzimat döneminde idari alanda yapılan düzenlemelerdendir?',
    options: [
      {
        text: 'Vilayet Nizamnamesi (1864) ile taşra idaresinin yeniden düzenlenmesi',
        correct: true,
        explain: 'Vilayet-liva-kaza-nahiye yapısı ve meclisler belirginleşti.',
      },
      {
        text: 'Takvim-i Vekayi’nin yayımlanması',
        correct: false,
        explain: "1831'de (Tanzimat öncesi) yayımlanmaya başladı.",
      },
      {
        text: 'Saltanatın verasetten çıkarılması',
        correct: false,
        explain: 'Saltanat usulünde böyle bir değişiklik yapılmadı.',
      },
      {
        text: 'TBMM’nin açılması',
        correct: false,
        explain: 'TBMM 1920’de açılmıştır.',
      },
    ],
  },
  {
    id: 'tan-05',
    q: 'Aşağıdakilerden hangisi Tanzimat döneminde hukuk alanındaki gelişmelerdendir?',
    options: [
      {
        text: 'Mecelle’nin hazırlanması (1869–1876)',
        correct: true,
        explain:
          'Ahmet Cevdet Paşa başkanlığında İslam özel hukukunun kodifikasyonudur.',
      },
      {
        text: 'Tevhid-i Tedrisat Kanunu',
        correct: false,
        explain: '1924’te Cumhuriyet döneminde çıkarılmıştır.',
      },
      {
        text: 'Türk Medeni Kanunu',
        correct: false,
        explain: '1926’da kabul edilmiştir.',
      },
      {
        text: "Basın İlan Kurumu'nun kurulması",
        correct: false,
        explain: 'Cumhuriyet dönemidir.',
      },
    ],
  },
  {
    id: 'tan-06',
    q: 'Aşağıdaki kurumlardan hangisi Tanzimat döneminde eğitim alanındaki gelişmelerdendir?',
    options: [
      {
        text: 'Mekteb-i Mülkiye’nin açılması (1859)',
        correct: true,
        explain: 'Sivil idareci yetiştirmek üzere açılan yüksek okul.',
      },
      {
        text: 'Köy Enstitülerinin kurulması',
        correct: false,
        explain: '1940’lara aittir.',
      },
      {
        text: 'Harbiye’nin kapatılması',
        correct: false,
        explain: 'Harbiye kapatılmadı; modernleşme sürdü.',
      },
      {
        text: 'Latin alfabesinin kabulü',
        correct: false,
        explain: '1928’de gerçekleşti.',
      },
    ],
  },
  {
    id: 'tan-07',
    q: 'İlk özel Türkçe gazete Tercüman-ı Ahval’in (1860) kurucularından biri kimdir?',
    options: [
      {
        text: 'Şinasi',
        correct: true,
        explain: 'Şinasi, Agâh Efendi ile birlikte kurdu.',
      },
      {
        text: 'Ziya Paşa',
        correct: false,
        explain: 'Tasvir-i Efkâr/Hürriyet’te etkili olmuştur.',
      },
      {
        text: 'Namık Kemal',
        correct: false,
        explain: 'Tasvir-i Efkâr ve İbret’te çalışmıştır.',
      },
      {
        text: 'Tevfik Fikret',
        correct: false,
        explain: 'Servet-i Fünun kuşağı; Tanzimat sonrası.',
      },
    ],
  },
  {
    id: 'tan-08',
    q: 'Aşağıdaki yargı kurumlarından hangisi Tanzimat döneminin adliye teşkilatındaki yenilikleriyle ilgilidir?',
    options: [
      {
        text: 'Nizamiye mahkemeleri',
        correct: true,
        explain:
          'Şer’i mahkemelerin yanında laik/karma alanlarda çalışan düzenli mahkemeler.',
      },
      {
        text: 'İstiklal Mahkemeleri',
        correct: false,
        explain: 'Kurtuluş Savaşı ve erken Cumhuriyet dönemi.',
      },
      {
        text: 'Divan-ı Harb-i Örfi',
        correct: false,
        explain: 'Olağanüstü yargı mercii; Tanzimat’ın tipik kurumu değildir.',
      },
      {
        text: 'Yüksek Seçim Kurulu',
        correct: false,
        explain: 'Cumhuriyet dönemine aittir.',
      },
    ],
  },
  {
    id: 'tan-09',
    q: '1876’da ilan edilen Kanun-i Esasi ile doğrudan getirilmeyen unsur aşağıdakilerden hangisidir?',
    options: [
      {
        text: 'Çift meclis (Âyan/Mebusan)',
        correct: false,
        explain: 'Anayasa iki kanatlı meclis öngörür.',
      },
      {
        text: 'Padişahın meclisi fesih yetkisi',
        correct: false,
        explain: 'Padişaha fesih yetkisi tanınmıştır.',
      },
      {
        text: 'Temel hak ve özgürlüklerin güvencesi',
        correct: false,
        explain: 'Kişi dokunulmazlığı, mülkiyet gibi haklar düzenlenmiştir.',
      },
      {
        text: 'Saltanatın kaldırılması',
        correct: true,
        explain:
          'Saltanat 1922’de kaldırılmıştır; Kanun-i Esasi bunu getirmez.',
      },
    ],
  },
  {
    id: 'tan-10',
    q: 'Tanzimat döneminde ulaşım-haberleşme alanındaki gelişmelerden biri değildir:',
    options: [
      {
        text: 'Telgraf hatlarının döşenmesi (Kırım Savaşı yılları)',
        correct: false,
        explain: '1850’lerde yaygınlaştırıldı.',
      },
      {
        text: 'Posta Nezareti’nin kurulması (1840)',
        correct: false,
        explain: 'Modern posta örgütlenmesinin başlangıcıdır.',
      },
      {
        text: 'Demiryollarının yaygınlaşması',
        correct: false,
        explain: 'Tanzimat’ta demiryolu yatırımları artmıştır.',
      },
      {
        text: 'Radyo yayınının başlaması',
        correct: true,
        explain: 'Radyo 1927’de (Cumhuriyet) yayına başladı.',
      },
    ],
  },
];

/* ===============================
   YARDIMCILAR
==================================*/
const shuffle = (arr) =>
  arr
    .map((x) => [Math.random(), x])
    .sort((a, b) => a[0] - b[0])
    .map((p) => p[1]);
const pad = (n) => n.toString().padStart(2, '0');
const fmt = (s) => `⏳ ${pad(Math.floor(s / 60))}:${pad(s % 60)}`;

// Tema artık CSS media query ile otomatik olarak yönetiliyor
function applyFont() {
  document.documentElement.style.setProperty(
    '--fontScale',
    String(settings.fontScale)
  );
}

/* ===============================
   GOOGLE GEMINI AI ANALİZ
==================================*/

// Mevcut modelleri kontrol et
async function checkAvailableModels() {
  const endpoints = [
    `https://cloudaicompanion.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`,
    `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`,
  ];

  for (const endpoint of endpoints) {
    try {
      console.log('🔍 Checking models at:', endpoint);
      const response = await fetch(endpoint);
      const data = await response.json();
      console.log('Available models:', data);
      return data;
    } catch (error) {
      console.log('❌ Endpoint failed:', endpoint, error.message);
    }
  }

  console.error('❌ All model check endpoints failed');
  return null;
}

// CORS test fonksiyonu
async function testCORS() {
  const testEndpoints = [
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    'https://cors-anywhere.herokuapp.com/https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    'https://api.allorigins.win/raw?url=' +
      encodeURIComponent(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
      ),
  ];

  console.log('🔄 Testing CORS endpoints...');

  for (const endpoint of testEndpoints) {
    try {
      console.log('🔍 Testing:', endpoint);
      const response = await fetch(`${endpoint}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Test' }] }],
        }),
      });

      if (response.ok) {
        console.log('✅ CORS working endpoint:', endpoint);
        return endpoint;
      } else {
        console.log('❌ Endpoint failed:', endpoint, response.status);
      }
    } catch (error) {
      console.log('❌ CORS error:', endpoint, error.message);
    }
  }

  console.log('❌ All CORS endpoints failed');
  return null;
}

// API Key detaylarını kontrol et
async function checkAPIKeyDetails() {
  console.log('🔑 API Key:', GEMINI_API_KEY);
  console.log('🔗 API URL:', GEMINI_API_URL);

  // CORS test yap
  const workingEndpoint = await testCORS();
  if (workingEndpoint) {
    console.log('🎯 Using working endpoint:', workingEndpoint);
  }

  try {
    // Önce modelleri kontrol et
    const models = await checkAvailableModels();

    if (models && models.models) {
      const generateContentModels = models.models.filter(
        (m) =>
          m.supportedGenerationMethods &&
          m.supportedGenerationMethods.includes('generateContent')
      );

      console.log(
        '✅ Available models for generateContent:',
        generateContentModels
      );

      if (generateContentModels.length > 0) {
        console.log('🎯 Recommended model:', generateContentModels[0].name);
        return generateContentModels[0].name;
      }
    }

    // Eğer model bulunamazsa, farklı endpoint'leri dene
    const alternativeEndpoints = [
      'https://cloudaicompanion.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      'https://cloudaicompanion.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    ];

    console.log('🔄 Testing alternative endpoints...');

    for (const endpoint of alternativeEndpoints) {
      try {
        const testResponse = await fetch(`${endpoint}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Test' }] }],
          }),
        });

        if (testResponse.ok) {
          console.log('✅ Working endpoint found:', endpoint);
          return endpoint;
        } else {
          console.log('❌ Endpoint failed:', endpoint, testResponse.status);
        }
      } catch (error) {
        console.log('❌ Endpoint error:', endpoint, error.message);
      }
    }
  } catch (error) {
    console.error('❌ API Key check failed:', error);
  }

  return null;
}
async function analyzeQuizResults(score, wrongAnswers) {
  if (
    GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY' ||
    !GEMINI_API_KEY.startsWith('AIza')
  ) {
    return {
      analysis:
        "API key ayarlanmadı veya geçersiz format. Lütfen Google AI Studio'dan geçerli bir API key alın.",
      recommendations: [
        "Google AI Studio'ya gidin",
        'Yeni API key oluşturun',
        "API key'i script.js'e yapıştırın",
      ],
    };
  }

  // Önce mevcut modelleri kontrol et
  const models = await checkAvailableModels();
  if (models && models.models) {
    console.log(
      'Available models for generateContent:',
      models.models.filter(
        (m) =>
          m.supportedGenerationMethods &&
          m.supportedGenerationMethods.includes('generateContent')
      )
    );
  }

  try {
    const wrongTopics = wrongAnswers.map(
      (answer) => answer.topic || answer.question
    );
    const prompt = `
Sen bir eğitim danışmanısın. Kullanıcı Tanzimat Dönemi (1839-1878) konusunda quiz çözdü ve ${score}/100 puan aldı.

Yanlış cevapladığı konular: ${wrongTopics.join(', ')}

Lütfen şunları analiz et:
1. Genel performans değerlendirmesi (çok iyi/iyi/orta/zayıf)
2. Hangi konuları tekrar çalışması gerektiği
3. Öncelik sırasına göre çalışma önerileri
4. Motivasyon verici kısa bir mesaj

Türkçe yanıt ver ve kısa, net öneriler sun. HTML formatında yanıtla.
    `;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Response Error:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response:', data);

    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content
    ) {
      throw new Error('Invalid API response format');
    }

    const analysis = data.candidates[0].content.parts[0].text;

    return {
      analysis: analysis,
      recommendations: extractRecommendations(analysis),
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    console.error('API Key:', GEMINI_API_KEY);
    console.error('Response:', error.message);

    return {
      analysis: `Analiz yapılırken bir hata oluştu: ${error.message}. API key'inizi kontrol edin.`,
      recommendations: [
        'API key formatını kontrol edin',
        "Google AI Studio'dan yeni key alın",
        'İnternet bağlantınızı kontrol edin',
      ],
    };
  }
}

function extractRecommendations(analysis) {
  // Analiz metninden önerileri çıkar
  const lines = analysis.split('\n').filter((line) => line.trim());
  const recommendations = [];

  lines.forEach((line) => {
    if (
      line.includes('•') ||
      line.includes('-') ||
      line.includes('1.') ||
      line.includes('2.')
    ) {
      const cleanLine = line.replace(/^[\d\-\•\s]+/, '').trim();
      if (cleanLine.length > 0) {
        recommendations.push(cleanLine);
      }
    }
  });

  return recommendations.length > 0
    ? recommendations
    : ['Detaylı analiz için tekrar deneyin'];
}

function showAIAnalysis(score, wrongAnswers) {
  const analysisContainer = document.getElementById('aiAnalysis');
  if (!analysisContainer) return Promise.reject('Analysis container not found');

  analysisContainer.innerHTML =
    '<div class="loading">🤖 Analiz yapılıyor...</div>';
  analysisContainer.style.display = 'block';

  return analyzeQuizResults(score, wrongAnswers).then((result) => {
    analysisContainer.innerHTML = `
      <div class="ai-analysis">
        <h3>🤖 Yapay Zeka Analizi</h3>
        <div class="analysis-content">${result.analysis}</div>
        <div class="recommendations">
          <h4>📚 Öneriler:</h4>
          <ul>
            ${result.recommendations.map((rec) => `<li>${rec}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  });
}

function showBasicAnalysis(score, wrongAnswers) {
  const analysisContainer = document.getElementById('aiAnalysis');
  if (!analysisContainer) return;

  let performance = '';
  if (score >= 90) performance = 'Mükemmel! 🌟';
  else if (score >= 80) performance = 'Çok İyi! 👏';
  else if (score >= 70) performance = 'İyi! 👍';
  else if (score >= 60) performance = 'Orta 📚';
  else performance = 'Geliştirilmeli 🔄';

  // Konu ID'lerini gerçek konu isimlerine çevir
  const topicNames = {
    'tan-01': 'Tanzimat Fermanı (1839)',
    'tan-02': 'Islahat Fermanı (1856)',
    'tan-03': 'Tanzimat Dönemi Yenilikleri',
    'tan-04': 'Tanzimat Dönemi Edebiyatı',
    'tan-05': 'Tanzimat Dönemi Eğitim',
    'tan-06': 'Tanzimat Dönemi Hukuk',
    'tan-07': 'Tanzimat Dönemi Ekonomi',
    'tan-08': 'Tanzimat Dönemi Askeri',
    'tan-09': 'Tanzimat Dönemi Sosyal Hayat',
    'tan-10': 'Tanzimat Dönemi Sonuçları',
  };

  const wrongTopics = wrongAnswers
    .map((answer) => answer.topic)
    .filter((topic, index, arr) => arr.indexOf(topic) === index)
    .map((topic) => topicNames[topic] || topic); // ID varsa ismi, yoksa ID'yi kullan

  // Performans değerlendirmesi
  let detailedAnalysis = '';
  if (score >= 90) {
    detailedAnalysis =
      'Harika bir performans! Tanzimat Dönemi konusunda çok iyi bir seviyedesiniz.';
  } else if (score >= 80) {
    detailedAnalysis =
      'Çok iyi bir performans! Sadece birkaç konuyu tekrar gözden geçirmeniz yeterli.';
  } else if (score >= 70) {
    detailedAnalysis =
      'İyi bir performans! Bazı konuları daha detaylı çalışmanız faydalı olacak.';
  } else if (score >= 60) {
    detailedAnalysis =
      'Orta seviyede bir performans. Konuları daha sistematik çalışmanızı öneriyoruz.';
  } else {
    detailedAnalysis =
      'Bu konuları daha detaylı çalışmanız gerekiyor. Temel kavramları tekrar gözden geçirin.';
  }

  analysisContainer.innerHTML = `
    <div class="ai-analysis">
      <h3>📊 Performans Analizi</h3>
      <div class="analysis-content">
        <p><strong>Genel Değerlendirme:</strong> ${performance}</p>
        <p><strong>Puanınız:</strong> ${score}/100</p>
        <p><strong>Detaylı Analiz:</strong> ${detailedAnalysis}</p>
        ${
          wrongTopics.length > 0
            ? `<p><strong>Tekrar Çalışmanız Gereken Konular:</strong></p>`
            : ''
        }
      </div>
      <div class="recommendations">
        <h4>📚 Öneriler:</h4>
        <ul>
          ${wrongTopics
            .map(
              (topic) =>
                `<li><strong>${topic}</strong> konusunu tekrar çalışın</li>`
            )
            .join('')}
          <li>Quiz'i tekrar çözerek pratik yapın</li>
          <li>Yanlış cevapladığınız soruların açıklamalarını inceleyin</li>
          <li>Her konuyu çalıştıktan sonra o konuya özel soruları tekrar çözün</li>
          <li>Kronolojik sırayı takip ederek çalışın (1839-1878)</li>
        </ul>
      </div>
    </div>
  `;
  analysisContainer.style.display = 'block';
}

/* ===============================
   TTS (Sesli Oku)
==================================*/
function supportsTTS() {
  return 'speechSynthesis' in window;
}
let currentUtterance = null;
function buildCurrentText() {
  const q = state.questions[state.index];
  if (!q) return '';
  const opts = q.options
    .map((o, i) => `Seçenek ${i + 1}: ${o.text}`)
    .join('. ');
  return `${q.q}. ${opts}`;
}
function ttsStart() {
  if (!supportsTTS()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(buildCurrentText());
  u.lang = 'tr-TR';
  u.rate = 1.0;
  currentUtterance = u;
  window.speechSynthesis.speak(u);
  settings.tts = true;
  saveSettings();
}
function ttsStop() {
  if (!supportsTTS()) return;
  window.speechSynthesis.cancel();
  currentUtterance = null;
  settings.tts = false;
  saveSettings();
}
function ttsOnQuestionChange() {
  if (supportsTTS()) window.speechSynthesis.cancel();
  currentUtterance = null;
}

/* ===============================
   ZAMANLAYICI & DURUM
==================================*/
function clearTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}
function startTimer() {
  clearTimer();
  state.secondsLeft = QUESTION_DURATION;
  el.timer.textContent = fmt(state.secondsLeft);
  state.timerId = setInterval(() => {
    state.secondsLeft--;
    if (state.secondsLeft <= 0) {
      state.secondsLeft = 0;
      el.timer.textContent = fmt(state.secondsLeft);
      clearTimer();
      handleTimeUp();
    } else {
      el.timer.textContent = fmt(state.secondsLeft);
    }
  }, 1000);
}

function updateHeader() {
  el.progress.textContent = `Soru ${Math.min(
    state.index + 1,
    state.questions.length
  )} / ${state.questions.length}`;
  el.score.textContent = `Puan: ${state.score}`;
}

function buildQuestions() {
  const qs = SHUFFLE_QUESTIONS ? shuffle(QUESTIONS) : QUESTIONS.slice();
  return qs.map((q) => ({
    ...q,
    options: SHUFFLE_OPTIONS ? shuffle(q.options) : q.options.slice(),
  }));
}

function renderCurrent() {
  ttsOnQuestionChange();
  const q = state.questions[state.index];
  el.qTitle.textContent = q.q;
  el.fieldset.innerHTML = q.options
    .map((op, i) => {
      const id = `opt-${q.id}-${i}`;
      const letter = String.fromCharCode(65 + i); // A, B, C, D
      return `
      <div class="option" data-option-index="${i}">
        <div class="option-letter" data-letter="${letter}">${letter}</div>
        <div class="option-content">
          <div class="option-text">${op.text}</div>
          <div class="explain" id="exp-${q.id}-${i}">${op.explain}</div>
        </div>
      </div>`;
    })
    .join('');
  el.feedback.className = 'feedback';
  el.feedback.textContent = '';
  el.solutionBox.hidden = true;
  el.solutionText.innerHTML = '';
  el.nextBtn.disabled = true;
  el.submitBtn.disabled = true;
  el.showSolutionBtn.disabled = true;
  lockChoices(false);
  startTimer();
  updateHeader();
}

function lockChoices(lock = true) {
  el.fieldset.querySelectorAll('.option').forEach((option) => {
    option.style.pointerEvents = lock ? 'none' : 'auto';
    // Don't remove selected class when locking - keep visual selection
  });
}

function showExplain(q, idx, show = true) {
  const d = document.getElementById(`exp-${q.id}-${idx}`);
  if (d) d.style.display = show ? 'block' : 'none';
}

function evaluate() {
  const q = state.questions[state.index];
  const selEl = el.fieldset.querySelector('.option.selected');
  if (!selEl) {
    el.feedback.textContent = 'Lütfen bir seçenek işaretleyin.';
    el.feedback.className = 'feedback err';
    return false;
  }
  const sel = Number(selEl.dataset.optionIndex);
  const correctIdx = q.options.findIndex((o) => o.correct);
  const isCorrect = q.options[sel].correct === true;

  if (isCorrect) {
    // For correct answers, show hints and solution immediately
    showExplain(q, sel, true);
    if (sel !== correctIdx) showExplain(q, correctIdx, true);

    state.score += POINTS_PER_CORRECT;
    el.feedback.textContent = 'Doğru! 👏';
    el.feedback.className = 'feedback ok';
    el.nextBtn.disabled = false;
    el.solutionText.innerHTML = `<strong>Doğru cevap:</strong> ${q.options[correctIdx].text}<br><br>${q.options[correctIdx].explain}`;
    el.solutionBox.hidden = false;
  } else {
    // For incorrect answers, don't show hints or solution immediately
    el.feedback.textContent =
      'Lütfen tekrar deneyin veya çözümü görmek için "Çözümü Göster" butonuna tıklayın.';
    el.feedback.className = 'feedback err';
    el.solutionBox.hidden = true; // Don't show solution immediately for incorrect answers
    el.solutionText.innerHTML = '';

    // Track wrong answer for AI analysis
    state.wrongAnswers.push({
      question: q.q,
      topic: q.id,
      selectedAnswer: q.options[sel].text,
      correctAnswer: q.options[correctIdx].text,
    });

    // Enable "Sonraki Soru" button for incorrect answers too
    el.nextBtn.disabled = false;

    // Add Try Again button for incorrect answers
    if (!el.fieldset.querySelector('.try-again-btn')) {
      const tryAgainBtn = document.createElement('button');
      tryAgainBtn.className = 'btn secondary try-again-btn';
      tryAgainBtn.textContent = 'Tekrar Dene';
      tryAgainBtn.addEventListener('click', () => {
        el.fieldset
          .querySelectorAll('.option')
          .forEach((opt) => opt.classList.remove('selected'));
        el.feedback.textContent = '';
        el.feedback.className = 'feedback';
        el.solutionBox.hidden = true;
        el.solutionText.innerHTML = '';
        el.nextBtn.disabled = true;
        el.submitBtn.disabled = true;
        el.showSolutionBtn.disabled = true;
        tryAgainBtn.remove();
        lockChoices(false);

        // Reset "Sıfırla" button color to normal
        el.restartBtn.style.color = '';

        // Start timer again
        startTimer();
      });
      el.fieldset.appendChild(tryAgainBtn);
    }
  }

  el.submitBtn.disabled = true;
  el.showSolutionBtn.disabled = false;
  lockChoices(true);
  clearTimer();
  updateHeader();
  return true;
}

function showSolution() {
  const q = state.questions[state.index];
  const correctIdx = q.options.findIndex((o) => o.correct);
  const selEl = el.fieldset.querySelector('.option.selected');

  if (!selEl) {
    el.feedback.textContent = 'Lütfen önce bir seçenek işaretleyin.';
    el.feedback.className = 'feedback err';
    return;
  }

  const sel = Number(selEl.dataset.optionIndex);

  // Show explanations for all options when solution is requested
  q.options.forEach((_, i) => showExplain(q, i, true));

  el.solutionText.innerHTML = `<strong>Doğru cevap:</strong> ${q.options[correctIdx].text}<br><br>${q.options[correctIdx].explain}`;
  el.solutionBox.hidden = false;
  el.nextBtn.disabled = false;

  // Disable "Try Again" button when solution is shown
  const tryAgainBtn = el.fieldset.querySelector('.try-again-btn');
  if (tryAgainBtn) {
    tryAgainBtn.disabled = true;
  }

  // Update feedback message when solution is shown
  if (!q.options[sel].correct) {
    el.feedback.textContent =
      'Çözüm gösterildi. Artık sonraki soruya geçebilirsiniz.';
    el.feedback.className = 'feedback err';
  }
}

function handleTimeUp() {
  el.feedback.textContent = 'Süre bitti.';
  el.feedback.className = 'feedback err';
  el.solutionBox.hidden = true;
  el.solutionText.innerHTML = '';
  lockChoices(true);

  // Make "Sıfırla" button text red
  el.restartBtn.style.color = 'var(--err)';

  // Add "Try Again" button for time up
  if (!el.fieldset.querySelector('.try-again-btn')) {
    const tryAgainBtn = document.createElement('button');
    tryAgainBtn.className = 'btn secondary try-again-btn';
    tryAgainBtn.textContent = 'Tekrar Dene';
    tryAgainBtn.addEventListener('click', () => {
      el.fieldset
        .querySelectorAll('.option')
        .forEach((opt) => opt.classList.remove('selected'));
      el.feedback.textContent = '';
      el.feedback.className = 'feedback';
      el.solutionBox.hidden = true;
      el.solutionText.innerHTML = '';
      el.nextBtn.disabled = true;
      el.submitBtn.disabled = true;
      el.showSolutionBtn.disabled = true;
      tryAgainBtn.remove();
      lockChoices(false);

      // Reset "Sıfırla" button color to normal
      el.restartBtn.style.color = '';

      // Start timer again
      startTimer();
    });
    el.fieldset.appendChild(tryAgainBtn);
  }

  // Don't enable next button when time runs out - user must select an option first
}

function nextQuestion() {
  if (state.index < state.questions.length - 1) {
    state.index++;
    renderCurrent();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  clearTimer();
  lockChoices(true);
  el.resultCard.hidden = false;
  el.scoreLine.textContent = `Puanınız: ${state.score} / 100`;

  // Show AI analysis (with fallback to basic analysis)
  // Temporarily using basic analysis due to CORS issues
  showBasicAnalysis(state.score, state.wrongAnswers);

  // Uncomment below to try AI analysis again
  // showAIAnalysis(state.score, state.wrongAnswers).catch((error) => {
  //   console.error('AI Analysis failed, showing basic analysis:', error);
  //   showBasicAnalysis(state.score, state.wrongAnswers);
  // });
}

/* ===============================
   OLAYLAR
==================================*/
el.restartBtn.addEventListener('click', () => {
  clearTimer();
  startQuiz();
});
el.submitBtn.addEventListener('click', () => evaluate());
el.nextBtn.addEventListener('click', () => nextQuestion());
el.showSolutionBtn.addEventListener('click', () => showSolution());
el.playAgainBtn.addEventListener('click', () => {
  clearTimer();
  startQuiz();
  el.resultCard.hidden = true;
});

// Click handler for options
el.fieldset.addEventListener('click', (e) => {
  const option = e.target.closest('.option');
  if (option && option.style.pointerEvents !== 'none') {
    // Clear previous selection
    el.fieldset
      .querySelectorAll('.option')
      .forEach((opt) => opt.classList.remove('selected'));
    // Select current option
    option.classList.add('selected');
    // Enable submit button when option is selected
    el.submitBtn.disabled = false;
  }
});

// Klavye: seçenek üzerinde Enter ile onayla
el.fieldset.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target && e.target.closest('.option')) {
    e.preventDefault();
    evaluate();
  }
});

/* ===============================
   ARAÇ ÇUBUĞU (Tema, Yazı, TTS)
==================================*/
function initToolbar() {
  // Tema artık CSS media query ile otomatik olarak yönetiliyor

  // Yazı boyutu
  el.fontMinus.addEventListener('click', () => {
    settings.fontScale = Math.max(0.9, +(settings.fontScale - 0.1).toFixed(1));
    saveSettings();
    applyFont();
  });
  el.fontPlus.addEventListener('click', () => {
    settings.fontScale = Math.min(1.3, +(settings.fontScale + 0.1).toFixed(1));
    saveSettings();
    applyFont();
  });

  // TTS
  if (!supportsTTS()) {
    el.ttsToggle.classList.add('disabled');
    el.ttsToggle.title = 'Tarayıcınız sesli okumayı desteklemiyor';
  }
  el.ttsToggle.addEventListener('click', () => {
    if (settings.tts) ttsStop();
    else ttsStart();
  });
}

/* ===============================
   BAŞLAT
==================================*/
function startQuiz() {
  state.questions = buildQuestions();
  state.index = 0;
  state.score = 0;
  state.wrongAnswers = []; // Reset wrong answers
  el.resultCard.hidden = true;

  // Reset "Sıfırla" button color to normal
  el.restartBtn.style.color = '';

  // API Key detaylarını kontrol et
  checkAPIKeyDetails();

  renderCurrent();
  el.timer.textContent = fmt(state.secondsLeft);
  updateHeader();
}

applyFont();
initToolbar();
startQuiz();
