// Finch: Self-Care Pet - Authentic Web Engine & Reconstruction
// Fully authentic recreation of Finch (Dart AOT / Flutter) with NUX Onboarding,
// Clinical Assessments (GAD-7 & PHQ-9), Egg Warming/Hatching Ceremony,
// Birdhouse Room, Feed Mood Check-in, Mr. Prickles Shop, Wardrobe & Tree Town.

// ================= STATE & PERSISTENCE =================
const STATE_KEY = 'finch_app_state_v3';

const DEFAULT_STATE = {
  hasCompletedNux: false,
  pet: {
    name: 'Бирби',
    pronouns: 'Они / Их',
    ownerName: 'Друг',
    streak: 1,
    energy: 35,
    maxEnergy: 100,
    stones: 250,
    color: 'Classic Grey',
    isSleeping: false,
    activeHat: '',
    activeGlasses: '',
    activeMicropet: 'CMP_Beaky_01.json',
    traits: { Curiosity: 15, Compassion: 20, Resilience: 10, Logic: 12 },
    todayMood: null
  },
  birdhouse: {
    wallpaper: 'woodsy-wall.svg',
    window: 'woodsy-window.svg',
    clock: 'woodsy-clock.svg',
    door: 'woodsy-door.svg',
    rug: 'woodsy-rug.svg',
    bed: 'woodsy-bed.svg',
    lamp: 'woodsy-lamp.svg',
    isLightOn: true
  },
  goals: [
    { id: 'g1', title: 'Выпить стакан чистой воды', category: 'selfCare', energy: 5, stones: 20, completed: false, icon: 'badge-checkmark.svg' },
    { id: 'g2', title: 'Сделать один глубокий вдох', category: 'mindfulness', energy: 5, stones: 20, completed: false, icon: 'badge-checkmark.svg' },
    { id: 'g3', title: 'Сказать себе добрые слова', category: 'selfCare', energy: 5, stones: 20, completed: false, icon: 'badge-checkmark.svg' },
    { id: 'g4', title: 'Потянуться и расправить плечи', category: 'body', energy: 5, stones: 20, completed: false, icon: 'badge-checkmark.svg' },
    { id: 'g5', title: 'Осознанное дыхание 4-4-4', category: 'mindfulness', energy: 10, stones: 35, completed: false, icon: 'badge-checkmark.svg' }
  ],
  purchasedItems: ['alps-hat.svg', 'groovy-heart-glasses.svg'],
  soundEnabled: true,
  nuxData: {
    intent: 'anxiety',
    gad7Scores: [1, 1, 1, 1],
    phq9Scores: [1, 1, 1, 1],
    chosenEgg: 'egg-blue.svg',
    chosenTheme: 'Sky Blue'
  }
};

let appState = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STATE, ...parsed, pet: { ...DEFAULT_STATE.pet, ...parsed.pet }, birdhouse: { ...DEFAULT_STATE.birdhouse, ...parsed.birdhouse } };
    }
  } catch (e) {
    console.warn('Storage read error:', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function saveState() {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(appState));
  } catch (e) {
    console.warn('Storage save error:', e);
  }
}

// ================= AUDIO ENGINE =================
const AUDIO = {
  chirp: new Audio('assets/audio/babyChirpHappy.m4a'),
  bonus: new Audio('assets/audio/fairyBonus.m4a'),
  bell: new Audio('assets/audio/bellChimes.m4a'),
  boopty: new Audio('assets/audio/boopty.m4a'),
  magic: new Audio('assets/audio/floaty-magic.m4a'),
  hatch: new Audio('assets/audio/eggHatch.m4a'),
  bubbles: new Audio('assets/audio/bubbles.m4a'),
  breatheIn: new Audio('assets/audio/breathe_in.m4a'),
  breatheHold: new Audio('assets/audio/breathe_hold.m4a'),
  breatheOut: new Audio('assets/audio/breathe_out.m4a')
};

function playSound(audioObj) {
  if (!appState.soundEnabled || !audioObj) return;
  try {
    audioObj.currentTime = 0;
    audioObj.play().catch(() => {});
  } catch (e) {}
}

// ================= LOTTIE PLAYERS =================
let petLottie = null;
let heartsLottie = null;
let micropetLottie = null;
let mrPricklesLottie = null;
let hatchLottie = null;

function initPetLottie() {
  const container = document.getElementById('lottie-pet-container');
  if (!container) return;

  const animFile = appState.birdhouse.isLightOn
    ? 'assets/animations/CB01_Full_01.1_Naked.json'
    : 'assets/animations/Finch_Sleepy in Bed_01.json';

  if (petLottie) petLottie.destroy();
  petLottie = lottie.loadAnimation({
    container: container,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: animFile
  });

  const heartsContainer = document.getElementById('lottie-hearts-container');
  if (heartsContainer) {
    if (heartsLottie) heartsLottie.destroy();
    heartsLottie = lottie.loadAnimation({
      container: heartsContainer,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      path: 'assets/animations/Effects_Solo_Hearts_01.json'
    });
  }

  updateMicropetLottie();
}

function updateMicropetLottie() {
  const container = document.getElementById('lottie-micropet-container');
  if (!container) return;
  if (micropetLottie) micropetLottie.destroy();
  if (!appState.pet.activeMicropet) return;

  micropetLottie = lottie.loadAnimation({
    container: container,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'assets/animations/' + appState.pet.activeMicropet
  });
}

function initMrPricklesLottie() {
  const container = document.getElementById('mr-prickles-lottie');
  if (!container) return;
  if (mrPricklesLottie) return; // already initialized

  mrPricklesLottie = lottie.loadAnimation({
    container: container,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'assets/animations/NPC_MrPrickles.json'
  });
}

// ================= ONBOARDING (NUX) ENGINE =================
const GAD7_QUESTIONS = [
  'Чувство нервозности, повышенной тревоги или нахождения на взводе',
  'Неспособность остановить или контролировать постоянное беспокойство',
  'Трудности с расслаблением и обретением внутреннего покоя',
  'Чрезмерное беспокойство по самым разным жизненным поводам'
];

