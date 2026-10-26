// Finch Web App (Reconstructed Engine)
// Handles audio, Lottie animations, adventure storytelling, and self-care goals

const STATE_KEY = 'finch_app_state_v1';

// Default initial state
const defaultState = {
  petName: 'Бирби',
  ownerName: 'Друг',
  growthStage: 'Малыш (Baby)',
  streak: 3,
  energy: 45,
  stones: 320,
  featherColor: '#FFB8B8',
  soundEnabled: true,
  adventureActive: false,
  adventureProgress: 0,
  storyIndex: 0,
  traits: {
    Curiosity: 4,
    Compassion: 6,
    Resilience: 3,
    Logic: 2
  },
  goals: [
    { id: 1, text: 'Выпить стакан чистой воды 💧', energy: 15, stones: 5, completed: false },
    { id: 2, text: 'Глубоко подышать 2 минуты 🌬️', energy: 20, stones: 10, completed: false },
    { id: 3, text: 'Сделать разминку для шеи и спины 🧘', energy: 15, stones: 5, completed: false },
    { id: 4, text: 'Записать одну хорошую мысль ✨', energy: 20, stones: 10, completed: false },
    { id: 5, text: 'Почистить зубки перед сном 🪥', energy: 15, stones: 5, completed: false }
  ]
};

// Load or initialize state
let state = Object.assign({}, defaultState);
try {
  const saved = localStorage.getItem(STATE_KEY);
  if (saved) {
    state = Object.assign(state, JSON.parse(saved));
  }
} catch (e) {
  console.warn('LocalStorage error:', e);
}

function saveState() {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (e) {}
  renderStats();
}

// Sound System (uses real Finch extracted M4A audio)
const sounds = {
  chirp: new Audio('./assets/audio/babyChirpHappy.m4a'),
  chirpSoft: new Audio('./assets/audio/babyChirp_softened.m4a'),
  bonus: new Audio('./assets/audio/fairyBonus.m4a'),
  bell: new Audio('./assets/audio/bellChimes.m4a'),
  boop: new Audio('./assets/audio/boopty.m4a'),
  magic: new Audio('./assets/audio/floaty-magic.m4a'),
  breatheIn: new Audio('./assets/audio/breathe_in.m4a'),
  breatheHold: new Audio('./assets/audio/breathe_hold.m4a'),
  breatheOut: new Audio('./assets/audio/breathe_out.m4a')
};

function playSound(key) {
  if (!state.soundEnabled || !sounds[key]) return;
  try {
    const s = sounds[key];
    s.currentTime = 0;
    s.play().catch(() => {});
  } catch (e) {}
}

// Lottie Animation Controllers
let petAnim = null;
let heartsAnim = null;

function initLottie() {
  const petContainer = document.getElementById('lottie-pet-container');
  const heartsContainer = document.getElementById('lottie-hearts-container');

  if (window.lottie) {
    // Base Pet Idle Animation
    petAnim = lottie.loadAnimation({
      container: petContainer,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: './assets/animations/Finch_Waiting_01.json'
    });

    // Hearts Effect (play on tap)
    heartsAnim = lottie.loadAnimation({
      container: heartsContainer,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      path: './assets/animations/Effects_Solo_Hearts_01.json'
    });
  }
}

function playPetCheerAnimation() {
  if (!petAnim) return;
  petAnim.destroy();
  petAnim = lottie.loadAnimation({
    container: document.getElementById('lottie-pet-container'),
    renderer: 'svg',
    loop: false,
    autoplay: true,
    path: './assets/animations/CB01_Emoji_Clap_01.json'
  });
  petAnim.addEventListener('complete', () => {
    petAnim.destroy();
    petAnim = lottie.loadAnimation({
      container: document.getElementById('lottie-pet-container'),
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: './assets/animations/Finch_Waiting_01.json'
    });
  });
}

