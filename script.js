/* ===============================
   AYARLAR ve DURUM
==================================*/
const QUESTION_DURATION = 60;      // her soru 60 sn
const POINTS_PER_CORRECT = 10;     // 10 soru x 10 = 100
const SHUFFLE_QUESTIONS = true;
const SHUFFLE_OPTIONS  = true;

const QUIZ_KEY = "tanzimat-quiz";
const SETTINGS_KEY = `${QUIZ_KEY}:settings`;
const DEFAULT_SETTINGS = { theme: "light", fontScale: 1, tts: false }; // sadece light/dark

let settings = loadSettings();
function loadSettings(){
  try{
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? {...DEFAULT_SETTINGS, ...JSON.parse(raw)} : {...DEFAULT_SETTINGS};
  }catch{ return {...DEFAULT_SETTINGS}; }
}
function saveSettings(){ localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }

/* ===============================
   ELEMANLAR
==================================*/
const el = {
  timer: document.getElementById("timer"),
  progress: document.getElementById("progress"),
  score: document.getElementById("score"),
  restartBtn: document.getElementById("restartBtn"),
  qTitle: document.getElementById("q-title"),
  fieldset: document.getElementById("optionsFieldset"),
  submitBtn: document.getElementById("submitBtn"),
  nextBtn: document.getElementById("nextBtn"),
  showSolutionBtn: document.getElementById("showSolutionBtn"),
  feedback: document.getElementById("feedback"),
  solutionBox: document.getElementById("solutionBox"),
  solutionText: document.getElementById("solutionText"),
  resultCard: document.getElementById("resultCard"),
  scoreLine: document.getElementById("scoreLine"),
  playAgainBtn: document.getElementById("playAgainBtn"),
  // araçlar
  themeToggle: document.getElementById("themeToggle"),
  fontMinus: document.getElementById("fontMinus"),
  fontPlus: document.getElementById("fontPlus"),
  ttsToggle: document.getElementById("ttsToggle"),
};

let state = {
  questions: [],
  index: 0,
  secondsLeft: QUESTION_DURATION,
  timerId: null,
  score: 0
};

