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
  showAnalysisBtn: document.getElementById('showAnalysisBtn'),
  showSolutionBtn: document.getElementById('showSolutionBtn'),
  tryAgainBtn: document.getElementById('tryAgainBtn'),
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

function showBasicAnalysis(score) {
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

  const wrongTopics = state.wrongAnswers
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
      </div>
      ${
        wrongTopics.length > 0
          ? `
      <div class="wrong-topics">
        <h4>📚 Tekrar Çalışmanız Gereken Konular:</h4>
        <ul>
          ${wrongTopics
            .map(
              (topic) =>
                `<li><strong>${topic}</strong> konusunu tekrar çalışın</li>`
            )
            .join('')}
        </ul>
      </div>
      `
          : ''
      }
      <div class="recommendations">
        <h4>📚 Öneriler:</h4>
        <ul>
          <li>Quiz'i tekrar çözerek pratik yapın</li>
          <li>Yanlış cevapladığınız soruların açıklamalarını inceleyin</li>
          <li>Her konuyu çalıştıktan sonra o konuya özel soruları tekrar çözün</li>
          <li>Kronolojik sırayı takip ederek çalışın (1839-1878)</li>
          <li>Tanzimat Dönemi temel kavramlarını tekrar gözden geçirin</li>
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

  // Butonları normal duruma getir (cevap verilene kadar)
  el.nextBtn.style.display = 'inline-block';
  el.showAnalysisBtn.style.display = 'none';
  el.tryAgainBtn.style.display = 'none';
  el.tryAgainBtn.disabled = false;

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

    // 10. soruya geldiğinde "Sınav Analizini Gör" butonunu göster
    if (state.index === state.questions.length - 1) {
      el.nextBtn.style.display = 'none';
      el.showAnalysisBtn.style.display = 'inline-block';
      el.showAnalysisBtn.disabled = false; // Aktif hale getir
    } else {
      el.nextBtn.disabled = false;
    }

    el.solutionText.innerHTML = `<strong>Doğru cevap:</strong> ${q.options[correctIdx].text}<br><br>${q.options[correctIdx].explain}`;
    el.solutionBox.hidden = false;
  } else {
    // Track wrong answer for analysis
    state.wrongAnswers.push({
      question: q.q,
      topic: q.id,
      selectedAnswer: q.options[sel].text,
      correctAnswer: q.options[correctIdx].text,
    });

    // For incorrect answers, don't show hints or solution immediately
    el.feedback.textContent =
      'Cevabınızı gözden geçirmek için tekrar deneyebilir veya çözümü görmek için "Çözümü Göster" butonuna tıklayabilirsiniz.';
    el.feedback.className = 'feedback err';
    el.solutionBox.hidden = true; // Don't show solution immediately for incorrect answers
    el.solutionText.innerHTML = '';

    // 10. soruya geldiğinde "Sınav Analizini Gör" butonunu göster
    if (state.index === state.questions.length - 1) {
      el.nextBtn.style.display = 'none';
      el.showAnalysisBtn.style.display = 'inline-block';
      el.showAnalysisBtn.disabled = false; // Aktif hale getir
    } else {
      el.nextBtn.disabled = false;
    }

    // Show Try Again button for incorrect answers
    el.tryAgainBtn.style.display = 'inline-block';
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

  // 10. soruya geldiğinde "Sınav Analizini Gör" butonunu göster
  if (state.index === state.questions.length - 1) {
    el.nextBtn.style.display = 'none';
    el.showAnalysisBtn.style.display = 'inline-block';
    el.showAnalysisBtn.disabled = false; // Aktif hale getir
  } else {
    el.nextBtn.disabled = false;
  }

  // Disable "Try Again" and "Show Solution" buttons when solution is shown
  el.tryAgainBtn.disabled = true;
  el.showSolutionBtn.disabled = true;

  // Update feedback message when solution is shown
  if (!q.options[sel].correct) {
    el.feedback.textContent =
      'Çözüm gösterildi. Sonraki soruya geçebilirsiniz.';
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

  // Show "Try Again" button for time up
  el.tryAgainBtn.style.display = 'inline-block';

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

  // Don't show result card automatically - user will click "Sınav Analizini Gör" to see it
  el.resultCard.hidden = true;
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
el.showAnalysisBtn.addEventListener('click', () => {
  // First show the result card, then show analysis
  el.resultCard.hidden = false;
  el.scoreLine.textContent = `Puanınız: ${state.score} / 100`;
  showBasicAnalysis(state.score);
  el.showAnalysisBtn.style.display = 'none';
});
el.showSolutionBtn.addEventListener('click', () => showSolution());
el.tryAgainBtn.addEventListener('click', () => {
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
  el.tryAgainBtn.style.display = 'none';
  el.tryAgainBtn.disabled = false;
  lockChoices(false);

  // Reset "Sıfırla" button color to normal
  el.restartBtn.style.color = '';

  // Start timer again
  startTimer();

  // If this is the last question, disable "Show Analysis" button
  if (state.index === state.questions.length - 1) {
    el.showAnalysisBtn.disabled = true;
  }
});
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

  // Reset button states
  el.nextBtn.disabled = true;
  el.nextBtn.style.display = 'inline-block';
  el.showAnalysisBtn.style.display = 'none';
  el.tryAgainBtn.style.display = 'none';
  el.tryAgainBtn.disabled = false;

  renderCurrent();
  el.timer.textContent = fmt(state.secondsLeft);
  updateHeader();
}

applyFont();
initToolbar();
startQuiz();