const PHQ9_QUESTIONS = [
  'Мало интереса или удовольствия от привычных дел и увлечений',
  'Чувство подавленности, грусти, тоски или безнадёжности',
  'Трудности с засыпанием, беспокойный сон или сонливость',
  'Чувство усталости или нехватка жизненной энергии'
];

const FREQ_OPTIONS = [
  'Совсем нет',
  'Несколько дней',
  'Более 7 дней',
  'Почти каждый день'
];

let nuxCurrentStep = 1;
const NUX_TOTAL_STEPS = 8;
let eggWarmth = 0;
let eggHatched = false;

function initOnboarding() {
  const onboardingEl = document.getElementById('onboarding-flow');
  const mainAppEl = document.getElementById('main-app');

  if (!appState.hasCompletedNux) {
    onboardingEl.classList.add('active');
    mainAppEl.classList.add('hidden');
    renderNuxStep(1);
  } else {
    onboardingEl.classList.remove('active');
    mainAppEl.classList.remove('hidden');
    renderAll();
    initPetLottie();
    initMrPricklesLottie();
  }

  setupNuxEvents();
}

function updateNuxProgress(step) {
  const fill = document.getElementById('nux-progress-fill');
  if (fill) {
    const pct = Math.round((step / NUX_TOTAL_STEPS) * 100);
    fill.style.width = pct + '%';
  }
}

function renderNuxStep(stepIndex) {
  nuxCurrentStep = stepIndex;
  updateNuxProgress(stepIndex);

  document.querySelectorAll('.nux-step').forEach(stepEl => {
    stepEl.classList.remove('active');
  });

  const stepMap = {
    1: 'nux-step-welcome',
    2: 'nux-step-gad7',
    3: 'nux-step-phq9',
    4: 'nux-step-plan',
    5: 'nux-step-egg',
    6: 'nux-step-hatch',
    7: 'nux-step-name',
    8: 'nux-step-first-goals'
  };

  const currentEl = document.getElementById(stepMap[stepIndex]);
  if (currentEl) currentEl.classList.add('active');

  if (stepIndex === 2) renderGad7Questions();
  if (stepIndex === 3) renderPhq9Questions();
  if (stepIndex === 6) setupHatchStage();
}

function renderGad7Questions() {
  const container = document.getElementById('gad7-questions-list');
  if (!container) return;
  container.innerHTML = '';

  GAD7_QUESTIONS.forEach((q, qIdx) => {
    const block = document.createElement('div');
    block.className = 'survey-question-block';
    block.innerHTML = `
      <div class="survey-q-title">${qIdx + 1}. ${q}</div>
      <div class="survey-choices-row" data-qindex="${qIdx}">
        ${FREQ_OPTIONS.map((opt, oIdx) => `
          <button type="button" class="survey-choice-btn ${appState.nuxData.gad7Scores[qIdx] === oIdx ? 'selected' : ''}" data-val="${oIdx}">
            ${opt}
          </button>
        `).join('')}
      </div>
    `;

    block.querySelectorAll('.survey-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        block.querySelectorAll('.survey-choice-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const val = parseInt(btn.getAttribute('data-val'), 10);
        appState.nuxData.gad7Scores[qIdx] = val;
        playSound(AUDIO.boopty);
      });
    });

    container.appendChild(block);
  });
}

function renderPhq9Questions() {
  const container = document.getElementById('phq9-questions-list');
  if (!container) return;
  container.innerHTML = '';

  PHQ9_QUESTIONS.forEach((q, qIdx) => {
    const block = document.createElement('div');
    block.className = 'survey-question-block';
    block.innerHTML = `
      <div class="survey-q-title">${qIdx + 1}. ${q}</div>
      <div class="survey-choices-row" data-qindex="${qIdx}">
        ${FREQ_OPTIONS.map((opt, oIdx) => `
          <button type="button" class="survey-choice-btn ${appState.nuxData.phq9Scores[qIdx] === oIdx ? 'selected' : ''}" data-val="${oIdx}">
            ${opt}
          </button>
        `).join('')}
      </div>
    `;

    block.querySelectorAll('.survey-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        block.querySelectorAll('.survey-choice-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const val = parseInt(btn.getAttribute('data-val'), 10);
        appState.nuxData.phq9Scores[qIdx] = val;
        playSound(AUDIO.boopty);
      });
    });

    container.appendChild(block);
  });
}

function setupHatchStage() {
  eggWarmth = 0;
  eggHatched = false;
  const eggImg = document.getElementById('hatch-egg-display');
  const crackImg = document.getElementById('hatch-crack-display');
  const warmthFill = document.getElementById('warmth-fill');
  const warmthBar = document.getElementById('warmth-progress-bar');
  const lottieBox = document.getElementById('hatch-lottie-container');
  const nextBtn = document.getElementById('nux-btn-6');
  const title = document.getElementById('hatch-title');
  const desc = document.getElementById('hatch-desc');
  const wrapper = document.getElementById('hatch-egg-wrapper');

  if (eggImg) eggImg.src = 'assets/images/' + appState.nuxData.chosenEgg;
  if (crackImg) crackImg.style.display = 'none';
  if (warmthFill) warmthFill.style.width = '0%';
  if (warmthBar) warmthBar.style.display = 'block';
  if (lottieBox) {
    lottieBox.style.display = 'none';
    lottieBox.innerHTML = '';
  }
  if (wrapper) wrapper.style.display = 'flex';
  if (nextBtn) nextBtn.style.display = 'none';
  if (title) title.textContent = 'Согрейте яйцо';
  if (desc) desc.textContent = 'Нажимайте на яйцо, чтобы согреть его теплом своих мыслей!';
}