/* ===============================
   SORULAR (10 adet – Tanzimat)
==================================*/
const QUESTIONS = [
  { id:"tan-01", q:"Tanzimat Fermanı'nın (1839) hazırlanmasında en etkili isim aşağıdakilerden hangisidir?",
    options:[
      {text:"Mustafa Reşid Paşa", correct:true,  explain:"Fermanın baş mimarıdır; 3 Kasım 1839'da Gülhane'de ilan edilmiştir."},
      {text:"Âli Paşa",           correct:false, explain:"Tanzimat önderlerindendir; ancak Fermanın mimarı değildir."},
      {text:"Fuad Paşa",          correct:false, explain:"Dönemin önemli devlet adamıdır ama Ferman sürecinin baş aktörü değildir."},
      {text:"Mithat Paşa",        correct:false, explain:"Daha çok Kanun-i Esasi süreciyle öne çıkar."}
    ]},
  { id:"tan-02", q:"Tanzimat Fermanı’nın temel vaatleri arasında doğrudan yer almayan hangisidir?",
    options:[
      {text:"Meşrutiyetin ilanı", correct:true,  explain:"Meşrutiyet 1876'da ilan edilmiştir; Tanzimat Fermanında yoktur."},
      {text:"Can, mal ve namus güvenliği", correct:false, explain:"Fermanın temel güvencelerindendir."},
      {text:"Vergi ve askerlikte düzenleme", correct:false, explain:"Vergilerin adil toplanması ve askerlikte düzen esastır."},
      {text:"Hukukun üstünlüğü ve yargı güvencesi", correct:false, explain:"Keyfî uygulamaları sınırlamayı amaçlar."}
    ]},
  { id:"tan-03", q:"Islahat Fermanı (1856) ile özellikle vurgulanan ilke hangisidir?",
    options:[
      {text:"Gayrimüslimlere eşit vatandaşlık haklarının genişletilmesi", correct:true,  explain:"Eşitlik ve din-mezhep özgürlüğü alanları genişletilmiştir."},
      {text:"Saltanatın kaldırılması", correct:false, explain:"Saltanat 1922’de kaldırılmıştır."},
      {text:"Anayasanın kabulü", correct:false, explain:"1876'da Kanun-i Esasi kabul edilmiştir."},
      {text:"Kapitülasyonların kaldırılması", correct:false, explain:"Kapitülasyonlar Lozan (1923) ile kaldırılmıştır."}
    ]},
  { id:"tan-04", q:"Aşağıdakilerden hangisi Tanzimat döneminde idari alanda yapılan düzenlemelerdendir?",
    options:[
      {text:"Vilayet Nizamnamesi (1864) ile taşra idaresinin yeniden düzenlenmesi", correct:true,  explain:"Vilayet-liva-kaza-nahiye yapısı ve meclisler belirginleşti."},
      {text:"Takvim-i Vekayi’nin yayımlanması", correct:false, explain:"1831'de (Tanzimat öncesi) yayımlanmaya başladı."},
      {text:"Saltanatın verasetten çıkarılması", correct:false, explain:"Saltanat usulünde böyle bir değişiklik yapılmadı."},
      {text:"TBMM’nin açılması", correct:false, explain:"TBMM 1920’de açılmıştır."}
    ]},
  { id:"tan-05", q:"Aşağıdakilerden hangisi Tanzimat döneminde hukuk alanındaki gelişmelerdendir?",
    options:[
      {text:"Mecelle’nin hazırlanması (1869–1876)", correct:true,  explain:"Ahmet Cevdet Paşa başkanlığında İslam özel hukukunun kodifikasyonudur."},
      {text:"Tevhid-i Tedrisat Kanunu", correct:false, explain:"1924’te Cumhuriyet döneminde çıkarılmıştır."},
      {text:"Türk Medeni Kanunu", correct:false, explain:"1926’da kabul edilmiştir."},
      {text:"Basın İlan Kurumu'nun kurulması", correct:false, explain:"Cumhuriyet dönemidir."}
    ]},
  { id:"tan-06", q:"Aşağıdaki kurumlardan hangisi Tanzimat döneminde eğitim alanındaki gelişmelerdendir?",
    options:[
      {text:"Mekteb-i Mülkiye’nin açılması (1859)", correct:true,  explain:"Sivil idareci yetiştirmek üzere açılan yüksek okul."},
      {text:"Köy Enstitülerinin kurulması", correct:false, explain:"1940’lara aittir."},
      {text:"Harbiye’nin kapatılması", correct:false, explain:"Harbiye kapatılmadı; modernleşme sürdü."},
      {text:"Latin alfabesinin kabulü", correct:false, explain:"1928’de gerçekleşti."}
    ]},
  { id:"tan-07", q:"İlk özel Türkçe gazete Tercüman-ı Ahval’in (1860) kurucularından biri kimdir?",
    options:[
      {text:"Şinasi", correct:true,  explain:"Şinasi, Agâh Efendi ile birlikte kurdu."},
      {text:"Ziya Paşa", correct:false, explain:"Tasvir-i Efkâr/Hürriyet’te etkili olmuştur."},
      {text:"Namık Kemal", correct:false, explain:"Tasvir-i Efkâr ve İbret’te çalışmıştır."},
      {text:"Tevfik Fikret", correct:false, explain:"Servet-i Fünun kuşağı; Tanzimat sonrası."}
    ]},
  { id:"tan-08", q:"Aşağıdaki yargı kurumlarından hangisi Tanzimat döneminin adliye teşkilatındaki yenilikleriyle ilgilidir?",
    options:[
      {text:"Nizamiye mahkemeleri", correct:true,  explain:"Şer’i mahkemelerin yanında laik/karma alanlarda çalışan düzenli mahkemeler."},
      {text:"İstiklal Mahkemeleri", correct:false, explain:"Kurtuluş Savaşı ve erken Cumhuriyet dönemi."},
      {text:"Divan-ı Harb-i Örfi", correct:false, explain:"Olağanüstü yargı mercii; Tanzimat’ın tipik kurumu değildir."},
      {text:"Yüksek Seçim Kurulu", correct:false, explain:"Cumhuriyet dönemine aittir."}
    ]},
  { id:"tan-09", q:"1876’da ilan edilen Kanun-i Esasi ile doğrudan getirilmeyen unsur aşağıdakilerden hangisidir?",
    options:[
      {text:"Çift meclis (Âyan/Mebusan)", correct:false, explain:"Anayasa iki kanatlı meclis öngörür."},
      {text:"Padişahın meclisi fesih yetkisi", correct:false, explain:"Padişaha fesih yetkisi tanınmıştır."},
      {text:"Temel hak ve özgürlüklerin güvencesi", correct:false, explain:"Kişi dokunulmazlığı, mülkiyet gibi haklar düzenlenmiştir."},
      {text:"Saltanatın kaldırılması", correct:true,  explain:"Saltanat 1922’de kaldırılmıştır; Kanun-i Esasi bunu getirmez."}
    ]},
  { id:"tan-10", q:"Tanzimat döneminde ulaşım-haberleşme alanındaki gelişmelerden biri değildir:",
    options:[
      {text:"Telgraf hatlarının döşenmesi (Kırım Savaşı yılları)", correct:false, explain:"1850’lerde yaygınlaştırıldı."},
      {text:"Posta Nezareti’nin kurulması (1840)", correct:false, explain:"Modern posta örgütlenmesinin başlangıcıdır."},
      {text:"Demiryollarının yaygınlaşması", correct:false, explain:"Tanzimat’ta demiryolu yatırımları artmıştır."},
      {text:"Radyo yayınının başlaması", correct:true,  explain:"Radyo 1927’de (Cumhuriyet) yayına başladı."}
    ]}
];

