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

  let selectedCylinder = { type: '20kg', price: 75000, wholesalePrice: 65000, name: 'Баллон 20 КГ' };
  let selectedAddress = 'г. Ташкент, ул. Амира Темура, 45, кв. 12';
  let selectedPayment = 'cash';
  let companyInn = '';
  let countdownTimerInterval = null;
  let trackingCourierInterval = null;

  let cart = JSON.parse(localStorage.getItem('lpg_cart') || '[]');
  let appliedPromoDiscount = 0;

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
      addressSelectSub: "Укажите куда привезти заправленный баллон",
      addrHome: "Дом",
      addrDacha: "Дача / Частный дом",
      customAddressLabel: "Или введите другой адрес:",
      btnProceedPayment: "Перейти к оплате",
      paymentTitle: "Оплата заказа",
      paymentSub: "Выберите удобный способ оплаты",
      deliveryFee: "Доставка до двери",
      free: "БЕСПЛАТНО",
      totalToPay: "Итого к оплате:",
      payCash: "Наличными при получении",
      payCashSub: "Оплата курьеру при передаче баллона",
      payOnlineFast: "Быстрая онлайн-оплата в 1 клик",
      payUzcardHumo: "Оплата картами Uzcard / Humo",
      payOnline: "Электронный кошелек / Рассрочка",
      btnConfirmOrder: "Подтвердить и Оплатить",
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
      addressSelectSub: "To'ldirilgan ballonni qayerga olib boraylik",
      addrHome: "Uy",
      addrDacha: "Dala hovli",
      customAddressLabel: "Yoki boshqa manzil kiriting:",
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
      addressSelectSub: "Where should we deliver your refilled cylinder?",
      addrHome: "Home",
      addrDacha: "Summer House",
      customAddressLabel: "Or enter another address:",
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
      btn.classList.toggle('active', btn.dataset.lang === lang);
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
      setLanguage(btn.dataset.lang);
      showToast(`Language: ${btn.dataset.lang.toUpperCase()}`);
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
    const colors = ['#ff6b00', '#00f2fe', '#00e676', '#ffb703', '#8b5cf6'];

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

  function switchAuthTab(tab) {
    const isLogin = tab === 'login';
    tabAuthLogin.classList.toggle('active', isLogin);
    tabAuthRegister.classList.toggle('active', !isLogin);
    modeLogin.classList.toggle('active', isLogin);
    modeRegister.classList.toggle('active', !isLogin);

    if (isLogin) {
      document.getElementById('login-step-credentials').classList.add('active');
      document.getElementById('login-step-otp').classList.remove('active');
      authMainTitle.textContent = translations[currentLang].auth2faTitle || "Вход";
      if (authMainSub) authMainSub.textContent = "";
    } else {
      document.getElementById('register-step-form').classList.add('active');
      document.getElementById('register-step-otp').classList.remove('active');
      authMainTitle.textContent = translations[currentLang].tabRegister || "Регистрация";
      if (authMainSub) authMainSub.textContent = "";
    }
  }

  tabAuthLogin.addEventListener('click', () => switchAuthTab('login'));
  tabAuthRegister.addEventListener('click', () => switchAuthTab('register'));

  // Password Visibility Toggles
  const btnToggleLoginPwd = document.getElementById('btn-toggle-login-pwd');
  const inputLoginPwd = document.getElementById('input-login-password');
  btnToggleLoginPwd.addEventListener('click', () => {
    const isPwd = inputLoginPwd.type === 'password';
    inputLoginPwd.type = isPwd ? 'text' : 'password';
    btnToggleLoginPwd.innerHTML = isPwd ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
  });

  const btnToggleRegPwd = document.getElementById('btn-toggle-reg-pwd');
  const inputRegPwd = document.getElementById('input-reg-password');
  btnToggleRegPwd.addEventListener('click', () => {
    const isPwd = inputRegPwd.type === 'password';
    inputRegPwd.type = isPwd ? 'text' : 'password';
    btnToggleRegPwd.innerHTML = isPwd ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
  });

  // Password Strength Meter
  const pwdStrengthFill = document.getElementById('pwd-strength-fill');
  const pwdStrengthText = document.getElementById('pwd-strength-text');

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
      pwdStrengthText.style.color = "#00e676";
    }
  });

  // Enter Application Helper
  function enterApp(asGuest = false, name = "Алишер Каримов", phone = "+998 90 123-45-67") {
    document.getElementById('screen-auth').classList.remove('active');
    document.getElementById('screen-home').classList.add('active');
    
    // Hide the 'X' button on all in-app screens
    const btnCloseAuth = document.getElementById('btn-close-auth');
    if (btnCloseAuth) btnCloseAuth.style.display = 'none';

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
      showToast("Вход в гостевом режиме");
    }
    renderAddressOptions();
  }

  if (isAuth) {
    enterApp(false, currentUserName, userPhone || "+998 (90) 123-45-67");
  } else {
    const btnCloseAuth = document.getElementById('btn-close-auth');
    if (btnCloseAuth) btnCloseAuth.style.display = 'flex';
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
    if (!checkRegTerms.checked) {
      showToast("Подтвердите согласие с правилами сервиса!");
      return;
    }

    const formattedPhone = rawPhone.startsWith('+998') ? rawPhone : `+998 ${rawPhone}`;
    pendingAuthData = { name: name, phone: formattedPhone, password: password };

    displayRegPhone.textContent = formattedPhone;
    regStepForm.classList.remove('active');
    regStepOtp.classList.add('active');

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
      switchAuthTab('login');
      showToast("Вы вышли из системы");
    });
  }

  // Security 2FA Item in Profile
  const btnAccSecurity = document.getElementById('btn-acc-security');
  if (btnAccSecurity) {
    btnAccSecurity.addEventListener('click', () => {
      showToast("🛡️ Двухфакторная защита активна: Пароль + SMS OTP (100% защита)");
    });
  }


  // ==================== NAVIGATION ROUTER ====================
  const navItems = document.querySelectorAll('.nav-item');
  const screens = document.querySelectorAll('.app-screen');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetId = item.dataset.target;
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      screens.forEach(s => s.classList.toggle('active', s.id === targetId));

      if (targetId === 'screen-map' && !mapInitialized) {
        initLeafletMap();
      }
    });
  });


  // ==================== EMERGENCY 104 & SIDE DRAWER ====================
  const btnOpenEmergency = document.getElementById('btn-open-emergency');
  const btnMenuEmergency = document.getElementById('btn-menu-emergency');
  const btnCall104Direct = document.getElementById('btn-call-104-direct');

  function openEmergencyModal() {
    openModal('modal-emergency');
  }

  btnOpenEmergency.addEventListener('click', openEmergencyModal);
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
    showToast("Ваш баланс: 25 000 UZS (+2% кэшбэк за заправку)");
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
  const displayCylPrice = document.getElementById('display-cyl-price');

  function updateQuantityAndWholesaleState() {
    let qty = parseInt(inputCylQty.value) || 1;
    if (qty < 1) qty = 1;
    cylinderQuantity = qty;
    inputCylQty.value = cylinderQuantity;

    isWholesale = cylinderQuantity >= 10;
    wholesaleBadge.style.display = isWholesale ? 'block' : 'none';

    const unitPrice = isWholesale ? selectedCylinder.wholesalePrice : selectedCylinder.price;
    displayCylPrice.textContent = `${unitPrice.toLocaleString()} UZS / шт`;

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
  document.querySelectorAll('.product-card').forEach(card => {
    const btnMinus = card.querySelector('.btn-store-minus');
    const btnPlus = card.querySelector('.btn-store-plus');
    const inputQty = card.querySelector('.input-store-qty');
    const buyBtn = card.querySelector('.btn-buy-product');

    if (btnMinus && btnPlus && inputQty) {
      btnMinus.addEventListener('click', () => {
        let q = parseInt(inputQty.value) || 1;
        if (q > 1) inputQty.value = q - 1;
      });

      btnPlus.addEventListener('click', () => {
        let q = parseInt(inputQty.value) || 1;
        inputQty.value = q + 1;
      });
    }

    if (buyBtn) {
      buyBtn.addEventListener('click', () => {
        const pName = buyBtn.dataset.product;
        const pPrice = parseInt(buyBtn.dataset.price);
        const buyQty = inputQty ? (parseInt(inputQty.value) || 1) : 1;

        const existing = cart.find(x => x.name === pName);
        if (existing) existing.qty += buyQty;
        else cart.push({ name: pName, price: pPrice, qty: buyQty });

        updateCartUI();
        showToast(`Товар "${pName}" (${buyQty} шт) добавлен в корзину!`);
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
    filling: document.getElementById('home-stage-filling'),
    address: document.getElementById('home-stage-address'),
    payment: document.getElementById('home-stage-payment'),
    tracking: document.getElementById('home-stage-tracking')
  };

  function switchHomeStage(stageKey) {
    Object.keys(homeStages).forEach(k => {
      homeStages[k].classList.toggle('active', k === stageKey);
    });
  }

  let isHomeRefueling = false;

  function runHomeRigRefuelingAnimation() {
    isHomeRefueling = true;
    const rig = document.getElementById('hose-nozzle-rig');
    const lockIndicator = document.getElementById('dock-lock-indicator');
    const gasStream = document.getElementById('gas-flow-stream');
    const fillRect = document.getElementById('svg-gas-fill-rect');
    const wavePath = document.getElementById('svg-gas-wave-path');
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
    if (statusPillText) statusPillText.textContent = 'Подключение газопровода...';
    if (cylStatusText) {
      cylStatusText.textContent = 'СТЫКОВКА...';
      cylStatusText.setAttribute('fill', '#00f2fe');
    }
    if (cylStatusRect) cylStatusRect.setAttribute('stroke', '#00f2fe');

    setTimeout(() => {
      // 2. Lock & Engage Valve
      if (lockIndicator) lockIndicator.setAttribute('fill', '#00e676');
      if (statusPillText) statusPillText.textContent = 'Шланг зафиксирован • Подача СУГ';
      if (gasStream) gasStream.classList.add('active-flow');
      if (wavePath) {
        wavePath.classList.add('active');
        wavePath.setAttribute('opacity', '0.85');
      }
      if (fillRect) {
        fillRect.setAttribute('opacity', '0.7');
      }
      playGasFillingAudio();
      showToast('🔌 Газопровод подключен к штуцеру! Наполнение...');

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
        updateAudioPitch(percent);

        if (percent >= 100) {
          clearInterval(fillInterval);
          stopGasFillingAudio();
          if (gasStream) gasStream.classList.remove('active-flow');
          if (wavePath) wavePath.classList.remove('active');

          // 3. Complete
          if (statusPill) statusPill.className = 'refuel-status-pill success-fueling';
          if (statusPillText) statusPillText.textContent = '✓ Баллон заправлен на 100%';
          if (cylStatusText) {
            cylStatusText.textContent = '✓ 100% ЗАПРАВЛЕН';
            cylStatusText.setAttribute('fill', '#00e676');
          }
          if (cylStatusRect) cylStatusRect.setAttribute('stroke', '#00e676');
          launchConfettiCannon();
          showToast('🎉 Баллон успешно заправлен (50L / 16.0 bar)!');

          setTimeout(() => {
            isHomeRefueling = false;
            switchHomeStage('select');
          }, 1400);
        }
      }, 40);
    }, 700);
  }

  btnStartRefill.addEventListener('click', () => {
    if (isHomeRefueling) return;
    runHomeRigRefuelingAnimation();
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

  // Filling Animation & Sound
  btnConfirmCylinder.addEventListener('click', () => {
    document.getElementById('filling-cyl-name').textContent = `${selectedCylinder.name} (${cylinderQuantity} шт)`;
    switchHomeStage('filling');
    runGasFillingAnimation();
  });

  function runGasFillingAnimation() {
    const liquidFill = document.getElementById('gas-liquid-fill');
    const percentDisplay = document.getElementById('fill-percent-counter');
    const pressureVal = document.getElementById('fill-pressure-val');
    const volumeVal = document.getElementById('fill-volume-val');
    const costVal = document.getElementById('fill-cost-val');
    const gaugeNeedle = document.getElementById('gauge-needle');
    const gaugeArcPath = document.getElementById('gauge-arc-path');
    const gaugeBarText = document.getElementById('gauge-bar-text');
    const particlesBox = document.getElementById('gas-particles-box');

    let percent = 0;
    const baseVolume = selectedCylinder.type === '50kg' ? 92.0 : (selectedCylinder.type === '20kg' ? 38.5 : 19.2);
    const targetVolume = baseVolume * cylinderQuantity;
    const unitPrice = isWholesale ? selectedCylinder.wholesalePrice : selectedCylinder.price;
    const targetPrice = unitPrice * cylinderQuantity;

    liquidFill.style.height = '0%';
    playGasFillingAudio();

    const bubbleInterval = setInterval(() => {
      const b = document.createElement('div');
      b.className = 'gas-bubble';
      b.style.left = `${Math.random() * 80 + 10}%`;
      b.style.width = `${Math.random() * 8 + 4}px`;
      b.style.height = b.style.width;
      particlesBox.appendChild(b);
      setTimeout(() => b.remove(), 1500);
    }, 150);

    const interval = setInterval(() => {
      percent += 2;
      liquidFill.style.height = `${percent}%`;
      percentDisplay.textContent = percent;
      updateAudioPitch(percent);

      const currentPressure = ((percent / 100) * 16.5).toFixed(1);
      const currentVolume = ((percent / 100) * targetVolume).toFixed(1);
      const currentCost = Math.round((percent / 100) * targetPrice);

      pressureVal.textContent = `${currentPressure} bar`;
      volumeVal.textContent = `${currentVolume} L`;
      costVal.textContent = `${currentCost.toLocaleString()} UZS`;
      if (gaugeBarText) gaugeBarText.textContent = `${currentPressure} bar`;

      const angle = -90 + (percent / 100) * 180;
      if (gaugeNeedle) gaugeNeedle.setAttribute('transform', `rotate(${angle} 50 50)`);

      const strokeOffset = 126 - (percent / 100) * 126;
      if (gaugeArcPath) gaugeArcPath.style.strokeDashoffset = strokeOffset;

      if (percent >= 100) {
        clearInterval(interval);
        clearInterval(bubbleInterval);
        stopGasFillingAudio();
        setTimeout(() => {
          renderAddressOptions();
          switchHomeStage('address');
        }, 800);
      }
    }, 50);
  }

  function renderAddressOptions() {
    const container = document.getElementById('address-options-container');
    container.innerHTML = savedAddresses.map((addr, idx) => `
      <div class="address-option ${idx === 0 ? 'active' : ''}" data-address="${addr.text}">
        <div class="radio-circle"></div>
        <div class="address-text">
          <h4>${addr.icon} <span>${addr.title}</span></h4>
          <p>${addr.text}</p>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.address-option').forEach(opt => {
      opt.addEventListener('click', () => {
        container.querySelectorAll('.address-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        selectedAddress = opt.dataset.address;
      });
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

  const paymentOptions = document.querySelectorAll('.payment-option');
  const b2bInnContainer = document.getElementById('b2b-inn-container');

  paymentOptions.forEach(pm => {
    pm.addEventListener('click', () => {
      paymentOptions.forEach(p => p.classList.remove('active'));
      pm.classList.add('active');
      selectedPayment = pm.dataset.method;
      b2bInnContainer.style.display = selectedPayment === 'b2b_invoice' ? 'block' : 'none';
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

  btnNewOrderReset.addEventListener('click', () => {
    if (countdownTimerInterval) clearInterval(countdownTimerInterval);
    if (trackingCourierInterval) clearInterval(trackingCourierInterval);
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

    L.circleMarker([41.2995, 69.2401], { color: '#ff6b00', fillColor: '#ff6b00', fillOpacity: 0.9, radius: 8 }).addTo(tMap).bindPopup("Ваш адрес");

    let courierLat = 41.2850;
    let courierLng = 69.2050;
    const destLat = 41.2995;
    const destLng = 69.2401;

    const courierMarker = L.marker([courierLat, courierLng]).addTo(tMap).bindPopup("🚚 Курьер Фарход");
    const routeLine = L.polyline([[courierLat, courierLng], [destLat, destLng]], { color: '#ff6b00', weight: 4, dashArray: '6, 8' }).addTo(tMap);
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

    const userMarker = L.circleMarker([41.2995, 69.2401], { color: '#ff6b00', fillColor: '#ff8800', fillOpacity: 0.9, radius: 9 }).addTo(mainMap);
    userMarker.bindPopup("<b>Вы здесь</b>").openPopup();

    document.getElementById('btn-build-route').addEventListener('click', () => {
      L.polyline([[41.2995, 69.2401], [41.2850, 69.2050]], { color: '#00e676', weight: 5 }).addTo(mainMap);
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
    cartBadgeCount.textContent = totalCount;

    const list = document.getElementById('cart-items-list');
    if (cart.length === 0) {
      list.innerHTML = `<p style="text-align:center; color:#94a3b8; padding:20px 0;">Корзина пуста</p>`;
    } else {
      list.innerHTML = cart.map((item, i) => `
        <div class="cart-item-row">
          <span>${item.name}</span>
          <div class="cart-qty-ctrl">
            <button class="qty-btn" onclick="changeQty(${i}, -1)">-</button>
            <strong>${item.qty}</strong>
            <button class="qty-btn" onclick="changeQty(${i}, 1)">+</button>
            <span style="color:#ff6b00; margin-left:8px;">${(item.price * item.qty).toLocaleString()} UZS</span>
          </div>
        </div>
      `).join('');
    }

    let rawTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let finalTotal = Math.round(rawTotal * (1 - appliedPromoDiscount / 100));
    document.getElementById('cart-total-amount').textContent = `${finalTotal.toLocaleString()} UZS`;
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