function warmEgg() {
  if (eggHatched) return;

  eggWarmth = Math.min(100, eggWarmth + 20);
  const warmthFill = document.getElementById('warmth-fill');
  const crackImg = document.getElementById('hatch-crack-display');
  const wrapper = document.getElementById('hatch-egg-wrapper');

  if (warmthFill) warmthFill.style.width = eggWarmth + '%';

  // Wobble animation
  if (wrapper) {
    wrapper.classList.remove('wobble');
    void wrapper.offsetWidth;
    wrapper.classList.add('wobble');
  }

  if (eggWarmth >= 25 && eggWarmth < 50) {
    if (crackImg) {
      crackImg.style.display = 'block';
      crackImg.src = 'assets/images/egg-crack-1.svg';
    }
    playSound(AUDIO.boopty);
  } else if (eggWarmth >= 50 && eggWarmth < 75) {
    if (crackImg) {
      crackImg.style.display = 'block';
      crackImg.src = 'assets/images/egg-crack-2.svg';
    }
    playSound(AUDIO.bubbles);
  } else if (eggWarmth >= 75 && eggWarmth < 100) {
    if (crackImg) {
      crackImg.style.display = 'block';
      crackImg.src = 'assets/images/egg-crack-3.svg';
    }
    playSound(AUDIO.boopty);
  } else if (eggWarmth >= 100) {
    triggerEggHatch();
  } else {
    playSound(AUDIO.boopty);
  }
}

function triggerEggHatch() {
  eggHatched = true;
  playSound(AUDIO.hatch);

  const wrapper = document.getElementById('hatch-egg-wrapper');
  const warmthBar = document.getElementById('warmth-progress-bar');
  const lottieBox = document.getElementById('hatch-lottie-container');
  const nextBtn = document.getElementById('nux-btn-6');
  const title = document.getElementById('hatch-title');
  const desc = document.getElementById('hatch-desc');

  if (wrapper) wrapper.style.display = 'none';
  if (warmthBar) warmthBar.style.display = 'none';

  if (lottieBox) {
    lottieBox.style.display = 'block';
    if (hatchLottie) hatchLottie.destroy();
    hatchLottie = lottie.loadAnimation({
      container: lottieBox,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'assets/animations/StreakCelebration_Birb_01.json'
    });
  }

  if (title) title.textContent = 'Малыш вылупился! 🐣';
  if (desc) desc.textContent = '«Чирик! Я так рад появиться на свет и встретиться с тобой!»';
  if (nextBtn) nextBtn.style.display = 'block';

  // Apply chosen theme to pet
  appState.pet.color = appState.nuxData.chosenTheme;
  saveState();
}

function setupNuxEvents() {
  // Step 1: Intent
  document.querySelectorAll('#nux-intent-options .nux-option-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('#nux-intent-options .nux-option-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      appState.nuxData.intent = card.getAttribute('data-value');
      playSound(AUDIO.boopty);
    });
  });
  document.getElementById('nux-btn-1')?.addEventListener('click', () => {
    playSound(AUDIO.boopty);
    renderNuxStep(2);
  });

  // Step 2: GAD-7 Next
  document.getElementById('nux-btn-2')?.addEventListener('click', () => {
    playSound(AUDIO.boopty);
    renderNuxStep(3);
  });

  // Step 3: PHQ-9 Next
  document.getElementById('nux-btn-3')?.addEventListener('click', () => {
    playSound(AUDIO.magic);
    renderNuxStep(4);
  });

  // Step 4: Plan Next
  document.getElementById('nux-btn-4')?.addEventListener('click', () => {
    playSound(AUDIO.boopty);
    renderNuxStep(5);
  });

  // Step 5: Egg cards
  document.querySelectorAll('.egg-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.egg-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      appState.nuxData.chosenEgg = card.getAttribute('data-egg');
      appState.nuxData.chosenTheme = card.getAttribute('data-theme');
      playSound(AUDIO.boopty);
    });
  });
  document.getElementById('nux-btn-5')?.addEventListener('click', () => {
    playSound(AUDIO.boopty);
    renderNuxStep(6);
  });

  // Step 6: Warm Egg
  document.getElementById('hatch-egg-wrapper')?.addEventListener('click', warmEgg);
  document.getElementById('nux-btn-6')?.addEventListener('click', () => {
    playSound(AUDIO.boopty);
    renderNuxStep(7);
  });

  // Step 7: Pronouns & Names
  document.querySelectorAll('.pronoun-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.pronoun-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      appState.pet.pronouns = chip.getAttribute('data-pronoun');
      playSound(AUDIO.boopty);
    });
  });

  document.getElementById('nux-btn-7')?.addEventListener('click', () => {
    const petName = document.getElementById('nux-pet-name-input')?.value.trim() || 'Бирби';
    const humanName = document.getElementById('nux-human-name-input')?.value.trim() || 'Друг';
    appState.pet.name = petName;
    appState.pet.ownerName = humanName;
    saveState();

    const speech = document.getElementById('nux-baby-speech');
    if (speech) {
      speech.textContent = `«Чирик! Привет, ${humanName}! Я ${petName}, и я так счастлив(а) начать это путешествие вместе с тобой!»`;
    }

    playSound(AUDIO.chirp);
    renderNuxStep(8);
  });

  // Step 8: Finish Onboarding -> Main App
  document.getElementById('nux-btn-finish')?.addEventListener('click', () => {
    appState.hasCompletedNux = true;
    saveState();
    playSound(AUDIO.bonus);

    const onboardingEl = document.getElementById('onboarding-flow');
    const mainAppEl = document.getElementById('main-app');
    onboardingEl.classList.remove('active');
    mainAppEl.classList.remove('hidden');

    renderAll();
    initPetLottie();
    initMrPricklesLottie();

    showSpeechBubble(`Добро пожаловать в домик, ${appState.pet.ownerName}! Я так рад нашему знакомству! 🌿`);
  });

  // Restart onboarding from Room
  document.getElementById('restart-onboarding-btn')?.addEventListener('click', () => {
    playSound(AUDIO.boopty);
    const onboardingEl = document.getElementById('onboarding-flow');
    const mainAppEl = document.getElementById('main-app');
    onboardingEl.classList.add('active');
    mainAppEl.classList.add('hidden');
    renderNuxStep(1);
  });
}

// ================= UI RENDERERS =================
function renderAll() {
  renderHUD();
  renderBirdhouse();
  renderGoals();
  renderFeedGoals();
  renderWardrobe();
  renderShop();
}

