# -*- coding: utf-8 -*-

JS_CONTENT = r'''// ==========================================================================
// FINCH: SELF-CARE PET — 100% AUTHENTIC CLIENT GAME ENGINE
// Reconstructed based on Dart AOT dump.dart and original screenshots
// ==========================================================================

const STORAGE_KEY = 'finch_app_state_v2';

// Initial Game State
const defaultState = {
  activeTab: 'tab-home',
  petName: 'Лютик',
  petColor: '#58B790',
  stones: 165,
  streak: 2,
  adventureEnergy: 0,
  maxAdventureEnergy: 15,
  adventureStatus: 'idle', // 'idle' | 'ready' | 'exploring' | 'finished'
  friendCode: '1RBQYY8KG4',
  soundEnabled: true,
  pauseMode: false,
  goals: [
    { id: 1, title: 'Get out of bed (Встать с кровати)', icon: '1f33b.svg', completed: false, reward: 5 },
    { id: 2, title: 'Wash my face (Умыть лицо)', icon: '1f9fc.svg', completed: false, reward: 5 },
    { id: 3, title: 'Brush teeth (Почистить зубы)', icon: '1faa5.svg', completed: false, reward: 5 },
    { id: 4, title: 'Drink water (Выпить стакан воды)', icon: '1f4a7.svg', completed: false, reward: 5 }
  ],
  equippedHat: null,
  roomFurniture: {
    lamp: 'assets/images/birdhouse/simple-ceiling-lamp.svg',
    door: 'assets/images/birdhouse/simple-arched-door.svg',
    window: 'assets/images/birdhouse/simple-round-window.svg',
    clock: 'assets/images/birdhouse/woodsy-clock-square-icon.svg',
    dresser: 'assets/images/birdhouse/simple-dresser.svg',
    bed: 'assets/images/birdhouse/simple-nest.svg'
  },
  ownedFurniture: [
    { id: 'simple-nest', name: 'Гнездышко', icon: 'assets/images/birdhouse/simple-nest.svg', slot: 'bed' },
    { id: 'woodsy-clock', name: 'Лесные часы', icon: 'assets/images/birdhouse/woodsy-clock-square-icon.svg', slot: 'clock' },
    { id: 'simple-window', name: 'Круглое окно', icon: 'assets/images/birdhouse/simple-round-window.svg', slot: 'window' },
    { id: 'simple-door', name: 'Арочная дверь', icon: 'assets/images/birdhouse/simple-arched-door.svg', slot: 'door' },
    { id: 'simple-lamp', name: 'Потолочная лампа', icon: 'assets/images/birdhouse/simple-ceiling-lamp.svg', slot: 'lamp' }
  ],
  ownedOutfits: [
    { id: 'scientist-hat', name: 'Шляпа ученого', icon: 'assets/icons/inventory/alps-hat.svg', type: 'hat' },
    { id: 'wizard-hat', name: 'Шляпа волшебника', icon: 'assets/icons/inventory/starry-wizard-hat.svg', type: 'hat' }
  ],
  micropetEgg: {
    name: 'Бэтрик (Летучая мышка)',
    current: 2,
    total: 7,
    hatched: false
  }
};

// Global active state
let state = loadState();

// Save & Load
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Save failed:', e);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultState, ...parsed };
    }
  } catch (e) {
    console.error('Load failed:', e);
  }
  return JSON.parse(JSON.stringify(defaultState));
}

// ================= AUDIO SYNTHESIZER =================
class SoundFX {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }
  playChirp() {
    if (!state.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.16);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }
  playCheck() {
    if (!state.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
    osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }
  playCoin() {
    if (!state.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }
}
const sfx = new SoundFX();

// ================= DOM READY =================
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupPetInteractions();
  setupGoals();
  setupAdventure();
  setupShop();
  setupBagAndRoom();
  setupModalsAndDrawers();
  setupOnboarding();
  renderAll();
});

// ================= RENDER ALL =================
function renderAll() {
  // Update header stones
  document.getElementById('header-stone-count').innerText = state.stones;

  // Update pet name
  document.getElementById('pet-display-name').innerText = state.petName;
  document.getElementById('passport-name').innerText = state.petName;
  document.getElementById('drawer-pet-name').innerText = state.petName;

  // Render goals list
  renderGoalsList();

  // Render adventure card
  renderAdventureCard();

  // Render room furniture
  renderRoom();

  // Render micropet stats
  renderMicropet();
}

// ================= NAVIGATION =================
function setupNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Top buttons
  document.getElementById('robin-quick-btn').addEventListener('click', () => {
    switchTab('tab-shop');
    document.getElementById('shop-switch-robin').click();
  });
  document.getElementById('inbox-btn').addEventListener('click', () => {
    switchTab('tab-quests');
  });
  document.getElementById('add-stones-quick-btn').addEventListener('click', () => {
    state.stones += 50;
    sfx.playCoin();
    renderAll();
    saveState();
    launchConfetti();
  });
}

function switchTab(tabId) {
  state.activeTab = tabId;
  document.querySelectorAll('.tab-screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));

  const targetScreen = document.getElementById(tabId);
  const targetBtn = document.querySelector(`.nav-tab[data-tab="${tabId}"]`);
  if (targetScreen) targetScreen.classList.add('active');
  if (targetBtn) targetBtn.classList.add('active');
  sfx.playChirp();
}

// ================= PET INTERACTIONS =================
const chirps = [
  'Чирик! Я так рада тебя видеть! ❤️',
  'Спасибо, что заботишься обо мне! ✨',
  'Ты сегодня отлично справляешься! 🌟',
  'Пойдем скорее исследовать Finchie Forest! 🌲',
  'Я верю в твои силы! Давай выпьем водички! 💧'
];

function setupPetInteractions() {
  const pet = document.getElementById('pet-touch-target');
  const bubble = document.getElementById('pet-speech-bubble');
  let bubbleTimeout = null;

  pet.addEventListener('click', () => {
    sfx.playChirp();

    // Show random message
    const msg = chirps[Math.floor(Math.random() * chirps.length)];
    bubble.innerText = msg;
    bubble.classList.add('visible');

    if (bubbleTimeout) clearTimeout(bubbleTimeout);
    bubbleTimeout = setTimeout(() => {
      bubble.classList.remove('visible');
    }, 2800);

    // Give 1 energy if not full
    if (state.adventureEnergy < state.maxAdventureEnergy) {
      state.adventureEnergy = Math.min(state.maxAdventureEnergy, state.adventureEnergy + 1);
      renderAdventureCard();
      saveState();
    }

    launchFlyingHeart();
  });
}

// ================= GOALS SYSTEM =================
function setupGoals() {
  // Toggle accordion
  document.getElementById('goals-accordion-toggle').addEventListener('click', () => {
    const list = document.getElementById('goals-list');
    list.style.display = list.style.display === 'none' ? 'flex' : 'none';
  });

  // FAB Add goal
  document.getElementById('fab-add-goal').addEventListener('click', () => {
    openModal('add-goal-modal-overlay');
  });

  // Goal icon picker
  document.querySelectorAll('#goal-icon-picker .icon-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#goal-icon-picker .icon-choice').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Submit new goal
  document.getElementById('submit-new-goal-btn').addEventListener('click', () => {
    const titleInput = document.getElementById('new-goal-title-input');
    const title = titleInput.value.trim();
    if (!title) return;

    const activeIconBtn = document.querySelector('#goal-icon-picker .icon-choice.active');
    const icon = activeIconBtn ? activeIconBtn.getAttribute('data-icon') : '1f33b.svg';

    const newGoal = {
      id: Date.now(),
      title: title,
      icon: icon,
      completed: false,
      reward: 5
    };

    state.goals.push(newGoal);
    titleInput.value = '';
    closeModal('add-goal-modal-overlay');
    sfx.playCoin();
    renderAll();
    saveState();
  });
}

function renderGoalsList() {
  const container = document.getElementById('goals-list');
  container.innerHTML = '';

  const leftCount = state.goals.filter(g => !g.completed).length;
  document.getElementById('goals-left-heading').innerText = `${leftCount} цели на сегодня`;

  state.goals.forEach(goal => {
    const item = document.createElement('div');
    item.className = `goal-item ${goal.completed ? 'completed' : ''}`;

    const checkIconSrc = goal.completed ? 'assets/icons/circle-checkmark-fill.svg' : 'assets/icons/checkbox-empty.svg';

    item.innerHTML = `
      <button class="goal-checkbox-btn" data-goal-id="${goal.id}">
        <img src="${checkIconSrc}" class="goal-check-icon" alt="Чекбокс">
      </button>
      <div class="goal-icon-circle">
        <img src="assets/twemojis/${goal.icon}" class="goal-twemoji-img" alt="Цель">
      </div>
      <div class="goal-body">
        <div class="goal-title">${goal.title}</div>
      </div>
      <div class="goal-reward-pill">
        <img src="assets/icons/shop/rainbow-stone.svg" alt="Камень">
        <span>+${goal.reward}</span>
      </div>
    `;

    // Checkbox click
    const btn = item.querySelector('.goal-checkbox-btn');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleGoal(goal.id);
    });

    container.appendChild(item);
  });
}

function toggleGoal(id) {
  const goal = state.goals.find(g => g.id === id);
  if (!goal) return;

  goal.completed = !goal.completed;

  if (goal.completed) {
    sfx.playCheck();
    state.stones += goal.reward;
    state.adventureEnergy = Math.min(state.maxAdventureEnergy, state.adventureEnergy + 5);

    // Progress micropet egg
    if (!state.micropetEgg.hatched) {
      state.micropetEgg.current = Math.min(state.micropetEgg.total, state.micropetEgg.current + 1);
      if (state.micropetEgg.current >= state.micropetEgg.total) {
        state.micropetEgg.hatched = true;
      }
    }

    launchConfetti();
  }

  saveState();
  renderAll();
}

// ================= ADVENTURE SYSTEM =================
function setupAdventure() {
  const sendBtn = document.getElementById('send-adventure-btn');
  const finishBtn = document.getElementById('finish-adventure-btn');

  sendBtn.addEventListener('click', () => {
    state.adventureStatus = 'exploring';
    sfx.playChirp();
    renderAdventureCard();
    saveState();

    // After 10 seconds or immediately available
    setTimeout(() => {
      state.adventureStatus = 'finished';
      renderAdventureCard();
      saveState();
    }, 4000);
  });

  finishBtn.addEventListener('click', () => {
    openModal('adventure-modal-overlay');
  });

  document.getElementById('claim-adventure-discovery-btn').addEventListener('click', () => {
    state.stones += 30;
    state.adventureEnergy = 0;
    state.adventureStatus = 'idle';
    closeModal('adventure-modal-overlay');
    sfx.playCoin();
    launchConfetti();
    renderAll();
    saveState();
  });
}

function renderAdventureCard() {
  const ratio = document.getElementById('adv-energy-ratio');
  const bar = document.getElementById('adv-progress-bar');
  const desc = document.getElementById('adv-desc-text');
  const sendBtn = document.getElementById('send-adventure-btn');
  const finishBtn = document.getElementById('finish-adventure-btn');

  ratio.innerText = `${state.adventureEnergy}/${state.maxAdventureEnergy}`;
  const pct = Math.round((state.adventureEnergy / state.maxAdventureEnergy) * 100);
  bar.style.width = `${pct}%`;

  if (state.adventureStatus === 'idle') {
    finishBtn.style.display = 'none';
    if (state.adventureEnergy >= state.maxAdventureEnergy) {
      sendBtn.style.display = 'block';
      desc.innerText = 'Лютик полон энергии и готов исследовать тропы Finchie Forest! Нажми кнопку, чтобы отправить его в поход.';
    } else {
      sendBtn.style.display = 'none';
      desc.innerText = `${state.petName} нужно ${state.maxAdventureEnergy} энергии, чтобы отправиться в лес Finchie Forest! Выполняй цели ниже, чтобы зарядить птичку.`;
    }
  } else if (state.adventureStatus === 'exploring') {
    sendBtn.style.display = 'none';
    finishBtn.style.display = 'none';
    desc.innerText = `Лютик прямо сейчас весело гуляет по Finchie Forest и заглядывает под каждый кустик... 🌲`;
  } else if (state.adventureStatus === 'finished') {
    sendBtn.style.display = 'none';
    finishBtn.style.display = 'block';
    desc.innerText = `Лютик вернулся из похода с новой интересной историей и наградой!`;
  }
}

// ================= SHOP SYSTEM =================
const shopOutfits = [
  { id: 'hat_scientist', name: 'Brown Scientist Hat', icon: 'assets/icons/inventory/alps-hat.svg', price: 150 },
  { id: 'hat_mushroom', name: 'Purple Mushroom Hat', icon: 'assets/icons/inventory/sweetheart-beret.svg', price: 180 },
  { id: 'spooky_candle', name: 'Spooky Candle', icon: 'assets/icons/halloween/icon-candy-orange.svg', price: 200 },
  { id: 'glasses_round', name: 'Round Sunglasses', icon: 'assets/icons/inventory/groovy-heart-glasses.svg', price: 120 },
  { id: 'penguin_slippers', name: 'Penguin Slippers', icon: 'assets/icons/inventory/sweetheart-slippers.svg', price: 160 },
  { id: 'wizard_hat', name: 'Starry Wizard Hat', icon: 'assets/icons/inventory/starry-wizard-hat.svg', price: 300 }
];

const shopFurniture = [
  { id: 'woodsy_clock', name: 'Лесные часы', icon: 'assets/images/birdhouse/woodsy-clock-square-icon.svg', price: 150, slot: 'clock' },
  { id: 'woodsy_window', name: 'Лесное окно', icon: 'assets/images/birdhouse/woodsy-window-square-icon.svg', price: 250, slot: 'window' },
  { id: 'woodsy_bed', name: 'Лесная кровать', icon: 'assets/images/birdhouse/woodsy-bed-square-icon.svg', price: 350, slot: 'bed' },
  { id: 'alps_bed', name: 'Альпийская кровать', icon: 'assets/images/birdhouse/alps-bed-square-icon.svg', price: 380, slot: 'bed' },
  { id: 'simple_door', name: 'Арочная дверь', icon: 'assets/images/birdhouse/simple-arched-door.svg', price: 200, slot: 'door' },
  { id: 'ceiling_lamp', name: 'Потолочная лампа', icon: 'assets/images/birdhouse/simple-ceiling-lamp.svg', price: 120, slot: 'lamp' }
];

let activeShopMode = 'prickles';

function setupShop() {
  const pricklesBtn = document.getElementById('shop-switch-prickles');
  const robinBtn = document.getElementById('shop-switch-robin');
  const bubble = document.getElementById('merchant-bubble');

  pricklesBtn.addEventListener('click', () => {
    activeShopMode = 'prickles';
    pricklesBtn.classList.add('active');
    robinBtn.classList.remove('active');
    bubble.innerText = '«Добро пожаловать в ателье! Выбирай самые стильные шляпы и наряды!»';
    renderShopGrid();
  });

  robinBtn.addEventListener('click', () => {
    activeShopMode = 'robin';
    robinBtn.classList.add('active');
    pricklesBtn.classList.remove('active');
    bubble.innerText = '«Привет из лесной мастерской! Вся мебель выточена из уютного дуба!»';
    renderShopGrid();
  });

  document.getElementById('shop-manual-refresh-btn').addEventListener('click', () => {
    if (state.stones >= 10) {
      state.stones -= 10;
      sfx.playCoin();
      renderAll();
      renderShopGrid();
      saveState();
    }
  });

  renderShopGrid();
}

function renderShopGrid() {
  const container = document.getElementById('shop-items-grid');
  container.innerHTML = '';

  const items = activeShopMode === 'prickles' ? shopOutfits : shopFurniture;

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'shop-item-card';

    const isOwned = activeShopMode === 'prickles'
      ? state.ownedOutfits.some(o => o.id === item.id)
      : state.ownedFurniture.some(f => f.id === item.id);

    card.innerHTML = `
      <img src="${item.icon}" class="shop-item-preview" alt="${item.name}">
      <span class="shop-item-name">${item.name}</span>
      <div class="shop-item-price-tag">
        <img src="assets/icons/shop/rainbow-stone.svg">
        <span>${item.price}</span>
      </div>
      <button class="buy-item-btn ${isOwned ? 'owned' : ''}">
        ${isOwned ? 'Куплено ✓' : 'Купить'}
      </button>
    `;

    const buyBtn = card.querySelector('.buy-item-btn');
    if (!isOwned) {
      buyBtn.addEventListener('click', () => {
        buyShopItem(item);
      });
    }

    container.appendChild(card);
  });
}

function buyShopItem(item) {
  if (state.stones < item.price) {
    alert('Недостаточно радужных камней! Выполняй цели дня, чтобы заработать еще.');
    return;
  }

  state.stones -= item.price;
  sfx.playCoin();

  if (activeShopMode === 'prickles') {
    state.ownedOutfits.push({ id: item.id, name: item.name, icon: item.icon, type: 'hat' });
  } else {
    state.ownedFurniture.push({ id: item.id, name: item.name, icon: item.icon, slot: item.slot });
    state.roomFurniture[item.slot] = item.icon;
  }

  launchConfetti();
  renderAll();
  renderShopGrid();
  saveState();
}

// ================= BAG & ROOM =================
function setupBagAndRoom() {
  const roomTabBtn = document.getElementById('bag-subtab-room');
  const outfitTabBtn = document.getElementById('bag-subtab-outfit');
  const roomView = document.getElementById('room-screen-view');
  const wardrobeView = document.getElementById('wardrobe-screen-view');

  roomTabBtn.addEventListener('click', () => {
    roomTabBtn.classList.add('active');
    outfitTabBtn.classList.remove('active');
    roomView.style.display = 'block';
    wardrobeView.style.display = 'none';
  });

  outfitTabBtn.addEventListener('click', () => {
    outfitTabBtn.classList.add('active');
    roomTabBtn.classList.remove('active');
    roomView.style.display = 'none';
    wardrobeView.style.display = 'block';
    renderWardrobeGrid();
  });
}

function renderRoom() {
  document.getElementById('slot-lamp').src = state.roomFurniture.lamp;
  document.getElementById('slot-door').src = state.roomFurniture.door;
  document.getElementById('slot-window').src = state.roomFurniture.window;
  document.getElementById('slot-clock').src = state.roomFurniture.clock;
  document.getElementById('slot-dresser').src = state.roomFurniture.dresser;
  document.getElementById('slot-bed').src = state.roomFurniture.bed;

  // Render furniture tray
  const tray = document.getElementById('furniture-slots-row');
  tray.innerHTML = '';

  state.ownedFurniture.forEach(f => {
    const card = document.createElement('div');
    card.className = 'furniture-item-card';
    card.innerHTML = `
      <img src="${f.icon}">
      <span>${f.name}</span>
    `;
    card.addEventListener('click', () => {
      state.roomFurniture[f.slot] = f.icon;
      sfx.playCheck();
      renderRoom();
      saveState();
    });
    tray.appendChild(card);
  });
}

function renderWardrobeGrid() {
  const grid = document.getElementById('wardrobe-items-grid');
  grid.innerHTML = '';

  state.ownedOutfits.forEach(outfit => {
    const card = document.createElement('div');
    card.className = 'wardrobe-item-card';
    card.innerHTML = `
      <img src="${outfit.icon}">
      <span>${outfit.name}</span>
    `;
    card.addEventListener('click', () => {
      sfx.playChirp();
      alert(`Надето: ${outfit.name}!`);
    });
    grid.appendChild(card);
  });
}

// ================= FRIENDS =================
window.sendGoodVibes = function(name) {
  sfx.playChirp();
  launchFlyingHeart();
  alert(`Вы отправили сердечные объятия другу (${name})! ❤️`);
};

// ================= MICROPETS & DISCOVERY =================
function renderMicropet() {
  const egg = state.micropetEgg;
  document.getElementById('incubator-progress-text').innerText = egg.hatched
    ? 'Яйцо вылупилось! Бэтрик теперь твой друг!'
    : 'Привязано к цели: Выполнить 7 раз';

  const pct = Math.round((egg.current / egg.total) * 100);
  document.getElementById('incubator-progress-fill').style.width = `${pct}%`;
  document.getElementById('incubator-ratio-text').innerText = `${egg.current}/${egg.total} выполнено`;
}

// ================= MODALS & DRAWERS =================
function setupModalsAndDrawers() {
  // Hamburger drawer
  document.getElementById('menu-btn').addEventListener('click', () => {
    openDrawer('menu-drawer-overlay');
  });
  document.getElementById('close-menu-drawer-btn').addEventListener('click', () => {
    closeDrawer('menu-drawer-overlay');
  });

  // Streak modal
  document.getElementById('open-streak-modal-btn').addEventListener('click', () => {
    renderStreakCalendar();
    openModal('streak-modal-overlay');
  });
  document.getElementById('close-streak-modal-btn').addEventListener('click', () => {
    closeModal('streak-modal-overlay');
  });

  // Micropets modal
  document.getElementById('open-micropets-btn').addEventListener('click', () => {
    openModal('micropets-modal-overlay');
  });
  document.getElementById('close-micropets-btn').addEventListener('click', () => {
    closeModal('micropets-modal-overlay');
  });

  // Add goal modal close
  document.getElementById('close-add-goal-btn').addEventListener('click', () => {
    closeModal('add-goal-modal-overlay');
  });

  // Reset app
  document.getElementById('drawer-reset-app').addEventListener('click', () => {
    if (confirm('Сбросить весь прогресс до начального состояния?')) {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  });

  // Export backup
  document.getElementById('drawer-export-backup').addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', 'Finch_Backup.finch.json');
    dl.click();
  });

  // Re-open onboarding
  document.getElementById('drawer-open-onboarding').addEventListener('click', () => {
    closeDrawer('menu-drawer-overlay');
    openModal('onboarding-modal-overlay');
  });

  // Friend code copy
  document.getElementById('copy-friend-code-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(state.friendCode).then(() => {
      alert('Код дружбы скопирован в буфер: ' + state.friendCode);
    });
  });
}

function openModal(id) {
  document.getElementById(id).classList.add('active');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}
function openDrawer(id) {
  document.getElementById(id).classList.add('active');
}
function closeDrawer(id) {
  document.getElementById(id).classList.remove('active');
}

// Streak Calendar rendering
function renderStreakCalendar() {
  const grid = document.getElementById('streak-cal-grid');
  grid.innerHTML = '';
  for (let day = 1; day <= 31; day++) {
    const cell = document.createElement('div');
    cell.className = 'cal-day-cell';
    cell.innerText = day;
    // Current active streak on days 26 and 27
    if (day === 26 || day === 27) {
      cell.classList.add('active-streak');
      cell.innerHTML = `${day} <img src="assets/icons/streak_star.svg" style="width:12px;height:12px;">`;
    }
    grid.appendChild(cell);
  }
}

// ================= ONBOARDING (NUX) =================
let eggCrackStage = 0;

function setupOnboarding() {
  const eggTarget = document.getElementById('egg-touch-target');
  const eggImg = document.getElementById('nux-egg-img');
  const eggFill = document.getElementById('egg-warmth-fill');

  eggTarget.addEventListener('click', () => {
    eggCrackStage++;
    sfx.playChirp();

    if (eggCrackStage === 1) {
      eggImg.src = 'assets/images/egg/egg-crack-1.svg';
      eggFill.style.width = '33%';
    } else if (eggCrackStage === 2) {
      eggImg.src = 'assets/images/egg/egg-crack-2.svg';
      eggFill.style.width = '66%';
    } else if (eggCrackStage >= 3) {
      eggImg.src = 'assets/images/egg/egg-crack-3.svg';
      eggFill.style.width = '100%';
      launchConfetti();

      setTimeout(() => {
        // Go to step 2
        document.getElementById('nux-step-1').classList.remove('active');
        document.getElementById('nux-step-2').classList.add('active');
      }, 600);
    }
  });

  // Step 2 Continue
  document.getElementById('nux-continue-btn-2').addEventListener('click', () => {
    const nameInput = document.getElementById('nux-pet-name-input').value.trim();
    if (nameInput) state.petName = nameInput;
    document.getElementById('nux-step-2').classList.remove('active');
    document.getElementById('nux-step-3').classList.add('active');
  });

  // Step 3 Finish
  document.getElementById('nux-finish-btn').addEventListener('click', () => {
    closeModal('onboarding-modal-overlay');
    launchConfetti();
    sfx.playCoin();
    renderAll();
    saveState();
  });
}

// ================= CANVAS FX =================
function launchConfetti() {
  const canvas = document.getElementById('fx-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;

  const particles = [];
  const colors = ['#58B790', '#FF9800', '#FFCA28', '#42A5F5', '#EC407A'];

  for (let i = 0; i < 40; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height * 0.4,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.8) * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 6 + 4,
      life: 1
    });
  }

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // gravity
      p.life -= 0.02;
      if (p.life > 0) {
        active = true;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    if (active) {
      requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  requestAnimationFrame(frame);
}

function launchFlyingHeart() {
  const canvas = document.getElementById('fx-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;

  let y = canvas.height * 0.45;
  const x = canvas.width / 2;
  let alpha = 1;

  function heartFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    y -= 2;
    alpha -= 0.02;
    if (alpha > 0) {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#EC407A';
      ctx.font = '24px sans-serif';
      ctx.fillText('❤️', x - 12, y);
      requestAnimationFrame(heartFrame);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  requestAnimationFrame(heartFrame);
}
'''

with open('web/app.js', 'w', encoding='utf-8') as f:
    f.write(JS_CONTENT)

print("Generated web/app.js successfully!")