// UI Render Helpers
function renderStats() {
  document.getElementById('streak-val').textContent = state.streak;
  document.getElementById('energy-val').textContent = state.energy;
  document.getElementById('stones-val').textContent = state.stones;
  document.getElementById('pet-name').textContent = state.petName;
  document.getElementById('pet-stage-tag').textContent = state.growthStage;

  // Traits in profile modal
  document.getElementById('trait-curiosity').textContent = state.traits.Curiosity || 0;
  document.getElementById('trait-compassion').textContent = state.traits.Compassion || 0;
  document.getElementById('trait-resilience').textContent = state.traits.Resilience || 0;
  document.getElementById('trait-logic').textContent = state.traits.Logic || 0;

  // Adventure Button State
  const advBtn = document.getElementById('start-adv-btn');
  const advStatus = document.getElementById('adv-status-text');
  if (state.adventureActive) {
    advBtn.disabled = true;
    advBtn.innerHTML = '<span>⏳</span> <span>В путешествии...</span>';
    advStatus.textContent = 'Исследует окрестности...';
  } else {
    advBtn.disabled = state.energy < 30;
    advBtn.innerHTML = '<span>🎒</span> <span>Отправить в путешествие (30⚡)</span>';
    advStatus.textContent = state.energy >= 30 ? 'Готов к походу!' : 'Нужно ещё ' + (30 - state.energy) + '⚡';
  }

  // Update Pet Stage Background color
  document.getElementById('pet-stage').style.background = `radial-gradient(circle, ${state.featherColor}33 0%, #FFF3E6 100%)`;
}

// Render Goals List
function renderGoals() {
  const list = document.getElementById('goals-list');
  list.innerHTML = '';

  state.goals.forEach(goal => {
    const item = document.createElement('div');
    item.className = 'goal-item' + (goal.completed ? ' completed' : '');
    item.innerHTML = `
      <div class="goal-left">
        <div class="goal-checkbox">${goal.completed ? '✓' : ''}</div>
        <span class="goal-text">${goal.text}</span>
      </div>
      <span class="goal-reward">+${goal.energy}⚡ +${goal.stones}💎</span>
    `;

    item.addEventListener('click', () => toggleGoal(goal.id));
    list.appendChild(item);
  });
}

function toggleGoal(id) {
  const goal = state.goals.find(g => g.id === id);
  if (!goal) return;

  goal.completed = !goal.completed;
  if (goal.completed) {
    playSound('bonus');
    state.energy = Math.min(100, state.energy + goal.energy);
    state.stones += goal.stones;
    playPetCheerAnimation();
    setSpeech(`Ура! Цель выполнена! +${goal.energy}⚡ энергии! 🎉`);
  } else {
    state.energy = Math.max(0, state.energy - goal.energy);
    state.stones = Math.max(0, state.stones - goal.stones);
  }

  saveState();
  renderGoals();
}

// Pet Tapping / Petting
const petPhrases = [
  'Чик-чирик! Я так рад тебя видеть! 💖',
  'Ты замечательно справляешься, помни об этом! ✨',
  'Спасибо, что заботишься обо мне и о себе! 🌸',
  'Поглаживания делают мои перышки мягче! 🥰',
  'Не забудь сделать паузу и выпить глоток воды 💧',
  'Каждый маленький шаг вперёд — это победа! 🐥'
];

function petTheBird() {
  playSound('chirp');
  if (heartsAnim) {
    heartsAnim.goToAndPlay(0, true);
  }
  const phrase = petPhrases[Math.floor(Math.random() * petPhrases.length)];
  setSpeech(phrase);
}

function setSpeech(text) {
  const bubble = document.getElementById('speech-bubble');
  bubble.style.transform = 'scale(0.95)';
  setTimeout(() => {
    bubble.textContent = text;
    bubble.style.transform = 'scale(1)';
  }, 100);
}

// Adventure Progress & Story Engine
let allStories = [];

fetch('./data/stories.json')
  .then(res => res.json())
  .then(data => {
    allStories = data;
    console.log(`Загружено ${allStories.length} историй Finch.`);
  })
  .catch(err => console.error('Ошибка загрузки историй:', err));