function renderHUD() {
  const nameEl = document.getElementById('hud-pet-name');
  const subEl = document.getElementById('color-label');
  const streakEl = document.getElementById('streak-val');
  const energyEl = document.getElementById('energy-val');
  const stonesEl = document.getElementById('stones-val');

  if (nameEl) nameEl.textContent = appState.pet.name;
  if (subEl) subEl.textContent = appState.pet.color;
  if (streakEl) streakEl.textContent = appState.pet.streak;
  if (energyEl) energyEl.textContent = appState.pet.energy;
  if (stonesEl) stonesEl.textContent = appState.pet.stones;

  const pct = Math.min(100, Math.round((appState.pet.energy / 30) * 100));
  const bar = document.getElementById('adv-bar-fill');
  if (bar) bar.style.width = pct + '%';

  const statusText = document.getElementById('adv-energy-status');
  const startBtn = document.getElementById('start-adventure-btn');
  if (appState.pet.energy >= 30) {
    if (statusText) statusText.textContent = 'Энергия готова! (30 ⚡)';
    if (startBtn) startBtn.disabled = false;
  } else {
    if (statusText) statusText.textContent = `Нужно ещё ${30 - appState.pet.energy} ⚡ для похода`;
    if (startBtn) startBtn.disabled = true;
  }
}

function renderBirdhouse() {
  const b = appState.birdhouse;
  const room = document.getElementById('birdhouse-room');
  const wall = document.getElementById('room-wallpaper');
  const win = document.getElementById('room-window');
  const clock = document.getElementById('room-clock');
  const door = document.getElementById('room-door');
  const rug = document.getElementById('room-rug');
  const bed = document.getElementById('room-bed');
  const lamp = document.getElementById('room-lamp');

  if (wall) wall.style.backgroundImage = `url('assets/images/${b.wallpaper}')`;
  if (win) win.src = `assets/images/${b.window}`;
  if (clock) clock.src = `assets/images/${b.clock}`;
  if (door) door.src = `assets/images/${b.door}`;
  if (rug) rug.src = `assets/images/${b.rug}`;
  if (bed) bed.src = `assets/images/${b.bed}`;
  if (lamp) lamp.src = `assets/images/${b.lamp}`;

  if (!b.isLightOn) {
    if (room) room.classList.add('night');
    const lbl = document.getElementById('light-label');
    if (lbl) lbl.textContent = 'Включить свет';
  } else {
    if (room) room.classList.remove('night');
    const lbl = document.getElementById('light-label');
    if (lbl) lbl.textContent = 'Выключить свет';
  }

  applyPetColor(appState.pet.color);

  // Clothing
  const hatImg = document.getElementById('pet-wear-hat');
  const glassesImg = document.getElementById('pet-wear-glasses');
  if (hatImg) {
    hatImg.src = appState.pet.activeHat ? `assets/icons/${appState.pet.activeHat}` : 'assets/icons/transparent.svg';
  }
  if (glassesImg) {
    glassesImg.src = appState.pet.activeGlasses ? `assets/icons/${appState.pet.activeGlasses}` : 'assets/icons/transparent.svg';
  }
}

function applyPetColor(colorName) {
  const container = document.getElementById('lottie-pet-container');
  if (!container) return;
  const filterMap = {
    'Classic Grey': 'none',
    'Sky Blue': 'hue-rotate(180deg) saturate(1.4) brightness(1.05)',
    'Blossom Pink': 'hue-rotate(300deg) saturate(1.6) brightness(1.1)',
    'Matcha Green': 'hue-rotate(85deg) saturate(1.5) brightness(0.95)',
    'Honey Yellow': 'hue-rotate(35deg) saturate(2.0) brightness(1.15)'
  };
  container.style.filter = filterMap[colorName] || 'none';
}

function showSpeechBubble(text) {
  const bubble = document.getElementById('speech-bubble');
  const msg = document.getElementById('speech-text');
  if (!bubble || !msg) return;
  msg.textContent = text;
  bubble.style.opacity = '1';
  bubble.style.transform = 'translateX(-50%) scale(1.04)';
  setTimeout(() => {
    bubble.style.transform = 'translateX(-50%) scale(1)';
  }, 200);
}

// ================= GOALS =================
function renderGoals(filter = 'all') {
  const list = document.getElementById('goals-list');
  if (!list) return;
  list.innerHTML = '';

  const filtered = filter === 'all'
    ? appState.goals
    : appState.goals.filter(g => g.category === filter);

  filtered.forEach(goal => {
    const item = document.createElement('div');
    item.className = 'goal-item' + (goal.completed ? ' done' : '');
    item.innerHTML = `
      <div class="goal-left">
        <img src="assets/icons/${goal.icon}" alt="" class="goal-icon">
        <div>
          <div class="goal-title">${goal.title}</div>
          <div class="goal-reward">+${goal.energy} ⚡  +${goal.stones} 💎</div>
        </div>
      </div>
      <div class="goal-checkbox ${goal.completed ? 'checked' : ''}">
        ${goal.completed ? '<img src="assets/icons/badge-checkmark.svg" width="14">' : ''}
      </div>
    `;

    item.querySelector('.goal-checkbox').addEventListener('click', () => {
      toggleGoal(goal.id);
    });

    list.appendChild(item);
  });
}

function renderFeedGoals() {
  const list = document.getElementById('feed-goals-list');
  if (!list) return;
  list.innerHTML = '';

  appState.goals.forEach(goal => {
    const item = document.createElement('div');
    item.className = 'goal-item' + (goal.completed ? ' done' : '');
    item.innerHTML = `
      <div class="goal-left">
        <img src="assets/icons/${goal.icon}" alt="" class="goal-icon">
        <div>
          <div class="goal-title">${goal.title}</div>
          <div class="goal-reward">+${goal.energy} ⚡  +${goal.stones} 💎</div>
        </div>
      </div>
      <div class="goal-checkbox ${goal.completed ? 'checked' : ''}">
        ${goal.completed ? '<img src="assets/icons/badge-checkmark.svg" width="14">' : ''}
      </div>
    `;

    item.querySelector('.goal-checkbox').addEventListener('click', () => {
      toggleGoal(goal.id);
    });

    list.appendChild(item);
  });
}

