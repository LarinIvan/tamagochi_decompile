// Finch: Self-Care Pet - Authentic Web Engine

// ================= STATE =================
const STATE_KEY = 'finch_app_state_v2';

const DEFAULT_STATE = {
  pet: {
    name: 'Бирби',
    streak: 1,
    energy: 35,
    maxEnergy: 100,
    stones: 320,
    color: 'Classic Grey',
    isSleeping: false,
    activeHat: '',
    activeGlasses: '',
    activeMicropet: 'CMP_Beaky_01.json',
    traits: { Curiosity: 15, Compassion: 20, Resilience: 10, Logic: 12 }
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
    { id: 'g2', title: 'Потянуться и размять шею', category: 'body', energy: 5, stones: 20, completed: false, icon: 'badge-checkmark.svg' },
    { id: 'g3', title: 'Осознанное дыхание 4-4-4', category: 'mindfulness', energy: 10, stones: 35, completed: false, icon: 'badge-checkmark.svg' },
    { id: 'g4', title: 'Сказать себе добрые слова', category: 'selfCare', energy: 5, stones: 20, completed: false, icon: 'badge-checkmark.svg' },
    { id: 'g5', title: 'Проветрить комнату', category: 'selfCare', energy: 5, stones: 20, completed: false, icon: 'badge-checkmark.svg' }
  ],
  purchasedItems: ['alps-hat.svg', 'groovy-heart-glasses.svg'],
  soundEnabled: true
};

let appState = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Storage error:', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function saveState() {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(appState));
  } catch (e) {}
}

// ================= AUDIO ENGINE =================
const AUDIO = {
  chirp: new Audio('assets/audio/babyChirpHappy.m4a'),
  bonus: new Audio('assets/audio/fairyBonus.m4a'),
  bell: new Audio('assets/audio/bellChimes.m4a'),
  boopty: new Audio('assets/audio/boopty.m4a'),
  magic: new Audio('assets/audio/floaty-magic.m4a'),
  hatch: new Audio('assets/audio/eggHatch.m4a'),
  breatheIn: new Audio('assets/audio/breathe_in.m4a'),
  breatheHold: new Audio('assets/audio/breathe_hold.m4a'),
  breatheOut: new Audio('assets/audio/breathe_out.m4a')
};

function playSound(audioObj) {
  if (!appState.soundEnabled) return;
  try {
    audioObj.currentTime = 0;
    audioObj.play().catch(() => {});
  } catch (e) {}
}

// ================= LOTTIE PLAYERS =================
let petLottie = null;
let heartsLottie = null;
let micropetLottie = null;

function initLotties() {
  const petContainer = document.getElementById('lottie-pet-container');
  const animFile = appState.birdhouse.isLightOn
    ? 'assets/animations/CB01_Full_01.1_Naked.json'
    : 'assets/animations/Finch_Sleepy in Bed_01.json';

  if (petLottie) petLottie.destroy();
  petLottie = lottie.loadAnimation({
    container: petContainer,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: animFile
  });

  const heartsContainer = document.getElementById('lottie-hearts-container');
  heartsLottie = lottie.loadAnimation({
    container: heartsContainer,
    renderer: 'svg',
    loop: false,
    autoplay: false,
    path: 'assets/animations/Effects_Solo_Hearts_01.json'
  });

  updateMicropetLottie();
}