/* ===============================
   YARDIMCILAR
==================================*/
const shuffle = arr => arr.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(p=>p[1]);
const pad = n => n.toString().padStart(2,"0");
const fmt = s => `⏳ ${pad(Math.floor(s/60))}:${pad(s%60)}`;

function applyTheme(){
  const root = document.documentElement;
  // Sadece iki durum: light (varsayılan) / dark
  if (settings.theme === "dark") root.setAttribute("data-theme","dark");
  else root.removeAttribute("data-theme"); // light
}
function applyFont(){ document.documentElement.style.setProperty("--fontScale", String(settings.fontScale)); }

/* ===============================
   TTS (Sesli Oku)
==================================*/
function supportsTTS(){ return "speechSynthesis" in window; }
let currentUtterance = null;
function buildCurrentText(){
  const q = state.questions[state.index];
  if (!q) return "";
  const opts = q.options.map((o,i)=>`Seçenek ${i+1}: ${o.text}`).join(". ");
  return `${q.q}. ${opts}`;
}
function ttsStart(){
  if (!supportsTTS()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(buildCurrentText());
  u.lang = "tr-TR"; u.rate = 1.0;
  currentUtterance = u;
  window.speechSynthesis.speak(u);
  settings.tts = true; saveSettings();
}
function ttsStop(){
  if (!supportsTTS()) return;
  window.speechSynthesis.cancel();
  currentUtterance = null;
  settings.tts = false; saveSettings();
}
function ttsOnQuestionChange(){ if (supportsTTS()) window.speechSynthesis.cancel(); currentUtterance=null; }

/* ===============================
   ZAMANLAYICI & DURUM
==================================*/
function clearTimer(){ if (state.timerId){ clearInterval(state.timerId); state.timerId=null; } }
function startTimer(){
  clearTimer();
  state.secondsLeft = QUESTION_DURATION;
  el.timer.textContent = fmt(state.secondsLeft);
  state.timerId = setInterval(()=>{
    state.secondsLeft--;
    if (state.secondsLeft <= 0){
      state.secondsLeft = 0;
      el.timer.textContent = fmt(state.secondsLeft);
      clearTimer();
      handleTimeUp();
    } else {
      el.timer.textContent = fmt(state.secondsLeft);
    }
  },1000);
}

function updateHeader(){
  el.progress.textContent = `Soru ${Math.min(state.index+1, state.questions.length)} / ${state.questions.length}`;
  el.score.textContent    = `Puan: ${state.score}`;
}

function buildQuestions(){
  const qs = SHUFFLE_QUESTIONS ? shuffle(QUESTIONS) : QUESTIONS.slice();
  return qs.map(q => ({...q, options: SHUFFLE_OPTIONS ? shuffle(q.options) : q.options.slice()}));
}

function renderCurrent(){
  ttsOnQuestionChange();
  const q = state.questions[state.index];
  el.qTitle.textContent = q.q;
  el.fieldset.innerHTML = q.options.map((op,i)=>{
    const id=`opt-${q.id}-${i}`;
    return `
      <div class="option">
        <input type="radio" name="choice" id="${id}" value="${i}">
        <label for="${id}">
          ${op.text}
          <div class="explain" id="exp-${q.id}-${i}">${op.explain}</div>
        </label>
      </div>`;
  }).join("");
  el.feedback.className = "feedback";
  el.feedback.textContent = "";
  el.solutionBox.hidden = true;
  el.solutionText.innerHTML = "";
  el.nextBtn.disabled = true;
  el.showSolutionBtn.disabled = false;
  lockChoices(false);
  startTimer();
  updateHeader();
}

function lockChoices(lock=true){
  el.fieldset.querySelectorAll('input[name="choice"]').forEach(i=>i.disabled=lock);
}

function showExplain(q, idx, show=true){
  const d=document.getElementById(`exp-${q.id}-${idx}`); if(d) d.style.display = show ? "block" : "none";
}

function evaluate(){
  const q = state.questions[state.index];
  const selEl = el.fieldset.querySelector('input[name="choice"]:checked');
  if (!selEl){
    el.feedback.textContent = "Lütfen bir seçenek işaretleyin.";
    el.feedback.className = "feedback err";
    return false;
  }
  const sel = Number(selEl.value);
  const correctIdx = q.options.findIndex(o=>o.correct);
  const isCorrect = q.options[sel].correct === true;

  showExplain(q, sel, true);
  if (sel !== correctIdx) showExplain(q, correctIdx, true);

  if (isCorrect){
    state.score += POINTS_PER_CORRECT;
    el.feedback.textContent = "Doğru! 👏";
    el.feedback.className = "feedback ok";
  } else {
    el.feedback.textContent = "Tam değil. Açıklamaları incele.";
    el.feedback.className = "feedback err";
  }

  el.solutionText.innerHTML =
    `<strong>Doğru cevap:</strong> ${q.options[correctIdx].text}<br><br>${q.options[correctIdx].explain}`;
  el.solutionBox.hidden = false;

  el.nextBtn.disabled = false;
  lockChoices(true);
  clearTimer();
  updateHeader();
  return true;
}

function showSolution(){
  const q = state.questions[state.index];
  const correctIdx = q.options.findIndex(o=>o.correct);
  const selEl = el.fieldset.querySelector('input[name="choice"]:checked');
  if (selEl){
    const sel = Number(selEl.value);
    showExplain(q, sel, true);
    if (sel !== correctIdx) showExplain(q, correctIdx, true);
  } else {
    q.options.forEach((_,i)=> showExplain(q, i, i===correctIdx));
  }
  el.solutionText.innerHTML =
    `<strong>Doğru cevap:</strong> ${q.options[correctIdx].text}<br><br>${q.options[correctIdx].explain}`;
  el.solutionBox.hidden = false;
  el.nextBtn.disabled = false;
}

function handleTimeUp(){
  const q = state.questions[state.index];
  const correctIdx = q.options.findIndex(o=>o.correct);
  q.options.forEach((_,i)=> showExplain(q, i, i===correctIdx));
  el.feedback.textContent = "Süre bitti. Doğru cevap ve açıklaması gösterildi.";
  el.feedback.className   = "feedback err";
  el.solutionText.innerHTML =
    `<strong>Doğru cevap:</strong> ${q.options[correctIdx].text}<br><br>${q.options[correctIdx].explain}`;
  el.solutionBox.hidden = false;
  lockChoices(true);
  el.nextBtn.disabled = false;
}

function nextQuestion(){
  if (state.index < state.questions.length - 1){
    state.index++;
    renderCurrent();
  } else {
    finishQuiz();
  }
}

function finishQuiz(){
  clearTimer();
  lockChoices(true);
  el.resultCard.hidden = false;
  el.scoreLine.textContent = `Puanınız: ${state.score} / 100`;
}

/* ===============================
   OLAYLAR
==================================*/
el.restartBtn.addEventListener("click", () => { clearTimer(); startQuiz(); });
el.submitBtn.addEventListener("click", () => evaluate());
el.nextBtn.addEventListener("click", () => nextQuestion());
el.showSolutionBtn.addEventListener("click", () => showSolution());
el.playAgainBtn.addEventListener("click", () => { clearTimer(); startQuiz(); el.resultCard.hidden = true; });

// Klavye: seçenek üzerinde Enter ile onayla
el.fieldset.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target && e.target.type === "radio"){
    e.preventDefault(); evaluate();
  }
});