function startAdventure() {
  if (state.energy < 30 || state.adventureActive) return;

  state.energy -= 30;
  state.adventureActive = true;
  state.adventureProgress = 0;
  saveState();
  playSound('magic');
  setSpeech(`${state.petName} надел рюкзачок и отправился на прогулку! 🌲`);

  const bar = document.getElementById('adv-progress-bar');
  const interval = setInterval(() => {
    state.adventureProgress += 10;
    bar.style.width = state.adventureProgress + '%';

    if (state.adventureProgress >= 100) {
      clearInterval(interval);
      state.adventureActive = false;
      bar.style.width = '0%';
      saveState();
      triggerStoryDialog();
    }
  }, 400);
}

function triggerStoryDialog() {
  playSound('bell');
  const story = allStories[state.storyIndex % allStories.length] || {
    title: 'Лесная полянка',
    emoji: '🌲',
    prompt: `${state.petName} вернулся из леса с находкой! Что посоветуешь сделать?`,
    choice1: 'Изучить находку внимательно (+Любознательность)',
    trait1: 'Curiosity',
    choice2: 'Поделиться с лесными друзьями (+Сострадание)',
    trait2: 'Compassion',
    reply1: 'Это было так интересно исследовать, спасибо!',
    reply2: 'Друзья были так рады, чик-чирик!'
  };

  state.storyIndex++;
  saveState();

  // Populate Story Modal
  const modal = document.getElementById('story-modal');
  document.getElementById('story-modal-title').textContent = story.title || 'Весточка из похода!';
  document.getElementById('story-emoji').textContent = story.emoji || '🐣';

  // Format prompt replacing templates
  let promptText = story.prompt
    .replace(/#PET_NAME/g, state.petName)
    .replace(/#HUMAN_NAME/g, state.ownerName);
  document.getElementById('story-prompt-text').textContent = promptText;

  const choicesContainer = document.getElementById('story-choices-container');
  choicesContainer.innerHTML = '';

  const c1 = document.createElement('button');
  c1.className = 'btn-choice';
  c1.textContent = '1. ' + story.choice1;
  c1.onclick = () => chooseStoryOption(story.trait1, story.reply1, modal);
  choicesContainer.appendChild(c1);

  if (story.choice2) {
    const c2 = document.createElement('button');
    c2.className = 'btn-choice';
    c2.textContent = '2. ' + story.choice2;
    c2.onclick = () => chooseStoryOption(story.trait2, story.reply2, modal);
    choicesContainer.appendChild(c2);
  }

  modal.classList.add('active');
}

function chooseStoryOption(trait, reply, modal) {
  playSound('boop');
  modal.classList.remove('active');

  if (trait) {
    state.traits[trait] = (state.traits[trait] || 0) + 1;
  }
  state.stones += 25;
  saveState();

  playPetCheerAnimation();
  let replyText = (reply || 'Спасибо за мудрый совет!').replace(/#PET_NAME/g, state.petName);
  setSpeech(`${replyText} (+25💎 камней, черта "${trait || 'Рост'}" выросла!)`);
}

// Breathing Mindfulness Exercise (4-4-4 Box Breathing)
let breathingTimer = null;
let breathingSeconds = 4;
let breathingPhase = 'inhale'; // inhale, hold, exhale

function openBreathingModal() {
  const modal = document.getElementById('breathing-modal');
  modal.classList.add('active');
  startBreathingCycle();
}

function startBreathingCycle() {
  const circle = document.getElementById('breathe-circle');
  const phaseText = document.getElementById('breathe-phase-text');
  const secText = document.getElementById('breathe-seconds');

  breathingPhase = 'inhale';
  breathingSeconds = 4;

  const runPhase = () => {
    secText.textContent = breathingSeconds;

    if (breathingPhase === 'inhale') {
      phaseText.textContent = 'Вдох носом... 🌬️';
      circle.className = 'breathing-circle inhale';
      if (breathingSeconds === 4) playSound('breatheIn');
    } else if (breathingPhase === 'hold') {
      phaseText.textContent = 'Задержите дыхание... ✨';
      circle.className = 'breathing-circle hold';
      if (breathingSeconds === 4) playSound('breatheHold');
    } else if (breathingPhase === 'exhale') {
      phaseText.textContent = 'Спокойный выдох ртом... 🍃';
      circle.className = 'breathing-circle exhale';
      if (breathingSeconds === 4) playSound('breatheOut');
    }

    breathingSeconds--;

    if (breathingSeconds < 0) {
      if (breathingPhase === 'inhale') {
        breathingPhase = 'hold';
        breathingSeconds = 4;
      } else if (breathingPhase === 'hold') {
        breathingPhase = 'exhale';
        breathingSeconds = 4;
      } else if (breathingPhase === 'exhale') {
        // Complete cycle
        clearInterval(breathingTimer);
        phaseText.textContent = 'Отличная практика! Спокойствие и энергия восстановлены.';
        playSound('bonus');
        state.energy = Math.min(100, state.energy + 20);
        state.stones += 10;
        saveState();
        setTimeout(() => {
          document.getElementById('breathing-modal').classList.remove('active');
          setSpeech('Ты отлично подышал! Появилось ещё 20⚡ энергии! 🌈');
        }, 1500);
        return;
      }
    }
  };

  runPhase();
  breathingTimer = setInterval(runPhase, 1000);
}

function closeBreathingModal() {
  clearInterval(breathingTimer);
  document.getElementById('breathing-modal').classList.remove('active');
}

// Initialize Everything on DOM Load
window.addEventListener('DOMContentLoaded', () => {
  initLottie();
  renderStats();
  renderGoals();

  // Pet Stage tap
  document.getElementById('pet-stage').addEventListener('click', petTheBird);

  // Adventure Button
  document.getElementById('start-adv-btn').addEventListener('click', startAdventure);

  // Quick Tools
  document.getElementById('tool-breathe').addEventListener('click', openBreathingModal);
  document.getElementById('tool-water').addEventListener('click', () => {
    playSound('boop');
    state.energy = Math.min(100, state.energy + 10);
    saveState();
    setSpeech('Глоток свежей воды! +10⚡ энергии! 💧');
  });
  document.getElementById('tool-wardrobe').addEventListener('click', () => {
    document.getElementById('wardrobe-modal').classList.add('active');
  });

  // Sound Toggle
  document.getElementById('sound-btn').addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    document.getElementById('sound-btn').textContent = state.soundEnabled ? '🔔' : '🔕';
    saveState();
  });

  // Settings / Profile
  document.getElementById('settings-btn').addEventListener('click', () => {
    document.getElementById('profile-modal').classList.add('active');
  });

  // Bottom Nav
  document.getElementById('nav-home').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.getElementById('nav-adventure').addEventListener('click', () => {
    document.querySelector('.adventure-card').scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('nav-profile').addEventListener('click', () => {
    document.getElementById('profile-modal').classList.add('active');
  });

  // Modal Closers
  document.getElementById('close-story-btn').addEventListener('click', () => {
    document.getElementById('story-modal').classList.remove('active');
  });
  document.getElementById('close-breathing-btn').addEventListener('click', closeBreathingModal);
  document.getElementById('close-wardrobe-btn').addEventListener('click', () => {
    document.getElementById('wardrobe-modal').classList.remove('active');
  });
  document.getElementById('close-profile-btn').addEventListener('click', () => {
    document.getElementById('profile-modal').classList.remove('active');
  });

  // Wardrobe Color Pickers
  document.querySelectorAll('.color-option').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.color-option').forEach(c => c.classList.remove('selected'));
      el.classList.add('selected');
      state.featherColor = el.getAttribute('data-color');
      saveState();
      playSound('boop');
      setSpeech(`Новый оттенок оперения: ${el.getAttribute('data-name')}! ✨`);
    });
  });

  // Add Goal prompt
  document.getElementById('add-goal-btn').addEventListener('click', () => {
    const text = prompt('Введите новую цель заботы о себе:');
    if (text && text.trim()) {
      state.goals.push({
        id: Date.now(),
        text: text.trim(),
        energy: 15,
        stones: 5,
        completed: false
      });
      saveState();
      renderGoals();
      playSound('boop');
    }
  });
});