function updateMicropetLottie() {
  const container = document.getElementById('lottie-micropet-container');
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

// ================= UI RENDERERS =================
function renderAll() {
  renderHUD();
  renderBirdhouse();
  renderGoals();
  renderWardrobe();
  renderShop();
}

function renderHUD() {
  document.getElementById('hud-pet-name').textContent = appState.pet.name;
  document.getElementById('color-label').textContent = appState.pet.color;
  document.getElementById('streak-val').textContent = appState.pet.streak;
  document.getElementById('energy-val').textContent = appState.pet.energy;
  document.getElementById('stones-val').textContent = appState.pet.stones;

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
    room.classList.add('night');
    document.getElementById('light-label').textContent = 'Включить свет';
  } else {
    room.classList.remove('night');
    document.getElementById('light-label').textContent = 'Выключить свет';
  }

  // Pet color filter
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
    hatsGrid.firstElementChild.addEventListener('click', () => {
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
    glassesGrid.firstElementChild.addEventListener('click', () => {
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

// ================= SHOP =================
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
  // Install immediately in birdhouse
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
  playSound(AUDIO.hatch);
  showSpeechBubble('Я отправляюсь в путешествие по волшебному лесу! 🎒');

  setTimeout(() => {
    showStoryModal();
  }, 1200);
}

function showStoryModal() {
  if (!allStories || allStories.length === 0) return;
  const story = allStories[Math.floor(Math.random() * allStories.length)];

  document.getElementById('adv-story-title').textContent = story.title || 'История из путешествия';
  document.getElementById('adv-story-text').textContent = story.text;
  document.getElementById('adv-story-question').textContent = story.question;

  const choicesList = document.getElementById('adv-choices-list');
  choicesList.innerHTML = '';

  story.choices.forEach(ch => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = ch.text;
    btn.addEventListener('click', () => {
      // Pick choice
      playSound(AUDIO.chirp);
      appState.pet.streak += 1;
      appState.pet.stones += 40;
      appState.pet.traits[ch.trait] = (appState.pet.traits[ch.trait] || 0) + 5;
      saveState();
      renderHUD();
      document.getElementById('adventure-modal').classList.remove('open');
      showSpeechBubble(`${ch.response} (Черта характера: ${ch.trait} +5!)`);
    });
    choicesList.appendChild(btn);
  });

  document.getElementById('adventure-modal').classList.add('open');
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

  startBtn.style.display = 'none';

  let step = 0; // 0: Inhale, 1: Hold, 2: Exhale
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
          // Finished cycle!
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
  initLotties();
  renderAll();

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
    });
  });

  // Pet Petting
  document.getElementById('pet-stage-box').addEventListener('click', () => {
    playSound(AUDIO.chirp);
    heartsLottie.goToAndPlay(0, true);
    const phrases = [
      'Чирик! Спасибо за любовь и заботу!',
      'Ты замечательный друг!',
      'Я так рад проводить этот день вместе!',
      'Поглаживания заряжают теплом! 💖'
    ];
    showSpeechBubble(phrases[Math.floor(Math.random() * phrases.length)]);
  });

  // Light switch toggle
  const toggleLight = () => {
    appState.birdhouse.isLightOn = !appState.birdhouse.isLightOn;
    playSound(AUDIO.boopty);
    saveState();
    renderBirdhouse();
    initLotties();
    if (!appState.birdhouse.isLightOn) {
      showSpeechBubble('Тссс... Сладких снов, Бирби отдыхает! 🌙');
    } else {
      showSpeechBubble('Доброе утро! Прекрасный день для заботы о себе! ☀️');
    }
  };

  document.getElementById('light-toggle-btn').addEventListener('click', toggleLight);
  document.getElementById('room-lamp-wrapper').addEventListener('click', toggleLight);

  // Sound toggle
  document.getElementById('sound-btn').addEventListener('click', () => {
    appState.soundEnabled = !appState.soundEnabled;
    const icon = document.getElementById('sound-icon');
    icon.src = appState.soundEnabled ? 'assets/icons/speaker-waves.svg' : 'assets/icons/speaker-muted.svg';
    saveState();
  });

  // Color chips
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
  document.getElementById('start-adventure-btn').addEventListener('click', startAdventure);

  // Quick Breathe
  document.getElementById('quick-breathe-btn').addEventListener('click', startBreathingExercise);
  document.getElementById('breathe-close-btn').addEventListener('click', () => {
    if (breatheTimerInterval) clearInterval(breatheTimerInterval);
    document.getElementById('breathe-modal').classList.remove('open');
  });
  document.getElementById('breathe-start-btn').addEventListener('click', startBreathingExercise);

  // Goal filters
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      renderGoals(pill.getAttribute('data-filter'));
    });
  });

  // Add Goal Modal
  document.getElementById('add-goal-open-btn').addEventListener('click', () => {
    document.getElementById('add-goal-modal').classList.add('open');
  });
  document.getElementById('add-goal-close-btn').addEventListener('click', () => {
    document.getElementById('add-goal-modal').classList.remove('open');
  });
  document.getElementById('save-goal-btn').addEventListener('click', () => {
    const input = document.getElementById('new-goal-input');
    const cat = document.getElementById('new-goal-category').value;
    const val = input.value.trim();
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
    document.getElementById('add-goal-modal').classList.remove('open');
    showSpeechBubble('Новая цель добавлена! Вперёд к заботе о себе!');
  });

  // Good vibes
  document.querySelectorAll('.btn-good-vibes').forEach(btn => {
    btn.addEventListener('click', () => {
      const friend = btn.getAttribute('data-friend');
      playSound(AUDIO.magic);
      heartsLottie.goToAndPlay(0, true);
      appState.pet.stones += 10;
      saveState();
      renderHUD();
      showSpeechBubble(`Вы отправили лучи добра ${friend}! +10 💎!`);
    });
  });
});
