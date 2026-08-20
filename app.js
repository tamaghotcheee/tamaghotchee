/* ==========================================================================
   POYTUG GNS — COMPLETE INTERACTIVE ENGINE v3.1 (FULL PRODUCTION READY)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==================== STATE MANAGEMENT ====================
  let currentLang = localStorage.getItem('lpg_lang') || 'ru';
  let isAuth = localStorage.getItem('lpg_auth') === 'true';
  let userPhone = localStorage.getItem('lpg_phone') || '';
  let soundFxEnabled = localStorage.getItem('lpg_sound') !== 'false';
  let isDarkMode = localStorage.getItem('lpg_dark') !== 'false';

  let cylinderQuantity = 1;
  let isWholesale = false;

  let selectedCylinder = { type: '10kg', price: 45000, wholesalePrice: 38000, name: 'Баллон 10 КГ' };
  let selectedAddress = 'г. Ташкент, ул. Амира Темура, 45, кв. 12';
  let selectedPayment = 'cash';
  let companyInn = '';
  let countdownTimerInterval = null;
  let trackingCourierInterval = null;

  let cart = JSON.parse(localStorage.getItem('lpg_cart') || 'null');
  if (!cart) {
    cart = [
      { name: "Баллон 10 кг", qty: 1, price: 340000 },
      { name: "Баллон 20 кг", qty: 1, price: 480000 }
    ];
  }
  let appliedPromoDiscount = 0;
  let userBalance = parseInt(localStorage.getItem('lpg_balance') || '25000', 10);

  function updateBalanceDisplay() {
    const formatted = isAuth ? (userBalance.toLocaleString().replace(/,/g, ' ') + ' UZS') : '0 UZS';
    const menuEl = document.getElementById('menu-balance-amount');
    const accEl = document.getElementById('acc-balance-display');
    const topupEl = document.getElementById('topup-current-balance');
    if (menuEl) menuEl.textContent = formatted;
    if (accEl) accEl.textContent = formatted;
    if (topupEl) topupEl.textContent = formatted;
    if (isAuth) localStorage.setItem('lpg_balance', userBalance.toString());
  }
  updateBalanceDisplay();

  let savedCards = [
    { type: 'UZCARD', pan: '8600 •••• •••• 4412', exp: '12/28' },
    { type: 'HUMO', pan: '9860 •••• •••• 9821', exp: '08/29' }
  ];

  let savedAddresses = [
    { title: 'Дом', text: 'г. Ташкент, ул. Амира Темура, 45, кв. 12', icon: '🏠' },
    { title: 'Дача / Частный дом', text: 'г. Ташкент, Сергели, Массив 4, д. 18', icon: '🏡' }
  ];

  let orderHistory = [
    { code: 'LPG-8821', date: '14 Авг 2026', title: 'Заправка баллона 20 кг (1 шт)', price: 75000, status: 'Доставлен' },
    { code: 'LPG-7104', date: '02 Июл 2026', title: 'Заправка баллона 10 кг (1 шт)', price: 45000, status: 'Доставлен' }
  ];

  // Apply Theme on load
  document.body.classList.toggle('theme-light', !isDarkMode);
  document.getElementById('toggle-dark-theme').checked = isDarkMode;
  document.getElementById('toggle-sound-fx').checked = soundFxEnabled;


  // ==================== i18n TRANSLATIONS ====================
  const translations = {
    ru: {
      auth2faTitle: "Вход",
      tabLogin: "Вход",
      tabRegister: "Регистрация",
      step1of2: "Шаг 1 из 2: Данные",
      step2of2: "Шаг 2 из 2: СМС верификация",
      phoneLabel: "Номер телефона",
      passwordLabel: "Пароль",
      forgotPassword: "Забыли пароль?",
      btnContinue2fa: "Продолжить к СМС коду",
      codeSentTo: "СМС была отправлена на номер",
      otpSecuritySub: "Введите 4 цифры для подтверждения",
      confirmCodeAndEnter: "Подтвердить и Войти",
      resendCode: "Отправить код повторно",
      backToCredentials: "Изменить телефон/пароль",
      fullNameLabel: "Ваше имя или организация",
      createPassword: "Придумайте пароль",
      pwdTooShort: "Слишком короткий (мин. 6)",
      pwdWeak: "Слабый пароль",
      pwdMedium: "Средний пароль",
      pwdStrong: "Надежный пароль",
      confirmPassword: "Повторите пароль",
      agreeTerms: "Согласен с правилами сервиса и безопасной доставки LPG",
      btnGet2faCode: "Получить СМС код",
      btnCompleteRegistration: "Завершить регистрацию",
      backToForm: "Вернуться к заполнению",
      skipAuthHint: "Или нажмите ✕ сверху чтобы войти позже в гостевом режиме",
      guestUser: "Гость",
      myBalance: "Мой баланс",
      security2fa: "Безопасность и 2FA",
      settings: "Настройки",
      aboutCompany: "О нашей фирме",
      support: "Служба поддержки",
      btnLogout: "Выйти из аккаунта",
      refillGasTitle: "Заправка СУГ / LPG",
      refillGasSub: "Быстрая заправка вашего баллона с доставкой",
      statusEmpty: "ПУСТОЙ",
      btnRefill: "ЗАПРАВИТЬ",
      selectCylinderTitle: "Выберите размер баллона",
      selectCylinderSub: "Круговое переключение между баллонами",
      pillBestHome: "Для дома и кухни",
      pillCompact: "Компактный / Дача",
      pillIndustrial: "Для кафе и отопления",
      btnConfirmSelection: "Подтвердить выбор",
      fillingProgressTitle: "Процесс заправки газа...",
      pressure: "Давление",
      gasVolume: "Объем",
      totalCost: "Стоимость",
      addressSelectTitle: "Адрес доставки",
      addressSelectSub: "Выберите сохраненный адрес или укажите новый",
      addrHome: "Дом",
      addrDacha: "Дача / Частный дом",
      btnAddAddress: "Добавить адрес / Указать на карте",
      backToSavedAddresses: "Назад к списку",
      newAddressTitle: "Новый адрес доставки",
      newAddressSub: "Введите адрес или отметьте точку на карте",
      btnSaveAndUseAddress: "Сохранить и продолжить",
      btnProceedPayment: "Перейти к оплате",
      paymentTitle: "Оплата заказа",
      paymentSub: "Выберите удобный способ оплаты",
      deliveryFee: "Доставка до двери",
      free: "Бесплатно",
      totalToPay: "Итого к оплате",
      payCash: "Наличными при получении",
      payCashSub: "Оплата курьеру при передаче баллона",
      payOnlineFast: "Быстрая онлайн-оплата в 1 клик",
      payUzcardHumo: "Оплата картами Uzcard / Humo",
      payOnline: "Электронный кошелек / Рассрочка",
      btnConfirmOrder: "Подтвердить и оплатить",
      orderProcessedTitle: "Заказ взят в обработку!",
      orderProcessedSub: "Курьер спешит к вам с заправленным баллоном",
      estimatedWait: "Примерное время ожидания",
      statusAccepted: "Принят",
      statusInTransit: "В пути",
      statusDelivered: "Доставлен",
      btnNewOrder: "Сделать новый заказ",
      navHome: "Главная",
      navMap: "Карта",
      navStore: "Баллоны",
      navAccount: "Аккаунт",
      storeTitle: "Магазин газовых баллонов",
      storeSub: "Новые пустые и заправленные баллоны с гарантией",
      btnBuy: "Купить",
      savedCards: "Привязанные карты",
      savedAddresses: "Сохраненные адреса",
      orderHistory: "История заказов",
      openNow: "Открыто",
      btnBuildRoute: "Построить маршрут",
      cartTitle: "Корзина покупок"
    },
    uz: {
      auth2faTitle: "Kirish",
      tabLogin: "Kirish",
      tabRegister: "Ro'yxatdan o'tish",
      step1of2: "1-bosqich: Ma'lumotlar",
      step2of2: "2-bosqich: SMS tekshiruvi",
      phoneLabel: "Telefon raqami",
      passwordLabel: "Parol",
      forgotPassword: "Parolni unutdingizmi?",
      btnContinue2fa: "SMS kodga o'tish",
      codeSentTo: "SMS raqamga yuborildi:",
      otpSecuritySub: "Tasdiqlash uchun 4 raqamni kiriting",
      confirmCodeAndEnter: "Tasdiqlash va Kirish",
      resendCode: "Kodni qayta yuborish",
      backToCredentials: "Telefon/parolni o'zgartirish",
      fullNameLabel: "Ismingiz yoki tashkilot",
      createPassword: "Parol yarating",
      pwdTooShort: "Juda qisqa (kamida 6 ta)",
      pwdWeak: "Kuchsiz parol",
      pwdMedium: "O'rtacha parol",
      pwdStrong: "Ishonchli parol",
      confirmPassword: "Parolni takrorlang",
      agreeTerms: "LPG xizmat ko'rsatish va xavfsiz yetkazish qoidalariga roziman",
      btnGet2faCode: "SMS kodini olish",
      btnCompleteRegistration: "Ro'yxatdan o'tishni yakunlash",
      backToForm: "Formaga qaytish",
      skipAuthHint: "Yoki keyinroq mehmon sifatida kirish uchun ✕ bosing",
      guestUser: "Mehmon",
      myBalance: "Mening balansim",
      security2fa: "Xavfsizlik va 2FA",
      settings: "Sozlamalar",
      aboutCompany: "Kompaniya haqida",
      support: "Qo'llab-quvvatlash",
      btnLogout: "Hisobdan chiqish",
      refillGasTitle: "LPG Gaz Quyish",
      refillGasSub: "Balloningizni tezkor to'ldirish va yetkazish",
      statusEmpty: "BO'SH",
      btnRefill: "GAZ QUYISH",
      selectCylinderTitle: "Ballon hajmini tanlang",
      selectCylinderSub: "Ballonlar o'rtasida aylanma almashtirish",
      pillBestHome: "Uy va oshxona uchun",
      pillCompact: "Ixcham / Dala hovli",
      pillIndustrial: "Kafe va isitish uchun",
      btnConfirmSelection: "Tanlovni tasdiqlash",
      fillingProgressTitle: "Gaz to'ldirish jarayoni...",
      pressure: "Bosim",
      gasVolume: "Hajmi",
      totalCost: "Narxi",
      addressSelectTitle: "Yetkazib berish manzili",
      addressSelectSub: "Saqlangan manzilni tanlang yoki yangisini kiriting",
      addrHome: "Uy",
      addrDacha: "Dala hovli",
      btnAddAddress: "Manzil qo'shish / Xaritadan belgilash",
      backToSavedAddresses: "Ro'yxatga qaytish",
      newAddressTitle: "Yangi yetkazish manzili",
      newAddressSub: "Manzilni yozing yoki xaritada belgilang",
      btnSaveAndUseAddress: "Saqlash va davom etish",
      btnProceedPayment: "To'lovga o'tish",
      paymentTitle: "Buyurtma to'lovi",
      paymentSub: "Qulay to'lov usulini tanlang",
      deliveryFee: "Eshikgacha yetkazish",
      free: "BEPUL",
      totalToPay: "Jami to'lov:",
      payCash: "Qabul qilganda naqd",
      payCashSub: "Ballon topshirilganda kuryerga to'lash",
      payOnlineFast: "1 bosishda tezkor onlayn to'lov",
      payUzcardHumo: "Uzcard / Humo kartalari orqali",
      payOnline: "Elektron hamyon / Bo'lib to'lash",
      btnConfirmOrder: "Tasdiqlash va To'lash",
      orderProcessedTitle: "Buyurtma qabul qilindi!",
      orderProcessedSub: "Kuryer to'ldirilgan ballon bilan yo'lda",
      estimatedWait: "Taxminiy kutish vaqti",
      statusAccepted: "Qabul qilindi",
      statusInTransit: "Yo'lda",
      statusDelivered: "Yetkazildi",
      btnNewOrder: "Yangi buyurtma berish",
      navHome: "Bosh sahifa",
      navMap: "Xarita",
      navStore: "Ballonlar",
      navAccount: "Kabinet",
      storeTitle: "Gaz ballonlari do'koni",
      storeSub: "Kafolatlangan yangi bo'sh va to'la ballonlar",
      btnBuy: "Sotib olish",
      savedCards: "Ulangan kartalar",
      savedAddresses: "Saqlangan manzillar",
      orderHistory: "Buyurtmalar tarixi",
      openNow: "Ochiq",
      btnBuildRoute: "Yo'nalish tuzish",
      cartTitle: "Haridlar savatchasi"
    },
    en: {
      auth2faTitle: "Sign In",
      tabLogin: "Sign In",
      tabRegister: "Sign Up",
      step1of2: "Step 1 of 2: Credentials",
      step2of2: "Step 2 of 2: SMS OTP",
      phoneLabel: "Phone Number",
      passwordLabel: "Password",
      forgotPassword: "Forgot password?",
      btnContinue2fa: "Continue to SMS OTP",
      codeSentTo: "SMS was sent to number",
      otpSecuritySub: "Enter 4 digits to verify",
      confirmCodeAndEnter: "Verify & Enter",
      resendCode: "Resend Code",
      backToCredentials: "Change phone/password",
      fullNameLabel: "Your Name / Organization",
      createPassword: "Create Password",
      pwdTooShort: "Too short (min. 6)",
      pwdWeak: "Weak password",
      pwdMedium: "Medium password",
      pwdStrong: "Strong password",
      confirmPassword: "Confirm Password",
      agreeTerms: "I agree with LPG terms & safe gas delivery rules",
      btnGet2faCode: "Get SMS Code",
      btnCompleteRegistration: "Complete Registration",
      backToForm: "Back to Form",
      skipAuthHint: "Or tap ✕ above to skip and enter as Guest",
      guestUser: "Guest",
      myBalance: "My Balance",
      security2fa: "Security & 2FA",
      settings: "Settings",
      aboutCompany: "About Company",
      support: "Support Service",
      btnLogout: "Log Out",
      refillGasTitle: "LPG Gas Refill",
      refillGasSub: "Fast refill for your cylinder with door delivery",
      statusEmpty: "EMPTY",
      btnRefill: "REFILL GAS",
      selectCylinderTitle: "Select Cylinder Size",
      selectCylinderSub: "Swipe to switch between sizes",
      pillBestHome: "For Home & Kitchen",
      pillCompact: "Compact / Outdoor",
      pillIndustrial: "Commercial & Heating",
      btnConfirmSelection: "Confirm Selection",
      fillingProgressTitle: "Gas Refilling Process...",
      pressure: "Pressure",
      gasVolume: "Volume",
      totalCost: "Total Cost",
      addressSelectTitle: "Delivery Address",
      addressSelectSub: "Choose a saved address or specify a new one",
      addrHome: "Home",
      addrDacha: "Summer House",
      btnAddAddress: "Add Address / Pin on Map",
      backToSavedAddresses: "Back to List",
      newAddressTitle: "New Delivery Address",
      newAddressSub: "Enter address or pinpoint location on map",
      btnSaveAndUseAddress: "Save & Continue",
      btnProceedPayment: "Proceed to Payment",
      paymentTitle: "Order Payment",
      paymentSub: "Choose your payment method",
      deliveryFee: "Door Delivery",
      free: "FREE",
      totalToPay: "Total Amount:",
      payCash: "Cash on Delivery",
      payCashSub: "Pay courier upon handover",
      payOnlineFast: "1-Click fast online payment",
      payUzcardHumo: "Pay via Uzcard / Humo cards",
      payOnline: "Digital Wallet / Installments",
      btnConfirmOrder: "Confirm & Pay",
      orderProcessedTitle: "Order in Progress!",
      orderProcessedSub: "Courier is on the way with your filled cylinder",
      estimatedWait: "Estimated Waiting Time",
      statusAccepted: "Accepted",
      statusInTransit: "In Transit",
      statusDelivered: "Delivered",
      btnNewOrder: "Place New Order",
      navHome: "Home",
      navMap: "Map",
      navStore: "Cylinders",
      navAccount: "Account",
      storeTitle: "Gas Cylinder Store",
      storeSub: "Brand new empty and refilled cylinders",
      btnBuy: "Buy Now",
      savedCards: "Linked Cards",
      savedAddresses: "Saved Addresses",
      orderHistory: "Order History",
      openNow: "Open Now",
      btnBuildRoute: "Get Directions",
      cartTitle: "Shopping Cart"
    }
  };

  function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('lpg_lang', lang);

    document.querySelectorAll('.lang-btn').forEach(btn => {
      const isActive = btn.dataset.lang === lang;
      btn.classList.toggle('active', isActive);
      const checkIcon = btn.querySelector('.lang-check-icon');
      if (checkIcon) {
        checkIcon.style.display = isActive ? 'inline-block' : 'none';
      }
    });

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });
  }

  setLanguage(currentLang);

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetLang = btn.dataset.lang;
      setLanguage(targetLang);
      const langNames = { ru: "Русский язык", uz: "O'zbek tili", en: "English" };
      showToast(`Язык изменен: ${langNames[targetLang] || targetLang.toUpperCase()}`);
    });
  });


  // ==================== HTML5 CONFETTI CANNON ====================
  function launchConfettiCannon() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#ef4444', '#dc2626', '#ffffff', '#e2e8f0', '#18181b', '#f87171'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 18,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 10
      });
    }

    let start = Date.now();
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4;
        p.rotation += p.rSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (Date.now() - start < 2200) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    requestAnimationFrame(animate);
  }


  // ==================== WEB AUDIO SYNTHESIZER ====================
  let audioCtx = null;
  let hissNoiseNode = null;

  function playGasFillingAudio() {
    if (!soundFxEnabled) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const bufferSize = audioCtx.sampleRate * 2;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = buffer;
      whiteNoise.loop = true;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      filter.Q.value = 3.0;

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, audioCtx.currentTime + 0.5);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      whiteNoise.start();
      hissNoiseNode = { source: whiteNoise, gain: gain, filter: filter };
    } catch (e) {}
  }

  function updateAudioPitch(percent) {
    if (hissNoiseNode && hissNoiseNode.filter) {
      const targetFreq = 1200 + (percent / 100) * 1600;
      hissNoiseNode.filter.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.1);
    }
  }

  function stopGasFillingAudio() {
    if (hissNoiseNode && audioCtx) {
      try {
        hissNoiseNode.gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        setTimeout(() => hissNoiseNode.source.stop(), 200);
      } catch (e) {}
    }
  }


  // ==================== 2FA AUTH & REGISTRATION ENGINE ====================
  let storedUsers = JSON.parse(localStorage.getItem('lpg_users') || '[]');
  if (storedUsers.length === 0) {
    storedUsers = [
      { name: "Алишер Каримов", phone: "+998 90 123-45-67", password: "123456" }
    ];
    localStorage.setItem('lpg_users', JSON.stringify(storedUsers));
  }

  let currentUserName = localStorage.getItem('lpg_user_name') || "Алишер Каримов";
  let pendingAuthData = { name: '', phone: '', password: '' };
  let loginTimerInterval = null;
  let regTimerInterval = null;

  // Tabs: Login vs Register
  const tabAuthLogin = document.getElementById('tab-auth-login');
  const tabAuthRegister = document.getElementById('tab-auth-register');
  const modeLogin = document.getElementById('mode-login');
  const modeRegister = document.getElementById('mode-register');
  const authMainTitle = document.getElementById('auth-main-title');
  const authMainSub = document.getElementById('auth-main-sub');
  const authProgressFill = document.getElementById('auth-progress-fill');
  const authProgressLabel = document.getElementById('auth-progress-label');
  const authMarkIcon = document.getElementById('auth-mark-icon');

  const SHIELD_ICON_SVG = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>';
  const USER_ICON_SVG = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

  function switchAuthTab(tab) {
    const isLogin = tab === 'login';
    tabAuthLogin.classList.toggle('active', isLogin);
    tabAuthRegister.classList.toggle('active', !isLogin);
    modeLogin.classList.toggle('active', isLogin);
    modeRegister.classList.toggle('active', !isLogin);

    if (authProgressFill) authProgressFill.style.width = '50%';

    if (isLogin) {
      document.getElementById('login-step-credentials').classList.add('active');
      document.getElementById('login-step-otp').classList.remove('active');
      if (authMainTitle) authMainTitle.textContent = "Вход в аккаунт";
      if (authMainSub) authMainSub.textContent = "Введите номер телефона и пароль";
      if (authProgressLabel) authProgressLabel.textContent = "Шаг 1 из 2 · Данные";
      if (authMarkIcon) authMarkIcon.innerHTML = SHIELD_ICON_SVG;
    } else {
      document.getElementById('register-step-form').classList.add('active');
      document.getElementById('register-step-otp').classList.remove('active');
      if (authMainTitle) authMainTitle.textContent = "Регистрация";
      if (authMainSub) authMainSub.textContent = "Создайте аккаунт для заказа газа";
      if (authProgressLabel) authProgressLabel.textContent = "Шаг 1 из 2 · Данные профиля";
      if (authMarkIcon) authMarkIcon.innerHTML = USER_ICON_SVG;
    }
  }

  tabAuthLogin.addEventListener('click', () => switchAuthTab('login'));
  tabAuthRegister.addEventListener('click', () => switchAuthTab('register'));

  // Password Visibility Toggles
  const btnToggleLoginPwd = document.getElementById('btn-toggle-login-pwd');
  const inputLoginPwd = document.getElementById('input-login-password');
  if (btnToggleLoginPwd && inputLoginPwd) {
    btnToggleLoginPwd.addEventListener('click', () => {
      const isPwd = inputLoginPwd.type === 'password';
      inputLoginPwd.type = isPwd ? 'text' : 'password';
      btnToggleLoginPwd.innerHTML = isPwd 
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
    });
  }

  const btnToggleRegPwd = document.getElementById('btn-toggle-reg-pwd');
  const inputRegPwd = document.getElementById('input-reg-password');
  if (btnToggleRegPwd && inputRegPwd) {
    btnToggleRegPwd.addEventListener('click', () => {
      const isPwd = inputRegPwd.type === 'password';
      inputRegPwd.type = isPwd ? 'text' : 'password';
      btnToggleRegPwd.innerHTML = isPwd 
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
    });
  }

  // Password Strength Meter
  const pwdStrengthFill = document.getElementById('pwd-strength-fill');
  const pwdStrengthText = document.getElementById('pwd-strength-text');

  if (inputRegPwd && pwdStrengthFill && pwdStrengthText) {
    inputRegPwd.addEventListener('input', () => {
      const val = inputRegPwd.value;
      if (!val || val.length < 6) {
        pwdStrengthFill.className = 'strength-fill weak';
        pwdStrengthText.textContent = translations[currentLang].pwdTooShort || "Слишком короткий (мин. 6)";
        pwdStrengthText.style.color = "#ef4444";
      } else if (val.length >= 6 && (/^[a-zA-Z]+$/.test(val) || /^[0-9]+$/.test(val))) {
        pwdStrengthFill.className = 'strength-fill medium';
        pwdStrengthText.textContent = translations[currentLang].pwdMedium || "Средний пароль";
        pwdStrengthText.style.color = "#ffb703";
      } else {
        pwdStrengthFill.className = 'strength-fill strong';
        pwdStrengthText.textContent = translations[currentLang].pwdStrong || "Надежный пароль";
        pwdStrengthText.style.color = "#30D158";
      }
    });
  }

  // Helper to redirect guest to login screen for restricted actions (Uzum Tezkor style)
  function redirectToAuth(msg) {
    if (msg) showToast(msg);
    document.querySelectorAll('.modal-backdrop.active').forEach(m => m.classList.remove('active'));
    const sideDrawer = document.getElementById('side-drawer');
    const menuBackdrop = document.getElementById('menu-backdrop');
    if (sideDrawer) sideDrawer.classList.remove('active');
    if (menuBackdrop) menuBackdrop.classList.remove('active');
    screens.forEach(s => s.classList.remove('active'));
    document.getElementById('screen-auth').classList.add('active');
    const btnCloseAuth = document.getElementById('btn-close-auth');
    if (btnCloseAuth) btnCloseAuth.style.display = 'flex';
    const btnOpenCart = document.getElementById('btn-open-cart');
    if (btnOpenCart) btnOpenCart.style.display = 'none';
  }

  // Enter Application Helper
  function enterApp(asGuest = false, name = "Алишер Каримов", phone = "+998 90 123-45-67") {
    document.getElementById('screen-auth').classList.remove('active');
    document.getElementById('screen-home').classList.add('active');
    
    // Hide the 'X' button and show Cart button on all in-app screens
    const btnCloseAuth = document.getElementById('btn-close-auth');
    if (btnCloseAuth) btnCloseAuth.style.display = 'none';
    const btnOpenCart = document.getElementById('btn-open-cart');
    if (btnOpenCart) btnOpenCart.style.display = 'flex';

    if (!asGuest) {
      isAuth = true;
      currentUserName = name;
      userPhone = phone;
      localStorage.setItem('lpg_auth', 'true');
      localStorage.setItem('lpg_phone', userPhone);
      localStorage.setItem('lpg_user_name', currentUserName);

      document.getElementById('drawer-user-name').textContent = currentUserName;
      document.getElementById('drawer-user-phone').textContent = userPhone;
      document.getElementById('acc-user-name').textContent = currentUserName;
      document.getElementById('acc-user-phone').textContent = userPhone;
      showToast(`Добро пожаловать, ${currentUserName}!`);
      launchConfettiCannon();
    } else {
      isAuth = false;
      localStorage.setItem('lpg_auth', 'false');
      document.getElementById('drawer-user-name').textContent = "Гостевой режим";
      document.getElementById('drawer-user-phone').textContent = "Войдите для заказа и пополнения";
      document.getElementById('acc-user-name').textContent = "Гостевой режим";
      document.getElementById('acc-user-phone').textContent = "Нажмите, чтобы войти в аккаунт →";
      showToast("👀 Режим просмотра (без авторизации нельзя заказывать и пополнять)");
    }
    updateBalanceDisplay();
    renderAddressOptions();
  }

  // Guest buttons
  const btnAuthSkipLink = document.getElementById('btn-auth-skip-link');
  const btnAuthSkipLinkReg = document.getElementById('btn-auth-skip-link-reg');
  if (btnAuthSkipLink) btnAuthSkipLink.addEventListener('click', () => enterApp(true));
  if (btnAuthSkipLinkReg) btnAuthSkipLinkReg.addEventListener('click', () => enterApp(true));

  const btnOpenCartEl = document.getElementById('btn-open-cart');
  const btnCloseAuthEl = document.getElementById('btn-close-auth');

  if (isAuth) {
    enterApp(false, currentUserName, userPhone || "+998 (90) 123-45-67");
  } else {
    if (btnCloseAuthEl) btnCloseAuthEl.style.display = 'flex';
    if (btnOpenCartEl) btnOpenCartEl.style.display = 'none';
  }

  // --- LOGIN FLOW (Step 1 -> Step 2) ---
  const btnLoginNext = document.getElementById('btn-login-next');
  const inputLoginPhone = document.getElementById('input-login-phone');
  const loginStepCreds = document.getElementById('login-step-credentials');
  const loginStepOtp = document.getElementById('login-step-otp');
  const displayLoginPhone = document.getElementById('display-login-phone');
  const btnVerifyLoginOtp = document.getElementById('btn-verify-login-otp');
  const btnResendLoginOtp = document.getElementById('btn-resend-login-otp');
  const btnBackToLoginStep1 = document.getElementById('btn-back-to-login-step1');

  btnLoginNext.addEventListener('click', () => {
    const rawPhone = inputLoginPhone.value.trim();
    const password = inputLoginPwd.value.trim();

    if (!rawPhone || rawPhone.length < 7) {
      showToast("Введите корректный номер телефона!");
      inputLoginPhone.focus();
      return;
    }
    if (!password || password.length < 6) {
      showToast("Пароль должен содержать минимум 6 символов!");
      inputLoginPwd.focus();
      return;
    }

    const formattedPhone = rawPhone.startsWith('+998') ? rawPhone : `+998 ${rawPhone}`;
    const cleanDigits = rawPhone.replace(/\D/g, '');
    
    // Check if user exists in local database
    const existing = storedUsers.find(u => u.phone.replace(/\D/g, '').includes(cleanDigits) || cleanDigits.includes(u.phone.replace(/\D/g, '')));
    if (existing && existing.password !== password) {
      showToast("Неверный пароль! (Для демо: 123456)");
      inputLoginPwd.focus();
      return;
    }

    const userName = existing ? existing.name : "Алишер Каримов";
    pendingAuthData = { name: userName, phone: formattedPhone, password: password };

    displayLoginPhone.textContent = formattedPhone;
    loginStepCreds.classList.remove('active');
    loginStepOtp.classList.add('active');

    if (authProgressFill) authProgressFill.style.width = '100%';
    if (authProgressLabel) authProgressLabel.textContent = "Шаг 2 из 2 · СМС код";
    if (authMainTitle) authMainTitle.textContent = "СМС верификация";
    if (authMainSub) authMainSub.textContent = "Введите 4-значный код подтверждения";

    const firstOtp = loginStepOtp.querySelector('.otp-login-digit');
    if (firstOtp) firstOtp.focus();
    startTimer('login-timer-sec', 30);
    showToast("💬 СМС-код отправлен (Тестовый код: 1234)");
  });

  btnVerifyLoginOtp.addEventListener('click', () => {
    enterApp(false, pendingAuthData.name, pendingAuthData.phone);
  });

  btnResendLoginOtp.addEventListener('click', () => {
    startTimer('login-timer-sec', 30);
    showToast("Новый СМС код отправлен: 7788");
  });

  btnBackToLoginStep1.addEventListener('click', () => {
    loginStepOtp.classList.remove('active');
    loginStepCreds.classList.add('active');
    if (authProgressFill) authProgressFill.style.width = '50%';
    if (authProgressLabel) authProgressLabel.textContent = "Шаг 1 из 2 · Данные";
    if (authMainTitle) authMainTitle.textContent = "Вход в аккаунт";
    if (authMainSub) authMainSub.textContent = "Введите номер телефона и пароль";
  });

  // --- REGISTRATION FLOW (Step 1 -> Step 2) ---
  const btnRegisterNext = document.getElementById('btn-register-next');
  const inputRegName = document.getElementById('input-reg-name');
  const inputRegPhone = document.getElementById('input-reg-phone');
  const inputRegPwdConfirm = document.getElementById('input-reg-password-confirm');
  const checkRegTerms = document.getElementById('check-reg-terms');
  const regStepForm = document.getElementById('register-step-form');
  const regStepOtp = document.getElementById('register-step-otp');
  const displayRegPhone = document.getElementById('display-reg-phone');
  const btnVerifyRegOtp = document.getElementById('btn-verify-reg-otp');
  const btnResendRegOtp = document.getElementById('btn-resend-reg-otp');
  const btnBackToRegStep1 = document.getElementById('btn-back-to-reg-step1');

  btnRegisterNext.addEventListener('click', () => {
    const name = inputRegName.value.trim();
    const rawPhone = inputRegPhone.value.trim();
    const password = inputRegPwd.value.trim();
    const pwdConfirm = inputRegPwdConfirm.value.trim();

    if (!name) {
      showToast("Введите ваше имя или название компании!");
      inputRegName.focus();
      return;
    }
    if (!rawPhone || rawPhone.length < 7) {
      showToast("Введите номер телефона!");
      inputRegPhone.focus();
      return;
    }
    if (!password || password.length < 6) {
      showToast("Пароль должен быть не менее 6 символов!");
      inputRegPwd.focus();
      return;
    }
    if (password !== pwdConfirm) {
      showToast("Пароли не совпадают!");
      inputRegPwdConfirm.focus();
      return;
    }
    if (checkRegTerms && !checkRegTerms.checked) {
      showToast("Подтвердите согласие с правилами сервиса!");
      return;
    }

    const formattedPhone = rawPhone.startsWith('+998') ? rawPhone : `+998 ${rawPhone}`;
    pendingAuthData = { name: name, phone: formattedPhone, password: password };

    displayRegPhone.textContent = formattedPhone;
    regStepForm.classList.remove('active');
    regStepOtp.classList.add('active');

    if (authProgressFill) authProgressFill.style.width = '100%';
    if (authProgressLabel) authProgressLabel.textContent = "Шаг 2 из 2 · СМС код";
    if (authMainTitle) authMainTitle.textContent = "Подтверждение номера";
    if (authMainSub) authMainSub.textContent = "Введите 4-значный код из СМС";

    const firstOtp = regStepOtp.querySelector('.otp-reg-digit');
    if (firstOtp) firstOtp.focus();
    startTimer('reg-timer-sec', 30);
    showToast("💬 СМС-код отправлен (Тестовый код: 1234)");
  });

  btnVerifyRegOtp.addEventListener('click', () => {
    storedUsers.push({
      name: pendingAuthData.name,
      phone: pendingAuthData.phone,
      password: pendingAuthData.password
    });
    localStorage.setItem('lpg_users', JSON.stringify(storedUsers));
    enterApp(false, pendingAuthData.name, pendingAuthData.phone);
    showToast("Регистрация успешно завершена!");
  });

  btnResendRegOtp.addEventListener('click', () => {
    startTimer('reg-timer-sec', 30);
    showToast("Новый СМС код отправлен: 9944");
  });

  btnBackToRegStep1.addEventListener('click', () => {
    regStepOtp.classList.remove('active');
    regStepForm.classList.add('active');
    if (authProgressFill) authProgressFill.style.width = '50%';
    if (authProgressLabel) authProgressLabel.textContent = "Шаг 1 из 2 · Данные профиля";
    if (authMainTitle) authMainTitle.textContent = "Регистрация";
    if (authMainSub) authMainSub.textContent = "Создайте аккаунт для заказа газа";
  });

  // OTP digit Auto-Advance and Backspace for all OTP inputs
  function setupOtpInputs(className) {
    const digits = document.querySelectorAll(`.${className}`);
    digits.forEach((input, idx) => {
      input.addEventListener('input', () => {
        if (input.value.length === 1 && idx < digits.length - 1) {
          digits[idx + 1].focus();
        }
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && idx > 0) {
          digits[idx - 1].focus();
        }
      });
    });
  }
  setupOtpInputs('otp-login-digit');
  setupOtpInputs('otp-reg-digit');

  function startTimer(timerId, duration) {
    let sec = duration;
    const timerEl = document.getElementById(timerId);
    if (!timerEl) return;
    timerEl.textContent = sec;
    const interval = setInterval(() => {
      sec--;
      if (timerEl) timerEl.textContent = sec;
      if (sec <= 0) clearInterval(interval);
    }, 1000);
  }

  // Forgot Password Hint
  document.getElementById('btn-forgot-pwd').addEventListener('click', () => {
    showToast("Для демо-аккаунта используйте пароль: 123456 или службу 104");
  });

  // Guest / Skip Auth
  document.getElementById('btn-close-auth').addEventListener('click', () => enterApp(true));
  document.getElementById('btn-auth-skip-link').addEventListener('click', () => enterApp(true));

  // Logout Action
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      isAuth = false;
      localStorage.setItem('lpg_auth', 'false');
      document.getElementById('screen-account').classList.remove('active');
      document.getElementById('screen-auth').classList.add('active');
      const btnCloseAuth = document.getElementById('btn-close-auth');
      if (btnCloseAuth) btnCloseAuth.style.display = 'flex';
      const btnOpenCart = document.getElementById('btn-open-cart');
      if (btnOpenCart) btnOpenCart.style.display = 'none';
      switchAuthTab('login');
      showToast("Вы вышли из системы");
    });
  }

  // Profile Header click in Guest mode
  const profileHeadEl = document.querySelector('.profile-head');
  if (profileHeadEl) {
    profileHeadEl.style.cursor = 'pointer';
    profileHeadEl.addEventListener('click', () => {
      if (!isAuth) {
        redirectToAuth("Вход в аккаунт Poytug GNS");
      }
    });
  }

  // Security 2FA Item in Profile
  const btnAccSecurity = document.getElementById('btn-acc-security');
  if (btnAccSecurity) {
    btnAccSecurity.addEventListener('click', () => {
      showToast("🛡️ Двухфакторная защита активна: Пароль + SMS OTP (100% защита)");
    });
  }

  // Settings in Profile
  const btnAccSettings = document.getElementById('btn-acc-settings');
  if (btnAccSettings) {
    btnAccSettings.addEventListener('click', () => {
      openModal('modal-settings');
    });
  }

  // Support in Profile
  const btnAccSupport = document.getElementById('btn-acc-support');
  if (btnAccSupport) {
    btnAccSupport.addEventListener('click', () => {
      openModal('modal-support');
    });
  }

  // Emergency 104 in Profile
  const btnAccEmergency = document.getElementById('btn-acc-emergency');
  if (btnAccEmergency) {
    btnAccEmergency.addEventListener('click', () => {
      openEmergencyModal();
    });
  }

  // ==================== BALANCE TOP-UP MODAL ENGINE ====================
  function openTopupModal() {
    if (!isAuth) {
      redirectToAuth("🔒 Для пополнения баланса необходимо войти в аккаунт");
      return;
    }
    updateBalanceDisplay();
    openModal('modal-topup');
  }

  const btnTopupBalance = document.getElementById('btn-topup-balance');
  if (btnTopupBalance) {
    btnTopupBalance.addEventListener('click', (e) => {
      e.stopPropagation();
      openTopupModal();
    });
  }

  const btnAccBalanceItem = document.getElementById('btn-acc-balance-item');
  if (btnAccBalanceItem) {
    btnAccBalanceItem.addEventListener('click', () => {
      openTopupModal();
    });
  }

  const inputTopupAmount = document.getElementById('input-topup-amount');
  const btnTopupLabel = document.getElementById('btn-topup-label');
  const topupChips = document.querySelectorAll('.topup-chip');
  const topupMethodCards = document.querySelectorAll('.topup-method-card');
  const btnSubmitTopup = document.getElementById('btn-submit-topup');

  function refreshTopupSubmitBtn() {
    let rawVal = inputTopupAmount ? inputTopupAmount.value.replace(/\D/g, '') : '0';
    let num = parseInt(rawVal, 10) || 0;
    if (btnTopupLabel) {
      btnTopupLabel.textContent = `Пополнить на ${num.toLocaleString().replace(/,/g, ' ')} UZS`;
    }
  }

  topupChips.forEach(chip => {
    chip.addEventListener('click', () => {
      topupChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const amt = parseInt(chip.dataset.amount, 10);
      if (inputTopupAmount) {
        inputTopupAmount.value = amt.toLocaleString().replace(/,/g, ' ');
      }
      refreshTopupSubmitBtn();
    });
  });

  if (inputTopupAmount) {
    inputTopupAmount.addEventListener('input', (e) => {
      let digits = e.target.value.replace(/\D/g, '');
      let val = parseInt(digits, 10) || 0;
      e.target.value = val ? val.toLocaleString().replace(/,/g, ' ') : '';
      topupChips.forEach(c => {
        c.classList.toggle('active', parseInt(c.dataset.amount, 10) === val);
      });
      refreshTopupSubmitBtn();
    });
  }

  topupMethodCards.forEach(card => {
    card.addEventListener('click', () => {
      topupMethodCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });

  if (btnSubmitTopup) {
    btnSubmitTopup.addEventListener('click', () => {
      let digits = inputTopupAmount ? inputTopupAmount.value.replace(/\D/g, '') : '0';
      let amount = parseInt(digits, 10) || 0;
      if (amount < 1000) {
        showToast("Минимальная сумма пополнения: 1 000 UZS");
        return;
      }
      userBalance += amount;
      updateBalanceDisplay();
      closeModal('modal-topup');
      showToast(`💳 Баланс успешно пополнен на +${amount.toLocaleString().replace(/,/g, ' ')} UZS!`);
      launchConfettiCannon();
    });
  }

  // About Company in Profile
  const btnAccAbout = document.getElementById('btn-acc-about');
  if (btnAccAbout) {
    btnAccAbout.addEventListener('click', () => {
      openModal('modal-about');
    });
  }


  // ==================== NAVIGATION ROUTER ====================
  const navItems = document.querySelectorAll('.nav-item');
  const screens = document.querySelectorAll('.app-screen');

  function switchScreen(targetId) {
    navItems.forEach(n => {
      n.classList.toggle('active', n.dataset.target === targetId);
    });

    screens.forEach(s => {
      const isTarget = s.id === targetId;
      s.classList.toggle('active', isTarget);
      if (isTarget) s.scrollTop = 0;
    });

    if (targetId === 'screen-map') {
      if (!mapInitialized) {
        initLeafletMap();
      } else if (mainMap) {
        setTimeout(() => mainMap.invalidateSize(), 150);
      }
    }
  }

  window.switchScreen = switchScreen;

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      switchScreen(item.dataset.target);
    });
  });


  // ==================== EMERGENCY 104 & SIDE DRAWER ====================
  const btnOpenEmergency = document.getElementById('btn-open-emergency');
  const btnMenuEmergency = document.getElementById('btn-menu-emergency');
  const btnCall104Direct = document.getElementById('btn-call-104-direct');

  function openEmergencyModal() {
    openModal('modal-emergency');
  }

  if (btnOpenEmergency) {
    btnOpenEmergency.addEventListener('click', openEmergencyModal);
  }
  btnMenuEmergency.addEventListener('click', () => {
    closeDrawer();
    openEmergencyModal();
  });

  btnCall104Direct.addEventListener('click', () => {
    showToast("Вызов аварийной газовой службы 104...");
  });

  const btnSideMenu = document.getElementById('btn-side-menu');
  const btnCloseDrawer = document.getElementById('btn-close-drawer');
  const drawerBackdrop = document.getElementById('menu-backdrop');
  const sideDrawer = document.getElementById('side-drawer');

  function openDrawer() {
    sideDrawer.classList.add('active');
    drawerBackdrop.classList.add('active');
  }

  function closeDrawer() {
    sideDrawer.classList.remove('active');
    drawerBackdrop.classList.remove('active');
  }

  btnSideMenu.addEventListener('click', openDrawer);
  btnCloseDrawer.addEventListener('click', closeDrawer);
  drawerBackdrop.addEventListener('click', closeDrawer);

  document.getElementById('btn-menu-balance').addEventListener('click', () => {
    closeDrawer();
    openTopupModal();
  });
  document.getElementById('btn-menu-settings').addEventListener('click', () => {
    closeDrawer();
    openModal('modal-settings');
  });
  document.getElementById('btn-menu-history').addEventListener('click', () => {
    closeDrawer();
    renderHistory();
    openModal('modal-history');
  });
  document.getElementById('btn-menu-about').addEventListener('click', () => {
    closeDrawer();
    openModal('modal-about');
  });
  document.getElementById('btn-menu-support').addEventListener('click', () => {
    closeDrawer();
    openModal('modal-support');
  });
  const btnDrawerLogout = document.getElementById('btn-drawer-logout');
  if (btnDrawerLogout) {
    btnDrawerLogout.addEventListener('click', () => {
      closeDrawer();
      isAuth = false;
      localStorage.setItem('lpg_auth', 'false');
      screens.forEach(s => s.classList.remove('active'));
      document.getElementById('screen-auth').classList.add('active');
      const btnCloseAuth = document.getElementById('btn-close-auth');
      if (btnCloseAuth) btnCloseAuth.style.display = 'flex';
      switchAuthTab('login');
      showToast("Вы вышли из системы");
    });
  }


  // ==================== QUANTITY SELECTOR & WHOLESALE B2B ENGINE ====================
  const btnQtyMinus = document.getElementById('btn-qty-minus');
  const btnQtyPlus = document.getElementById('btn-qty-plus');
  const inputCylQty = document.getElementById('input-cyl-qty');
  const wholesaleBadge = document.getElementById('wholesale-badge');

  function updateQuantityAndWholesaleState() {
    let qty = parseInt(inputCylQty.value) || 1;
    if (qty < 1) qty = 1;
    cylinderQuantity = qty;
    inputCylQty.value = cylinderQuantity;

    isWholesale = cylinderQuantity >= 10;
    wholesaleBadge.style.display = isWholesale ? 'block' : 'none';

    const unitPrice = isWholesale ? selectedCylinder.wholesalePrice : selectedCylinder.price;
    const cards = document.querySelectorAll('.carousel-card');
    const activeCard = cards[currentCarouselIdx] || cards[0];
    if (activeCard) {
      const priceTag = activeCard.querySelector('.price-tag');
      if (priceTag) {
        priceTag.textContent = isWholesale ? `${unitPrice.toLocaleString()} UZS / шт` : `${unitPrice.toLocaleString()} UZS`;
      }
    }

    if (isWholesale) {
      showToast(`🏷️ Оптовый заказ (${cylinderQuantity} шт)! Оптовая цена: ${unitPrice.toLocaleString()} UZS`);
    }
  }

  btnQtyMinus.addEventListener('click', () => {
    if (cylinderQuantity > 1) {
      cylinderQuantity--;
      inputCylQty.value = cylinderQuantity;
      updateQuantityAndWholesaleState();
    }
  });

  btnQtyPlus.addEventListener('click', () => {
    cylinderQuantity++;
    inputCylQty.value = cylinderQuantity;
    updateQuantityAndWholesaleState();
  });

  inputCylQty.addEventListener('input', () => {
    updateQuantityAndWholesaleState();
  });


  // ==================== STORE PRODUCT QUANTITY COUNTERS ====================
  document.querySelectorAll('.product, .product-card').forEach(card => {
    const btnMinus = card.querySelector('.btn-store-minus');
    const btnPlus = card.querySelector('.btn-store-plus');
    const qtySpan = card.querySelector('.store-qty-val');
    const inputQty = card.querySelector('.input-store-qty');
    const buyBtn = card.querySelector('.btn-buy-product');

    let currentQty = 1;

    if (btnMinus && btnPlus) {
      btnMinus.addEventListener('click', () => {
        if (currentQty > 1) {
          currentQty--;
          if (qtySpan) qtySpan.textContent = currentQty;
          if (inputQty) inputQty.value = currentQty;
        }
      });

      btnPlus.addEventListener('click', () => {
        if (currentQty < 50) {
          currentQty++;
          if (qtySpan) qtySpan.textContent = currentQty;
          if (inputQty) inputQty.value = currentQty;
        }
      });
    }

    if (buyBtn) {
      buyBtn.addEventListener('click', () => {
        if (!isAuth) {
          redirectToAuth("🔒 Для покупки товаров и заказа войдите в аккаунт");
          return;
        }
        const pName = buyBtn.dataset.product;
        const pPrice = parseInt(buyBtn.dataset.price);
        const buyQty = currentQty;

        const existing = cart.find(x => x.name === pName);
        if (existing) existing.qty += buyQty;
        else cart.push({ name: pName, price: pPrice, qty: buyQty });

        updateCartUI();
        showToast(`Товар "${pName}" (${buyQty} шт) добавлен в корзину!`);
        launchConfettiCannon();
      });
    }
  });


  // ==================== HOME STAGES & CAROUSEL ====================
  const btnStartRefill = document.getElementById('btn-start-refill');
  const btnConfirmCylinder = document.getElementById('btn-confirm-cylinder');
  const btnGotoPayment = document.getElementById('btn-goto-payment');
  const btnSubmitOrder = document.getElementById('btn-submit-order');
  const btnNewOrderReset = document.getElementById('btn-new-order-reset');

  const homeStages = {
    initial: document.getElementById('home-stage-initial'),
    select: document.getElementById('home-stage-select'),
    address: document.getElementById('home-stage-address'),
    payment: document.getElementById('home-stage-payment'),
    tracking: document.getElementById('home-stage-tracking')
  };

  function switchHomeStage(stageKey) {
    Object.keys(homeStages).forEach(k => {
      if (homeStages[k]) {
        homeStages[k].classList.toggle('active', k === stageKey);
      }
    });
    if (stageKey === 'address') {
      if (savedAddresses && savedAddresses.length > 0) {
        switchAddressSubview('list');
      } else {
        switchAddressSubview('form');
      }
    }
  }

  let isHomeRefueling = false;

  // Step 1: Animate hose connection, then open cylinder selection
  function runHomeRigDockingAnimation() {
    if (isHomeRefueling) return;
    isHomeRefueling = true;

    const rig = document.getElementById('hose-nozzle-rig');
    const lockIndicator = document.getElementById('dock-lock-indicator');
    const statusPill = document.getElementById('refuel-live-status');
    const statusPillText = document.getElementById('refuel-status-text');
    const cylStatusText = document.getElementById('cyl-status-text');
    const cylStatusRect = document.getElementById('cyl-status-rect');

    // 1. Connection Phase (Docking nozzle to valve spout)
    if (rig) {
      rig.classList.remove('rig-idle');
      rig.classList.add('rig-docked');
    }
    if (statusPill) statusPill.className = 'refuel-status-pill active-fueling';
    if (statusPillText) statusPillText.textContent = 'Подключение шланга...';
    if (cylStatusText) {
      cylStatusText.textContent = 'СТЫКОВКА...';
      cylStatusText.setAttribute('fill', '#00f2fe');
    }
    if (cylStatusRect) cylStatusRect.setAttribute('stroke', '#00f2fe');

    setTimeout(() => {
      // 2. Lock & Connected state
      if (lockIndicator) lockIndicator.setAttribute('fill', '#00e676');
      if (statusPillText) statusPillText.textContent = 'Шланг подключен ✓';
      if (cylStatusText) {
        cylStatusText.textContent = 'ПОДКЛЮЧЕНО';
        cylStatusText.setAttribute('fill', '#00e676');
      }
      if (cylStatusRect) cylStatusRect.setAttribute('stroke', '#00e676');
      showToast('🔌 Шланг подключен! Выберите размер баллона');

      // 3. Move to cylinder selection stage
      setTimeout(() => {
        switchHomeStage('select');
      }, 450);
    }, 700);
  }

  btnStartRefill.addEventListener('click', () => {
    if (!isAuth) {
      redirectToAuth("🔒 Для оформления заправки баллона войдите в аккаунт");
      return;
    }
    runHomeRigDockingAnimation();
  });

  // Carousel
  const carouselTrack = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const carouselCards = document.querySelectorAll('.carousel-card');
  let currentCarouselIdx = 0;

  function updateCarousel() {
    carouselTrack.style.transform = `translateX(-${currentCarouselIdx * 100}%)`;
    carouselCards.forEach((c, i) => c.classList.toggle('active', i === currentCarouselIdx));
    
    const activeCard = carouselCards[currentCarouselIdx];
    selectedCylinder = {
      type: activeCard.dataset.type,
      price: parseInt(activeCard.dataset.price),
      wholesalePrice: parseInt(activeCard.dataset.wholesale),
      name: activeCard.querySelector('h3').textContent
    };
    updateQuantityAndWholesaleState();
  }

  prevBtn.addEventListener('click', () => {
    if (currentCarouselIdx > 0) { currentCarouselIdx--; updateCarousel(); }
  });
  nextBtn.addEventListener('click', () => {
    if (currentCarouselIdx < carouselCards.length - 1) { currentCarouselIdx++; updateCarousel(); }
  });

  carouselCards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      currentCarouselIdx = idx;
      updateCarousel();
    });
  });

  // Step 2: After cylinder is selected, return to main cylinder and continue 1st animation
  btnConfirmCylinder.addEventListener('click', () => {
    switchHomeStage('initial');
    if (btnStartRefill) btnStartRefill.style.display = 'none';
    continueGasFillingOnRig();
  });

  function continueGasFillingOnRig() {
    const gasStream = document.getElementById('gas-flow-stream');
    const fillRect = document.getElementById('svg-gas-fill-rect');
    const wavePath = document.getElementById('svg-gas-wave-path');
    const statusPill = document.getElementById('refuel-live-status');
    const statusPillText = document.getElementById('refuel-status-text');
    const cylStatusText = document.getElementById('cyl-status-text');
    const cylStatusRect = document.getElementById('cyl-status-rect');

    if (statusPill) statusPill.className = 'refuel-status-pill active-fueling';
    if (statusPillText) statusPillText.textContent = `Заправка СУГ: 0% • ${selectedCylinder.name}`;
    if (gasStream) gasStream.classList.add('active-flow');
    if (wavePath) {
      wavePath.classList.add('active');
      wavePath.setAttribute('opacity', '0.85');
    }
    if (fillRect) {
      fillRect.setAttribute('opacity', '0.7');
    }
    if (cylStatusText) {
      cylStatusText.textContent = 'ЗАПРАВКА 0%';
      cylStatusText.setAttribute('fill', '#00f2fe');
    }
    if (cylStatusRect) cylStatusRect.setAttribute('stroke', '#00f2fe');

    playGasFillingAudio();
    showToast(`⛽ Заправка: ${selectedCylinder.name} (${cylinderQuantity} шт)...`);

    let percent = 0;
    const fillInterval = setInterval(() => {
      percent += 2;
      const currentHeight = (percent / 100) * 190;
      const currentY = 325 - currentHeight;
      if (fillRect) {
        fillRect.setAttribute('height', currentHeight);
        fillRect.setAttribute('y', currentY);
      }
      if (wavePath) {
        wavePath.setAttribute('transform', `translate(0, ${-currentHeight})`);
      }

      if (cylStatusText) cylStatusText.textContent = `ЗАПРАВКА ${percent}%`;
      if (statusPillText) statusPillText.textContent = `Заправка: ${percent}% • ${selectedCylinder.name}`;
      updateAudioPitch(percent);

      if (percent >= 100) {
        clearInterval(fillInterval);
        stopGasFillingAudio();
        if (gasStream) gasStream.classList.remove('active-flow');
        if (wavePath) wavePath.classList.remove('active');

        // Complete filling
        if (statusPill) statusPill.className = 'refuel-status-pill success-fueling';
        if (statusPillText) statusPillText.textContent = `✓ ${selectedCylinder.name} заправлен на 100%`;
        if (cylStatusText) {
          cylStatusText.textContent = '✓ 100% ЗАПРАВЛЕН';
          cylStatusText.setAttribute('fill', '#00e676');
        }
        if (cylStatusRect) cylStatusRect.setAttribute('stroke', '#00e676');
        launchConfettiCannon();
        showToast(`🎉 Баллон ${selectedCylinder.name} (${cylinderQuantity} шт) успешно заправлен!`);

        setTimeout(() => {
          isHomeRefueling = false;
          renderAddressOptions();
          switchHomeStage('address');
        }, 1200);
      }
    }, 35);
  }

  // Address selection state & subviews
  let selectedAddressTag = { title: 'Дом', icon: '🏠' };

  function switchAddressSubview(subviewKey) {
    const viewList = document.getElementById('address-view-list');
    const viewForm = document.getElementById('address-view-form');
    if (!viewList || !viewForm) return;

    if (subviewKey === 'list') {
      viewList.style.display = 'flex';
      viewForm.style.display = 'none';
      renderAddressOptions();
    } else {
      viewList.style.display = 'none';
      viewForm.style.display = 'flex';
      setTimeout(() => {
        initOrRefreshEmbeddedAddressMap();
      }, 150);
    }
  }

  function renderAddressOptions() {
    const container = document.getElementById('address-options-container');
    const emptyState = document.getElementById('address-empty-state');
    const bottomAction = document.getElementById('saved-address-bottom-action');

    if (!savedAddresses || savedAddresses.length === 0) {
      if (emptyState) emptyState.style.display = 'flex';
      if (container) container.innerHTML = '';
      if (bottomAction) bottomAction.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (bottomAction) bottomAction.style.display = 'block';

    if (!selectedAddress && savedAddresses.length > 0) {
      selectedAddress = savedAddresses[0].text;
    }

    container.innerHTML = savedAddresses.map((addr, idx) => {
      const isActive = selectedAddress === addr.text || (!selectedAddress && idx === 0);
      if (isActive) selectedAddress = addr.text;
      return `
        <div class="address-option ${isActive ? 'active' : ''}" data-address="${addr.text}">
          <div class="radio-circle"></div>
          <div class="address-text">
            <h4>${addr.icon} <span>${addr.title}</span></h4>
            <p>${addr.text}</p>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.address-option').forEach(opt => {
      opt.addEventListener('click', () => {
        container.querySelectorAll('.address-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        selectedAddress = opt.dataset.address;
      });
    });
  }

  // Button to open "Add new address" form view
  const btnShowAddAddress = document.getElementById('btn-show-add-address');
  if (btnShowAddAddress) {
    btnShowAddAddress.addEventListener('click', () => {
      switchAddressSubview('form');
    });
  }

  // Button to go back to saved addresses list
  const btnBackToSavedAddresses = document.getElementById('btn-back-to-saved-addresses');
  if (btnBackToSavedAddresses) {
    btnBackToSavedAddresses.addEventListener('click', () => {
      switchAddressSubview('list');
    });
  }

  // Tag chips in address form (🏠 Дом, 🏡 Дача, 🏢 Работа, 📍 Другое)
  const tagChips = document.querySelectorAll('#address-tag-chips .tag-chip');
  tagChips.forEach(chip => {
    chip.addEventListener('click', () => {
      tagChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedAddressTag = {
        title: chip.dataset.title || 'Адрес',
        icon: chip.dataset.icon || '📍'
      };
    });
  });

  // ==================== EMBEDDED DIRECT PINPOINT ADDRESS MAP ====================
  let embeddedAddressMap = null;
  let embeddedAddressMarker = null;
  let currentPickedLocation = {
    lat: 41.2995,
    lng: 69.2401,
    address: 'г. Ташкент, ул. Амира Темура'
  };

  const tashkentDistricts = [
    { name: 'Мирзо-Улугбекский р-н, ул. Мустакиллик', lat: 41.3150, lng: 69.2850 },
    { name: 'Юнусабадский р-н, ул. Амира Темура', lat: 41.3500, lng: 69.2800 },
    { name: 'Чиланзарский р-н, пр-т Бунёдкор', lat: 41.2750, lng: 69.2000 },
    { name: 'Яккасарайский р-н, ул. Шота Руставели', lat: 41.2850, lng: 69.2550 },
    { name: 'Шайхантахурский р-н, ул. Навои', lat: 41.3200, lng: 69.2400 },
    { name: 'Сергелийский р-н, ул. Янги Сергели', lat: 41.2200, lng: 69.2200 },
    { name: 'Яшнабадский р-н, ул. Махтумкули', lat: 41.3000, lng: 69.3200 },
    { name: 'Учтепинский р-н, ул. Лутфий', lat: 41.2800, lng: 69.1700 },
    { name: 'Алмазарский р-н, ул. Фаробий', lat: 41.3400, lng: 69.2100 },
    { name: 'Бектемирский р-н, ул. Хусейн Байкаро', lat: 41.2300, lng: 69.3300 }
  ];

  function getTashkentFriendlyAddress(lat, lng) {
    let closest = tashkentDistricts[0];
    let minDist = 999999;
    tashkentDistricts.forEach(d => {
      const dist = Math.hypot(d.lat - lat, d.lng - lng);
      if (dist < minDist) {
        minDist = dist;
        closest = d;
      }
    });
    return `г. Ташкент, ${closest.name} (GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }

  function initOrRefreshEmbeddedAddressMap() {
    const mapContainer = document.getElementById('embedded-address-map');
    if (!mapContainer) return;

    if (!embeddedAddressMap) {
      embeddedAddressMap = L.map('embedded-address-map', {
        zoomControl: false,
        attributionControl: false
      }).setView([currentPickedLocation.lat, currentPickedLocation.lng], 13);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(embeddedAddressMap);

      const pinIcon = L.divIcon({
        className: 'custom-map-pin',
        html: '<div style="background:#ff6b00; color:#fff; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 15px rgba(255,107,0,0.85); border:2px solid #fff; font-size:15px; cursor:pointer;"><i class="fa-solid fa-location-dot"></i></div>',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      embeddedAddressMarker = L.marker([currentPickedLocation.lat, currentPickedLocation.lng], { icon: pinIcon, draggable: true }).addTo(embeddedAddressMap);

      function updatePickedPosition(latlng) {
        embeddedAddressMarker.setLatLng(latlng);
        const friendlyAddr = getTashkentFriendlyAddress(latlng.lat, latlng.lng);
        currentPickedLocation = {
          lat: latlng.lat,
          lng: latlng.lng,
          address: friendlyAddr
        };
        
        const inputCustom = document.getElementById('input-custom-address');
        if (inputCustom) inputCustom.value = friendlyAddr;

        const hintText = document.getElementById('embedded-map-status-text');
        if (hintText) hintText.textContent = `📍 ${friendlyAddr}`;
      }

      embeddedAddressMap.on('click', (e) => {
        updatePickedPosition(e.latlng);
      });

      embeddedAddressMarker.on('dragend', (e) => {
        updatePickedPosition(e.target.getLatLng());
      });

      const btnGps = document.getElementById('btn-embedded-map-gps');
      if (btnGps) {
        btnGps.addEventListener('click', (e) => {
          e.stopPropagation();
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                embeddedAddressMap.setView([lat, lng], 15);
                updatePickedPosition({ lat, lng });
                showToast("📍 Ваше местоположение определено!");
              },
              () => {
                showToast("Используется центр Ташкента");
              }
            );
          } else {
            showToast("GPS недоступен в браузере");
          }
        });
      }
    } else {
      embeddedAddressMap.invalidateSize();
    }
  }

  // Save new address from form and proceed directly to payment
  const btnSaveAndUseAddress = document.getElementById('btn-save-and-use-address');
  if (btnSaveAndUseAddress) {
    btnSaveAndUseAddress.addEventListener('click', () => {
      const inputCustom = document.getElementById('input-custom-address');
      const addrText = inputCustom ? inputCustom.value.trim() : '';
      const finalAddress = addrText || currentPickedLocation.address;

      if (!finalAddress) {
        showToast("Укажите адрес на карте или введите текст!");
        return;
      }

      // Add to saved addresses list
      savedAddresses.push({
        title: selectedAddressTag.title,
        text: finalAddress,
        icon: selectedAddressTag.icon
      });

      selectedAddress = finalAddress;

      const accCount = document.getElementById('acc-addresses-count');
      if (accCount) accCount.textContent = `${savedAddresses.length} адресов доставки`;

      showToast(`📍 Адрес "${selectedAddressTag.title}" сохранен!`);

      // Switch to payment stage
      const unitPrice = isWholesale ? selectedCylinder.wholesalePrice : selectedCylinder.price;
      const totalPrice = unitPrice * cylinderQuantity;

      document.getElementById('summary-cyl-type').textContent = `Заправка: ${selectedCylinder.name} (${cylinderQuantity} шт)`;
      document.getElementById('summary-cyl-price').textContent = `${totalPrice.toLocaleString()} UZS`;
      document.getElementById('summary-total-price').textContent = `${totalPrice.toLocaleString()} UZS`;

      switchHomeStage('payment');
    });
  }

  btnGotoPayment.addEventListener('click', () => {
    const customAddr = document.getElementById('input-custom-address').value.trim();
    if (customAddr) selectedAddress = customAddr;

    const unitPrice = isWholesale ? selectedCylinder.wholesalePrice : selectedCylinder.price;
    const totalPrice = unitPrice * cylinderQuantity;

    document.getElementById('summary-cyl-type').textContent = `Заправка: ${selectedCylinder.name} (${cylinderQuantity} шт)`;
    document.getElementById('summary-cyl-price').textContent = `${totalPrice.toLocaleString()} UZS`;
    document.getElementById('summary-total-price').textContent = `${totalPrice.toLocaleString()} UZS`;

    switchHomeStage('payment');
  });

  const paymentMethods = document.querySelectorAll('.methods .method');
  const b2bInnContainer = document.getElementById('b2b-inn-container');
  const inputCompanyInn = document.getElementById('input-company-inn');
  const innBadgeStatus = document.getElementById('inn-badge-status');

  if (inputCompanyInn && innBadgeStatus) {
    inputCompanyInn.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 9);
      e.target.value = val;
      if (val.length === 9) {
        innBadgeStatus.textContent = '✓ 9/9';
        innBadgeStatus.classList.add('valid');
      } else {
        innBadgeStatus.textContent = `${val.length}/9`;
        innBadgeStatus.classList.remove('valid');
      }
    });
  }

  paymentMethods.forEach(pm => {
    pm.addEventListener('click', () => {
      paymentMethods.forEach(p => p.classList.remove('selected'));
      pm.classList.add('selected');
      selectedPayment = pm.dataset.method;
      if (b2bInnContainer) {
        b2bInnContainer.style.display = selectedPayment === 'b2b_invoice' ? 'block' : 'none';
      }
    });
  });

  btnSubmitOrder.addEventListener('click', () => {
    if (selectedPayment === 'b2b_invoice') {
      companyInn = document.getElementById('input-company-inn').value.trim();
      if (companyInn.length < 9) {
        showToast("Введите 9-значный ИНН компании!");
        return;
      }
    }

    switchHomeStage('tracking');
    startCountdownTimer(25 * 60);
    initTrackingMiniMap();
    launchConfettiCannon();

    const unitPrice = isWholesale ? selectedCylinder.wholesalePrice : selectedCylinder.price;
    orderHistory.unshift({
      code: `LPG-${Math.floor(1000 + Math.random() * 9000)}`,
      date: 'Сегодня',
      title: `Заправка: ${selectedCylinder.name} (${cylinderQuantity} шт)`,
      price: unitPrice * cylinderQuantity,
      status: 'В пути'
    });
  });

  function startCountdownTimer(seconds) {
    if (countdownTimerInterval) clearInterval(countdownTimerInterval);
    const timerDisplay = document.getElementById('order-countdown-timer');

    let rem = seconds;
    countdownTimerInterval = setInterval(() => {
      const mins = Math.floor(rem / 60);
      const secs = rem % 60;
      timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      rem--;
      if (rem < 0) clearInterval(countdownTimerInterval);
    }, 1000);
  }

  function resetCylinderRigState() {
    isHomeRefueling = false;
    const rig = document.getElementById('hose-nozzle-rig');
    const lockIndicator = document.getElementById('dock-lock-indicator');
    const gasStream = document.getElementById('gas-flow-stream');
    const fillRect = document.getElementById('svg-gas-fill-rect');
    const wavePath = document.getElementById('svg-gas-wave-path');
    const statusPill = document.getElementById('refuel-live-status');
    const statusPillText = document.getElementById('refuel-status-text');
    const cylStatusText = document.getElementById('cyl-status-text');
    const cylStatusRect = document.getElementById('cyl-status-rect');

    if (rig) {
      rig.classList.remove('rig-docked');
      rig.classList.add('rig-idle');
    }
    if (lockIndicator) lockIndicator.setAttribute('fill', '#ef4444');
    if (gasStream) gasStream.classList.remove('active-flow');
    if (fillRect) {
      fillRect.setAttribute('height', 0);
      fillRect.setAttribute('y', 325);
      fillRect.setAttribute('opacity', 0);
    }
    if (wavePath) {
      wavePath.setAttribute('transform', 'translate(0, 0)');
      wavePath.setAttribute('opacity', 0);
      wavePath.classList.remove('active');
    }
    if (statusPill) statusPill.className = 'refuel-status-pill';
    if (statusPillText) statusPillText.textContent = 'Баллон готов к заправке';
    if (cylStatusText) {
      cylStatusText.textContent = 'ПУСТОЙ 0%';
      cylStatusText.setAttribute('fill', '#ef4444');
    }
    if (cylStatusRect) cylStatusRect.setAttribute('stroke', '#ef4444');
    if (btnStartRefill) btnStartRefill.style.display = '';
  }

  btnNewOrderReset.addEventListener('click', () => {
    if (countdownTimerInterval) clearInterval(countdownTimerInterval);
    if (trackingCourierInterval) clearInterval(trackingCourierInterval);
    resetCylinderRigState();
    switchHomeStage('initial');
  });

  document.getElementById('btn-call-courier').addEventListener('click', () => {
    showToast("Звонок курьеру Фарходу (+998 97 777-77-77)...");
  });

  // Fiscal Receipt Trigger
  document.getElementById('btn-view-receipt').addEventListener('click', () => {
    const unitPrice = isWholesale ? selectedCylinder.wholesalePrice : selectedCylinder.price;
    const totalPrice = unitPrice * cylinderQuantity;

    document.getElementById('rec-code').textContent = `LPG-${Math.floor(1000 + Math.random() * 9000)}`;
    document.getElementById('rec-item').textContent = `${selectedCylinder.name} x ${cylinderQuantity} шт`;
    document.getElementById('rec-total').textContent = `${totalPrice.toLocaleString()} UZS`;
    openModal('modal-receipt');
  });

  // Animated Tracking Map
  function initTrackingMiniMap() {
    if (trackingCourierInterval) clearInterval(trackingCourierInterval);
    const container = document.getElementById('tracking-map-container');
    container.innerHTML = '';
    const tMap = L.map('tracking-map-container', { zoomControl: false }).setView([41.2920, 69.2200], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(tMap);

    L.circleMarker([41.2995, 69.2401], { color: '#ef4444', fillColor: '#ffffff', fillOpacity: 1, radius: 8 }).addTo(tMap).bindPopup("Ваш адрес");

    let courierLat = 41.2850;
    let courierLng = 69.2050;
    const destLat = 41.2995;
    const destLng = 69.2401;

    const courierMarker = L.marker([courierLat, courierLng]).addTo(tMap).bindPopup("🚚 Курьер Фарход");
    const routeLine = L.polyline([[courierLat, courierLng], [destLat, destLng]], { color: '#ef4444', weight: 4, dashArray: '6, 8' }).addTo(tMap);
    tMap.fitBounds(routeLine.getBounds(), { padding: [20, 20] });

    trackingCourierInterval = setInterval(() => {
      courierLat += (destLat - courierLat) * 0.05;
      courierLng += (destLng - courierLng) * 0.05;
      courierMarker.setLatLng([courierLat, courierLng]);
      routeLine.setLatLngs([[courierLat, courierLng], [destLat, destLng]]);
    }, 400);
  }


  // ==================== MAP SCREEN (LEAFLET.JS) ====================
  let mapInitialized = false;
  let mainMap = null;

  function initLeafletMap() {
    mapInitialized = true;
    mainMap = L.map('interactive-map').setView([41.2995, 69.2401], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(mainMap);

    const stations = [
      { name: "🔥 АГЗС #1 Poytug GNS — Чиланзар", lat: 41.2850, lng: 69.2050, addr: "Ташкент, ул. Катартал, 28", price: "3 800 UZS / л" },
      { name: "🔥 АГЗС #2 Poytug GNS — Сергели", lat: 41.2210, lng: 69.2230, addr: "Ташкент, Сергели 4, АГЗС-2", price: "3 750 UZS / л" },
      { name: "🔥 АГЗС #3 Poytug GNS — Юнусабад", lat: 41.3520, lng: 69.2890, addr: "Ташкент, Юнусабад 12-квартал", price: "3 850 UZS / л" }
    ];

    stations.forEach(st => {
      const marker = L.marker([st.lat, st.lng]).addTo(mainMap);
      marker.on('click', () => {
        document.getElementById('station-name-display').textContent = st.name;
        document.getElementById('station-address-display').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${st.addr}`;
        document.getElementById('station-price-display').textContent = st.price;
      });
    });

    const userMarker = L.circleMarker([41.2995, 69.2401], { color: '#ef4444', fillColor: '#ffffff', fillOpacity: 1, radius: 9 }).addTo(mainMap);
    userMarker.bindPopup("<b>Вы здесь</b>").openPopup();

    document.getElementById('btn-build-route').addEventListener('click', () => {
      L.polyline([[41.2995, 69.2401], [41.2850, 69.2050]], { color: '#ef4444', weight: 5 }).addTo(mainMap);
      showToast("Маршрут построен!");
    });

    document.getElementById('btn-order-from-station').addEventListener('click', () => {
      showToast("Выбрана заправка с АГЗС #1 Чиланзар");
      navItems[0].click();
      btnStartRefill.click();
    });

    document.getElementById('btn-map-locate-me').addEventListener('click', () => {
      mainMap.setView([41.2995, 69.2401], 15);
      showToast("Геолокация определена!");
    });
  }


  // ==================== SHOPPING CART ENGINE ====================
  const btnOpenCart = document.getElementById('btn-open-cart');
  const cartBadgeCount = document.getElementById('cart-badge-count');

  function updateCartUI() {
    localStorage.setItem('lpg_cart', JSON.stringify(cart));
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartBadgeCount) cartBadgeCount.textContent = totalCount;

    const modalCart = document.getElementById('modal-cart');
    const list = document.getElementById('cart-items-list');
    const emptyState = document.getElementById('cart-empty-state');
    const browseBtn = document.getElementById('btn-cart-browse');
    const checkoutBtn = document.getElementById('btn-cart-checkout');
    const promoInput = document.getElementById('input-promocode');
    const promoBtn = document.getElementById('btn-apply-promo');
    const totalAmountEl = document.getElementById('cart-total-amount');

    const isEmpty = cart.length === 0;

    if (modalCart) {
      modalCart.classList.toggle('empty-mode', isEmpty);
    }

    if (emptyState) emptyState.style.display = isEmpty ? 'flex' : 'none';
    if (list) list.style.display = isEmpty ? 'none' : 'flex';
    if (browseBtn) browseBtn.style.display = isEmpty ? 'flex' : 'none';
    if (checkoutBtn) checkoutBtn.disabled = isEmpty;
    if (promoInput) promoInput.disabled = isEmpty;
    if (promoBtn) promoBtn.disabled = isEmpty;

    if (!isEmpty && list) {
      list.innerHTML = cart.map((item, i) => `
        <div class="item">
          <span class="name">${item.name}</span>
          <div class="stepper">
            <button type="button" onclick="changeQty(${i}, -1)">−</button>
            <span>${item.qty}</span>
            <button type="button" onclick="changeQty(${i}, 1)">+</button>
          </div>
          <span class="price">${(item.price * item.qty).toLocaleString().replace(/,/g, ' ')}</span>
        </div>
      `).join('');
    }

    let rawTotal = isEmpty ? 0 : cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let finalTotal = Math.round(rawTotal * (1 - appliedPromoDiscount / 100));
    if (totalAmountEl) totalAmountEl.textContent = `${finalTotal.toLocaleString().replace(/,/g, ' ')} UZS`;
  }

  window.changeQty = function(idx, delta) {
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    updateCartUI();
  };

  btnOpenCart.addEventListener('click', () => {
    updateCartUI();
    openModal('modal-cart');
  });

  const btnCartBrowse = document.getElementById('btn-cart-browse');
  if (btnCartBrowse) {
    btnCartBrowse.addEventListener('click', () => {
      closeModal('modal-cart');
      switchScreen('screen-store');
    });
  }

  document.getElementById('btn-apply-promo').addEventListener('click', () => {
    const code = document.getElementById('input-promocode').value.trim().toUpperCase();
    if (code === 'GAS2026') {
      appliedPromoDiscount = 10;
      showToast("Промокод применен! Скидка 10%");
      updateCartUI();
    } else {
      showToast("Неверный промокод");
    }
  });

  document.getElementById('btn-cart-checkout').addEventListener('click', () => {
    if (!isAuth) {
      redirectToAuth("🔒 Для оформления покупки из корзины войдите в аккаунт");
      return;
    }
    if (cart.length === 0) {
      showToast("Корзина пуста!");
      return;
    }
    closeModal('modal-cart');
    cart = [];
    updateCartUI();
    launchConfettiCannon();
    showToast("Покупка успешно оформлена!");
  });


  // ==================== CARDS & ADDRESSES ====================
  document.getElementById('btn-acc-cards').addEventListener('click', () => {
    renderCards();
    openModal('modal-cards');
  });

  function renderCards() {
    const wrapper = document.getElementById('cards-list-wrapper');
    wrapper.innerHTML = savedCards.map(c => `
      <div class="account-card-item" style="margin-bottom:8px;">
        <div class="acc-icon blue-bg"><i class="fa-solid fa-credit-card"></i></div>
        <div class="acc-text">
          <h4>${c.type} (${c.exp})</h4>
          <p>${c.pan}</p>
        </div>
      </div>
    `).join('');
  }

  const inputCardNum = document.getElementById('input-card-number');
  const inputCardExp = document.getElementById('input-card-expiry');
  const previewNum = document.getElementById('preview-card-number');
  const previewExp = document.getElementById('preview-card-expiry');
  const previewLogo = document.getElementById('preview-card-logo');

  inputCardNum.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.startsWith('8600')) previewLogo.textContent = 'Uzcard';
    else if (val.startsWith('9860')) previewLogo.textContent = 'Humo';
    else previewLogo.textContent = 'Visa';

    previewNum.textContent = val.replace(/(.{4})/g, '$1 ').trim() || '8600 •••• •••• ••••';
  });

  inputCardExp.addEventListener('input', (e) => {
    previewExp.textContent = e.target.value || '12/28';
  });

  document.getElementById('btn-save-new-card').addEventListener('click', () => {
    const rawPan = inputCardNum.value.replace(/\D/g, '');
    if (rawPan.length < 16) {
      showToast("Введите корректный 16-значный номер карты!");
      return;
    }
    const masked = `${rawPan.substring(0, 4)} •••• •••• ${rawPan.substring(12)}`;
    savedCards.push({ type: previewLogo.textContent.toUpperCase(), pan: masked, exp: inputCardExp.value || '12/28' });
    renderCards();
    document.getElementById('acc-cards-preview').textContent = `${savedCards.length} привязанные карты`;
    showToast("Карта успешно привязана!");
    inputCardNum.value = '';
    inputCardExp.value = '';
  });

  document.getElementById('btn-acc-addresses').addEventListener('click', () => {
    renderAddressManager();
    openModal('modal-addresses');
  });

  function renderAddressManager() {
    const list = document.getElementById('address-manager-list');
    list.innerHTML = savedAddresses.map(a => `
      <div class="account-card-item" style="margin-bottom:8px;">
        <div class="acc-icon green-bg">${a.icon}</div>
        <div class="acc-text">
          <h4>${a.title}</h4>
          <p>${a.text}</p>
        </div>
      </div>
    `).join('');
  }

  document.getElementById('btn-save-new-address').addEventListener('click', () => {
    const title = document.getElementById('input-new-addr-title').value.trim();
    const text = document.getElementById('input-new-addr-text').value.trim();
    if (!text) {
      showToast("Введите адрес!");
      return;
    }
    savedAddresses.push({ title: title || 'Другой адрес', text: text, icon: '📍' });
    renderAddressManager();
    document.getElementById('acc-addresses-count').textContent = `${savedAddresses.length} адресов доставки`;
    showToast("Адрес добавлен!");
  });


  // ==================== HISTORY & SUPPORT CHAT ====================
  document.getElementById('btn-acc-history').addEventListener('click', () => {
    renderHistory();
    openModal('modal-history');
  });

  function renderHistory() {
    const list = document.getElementById('history-items-list');
    list.innerHTML = orderHistory.map(h => `
      <div class="account-card-item" style="margin-bottom:8px;">
        <div class="acc-icon orange-bg"><i class="fa-solid fa-gas-pump"></i></div>
        <div class="acc-text">
          <h4>${h.title} (${h.code})</h4>
          <p>${h.date} • <span style="color:#00e676;">${h.status}</span></p>
        </div>
        <strong>${h.price.toLocaleString()} UZS</strong>
      </div>
    `).join('');
  }

  // Support Chat
  const btnSendSupport = document.getElementById('btn-send-support');
  const inputSupportMsg = document.getElementById('input-support-msg');
  const chatMessages = document.getElementById('support-chat-messages');

  function sendSupportMsg() {
    const msg = inputSupportMsg.value.trim();
    if (!msg) return;

    chatMessages.innerHTML += `<div class="chat-msg user">${msg}</div>`;
    inputSupportMsg.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    setTimeout(() => {
      chatMessages.innerHTML += `<div class="chat-msg bot">Оператор приняла ваш запрос по заказу. Мы свяжемся с вами в течение 2 минут!</div>`;
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
  }

  btnSendSupport.addEventListener('click', sendSupportMsg);
  inputSupportMsg.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendSupportMsg();
  });


  // ==================== SETTINGS TOGGLES ====================
  document.getElementById('toggle-sound-fx').addEventListener('change', (e) => {
    soundFxEnabled = e.target.checked;
    localStorage.setItem('lpg_sound', soundFxEnabled);
    showToast(soundFxEnabled ? "Звуковые эффекты включены" : "Звуковые эффекты выключены");
  });

  document.getElementById('toggle-dark-theme').addEventListener('change', (e) => {
    isDarkMode = e.target.checked;
    localStorage.setItem('lpg_dark', isDarkMode);
    document.body.classList.toggle('theme-light', !isDarkMode);
    showToast(isDarkMode ? "Включена тёмная тема" : "Включена светлая тема");
  });


  // ==================== UTILS: MODALS & TOAST ====================
  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  }

  document.querySelectorAll('.modal-close, [data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.close;
      closeModal(modalId);
    });
  });

  // Close modals on clicking outside the modal content
  document.querySelectorAll('.modal-backdrop').forEach(bd => {
    bd.addEventListener('click', (e) => {
      if (e.target === bd) {
        bd.classList.remove('active');
      }
    });
  });

  // Keyboard accessibility: ESC closes any open modal or side drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.active').forEach(m => m.classList.remove('active'));
      const sideDrawer = document.getElementById('side-drawer');
      const menuBackdrop = document.getElementById('menu-backdrop');
      if (sideDrawer) sideDrawer.classList.remove('active');
      if (menuBackdrop) menuBackdrop.classList.remove('active');
    }
  });

  function showToast(msg) {
    const toast = document.getElementById('toast-notif');
    const toastText = document.getElementById('toast-text');
    toastText.textContent = msg;
    toast.classList.add('active');
    setTimeout(() => {
      toast.classList.remove('active');
    }, 2800);
  }

});