function toggleGoal(id) {
  const goal = appState.goals.find(g => g.id === id);
  if (!goal) return;

  goal.completed = !goal.completed;
  if (goal.completed) {
    playSound(AUDIO.bonus);
    appState.pet.energy = Math.min(appState.pet.maxEnergy, appState.pet.energy + goal.energy);
    appState.pet.stones += goal.stones;
    showSpeechBubble(`Отличная работа! +${goal.energy} ⚡ и +${goal.stones} 💎!`);
  }
  saveState();
  renderHUD();
  renderGoals();
  renderFeedGoals();
}

// ================= MOOD CHECK-IN =================
const MOOD_RESPONSES = {
  great: 'Какая радость! Запомни это чудесное ощущение гармонии и тепла! 🌟',
  good: 'Здорово! Пусть этот день подарит тебе ещё много приятных улыбок! 🌿',
  okay: 'Спокойный и ровный день — это замечательно. Двигайся в своём комфортном темпе! ☁️',
  meh: 'Бывают дни затишья. Позволь себе передохнуть и не требуй от себя многого ☕',
  bad: 'Мне очень жаль, что сейчас трудно... Я рядом с тобой. Мы справимся со всем вместе 🫂'
};

function setupMoodCheckin() {
  document.querySelectorAll('#mood-emojis-row .mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mood = btn.getAttribute('data-mood');
      appState.pet.todayMood = mood;
      appState.pet.stones += 20;
      saveState();

      playSound(AUDIO.chirp);
      if (heartsLottie) heartsLottie.goToAndPlay(0, true);

      document.querySelectorAll('#mood-emojis-row .mood-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      renderHUD();
      showSpeechBubble(MOOD_RESPONSES[mood] || 'Спасибо, что делитесь своими чувствами!');
    });
  });
}

// ================= WARDROBE =================
const WARDROBE_HATS = [
  { id: 'alps-hat.svg', name: 'Альпийская' },
  { id: 'aviator-hat.svg', name: 'Авиатор' },
  { id: 'birthday-hat-2.svg', name: 'Колпак' },
  { id: 'apple-hat.svg', name: 'Яблочко' }
];

const WARDROBE_GLASSES = [
  { id: 'groovy-heart-glasses.svg', name: 'Сердечки' },
  { id: 'cat-eye-glasses.svg', name: 'Кошачий глаз' },
  { id: 'cozy-classic-glasses.svg', name: 'Очки для чтения' }
];

const MICROPETS = [
  { file: 'CMP_Beaky_01.json', name: 'Птенец Бики' },
  { file: 'CMP_Cat_01.json', name: 'Котёнок' },
  { file: 'CMP_Droplet_01.json', name: 'Капелька' },
  { file: 'CMP_Flower_01.json', name: 'Цветочек' },
  { file: 'CMP_Star_01.json', name: 'Звёздочка' }
];

function renderWardrobe() {
  const hatsGrid = document.getElementById('wardrobe-hats-grid');
  if (hatsGrid) {
    hatsGrid.innerHTML = `
      <div class="wardrobe-card ${!appState.pet.activeHat ? 'selected' : ''}" data-type="hat" data-id="">
        <span style="font-size:12px; font-weight:600;">Без шляпы</span>
      </div>
    `;
    WARDROBE_HATS.forEach(hat => {
      const isSelected = appState.pet.activeHat === hat.id;
      const el = document.createElement('div');
      el.className = `wardrobe-card ${isSelected ? 'selected' : ''}`;
      el.innerHTML = `
        <img src="assets/icons/${hat.id}" class="wardrobe-card-img">
        <span class="wardrobe-card-name">${hat.name}</span>
      `;
      el.addEventListener('click', () => {
        appState.pet.activeHat = isSelected ? '' : hat.id;
        playSound(AUDIO.boopty);
        saveState();
        renderBirdhouse();
        renderWardrobe();
      });
      hatsGrid.appendChild(el);
    });
    hatsGrid.firstElementChild?.addEventListener('click', () => {
      appState.pet.activeHat = '';
      saveState();
      renderBirdhouse();
      renderWardrobe();
    });
  }

  const glassesGrid = document.getElementById('wardrobe-glasses-grid');
  if (glassesGrid) {
    glassesGrid.innerHTML = `
      <div class="wardrobe-card ${!appState.pet.activeGlasses ? 'selected' : ''}">
        <span style="font-size:12px; font-weight:600;">Без очков</span>
      </div>
    `;
    WARDROBE_GLASSES.forEach(g => {
      const isSelected = appState.pet.activeGlasses === g.id;
      const el = document.createElement('div');
      el.className = `wardrobe-card ${isSelected ? 'selected' : ''}`;
      el.innerHTML = `
        <img src="assets/icons/${g.id}" class="wardrobe-card-img">
        <span class="wardrobe-card-name">${g.name}</span>
      `;
      el.addEventListener('click', () => {
        appState.pet.activeGlasses = isSelected ? '' : g.id;
        playSound(AUDIO.boopty);
        saveState();
        renderBirdhouse();
        renderWardrobe();
      });
      glassesGrid.appendChild(el);
    });
    glassesGrid.firstElementChild?.addEventListener('click', () => {
      appState.pet.activeGlasses = '';
      saveState();
      renderBirdhouse();
      renderWardrobe();
    });
  }

  const micropetsGrid = document.getElementById('micropets-grid');
  if (micropetsGrid) {
    micropetsGrid.innerHTML = '';
    MICROPETS.forEach(mp => {
      const isSelected = appState.pet.activeMicropet === mp.file;
      const el = document.createElement('div');
      el.className = `micropet-pill-card ${isSelected ? 'selected' : ''}`;
      el.innerHTML = `
        <div style="font-size:12px; font-weight:700;">${mp.name}</div>
        <div style="font-size:10px; color:#888;">${isSelected ? 'Выбран' : 'Взять'}</div>
      `;
      el.addEventListener('click', () => {
        appState.pet.activeMicropet = mp.file;
        playSound(AUDIO.boopty);
        saveState();
        updateMicropetLottie();
        renderWardrobe();
      });
      micropetsGrid.appendChild(el);
    });
  }
}

