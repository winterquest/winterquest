/**
 * НОВОРІЧНА КАЗКА — ПОВНИЙ СКРИПТ ВЗАЄМОДІЇ
 * Вхід -> Льодяникові знаки питання -> Загадка про лпшку Настю -> Інтерактивна піца -> Фінал
 */

document.addEventListener('DOMContentLoaded', () => {
  // ----------------------------------------------------
  // 1. АУДІО ТА АВТОМАТИЧНИЙ СТАРТ ТРЕКУ
  // ----------------------------------------------------
  // ----------------------------------------------------
  // СВЯТКОВИЙ МУЗИЧНИЙ ПЛЕЄР ТА КЕРУВАННЯ ГУЧНІСТЮ
  // ----------------------------------------------------
  const bgMusic = document.getElementById('bgMusic');
  const musicToggle = document.getElementById('musicToggle');
  const musicPlayerWrap = document.getElementById('musicPlayerWrap');
  const musicPopover = document.getElementById('musicPopover');
  const closeMusicPopoverBtn = document.getElementById('closeMusicPopoverBtn');
  const musicPlayPauseBtn = document.getElementById('musicPlayPauseBtn');
  const playPauseIcon = document.getElementById('playPauseIcon');
  const playPauseLabel = document.getElementById('playPauseLabel');
  const musicMuteBtn = document.getElementById('musicMuteBtn');
  const muteIcon = document.getElementById('muteIcon');
  const muteLabel = document.getElementById('muteLabel');
  const volumeSlider = document.getElementById('volumeSlider');
  const volumePercent = document.getElementById('volumePercent');
  const volPresetBtns = document.querySelectorAll('.vol-preset-btn');

  let isPlaying = false;
  // ГУЧНІСТЬ ЗА ЗАМОВЧУВАННЯМ: 0.42 (у 2 рази менша за попередні 0.85)
  let currentVolume = 0.42;
  let isMuted = false;
  let prevUnmutedVolume = 0.42;

  // Відновлюємо налаштування гучності з localStorage
  try {
    const savedVol = localStorage.getItem('viktoria_music_vol');
    if (savedVol !== null) {
      const parsed = parseFloat(savedVol);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
        currentVolume = parsed;
        prevUnmutedVolume = parsed > 0 ? parsed : 0.42;
      }
    }
    const savedMuted = localStorage.getItem('viktoria_music_muted');
    if (savedMuted === 'true') {
      isMuted = true;
    }
  } catch (e) {}

  function setPlayingState(playing) {
    isPlaying = playing;
    if (musicToggle) {
      if (playing) {
        musicToggle.classList.add('playing');
        musicToggle.title = 'Керування музикою (Грає) 🎶';
      } else {
        musicToggle.classList.remove('playing');
        musicToggle.title = 'Керування музикою (Пауза) ⏸️';
      }
    }
    if (playPauseIcon && playPauseLabel) {
      if (playing) {
        playPauseIcon.textContent = '⏸️';
        playPauseLabel.textContent = 'Пауза';
      } else {
        playPauseIcon.textContent = '▶️';
        playPauseLabel.textContent = 'Грати';
      }
    }
  }

  function applyVolume(vol, isFromMuteAction = false) {
    currentVolume = Math.max(0, Math.min(1, vol));
    if (!isFromMuteAction && currentVolume > 0) {
      isMuted = false;
      prevUnmutedVolume = currentVolume;
    }

    const effectiveVol = isMuted ? 0 : currentVolume;
    if (bgMusic) {
      bgMusic.volume = effectiveVol;
    }

    const pct = Math.round(effectiveVol * 100);
    if (volumeSlider) {
      volumeSlider.value = isMuted ? 0 : Math.round(currentVolume * 100);
    }
    if (volumePercent) {
      volumePercent.textContent = isMuted ? '0% (Мут)' : `${pct}%`;
    }

    if (musicMuteBtn) {
      if (isMuted) {
        musicMuteBtn.classList.add('muted');
        if (muteIcon) muteIcon.textContent = '🔇';
        if (muteLabel) muteLabel.textContent = 'Розмутити';
      } else {
        musicMuteBtn.classList.remove('muted');
        if (muteIcon) muteIcon.textContent = '🔊';
        if (muteLabel) muteLabel.textContent = 'Мут';
      }
    }

    if (volPresetBtns) {
      volPresetBtns.forEach(btn => {
        const val = parseInt(btn.getAttribute('data-vol'), 10);
        btn.classList.toggle('active', !isMuted && Math.abs(val - pct) <= 4);
      });
    }

    try {
      localStorage.setItem('viktoria_music_vol', currentVolume.toString());
      localStorage.setItem('viktoria_music_muted', isMuted ? 'true' : 'false');
    } catch (e) {}
  }

  function toggleMute() {
    if (isMuted) {
      isMuted = false;
      applyVolume(prevUnmutedVolume > 0 ? prevUnmutedVolume : 0.42, true);
    } else {
      isMuted = true;
      prevUnmutedVolume = currentVolume > 0 ? currentVolume : 0.42;
      applyVolume(0, true);
      unlockAchievement('silent_night');
    }
    playToneEffect('pop');
  }

  function startAudio() {
    if (!bgMusic || isPlaying) return;
    bgMusic.volume = isMuted ? 0 : currentVolume;
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        setPlayingState(true);
      }).catch(() => {});
    }
  }

  // Ініціалізація гучності та відтворення
  applyVolume(currentVolume, isMuted);
  startAudio();

  const interactionEvents = ['click', 'pointerdown', 'touchstart', 'keydown'];
  const triggerAudioOnFirstAction = () => {
    startAudio();
    interactionEvents.forEach(evt => document.removeEventListener(evt, triggerAudioOnFirstAction));
  };
  interactionEvents.forEach(evt => document.addEventListener(evt, triggerAudioOnFirstAction, { passive: true }));

  // Клік по кнопці музики в HUD — відкриває/закриває віконце керування музикою
  if (musicToggle) {
    musicToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!musicPopover) return;
      const isHidden = musicPopover.classList.contains('hidden');
      if (isHidden) {
        if (achievementToast) achievementToast.classList.remove('show');
        musicPopover.classList.remove('hidden');
        if (musicPlayerWrap) musicPlayerWrap.classList.add('open');
        playToneEffect('pop');
        if (!isPlaying) startAudio();
      } else {
        musicPopover.classList.add('hidden');
        if (musicPlayerWrap) musicPlayerWrap.classList.remove('open');
      }
    });
  }

  // Закриття попапу музики
  if (closeMusicPopoverBtn) {
    closeMusicPopoverBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (musicPopover) musicPopover.classList.add('hidden');
      if (musicPlayerWrap) musicPlayerWrap.classList.remove('open');
    });
  }

  document.addEventListener('click', (e) => {
    if (musicPopover && !musicPopover.classList.contains('hidden')) {
      if (!musicPopover.contains(e.target) && !musicToggle.contains(e.target)) {
        musicPopover.classList.add('hidden');
        if (musicPlayerWrap) musicPlayerWrap.classList.remove('open');
      }
    }
  });

  // Кнопка Пауза / Грати у попапі
  if (musicPlayPauseBtn) {
    musicPlayPauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!bgMusic) return;

      if (isPlaying) {
        bgMusic.pause();
        setPlayingState(false);
        unlockAchievement('silent_night');
      } else {
        bgMusic.play().then(() => {
          setPlayingState(true);
        }).catch(() => {});
      }
      playToneEffect('pop');
    });
  }

  // Кнопка Мут у попапі
  if (musicMuteBtn) {
    musicMuteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMute();
    });
  }

  // Повзунок гучності
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10) / 100;
      if (val === 0) {
        isMuted = true;
        unlockAchievement('silent_night');
      } else {
        isMuted = false;
      }
      applyVolume(val);
    });
  }

  // Кнопки швидких пресетів
  if (volPresetBtns) {
    volPresetBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = parseInt(btn.getAttribute('data-vol'), 10) / 100;
        if (val === 0) {
          isMuted = true;
          unlockAchievement('silent_night');
          applyVolume(0, true);
        } else {
          isMuted = false;
          applyVolume(val);
        }
        playToneEffect('pop');
      });
    });
  }

  // ----------------------------------------------------
  // СИНТЕЗАТОР ЗВУКОВИХ ЕФЕКТІВ (WEB AUDIO API)
  // ----------------------------------------------------
  let webAudioCtx = null;
  function playToneEffect(kind) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!webAudioCtx) webAudioCtx = new AudioCtx();
      if (webAudioCtx.state === 'suspended') webAudioCtx.resume();

      const t = webAudioCtx.currentTime;
      if (kind === 'pop') {
        const osc = webAudioCtx.createOscillator();
        const g = webAudioCtx.createGain();
        osc.connect(g);
        g.connect(webAudioCtx.destination);
        osc.frequency.setValueAtTime(540, t);
        osc.frequency.exponentialRampToValueAtTime(1080, t + 0.1);
        g.gain.setValueAtTime(0.2, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.11);
      } else if (kind === 'chime') {
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = webAudioCtx.createOscillator();
          const g = webAudioCtx.createGain();
          osc.connect(g);
          g.connect(webAudioCtx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t + idx * 0.08);
          g.gain.setValueAtTime(0.18, t + idx * 0.08);
          g.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.35);
          osc.start(t + idx * 0.08);
          osc.stop(t + idx * 0.08 + 0.4);
        });
      } else if (kind === 'fanfare') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = webAudioCtx.createOscillator();
          const g = webAudioCtx.createGain();
          osc.connect(g);
          g.connect(webAudioCtx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t + idx * 0.09);
          g.gain.setValueAtTime(0.22, t + idx * 0.09);
          g.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.09 + 0.45);
          osc.start(t + idx * 0.09);
          osc.stop(t + idx * 0.09 + 0.5);
        });
      } else if (kind === 'buzz') {
        const osc = webAudioCtx.createOscillator();
        const g = webAudioCtx.createGain();
        osc.connect(g);
        g.connect(webAudioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.linearRampToValueAtTime(140, t + 0.15);
        g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.16);
      }
    } catch (err) {}
  }

  // 4. CANVAS: ЗОРЯНЕ НЕБО ТА СНІГОПАД
  // ----------------------------------------------------
  const skyCanvas = document.getElementById('skyCanvas');
  const skyCtx = skyCanvas.getContext('2d');
  const snowCanvas = document.getElementById('snowCanvas');
  const snowCtx = snowCanvas.getContext('2d');

  let width = (skyCanvas.width = snowCanvas.width = window.innerWidth);
  let height = (skyCanvas.height = snowCanvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = skyCanvas.width = snowCanvas.width = window.innerWidth;
    height = skyCanvas.height = snowCanvas.height = window.innerHeight;
    if (questionsCanvas) {
      questionsCanvas.width = width;
      questionsCanvas.height = height;
    }
    initStars();
  });

  const stars = [];
  function initStars() {
    stars.length = 0;
    const starCount = Math.floor((width * height) / 3800);
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.6),
        size: Math.random() * 2 + 0.6,
        alpha: Math.random(),
        twinkleSpeed: (Math.random() * 0.02 + 0.006) * (Math.random() > 0.5 ? 1 : -1),
        color: Math.random() > 0.3 ? '#ffffff' : (Math.random() > 0.5 ? '#fde047' : '#93c5fd')
      });
    }
  }
  initStars();

  let shootingStar = null;
  function triggerShootingStar() {
    shootingStar = {
      x: Math.random() * width * 0.65,
      y: Math.random() * (height * 0.3),
      length: Math.random() * 90 + 60,
      speed: Math.random() * 12 + 12,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.25,
      alpha: 1,
      decay: 0.018
    };
  }

  setInterval(() => {
    if (!shootingStar && Math.random() > 0.35) {
      triggerShootingStar();
    }
  }, 4000);

  function renderSky() {
    skyCtx.clearRect(0, 0, width, height);

    for (const s of stars) {
      s.alpha += s.twinkleSpeed;
      if (s.alpha >= 1 || s.alpha <= 0.15) {
        s.twinkleSpeed = -s.twinkleSpeed;
      }
      skyCtx.beginPath();
      skyCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      skyCtx.fillStyle = s.color;
      skyCtx.globalAlpha = Math.max(0, Math.min(1, s.alpha));
      if (s.size > 1.5) {
        skyCtx.shadowBlur = 8;
        skyCtx.shadowColor = s.color;
      }
      skyCtx.fill();
      skyCtx.shadowBlur = 0;
    }

    if (shootingStar) {
      const tailX = shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length;
      const tailY = shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length;
      const grad = skyCtx.createLinearGradient(shootingStar.x, shootingStar.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.alpha})`);
      grad.addColorStop(0.3, `rgba(254, 240, 138, ${shootingStar.alpha * 0.9})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      skyCtx.beginPath();
      skyCtx.moveTo(shootingStar.x, shootingStar.y);
      skyCtx.lineTo(tailX, tailY);
      skyCtx.strokeStyle = grad;
      skyCtx.lineWidth = 3;
      skyCtx.stroke();

      shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
      shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
      shootingStar.alpha -= shootingStar.decay;

      if (shootingStar.alpha <= 0 || shootingStar.x > width || shootingStar.y > height) {
        shootingStar = null;
      }
    }
    requestAnimationFrame(renderSky);
  }
  renderSky();

  // Снігопад
  const snowflakes = [];
  const maxFlakes = Math.min(200, Math.floor((width * height) / 4800));
  let windSpeed = 0.4;
  let targetWind = 0.4;

  window.addEventListener('mousemove', (e) => {
    const normX = (e.clientX / width) - 0.5;
    targetWind = normX * 2.2;
  });

  class Flake {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x = Math.random() * (width + 300) - 150;
      this.y = initial ? Math.random() * height : -15;
      const layer = Math.random();
      if (layer < 0.55) {
        this.size = Math.random() * 1.6 + 1.0;
        this.speedY = Math.random() * 0.9 + 0.6;
        this.alpha = Math.random() * 0.35 + 0.25;
        this.swaySpeed = Math.random() * 0.02 + 0.01;
      } else if (layer < 0.88) {
        this.size = Math.random() * 2.2 + 2.2;
        this.speedY = Math.random() * 1.4 + 1.1;
        this.alpha = Math.random() * 0.3 + 0.6;
        this.swaySpeed = Math.random() * 0.03 + 0.015;
      } else {
        this.size = Math.random() * 4 + 4.5;
        this.speedY = Math.random() * 2.2 + 1.8;
        this.alpha = Math.random() * 0.3 + 0.7;
        this.swaySpeed = Math.random() * 0.04 + 0.02;
      }
      this.angle = Math.random() * Math.PI * 2;
    }
    update() {
      this.angle += this.swaySpeed;
      this.x += Math.sin(this.angle) * 0.6 + windSpeed;
      this.y += this.speedY;
      if (this.y > height + 20 || this.x < -150 || this.x > width + 150) {
        this.reset();
      }
    }
    draw() {
      snowCtx.beginPath();
      snowCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      snowCtx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
      snowCtx.fill();
    }
  }

  for (let i = 0; i < maxFlakes; i++) snowflakes.push(new Flake());

  const snowSparkles = [];

  function spawnSnowCatchSparkles(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * 2.5 + 1.2;
      snowSparkles.push({
        x: x,
        y: y,
        size: Math.random() * 2 + 1.2,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        alpha: 1,
        color: '#fde047',
        update() {
          this.x += this.speedX;
          this.y += this.speedY;
          this.alpha -= 0.04;
        },
        draw() {
          if (this.alpha <= 0) return;
          snowCtx.beginPath();
          snowCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          snowCtx.fillStyle = this.color;
          snowCtx.globalAlpha = Math.max(0, this.alpha);
          snowCtx.fill();
        }
      });
    }
  }

  function renderSnow() {
    snowCtx.clearRect(0, 0, width, height);
    windSpeed += (targetWind - windSpeed) * 0.025;
    for (const f of snowflakes) {
      f.update();
      f.draw();
    }
    for (let i = snowSparkles.length - 1; i >= 0; i--) {
      const sp = snowSparkles[i];
      sp.update();
      sp.draw();
      if (sp.alpha <= 0) {
        snowSparkles.splice(i, 1);
      }
    }
    snowCtx.globalAlpha = 1;
    requestAnimationFrame(renderSnow);
  }
  renderSnow();

  // ----------------------------------------------------
  // 5. CANVAS: ВЕЛИКІ МОРОЗНО-ЛЬОДЯНИКОВІ ЗНАКИ ПИТАННЯ (?) НА ФОНІ
  // ----------------------------------------------------
  const questionsCanvas = document.getElementById('questionsCanvas');
  const qCtx = questionsCanvas.getContext('2d');
  questionsCanvas.width = width;
  questionsCanvas.height = height;

  const candyImg = new Image();
  candyImg.src = 'candy_question.png';

  const floatingQuestions = [];
  let isQuestionsActive = false;

  function initFloatingQuestions() {
    floatingQuestions.length = 0;
    const count = Math.min(18, Math.max(10, Math.floor(width / 80)));
    for (let i = 0; i < count; i++) {
      floatingQuestions.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseScale: Math.random() * 0.22 + 0.12, // гарний великий розмір
        scale: 0.18,
        angle: (Math.random() - 0.5) * Math.PI,
        rotationSpeed: (Math.random() * 0.008 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.35 + 0.35,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }
  }

  function renderQuestions() {
    if (!isQuestionsActive) return;
    qCtx.clearRect(0, 0, width, height);

    for (const q of floatingQuestions) {
      q.angle += q.rotationSpeed;
      q.x += q.speedX;
      q.y += q.speedY;

      if (q.x < -100) q.x = width + 100;
      if (q.x > width + 100) q.x = -100;
      if (q.y < -120) q.y = height + 120;
      if (q.y > height + 120) q.y = -120;

      q.pulseOffset += 0.02;
      const curScale = q.baseScale + Math.sin(q.pulseOffset) * 0.02;

      qCtx.save();
      qCtx.translate(q.x, q.y);
      qCtx.rotate(q.angle);
      qCtx.globalAlpha = q.alpha;
      qCtx.shadowBlur = 18;
      qCtx.shadowColor = 'rgba(254, 240, 138, 0.45)';

      const w = candyImg.width * curScale;
      const h = candyImg.height * curScale;
      qCtx.drawImage(candyImg, -w / 2, -h / 2, w, h);
      qCtx.restore();
    }

    requestAnimationFrame(renderQuestions);
  }

  function startQuestionsEffect() {
    isQuestionsActive = true;
    initFloatingQuestions();
    questionsCanvas.classList.add('active');
    renderQuestions();
  }

  // ----------------------------------------------------
  // ========================================================
  // СИСТЕМА ДОСЯГНЕНЬ (ACHIEVEMENTS SYSTEM)
  // 13 обов'язкових (потрібно 7/13) + 2 особливі бонусні
  // ========================================================
  const ACHIEVEMENTS_DATA = {
    lp_first_try: {
      id: 'lp_first_try',
      category: 'quests',
      title: 'Знавець лпшки',
      desc: 'Відповіла «Настя» з 1-ї спроби!',
      hint: 'Дай правильну відповідь про найкращу подругу з першого разу.',
      icon: '💖',
      required: true
    },
    tricky_errors: {
      id: 'tricky_errors',
      category: 'quests',
      title: 'Хитрунка',
      desc: 'Зробила 3 помилки поспіль!',
      hint: 'Спробуй ввести 3 невірні відповіді поспіль у загадках чи шифрах.',
      icon: '🦊',
      required: true
    },
    pizzaiolo: {
      id: 'pizzaiolo',
      category: 'quests',
      title: 'Піцайоло',
      desc: 'Розгадала секретний шифр із пепероні!',
      hint: 'Знайди правильну послідовність шматочків пепероні (1 ➔ 4 ➔ 2).',
      icon: '🍕',
      required: true
    },
    gourmet: {
      id: 'gourmet',
      category: 'quests',
      title: 'Гурманка',
      desc: 'Скуштувала всі 4 смаки на новорічній піці!',
      hint: 'Клікни по кожному із 4-х секторів піци (Пепероні, Сир, Морепродукти, Овочі).',
      icon: '🍽️',
      required: true
    },
    moon_girl: {
      id: 'moon_girl',
      category: 'easter',
      title: 'Місячна дівчинка',
      desc: 'Торкнулася чарівного місяця на нічному небі!',
      hint: 'Знайди сяючий місяць на нічному небі та клікни по ньому.',
      icon: '🌙',
      required: true
    },
    chalet_warmth: {
      id: 'chalet_warmth',
      category: 'easter',
      title: 'Тепло шале',
      desc: 'Зазирнула у затишні світлі віконця хатинки!',
      hint: 'Клікни по світному віконечку зимового будиночка.',
      icon: '🏡',
      required: true
    },
    sweet_tooth: {
      id: 'sweet_tooth',
      category: 'easter',
      title: 'Солодкоїжка',
      desc: 'Зловила 10 святкових льодяників на екрані!',
      hint: 'Зроби 10 кліків по льодяниках чи знаках ? на екрані.',
      icon: '🍭',
      required: true
    },
    silent_night: {
      id: 'silent_night',
      category: 'easter',
      title: 'Тиха ніч',
      desc: 'Вимкнула музику, щоб послухати зимову тишу.',
      hint: 'Спробуй вимкнути святковий трек на кнопці зверху.',
      icon: '🤫',
      required: true
    },
    snow_queen: {
      id: 'snow_queen',
      category: 'easter',
      title: 'Снігова королева',
      desc: 'Зловила 50 чарівних сніжинок у повітрі!',
      hint: 'Лови падаючі сніжинки курсором мишки чи пальчиком (потрібно 50).',
      icon: '❄️',
      required: true
    },
    winter_car: {
      id: 'winter_car',
      category: 'easter',
      title: 'Новорічний драйв',
      desc: 'Спіймала кліком чарівну червону машинку з ялинкою на дорозі!',
      hint: 'Придивися до засніженої дороги — там іноді проїжджає святкова машинка з ялинкою, клікни по ній!',
      icon: '🚗',
      required: true
    },
    night_owl: {
      id: 'night_owl',
      category: 'behavior',
      title: 'Нічна пташка',
      desc: 'Завітала у казку після півночі!',
      hint: 'Зайди на сайт між 00:00 та 06:00 (або клікни на опівнічний годинник 🕛).',
      icon: '🦉',
      required: true
    },
    impatient: {
      id: 'impatient',
      category: 'behavior',
      title: 'Нетерпляча',
      desc: '5+ разів натиснула «Відкрити подарунок» завчасно!',
      hint: 'Спробуй наполегливо натискати кнопку подарунка до збору 7 ачівок.',
      icon: '⏱️',
      required: true
    },
    wheel_persistent: {
      id: 'wheel_persistent',
      category: 'wheel',
      title: 'Не здаюсь',
      desc: '5 спроб на Колесі Фортуни поспіль! Неймовірна наполегливість!',
      hint: 'Зроби 5 обертань колеса поспіль без головного призу.',
      icon: '🔄',
      required: true
    },
    lucky_one: {
      id: 'lucky_one',
      category: 'special',
      title: 'Везунчик',
      desc: 'Зірвала рідкісний Головний Приз на Колесі Фортуни (шанс 4%)!',
      hint: 'Крути Колесо Фортуни — тобі має випасти золотий сектор.',
      icon: '🍀',
      required: false
    },
    collector: {
      id: 'collector',
      category: 'special',
      title: 'Колекціонерка',
      desc: 'Секретне досягнення! Зібрано абсолютно ВСІ нагороди!',
      hint: 'Розблокуй усі інші 14 досягнень. Дарує супер-бонус у фіналі!',
      icon: '👑',
      required: false
    }
  };

  const ACHIEVEMENTS_STORAGE_KEY = 'viktoria_newyear_achievements_v2';
  let unlockedAchievements = new Set();

  function loadAchievements() {
    try {
      const saved = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) {
          unlockedAchievements = new Set(arr);
        }
      }
    } catch (e) {}
  }

  function saveAchievements() {
    try {
      localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(Array.from(unlockedAchievements)));
    } catch (e) {}
  }

  loadAchievements();

  function getRequiredCount() {
    let count = 0;
    for (const key of unlockedAchievements) {
      if (ACHIEVEMENTS_DATA[key] && ACHIEVEMENTS_DATA[key].required) {
        count++;
      }
    }
    return count;
  }

  function isAchievementUnlocked(id) {
    return unlockedAchievements.has(id);
  }

  // Toast сповіщення
  const achievementToast = document.getElementById('achievementToast');
  const toastIcon = document.getElementById('toastIcon');
  const toastName = document.getElementById('toastName');
  const toastDesc = document.getElementById('toastDesc');
  let toastTimer = null;

  function showAchievementToast(ach) {
    if (!achievementToast) return;
    toastIcon.textContent = ach.icon;
    toastName.textContent = ach.title;
    toastDesc.textContent = ach.desc;

    achievementToast.classList.remove('show');
    void achievementToast.offsetWidth;
    achievementToast.classList.add('show');
    playToneEffect('fanfare');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      achievementToast.classList.remove('show');
    }, 4500);
  }

  if (achievementToast) {
    achievementToast.addEventListener('click', () => {
      achievementToast.classList.remove('show');
      openRewardsModal();
    });
  }

  function updateHUDProgress() {
    const requiredCount = getRequiredCount();
    const totalUnlocked = unlockedAchievements.size;
    const requiredPoolMax = Object.values(ACHIEVEMENTS_DATA).filter(a => a.required).length;
    const totalPoolMax = Object.keys(ACHIEVEMENTS_DATA).length;
    const hudProgressText = document.getElementById('hudProgressText');
    const hudProgressBar = document.getElementById('hudProgressBar');
    const giftCurrentCount = document.getElementById('giftCurrentCount');
    const giftLockWarning = document.getElementById('giftLockWarning');
    const finalGiftBtnText = document.getElementById('finalGiftBtnText');

    if (hudProgressText) {
      if (requiredCount >= 7) {
        if (totalUnlocked > requiredPoolMax) {
          hudProgressText.innerHTML = `<span style="color:#fde047">${totalUnlocked}/${totalPoolMax}</span> <span style="font-size:0.75rem" title="Секретні досягнення розблоковано! 👑">👑</span>`;
        } else if (totalUnlocked === requiredPoolMax) {
          hudProgressText.innerHTML = `<span style="color:#fde047">${requiredPoolMax}/${requiredPoolMax}</span> <span style="font-size:0.75rem" title="Всі основні досягнення зібрано! 🏆">🏆</span>`;
        } else {
          hudProgressText.innerHTML = `<span style="color:#fde047">${totalUnlocked}/${requiredPoolMax}</span> <span style="font-size:0.75rem" title="Лист від Kir відкрито! 💌">✅</span>`;
        }
      } else {
        hudProgressText.innerHTML = `${requiredCount}/7`;
      }
    }
    if (hudProgressBar) {
      if (requiredCount >= 7) {
        hudProgressBar.style.width = '100%';
        hudProgressBar.style.background = 'linear-gradient(90deg, #22c55e, #fde047)';
      } else {
        const pct = Math.min(100, Math.round((requiredCount / 7) * 100));
        hudProgressBar.style.width = `${pct}%`;
        hudProgressBar.style.background = 'linear-gradient(90deg, #f59e0b, #22c55e)';
      }
    }
    if (giftCurrentCount) {
      giftCurrentCount.textContent = totalUnlocked >= 7 ? totalUnlocked : requiredCount;
    }
    if (giftLockWarning) {
      if (requiredCount >= 7) {
        giftLockWarning.classList.add('hidden');
      } else {
        giftLockWarning.classList.remove('hidden');
      }
    }
    if (finalGiftBtnText) {
      if (requiredCount >= 7) {
        const maxPool = totalUnlocked > requiredPoolMax ? totalPoolMax : requiredPoolMax;
        finalGiftBtnText.textContent = `Розпакувати лист від Kir 💌✨ (зібрано ${totalUnlocked}/${maxPool} ачівок)`;
      } else {
        finalGiftBtnText.textContent = `Відкрити лист від Kir (потрібно 7 ачівок: ${requiredCount}/7) 🔒`;
      }
    }

    // Modal
    const modalAchieveRatio = document.getElementById('modalAchieveRatio');
    const modalProgressBar = document.getElementById('modalProgressBar');
    const modalProgressNote = document.getElementById('modalProgressNote');

    if (modalAchieveRatio) {
      if (requiredCount >= 7) {
        const maxPool = totalUnlocked > requiredPoolMax ? totalPoolMax : requiredPoolMax;
        modalAchieveRatio.textContent = `${totalUnlocked} / ${maxPool} (Лист відкрито! 🎉)`;
      } else {
        modalAchieveRatio.textContent = `${requiredCount} / 7 (до відкриття листа)`;
      }
    }
    if (modalProgressBar) {
      const maxPool = totalUnlocked > requiredPoolMax ? totalPoolMax : requiredPoolMax;
      const pct = requiredCount >= 7 
        ? Math.min(100, Math.round((totalUnlocked / maxPool) * 100))
        : Math.min(100, Math.round((requiredCount / 7) * 100));
      modalProgressBar.style.width = `${pct}%`;
    }
    if (modalProgressNote) {
      if (requiredCount >= 7) {
        modalProgressNote.textContent = '🎉 Ура! Чарівний замок знято! Фінальний лист від Kir розблоковано!';
        modalProgressNote.style.color = '#86efac';
      } else {
        modalProgressNote.textContent = `🔒 Потрібно ще ${Math.max(0, 7 - requiredCount)} досягнень для відкриття подарунка`;
        modalProgressNote.style.color = '#fde68a';
      }
    }
  }

  function unlockAchievement(id) {
    if (!ACHIEVEMENTS_DATA[id]) return;
    if (unlockedAchievements.has(id)) return;

    unlockedAchievements.add(id);
    saveAchievements();

    const ach = ACHIEVEMENTS_DATA[id];
    showAchievementToast(ach);
    updateHUDProgress();
    renderAchievementsModal();

    // Перевірка на "Колекціонерку" (якщо зібрано всі інші 14)
    if (id === 'collector' && questProgress.isGiftOpened && collectorSuperBadge) {
      collectorSuperBadge.classList.remove('hidden');
    } else if (id !== 'collector') {
      const allOtherKeys = Object.keys(ACHIEVEMENTS_DATA).filter(k => k !== 'collector');
      const allUnlocked = allOtherKeys.every(k => unlockedAchievements.has(k));
      if (allUnlocked && !unlockedAchievements.has('collector')) {
        setTimeout(() => {
          unlockAchievement('collector');
        }, 1200);
      }
    }
  }

  // Модальне вікно нагород
  const rewardsModal = document.getElementById('rewardsModal');
  const openRewardsBtn = document.getElementById('openRewardsBtn');
  const closeRewardsBtn = document.getElementById('closeRewardsBtn');

  function openRewardsModal() {
    if (!rewardsModal) return;
    playToneEffect('chime');
    renderAchievementsModal();
    updateHUDProgress();
    rewardsModal.classList.remove('hidden');
  }

  function closeRewardsModal() {
    if (!rewardsModal) return;
    rewardsModal.classList.add('hidden');
  }

  if (openRewardsBtn) openRewardsBtn.addEventListener('click', openRewardsModal);
  if (closeRewardsBtn) closeRewardsBtn.addEventListener('click', closeRewardsModal);
  if (rewardsModal) {
    rewardsModal.addEventListener('click', (e) => {
      if (e.target === rewardsModal) closeRewardsModal();
    });
  }

  function renderAchievementsModal() {
    const gridQuests = document.getElementById('gridQuests');
    const gridEaster = document.getElementById('gridEaster');
    const gridBehavior = document.getElementById('gridBehavior');
    const gridSpecial = document.getElementById('gridSpecial');

    if (!gridQuests || !gridEaster || !gridBehavior || !gridSpecial) return;

    gridQuests.innerHTML = '';
    gridEaster.innerHTML = '';
    gridBehavior.innerHTML = '';
    gridSpecial.innerHTML = '';

    for (const key in ACHIEVEMENTS_DATA) {
      const item = ACHIEVEMENTS_DATA[key];
      const isDone = unlockedAchievements.has(key);

      const card = document.createElement('div');
      card.className = `achieve-card ${isDone ? 'unlocked' : 'locked'}`;

      if (isDone) {
        card.innerHTML = `
          <div class="card-icon-box">${item.icon}</div>
          <div class="card-info">
            <div class="card-title-row">
              <h4 class="card-title">${item.title}</h4>
              <span class="card-check">✅</span>
            </div>
            <p class="card-desc">${item.desc}</p>
            <span class="card-tag">Отримано! ✨</span>
          </div>
        `;
      } else {
        card.innerHTML = `
          <div class="card-icon-box">🔒</div>
          <div class="card-info">
            <div class="card-title-row">
              <h4 class="card-title">${item.title}</h4>
              <span class="card-check">🔒</span>
            </div>
            <p class="card-desc">???</p>
            <div class="card-hint">
              <span class="hint-label">💡 Як отримати:</span>
              <span class="hint-text">${item.hint}</span>
            </div>
          </div>
        `;
      }

      if (item.category === 'quests') gridQuests.appendChild(card);
      else if (item.category === 'easter') gridEaster.appendChild(card);
      else if (item.category === 'behavior') gridBehavior.appendChild(card);
      else if (item.category === 'special' || item.category === 'wheel') gridSpecial.appendChild(card);
    }
  }

  // ========================================================
  // КОЛЕСО ФОРТУНИ (WHEEL OF FORTUNE)
  // ========================================================
  const wheelModal = document.getElementById('wheelModal');
  const openWheelBtn = document.getElementById('openWheelBtn');
  const closeWheelBtn = document.getElementById('closeWheelBtn');
  const wheelCanvas = document.getElementById('wheelCanvas');
  const spinWheelBtn = document.getElementById('spinWheelBtn');
  const spinAgainBtn = document.getElementById('spinAgainBtn');
  const wheelResultBox = document.getElementById('wheelResultBox');
  const prizeIconEl = document.getElementById('prizeIcon');
  const prizeTitleEl = document.getElementById('prizeTitle');
  const prizeDescEl = document.getElementById('prizeDesc');

  const WHEEL_SECTORS = [
    {
      id: 0,
      title: 'Головний Приз! 🎁',
      icon: '🎁',
      desc: 'НЕЙМОВІРНО! Ти зірвала Головний Новорічний Приз! Твоє найзаповітніше бажання обов\'язково здійсниться!',
      bg: '#f59e0b',
      text: '#1e0d05',
      chance: 4,
      isGrand: true
    },
    {
      id: 1,
      title: 'Теплі обійми 🤗',
      icon: '🤗',
      desc: 'Міцні, найтепліші та найзатишніші дружні обійми від Kir у новому році!',
      bg: '#991b1b',
      text: '#fffbeb',
      chance: 14
    },
    {
      id: 2,
      title: 'Мем від Kir 🎭',
      icon: '🎭',
      desc: 'Ексклюзивний новорічний мем ручної роботи, створений спеціально для тебе!',
      bg: '#065f46',
      text: '#f0fdf4',
      chance: 14
    },
    {
      id: 3,
      title: 'Тепле побажання 💌',
      icon: '💌',
      desc: 'Секретне побажання: нехай кожен день 2027 року приносить тобі посмішку і спокій!',
      bg: '#b45309',
      text: '#fffbeb',
      chance: 14
    },
    {
      id: 4,
      title: 'Гаряче какао ☕',
      icon: '☕',
      desc: 'Велике горнятко гарячого шоколаду з маршмелоу та корицею для затишного вечора!',
      bg: '#451a03',
      text: '#fed7aa',
      chance: 14
    },
    {
      id: 5,
      title: 'Купон на 1 бажання ✨',
      icon: '✨',
      desc: 'Дійсний безстроково купон: загадай будь-яке дружнє бажання для Kir!',
      bg: '#1e1b4b',
      text: '#e0e7ff',
      chance: 13
    },
    {
      id: 6,
      title: 'Святкова шоколадка 🍫',
      icon: '🍫',
      desc: 'Солодкий заряд новорічного серотоніну та гарного настрою на весь рік!',
      bg: '#831843',
      text: '#fce7f3',
      chance: 13
    },
    {
      id: 7,
      title: 'Персональний трек 🎶',
      icon: '🎶',
      desc: 'Особистий новорічний вайб та пісня, яка звучить тільки для тебе!',
      bg: '#4c1d95',
      text: '#f3e8ff',
      chance: 14
    }
  ];

  let wheelAngle = 0;
  let isWheelSpinning = false;
  let consecutiveWheelLosses = 0;

  function drawWheel(angle) {
    if (!wheelCanvas) return;
    const ctx = wheelCanvas.getContext('2d');
    const cx = wheelCanvas.width / 2;
    const cy = wheelCanvas.height / 2;
    const radius = cx - 14;

    ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);

    const numSectors = WHEEL_SECTORS.length;
    const arc = (Math.PI * 2) / numSectors;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    for (let i = 0; i < numSectors; i++) {
      const startAngle = i * arc;
      const endAngle = startAngle + arc;
      const sector = WHEEL_SECTORS[i];

      // Сегмент
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = sector.bg;
      ctx.fill();

      // Лінія межі
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.45)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Текст і емодзі
      ctx.save();
      const midAngle = startAngle + arc / 2;
      ctx.rotate(midAngle);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // Емодзі біля краю
      ctx.font = '20px sans-serif';
      ctx.fillText(sector.icon, radius - 16, 0);

      // Назва (суворо між r=54 і r=radius-42, щоб не заїжджала під ялинку)
      ctx.fillStyle = sector.text;
      ctx.font = 'bold 10.5px Montserrat, sans-serif';
      const shortTitle = sector.title.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
      const maxTextWidth = radius - 96; // від 54px до (radius-42)px
      if (ctx.measureText(shortTitle).width > maxTextWidth && shortTitle.includes(' ')) {
        const words = shortTitle.split(' ');
        const mid = Math.ceil(words.length / 2);
        const line1 = words.slice(0, mid).join(' ');
        const line2 = words.slice(mid).join(' ');
        ctx.fillText(line1, radius - 42, -7);
        ctx.fillText(line2, radius - 42, 7);
      } else {
        ctx.fillText(shortTitle, radius - 42, 0);
      }

      ctx.restore();
    }

    // Зовнішнє золоте кільце з пегами
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 8;
    ctx.stroke();

    for (let p = 0; p < 16; p++) {
      const pegAngle = (p * Math.PI * 2) / 16;
      const px = Math.cos(pegAngle) * (radius - 1);
      const py = Math.sin(pegAngle) * (radius - 1);
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#f59e0b';
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  function openWheelModal() {
    if (!wheelModal) return;
    playToneEffect('chime');
    wheelModal.classList.remove('hidden');
    drawWheel(wheelAngle);
  }

  function closeWheelModal() {
    if (!wheelModal) return;
    wheelModal.classList.add('hidden');
  }

  if (openWheelBtn) openWheelBtn.addEventListener('click', openWheelModal);
  if (closeWheelBtn) closeWheelBtn.addEventListener('click', closeWheelModal);
  if (wheelModal) {
    wheelModal.addEventListener('click', (e) => {
      if (e.target === wheelModal && !isWheelSpinning) closeWheelModal();
    });
  }

  function pickWeightedSector() {
    const rand = Math.random() * 100;
    if (rand < 4) return 0; // 4% шанс на Головний приз
    return Math.floor(Math.random() * 7) + 1; // 1..7 рівномірно
  }

  function spinWheel() {
    if (isWheelSpinning) return;
    isWheelSpinning = true;
    spinWheelBtn.disabled = true;
    if (wheelResultBox) wheelResultBox.classList.add('hidden');

    const winningIndex = pickWeightedSector();
    const winningSector = WHEEL_SECTORS[winningIndex];

    const numSectors = WHEEL_SECTORS.length;
    const arcDeg = 360 / numSectors; // 45 deg
    const sectorCenterDeg = winningIndex * arcDeg + arcDeg / 2;

    const targetOffset = (270 - sectorCenterDeg + 360) % 360;
    const jitter = (Math.random() - 0.5) * (arcDeg * 0.6);
    const extraRotations = 6 * 360;

    const currentNormalized = (wheelAngle * 180 / Math.PI) % 360;
    const additionalDeg = extraRotations + ((targetOffset - currentNormalized + 360) % 360) + jitter;
    const targetAngleRad = wheelAngle + (additionalDeg * Math.PI / 180);

    const startAngle = wheelAngle;
    const totalDelta = targetAngleRad - startAngle;
    const duration = 4800; // 4.8s
    const startTime = performance.now();
    let lastSectorTick = -1;

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);

      const ease = 1 - Math.pow(1 - progress, 3);
      wheelAngle = startAngle + totalDelta * ease;

      const currentDeg = (wheelAngle * 180 / Math.PI);
      const curSectorTick = Math.floor(currentDeg / arcDeg);
      if (curSectorTick !== lastSectorTick) {
        lastSectorTick = curSectorTick;
        playToneEffect('pop');
      }

      drawWheel(wheelAngle);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isWheelSpinning = false;
        spinWheelBtn.disabled = false;
        handleWheelResult(winningSector);
      }
    }

    requestAnimationFrame(animate);
  }

  function handleWheelResult(sector) {
    if (!wheelResultBox) return;
    prizeIconEl.textContent = sector.icon;
    prizeTitleEl.textContent = sector.title;
    prizeDescEl.textContent = sector.desc;
    wheelResultBox.classList.remove('hidden');

    if (sector.isGrand) {
      playToneEffect('fanfare');
      launchMegaConfetti();
      consecutiveWheelLosses = 0;
      unlockAchievement('lucky_one');
    } else {
      playToneEffect('chime');
      consecutiveWheelLosses++;
      if (consecutiveWheelLosses >= 5) {
        unlockAchievement('wheel_persistent');
      }
    }
  }

  if (spinWheelBtn) spinWheelBtn.addEventListener('click', spinWheel);
  if (spinAgainBtn) spinAgainBtn.addEventListener('click', spinWheel);

  // Відстеження помилок для ачівки "Хитрунка" (3 помилки поспіль)
  let consecutiveMistakesCount = 0;
  function recordMistake() {
    consecutiveMistakesCount++;
    if (consecutiveMistakesCount >= 3) {
      unlockAchievement('tricky_errors');
    }
  }
  function recordSuccess() {
    consecutiveMistakesCount = 0;
  }

  // Ініціалізація прогресу в HUD при завантаженні
  updateHUDProgress();

  // ----------------------------------------------------
  // ПАСХАЛКИ У ЗИМОВІЙ СЦЕНІ ТА ВІДЛІК
  // ----------------------------------------------------
  const moonHotspot = document.getElementById('moonHotspot');
  const chaletWindowsHotspot = document.getElementById('chaletWindowsHotspot');

  function syncEasterHotspotsToBackdrop() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const imgW = 1376;
    const imgH = 768;
    const scale = Math.max(vw / imgW, vh / imgH);
    const sw = imgW * scale;
    const sh = imgH * scale;
    const ox = (vw - sw) / 2;
    const oy = vh - sh;

    if (moonHotspot) {
      const mx = ox + (1118 / imgW) * sw;
      const my = oy + (139 / imgH) * sh;
      const moonSize = Math.round(Math.max(120, Math.min(200, 138 * scale)));
      if (mx >= 60 && mx <= vw - 35 && my >= 68 && my <= vh - 60) {
        moonHotspot.style.left = `${mx}px`;
        moonHotspot.style.top = `${my}px`;
        moonHotspot.style.width = `${moonSize}px`;
        moonHotspot.style.height = `${moonSize}px`;
      } else {
        moonHotspot.style.left = '';
        moonHotspot.style.top = '';
        moonHotspot.style.width = '';
        moonHotspot.style.height = '';
      }
    }

    if (chaletWindowsHotspot) {
      const cx = ox + (278 / imgW) * sw;
      const cy = oy + (402 / imgH) * sh;
      if (cx >= 35 && cx <= vw - 35 && cy >= 80 && cy <= vh - 60) {
        chaletWindowsHotspot.style.left = `${cx}px`;
        chaletWindowsHotspot.style.top = `${cy}px`;
      } else {
        chaletWindowsHotspot.style.left = '';
        chaletWindowsHotspot.style.top = '';
      }
    }
  }
  syncEasterHotspotsToBackdrop();
  window.addEventListener('resize', syncEasterHotspotsToBackdrop);

  function showEasterFloatText(x, y, text) {
    const floatEl = document.createElement('div');
    floatEl.className = 'snow-float-text easter-float-text';
    floatEl.textContent = text;
    floatEl.style.left = `${x}px`;
    floatEl.style.top = `${y}px`;
    floatEl.style.color = '#fde047';
    floatEl.style.fontSize = '1.15rem';
    floatEl.style.fontWeight = '800';
    floatEl.style.textShadow = '0 0 16px rgba(245, 158, 11, 0.95)';
    document.body.appendChild(floatEl);
    setTimeout(() => {
      if (floatEl.parentElement) floatEl.parentElement.removeChild(floatEl);
    }, 1200);
  }

  let lastMoonEggAt = 0;
  let lastChaletEggAt = 0;

  function triggerMoonEasterEgg() {
    const now = performance.now();
    if (now - lastMoonEggAt < 400) return;
    lastMoonEggAt = now;

    playToneEffect('chime');
    unlockAchievement('moon_girl');
    if (moonHotspot) {
      moonHotspot.classList.remove('clicked-burst');
      void moonHotspot.offsetWidth;
      moonHotspot.classList.add('clicked-burst');
      setTimeout(() => moonHotspot.classList.remove('clicked-burst'), 650);
      const rect = moonHotspot.getBoundingClientRect();
      showEasterFloatText(rect.left + rect.width / 2, rect.top + rect.height / 2, '🌙 Місячна дівчинка! ✨');
    }
  }

  function triggerChaletEasterEgg() {
    const now = performance.now();
    if (now - lastChaletEggAt < 400) return;
    lastChaletEggAt = now;

    playToneEffect('chime');
    unlockAchievement('chalet_warmth');
    emitSmoke();
    if (chaletWindowsHotspot) {
      chaletWindowsHotspot.classList.remove('clicked-burst');
      void chaletWindowsHotspot.offsetWidth;
      chaletWindowsHotspot.classList.add('clicked-burst');
      setTimeout(() => chaletWindowsHotspot.classList.remove('clicked-burst'), 650);
      const rect = chaletWindowsHotspot.getBoundingClientRect();
      showEasterFloatText(rect.left + rect.width / 2, rect.top + rect.height / 2, '🏡 Тепло шале! ✨');
    }
  }

  if (moonHotspot) {
    moonHotspot.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
    });
    moonHotspot.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerMoonEasterEgg();
    });
  }

  if (chaletWindowsHotspot) {
    chaletWindowsHotspot.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
    });
    chaletWindowsHotspot.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerChaletEasterEgg();
    });
  }

  const rebusClock = document.getElementById('rebusClock');
  if (rebusClock) {
    rebusClock.addEventListener('click', (e) => {
      e.stopPropagation();
      playToneEffect('chime');
      unlockAchievement('night_owl');
    });
  }

  // Перевірка часу доби (Нічна пташка)
  const entryHour = new Date().getHours();
  if (entryHour >= 0 && entryHour < 6) {
    unlockAchievement('night_owl');
  }

  // Ловець сніжинок (Снігова королева)
  let caughtSnowflakesCount = parseInt(localStorage.getItem('viktoria_caught_snowflakes') || '0', 10);
  if (caughtSnowflakesCount > 50) caughtSnowflakesCount = 50;

  const snowCatchBadge = document.getElementById('snowCatchBadge');
  const snowCatchCount = document.getElementById('snowCatchCount');
  const mouseCatchRadius = document.getElementById('mouseCatchRadius');
  let isMouseRadiusVisible = false;

  window.addEventListener('pointermove', (e) => {
    if (!mouseCatchRadius) return;
    if (!isMouseRadiusVisible) {
      isMouseRadiusVisible = true;
      mouseCatchRadius.classList.add('active');
    }
    mouseCatchRadius.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
  });

  window.addEventListener('mouseleave', () => {
    if (mouseCatchRadius) {
      isMouseRadiusVisible = false;
      mouseCatchRadius.classList.remove('active');
    }
  });

  function showSnowCatchFloatText(x, y) {
    const floatEl = document.createElement('div');
    floatEl.className = 'snow-float-text';
    floatEl.textContent = '+1 ❄️';
    floatEl.style.left = `${x}px`;
    floatEl.style.top = `${y}px`;
    document.body.appendChild(floatEl);
    setTimeout(() => {
      if (floatEl.parentElement) floatEl.parentElement.removeChild(floatEl);
    }, 800);
  }

  if (caughtSnowflakesCount > 0 && snowCatchBadge && snowCatchCount) {
    snowCatchBadge.classList.add('show');
    snowCatchCount.textContent = `${caughtSnowflakesCount} / 50`;
  }

  function catchSnowflakeAt(cx, cy) {
    let nearestFlake = null;
    let minDist = 55; // зручний помітний радіус кліку (55px)

    for (const f of snowflakes) {
      if (!f || typeof f.reset !== 'function') continue;
      const dx = f.x - cx;
      const dy = f.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        nearestFlake = f;
      }
    }

    if (nearestFlake) {
      nearestFlake.reset();
      spawnSnowCatchSparkles(nearestFlake.x, nearestFlake.y);
      showSnowCatchFloatText(nearestFlake.x, nearestFlake.y);

      if (mouseCatchRadius) {
        mouseCatchRadius.classList.add('catching');
        setTimeout(() => mouseCatchRadius.classList.remove('catching'), 280);
      }

      if (caughtSnowflakesCount < 50) {
        caughtSnowflakesCount++;
        localStorage.setItem('viktoria_caught_snowflakes', caughtSnowflakesCount.toString());
      }

      if (snowCatchBadge) {
        snowCatchBadge.classList.add('show');
        if (snowCatchCount) snowCatchCount.textContent = `${caughtSnowflakesCount} / 50`;
      }
      playToneEffect('pop');
      if (caughtSnowflakesCount >= 50) {
        unlockAchievement('snow_queen');
      }
    }
  }

  // Обробка кліку: ловля сніжинок або клік по льодяниках
  let candyClicksCount = 0;
  window.addEventListener('pointerdown', (e) => {
    // Не перехоплюємо кліки по кнопках, полях вводу, картках, пасхалках, машинці та модалках
    if (e.target.closest('button, input, select, textarea, a, label, .hud-pill-btn, .modal-close-cross, .pizza-hotspot, .photo-magic-spot, .achieve-card, .wheel-canvas, .puzzle-tile, .clickable-easter-egg, .road-car-container')) {
      return;
    }

    // Безвідмовна перевірка попадання курсора у зону Місяця або Вікон хатинки (лише коли відкрита сцена не перекрита модалками)
    const isMusicPopoverOpen = musicPopover && !musicPopover.classList.contains('hidden');
    const isBlockingOverlayOpen =
      (rewardsModal && !rewardsModal.classList.contains('hidden')) ||
      (wheelModal && !wheelModal.classList.contains('hidden')) ||
      (finalModal && !finalModal.classList.contains('hidden'));

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (!isMusicPopoverOpen && !isBlockingOverlayOpen && !e.target.closest('.riddle-panel-container, .modal-card, .wheel-modal-card, .rewards-modal-card, .top-holiday-hud, .music-popover-panel, .wooden-sign-wrapper, .modal-dialog-box')) {
      if (moonHotspot) {
        const rect = moonHotspot.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
          triggerMoonEasterEgg();
          return;
        }
      }

      if (chaletWindowsHotspot) {
        const rect = chaletWindowsHotspot.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
          triggerChaletEasterEgg();
          return;
        }
      }

      // Зона Місяця (справа вгорі, нижче HUD)
      if (e.clientX > vw * 0.68 && e.clientY < vh * 0.38 && e.clientY > 70) {
        triggerMoonEasterEgg();
        return;
      }
      // Зона вікон хатинки (зліва посередині)
      if (e.clientX < vw * 0.38 && e.clientY > vh * 0.36 && e.clientY < vh * 0.72) {
        triggerChaletEasterEgg();
        return;
      }
    }

    // 1. Кліки по морозних льодяниках (Солодкоїжка)
    if (isQuestionsActive && floatingQuestions.length > 0) {
      const cx = e.clientX;
      const cy = e.clientY;
      let hitCandy = false;
      for (const q of floatingQuestions) {
        const dx = q.x - cx;
        const dy = q.y - cy;
        if (Math.sqrt(dx * dx + dy * dy) < 65) {
          hitCandy = true;
          q.pulseOffset += 1.2;
          break;
        }
      }
      if (hitCandy) {
        candyClicksCount++;
        playToneEffect('pop');
        if (candyClicksCount >= 10) {
          unlockAchievement('sweet_tooth');
        }
        return;
      }
    }

    // 2. Ловля сніжинки під кліком
    catchSnowflakeAt(e.clientX, e.clientY);
  });

  // ----------------------------------------------------
  // 2. РІДКІСНА МАШИНКА НА ЗАСНІЖЕНІЙ 3D ДОРОЗІ (З ТРЮКАМИ 360)
  // ----------------------------------------------------
  const winterCar = document.getElementById('winterCar');
  let isCarDriving = false;
  let driveCounter = 0;

  function driveCar(forceStunt = null) {
    if (!winterCar || isCarDriving) return;
    isCarDriving = true;
    driveCounter++;

    let stuntMode = 'stunt-360';
    if (forceStunt) {
      stuntMode = forceStunt;
    } else {
      if (driveCounter === 1) {
        stuntMode = 'stunt-360';
      } else {
        const rand = Math.random();
        if (rand < 0.5) {
          stuntMode = 'stunt-360';
        } else if (rand < 0.8) {
          stuntMode = 'stunt-barrel';
        } else {
          stuntMode = 'normal-drive';
        }
      }
    }

    winterCar.classList.remove('driving', 'normal-drive', 'stunt-360', 'stunt-barrel');
    void winterCar.offsetWidth;
    winterCar.classList.add('driving', stuntMode);

    setTimeout(() => {
      winterCar.classList.remove('driving', 'normal-drive', 'stunt-360', 'stunt-barrel');
      isCarDriving = false;
    }, 14500);
  }

  setTimeout(() => {
    driveCar('stunt-360');
  }, 1500);

  setInterval(() => {
    if (!isCarDriving) {
      driveCar();
    }
  }, 25000);

  let lastCarClickAt = 0;

  if (winterCar) {
    winterCar.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
    });
    winterCar.addEventListener('click', (e) => {
      e.stopPropagation();
      const now = performance.now();
      if (now - lastCarClickAt < 400) return;
      lastCarClickAt = now;

      playToneEffect('chime');
      unlockAchievement('winter_car');
      const rect = winterCar.getBoundingClientRect();
      const fx = e.clientX || (rect.left + rect.width / 2);
      const fy = e.clientY || (rect.top + rect.height / 2);
      showEasterFloatText(fx, fy, '🚗💨 Новорічний драйв! ✨');

      if (!isCarDriving) {
        driveCar('stunt-360');
      }
    });
  }

  // ----------------------------------------------------
  // 3. ВОГНИКИ НА ЯЛИНЦІ ТА ДИМ
  // ----------------------------------------------------
  const treeLights = document.getElementById('treeLights');
  if (treeLights) {
    const bulbColors = ['#fde047', '#ef4444', '#38bdf8', '#4ade80', '#fb923c'];
    for (let i = 0; i < 35; i++) {
      const spark = document.createElement('div');
      spark.className = 'fairy-spark';
      const size = Math.random() * 4 + 3;
      spark.style.width = `${size}px`;
      spark.style.height = `${size}px`;
      spark.style.left = `${Math.random() * 85 + 5}%`;
      spark.style.top = `${Math.random() * 85 + 5}%`;
      const color = bulbColors[Math.floor(Math.random() * bulbColors.length)];
      spark.style.backgroundColor = color;
      spark.style.color = color;
      spark.style.animationDelay = `${Math.random() * 3}s`;
      spark.style.animationDuration = `${Math.random() * 1.5 + 1}s`;
      treeLights.appendChild(spark);
    }
  }

  const chimneySmoke = document.getElementById('chimneySmoke');
  function emitSmoke() {
    if (!chimneySmoke) return;
    const p = document.createElement('div');
    p.className = 'smoke-puff-realistic';
    const s = Math.random() * 14 + 10;
    p.style.width = `${s}px`;
    p.style.height = `${s}px`;
    p.style.left = `${Math.random() * 6 - 3}px`;
    p.style.top = `${Math.random() * 6 - 3}px`;
    chimneySmoke.appendChild(p);

    setTimeout(() => {
      p.remove();
    }, 5000);
  }
  setInterval(emitSmoke, 750);

  // ----------------------------------------------------
  // 6. ВАЛІДАЦІЯ ЛОГІНА ТА ПАРОЛЯ (ЕКРАН 1)
  // ----------------------------------------------------
  const loginForm = document.getElementById('loginForm');
  const userNameInput = document.getElementById('userName');
  const userPasswordInput = document.getElementById('userPassword');
  const togglePassBtn = document.getElementById('togglePasswordBtn');
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  const woodenBoard = document.getElementById('woodenBoard');
  const loginStage = document.getElementById('loginStage');
  const riddleStage = document.getElementById('riddleStage');
  const holidayQuestStage = document.getElementById('holidayQuestStage');
  const finalModal = document.getElementById('finalModal');

  // Елементи навігації та скидання
  const riddleToHomeBtn = document.getElementById('riddleToHomeBtn');
  const riddleToNextBtn = document.getElementById('riddleToNextBtn');
  const questToRiddleBtn = document.getElementById('questToRiddleBtn');
  const questToHomeBtn = document.getElementById('questToHomeBtn');
  const quickResumeBtn = document.getElementById('quickResumeBtn');
  const resumeQuestBtn = document.getElementById('resumeQuestBtn');
  const resumeQuestBox = document.getElementById('resumeQuestBox');
  const resumeStageDesc = document.getElementById('resumeStageDesc');
  const emojiToKeychainBtn = document.getElementById('emojiToKeychainBtn');
  const keychainBackToEmojiBtn = document.getElementById('keychainBackToEmojiBtn');
  const keychainToMemoryDirectBtn = document.getElementById('keychainToMemoryDirectBtn');
  const memoryBackToKeychainBtn = document.getElementById('memoryBackToKeychainBtn');
  const finalToQuestBtn = document.getElementById('finalToQuestBtn');
  const finalToHomeBtn = document.getElementById('finalToHomeBtn');
  const closeFinalBtn = document.getElementById('closeFinalBtn');
  const rewardsResetBtn = document.getElementById('rewardsResetBtn');

  // Збереження стану квесту (localStorage)
  const QUEST_STORAGE_KEY = 'viktoria_quest_state_v2';

  let questProgress = {
    isLoggedIn: false,
    enteredName: '',
    isFriendDone: false,
    friendName: '',
    isPizzaDone: false,
    isEmojiDone: false,
    isKeychainDone: false,
    isMemoryDone: false,
    isPuzzleDone: false,
    isGiftOpened: false,
    puzzleSlots: [2, 0, 1, 4, 3, 5, 8, 6, 7],
    activeStage: 'loginStage',
    activeStep: 'emoji'
  };

  function saveQuestProgress() {
    try {
      localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify(questProgress));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }

  function loadQuestProgress() {
    try {
      const raw = localStorage.getItem(QUEST_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Storage load error', e);
      return null;
    }
  }

  function showStage(stageId) {
    questProgress.activeStage = stageId;
    if (stageId !== 'loginStage') {
      questProgress.isLoggedIn = true;
    }
    saveQuestProgress();

    if (loginStage) {
      if (stageId === 'loginStage') {
        loginStage.classList.remove('hidden', 'exit-stage');
      } else {
        loginStage.classList.add('hidden');
      }
    }

    if (riddleStage) {
      if (stageId === 'riddleStage') {
        riddleStage.classList.remove('hidden', 'exit-stage');
        riddleStage.scrollTop = 0;
        if (!isQuestionsActive) startQuestionsEffect();
      } else {
        riddleStage.classList.add('hidden');
      }
    }

    if (holidayQuestStage) {
      if (stageId === 'holidayQuestStage') {
        holidayQuestStage.classList.remove('hidden', 'exit-stage');
        holidayQuestStage.scrollTop = 0;
        if (!isQuestionsActive) startQuestionsEffect();
      } else {
        holidayQuestStage.classList.add('hidden');
      }
    }

    if (finalModal) {
      if (stageId === 'finalModal') {
        finalModal.classList.remove('hidden');
        const fScroll = document.getElementById('finalScrollContainer');
        if (fScroll) fScroll.scrollTop = 0;
        if (!isQuestionsActive) startQuestionsEffect();
        startCountdown();
      } else {
        finalModal.classList.add('hidden');
      }
    }

    updateResumeHudButton();
  }

  function showQuestStep(stepName) {
    questProgress.activeStep = stepName;
    saveQuestProgress();

    const eStep = document.getElementById('emojiStep');
    const kStep = document.getElementById('keychainStep');
    const mStep = document.getElementById('memoryStep');

    if (eStep) {
      if (stepName === 'emoji') {
        eStep.classList.remove('hidden');
        eStep.classList.add('active');
      } else {
        eStep.classList.add('hidden');
        eStep.classList.remove('active');
      }
    }

    if (kStep) {
      if (stepName === 'keychain') {
        kStep.classList.remove('hidden');
        kStep.classList.add('active');
      } else {
        kStep.classList.add('hidden');
        kStep.classList.remove('active');
      }
    }

    if (mStep) {
      if (stepName === 'memory') {
        mStep.classList.remove('hidden');
        mStep.classList.add('active');
      } else {
        mStep.classList.add('hidden');
        mStep.classList.remove('active');
      }
    }
  }

  function updateResumeHudButton() {
    if (!quickResumeBtn) return;
    if (questProgress.isLoggedIn && questProgress.activeStage === 'loginStage') {
      quickResumeBtn.classList.remove('hidden');
    } else {
      quickResumeBtn.classList.add('hidden');
    }
  }

  function getFurthestStageTarget() {
    if (questProgress.isGiftOpened || questProgress.isPuzzleDone) {
      return { stage: 'finalModal', step: 'memory' };
    }
    if (questProgress.isMemoryDone) {
      return { stage: 'holidayQuestStage', step: 'memory' };
    }
    if (questProgress.isKeychainDone) {
      return { stage: 'holidayQuestStage', step: 'memory' };
    }
    if (questProgress.isEmojiDone) {
      return { stage: 'holidayQuestStage', step: 'keychain' };
    }
    if (questProgress.isPizzaDone) {
      return { stage: 'holidayQuestStage', step: 'emoji' };
    }
    if (questProgress.isFriendDone || questProgress.isLoggedIn) {
      return { stage: 'riddleStage', step: 'emoji' };
    }
    return { stage: 'loginStage', step: 'emoji' };
  }

  function resumeToFurthestQuest() {
    playToneEffect('chime');
    const target = getFurthestStageTarget();
    showStage(target.stage);
    if (target.stage === 'holidayQuestStage') {
      showQuestStep(target.step);
    }
  }

  function resetAllProgress() {
    const ok = confirm("Ти дійсно хочеш очистити весь збережений прогрес та досягнення і почати спочатку? ❄️");
    if (!ok) return;

    try {
      // Зберігаємо персональні налаштування звуку користувача
      const musicVol = localStorage.getItem('viktoria_music_vol');
      const musicMuted = localStorage.getItem('viktoria_music_muted');

      // Повне очищення сховища від усіх досягнень, сніжинок та прогресу
      localStorage.clear();

      // Відновлюємо рівень звуку
      if (musicVol !== null) localStorage.setItem('viktoria_music_vol', musicVol);
      if (musicMuted !== null) localStorage.setItem('viktoria_music_muted', musicMuted);
    } catch (e) {
      console.warn('Reset storage error', e);
    }

    // Миттєве скидання змінних у пам'яті
    unlockedAchievements.clear();
    caughtSnowflakesCount = 0;

    window.location.reload();
  }

  // Експортуємо у глобальний контекст для зручності
  window.resetAllProgress = resetAllProgress;

  // Обробники кнопок навігації
  if (riddleToHomeBtn) {
    riddleToHomeBtn.addEventListener('click', () => {
      playToneEffect('pop');
      showStage('loginStage');
    });
  }

  if (riddleToNextBtn) {
    riddleToNextBtn.addEventListener('click', () => {
      playToneEffect('chime');
      showStage('holidayQuestStage');
      showQuestStep(questProgress.isEmojiDone ? (questProgress.isKeychainDone ? 'memory' : 'keychain') : 'emoji');
    });
  }

  if (questToRiddleBtn) {
    questToRiddleBtn.addEventListener('click', () => {
      playToneEffect('pop');
      showStage('riddleStage');
    });
  }

  if (questToHomeBtn) {
    questToHomeBtn.addEventListener('click', () => {
      playToneEffect('pop');
      showStage('loginStage');
    });
  }

  if (quickResumeBtn) {
    quickResumeBtn.addEventListener('click', resumeToFurthestQuest);
  }

  if (resumeQuestBtn) {
    resumeQuestBtn.addEventListener('click', resumeToFurthestQuest);
  }

  if (emojiToKeychainBtn) {
    emojiToKeychainBtn.addEventListener('click', () => {
      playToneEffect('chime');
      showQuestStep('keychain');
    });
  }

  if (keychainBackToEmojiBtn) {
    keychainBackToEmojiBtn.addEventListener('click', () => {
      playToneEffect('pop');
      showQuestStep('emoji');
    });
  }

  if (keychainToMemoryDirectBtn) {
    keychainToMemoryDirectBtn.addEventListener('click', () => {
      playToneEffect('chime');
      showQuestStep('memory');
    });
  }

  if (memoryBackToKeychainBtn) {
    memoryBackToKeychainBtn.addEventListener('click', () => {
      playToneEffect('pop');
      showQuestStep('keychain');
    });
  }

  if (finalToQuestBtn) {
    finalToQuestBtn.addEventListener('click', () => {
      playToneEffect('pop');
      showStage('holidayQuestStage');
      showQuestStep('memory');
    });
  }

  if (finalToHomeBtn) {
    finalToHomeBtn.addEventListener('click', () => {
      playToneEffect('pop');
      showStage('loginStage');
    });
  }

  if (closeFinalBtn) {
    closeFinalBtn.addEventListener('click', () => {
      playToneEffect('pop');
      showStage('holidayQuestStage');
      showQuestStep('memory');
    });
  }

  if (rewardsResetBtn) {
    rewardsResetBtn.addEventListener('click', resetAllProgress);
  }

  if (togglePassBtn) {
    togglePassBtn.addEventListener('click', () => {
      const isPass = userPasswordInput.type === 'password';
      userPasswordInput.type = isPass ? 'text' : 'password';
      togglePassBtn.textContent = isPass ? '🙈' : '👁️';
    });
  }

  const allowedNames = [
    'виктория', 'вікторія', 'вика', 'віка', 'викуся', 'вікуся', 'викуля', 'вікуля',
    'викусик', 'вікусик', 'викочка', 'вікочка', 'викторийка', 'вікторійка',
    'viktoria', 'victoria', 'viktoriia', 'viktoriya', 'vika', 'vikusya', 'vic'
  ];

  const targetPassword = '0912';

  function levenshtein(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  function isNameValid(inputName) {
    const clean = inputName.trim().toLowerCase().replace(/[^a-zа-яіїєґ]/gi, '');
    if (!clean) return false;
    if (allowedNames.includes(clean)) return true;

    for (const valid of allowedNames) {
      if (clean.includes(valid) || valid.includes(clean)) {
        if (clean.length >= 3) return true;
      }
    }

    if (clean.length >= 4) {
      for (const valid of allowedNames) {
        if (Math.abs(clean.length - valid.length) <= 2) {
          if (levenshtein(clean, valid) <= 2) return true;
        }
      }
    }
    return false;
  }

  // ----------------------------------------------------
  // НОВОРІЧНА СВЯТКОВА БУЛЬБАШКА ВАЛІДАЦІЇ (ЗАМІСТЬ СИСТЕМНОГО БІЛОГО ПОЛЯ БРАУЗЕРА)
  // ----------------------------------------------------
  let activeTooltip = null;

  function showFestiveTooltip(inputEl, message = 'Будь ласка, заповни це поле! ❄️✨') {
    removeFestiveTooltip();
    if (!inputEl) return;

    playToneEffect('buzz');
    const bubble = document.createElement('div');
    bubble.className = 'festive-validation-bubble';
    bubble.innerHTML = `
      <span class="bubble-tail"></span>
      <span class="bubble-icon">❄️</span>
      <span class="bubble-text">${message}</span>
    `;

    const wrapper = inputEl.closest('.friend-input-wrapper') || inputEl.closest('.field-control') || inputEl.parentElement;
    wrapper.style.position = 'relative';
    wrapper.appendChild(bubble);
    activeTooltip = bubble;

    shakeElement(inputEl);
    inputEl.classList.add('input-holiday-alert');

    const clearTooltip = () => {
      removeFestiveTooltip();
      inputEl.classList.remove('input-holiday-alert');
      inputEl.removeEventListener('input', clearTooltip);
    };
    inputEl.addEventListener('input', clearTooltip);
    inputEl.focus();

    setTimeout(() => {
      if (activeTooltip === bubble) {
        removeFestiveTooltip();
        inputEl.classList.remove('input-holiday-alert');
      }
    }, 4500);
  }

  function removeFestiveTooltip() {
    if (activeTooltip && activeTooltip.parentElement) {
      activeTooltip.parentElement.removeChild(activeTooltip);
    }
    activeTooltip = null;
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredName = userNameInput.value.trim();
      const enteredPass = userPasswordInput.value.trim();

      errorMessage.classList.remove('show');
      removeFestiveTooltip();

      if (!enteredName) {
        showFestiveTooltip(userNameInput, "Введи своє чарівне ім'я! ❄️✨");
        return;
      }

      if (!enteredPass) {
        showFestiveTooltip(userPasswordInput, "Введи секретний пароль! 🗝️✨");
        return;
      }

      const nameOk = isNameValid(enteredName);
      const passOk = (enteredPass === targetPassword || enteredPass === '912');

      if (!nameOk) {
        recordMistake();
        showError("Сніговичок не впізнав ім'я ❄️ Напиши «Вікторія» або «Віка»!");
        shakeElement(woodenBoard);
        userNameInput.focus();
        return;
      }

      if (!passOk) {
        recordMistake();
        showError("Парольчик не підійшов 🗝️ Спробуй ще або спитай у Святого Миколая!");
        shakeElement(woodenBoard);
        userPasswordInput.focus();
        return;
      }

      // УСПІШНИЙ ПЕРЕХІД ДО ЗАГАДКИ
      recordSuccess();
      handleUnlockRiddle();
    });
  }

  function showError(msg) {
    errorText.textContent = msg;
    errorMessage.classList.add('show');
  }

  function shakeElement(el) {
    if (!el) return;
    el.classList.remove('shake-anim');
    void el.offsetWidth;
    el.classList.add('shake-anim');
  }

  function handleUnlockRiddle() {
    startAudio();
    questProgress.isLoggedIn = true;
    questProgress.enteredName = userNameInput.value.trim();
    saveQuestProgress();

    // Плавно ховаємо першу вивіску
    loginStage.classList.add('exit-stage');

    // Запускаємо морозно-льодяникові знаки питання на фоні
    startQuestionsEffect();

    setTimeout(() => {
      showStage('riddleStage');

      const friendInput = document.getElementById('friendNameInput');
      if (friendInput && !friendInput.disabled) friendInput.focus();
    }, 600);
  }

  // ----------------------------------------------------
  // 7. ЗАГАДКА: «ХТО ТВОЯ НАЙКРАЩА ЛПШКА?» (ВІДПОВІДЬ: НАСТЯ)
  // ----------------------------------------------------
  const friendForm = document.getElementById('friendForm');
  const friendNameInput = document.getElementById('friendNameInput');
  const friendErrorMsg = document.getElementById('friendErrorMsg');
  const pizzaQuestSection = document.getElementById('pizzaQuestSection');
  const clueHintText = document.getElementById('clueHintText');

  const allowedFriendNames = [
    'настя', 'настяя', 'настюша', 'настенька', 'настуся', 'настуня',
    'настасья', 'настася', 'anastasia', 'anastasiia', 'nastya', 'nastia', 'nastyusha'
  ];

  function isFriendValid(input) {
    const clean = input.trim().toLowerCase().replace(/[^a-zа-яіїєґ]/gi, '');
    if (!clean) return false;
    if (allowedFriendNames.includes(clean)) return true;

    for (const valid of allowedFriendNames) {
      if (clean.includes(valid) || valid.includes(clean)) {
        if (clean.length >= 3) return true;
      }
    }

    if (clean.length >= 4) {
      for (const valid of allowedFriendNames) {
        if (Math.abs(clean.length - valid.length) <= 2) {
          if (levenshtein(clean, valid) <= 2) return true;
        }
      }
    }
    return false;
  }

  let friendSubmitAttempts = 0;
  if (friendForm) {
    friendForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const answer = friendNameInput.value.trim();
      friendErrorMsg.classList.add('hidden');
      removeFestiveTooltip();
      friendSubmitAttempts++;

      if (!answer) {
        recordMistake();
        showFestiveTooltip(friendNameInput, "Напиши ім'я своєї найкращої подруги! 💖❄️");
        return;
      }

      if (!isFriendValid(answer)) {
        recordMistake();
        friendErrorMsg.classList.remove('hidden');
        shakeElement(friendNameInput);
        playToneEffect('buzz');
        return;
      }

      // ПРАВИЛЬНА ВІДПОВІДЬ — НАСТЯ!
      recordSuccess();
      if (friendSubmitAttempts === 1) {
        unlockAchievement('lp_first_try');
      }
      questProgress.isFriendDone = true;
      questProgress.friendName = friendNameInput.value.trim();
      saveQuestProgress();
      handleFriendSuccess();
    });
  }

  // Безпечна автопрокрутка: підкручує лише якщо низ елемента справді не вміщається на екрані, не ховаючи шапку
  function scrollOverlayIfNeeded(el) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.bottom > window.innerHeight - 12) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function handleFriendSuccess() {
    friendNameInput.disabled = true;
    const btn = document.getElementById('friendSubmitBtn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>Вірно! 💖</span>';
      btn.style.background = '#22c55e';
    }

    // Розблоковуємо секцію піци
    pizzaQuestSection.classList.remove('locked');

    setTimeout(() => {
      scrollOverlayIfNeeded(pizzaQuestSection);
    }, 350);
  }

  // ----------------------------------------------------
  // 8. ІНТЕРАКТИВНА ПІЦА (ПЕПЕРОНІ-ШИФР ТА ПУСТИШКИ)
  // ----------------------------------------------------
  const pepHotspots = document.querySelectorAll('.pep-spot');
  const dummyHotspots = document.querySelectorAll('.dummy-spot');
  const toppingFeedback = document.getElementById('toppingFeedback');
  const feedbackIcon = document.getElementById('feedbackIcon');
  const feedbackMessage = document.getElementById('feedbackMessage');

  const dot1 = document.getElementById('dot1');
  const dot2 = document.getElementById('dot2');
  const dot3 = document.getElementById('dot3');

  // Правильний шифр: спочатку 1, потім 4, потім 2
  const correctSequence = ['1', '4', '2'];
  const currentClicks = [];

  function showFeedback(icon, msg, isError = false) {
    if (!toppingFeedback) return;
    feedbackIcon.textContent = icon;
    feedbackMessage.textContent = msg;
    toppingFeedback.classList.remove('hidden');
    toppingFeedback.style.borderColor = isError ? '#ef4444' : '#22c55e';

    toppingFeedback.classList.remove('shakeAlert');
    void toppingFeedback.offsetWidth;
    toppingFeedback.classList.add('shakeAlert');
  }

  const tastedPizzas = new Set();
  function checkGourmetTasted(flavor) {
    tastedPizzas.add(flavor);
    questProgress.tastedPizzas = Array.from(tastedPizzas);
    saveQuestProgress();
    if (tastedPizzas.size >= 4) {
      unlockAchievement('gourmet');
    }
  }

  // Обробка натискання на пепероні
  pepHotspots.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      checkGourmetTasted('pep');
      const id = btn.getAttribute('data-id');

      // Перевіряємо, чи цей крок правильний за чергою
      const expectedStep = correctSequence[currentClicks.length];

      if (id === expectedStep) {
        // Правильний клік!
        currentClicks.push(id);
        btn.classList.add('clicked-correct');

        // Оновлюємо індикатори прогресу
        if (currentClicks.length === 1) {
          dot1.textContent = '🟢';
          showFeedback('🌶️', 'Є перший шматочок шифру! Шукай далі!');
        } else if (currentClicks.length === 2) {
          dot2.textContent = '🟢';
          showFeedback('🔥', 'Чудово! Залишився останній шматочок!');
        } else if (currentClicks.length === 3) {
          dot3.textContent = '🟢';
          showFeedback('🎉', 'БІНГО! Секретний шифр дружби розгадано!');
          playToneEffect('fanfare');
          recordSuccess();
          unlockAchievement('pizzaiolo');

          questProgress.isPizzaDone = true;
          saveQuestProgress();

          const rToNext = document.getElementById('riddleToNextBtn');
          if (rToNext) rToNext.classList.remove('hidden');

          // Розблоковуємо перехід до наступного блоку загадок
          if (pizzaSuccessBox) {
            pizzaSuccessBox.classList.remove('hidden');
            setTimeout(() => {
              scrollOverlayIfNeeded(pizzaSuccessBox);
            }, 300);
          }
        }
      } else {
        // Помилка в послідовності — скидання
        currentClicks.length = 0;
        dot1.textContent = '⚪';
        dot2.textContent = '⚪';
        dot3.textContent = '⚪';

        pepHotspots.forEach(b => b.classList.remove('clicked-correct'));
        showFeedback('❄️', 'Холодно! Спробуй інший порядок пепероні!', true);
        playToneEffect('buzz');
        shakeElement(btn);
        recordMistake();
      }
    });
  });

  // Пустишки (Сир, Морепродукти, Овочева)
  dummyHotspots.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const msg = btn.getAttribute('data-msg');
      const role = btn.getAttribute('data-role');
      checkGourmetTasted(role);
      let icon = '🧀';
      if (role === 'seafood') icon = '🦐';
      if (role === 'veggie') icon = '🫒';

      showFeedback(icon, msg, true);
      playToneEffect('buzz');
      shakeElement(btn);
      recordMistake();
    });
  });

  // ----------------------------------------------------
  // 10. ПЕРЕХІД ДО НОВОГО БЛОКУ ЗАГАДОК
  // ----------------------------------------------------
  const pizzaSuccessBox = document.getElementById('pizzaSuccessBox');
  const toHolidayQuestBtn = document.getElementById('toHolidayQuestBtn');

  if (toHolidayQuestBtn) {
    toHolidayQuestBtn.addEventListener('click', () => {
      playToneEffect('chime');
      riddleStage.classList.add('exit-stage');

      setTimeout(() => {
        showStage('holidayQuestStage');
        showQuestStep(questProgress.isEmojiDone ? (questProgress.isKeychainDone ? 'memory' : 'keychain') : 'emoji');

        const emojiInput = document.getElementById('emojiInput');
        if (emojiInput && !emojiInput.disabled) emojiInput.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 500);
    });
  }

  // ----------------------------------------------------
  // 11. КРОК 1: ЕМОДЗІ-РЕБУС (🎄 + 🎁 + 🕛 + 🎉 = Новий рік)
  // ----------------------------------------------------
  const emojiForm = document.getElementById('emojiForm');
  const emojiInput = document.getElementById('emojiInput');
  const emojiSubmitBtn = document.getElementById('emojiSubmitBtn');
  const emojiError = document.getElementById('emojiError');
  const emojiStep = document.getElementById('emojiStep');
  const keychainStep = document.getElementById('keychainStep');

  const validEmojiAnswers = [
    'новий рік', 'новийрік', 'новий год', 'новый год', 'новыйгод',
    'нового року', 'новому року', 'новоріччя', 'новорічне свято',
    'новий', 'новый', 'новий рок', 'new year', 'happy new year'
  ];

  function isEmojiValid(val) {
    const clean = val.trim().toLowerCase().replace(/[^a-zа-яіїєґ0-9\s]/gi, '').replace(/\s+/g, ' ');
    if (!clean) return false;
    if (validEmojiAnswers.some(ans => clean.includes(ans) || ans.includes(clean))) return true;
    if (clean.includes('новий') || clean.includes('новый')) return true;
    return false;
  }

  if (emojiForm) {
    emojiForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = emojiInput.value.trim();
      emojiError.classList.add('hidden');
      removeFestiveTooltip();

      if (!val) {
        recordMistake();
        showFestiveTooltip(emojiInput, "Введи назву цього свята! 🎄🎉");
        return;
      }

      if (!isEmojiValid(val)) {
        recordMistake();
        emojiError.classList.remove('hidden');
        shakeElement(emojiInput);
        playToneEffect('buzz');
        return;
      }

      // Вірно!
      recordSuccess();
      playToneEffect('fanfare');
      emojiInput.disabled = true;
      emojiSubmitBtn.disabled = true;
      emojiSubmitBtn.innerHTML = '<span>Вірно! 🎄✨</span>';
      emojiSubmitBtn.style.background = '#22c55e';

      questProgress.isEmojiDone = true;
      saveQuestProgress();
      const emojiNavRow = document.getElementById('emojiNavRow');
      if (emojiNavRow) emojiNavRow.classList.remove('hidden');

      setTimeout(() => {
        showQuestStep('keychain');
        const keychainInput = document.getElementById('keychainInput');
        if (keychainInput && !keychainInput.disabled) keychainInput.focus();
        playToneEffect('chime');
      }, 700);
    });
  }

  // ----------------------------------------------------
  // 12. КРОК 2: ЗАГАДКА ПРО БРЕЛОК
  // ----------------------------------------------------
  const keychainForm = document.getElementById('keychainForm');
  const keychainInput = document.getElementById('keychainInput');
  const keychainSubmitBtn = document.getElementById('keychainSubmitBtn');
  const keychainError = document.getElementById('keychainError');
  const keychainRewardBox = document.getElementById('keychainRewardBox');
  const swingingKeychain = document.getElementById('swingingKeychain');
  const toMemoryStepBtn = document.getElementById('toMemoryStepBtn');
  const memoryStep = document.getElementById('memoryStep');

  const validKeychainAnswers = [
    'брелок', 'брелочок', 'брелочек', 'брелоки', 'брелочки',
    'брелок для ключів', 'брелок для ключів', 'брелочок для ключів',
    'keychain', 'ключниця'
  ];

  function isKeychainValid(val) {
    const clean = val.trim().toLowerCase().replace(/[^a-zа-яіїєґ0-9]/gi, '');
    if (!clean) return false;
    if (validKeychainAnswers.some(ans => clean.includes(ans) || ans.includes(clean))) return true;
    for (const valid of ['брелок', 'брелочок', 'брелочек']) {
      if (levenshtein(clean, valid) <= 2) return true;
    }
    return false;
  }

  if (keychainForm) {
    keychainForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = keychainInput.value.trim();
      keychainError.classList.add('hidden');
      removeFestiveTooltip();

      if (!val) {
        recordMistake();
        showFestiveTooltip(keychainInput, "Введи назву предмета-мандрівника! 🎒🗝️");
        return;
      }

      if (!isKeychainValid(val)) {
        recordMistake();
        keychainError.classList.remove('hidden');
        shakeElement(keychainInput);
        playToneEffect('buzz');
        return;
      }

      // Вірно!
      recordSuccess();
      playToneEffect('fanfare');
      keychainInput.disabled = true;
      keychainSubmitBtn.disabled = true;
      keychainSubmitBtn.innerHTML = '<span>Вірно! 🗝️✨</span>';
      keychainSubmitBtn.style.background = '#22c55e';

      questProgress.isKeychainDone = true;
      saveQuestProgress();
      const kToMem = document.getElementById('keychainToMemoryDirectBtn');
      if (kToMem) kToMem.classList.remove('hidden');

      keychainRewardBox.classList.remove('hidden');
      setTimeout(() => {
        scrollOverlayIfNeeded(keychainRewardBox);
      }, 250);
    });
  }

  if (swingingKeychain) {
    swingingKeychain.addEventListener('click', () => {
      playToneEffect('pop');
      const img = swingingKeychain.querySelector('.keychain-graphic');
      if (img) {
        img.style.transition = 'transform 0.4s ease';
        img.style.transform = 'scale(1.25) rotate(20deg)';
        setTimeout(() => {
          img.style.transform = 'scale(1) rotate(0deg)';
        }, 400);
      }
    });
  }

  if (toMemoryStepBtn) {
    toMemoryStepBtn.addEventListener('click', () => {
      playToneEffect('chime');
      showQuestStep('memory');

      const memoryInput = document.getElementById('memoryInput');
      if (memoryInput && !memoryInput.disabled) memoryInput.focus();
    });
  }

  // ----------------------------------------------------
  // 13. КРОК 3: ЗАГАДКА ПРО СПОГАД ТА СВЯТКОВИЙ ФОТО-ПАЗЛ
  // ----------------------------------------------------
  const memoryForm = document.getElementById('memoryForm');
  const memoryInput = document.getElementById('memoryInput');
  const memorySubmitBtn = document.getElementById('memorySubmitBtn');
  const memoryError = document.getElementById('memoryError');
  const friendsPhotoBox = document.getElementById('friendsPhotoBox');
  const polaroidCard = document.getElementById('polaroidCard');
  const spotsFoundText = document.getElementById('spotsFoundText');
  const finalFinishBtn = document.getElementById('finalFinishBtn');
  const puzzleBoard = document.getElementById('puzzleBoard');
  const puzzleStatusText = document.getElementById('puzzleStatusText');
  const memorySolvedBanner = document.getElementById('memorySolvedBanner');

  const validMemoryAnswers = [
    'спогад', 'спогади', 'спогаду', 'спогадами',
    'пам\'ять', 'пам ять', 'память',
    'воспоминание', 'воспоминания',
    'фото', 'фотографія', 'фотография', 'фотокартка', 'світлина', 'світлини', 'знімок', 'знімки',
    'малюнок', 'рисунок', 'портрет', 'картинка',
    'memory', 'memories', 'photo'
  ];

  function isMemoryValid(val) {
    const clean = val.trim().toLowerCase().replace(/[^a-zа-яіїєґ0-9]/gi, '');
    if (!clean) return false;
    if (validMemoryAnswers.some(ans => clean.includes(ans) || ans.includes(clean))) return true;
    for (const valid of ['спогад', 'спогади', 'память', 'фотографія']) {
      if (levenshtein(clean, valid) <= 2) return true;
    }
    return false;
  }

  // Стан фото-пазла (9 шматочків 3x3 з memory_photo.jpg)
  let puzzleSlots = [2, 0, 1, 4, 3, 5, 8, 6, 7];
  let selectedTileIdx = null;
  let isPuzzleDone = false;

  function countCorrectTiles() {
    return puzzleSlots.reduce((acc, val, idx) => acc + (val === idx ? 1 : 0), 0);
  }

  function renderPuzzle() {
    if (!puzzleBoard) return;
    puzzleBoard.innerHTML = '';

    const correctCount = countCorrectTiles();
    if (spotsFoundText) spotsFoundText.textContent = `Зібрано: ${correctCount} з 9`;

    puzzleSlots.forEach((tileVal, slotIdx) => {
      const tile = document.createElement('div');
      tile.className = 'puzzle-tile';
      if (tileVal === slotIdx) {
        tile.classList.add('correct');
      }
      if (selectedTileIdx === slotIdx) {
        tile.classList.add('selected');
      }

      // 3x3 background position (0%, 50%, 100%)
      const col = tileVal % 3;
      const row = Math.floor(tileVal / 3);
      tile.style.backgroundPosition = `${col * 50}% ${row * 50}%`;

      tile.addEventListener('click', () => {
        if (isPuzzleDone) return;
        onTileClick(slotIdx);
      });

      puzzleBoard.appendChild(tile);
    });
  }

  function onTileClick(slotIdx) {
    if (selectedTileIdx === null) {
      selectedTileIdx = slotIdx;
      playToneEffect('pop');
      renderPuzzle();
    } else if (selectedTileIdx === slotIdx) {
      selectedTileIdx = null;
      renderPuzzle();
    } else {
      // Міняємо місцями два шматочки
      const temp = puzzleSlots[selectedTileIdx];
      puzzleSlots[selectedTileIdx] = puzzleSlots[slotIdx];
      puzzleSlots[slotIdx] = temp;
      selectedTileIdx = null;
      playToneEffect('pop');
      renderPuzzle();

      questProgress.puzzleSlots = [...puzzleSlots];
      saveQuestProgress();

      checkPuzzleCompletion();
    }
  }

  function checkPuzzleCompletion() {
    const isSolved = puzzleSlots.every((val, idx) => val === idx);
    if (isSolved && !isPuzzleDone) {
      finishPuzzle();
    }
  }

  function finishPuzzle(silent = false) {
    isPuzzleDone = true;
    puzzleSlots = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    renderPuzzle();

    questProgress.isPuzzleDone = true;
    questProgress.puzzleSlots = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    saveQuestProgress();

    if (puzzleBoard) puzzleBoard.classList.add('solved');
    if (polaroidCard) polaroidCard.classList.add('golden-glow');
    if (puzzleStatusText) {
      puzzleStatusText.innerHTML = '✨ <strong>Спогад зібрано!</strong> 💖 Чарівний момент збережено назавжди!';
      puzzleStatusText.style.color = '#15803d';
    }
    if (spotsFoundText) spotsFoundText.textContent = `Зібрано: 9 з 9 ✅`;

    if (!silent) {
      playToneEffect('fanfare');
      launchMegaConfetti();
    }

    if (finalFinishBtn) {
      finalFinishBtn.classList.remove('hidden');
      if (!silent) {
        setTimeout(() => {
          scrollOverlayIfNeeded(finalFinishBtn);
        }, 400);
      }
    }
  }

  function initPuzzle() {
    isPuzzleDone = false;
    selectedTileIdx = null;
    puzzleSlots = [2, 0, 1, 4, 3, 5, 8, 6, 7];
    if (puzzleBoard) puzzleBoard.classList.remove('solved');
    if (polaroidCard) polaroidCard.classList.remove('golden-glow');
    renderPuzzle();
  }

  if (memoryForm) {
    memoryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = memoryInput.value.trim();
      memoryError.classList.add('hidden');
      removeFestiveTooltip();

      if (!val) {
        recordMistake();
        showFestiveTooltip(memoryInput, "Напиши відповідь на цю загадку про безцінне! 💭✨");
        return;
      }

      if (!isMemoryValid(val)) {
        recordMistake();
        memoryError.classList.remove('hidden');
        shakeElement(memoryInput);
        playToneEffect('buzz');
        return;
      }

      // Вірно!
      recordSuccess();
      playToneEffect('fanfare');
      memoryInput.disabled = true;
      memorySubmitBtn.disabled = true;

      questProgress.isMemoryDone = true;
      saveQuestProgress();

      // Ховаємо форму, показуємо компактний успішний бейдж, щоб не роздувати висоту екрану
      memoryForm.classList.add('hidden');
      if (memorySolvedBanner) memorySolvedBanner.classList.remove('hidden');

      friendsPhotoBox.classList.remove('hidden');
      initPuzzle();

      setTimeout(() => {
        scrollOverlayIfNeeded(friendsPhotoBox);
      }, 300);
    });
  }

  if (finalFinishBtn) {
    finalFinishBtn.addEventListener('click', () => {
      handleFinalCelebration();
    });
  }

  // ----------------------------------------------------
  // 14. ФІНАЛЬНЕ СВЯТКОВЕ ПРИВІТАННЯ ТА РОЗПАКОВКА
  // ----------------------------------------------------
  const finalGiftBtn = document.getElementById('finalGiftBtn');

  function handleFinalCelebration() {
    playToneEffect('fanfare');
    launchMegaConfetti();
    showStage('finalModal');
  }

  function launchMegaConfetti() {
    const confettiColors = ['#fde047', '#ef4444', '#38bdf8', '#4ade80', '#ffffff', '#fb923c'];
    for (let i = 0; i < 150; i++) {
      snowSparkles.push({
        x: width / 2 + (Math.random() - 0.5) * 180,
        y: height / 2 + (Math.random() - 0.5) * 120,
        size: Math.random() * 5 + 3,
        speedX: (Math.random() - 0.5) * 18,
        speedY: (Math.random() - 0.5) * 18 - 4,
        alpha: 1,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        update() {
          this.x += this.speedX;
          this.y += this.speedY;
          this.speedY += 0.28;
          this.speedX *= 0.98;
          this.alpha -= 0.012;
        },
        draw() {
          if (this.alpha <= 0) return;
          snowCtx.beginPath();
          snowCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          snowCtx.fillStyle = this.color;
          snowCtx.globalAlpha = Math.max(0, this.alpha);
          snowCtx.fill();
        }
      });
    }
  }

  let countdownTimerId = null;

  function startCountdown() {
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minEl = document.getElementById('minutes');
    const secEl = document.getElementById('seconds');

    if (countdownTimerId) {
      clearInterval(countdownTimerId);
      countdownTimerId = null;
    }

    function update() {
      const now = new Date();
      // Орієнтуємось на Новий 2027 Рік!
      let targetDate = new Date('January 1, 2027 00:00:00').getTime();
      if (now.getTime() >= targetDate) {
        targetDate = new Date(`January 1, ${now.getFullYear() + 1} 00:00:00`).getTime();
      }

      const diff = targetDate - now.getTime();

      if (diff <= 0) {
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minEl.textContent = '00';
        secEl.textContent = '00';
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      daysEl.textContent = String(d).padStart(2, '0');
      hoursEl.textContent = String(h).padStart(2, '0');
      minEl.textContent = String(m).padStart(2, '0');
      secEl.textContent = String(s).padStart(2, '0');
    }

    update();
    countdownTimerId = setInterval(update, 1000);
  }

  let impatientClicksCount = 0;
  const giftSurpriseBox = document.getElementById('giftSurpriseBox');
  const giftLockWarning = document.getElementById('giftLockWarning');
  const collectorSuperBadge = document.getElementById('collectorSuperBadge');

  if (finalGiftBtn) {
    finalGiftBtn.addEventListener('click', () => {
      removeFestiveTooltip();
      let requiredDone = getRequiredCount();

      if (requiredDone < 7) {
        impatientClicksCount++;
        playToneEffect('buzz');
        shakeElement(finalGiftBtn);

        if (impatientClicksCount >= 5) {
          unlockAchievement('impatient');
          requiredDone = getRequiredCount();
        }

        if (requiredDone < 7) {
          showFestiveTooltip(finalGiftBtn, `🔒 Замкнено! Потрібно ще ${7 - requiredDone} досягнень (зараз ${requiredDone}/7), щоб розблокувати лист від Kir! Перевір «Мої нагороди» вгорі! 🏆`);
          return;
        }
      }

      // Доступ дозволено (>= 7 досягнень)!
      playToneEffect('fanfare');
      launchMegaConfetti();

      questProgress.isGiftOpened = true;
      saveQuestProgress();

      if (giftSurpriseBox) {
        giftSurpriseBox.classList.remove('hidden');
        finalGiftBtn.style.display = 'none';
        if (giftLockWarning) giftLockWarning.classList.add('hidden');

        // Перевіряємо супер-бонус "Колекціонерка"
        if (isAchievementUnlocked('collector')) {
          if (collectorSuperBadge) collectorSuperBadge.classList.remove('hidden');
        }

        setTimeout(() => {
          scrollOverlayIfNeeded(giftSurpriseBox);
        }, 200);
      }
    });
  }

  // ----------------------------------------------------
  // 15. ВІДНОВЛЕННЯ ЗБЕРЕЖЕНОГО ПРОГРЕСУ ПРИ ЗАВАНТАЖЕННІ
  // ----------------------------------------------------
  function applyRestoredProgress(saved) {
    if (!saved) return;
    questProgress = { ...questProgress, ...saved };

    // 1. Логін
    if (questProgress.isLoggedIn) {
      if (userNameInput && questProgress.enteredName) {
        userNameInput.value = questProgress.enteredName;
      }
      if (resumeQuestBox) {
        resumeQuestBox.classList.remove('hidden');
        if (resumeStageDesc) {
          if (questProgress.isGiftOpened) {
            resumeStageDesc.textContent = 'Новорічний подарунок відкрито! 🎁✨';
          } else if (questProgress.isPuzzleDone) {
            resumeStageDesc.textContent = 'Усі квести пройдено! Фінальний сюрприз чекає! 🎁';
          } else if (questProgress.isMemoryDone) {
            resumeStageDesc.textContent = 'Ти збираєш святковий фото-пазл 📸';
          } else if (questProgress.isKeychainDone) {
            resumeStageDesc.textContent = 'Ти розгадала брелок, попереду головний спогад ✨';
          } else if (questProgress.isEmojiDone) {
            resumeStageDesc.textContent = 'Емодзі-ребус розгадано, чекає брелок 🗝️';
          } else if (questProgress.isPizzaDone) {
            resumeStageDesc.textContent = 'Шифр піци розгадано! Наступні зимові загадки чекають 🍕';
          } else if (questProgress.isFriendDone) {
            resumeStageDesc.textContent = 'Подругу вгадано, розгадуй піцу 🍕';
          } else {
            resumeStageDesc.textContent = 'Ти увійшла до зимової казки ❄️';
          }
        }
      }
      updateResumeHudButton();
    }

    // 2. Подруга
    if (questProgress.isFriendDone) {
      if (friendNameInput) {
        friendNameInput.value = questProgress.friendName || 'Настя';
        friendNameInput.disabled = true;
      }
      const friendSubmitBtn = document.getElementById('friendSubmitBtn');
      if (friendSubmitBtn) {
        friendSubmitBtn.disabled = true;
        friendSubmitBtn.innerHTML = '<span>Вірно! 💖</span>';
        friendSubmitBtn.style.background = '#22c55e';
      }
      if (pizzaQuestSection) {
        pizzaQuestSection.classList.remove('locked');
      }
    }

    // 3. Піца
    if (Array.isArray(questProgress.tastedPizzas)) {
      questProgress.tastedPizzas.forEach(f => tastedPizzas.add(f));
    }
    if (questProgress.isPizzaDone) {
      if (dot1) dot1.textContent = '🟢';
      if (dot2) dot2.textContent = '🟢';
      if (dot3) dot3.textContent = '🟢';
      correctSequence.forEach(pid => {
        const spot = document.querySelector(`.pep-spot[data-id="${pid}"]`);
        if (spot) spot.classList.add('clicked-correct');
      });
      if (pizzaSuccessBox) pizzaSuccessBox.classList.remove('hidden');
      const rToNext = document.getElementById('riddleToNextBtn');
      if (rToNext) rToNext.classList.remove('hidden');
    }

    // 4. Емодзі
    if (questProgress.isEmojiDone) {
      if (emojiInput) {
        emojiInput.value = 'Новий рік';
        emojiInput.disabled = true;
      }
      if (emojiSubmitBtn) {
        emojiSubmitBtn.disabled = true;
        emojiSubmitBtn.innerHTML = '<span>Вірно! 🎄✨</span>';
        emojiSubmitBtn.style.background = '#22c55e';
      }
      const emojiNavRow = document.getElementById('emojiNavRow');
      if (emojiNavRow) emojiNavRow.classList.remove('hidden');
    }

    // 5. Брелок
    if (questProgress.isKeychainDone) {
      if (keychainInput) {
        keychainInput.value = 'Брелок';
        keychainInput.disabled = true;
      }
      if (keychainSubmitBtn) {
        keychainSubmitBtn.disabled = true;
        keychainSubmitBtn.innerHTML = '<span>Вірно! 🗝️✨</span>';
        keychainSubmitBtn.style.background = '#22c55e';
      }
      if (keychainRewardBox) keychainRewardBox.classList.remove('hidden');
      const kToMem = document.getElementById('keychainToMemoryDirectBtn');
      if (kToMem) kToMem.classList.remove('hidden');
    }

    // 6. Спогад та фото-пазл
    if (questProgress.isMemoryDone) {
      if (memoryInput) {
        memoryInput.value = 'Спогад';
        memoryInput.disabled = true;
      }
      if (memorySubmitBtn) {
        memorySubmitBtn.disabled = true;
      }
      if (memoryForm) memoryForm.classList.add('hidden');
      if (memorySolvedBanner) memorySolvedBanner.classList.remove('hidden');
      if (friendsPhotoBox) friendsPhotoBox.classList.remove('hidden');

      if (questProgress.puzzleSlots && Array.isArray(questProgress.puzzleSlots)) {
        puzzleSlots = [...questProgress.puzzleSlots];
      }
      if (questProgress.isPuzzleDone) {
        finishPuzzle(true);
      } else {
        renderPuzzle();
      }
    }

    // 7. Відкритий подарунок
    if (questProgress.isGiftOpened) {
      if (giftSurpriseBox) giftSurpriseBox.classList.remove('hidden');
      if (finalGiftBtn) finalGiftBtn.style.display = 'none';
      if (giftLockWarning) giftLockWarning.classList.add('hidden');
      if (collectorSuperBadge && isAchievementUnlocked('collector')) {
        collectorSuperBadge.classList.remove('hidden');
      }
    }
  }

  // Відновлюємо збережений стан
  applyRestoredProgress(loadQuestProgress());
});