/* ===============================
   ARAÇ ÇUBUĞU (Tema, Yazı, TTS)
==================================*/
function initToolbar(){
  // Tema: tek tıkla Light <-> Dark
  el.themeToggle.addEventListener("click", () => {
    settings.theme = (settings.theme === "dark") ? "light" : "dark";
    saveSettings(); applyTheme();
    el.themeToggle.setAttribute("aria-pressed", settings.theme === "dark");
  });

  // Yazı boyutu
  el.fontMinus.addEventListener("click", () => {
    settings.fontScale = Math.max(0.9, +(settings.fontScale - 0.1).toFixed(1));
    saveSettings(); applyFont();
  });
  el.fontPlus.addEventListener("click", () => {
    settings.fontScale = Math.min(1.3, +(settings.fontScale + 0.1).toFixed(1));
    saveSettings(); applyFont();
  });

  // TTS
  if (!supportsTTS()){
    el.ttsToggle.classList.add("disabled");
    el.ttsToggle.title = "Tarayıcınız sesli okumayı desteklemiyor";
  }
  el.ttsToggle.addEventListener("click", () => {
    if (settings.tts) ttsStop(); else ttsStart();
  });
}

/* ===============================
   BAŞLAT
==================================*/
function startQuiz(){
  state.questions = buildQuestions();
  state.index = 0;
  state.score = 0;
  el.resultCard.hidden = true;
  renderCurrent();
  el.timer.textContent = fmt(state.secondsLeft);
  updateHeader();
  el.themeToggle.setAttribute("aria-pressed", settings.theme === "dark");
}

applyTheme();     // varsayılan: light
applyFont();
initToolbar();
startQuiz();