// ================= SHOP (MR. PRICKLES) =================
const SHOP_ITEMS = [
  { id: 'shop-bed-gothic', name: 'Готическая кровать', slot: 'bed', asset: 'gothic-bed.svg', icon: 'gothic-bed-square-icon.svg', price: 150 },
  { id: 'shop-lamp-gothic', name: 'Готическая лампа', slot: 'lamp', asset: 'gothic-lamp.svg', icon: 'gothic-lamp-square-icon.svg', price: 90 },
  { id: 'shop-door-gothic', name: 'Резная дверь', slot: 'door', asset: 'gothic-door.svg', icon: 'gothic-door-square-icon.svg', price: 120 },
  { id: 'shop-win-gothic', name: 'Стрельчатое окно', slot: 'window', asset: 'gothic-window.svg', icon: 'gothic-window-square-icon.svg', price: 140 },
  { id: 'shop-rug-gothic', name: 'Пурпурный ковёр', slot: 'rug', asset: 'gothic-rug.svg', icon: 'gothic-rug-square-icon.svg', price: 80 },
  { id: 'shop-clock-gothic', name: 'Старинные часы', slot: 'clock', asset: 'gothic-clock.svg', icon: 'gothic-clock-square-icon.svg', price: 110 }
];

function renderShop() {
  const grid = document.getElementById('shop-items-grid');
  if (!grid) return;
  grid.innerHTML = '';

  SHOP_ITEMS.forEach(item => {
    const isBought = appState.purchasedItems.includes(item.id);
    const card = document.createElement('div');
    card.className = 'shop-item-card';
    card.innerHTML = `
      <img src="assets/images/${item.icon}" alt="${item.name}" class="shop-item-img">
      <div class="shop-item-title">${item.name}</div>
      <button class="shop-buy-btn ${isBought ? 'bought' : ''}" ${isBought ? 'disabled' : ''}>
        <img src="assets/icons/rainbow-stone.svg" class="svg-icon-xs">
        <span>${isBought ? 'Куплено' : item.price}</span>
      </button>
    `;

    if (!isBought) {
      card.querySelector('.shop-buy-btn').addEventListener('click', () => {
        buyItem(item);
      });
    }

    grid.appendChild(card);
  });
}

function buyItem(item) {
  if (appState.pet.stones < item.price) {
    showSpeechBubble('Недостаточно радужных камней! Выполни цели заботы! 💎');
    return;
  }

  appState.pet.stones -= item.price;
  appState.purchasedItems.push(item.id);
  appState.birdhouse[item.slot] = item.asset;
  playSound(AUDIO.bell);
  saveState();
  renderHUD();
  renderBirdhouse();
  renderShop();
  showSpeechBubble(`Ура! ${item.name} теперь украшает домик! ✨`);
}

// ================= ADVENTURE ENGINE =================
let allStories = [];

async function loadStories() {
  try {
    const res = await fetch('data/stories.json');
    allStories = await res.json();
  } catch (e) {
    console.warn('Stories load error:', e);
  }
}

function startAdventure() {
  if (appState.pet.energy < 30) return;

  appState.pet.energy -= 30;
  saveState();
  renderHUD();
  playSound(AUDIO.magic);
  showSpeechBubble('Я отправляюсь в путешествие по волшебному лесу! 🎒');

  setTimeout(() => {
    showStoryModal();
  }, 1000);
}

