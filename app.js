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

  let cart = JSON.parse(localStorage.getItem('lpg_cart') || '[]');
  let appliedPromoDiscount = 0;

  let savedCards = [
    { type: 'UZCARD', pan: '8600 •••• •••• 4412', exp: '12/28' },
    { type: 'HUMO', pan: '9860 •••• •••• 9821', exp: '08/29' }
  ];

  let savedAddresses = [
    { title: 'Дом', text: 'г. Ташкент, ул. Амира Темура, 45, кв. 12', icon: 'house' },
    { title: 'Дача / Частный дом', text: 'г. Ташкент, Сергели, Массив 4, д. 18', icon: 'tree' }
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
      skipAuthHint: "Или используйте гостевой доступ снизу",
      guestOrDivider: "или",
      guestModeTitle: "Войти как Гость",
      guestModeDesc: "Ознакомиться с каталогом без регистрации",
      guestUser: "Гость",
      myBalance: "Мой баланс",
      myBalanceModalTitle: "Мой баланс и баллы",
      myBalanceModalSub: "Бонусная программа лояльности Poytug Club",
      security2fa: "Безопасность и 2FA",
      securityModalTitle: "Безопасность и 2FA",
      securityModalSub: "Двухфакторная защита аккаунта и сессий",
      settings: "Настройки",
      appLanguage: "Язык интерфейса",
      notifTitle: "Уведомления",
      notifSub: "Новости сервиса, акции и безопасность",
      aboutCompany: "О компании",
      aboutCompanyTitle: "О компании «Poytug GNS»",
      aboutCompanySub: "Официальный сертифицированный поставщик LPG в Узбекистане",
      support: "Служба поддержки",
      btnLogout: "Выйти из аккаунта",
      heroServiceTag: "Экспресс-доставка газа",
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
      savedCards: "Мои карты",
      savedCardsSub: "Управление привязанными картами Uzcard и Humo",
      savedAddresses: "Мои адреса",
      savedAddressesSub: "Список ваших сохраненных адресов доставки",
      orderHistory: "История заказов",
      openNow: "Открыто",
      btnBuildRoute: "Построить маршрут",
      cartTitle: "Корзина",
      btnExploreCatalog: "Перейти в каталог",
      emergencyTitle: "Аварийная служба газа",
      emergencySub: "Инструкция по безопасности при обнаружении запаха газа СУГ:",
      emergencyCallBtn: "Вызвать Аварийную 104",
      safetyStep1: "Немедленно перекройте вентиль газового баллона.",
      safetyStep2: "Откройте все окна и двери для проветривания.",
      safetyStep3: "Не включайте выключатели света, выдерните приборы.",
      safetyStep4: "Покиньте помещение и вызовите службу 104.",
      selectCountryTitle: "Код страны",
      selectCountrySub: "СНГ, постсоветские страны и Польша",
      logoutConfirmTitle: "Выйти из аккаунта?",
      logoutConfirmDesc: "Вы действительно хотите выйти? Вам потребуется повторный ввод пароля или SMS-кода для входа.",
      btnLogoutConfirm: "Да, выйти",
      btnCancel: "Отмена"
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
      skipAuthHint: "Yoki pastdagi tezkor mehmon kirishidan foydalaning",
      guestOrDivider: "yoki",
      guestModeTitle: "Mehmon sifatida kirish",
      guestModeDesc: "Ro'yxatdan o'tmasdan katalog bilan tanishish",
      guestUser: "Mehmon",
      myBalance: "Mening balansim",
      myBalanceModalTitle: "Mening balansim va ballarim",
      myBalanceModalSub: "Poytug Club sodiqlik bonus dasturi",
      security2fa: "Xavfsizlik va 2FA",
      securityModalTitle: "Xavfsizlik va 2FA",
      securityModalSub: "Ikki bosqichli hisob va seanslar himoyasi",
      settings: "Sozlamalar",
      appLanguage: "Ilova tili",
      notifTitle: "Bildirishnomalar",
      notifSub: "Xizmat yangiliklari, aksiyalar va xavfsizlik",
      aboutCompany: "Kompaniya haqida",
      aboutCompanyTitle: "«Poytug GNS» kompaniyasi haqida",
      aboutCompanySub: "O'zbekistonda rasmiy sertifikatlangan LPG yetkazib beruvchi",
      support: "Qo'llab-quvvatlash",
      btnLogout: "Hisobdan chiqish",
      heroServiceTag: "Tezkor gaz yetkazish",
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
      savedCards: "Mening kartalarim",
      savedCardsSub: "Ulangan Uzcard va Humo kartalarini boshqarish",
      savedAddresses: "Mening manzillarim",
      savedAddressesSub: "Yetkazib berish uchun saqlangan manzillar",
      orderHistory: "Buyurtmalar tarixi",
      openNow: "Ochiq",
      btnBuildRoute: "Yo'nalish tuzish",
      cartTitle: "Haridlar savatchasi",
      btnExploreCatalog: "Katalogga o'tish",
      emergencyTitle: "Fevqulodda gaz xizmati",
      emergencySub: "Gaz hidi sezilganda xavfsizlik qoidalari:",
      emergencyCallBtn: "104 Fevqulodda xizmatga qo'ng'iroq",
      safetyStep1: "Darhol gaz balloni ventilini yoping.",
      safetyStep2: "Xonani shamollatish uchun deraza va eshiklarni oching.",
      safetyStep3: "Elektr chiroqlarini yoqmang, asboblarni tarmoqdan uzing.",
      safetyStep4: "Binodan chiqing va 104 xizmatiga qo'ng'iroq qiling.",
      selectCountryTitle: "Mamlakat kodi",
      selectCountrySub: "MDH, postsovet mamlakatlari va Polsha",
      logoutConfirmTitle: "Hisobdan chiqasizmi?",
      logoutConfirmDesc: "Haqiqatan ham chiqmoqchimisiz? Qayta kirish uchun parol yoki SMS kod kiritish talab qilinadi.",
      btnLogoutConfirm: "Ha, chiqish",
      btnCancel: "Bekor qilish"
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
      skipAuthHint: "Or use guest quick access below",
      guestOrDivider: "or",
      guestModeTitle: "Continue as Guest",
      guestModeDesc: "Explore the catalog without signing in",
      guestUser: "Guest",
      myBalance: "My Balance",
      myBalanceModalTitle: "My Balance & Points",
      myBalanceModalSub: "Poytug Club Loyalty Program",
      security2fa: "Security & 2FA",
      securityModalTitle: "Security & 2FA",
      securityModalSub: "Two-factor protection for account and active sessions",
      settings: "Settings",
      appLanguage: "App Language",
      notifTitle: "Notifications",
      notifSub: "Service news, promos and safety alerts",
      aboutCompany: "About Company",
      aboutCompanyTitle: "About Poytug GNS",
      aboutCompanySub: "Official certified LPG gas supplier in Uzbekistan",
      support: "Support Service",
      btnLogout: "Log Out",
      heroServiceTag: "Express Gas Delivery",
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
      savedCards: "My Cards",
      savedCardsSub: "Manage your linked Uzcard & Humo cards",
      savedAddresses: "My Addresses",
      savedAddressesSub: "List of saved delivery locations",
      orderHistory: "Order History",
      openNow: "Open Now",
      btnBuildRoute: "Get Directions",
      cartTitle: "Cart",
      btnExploreCatalog: "Browse Catalog",
      emergencyTitle: "Emergency Gas Service",
      emergencySub: "Safety instructions upon detecting LPG gas odor:",
      emergencyCallBtn: "Call Emergency 104",
      safetyStep1: "Immediately close the gas cylinder valve.",
      safetyStep2: "Open all windows and doors for ventilation.",
      safetyStep3: "Do not turn on light switches, unplug appliances.",
      safetyStep4: "Evacuate the premises and call 104 emergency service.",
      selectCountryTitle: "Country Code",
      selectCountrySub: "CIS, Post-Soviet countries & Poland",
      logoutConfirmTitle: "Log Out of Account?",
      logoutConfirmDesc: "Are you sure you want to log out? You will need your password or SMS code to sign back in.",
      btnLogoutConfirm: "Yes, Log Out",
      btnCancel: "Cancel"
    }
  };

  function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('lpg_lang', lang);

    document.querySelectorAll('.lang-choice-btn, .lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    const langPreview = document.getElementById('acc-lang-preview');
    if (langPreview) {
      const langNames = { ru: 'Русский', uz: "O'zbekcha", en: 'English' };
      langPreview.textContent = `Язык: ${langNames[lang] || 'Русский'} • Звук • Тема`;
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });
  }

  setLanguage(currentLang);

  document.querySelectorAll('.lang-choice-btn, .lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
      const langNames = { ru: 'Русский', uz: "O'zbekcha", en: 'English' };
      showToast(`Язык: ${langNames[btn.dataset.lang] || btn.dataset.lang.toUpperCase()}`);
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
    } catch (e) { }
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
        setTimeout(() => {
          try { hissNoiseNode.source.stop(); } catch(e) {}
        }, 200);
      } catch (e) { }
    }
  }

  function playCompletionChime() {
    if (!soundFxEnabled) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.55);
    } catch(e) {}
  }


  // ==================== COUNTRIES & PHONE CODES ====================
  const COUNTRIES_DATA = [
    { iso: 'UZ', code: '+998', name: "Узбекистан / O'zbekiston", sample: '(90) 123-45-67' },
    { iso: 'KZ', code: '+7', name: 'Казахстан', sample: '(701) 123-45-67' },
    { iso: 'KG', code: '+996', name: 'Кыргызстан', sample: '(555) 123-456' },
    { iso: 'TJ', code: '+992', name: 'Таджикистан', sample: '(90) 123-45-67' },
    { iso: 'TM', code: '+993', name: 'Туркменистан', sample: '(65) 12-34-56' },
    { iso: 'RU', code: '+7', name: 'Россия', sample: '(999) 123-45-67' },
    { iso: 'BY', code: '+375', name: 'Беларусь', sample: '(29) 123-45-67' },
    { iso: 'AZ', code: '+994', name: 'Азербайджан', sample: '(50) 123-45-67' },
    { iso: 'AM', code: '+374', name: 'Армения', sample: '(91) 12-34-56' },
    { iso: 'GE', code: '+995', name: 'Грузия', sample: '(599) 12-34-56' },
    { iso: 'MD', code: '+373', name: 'Молдова', sample: '(68) 12-34-56' },
    { iso: 'PL', code: '+48', name: 'Польша / Polska', sample: '(501) 123-456' }
  ];

  let currentLoginCountry = COUNTRIES_DATA[0];
  let currentRegCountry = COUNTRIES_DATA[0];
  let activeCountryPickerTarget = 'login'; // 'login' | 'reg'

  function formatPhoneWithMask(rawVal, country) {
    if (!rawVal) return '';
    const digits = (rawVal || '').replace(/\D/g, '');
    if (!digits) return '';

    const iso = country ? country.iso : 'UZ';

    // (XX) XXX-XX-XX : UZ, TJ, BY, AZ
    if (['UZ', 'TJ', 'BY', 'AZ'].includes(iso)) {
      let r = '';
      if (digits.length > 0) r += '(' + digits.substring(0, Math.min(2, digits.length));
      if (digits.length >= 2) r += ') ' + digits.substring(2, Math.min(5, digits.length));
      if (digits.length >= 5) r += '-' + digits.substring(5, Math.min(7, digits.length));
      if (digits.length >= 7) r += '-' + digits.substring(7, Math.min(9, digits.length));
      return r;
    }
    // (XX) XX-XX-XX : TM, AM, MD
    if (['TM', 'AM', 'MD'].includes(iso)) {
      let r = '';
      if (digits.length > 0) r += '(' + digits.substring(0, Math.min(2, digits.length));
      if (digits.length >= 2) r += ') ' + digits.substring(2, Math.min(4, digits.length));
      if (digits.length >= 4) r += '-' + digits.substring(4, Math.min(6, digits.length));
      if (digits.length >= 6) r += '-' + digits.substring(6, Math.min(8, digits.length));
      return r;
    }
    // (XXX) XXX-XX-XX : KZ, RU
    if (['KZ', 'RU'].includes(iso)) {
      let r = '';
      if (digits.length > 0) r += '(' + digits.substring(0, Math.min(3, digits.length));
      if (digits.length >= 3) r += ') ' + digits.substring(3, Math.min(6, digits.length));
      if (digits.length >= 6) r += '-' + digits.substring(6, Math.min(8, digits.length));
      if (digits.length >= 8) r += '-' + digits.substring(8, Math.min(10, digits.length));
      return r;
    }
    // (XXX) XX-XX-XX : GE
    if (iso === 'GE') {
      let r = '';
      if (digits.length > 0) r += '(' + digits.substring(0, Math.min(3, digits.length));
      if (digits.length >= 3) r += ') ' + digits.substring(3, Math.min(5, digits.length));
      if (digits.length >= 5) r += '-' + digits.substring(5, Math.min(7, digits.length));
      if (digits.length >= 7) r += '-' + digits.substring(7, Math.min(9, digits.length));
      return r;
    }
    // (XXX) XXX-XXX : KG, PL
    if (['KG', 'PL'].includes(iso)) {
      let r = '';
      if (digits.length > 0) r += '(' + digits.substring(0, Math.min(3, digits.length));
      if (digits.length >= 3) r += ') ' + digits.substring(3, Math.min(6, digits.length));
      if (digits.length >= 6) r += '-' + digits.substring(6, Math.min(9, digits.length));
      return r;
    }
    return digits;
  }

  function bindPhoneMask(inputEl, getCountryFn) {
    if (!inputEl) return;
    inputEl.addEventListener('input', (e) => {
      const country = getCountryFn();
      const formatted = formatPhoneWithMask(e.target.value, country);
      e.target.value = formatted;
    });
  }

  function renderCountryPickerList(query = '') {
    const listEl = document.getElementById('country-picker-list');
    if (!listEl) return;
    const q = (query || '').toLowerCase().trim();
    const currentCountry = activeCountryPickerTarget === 'login' ? currentLoginCountry : currentRegCountry;

    const filtered = COUNTRIES_DATA.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.code.includes(q) ||
      c.iso.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      listEl.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-faint);">Страна не найдена</div>';
      return;
    }

    listEl.innerHTML = filtered.map(c => `
      <div class="country-option-card ${c.iso === currentCountry.iso ? 'active' : ''}" onclick="selectCountryCode('${c.iso}')">
        <div class="country-opt-left">
          <span class="country-opt-iso">${c.iso}</span>
          <span class="country-opt-name">${c.name}</span>
        </div>
        <span class="country-opt-code">${c.code}</span>
      </div>
    `).join('');
  }

  window.selectCountryCode = function (iso) {
    const country = COUNTRIES_DATA.find(c => c.iso === iso) || COUNTRIES_DATA[0];
    if (activeCountryPickerTarget === 'login') {
      currentLoginCountry = country;
      const isoPill = document.getElementById('selected-country-iso-login');
      const codeText = document.getElementById('selected-country-code-login');
      const phoneInput = document.getElementById('input-login-phone');
      if (isoPill) isoPill.textContent = country.iso;
      if (codeText) codeText.textContent = country.code;
      if (phoneInput) {
        phoneInput.placeholder = country.sample;
        phoneInput.value = formatPhoneWithMask(phoneInput.value, country);
      }
    } else {
      currentRegCountry = country;
      const isoPill = document.getElementById('selected-country-iso-reg');
      const codeText = document.getElementById('selected-country-code-reg');
      const phoneInput = document.getElementById('input-reg-phone');
      if (isoPill) isoPill.textContent = country.iso;
      if (codeText) codeText.textContent = country.code;
      if (phoneInput) {
        phoneInput.placeholder = country.sample;
        phoneInput.value = formatPhoneWithMask(phoneInput.value, country);
      }
    }
    closeModal('modal-country-picker');
  };

  const btnCountryLogin = document.getElementById('btn-country-picker-login');
  if (btnCountryLogin) {
    btnCountryLogin.addEventListener('click', () => {
      activeCountryPickerTarget = 'login';
      const searchInput = document.getElementById('input-country-search');
      if (searchInput) searchInput.value = '';
      renderCountryPickerList('');
      openModal('modal-country-picker');
    });
  }

  const btnCountryReg = document.getElementById('btn-country-picker-reg');
  if (btnCountryReg) {
    btnCountryReg.addEventListener('click', () => {
      activeCountryPickerTarget = 'reg';
      const searchInput = document.getElementById('input-country-search');
      if (searchInput) searchInput.value = '';
      renderCountryPickerList('');
      openModal('modal-country-picker');
    });
  }

  const inputCountrySearch = document.getElementById('input-country-search');
  if (inputCountrySearch) {
    inputCountrySearch.addEventListener('input', (e) => {
      renderCountryPickerList(e.target.value);
    });
  }

  // ==================== 2FA AUTH & REGISTRATION ENGINE ====================
  let storedUsers = JSON.parse(localStorage.getItem('lpg_users') || '[]');
  if (storedUsers.length === 0) {
    storedUsers = [
      { name: "Дилшод Каримов", phone: "+998 (90) 123-45-67", password: "123456" }
    ];
    localStorage.setItem('lpg_users', JSON.stringify(storedUsers));
  }

  let currentUserName = localStorage.getItem('lpg_user_name') || "Дилшод Каримов";
  let pendingAuthData = { name: '', phone: '', password: '' };

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

  // Phone input formatting
  const inputLoginPhone = document.getElementById('input-login-phone');
  const inputRegPhone = document.getElementById('input-reg-phone');
  bindPhoneMask(inputLoginPhone, () => currentLoginCountry);
  bindPhoneMask(inputRegPhone, () => currentRegCountry);

  // Enter Application Helper
  function enterApp(asGuest = false, name = "Алишер Каримов", phone = "+998 (90) 123-45-67") {
    document.body.classList.remove('auth-mode');
    const appHeader = document.getElementById('app-header');
    const bottomNav = document.getElementById('bottom-nav');
    if (appHeader) appHeader.style.display = 'flex';
    if (bottomNav) bottomNav.style.display = 'flex';

    document.getElementById('screen-auth').classList.remove('active');
    document.getElementById('screen-home').classList.add('active');

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
    document.body.classList.add('auth-mode');
    const appHeader = document.getElementById('app-header');
    const bottomNav = document.getElementById('bottom-nav');
    if (appHeader) appHeader.style.display = 'none';
    if (bottomNav) bottomNav.style.display = 'none';
  }

  // --- LOGIN FLOW (Step 1 -> Step 2) ---
  const btnLoginNext = document.getElementById('btn-login-next');
  const loginStepCreds = document.getElementById('login-step-credentials');
  const loginStepOtp = document.getElementById('login-step-otp');
  const displayLoginPhone = document.getElementById('display-login-phone');
  const btnVerifyLoginOtp = document.getElementById('btn-verify-login-otp');
  const btnResendLoginOtp = document.getElementById('btn-resend-login-otp');
  const btnBackToLoginStep1 = document.getElementById('btn-back-to-login-step1');

  btnLoginNext.addEventListener('click', () => {
    const rawPhone = inputLoginPhone.value.trim();
    const password = inputLoginPwd.value.trim();

    if (!rawPhone || rawPhone.length < 5) {
      showToast("Введите корректный номер телефона!");
      inputLoginPhone.focus();
      return;
    }
    if (!password || password.length < 6) {
      showToast("Пароль должен содержать минимум 6 символов!");
      inputLoginPwd.focus();
      return;
    }

    const formattedPhone = `${currentLoginCountry.code} ${rawPhone}`;
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
    showToast("СМС-код отправлен (Тестовый код: 1234)");
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
    if (!rawPhone || rawPhone.length < 5) {
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

    const formattedPhone = `${currentRegCountry.code} ${rawPhone}`;
    pendingAuthData = { name: name, phone: formattedPhone, password: password };

    displayRegPhone.textContent = formattedPhone;
    regStepForm.classList.remove('active');
    regStepOtp.classList.add('active');

    const firstOtp = regStepOtp.querySelector('.otp-reg-digit');
    if (firstOtp) firstOtp.focus();
    startTimer('reg-timer-sec', 30);
    showToast("СМС-код отправлен (Тестовый код: 1234)");
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

  // OTP digit Auto-Advance, Backspace & Auto-Submit for all OTP inputs
  function setupOtpInputs(className, submitCallback) {
    const digits = document.querySelectorAll(`.${className}`);
    digits.forEach((input, idx) => {
      input.addEventListener('input', () => {
        if (input.value.length === 1) {
          if (idx < digits.length - 1) {
            digits[idx + 1].focus();
          } else if (idx === digits.length - 1) {
            const allFilled = Array.from(digits).every(d => d.value.trim().length === 1);
            if (allFilled && submitCallback) {
              setTimeout(submitCallback, 150);
            }
          }
        }
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && idx > 0) {
          digits[idx - 1].focus();
        }
      });
    });
  }
  setupOtpInputs('otp-login-digit', () => {
    if (btnVerifyLoginOtp) btnVerifyLoginOtp.click();
  });
  setupOtpInputs('otp-reg-digit', () => {
    if (btnVerifyRegOtp) btnVerifyRegOtp.click();
  });

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
  const btnForgotPwd = document.getElementById('btn-forgot-pwd');
  if (btnForgotPwd) {
    btnForgotPwd.addEventListener('click', () => {
      showToast("Для демо-аккаунта используйте пароль: 123456 или службу 104");
    });
  }

  // Guest / Skip Auth
  const btnCloseAuth = document.getElementById('btn-close-auth');
  if (btnCloseAuth) btnCloseAuth.addEventListener('click', () => enterApp(true));
  
  const btnAuthSkipLink = document.getElementById('btn-auth-skip-link');
  if (btnAuthSkipLink) btnAuthSkipLink.addEventListener('click', () => enterApp(true));

  // Logout Action
  // Logout Action with Confirmation Modal
  function performLogout() {
    isAuth = false;
    localStorage.setItem('lpg_auth', 'false');
    document.body.classList.add('auth-mode');
    const appHeader = document.getElementById('app-header');
    const bottomNav = document.getElementById('bottom-nav');
    if (appHeader) appHeader.style.display = 'none';
    if (bottomNav) bottomNav.style.display = 'none';

    document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-auth').classList.add('active');
    switchAuthTab('login');
    showToast("Вы успешно вышли из аккаунта");
  }

  function promptLogoutConfirmation() {
    const sideDrawer = document.getElementById('side-drawer');
    const menuBackdrop = document.getElementById('menu-backdrop');
    if (sideDrawer) sideDrawer.classList.remove('active');
    if (menuBackdrop) menuBackdrop.classList.remove('active');
    openModal('modal-logout-confirm');
  }

  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', promptLogoutConfirmation);
  }

  const btnDrawerLogout = document.getElementById('btn-drawer-logout');
  if (btnDrawerLogout) {
    btnDrawerLogout.addEventListener('click', promptLogoutConfirmation);
  }

  const btnConfirmLogoutAction = document.getElementById('btn-confirm-logout-action');
  if (btnConfirmLogoutAction) {
    btnConfirmLogoutAction.addEventListener('click', () => {
      closeModal('modal-logout-confirm');
      performLogout();
    });
  }

  const btnCancelLogoutModal = document.getElementById('btn-cancel-logout-modal');
  if (btnCancelLogoutModal) {
    btnCancelLogoutModal.addEventListener('click', () => {
      closeModal('modal-logout-confirm');
    });
  }

  // Security 2FA Item in Profile & Modal
  const btnAccSecurity = document.getElementById('btn-acc-security');
  if (btnAccSecurity) {
    btnAccSecurity.addEventListener('click', () => {
      const userPhone = localStorage.getItem('lpg_user_phone') || "+998 (90) 123-45-67";
      const secPhoneDisplay = document.getElementById('sec-phone-display');
      if (secPhoneDisplay) secPhoneDisplay.textContent = userPhone;
      
      const pwdForm = document.getElementById('change-pwd-form-box');
      if (pwdForm) pwdForm.style.display = 'none';
      
      openModal('modal-security');
    });
  }

  const btnOpenChangePwdBox = document.getElementById('btn-open-change-pwd-box');
  const changePwdFormBox = document.getElementById('change-pwd-form-box');
  if (btnOpenChangePwdBox && changePwdFormBox) {
    btnOpenChangePwdBox.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = changePwdFormBox.style.display === 'none' || !changePwdFormBox.style.display;
      changePwdFormBox.style.display = isHidden ? 'flex' : 'none';
      if (isHidden) {
        const inputCurr = document.getElementById('input-sec-current-pwd');
        if (inputCurr) inputCurr.focus();
      }
    });
  }

  const btnSubmitChangePwd = document.getElementById('btn-submit-change-pwd');
  if (btnSubmitChangePwd) {
    btnSubmitChangePwd.addEventListener('click', () => {
      const currInput = document.getElementById('input-sec-current-pwd');
      const newInput = document.getElementById('input-sec-new-pwd');
      const curr = currInput ? currInput.value.trim() : '';
      const nw = newInput ? newInput.value.trim() : '';

      if (!curr) {
        showToast("Введите текущий пароль!");
        return;
      }
      if (nw.length < 6) {
        showToast("Новый пароль должен содержать минимум 6 символов!");
        return;
      }

      if (currInput) currInput.value = '';
      if (newInput) newInput.value = '';
      if (changePwdFormBox) changePwdFormBox.style.display = 'none';

      const secPwdStatus = document.getElementById('sec-pwd-status');
      if (secPwdStatus) secPwdStatus.textContent = 'Обновлён только что';

      showToast("Пароль успешно обновлён!");
    });
  }

  const toggleSecSms = document.getElementById('toggle-sec-sms');
  if (toggleSecSms) {
    toggleSecSms.addEventListener('change', (e) => {
      if (!e.target.checked) {
        showToast("Предупреждение: СМС 2FA отключено");
      } else {
        showToast("Двухфакторная СМС защита включена");
      }
    });
  }

  const toggleSecBio = document.getElementById('toggle-sec-bio');
  if (toggleSecBio) {
    toggleSecBio.addEventListener('change', (e) => {
      if (e.target.checked) {
        showToast("Биометрическая аутентификация активирована");
      } else {
        showToast("Биометрический вход отключён");
      }
    });
  }

  const btnTerminateSessions = document.getElementById('btn-terminate-sessions');
  if (btnTerminateSessions) {
    btnTerminateSessions.addEventListener('click', () => {
      showToast("Все остальные сессии успешно завершены!");
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
  let previousScreenId = 'screen-home';

  function navigateToScreen(targetId) {
    if (!targetId) return;

    const currentActiveScreen = Array.from(document.querySelectorAll('.app-screen')).find(s => s.classList.contains('active'));
    if (currentActiveScreen && currentActiveScreen.id !== targetId && currentActiveScreen.id !== 'screen-cart') {
      previousScreenId = currentActiveScreen.id;
    }

    document.querySelectorAll('.nav-item').forEach(n => {
      n.classList.toggle('active', n.dataset.target === targetId || n.getAttribute('data-target') === targetId);
    });

    document.querySelectorAll('.app-screen').forEach(s => {
      if (s.id === targetId) {
        s.classList.add('active');
        s.scrollTop = 0;
      } else {
        s.classList.remove('active');
      }
    });

    if (targetId === 'screen-map') {
      if (!mapInitialized) {
        initLeafletMap();
      } else if (mainMap) {
        setTimeout(() => mainMap.invalidateSize(), 150);
      }
    }

    if (targetId === 'screen-cart') {
      updateCartUI();
    }
  }

  window.navigateToScreen = navigateToScreen;

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.dataset.target || item.getAttribute('data-target');
      if (target) navigateToScreen(target);
    });
  });

  // Global event delegation for nav-items
  document.addEventListener('click', (e) => {
    const navBtn = e.target.closest('.nav-item');
    if (navBtn) {
      const target = navBtn.dataset.target || navBtn.getAttribute('data-target');
      if (target) navigateToScreen(target);
    }
  });


  // ==================== EMERGENCY 104 & SIDE DRAWER ====================
  const btnOpenEmergency = document.getElementById('btn-open-emergency');
  const btnMenuEmergency = document.getElementById('btn-menu-emergency');
  const btnCall104Direct = document.getElementById('btn-call-104-direct');

  function openEmergencyModal() {
    openModal('modal-emergency');
  }

  if (btnOpenEmergency) btnOpenEmergency.addEventListener('click', openEmergencyModal);
  if (btnMenuEmergency) {
    btnMenuEmergency.addEventListener('click', () => {
      closeDrawer();
      openEmergencyModal();
    });
  }

  if (btnCall104Direct) {
    btnCall104Direct.addEventListener('click', () => {
      showToast("Вызов аварийной газовой службы 104...");
      setTimeout(() => {
        window.location.href = 'tel:104';
      }, 400);
    });
  }

  const btnSideMenu = document.getElementById('btn-side-menu');
  const btnCloseDrawer = document.getElementById('btn-close-drawer');
  const drawerBackdrop = document.getElementById('menu-backdrop');
  const sideDrawer = document.getElementById('side-drawer');

  function openDrawer() {
    if (sideDrawer) sideDrawer.classList.add('active');
    if (drawerBackdrop) drawerBackdrop.classList.add('active');
  }

  function closeDrawer() {
    if (sideDrawer) sideDrawer.classList.remove('active');
    if (drawerBackdrop) drawerBackdrop.classList.remove('active');
  }

  if (btnSideMenu) btnSideMenu.addEventListener('click', openDrawer);
  if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  const btnMenuBalance = document.getElementById('btn-menu-balance');
  if (btnMenuBalance) {
    btnMenuBalance.addEventListener('click', () => {
      closeDrawer();
      openModal('modal-balance');
    });
  }

  const btnMenuSettings = document.getElementById('btn-menu-settings');
  if (btnMenuSettings) {
    btnMenuSettings.addEventListener('click', () => {
      closeDrawer();
      openModal('modal-settings');
    });
  }

  const btnMenuHistory = document.getElementById('btn-menu-history');
  if (btnMenuHistory) {
    btnMenuHistory.addEventListener('click', () => {
      closeDrawer();
      renderHistory();
      openModal('modal-history');
    });
  }

  const btnMenuAbout = document.getElementById('btn-menu-about');
  if (btnMenuAbout) {
    btnMenuAbout.addEventListener('click', () => {
      closeDrawer();
      openModal('modal-about');
    });
  }

  const btnMenuSupport = document.getElementById('btn-menu-support');
  if (btnMenuSupport) {
    btnMenuSupport.addEventListener('click', () => {
      closeDrawer();
      openModal('modal-support');
    });
  }


  // ==================== QUANTITY SELECTOR & WHOLESALE B2B ENGINE ====================
  const btnQtyMinus = document.getElementById('btn-qty-minus');
  const btnQtyPlus = document.getElementById('btn-qty-plus');
  const inputCylQty = document.getElementById('input-cylinder-qty') || document.getElementById('input-cyl-qty');
  const wholesaleBadge = document.getElementById('wholesale-badge');

  function updateQuantityAndWholesaleState() {
    let qty = inputCylQty ? (parseInt(inputCylQty.value) || 1) : 1;
    if (qty < 1) qty = 1;
    cylinderQuantity = qty;
    if (inputCylQty) inputCylQty.value = cylinderQuantity;

    isWholesale = cylinderQuantity >= 3;
    if (wholesaleBadge) wholesaleBadge.style.display = isWholesale ? 'block' : 'none';

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
      showToast(`Оптовый заказ (${cylinderQuantity} шт)! Оптовая цена: ${unitPrice.toLocaleString()} UZS`);
    }
  }

  if (btnQtyMinus) {
    btnQtyMinus.addEventListener('click', () => {
      if (cylinderQuantity > 1) {
        cylinderQuantity--;
        if (inputCylQty) inputCylQty.value = cylinderQuantity;
        updateQuantityAndWholesaleState();
      }
    });
  }

  if (btnQtyPlus) {
    btnQtyPlus.addEventListener('click', () => {
      cylinderQuantity++;
      if (inputCylQty) inputCylQty.value = cylinderQuantity;
      updateQuantityAndWholesaleState();
    });
  }

  if (inputCylQty) {
    inputCylQty.addEventListener('input', () => {
      updateQuantityAndWholesaleState();
    });
  }


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
        const pName = buyBtn.dataset.product || buyBtn.getAttribute('data-product') || 'Газовый баллон';
        const pPrice = parseInt(buyBtn.dataset.price || buyBtn.getAttribute('data-price') || '480000');
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
  const btnConfirmCylinder = document.getElementById('btn-confirm-cylinder-selection') || document.getElementById('btn-confirm-cylinder');
  const btnGotoPayment = document.getElementById('btn-proceed-to-payment') || document.getElementById('btn-goto-payment');
  const btnSubmitOrder = document.getElementById('btn-submit-order') || document.getElementById('btn-pay-submit');
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

    const homeScreen = document.getElementById('screen-home');
    if (homeScreen) homeScreen.scrollTop = 0;

    if (stageKey === 'address') {
      if (typeof renderAddressOptions === 'function') {
        renderAddressOptions();
      }
      if (savedAddresses && savedAddresses.length > 0) {
        switchAddressSubview('list');
      } else {
        switchAddressSubview('form');
      }
    }
  }

  // Volume Selection on Home Stage
  const volButtons = document.querySelectorAll('.vol-btn');
  const displaySelectedVol = document.getElementById('display-selected-vol');
  const refillMainPrice = document.getElementById('refill-main-price');
  const btnRefillText = document.getElementById('btn-refill-text');
  const refuelStatusText = document.getElementById('refuel-status-text');
  const svgGasFillRect = document.getElementById('svg-gas-fill-rect');
  const cylStatusText = document.getElementById('cyl-status-text');

  let selectedVolLiters = 10;
  let selectedVolPrice = 38000;

  let isRefillingAnimation = false;

  function updateTankVisualForVolume(vol) {
    if (svgGasFillRect && cylStatusText) {
      const wavePath = document.getElementById('svg-gas-wave-path');
      if (vol === 5) {
        svgGasFillRect.setAttribute('y', '155');
        svgGasFillRect.setAttribute('height', '55');
        cylStatusText.textContent = '25%';
        if (wavePath) wavePath.setAttribute('d', 'M 25 155 Q 55 151 90 155 T 155 155 L 155 210 L 25 210 Z');
      } else if (vol === 10) {
        svgGasFillRect.setAttribute('y', '125');
        svgGasFillRect.setAttribute('height', '85');
        cylStatusText.textContent = '50%';
        if (wavePath) wavePath.setAttribute('d', 'M 25 125 Q 55 121 90 125 T 155 125 L 155 210 L 25 210 Z');
      } else if (vol === 20) {
        svgGasFillRect.setAttribute('y', '55');
        svgGasFillRect.setAttribute('height', '155');
        cylStatusText.textContent = '100%';
        if (wavePath) wavePath.setAttribute('d', 'M 25 55 Q 55 51 90 55 T 155 55 L 155 210 L 25 210 Z');
      }
    }
  }

  // Initial tank setup
  updateTankVisualForVolume(10);

  volButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isRefillingAnimation) return;

      volButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const vol = parseInt(btn.dataset.vol) || 10;
      const price = parseInt(btn.dataset.price) || 38000;
      const litersText = btn.dataset.liters || `${vol} л`;

      selectedVolLiters = vol;
      selectedVolPrice = price;

      if (displaySelectedVol) displaySelectedVol.textContent = litersText;
      if (refillMainPrice) refillMainPrice.textContent = `${price.toLocaleString()} UZS`;
      if (btnRefillText) btnRefillText.textContent = `Заправить за ${price.toLocaleString()} UZS`;
      if (refuelStatusText) refuelStatusText.textContent = `Готово к заправке — ${litersText}`;

      updateTankVisualForVolume(vol);
    });
  });

  function performInteractiveRefillAnimation(targetLiters, targetPrice, onComplete) {
    if (isRefillingAnimation) return;
    isRefillingAnimation = true;

    const rig = document.getElementById('hose-nozzle-rig');
    const lockIndicator = document.getElementById('dock-lock-indicator');
    const gasStream = document.getElementById('gas-flow-stream');
    const fillRect = document.getElementById('svg-gas-fill-rect');
    const wavePath = document.getElementById('svg-gas-wave-path');
    const statusPill = document.getElementById('refuel-live-status');
    const statusPillText = document.getElementById('refuel-status-text');
    const cylStatusText = document.getElementById('cyl-status-text');
    const teleSpeedVal = document.getElementById('tele-speed-val');
    const telePressureVal = document.getElementById('tele-pressure-val');

    // 1. Dock the nozzle rig with a snap
    if (rig) {
      rig.classList.remove('rig-idle');
      rig.classList.add('rig-docked');
    }
    if (lockIndicator) lockIndicator.setAttribute('fill', '#22c55e');

    // Start Audio Synthesizer Whoosh
    playGasFillingAudio();

    // 2. Activate pressurized flow stream
    if (gasStream) gasStream.classList.add('active-flow');
    if (statusPill) {
      statusPill.className = 'refuel-status-pill filling-mode';
    }

    if (btnStartRefill) {
      btnStartRefill.disabled = true;
      btnStartRefill.style.opacity = '0.7';
    }

    // Reset to bottom to start filling up
    let startY = 195;
    let targetY = 125;
    let targetHeight = 85;
    let targetPct = 50;

    if (targetLiters === 5) {
      targetY = 155;
      targetHeight = 55;
      targetPct = 25;
    } else if (targetLiters === 10) {
      targetY = 125;
      targetHeight = 85;
      targetPct = 50;
    } else if (targetLiters === 20) {
      targetY = 55;
      targetHeight = 155;
      targetPct = 100;
    }

    // Start fluid at bottom
    if (fillRect) {
      fillRect.setAttribute('y', startY);
      fillRect.setAttribute('height', 0);
    }

    const duration = 1400; // 1.4 seconds of smooth filling
    const startTime = performance.now();

    function stepFill(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      const currentLiters = (targetLiters * ease).toFixed(1);
      const currentPct = Math.round(targetPct * ease);
      const currentHeight = Math.round(targetHeight * ease);
      const currentY = Math.round(startY - currentHeight);

      if (fillRect) {
        fillRect.setAttribute('y', currentY);
        fillRect.setAttribute('height', currentHeight);
      }

      if (wavePath) {
        wavePath.setAttribute('d', `M 25 ${currentY} Q 55 ${currentY - 3} 90 ${currentY} T 155 ${currentY} L 155 210 L 25 210 Z`);
      }

      if (cylStatusText) {
        cylStatusText.textContent = `${currentPct}%`;
      }

      if (statusPillText) {
        statusPillText.textContent = `⚡ Заправка: ${currentLiters} / ${targetLiters} л`;
      }

      if (teleSpeedVal) {
        const speed = (progress < 0.95 ? (4.2 + Math.random() * 0.6).toFixed(1) : '0.0');
        teleSpeedVal.textContent = `${speed} л/мин`;
      }

      if (telePressureVal) {
        const bar = (12.0 + progress * 4.0).toFixed(1);
        telePressureVal.textContent = `${bar} Bar`;
      }

      if (progress < 1) {
        requestAnimationFrame(stepFill);
      } else {
        // Completion
        stopGasFillingAudio();
        playCompletionChime();

        if (gasStream) gasStream.classList.remove('active-flow');

        if (statusPill) {
          statusPill.className = 'refuel-status-pill success-mode';
        }
        if (statusPillText) {
          statusPillText.textContent = `✓ Успешно заправлено: ${targetLiters} л`;
        }

        launchConfettiCannon();
        showToast(`Баллон на ${targetLiters} л заправлен! Переходим к выбору адреса.`);

        setTimeout(() => {
          if (btnStartRefill) {
            btnStartRefill.disabled = false;
            btnStartRefill.style.opacity = '';
          }
          isRefillingAnimation = false;
          if (onComplete) onComplete();
        }, 700);
      }
    }

    requestAnimationFrame(stepFill);
  }

  if (btnStartRefill) {
    btnStartRefill.addEventListener('click', () => {
      performInteractiveRefillAnimation(selectedVolLiters, selectedVolPrice, () => {
        selectedCylinder = {
          name: `Заправка СУГ (${selectedVolLiters} л)`,
          price: selectedVolPrice,
          type: `${selectedVolLiters}l`
        };
        switchHomeStage('address');
      });
    });
  }

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

  // Touch-Swipe Support for Carousel
  const carouselWrapper = document.querySelector('.carousel-viewport');
  let touchStartX = 0;
  let touchEndX = 0;
  if (carouselWrapper) {
    carouselWrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    carouselWrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeThreshold = 40;
      if (touchStartX - touchEndX > swipeThreshold) {
        // Swiped Left -> Next
        if (currentCarouselIdx < carouselCards.length - 1) {
          currentCarouselIdx++;
          updateCarousel();
        }
      } else if (touchEndX - touchStartX > swipeThreshold) {
        // Swiped Right -> Prev
        if (currentCarouselIdx > 0) {
          currentCarouselIdx--;
          updateCarousel();
        }
      }
    }, { passive: true });
  }

  if (btnConfirmCylinder) {
    btnConfirmCylinder.addEventListener('click', () => {
      switchHomeStage('initial');
      if (btnStartRefill) btnStartRefill.style.display = 'none';
      continueGasFillingOnRig();
    });
  }

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
    showToast(`Заправка: ${selectedCylinder.name} (${cylinderQuantity} шт)...`);

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
        showToast(`Баллон ${selectedCylinder.name} (${cylinderQuantity} шт) успешно заправлен!`);

        setTimeout(() => {
          isHomeRefueling = false;
          renderAddressOptions();
          switchHomeStage('address');
        }, 1200);
      }
    }, 35);
  }

  // Address selection state & subviews
  let selectedAddressTag = { title: 'Дом', icon: 'house' };

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
      const iconClass = (addr.icon && addr.icon.length > 2) ? addr.icon : 'location-dot';
      return `
        <div class="address-option ${isActive ? 'active' : ''}" data-address="${addr.text}">
          <div class="radio-circle"></div>
          <div class="address-text">
            <h4><i class="fa-solid fa-${iconClass}"></i> <span>${addr.title}</span></h4>
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
  const btnShowAddAddress = document.getElementById('btn-show-add-address-form') || document.getElementById('btn-show-add-address');
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

  // Tag chips in address form (Дом, Дача, Работа, Другое)
  const tagChips = document.querySelectorAll('#address-tag-chips .tag-chip');
  tagChips.forEach(chip => {
    chip.addEventListener('click', () => {
      tagChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedAddressTag = {
        title: chip.dataset.title || 'Адрес',
        icon: chip.dataset.icon || 'location-dot'
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

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(embeddedAddressMap);

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
        if (hintText) hintText.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${friendlyAddr}`;
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
                showToast("Ваше местоположение определено!");
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

      showToast(`Адрес "${selectedAddressTag.title}" сохранен!`);

      // Switch to payment stage
      const unitPrice = isWholesale ? selectedCylinder.wholesalePrice : selectedCylinder.price;
      const totalPrice = unitPrice * cylinderQuantity;

      document.getElementById('summary-cyl-type').textContent = `Заправка: ${selectedCylinder.name} (${cylinderQuantity} шт)`;
      document.getElementById('summary-cyl-price').textContent = `${totalPrice.toLocaleString()} UZS`;
      document.getElementById('summary-total-price').textContent = `${totalPrice.toLocaleString()} UZS`;

      switchHomeStage('payment');
    });
  }

  if (btnGotoPayment) {
    btnGotoPayment.addEventListener('click', () => {
      const customAddrInput = document.getElementById('input-custom-address');
      const customAddr = customAddrInput ? customAddrInput.value.trim() : '';
      if (customAddr) selectedAddress = customAddr;

      const unitPrice = isWholesale ? selectedCylinder.wholesalePrice : selectedCylinder.price;
      const totalPrice = unitPrice * cylinderQuantity;

      const sumType = document.getElementById('summary-cyl-type');
      const sumPrice = document.getElementById('summary-cyl-price');
      const sumTotal = document.getElementById('summary-total-price');

      if (sumType) sumType.textContent = `Заправка: ${selectedCylinder.name} (${cylinderQuantity} шт)`;
      if (sumPrice) sumPrice.textContent = `${totalPrice.toLocaleString()} UZS`;
      if (sumTotal) sumTotal.textContent = `${totalPrice.toLocaleString()} UZS`;

      switchHomeStage('payment');
    });
  }

  const paymentOptions = document.querySelectorAll('.payment-option');
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

  paymentOptions.forEach(pm => {
    pm.addEventListener('click', () => {
      paymentOptions.forEach(p => p.classList.remove('active'));
      pm.classList.add('active');
      selectedPayment = pm.dataset.method;
      if (b2bInnContainer) {
        b2bInnContainer.style.display = selectedPayment === 'b2b_invoice' ? 'block' : 'none';
      }
    });
  });

  if (btnSubmitOrder) {
    btnSubmitOrder.addEventListener('click', () => {
      if (selectedPayment === 'b2b_invoice') {
        const innInput = document.getElementById('input-company-inn');
        companyInn = innInput ? innInput.value.trim() : '';
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
  }

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
    const tMap = L.map('tracking-map-container', { zoomControl: false, attributionControl: false }).setView([41.2920, 69.2200], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(tMap);

    const userPin = L.divIcon({
      className: 'custom-user-pin',
      html: '<div style="background:#4ADE80; color:#000; width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 12px rgba(74,222,128,0.9); border:2px solid #fff; font-size:12px;"><i class="fa-solid fa-house"></i></div>',
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });
    L.marker([41.2995, 69.2401], { icon: userPin }).addTo(tMap).bindPopup("Ваш адрес");

    let courierLat = 41.2850;
    let courierLng = 69.2050;
    const destLat = 41.2995;
    const destLng = 69.2401;

    const courierIcon = L.divIcon({
      className: 'custom-courier-pin',
      html: '<div style="background:#FF4B3E; color:#fff; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 14px rgba(255,75,62,0.9); border:2px solid #fff; font-size:13px;"><i class="fa-solid fa-truck-fast"></i></div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    const courierMarker = L.marker([courierLat, courierLng], { icon: courierIcon }).addTo(tMap).bindPopup("Курьер Фарход (Poytug Express)");
    const routeLine = L.polyline([[courierLat, courierLng], [destLat, destLng]], { color: '#FF4B3E', weight: 4, dashArray: '6, 8' }).addTo(tMap);
    tMap.fitBounds(routeLine.getBounds(), { padding: [25, 25] });

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
  let activeRouteLine = null;

  function initLeafletMap() {
    mapInitialized = true;
    mainMap = L.map('interactive-map', {
      zoomControl: true,
      attributionControl: false
    }).setView([41.2995, 69.2401], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(mainMap);
    setTimeout(() => { if (mainMap) mainMap.invalidateSize(); }, 250);

    const stationIcon = L.divIcon({
      className: 'custom-station-pin',
      html: '<div style="background:linear-gradient(135deg,#FF4B3E,#dc2626); color:#fff; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 16px rgba(255,75,62,0.85); border:2px solid #ffffff; font-size:15px; cursor:pointer;"><i class="fa-solid fa-gas-pump"></i></div>',
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34]
    });

    const stations = [
      { name: "АГЗС #1 Poytug GNS — Чиланзар", lat: 41.2850, lng: 69.2050, addr: "Ташкент, ул. Катартал, 28", price: "3 800 UZS / л" },
      { name: "АГЗС #2 Poytug GNS — Сергели", lat: 41.2210, lng: 69.2230, addr: "Ташкент, Сергели 4, АГЗС-2", price: "3 750 UZS / л" },
      { name: "АГЗС #3 Poytug GNS — Юнусабад", lat: 41.3520, lng: 69.2890, addr: "Ташкент, Юнусабад 12-квартал", price: "3 850 UZS / л" }
    ];

    stations.forEach(st => {
      const marker = L.marker([st.lat, st.lng], { icon: stationIcon }).addTo(mainMap);
      marker.bindPopup(`<b>${st.name}</b><br>${st.addr}<br><span style="color:#FF4B3E;font-weight:bold;">${st.price}</span>`);
      marker.on('click', () => {
        document.getElementById('station-name-display').textContent = st.name;
        document.getElementById('station-address-display').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${st.addr}`;
        document.getElementById('station-price-display').textContent = st.price;
      });
    });

    const userPin = L.divIcon({
      className: 'custom-user-pin',
      html: '<div style="background:#4ADE80; color:#000; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 16px rgba(74,222,128,0.9); border:2.5px solid #fff; font-size:13px; font-weight:800;"><i class="fa-solid fa-location-dot"></i></div>',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });

    const userMarker = L.marker([41.2995, 69.2401], { icon: userPin }).addTo(mainMap);
    userMarker.bindPopup("<b>Вы здесь</b><br>г. Ташкент").openPopup();

    document.getElementById('btn-build-route').addEventListener('click', () => {
      if (activeRouteLine) mainMap.removeLayer(activeRouteLine);
      activeRouteLine = L.polyline([[41.2995, 69.2401], [41.2850, 69.2050]], { color: '#FF4B3E', weight: 5, opacity: 0.9, dashArray: '8, 8' }).addTo(mainMap);
      mainMap.fitBounds(activeRouteLine.getBounds(), { padding: [40, 40] });
      showToast("Маршрут до АГЗС #1 построен (~12 мин)!");
    });

    document.getElementById('btn-order-from-station').addEventListener('click', () => {
      showToast("Выбрана заправка с АГЗС #1 Чиланзар");
      navItems[0].click();
      if (btnStartRefill) btnStartRefill.click();
    });

    document.getElementById('btn-map-locate-me').addEventListener('click', () => {
      mainMap.setView([41.2995, 69.2401], 15);
      showToast("Геолокация определена!");
    });
  }


  // ==================== SHOPPING CART ENGINE ====================
  const btnOpenCart = document.getElementById('btn-open-cart');
  const cartBadgeCount = document.getElementById('cart-badge-count');
  const btnCartBackNav = document.getElementById('btn-cart-back-nav');
  const btnClearCartAll = document.getElementById('btn-clear-cart-all');

  function updateCartUI() {
    localStorage.setItem('lpg_cart', JSON.stringify(cart));
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartBadgeCount) {
      cartBadgeCount.textContent = totalCount;
      cartBadgeCount.style.display = totalCount > 0 ? 'flex' : 'none';
    }

    const list = document.getElementById('cart-items-list');
    const bottomActions = document.getElementById('cart-bottom-actions');
    const subtotalAmount = document.getElementById('cart-subtotal-amount');
    const discountRow = document.getElementById('cart-discount-row');
    const discountAmount = document.getElementById('cart-discount-amount');
    const totalAmount = document.getElementById('cart-total-amount');

    if (!list) return;

    if (cart.length === 0) {
      list.innerHTML = `
        <div class="cart-empty-box">
          <div class="cart-empty-icon-glow">
            <i class="fa-solid fa-cart-shopping"></i>
          </div>
          <h4 class="cart-empty-title">${translations[currentLang].cartEmptyTitle || "Ваша корзина пуста"}</h4>
          <p class="cart-empty-desc">${translations[currentLang].cartEmptySub || "Выберите заправку газа или новые баллоны в каталоге"}</p>
          <button class="btn-explore-catalog ripple-btn" id="btn-cart-goto-store">
            <i class="fa-solid fa-fire-flame-curved"></i>
            <span>${translations[currentLang].btnExploreCatalog || "Перейти в каталог"}</span>
          </button>
        </div>
      `;
      if (bottomActions) bottomActions.style.display = 'none';

      const btnGotoStore = document.getElementById('btn-cart-goto-store');
      if (btnGotoStore) {
        btnGotoStore.addEventListener('click', () => {
          navigateToScreen('screen-store');
        });
      }
    } else {
      if (bottomActions) bottomActions.style.display = 'block';

      list.innerHTML = cart.map((item, i) => `
        <div class="cart-item-card">
          <div class="cart-item-main-row">
            <div class="cart-item-icon">
              <i class="fa-solid fa-fire-flame-curved"></i>
            </div>
            <div class="cart-item-info">
              <h4 class="cart-item-title">${item.name}</h4>
              <span class="cart-item-unit-price">${item.price.toLocaleString()} UZS / шт</span>
            </div>
            <button class="cart-remove-btn" onclick="removeCartItem(${i})" title="Удалить" aria-label="Удалить товар">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
          <div class="cart-item-bottom-row">
            <div class="cart-qty-ctrl">
              <button class="qty-btn" onclick="changeQty(${i}, -1)" aria-label="Уменьшить">−</button>
              <span class="cart-qty-num">${item.qty}</span>
              <button class="qty-btn" onclick="changeQty(${i}, 1)" aria-label="Увеличить">+</button>
            </div>
            <div class="cart-item-subtotal">
              <span class="subtotal-label">Сумма:</span>
              <strong class="cart-item-price">${(item.price * item.qty).toLocaleString()} UZS</strong>
            </div>
          </div>
        </div>
      `).join('');
    }

    let rawTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let discountVal = Math.round(rawTotal * (appliedPromoDiscount / 100));
    let finalTotal = rawTotal - discountVal;

    if (subtotalAmount) subtotalAmount.textContent = `${rawTotal.toLocaleString()} UZS`;
    if (discountRow) {
      discountRow.style.display = appliedPromoDiscount > 0 ? 'flex' : 'none';
      if (discountAmount) discountAmount.textContent = `-${discountVal.toLocaleString()} UZS (${appliedPromoDiscount}%)`;
    }
    if (totalAmount) totalAmount.textContent = `${finalTotal.toLocaleString()} UZS`;
  }

  window.changeQty = function (idx, delta) {
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    updateCartUI();
  };

  window.removeCartItem = function (idx) {
    cart.splice(idx, 1);
    updateCartUI();
    showToast("Товар удален из корзины");
  };

  if (btnOpenCart) {
    btnOpenCart.addEventListener('click', () => {
      navigateToScreen('screen-cart');
    });
  }

  if (btnCartBackNav) {
    btnCartBackNav.addEventListener('click', () => {
      navigateToScreen(previousScreenId || 'screen-store');
    });
  }

  if (btnClearCartAll) {
    btnClearCartAll.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast("Корзина уже пуста");
        return;
      }
      cart = [];
      appliedPromoDiscount = 0;
      updateCartUI();
      showToast("Корзина очищена");
    });
  }

  const btnApplyPromo = document.getElementById('btn-apply-promo');
  if (btnApplyPromo) {
    btnApplyPromo.addEventListener('click', () => {
      const promoInput = document.getElementById('input-promocode');
      const code = promoInput ? promoInput.value.trim().toUpperCase() : '';
      if (code === 'GAS2026') {
        appliedPromoDiscount = 10;
        showToast("Промокод применен! Скидка 10%");
        updateCartUI();
      } else {
        showToast("Неверный промокод (попробуйте GAS2026)");
      }
    });
  }

  const btnCartCheckout = document.getElementById('btn-cart-checkout');
  if (btnCartCheckout) {
    btnCartCheckout.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast("Корзина пуста!");
        return;
      }
      cart = [];
      appliedPromoDiscount = 0;
      updateCartUI();
      launchConfettiCannon();
      showToast("Заказ из корзины успешно оформлен!");
      setTimeout(() => {
        navigateToScreen('screen-home');
      }, 1200);
    });
  }

  updateCartUI();

  // ==================== CARDS, ADDRESSES & BALANCE ====================
  // Loyalty Balance in Account Screen
  const btnAccBalanceItem = document.getElementById('btn-acc-balance-item');
  if (btnAccBalanceItem) {
    btnAccBalanceItem.addEventListener('click', () => {
      openModal('modal-balance');
    });
  }

  const btnUseBalanceNow = document.getElementById('btn-use-balance-now');
  if (btnUseBalanceNow) {
    btnUseBalanceNow.addEventListener('click', () => {
      closeModal('modal-balance');
      const homeNav = document.querySelector('[data-target="screen-home"]');
      if (homeNav) homeNav.click();
      if (btnStartRefill) btnStartRefill.click();
      showToast("Бонусы 25 000 UZS будут применены к заказу!");
    });
  }

  // Cards Manager
  const btnAccCards = document.getElementById('btn-acc-cards');
  if (btnAccCards) {
    btnAccCards.addEventListener('click', () => {
      renderCards();
      openModal('modal-cards');
    });
  }

  function renderCards() {
    const wrapper = document.getElementById('cards-list-wrapper');
    if (!wrapper) return;
    if (savedCards.length === 0) {
      wrapper.innerHTML = `<p style="font-size:12px; color:var(--text-muted); text-align:center; padding:10px 0;">Нет привязанных карт</p>`;
      return;
    }
    wrapper.innerHTML = savedCards.map((c, i) => `
      <div class="account-card-item" style="margin-bottom:8px; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="acc-icon blue-bg"><i class="fa-solid fa-credit-card"></i></div>
          <div class="acc-text">
            <h4>${c.type} (${c.exp})</h4>
            <p>${c.pan}</p>
          </div>
        </div>
        <button class="card-remove-btn" onclick="deleteSavedCard(${i})" title="Удалить карту" style="background:transparent; border:none; color:#ef4444; cursor:pointer; font-size:15px; padding:6px;">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    `).join('');
  }

  window.deleteSavedCard = function (idx) {
    savedCards.splice(idx, 1);
    renderCards();
    const cardsPreview = document.getElementById('acc-cards-preview');
    if (cardsPreview) cardsPreview.textContent = savedCards.length > 0 ? `${savedCards.length} привязанные карты` : 'Нет карт';
    showToast("Карта удалена");
  };

  const inputCardNum = document.getElementById('input-card-number');
  const inputCardExp = document.getElementById('input-card-exp') || document.getElementById('input-card-expiry');
  const previewLogo = document.getElementById('card-logo-preview') || document.getElementById('preview-card-logo');

  if (inputCardNum) {
    inputCardNum.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 16);
      e.target.value = val.replace(/(.{4})(?=.)/g, '$1 ').trim();

      if (previewLogo) {
        if (val.startsWith('8600')) previewLogo.textContent = 'Uzcard';
        else if (val.startsWith('9860')) previewLogo.textContent = 'Humo';
        else previewLogo.textContent = 'Visa';
      }
    });
  }

  if (inputCardExp) {
    inputCardExp.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (val.length >= 2) {
        e.target.value = val.substring(0, 2) + '/' + val.substring(2, 4);
      } else {
        e.target.value = val;
      }
    });
  }

  const btnSaveNewCard = document.getElementById('btn-submit-new-card') || document.getElementById('btn-save-new-card');
  if (btnSaveNewCard) {
    btnSaveNewCard.addEventListener('click', () => {
      const numInput = document.getElementById('input-card-number');
      const expInput = document.getElementById('input-card-exp') || document.getElementById('input-card-expiry');
      const logoEl = document.getElementById('card-logo-preview') || document.getElementById('preview-card-logo');
      
      const rawPan = numInput ? numInput.value.replace(/\D/g, '') : '';
      if (rawPan.length < 16) {
        showToast("Введите корректный 16-значный номер карты!");
        return;
      }
      const cardType = logoEl ? logoEl.textContent.toUpperCase() : 'UZCARD';
      const cardExp = (expInput && expInput.value) ? expInput.value : '12/28';
      const masked = `${rawPan.substring(0, 4)} •••• •••• ${rawPan.substring(12)}`;
      
      savedCards.push({ type: cardType, pan: masked, exp: cardExp });
      renderCards();
      const cardsPreview = document.getElementById('acc-cards-preview');
      if (cardsPreview) cardsPreview.textContent = `${savedCards.length} привязанные карты`;
      showToast("Карта успешно привязана!");
      if (numInput) numInput.value = '';
      if (expInput) expInput.value = '';
    });
  }

  // Address Manager
  const btnAccAddresses = document.getElementById('btn-acc-addresses');
  if (btnAccAddresses) {
    btnAccAddresses.addEventListener('click', () => {
      renderAddressManager();
      openModal('modal-addresses');
    });
  }

  function renderAddressManager() {
    const list = document.getElementById('addresses-manager-list') || document.getElementById('address-manager-list');
    if (!list) return;
    if (savedAddresses.length === 0) {
      list.innerHTML = `<p style="font-size:12px; color:var(--text-muted); text-align:center; padding:10px 0;">Нет сохраненных адресов</p>`;
      return;
    }
    list.innerHTML = savedAddresses.map((a, i) => {
      const iconClass = (a.icon && a.icon.length > 2) ? a.icon : 'location-dot';
      return `
        <div class="account-card-item" style="margin-bottom:8px; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div class="acc-icon green-bg"><i class="fa-solid fa-${iconClass}"></i></div>
            <div class="acc-text">
              <h4>${a.title}</h4>
              <p>${a.text}</p>
            </div>
          </div>
          <button class="addr-remove-btn" onclick="deleteSavedAddress(${i})" title="Удалить адрес" style="background:transparent; border:none; color:#ef4444; cursor:pointer; font-size:15px; padding:6px;">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      `;
    }).join('');
  }

  window.deleteSavedAddress = function (idx) {
    savedAddresses.splice(idx, 1);
    renderAddressManager();
    const countDisplay = document.getElementById('acc-addresses-count');
    if (countDisplay) countDisplay.textContent = `${savedAddresses.length} адресов доставки`;
    renderAddressOptions();
    showToast("Адрес удален");
  };

  const btnSaveNewAddr = document.getElementById('btn-submit-mgr-addr') || document.getElementById('btn-save-new-address');
  if (btnSaveNewAddr) {
    btnSaveNewAddr.addEventListener('click', () => {
      const titleInput = document.getElementById('input-mgr-addr-title') || document.getElementById('input-new-addr-title');
      const textInput = document.getElementById('input-mgr-addr-text') || document.getElementById('input-new-addr-text');
      const title = titleInput ? titleInput.value.trim() : 'Другой адрес';
      const text = textInput ? textInput.value.trim() : '';
      if (!text) {
        showToast("Введите адрес!");
        if (textInput) textInput.focus();
        return;
      }
      savedAddresses.push({ title: title || 'Другой адрес', text: text, icon: 'location-dot' });
      renderAddressManager();
      renderAddressOptions();
      const countDisplay = document.getElementById('acc-addresses-count');
      if (countDisplay) countDisplay.textContent = `${savedAddresses.length} адресов доставки`;
      showToast("Адрес успешно сохранен!");
      if (titleInput) titleInput.value = '';
      if (textInput) textInput.value = '';
    });
  }

  // ==================== HISTORY & SUPPORT CHAT ====================
  const btnAccHistory = document.getElementById('btn-acc-history');
  if (btnAccHistory) {
    btnAccHistory.addEventListener('click', () => {
      renderHistory();
      openModal('modal-history');
    });
  }

  const btnAccSettings = document.getElementById('btn-acc-settings');
  if (btnAccSettings) {
    btnAccSettings.addEventListener('click', () => {
      openModal('modal-settings');
    });
  }

  function renderHistory() {
    const list = document.getElementById('history-items-list');
    if (!list) return;
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
  const btnOpenNotif = document.getElementById('btn-open-notifications');
  if (btnOpenNotif) {
    btnOpenNotif.addEventListener('click', () => {
      openModal('modal-notifications');
    });
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  }

  document.querySelectorAll('.modal-close, [data-close]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const modalId = btn.dataset.close || btn.closest('.modal-backdrop')?.id;
      if (modalId) closeModal(modalId);
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