function showStoryModal() {
  if (!allStories || allStories.length === 0) return;
  const story = allStories[Math.floor(Math.random() * Math.min(allStories.length, 50))];

  const petName = appState.pet.name;
  const humanName = appState.pet.ownerName;

  const title = story.title || 'Приключение в пути';
  const prompt = (story.prompt || '').replace(/#HUMAN_NAME/g, humanName).replace(/#PET_NAME/g, petName);

  document.getElementById('adv-story-title').textContent = title;
  document.getElementById('adv-story-text').textContent = prompt;
  document.getElementById('adv-story-question').textContent = 'Как поступить?';

  const choicesList = document.getElementById('adv-choices-list');
  choicesList.innerHTML = '';

  const c1Text = (story.choice1 || 'Исследовать дальше').replace(/#HUMAN_NAME/g, humanName).replace(/#PET_NAME/g, petName);
  const c2Text = (story.choice2 || 'Проявить доброту').replace(/#HUMAN_NAME/g, humanName).replace(/#PET_NAME/g, petName);

  const btn1 = document.createElement('button');
  btn1.className = 'choice-btn';
  btn1.textContent = c1Text;
  btn1.addEventListener('click', () => {
    applyStoryChoice(story.trait1 || 'Curiosity', story.reply1 || 'Это было великолепно, чирик!');
  });
  choicesList.appendChild(btn1);

  const btn2 = document.createElement('button');
  btn2.className = 'choice-btn';
  btn2.textContent = c2Text;
  btn2.addEventListener('click', () => {
    applyStoryChoice(story.trait2 || 'Compassion', story.reply2 || 'Спасибо за поддержку, чирик!');
  });
  choicesList.appendChild(btn2);

  document.getElementById('adventure-modal').classList.add('open');
}

function applyStoryChoice(trait, reply) {
  playSound(AUDIO.chirp);
  appState.pet.streak += 1;
  appState.pet.stones += 40;
  appState.pet.traits[trait] = (appState.pet.traits[trait] || 0) + 5;
  saveState();
  renderHUD();
  document.getElementById('adventure-modal').classList.remove('open');

  const petName = appState.pet.name;
  const humanName = appState.pet.ownerName;
  const cleanReply = reply.replace(/#HUMAN_NAME/g, humanName).replace(/#PET_NAME/g, petName);
  showSpeechBubble(`${cleanReply} (${trait} +5!)`);
}

// ================= BREATHING (4-4-4) =================
let breatheTimerInterval = null;

function startBreathingExercise() {
  const modal = document.getElementById('breathe-modal');
  modal.classList.add('open');

  const circle = document.getElementById('breathe-circle');
  const phase = document.getElementById('breathe-phase');
  const timer = document.getElementById('breathe-timer');
  const startBtn = document.getElementById('breathe-start-btn');

  if (startBtn) startBtn.style.display = 'none';

  let step = 0;
  let secondsLeft = 4;

  const steps = [
    { text: 'Вдох', class: 'expand', audio: AUDIO.breatheIn },
    { text: 'Задержка', class: 'expand', audio: AUDIO.breatheHold },
    { text: 'Выдох', class: 'shrink', audio: AUDIO.breatheOut }
  ];

  function runPhase() {
    const cur = steps[step];
    phase.textContent = cur.text;
    circle.className = 'breathe-circle ' + cur.class;
    playSound(cur.audio);
    secondsLeft = 4;
    timer.textContent = secondsLeft;

    if (breatheTimerInterval) clearInterval(breatheTimerInterval);
    breatheTimerInterval = setInterval(() => {
      secondsLeft--;
      timer.textContent = secondsLeft;
      if (secondsLeft <= 0) {
        clearInterval(breatheTimerInterval);
        step++;
        if (step >= steps.length) {
          playSound(AUDIO.bonus);
          appState.pet.energy = Math.min(appState.pet.maxEnergy, appState.pet.energy + 10);
          appState.pet.stones += 25;
          saveState();
          renderHUD();
          modal.classList.remove('open');
          showSpeechBubble('Отличная дыхательная практика! Дышится легко и свободно 🌿');
        } else {
          runPhase();
        }
      }
    }, 1000);
  }

  runPhase();
}

// ================= EVENT LISTENERS =================
document.addEventListener('DOMContentLoaded', async () => {
  await loadStories();
  initOnboarding();
  setupMoodCheckin();

  // Tab switching
  document.querySelectorAll('.nav-tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      tabBtn.classList.add('active');
      const targetId = tabBtn.getAttribute('data-tab');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');

      playSound(AUDIO.boopty);

      if (targetId === 'tab-shop') {
        initMrPricklesLottie();
      }
    });
  });

  // Pet Petting
  document.getElementById('pet-stage-box')?.addEventListener('click', () => {
    playSound(AUDIO.chirp);
    if (heartsLottie) heartsLottie.goToAndPlay(0, true);
    const phrases = [
      'Чирик! Спасибо за любовь и заботу!',
      'Ты самый замечательный друг!',
      'Я так рад проводить этот день вместе с тобой!',
      'Поглаживания заряжают теплом и радостью! 💖'
    ];
    showSpeechBubble(phrases[Math.floor(Math.random() * phrases.length)]);
  });

  // Light switch toggle
  const toggleLight = () => {
    appState.birdhouse.isLightOn = !appState.birdhouse.isLightOn;
    playSound(AUDIO.boopty);
    saveState();
    renderBirdhouse();
    initPetLottie();
    if (!appState.birdhouse.isLightOn) {
      showSpeechBubble(`Тссс... Сладких снов, ${appState.pet.name} отдыхает! 🌙`);
    } else {
      showSpeechBubble('Доброе утро! Прекрасный день для заботы о себе! ☀️');
    }
  };

  document.getElementById('light-toggle-btn')?.addEventListener('click', toggleLight);
  document.getElementById('room-lamp-wrapper')?.addEventListener('click', toggleLight);

  // Sound toggle
  document.getElementById('sound-btn')?.addEventListener('click', () => {
    appState.soundEnabled = !appState.soundEnabled;
    const icon = document.getElementById('sound-icon');
    if (icon) {
      icon.src = appState.soundEnabled ? 'assets/icons/speaker-waves.svg' : 'assets/icons/speaker-muted.svg';
    }
    saveState();
  });

  // Color chips in Wardrobe
  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      const color = dot.getAttribute('data-color');
      appState.pet.color = color;
      playSound(AUDIO.boopty);
      saveState();
      renderHUD();
      renderBirdhouse();
      showSpeechBubble(`Мне очень идёт окрас ${color}!`);
    });
  });

  // Adventure CTA
  document.getElementById('start-adventure-btn')?.addEventListener('click', startAdventure);

  // Quick Breathe
  document.getElementById('quick-breathe-btn')?.addEventListener('click', startBreathingExercise);
  document.getElementById('breathe-close-btn')?.addEventListener('click', () => {
    if (breatheTimerInterval) clearInterval(breatheTimerInterval);
    document.getElementById('breathe-modal').classList.remove('open');
  });
  document.getElementById('breathe-start-btn')?.addEventListener('click', startBreathingExercise);

  // Goal filters
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      renderGoals(pill.getAttribute('data-filter'));
    });
  });

  // Add Goal Modal
  const openAddGoalModal = () => {
    document.getElementById('add-goal-modal')?.classList.add('open');
  };
  document.getElementById('add-goal-open-btn')?.addEventListener('click', openAddGoalModal);
  document.getElementById('feed-add-goal-btn')?.addEventListener('click', openAddGoalModal);

  document.getElementById('add-goal-close-btn')?.addEventListener('click', () => {
    document.getElementById('add-goal-modal')?.classList.remove('open');
  });

  document.getElementById('save-goal-btn')?.addEventListener('click', () => {
    const input = document.getElementById('new-goal-input');
    const cat = document.getElementById('new-goal-category')?.value || 'selfCare';
    const val = input ? input.value.trim() : '';
    if (!val) return;

    appState.goals.push({
      id: 'g_' + Date.now(),
      title: val,
      category: cat,
      energy: 5,
      stones: 20,
      completed: false,
      icon: 'badge-checkmark.svg'
    });
    input.value = '';
    saveState();
    renderGoals();
    renderFeedGoals();
    document.getElementById('add-goal-modal')?.classList.remove('open');
    showSpeechBubble('Новая цель добавлена! Вперёд к заботе о себе!');
  });

  // Good vibes (Tree Town)
  document.querySelectorAll('.btn-good-vibes').forEach(btn => {
    btn.addEventListener('click', () => {
      const friend = btn.getAttribute('data-friend');
      playSound(AUDIO.magic);
      if (heartsLottie) heartsLottie.goToAndPlay(0, true);
      appState.pet.stones += 10;
      saveState();
      renderHUD();
      showSpeechBubble(`Вы отправили лучи добра ${friend}! +10 💎!`);
    });
  });

  // Settings & Profile
  document.getElementById('settings-btn')?.addEventListener('click', openSettingsModal);
  document.getElementById('settings-close-btn')?.addEventListener('click', () => {
    document.getElementById('settings-modal')?.classList.remove('open');
  });
  document.getElementById('settings-save-btn')?.addEventListener('click', saveSettings);
  document.getElementById('export-data-btn')?.addEventListener('click', exportBackupData);
  document.getElementById('import-data-file')?.addEventListener('change', (e) => {
    importBackupData(e.target.files[0]);
  });

  // First Aid Grounding
  document.getElementById('first-aid-btn')?.addEventListener('click', startFirstAid);
  document.getElementById('first-aid-close-btn')?.addEventListener('click', () => {
    document.getElementById('first-aid-modal')?.classList.remove('open');
  });
  document.getElementById('first-aid-next-btn')?.addEventListener('click', nextFirstAidStep);
});

// ================= FIRST AID GROUNDING (5-4-3-2-1) =================
const FIRST_AID_STEPS = [
  { num: 5, text: 'Посмотрите вокруг и найдите 5 вещей, которые вы видите прямо сейчас (цвет книги, узор на стене, свет за окном).' },
  { num: 4, text: 'Ощутите 4 вещи, к которым вы можете прикоснуться (текстура одежды, прохлада стола, твердость пола).' },
  { num: 3, text: 'Прислушайтесь и отметьте 3 звука вокруг вас (тиканье часов, шум за окном, ваше спокойное дыхание).' },
  { num: 2, text: 'Почувствуйте 2 запаха рядом с вами (свежий воздух, аромат чая или мыла).' },
  { num: 1, text: 'Скажите себе 1 доброе и ободряющее слово («Я в безопасности. Я справлюсь с этим шагом»).' }
];

let firstAidCurrentStep = 0;

function startFirstAid() {
  firstAidCurrentStep = 0;
  const modal = document.getElementById('first-aid-modal');
  modal?.classList.add('open');
  renderFirstAidStep();
}

function renderFirstAidStep() {
  const cur = FIRST_AID_STEPS[firstAidCurrentStep];
  const numEl = document.getElementById('fa-num');
  const textEl = document.getElementById('fa-text');
  const btn = document.getElementById('first-aid-next-btn');

  if (numEl) numEl.textContent = cur.num;
  if (textEl) textEl.textContent = cur.text;
  if (btn) {
    btn.textContent = firstAidCurrentStep === FIRST_AID_STEPS.length - 1 ? 'Завершить практику (+10 ⚡)' : 'Следующий шаг';
  }
}

function nextFirstAidStep() {
  firstAidCurrentStep++;
  playSound(AUDIO.boopty);
  if (firstAidCurrentStep >= FIRST_AID_STEPS.length) {
    playSound(AUDIO.bonus);
    appState.pet.energy = Math.min(appState.pet.maxEnergy, appState.pet.energy + 10);
    appState.pet.stones += 25;
    saveState();
    renderHUD();
    document.getElementById('first-aid-modal')?.classList.remove('open');
    showSpeechBubble('Отличное заземление! Ты в безопасности и под защитой 🛡️');
  } else {
    renderFirstAidStep();
  }
}

// ================= SETTINGS & PROFILE =================
function openSettingsModal() {
  const modal = document.getElementById('settings-modal');
  if (!modal) return;

  const petNameInput = document.getElementById('settings-pet-name');
  const ownerNameInput = document.getElementById('settings-owner-name');
  if (petNameInput) petNameInput.value = appState.pet.name;
  if (ownerNameInput) ownerNameInput.value = appState.pet.ownerName;

  renderSettingsTraits();
  modal.classList.add('open');
}

function renderSettingsTraits() {
  const container = document.getElementById('settings-traits-list');
  if (!container) return;
  container.innerHTML = '';

  const traits = [
    { key: 'Curiosity', label: 'Любознательность', val: appState.pet.traits?.Curiosity || 15 },
    { key: 'Compassion', label: 'Сострадание', val: appState.pet.traits?.Compassion || 20 },
    { key: 'Resilience', label: 'Стойкость', val: appState.pet.traits?.Resilience || 10 },
    { key: 'Logic', label: 'Логика и ясность', val: appState.pet.traits?.Logic || 12 }
  ];

  traits.forEach(t => {
    const row = document.createElement('div');
    row.className = 'trait-bar-row';
    const pct = Math.min(100, Math.round((t.val / 50) * 100));
    row.innerHTML = `
      <span style="width:130px;">${t.label}</span>
      <div class="trait-bar-track">
        <div class="trait-bar-fill" style="width:${pct}%;"></div>
      </div>
      <span style="width:30px; text-align:right;">${t.val}</span>
    `;
    container.appendChild(row);
  });
}

function saveSettings() {
  const petNameInput = document.getElementById('settings-pet-name');
  const ownerNameInput = document.getElementById('settings-owner-name');
  if (petNameInput && petNameInput.value.trim()) {
    appState.pet.name = petNameInput.value.trim();
  }
  if (ownerNameInput && ownerNameInput.value.trim()) {
    appState.pet.ownerName = ownerNameInput.value.trim();
  }
  saveState();
  renderHUD();
  document.getElementById('settings-modal')?.classList.remove('open');
  playSound(AUDIO.boopty);
  showSpeechBubble(`Настройки сохранены! Приятно познакомиться, ${appState.pet.ownerName}! ✨`);
}

function exportBackupData() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", `finch_backup_${Date.now()}.json`);
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  dlAnchor.remove();
  playSound(AUDIO.bonus);
}

function importBackupData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported && imported.pet) {
        appState = { ...DEFAULT_STATE, ...imported };
        saveState();
        renderAll();
        initPetLottie();
        initMrPricklesLottie();
        document.getElementById('settings-modal')?.classList.remove('open');
        playSound(AUDIO.magic);
        showSpeechBubble('Данные успешно восстановлены из резервной копии! 🌟');
      }
    } catch (err) {
      alert('Ошибка чтения файла резервной копии: ' + err.message);
    }
  };
  reader.readAsText(file);
}
