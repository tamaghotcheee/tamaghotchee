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
  let isHomeRefueling = false;
  let percent = 0;
  let mapInitialized = false;
  let mainMap = null;
  let embeddedAddressMap = null;
  let embeddedAddressMarker = null;

  let cart = JSON.parse(localStorage.getItem('lpg_cart') || 'null');
  if (!cart) {
    cart = [
      { name: "Баллон 10 кг", qty: 1, price: 340000 },
      { name: "Баллон 20 кг", qty: 1, price: 480000 }
    ];
  }
  let appliedPromoDiscount = 0;
  let userBalance = parseInt(localStorage.getItem('lpg_balance') || '25000', 10);

  // ==================== SECURITY & SANITIZATION ====================
  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Active interval manager to prevent memory leaks and duplicate timers
  const activeTimers = {};
  function startTimer(timerId, duration) {
    if (activeTimers[timerId]) {
      clearInterval(activeTimers[timerId]);
    }
    let sec = duration;
    const timerEl = document.getElementById(timerId);
    if (!timerEl) return;
    timerEl.textContent = sec;
    activeTimers[timerId] = setInterval(() => {
      sec--;
      if (timerEl) timerEl.textContent = sec;
      if (sec <= 0) {
        clearInterval(activeTimers[timerId]);
        delete activeTimers[timerId];
      }
    }, 1000);
  }

  // Phone input formatting helper (+998 (XX) XXX-XX-XX)
  function attachPhoneMask(input) {
    if (!input) return;
    input.addEventListener('input', () => {
      let val = input.value.replace(/\D/g, '');
      if (val.startsWith('998')) val = val.substring(3);
      if (val.length > 9) val = val.substring(0, 9);

      let formatted = '+998';
      if (val.length > 0) formatted += ' (' + val.substring(0, 2);
      if (val.length >= 2) formatted += ') ' + val.substring(2, 5);
      if (val.length >= 5) formatted += '-' + val.substring(5, 7);
      if (val.length >= 7) formatted += '-' + val.substring(7, 9);

      input.value = val.length ? formatted : '';
    });
  }

  function updateBalanceDisplay() {
    const formatted = isAuth ? (userBalance.toLocaleString().replace(/,/g, ' ') + ' UZS') : '0 UZS';
    const menuEl = document.getElementById('menu-balance-amount');
    const accEl = document.getElementById('acc-balance-display');
    const topupEl = document.getElementById('topup-current-balance');
    const loyaltyEl = document.getElementById('modal-balance-display');
    if (menuEl) menuEl.textContent = formatted;
    if (accEl) accEl.textContent = formatted;
    if (topupEl) topupEl.textContent = formatted;
    if (loyaltyEl) loyaltyEl.textContent = isAuth ? userBalance.toLocaleString().replace(/,/g, ' ') : '0';
    if (isAuth) localStorage.setItem('lpg_balance', userBalance.toString());
  }
  updateBalanceDisplay();

  // ==================== CORE UI & DOM CONTROLS ====================
  const navItems = document.querySelectorAll('.nav-item');
  const screens = document.querySelectorAll('.app-screen');
  const sideDrawer = document.getElementById('side-drawer');
  const drawerBackdrop = document.getElementById('menu-backdrop');
  const btnSideMenu = document.getElementById('btn-side-menu');
  const btnCloseDrawer = document.getElementById('btn-close-drawer');
  const btnOpenCart = document.getElementById('btn-open-cart');
  const btnCloseAuth = document.getElementById('btn-close-auth');
  const bottomNav = document.getElementById('bottom-nav');

  function showToast(msg) {
    const toast = document.getElementById('toast-notif');
    const toastText = document.getElementById('toast-text');
    if (!toast || !toastText) return;
    toastText.textContent = msg;
    toast.classList.add('active');
    setTimeout(() => {
      toast.classList.remove('active');
    }, 2800);
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('active');
      document.body.classList.add('modal-open');
    }
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('active');
      if (!document.querySelector('.modal-backdrop.active')) {
        document.body.classList.remove('modal-open');
      }
    }
  }

  function openDrawer() {
    if (sideDrawer) sideDrawer.classList.add('active');
    if (drawerBackdrop) drawerBackdrop.classList.add('active');
  }

  function closeDrawer() {
    if (sideDrawer) sideDrawer.classList.remove('active');
    if (drawerBackdrop) drawerBackdrop.classList.remove('active');
  }

  function switchScreen(targetId) {
    const isAuthScreen = targetId === 'screen-auth';
    if (btnSideMenu) btnSideMenu.style.display = isAuthScreen ? 'none' : 'flex';
    if (btnOpenCart) btnOpenCart.style.display = isAuthScreen ? 'none' : 'flex';
    if (bottomNav) bottomNav.style.display = isAuthScreen ? 'none' : 'flex';
    if (btnCloseAuth) btnCloseAuth.style.display = isAuthScreen ? 'flex' : 'none';

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
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.showToast = showToast;
  window.openDrawer = openDrawer;
  window.closeDrawer = closeDrawer;

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      switchScreen(item.dataset.target);
    });
  });

  if (btnSideMenu) btnSideMenu.addEventListener('click', openDrawer);
  if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

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
      authMainTitle: "Вход в аккаунт",
      authMainSub: "Введите номер телефона и пароль",
      tabLogin: "Вход",
      tabRegister: "Регистрация",
      step1of2: "Шаг 1 из 2 • Данные",
      step2of2: "Шаг 2 из 2 • СМС верификация",
      phoneLabel: "Номер телефона",
      passwordLabel: "Пароль",
      forgotPassword: "Забыли пароль?",
      demoHint: "Демо: 123456",
      btnContinue2fa: "Продолжить к СМС коду",
      btnContinueGuest: "Продолжить без входа",
      authDisclaimer: "Нажимая «Продолжить», вы соглашаетесь с правилами безопасности Poytug GNS",
      otpTitle: "СМС верификация",
      otpSubtitle: "Введите 4-значный код подтверждения",
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
      topUp: "Пополнить",
      security2fa: "Безопасность и 2FA",
      settings: "Настройки",
      aboutCompany: "О нашей фирме",
      support: "Служба поддержки",
      btnLogout: "Выйти из аккаунта",
      sectionManagement: "Управление",
      sectionInfo: "Информация",
      menuSafety104: "Безопасность 104",
      refillGasTitle: "Заправка СУГ / LPG",
      refillGasSub: "Быстрая заправка вашего баллона с доставкой",
      statusEmpty: "ПУСТОЙ 0%",
      statusFilling: "ЗАПРАВКА...",
      statusFull: "ЗАПРАВЛЕН 100%",
      refuelReady: "Баллон готов к заправке",
      btnRefill: "ЗАПРАВИТЬ ГАЗ",
      selectCylinderTitle: "Выберите размер баллона",
      selectCylinderSub: "Круговое переключение между баллонами",
      cyl10Title: "Баллон 10 КГ",
      cyl20Title: "Баллон 20 КГ",
      pillBestHome: "Для дома и кухни",
      pillCompact: "Компактный / Дача",
      pillIndustrial: "Для кафе и отопления",
      cylQuantityLabel: "Количество баллонов:",
      wholesaleDiscountTitle: "Оптовая скидка (от 10 шт.)",
      wholesaleDiscountDesc: "Оптовая скидка от 15% + доставка спец-транспортом + Э-фактура",
      btnConfirmSelection: "Подтвердить выбор",
      fillingProgressTitle: "Процесс заправки газа...",
      pressure: "Давление",
      gasVolume: "Объем",
      totalCost: "Стоимость",
      addressSelectTitle: "Адрес доставки",
      addressSelectSub: "Выберите сохраненный адрес или укажите новый",
      addrHome: "Дом",
      addrDacha: "Дача / Частный дом",
      addrWork: "Работа",
      addrOther: "Другое",
      noSavedAddresses: "Нет сохраненных адресов",
      addAddressPrompt: "Добавьте адрес доставки для быстрого заказа",
      btnAddAddress: "Добавить адрес / Указать на карте",
      backToSavedAddresses: "Назад к списку",
      newAddressTitle: "Новый адрес доставки",
      newAddressSub: "Введите адрес или отметьте точку на карте",
      mapOverlayHint: "Нажмите на карту для выбора точки доставки",
      btnSaveAndUseAddress: "Сохранить и продолжить",
      btnProceedPayment: "Перейти к оплате",
      paymentTitle: "Оплата заказа",
      paymentSub: "Выберите удобный способ оплаты",
      deliveryFee: "Доставка до двери",
      free: "Бесплатно",
      totalToPay: "Итого к оплате",
      paymentMethodSection: "Способ оплаты",
      payCash: "Наличными при получении",
      payCashSub: "Оплата курьеру при передаче баллона",
      payOnlineFast: "Быстрая онлайн-оплата в 1 клик",
      payUzcardHumo: "Uzcard / Humo (Онлайн)",
      payOnline: "Click / Payme",
      payOnlineSub: "Электронный кошелек / Рассрочка",
      payInvoice: "Э-фактура (Юр. лицам)",
      payInvoiceSub: "Для фирм и организаций с выпиской счет-фактуры",
      innLabel: "ИНН фирмы / организации (9 цифр)",
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
      navStore: "Магазин",
      navAccount: "Профиль",
      mapTitle: "Карта филиалов ГНС",
      mapSub: "Сеть станций заправки и доставки баллонов Poytug",
      mapSearchPlaceholder: "Поиск станции ГНС в Ташкенте...",
      openNow: "Открыто",
      btnBuildRoute: "Построить маршрут",
      btnOrderHere: "Заказать отсюда",
      storeTitle: "Магазин газового оборудования",
      storeSub: "Новые сертифицированные баллоны, плиты и аксессуары",
      btnBuy: "Купить",
      prod1Title: "Баллон металл 20 кг (Новый)",
      prod1Desc: "Высокая прочность стали + предохранительный клапан",
      prod2Title: "Комплект: Редуктор + Шланг 2м",
      prod2Desc: "Металлический редуктор низкого давления + армированный шланг с хомутами",
      prod3Title: "Баллон металл 10 кг (Новый)",
      prod3Desc: "Компактный баллон для дачи, гриля и походов",
      prod4Title: "Газовая плита 2-конфорочная",
      prod4Desc: "Настольная плита с контролем пламени для сжиженного газа",
      myProfileTitle: "Мой профиль",
      myProfileSub: "Управление аккаунтом, безопасностью и адресами",
      support247: "Служба поддержки 24/7",
      certificationsTitle: "Официальные сертификаты",
      certificationsSub: "ГОСТ 15860-93 • Лицензия ГИ «Саноатгеоконтехназорат»",
      savedCards: "Банковские карты",
      savedAddresses: "Адреса доставки",
      savedAddressesSub: "Список ваших сохраненных адресов",
      orderHistory: "История заказов",
      cartTitle: "Корзина покупок",
      clearCart: "Очистить всё",
      cartEmptyTitle: "Корзина пуста",
      cartEmptyDesc: "Добавьте баллон или аксессуар из каталога — и он появится здесь",
      btnApplyPromo: "Применить",
      cartSubtotalLabel: "Сумма товаров",
      cartDiscountLabel: "Скидка по промокоду",
      cartTotalLabel: "Итого к оплате",
      btnCheckoutCart: "Оформить покупку",
      btnBrowseCatalog: "Перейти в каталог баллонов",
      myBalanceModalTitle: "Бонусы Poytug Club",
      myBalanceModalSub: "Бонусная программа лояльности и кэшбэк",
      goldLevelCashback: "Золотой уровень • 2% Кэшбэк",
      balanceHintText: "1 бонус = 1 сум. Оплачивайте бонусами до 50% стоимости заправки и покупки баллонов!",
      bonusHistoryTitle: "История начислений",
      btnRefillWithDiscount: "Заправить газ со скидкой",
      btnTopUpBalance: "Пополнить баланс",
      topupTitle: "Пополнение баланса",
      topupAmountLabel: "Сумма пополнения (UZS)",
      topupMethodLabel: "Способ пополнения",
      topupPrimaryCard: "Основная карта",
      topupFromBalance: "С баланса счета",
      topupClickDesc: "Оплата через приложение Click",
      topupPaymeDesc: "Оплата через Payme",
      btnTopupSubmit: "Пополнить счет",
      addNewCardTitle: "Добавить новую карту",
      btnSaveCard: "Сохранить карту",
      addNewAddressTitle: "Добавить новый адрес",
      btnSaveAddress: "Сохранить адрес",
      emergencyServiceTitle: "Аварийная служба газа 104",
      emergencyServiceSub: "Экстренные инструкции при обнаружении запаха газа",
      safetyStep1: "Немедленно перекройте вентиль на баллоне.",
      safetyStep2: "Откройте окна и двери для проветривания.",
      safetyStep3: "Не включайте выключатели света, электроприборы и спички.",
      safetyStep4: "Выйдите из помещения и вызовите аварийную службу 104.",
      btnCall104: "Вызвать аварийную 104",
      fiscalReceiptTitle: "Электронный фискальный чек",
      fiscalReceiptSub: "Официальный чек покупки",
      receiptGoods: "Сумма товаров:",
      receiptDiscount: "Скидка:",
      receiptDelivery: "Доставка:",
      receiptTotal: "ИТОГО К ОПЛАТЕ:",
      receiptPaidUzcard: "Оплачено картой Uzcard",
      receiptQr: "Soliq.uz фискальный QR-код",
      btnCloseReceipt: "Закрыть чек",
      aboutCompanyTitle: "О компании «Poytug GNS»",
      aboutCompanySub: "Официальный сертифицированный поставщик LPG в Узбекистане",
      aboutCompanyText: "ООО «Poytug' GNS» — ведущий поставщик сжиженного углеводородного газа (СУГ / пропан-бутан) для населения и предприятий Узбекистана. Мы гарантируем 100% точность заправки, регулярное освидетельствование баллонов и экспресс-доставку в течение 30 минут.",
      aboutOrderBadge: "Онлайн-заказ с доставкой Poytug GNS",
      settingsSub: "Язык интерфейса и параметры системы",
      langSectionTitle: "Язык приложения / Til / Language",
      paramsSectionTitle: "Параметры",
      soundEffects: "Звуковые эффекты",
      pushNotifications: "Push-уведомления",
      darkTheme: "Темная тема",
      priceLabel: "Цена",
      badgeHit: "ХИТ",
      badgeCompact: "Компакт"
    },
    uz: {
      auth2faTitle: "Kirish",
      authMainTitle: "Hisobga kirish",
      authMainSub: "Telefon raqami va parolni kiriting",
      tabLogin: "Kirish",
      tabRegister: "Ro'yxatdan o'tish",
      step1of2: "1-bosqich: Ma'lumotlar",
      step2of2: "2-bosqich: SMS tekshiruvi",
      phoneLabel: "Telefon raqami",
      passwordLabel: "Parol",
      forgotPassword: "Parolni unutdingizmi?",
      demoHint: "Demo: 123456",
      btnContinue2fa: "SMS kodga o'tish",
      btnContinueGuest: "Kirishsiz davom etish",
      authDisclaimer: "«Davom etish» tugmasini bosish orqali siz Poytug GNS xavfsizlik qoidalariga rozilik bildirasiz",
      otpTitle: "SMS tasdiqlash",
      otpSubtitle: "4 xonali tasdiqlash kodini kiriting",
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
      topUp: "To'ldirish",
      security2fa: "Xavfsizlik va 2FA",
      settings: "Sozlamalar",
      aboutCompany: "Kompaniya haqida",
      support: "Qo'llab-quvvatlash",
      btnLogout: "Hisobdan chiqish",
      sectionManagement: "Boshqaruv",
      sectionInfo: "Ma'lumot",
      menuSafety104: "Xavfsizlik 104",
      refillGasTitle: "LPG Gaz Quyish",
      refillGasSub: "Balloningizni tezkor to'ldirish va yetkazish",
      statusEmpty: "BO'SH 0%",
      statusFilling: "TO'LDIRILMOQDA...",
      statusFull: "TO'LDIRILDI 100%",
      refuelReady: "Ballon to'ldirishga tayyor",
      btnRefill: "GAZ QUYISH",
      selectCylinderTitle: "Ballon hajmini tanlang",
      selectCylinderSub: "Ballonlar o'rtasida aylanma almashtirish",
      cyl10Title: "Ballon 10 KG",
      cyl20Title: "Ballon 20 KG",
      pillBestHome: "Uy va oshxona uchun",
      pillCompact: "Ixcham / Dala hovli",
      pillIndustrial: "Kafe va isitish uchun",
      cylQuantityLabel: "Ballonlar soni:",
      wholesaleDiscountTitle: "Ulgurji chegirma (10 donadan)",
      wholesaleDiscountDesc: "15% dan ulgurji chegirma + maxsus transportda yetkazish + E-faktura",
      btnConfirmSelection: "Tanlovni tasdiqlash",
      fillingProgressTitle: "Gaz to'ldirish jarayoni...",
      pressure: "Bosim",
      gasVolume: "Hajmi",
      totalCost: "Narxi",
      addressSelectTitle: "Yetkazib berish manzili",
      addressSelectSub: "Saqlangan manzilni tanlang yoki yangisini kiriting",
      addrHome: "Uy",
      addrDacha: "Dala hovli",
      addrWork: "Ishxona",
      addrOther: "Boshqa",
      noSavedAddresses: "Saqlangan manzillar yo'q",
      addAddressPrompt: "Tezkor buyurtma uchun yetkazish manzilini qo'shing",
      btnAddAddress: "Manzil qo'shish / Xaritadan belgilash",
      backToSavedAddresses: "Ro'yxatga qaytish",
      newAddressTitle: "Yangi yetkazish manzili",
      newAddressSub: "Manzilni yozing yoki xaritada belgilang",
      mapOverlayHint: "Yetkazish nuqtasini tanlash uchun xaritani bosing",
      btnSaveAndUseAddress: "Saqlash va davom etish",
      btnProceedPayment: "To'lovga o'tish",
      paymentTitle: "Buyurtma to'lovi",
      paymentSub: "Qulay to'lov usulini tanlang",
      deliveryFee: "Eshikgacha yetkazish",
      free: "BEPUL",
      totalToPay: "Jami to'lov:",
      paymentMethodSection: "To'lov usuli",
      payCash: "Qabul qilganda naqd",
      payCashSub: "Ballon topshirilganda kuryerga to'lash",
      payOnlineFast: "1 bosishda tezkor onlayn to'lov",
      payUzcardHumo: "Uzcard / Humo (Onlayn)",
      payOnline: "Click / Payme",
      payOnlineSub: "Elektron hamyon / Bo'lib to'lash",
      payInvoice: "E-faktura (Yuridik shaxslar)",
      payInvoiceSub: "Kompaniyalar va tashkilotlar uchun hisob-faktura bilan",
      innLabel: "Tashkilot STIR/INN raqami (9 ta raqam)",
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
      navStore: "Do'kon",
      navAccount: "Kabinet",
      mapTitle: "GNS filiallari xaritasi",
      mapSub: "Poytug gaz to'ldirish va yetkazib berish stansiyalari tarmog'i",
      mapSearchPlaceholder: "Toshkentdagi GNS stansiyasini qidirish...",
      openNow: "Ochiq",
      btnBuildRoute: "Yo'nalish tuzish",
      btnOrderHere: "Bu yerdan buyurtma",
      storeTitle: "Gaz uskunalari do'koni",
      storeSub: "Yangi sertifikatlangan ballonlar, plitalar va aksessuarlar",
      btnBuy: "Sotib olish",
      prod1Title: "Metall ballon 20 kg (Yangi)",
      prod1Desc: "Mustahkam po'lat + xavfsizlik klapani",
      prod2Title: "To'plam: Reduktor + 2m Shlang",
      prod2Desc: "Metall past bosimli reduktor + mustahkamlangan shlang xomutlar bilan",
      prod3Title: "Metall ballon 10 kg (Yangi)",
      prod3Desc: "Dala hovli, mangal va sayohat uchun ixcham ballon",
      prod4Title: "2 konforkali gaz plitasi",
      prod4Desc: "Suyuqlantirilgan gaz uchun olov nazoratiga ega stol usti plitasi",
      myProfileTitle: "Mening profilim",
      myProfileSub: "Hisob, xavfsizlik va manzillarni boshqarish",
      support247: "24/7 Qo'llab-quvvatlash xizmati",
      certificationsTitle: "Rasmiy sertifikatlar",
      certificationsSub: "GOST 15860-93 • «Sanoatkontexnazorat» DI litsenziyasi",
      savedCards: "Bank kartalari",
      savedAddresses: "Yetkazish manzillari",
      savedAddressesSub: "Saqlangan manzillaringiz ro'yxati",
      orderHistory: "Buyurtmalar tarixi",
      cartTitle: "Haridlar savatchasi",
      clearCart: "Tozalash",
      cartEmptyTitle: "Savatcha bo'sh",
      cartEmptyDesc: "Katalogdan ballon yoki aksessuar qo'shing — u shu yerda paydo bo'ladi",
      btnApplyPromo: "Qo'llash",
      cartSubtotalLabel: "Mahsulotlar summasi",
      cartDiscountLabel: "Promokod bo'yicha chegirma",
      cartTotalLabel: "Jami to'lov",
      btnCheckoutCart: "Xaridni rasmiylashtirish",
      btnBrowseCatalog: "Ballonlar katalogiga o'tish",
      myBalanceModalTitle: "Poytug Club bonuslari",
      myBalanceModalSub: "Sodiqlik dasturi va keshbek",
      goldLevelCashback: "Oltin daraja • 2% Keshbek",
      balanceHintText: "1 bonus = 1 so'm. To'lovning 50% gacha qismini bonuslar bilan to'lang!",
      bonusHistoryTitle: "Bonuslar tarixi",
      btnRefillWithDiscount: "Chegirma bilan gaz quyish",
      btnTopUpBalance: "Balansni to'ldirish",
      topupTitle: "Balansni to'ldirish",
      topupAmountLabel: "To'ldirish summasi (UZS)",
      topupMethodLabel: "To'ldirish usuli",
      topupPrimaryCard: "Asosiy karta",
      topupFromBalance: "Hisob balansidan",
      topupClickDesc: "Click ilovasi orqali to'lov",
      topupPaymeDesc: "Payme orqali to'lov",
      btnTopupSubmit: "Hisobni to'ldirish",
      addNewCardTitle: "Yangi karta qo'shish",
      btnSaveCard: "Kartani saqlash",
      addNewAddressTitle: "Yangi manzil qo'shish",
      btnSaveAddress: "Manzilni saqlash",
      emergencyServiceTitle: "104 Gaz avariya xizmati",
      emergencyServiceSub: "Gaz hidi sezilganda shoshilinch ko'rsatmalar",
      safetyStep1: "Darhol ballondagi ventilni yoping.",
      safetyStep2: "Xonani shamollatish uchun deraza va eshiklarni oching.",
      safetyStep3: "Chiroq kalitlari, elektr jihozlari va gugurtdan foydalanmang.",
      safetyStep4: "Binodan tashqariga chiqing va 104 avariya xizmatiga qo'ng'iroq qiling.",
      btnCall104: "104 xizmatini chaqirish",
      fiscalReceiptTitle: "Elektron fiskal chek",
      fiscalReceiptSub: "Rasmiy xarid cheki",
      receiptGoods: "Mahsulotlar summasi:",
      receiptDiscount: "Chegirma:",
      receiptDelivery: "Yetkazib berish:",
      receiptTotal: "JAMI TO'LOV:",
      receiptPaidUzcard: "Uzcard kartasi orqali to'landi",
      receiptQr: "Soliq.uz fiskal QR-kod",
      btnCloseReceipt: "Chekni yopish",
      aboutCompanyTitle: "«Poytug GNS» kompaniyasi haqida",
      aboutCompanySub: "O'zbekistonda sertifikatlangan LPG yetkazib beruvchi",
      aboutCompanyText: "«Poytug' GNS» MCHJ — O'zbekiston aholisi va korxonalari uchun suyuqlantirilgan uglevodorod gazi (LPG / propan-butan) yetkazib beruvchi yetakchi kompaniya. Biz 100% aniq to'ldirish, muntazam texnik ko'rik va 30 daqiqa ichida tezkor yetkazib berishni kafolatlaymiz.",
      aboutOrderBadge: "Poytug GNS orqali yetkazib berish bilan onlayn buyurtma",
      settingsSub: "Interfeys tili va tizim parametrlari",
      langSectionTitle: "Ilova tili / Til / Language",
      paramsSectionTitle: "Parametrlar",
      soundEffects: "Ovoz effektlari",
      pushNotifications: "Push-bildirishnomalar",
      darkTheme: "Qorong'i mavzu",
      priceLabel: "Narx",
      badgeHit: "XIT",
      badgeCompact: "Ixcham"
    },
    en: {
      auth2faTitle: "Sign In",
      authMainTitle: "Account Sign In",
      authMainSub: "Enter phone number and password",
      tabLogin: "Sign In",
      tabRegister: "Sign Up",
      step1of2: "Step 1 of 2 • Credentials",
      step2of2: "Step 2 of 2 • SMS Verification",
      phoneLabel: "Phone Number",
      passwordLabel: "Password",
      forgotPassword: "Forgot password?",
      demoHint: "Demo: 123456",
      btnContinue2fa: "Continue to SMS OTP",
      btnContinueGuest: "Continue as Guest",
      authDisclaimer: "By tapping «Continue», you agree to Poytug GNS safety and delivery terms",
      otpTitle: "SMS Verification",
      otpSubtitle: "Enter the 4-digit verification code",
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
      topUp: "Top Up",
      security2fa: "Security & 2FA",
      settings: "Settings",
      aboutCompany: "About Company",
      support: "Support Service",
      btnLogout: "Log Out",
      sectionManagement: "Management",
      sectionInfo: "Information",
      menuSafety104: "Safety 104",
      refillGasTitle: "LPG Gas Refill",
      refillGasSub: "Fast refill for your cylinder with door delivery",
      statusEmpty: "EMPTY 0%",
      statusFilling: "REFILLING...",
      statusFull: "FILLED 100%",
      refuelReady: "Cylinder ready for refilling",
      btnRefill: "REFILL GAS",
      selectCylinderTitle: "Select Cylinder Size",
      selectCylinderSub: "Swipe to switch between sizes",
      cyl10Title: "Cylinder 10 KG",
      cyl20Title: "Cylinder 20 KG",
      pillBestHome: "For Home & Kitchen",
      pillCompact: "Compact / Outdoor",
      pillIndustrial: "Commercial & Heating",
      cylQuantityLabel: "Cylinder Quantity:",
      wholesaleDiscountTitle: "Wholesale Discount (10+ pcs)",
      wholesaleDiscountDesc: "Wholesale discount from 15% + specialized transport + E-invoice",
      btnConfirmSelection: "Confirm Selection",
      fillingProgressTitle: "Gas Refilling Process...",
      pressure: "Pressure",
      gasVolume: "Volume",
      totalCost: "Total Cost",
      addressSelectTitle: "Delivery Address",
      addressSelectSub: "Choose a saved address or specify a new one",
      addrHome: "Home",
      addrDacha: "Summer House",
      addrWork: "Work",
      addrOther: "Other",
      noSavedAddresses: "No saved addresses",
      addAddressPrompt: "Add delivery address for express ordering",
      btnAddAddress: "Add Address / Pin on Map",
      backToSavedAddresses: "Back to List",
      newAddressTitle: "New Delivery Address",
      newAddressSub: "Enter address or pinpoint location on map",
      mapOverlayHint: "Tap on the map to set delivery pinpoint",
      btnSaveAndUseAddress: "Save & Continue",
      btnProceedPayment: "Proceed to Payment",
      paymentTitle: "Order Payment",
      paymentSub: "Choose your payment method",
      deliveryFee: "Door Delivery",
      free: "FREE",
      totalToPay: "Total Amount:",
      paymentMethodSection: "Payment Method",
      payCash: "Cash on Delivery",
      payCashSub: "Pay courier upon handover",
      payOnlineFast: "1-Click fast online payment",
      payUzcardHumo: "Uzcard / Humo (Online)",
      payOnline: "Click / Payme",
      payOnlineSub: "Digital Wallet / Installments",
      payInvoice: "E-Invoice (Legal Entities)",
      payInvoiceSub: "For companies and corporate clients with electronic invoices",
      innLabel: "Company Tax ID / INN (9 digits)",
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
      navStore: "Store",
      navAccount: "Profile",
      mapTitle: "LPG Stations Map",
      mapSub: "Poytug cylinder refill and delivery stations network",
      mapSearchPlaceholder: "Search LPG station in Tashkent...",
      openNow: "Open Now",
      btnBuildRoute: "Get Directions",
      btnOrderHere: "Order From Here",
      storeTitle: "Gas Equipment Store",
      storeSub: "New certified cylinders, stoves and accessories",
      btnBuy: "Buy Now",
      prod1Title: "Steel Cylinder 20 kg (New)",
      prod1Desc: "High steel durability + safety relief valve",
      prod2Title: "Kit: Gas Regulator + 2m Hose",
      prod2Desc: "Low pressure metal regulator + reinforced hose with clamps",
      prod3Title: "Steel Cylinder 10 kg (New)",
      prod3Desc: "Compact cylinder for outdoor, grill and cottage",
      prod4Title: "2-Burner Gas Stove",
      prod4Desc: "Tabletop stove with flame supervision device for LPG",
      myProfileTitle: "My Profile",
      myProfileSub: "Account management, security and addresses",
      support247: "24/7 Support Service",
      certificationsTitle: "Official Certifications",
      certificationsSub: "GOST 15860-93 • State Industrial Safety Inspectorate License",
      savedCards: "Bank Cards",
      savedAddresses: "Delivery Addresses",
      savedAddressesSub: "List of your saved addresses",
      orderHistory: "Order History",
      cartTitle: "Shopping Cart",
      clearCart: "Clear all",
      cartEmptyTitle: "Shopping cart is empty",
      cartEmptyDesc: "Add a cylinder or accessory from the catalog to see it here",
      btnApplyPromo: "Apply",
      cartSubtotalLabel: "Goods subtotal",
      cartDiscountLabel: "Promo discount",
      cartTotalLabel: "Total Amount",
      btnCheckoutCart: "Proceed to Checkout",
      btnBrowseCatalog: "Browse Cylinder Catalog",
      myBalanceModalTitle: "Poytug Club Bonuses",
      myBalanceModalSub: "Loyalty Program & Cashback",
      goldLevelCashback: "Gold Level • 2% Cashback",
      balanceHintText: "1 point = 1 UZS. Pay up to 50% of your refuel with bonus points!",
      bonusHistoryTitle: "Bonus History",
      btnRefillWithDiscount: "Refuel with Discount",
      btnTopUpBalance: "Top Up Balance",
      topupTitle: "Top Up Balance",
      topupAmountLabel: "Top Up Amount (UZS)",
      topupMethodLabel: "Top Up Method",
      topupPrimaryCard: "Primary Card",
      topupFromBalance: "From Account Balance",
      topupClickDesc: "Payment via Click application",
      topupPaymeDesc: "Payment via Payme",
      btnTopupSubmit: "Top Up Account",
      addNewCardTitle: "Add New Card",
      btnSaveCard: "Save Card",
      addNewAddressTitle: "Add New Address",
      btnSaveAddress: "Save Address",
      emergencyServiceTitle: "104 Gas Emergency Service",
      emergencyServiceSub: "Emergency instructions when detecting gas odor",
      safetyStep1: "Immediately close the cylinder valve.",
      safetyStep2: "Open windows and doors to ventilate the area.",
      safetyStep3: "Do not operate light switches, electrical appliances or matches.",
      safetyStep4: "Evacuate the premises and call emergency service 104.",
      btnCall104: "Call 104 Emergency",
      fiscalReceiptTitle: "Electronic Fiscal Receipt",
      fiscalReceiptSub: "Official purchase receipt",
      receiptGoods: "Goods subtotal:",
      receiptDiscount: "Discount:",
      receiptDelivery: "Delivery:",
      receiptTotal: "TOTAL TO PAY:",
      receiptPaidUzcard: "Paid with Uzcard",
      receiptQr: "Soliq.uz fiscal QR-code",
      btnCloseReceipt: "Close Receipt",
      aboutCompanyTitle: "About «Poytug GNS»",
      aboutCompanySub: "Certified LPG provider in Uzbekistan",
      aboutCompanyText: "LLC «Poytug' GNS» is a premier liquefied petroleum gas (LPG / propane-butane) provider for residents and commercial businesses in Uzbekistan. We guarantee 100% accurate refilling, regular cylinder inspection and express 30-minute delivery.",
      aboutOrderBadge: "Online ordering with Poytug GNS delivery",
      settingsSub: "Interface language and system settings",
      langSectionTitle: "App Language / Til / Language",
      paramsSectionTitle: "Preferences",
      soundEffects: "Sound Effects",
      pushNotifications: "Push Notifications",
      darkTheme: "Dark Theme",
      priceLabel: "Price",
      badgeHit: "HIT",
      badgeCompact: "Compact"
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
      if (translations[lang] && translations[lang][key] !== undefined) {
        el.textContent = translations[lang][key];
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (translations[lang] && translations[lang][key] !== undefined) {
        el.setAttribute('placeholder', translations[lang][key]);
      }
    });

    // Update cylinder live badge text if needed
    const cylStatusText = document.getElementById('cyl-status-text');
    if (cylStatusText) {
      if (typeof percent !== 'undefined' && percent > 0 && percent < 100) {
        cylStatusText.textContent = `${translations[lang].statusFilling || 'ЗАПРАВКА'} ${percent}%`;
      } else if (typeof percent !== 'undefined' && percent >= 100) {
        cylStatusText.textContent = translations[lang].statusFull || '100% ЗАПРАВЛЕН';
      } else {
        cylStatusText.textContent = translations[lang].statusEmpty || 'ПУСТОЙ 0%';
      }
    }

    const refuelStatusText = document.getElementById('refuel-status-text');
    if (refuelStatusText && (!isHomeRefueling)) {
      refuelStatusText.textContent = translations[lang].refuelReady || 'Баллон готов к заправке';
    }
  }

  setLanguage(currentLang);

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetLang = btn.dataset.lang;
      setLanguage(targetLang);
      const langNames = { ru: "Русский язык", uz: "O'zbek tili", en: "English" };
      showToast(`${translations[targetLang].settings}: ${langNames[targetLang] || targetLang.toUpperCase()}`);
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
    closeDrawer();
    switchScreen('screen-auth');
    switchAuthTab('login');
  }

  // Unified Logout Engine
  function handleLogout() {
    isAuth = false;
    localStorage.setItem('lpg_auth', 'false');

    const drawerNameEl = document.getElementById('drawer-user-name');
    const drawerPhoneEl = document.getElementById('drawer-user-phone');
    const accNameEl = document.getElementById('acc-user-name');
    const accPhoneEl = document.getElementById('acc-user-phone');
    const drawerLogoutText = document.getElementById('btn-drawer-logout-text');
    const accLogoutText = document.getElementById('btn-acc-logout-text');

    if (drawerNameEl) drawerNameEl.textContent = "Гостевой режим";
    if (drawerPhoneEl) drawerPhoneEl.textContent = "Войдите для заказа и пополнения";
    if (accNameEl) accNameEl.textContent = "Гостевой режим";
    if (accPhoneEl) accPhoneEl.textContent = "Нажмите, чтобы войти в аккаунт →";
    if (drawerLogoutText) drawerLogoutText.textContent = "Войти в аккаунт";
    if (accLogoutText) accLogoutText.textContent = "Войти в аккаунт";

    updateBalanceDisplay();
    closeDrawer();
    document.querySelectorAll('.modal-backdrop.active').forEach(m => m.classList.remove('active'));

    switchScreen('screen-auth');
    switchAuthTab('login');
    showToast("Вы вышли из аккаунта");
  }

  window.handleLogout = handleLogout;

  // Enter Application Helper
  function enterApp(asGuest = false, name = "Алишер Каримов", phone = "+998 90 123-45-67") {
    switchScreen('screen-home');

    const drawerNameEl = document.getElementById('drawer-user-name');
    const drawerPhoneEl = document.getElementById('drawer-user-phone');
    const accNameEl = document.getElementById('acc-user-name');
    const accPhoneEl = document.getElementById('acc-user-phone');
    const drawerLogoutText = document.getElementById('btn-drawer-logout-text');
    const accLogoutText = document.getElementById('btn-acc-logout-text');

    if (!asGuest) {
      isAuth = true;
      currentUserName = name;
      userPhone = phone;
      localStorage.setItem('lpg_auth', 'true');
      localStorage.setItem('lpg_phone', userPhone);
      localStorage.setItem('lpg_user_name', currentUserName);

      if (drawerNameEl) drawerNameEl.textContent = currentUserName;
      if (drawerPhoneEl) drawerPhoneEl.textContent = userPhone;
      if (accNameEl) accNameEl.textContent = currentUserName;
      if (accPhoneEl) accPhoneEl.textContent = userPhone;
      if (drawerLogoutText) drawerLogoutText.textContent = "Выйти из аккаунта";
      if (accLogoutText) accLogoutText.textContent = "Выйти из аккаунта";

      showToast(`Добро пожаловать, ${currentUserName}!`);
      launchConfettiCannon();
    } else {
      isAuth = false;
      localStorage.setItem('lpg_auth', 'false');

      if (drawerNameEl) drawerNameEl.textContent = "Гостевой режим";
      if (drawerPhoneEl) drawerPhoneEl.textContent = "Войдите для заказа и пополнения";
      if (accNameEl) accNameEl.textContent = "Гостевой режим";
      if (accPhoneEl) accPhoneEl.textContent = "Нажмите, чтобы войти в аккаунт →";
      if (drawerLogoutText) drawerLogoutText.textContent = "Войти в аккаунт";
      if (accLogoutText) accLogoutText.textContent = "Войти в аккаунт";

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

  if (isAuth) {
    enterApp(false, currentUserName, userPhone || "+998 90 123-45-67");
  } else {
    switchScreen('screen-auth');
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

  if (inputLoginPhone) attachPhoneMask(inputLoginPhone);

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

  if (inputRegPhone) attachPhoneMask(inputRegPhone);

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
    btnLogout.addEventListener('click', handleLogout);
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

  function openLoyaltyModal() {
    if (!isAuth) {
      redirectToAuth("🔒 Для просмотра бонусов Poytug Club необходимо войти в аккаунт");
      return;
    }
    updateBalanceDisplay();
    openModal('modal-balance');
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
      openLoyaltyModal();
    });
  }

  const btnUseBalanceNow = document.getElementById('btn-use-balance-now');
  if (btnUseBalanceNow) {
    btnUseBalanceNow.addEventListener('click', () => {
      closeModal('modal-balance');
      switchScreen('screen-home');
      showToast("Выберите объем заправки для применения бонусов");
    });
  }

  const btnOpenTopupFromLoyalty = document.getElementById('btn-open-topup-from-loyalty');
  if (btnOpenTopupFromLoyalty) {
    btnOpenTopupFromLoyalty.addEventListener('click', () => {
      closeModal('modal-balance');
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
  if (btnMenuEmergency) {
    btnMenuEmergency.addEventListener('click', () => {
      closeDrawer();
      openEmergencyModal();
    });
  }

  if (btnCall104Direct) {
    btnCall104Direct.addEventListener('click', () => {
      showToast("Вызов аварийной газовой службы 104...");
    });
  }

  document.getElementById('btn-menu-balance').addEventListener('click', () => {
    closeDrawer();
    openLoyaltyModal();
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
    btnDrawerLogout.addEventListener('click', handleLogout);
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

    percent = 0;
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
      const safeTitle = escapeHTML(addr.title);
      const safeText = escapeHTML(addr.text);
      return `
        <div class="address-option ${isActive ? 'selected' : ''}" data-address="${safeText}">
          <div class="radio-check">
            ${isActive ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg>' : ''}
          </div>
          <div class="addr-icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div class="addr-info">
            <h4 class="addr-title">${safeTitle}</h4>
            <p class="addr-desc">${safeText}</p>
          </div>
          <button type="button" class="addr-edit-btn" title="Редактировать адрес" onclick="event.stopPropagation(); switchAddressSubview('form');">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.address-option').forEach(opt => {
      opt.addEventListener('click', () => {
        container.querySelectorAll('.address-option').forEach(o => {
          o.classList.remove('selected');
          const rc = o.querySelector('.radio-check');
          if (rc) rc.innerHTML = '';
        });
        opt.classList.add('selected');
        const activeRc = opt.querySelector('.radio-check');
        if (activeRc) {
          activeRc.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path d="M20 6 9 17l-5-5"/></svg>';
        }
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
      if (!isAuth) {
        redirectToAuth("🔒 Для оформления заказа войдите в аккаунт");
        return;
      }
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
    if (!isAuth) {
      redirectToAuth("🔒 Для перехода к оплате войдите в аккаунт");
      return;
    }
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
    if (!isAuth) {
      redirectToAuth("🔒 Для подтверждения и оплаты заказа войдите в аккаунт");
      return;
    }
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
    const btnClearCart = document.getElementById('btn-clear-cart-all');
    const subtotalEl = document.getElementById('cart-subtotal-amount');
    const discountRow = document.getElementById('cart-discount-row');
    const discountAmountEl = document.getElementById('cart-discount-amount');
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
    if (btnClearCart) btnClearCart.style.display = isEmpty ? 'none' : 'inline-flex';

    if (!isEmpty && list) {
      list.innerHTML = cart.map((item, i) => `
        <div class="item">
          <span class="name">${escapeHTML(item.name)}</span>
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
    let discountVal = Math.round(rawTotal * (appliedPromoDiscount / 100));
    let finalTotal = rawTotal - discountVal;

    if (subtotalEl) subtotalEl.textContent = `${rawTotal.toLocaleString().replace(/,/g, ' ')} UZS`;
    if (discountRow) {
      if (appliedPromoDiscount > 0 && discountVal > 0) {
        discountRow.style.display = 'flex';
        if (discountAmountEl) discountAmountEl.textContent = `-${discountVal.toLocaleString().replace(/,/g, ' ')} UZS (${appliedPromoDiscount}%)`;
      } else {
        discountRow.style.display = 'none';
      }
    }
    if (totalAmountEl) totalAmountEl.textContent = `${finalTotal.toLocaleString().replace(/,/g, ' ')} UZS`;
  }

  const btnClearCartAll = document.getElementById('btn-clear-cart-all');
  if (btnClearCartAll) {
    btnClearCartAll.addEventListener('click', () => {
      if (cart.length === 0) return;
      cart = [];
      appliedPromoDiscount = 0;
      const promoInp = document.getElementById('input-promocode');
      if (promoInp) promoInp.value = '';
      updateCartUI();
      showToast("Корзина очищена");
    });
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
    if (!wrapper) return;
    if (!isAuth || savedCards.length === 0) {
      wrapper.innerHTML = `
        <div style="padding:20px; text-align:center; color:var(--text-2); font-size:13px;">
          ${!isAuth ? '🔒 Войдите в аккаунт для управления банковскими картами' : 'Нет привязанных карт'}
        </div>
      `;
      return;
    }
    wrapper.innerHTML = savedCards.map(c => `
      <div class="account-card-item" style="margin-bottom:8px;">
        <div class="acc-icon blue-bg"><i class="fa-solid fa-credit-card"></i></div>
        <div class="acc-text">
          <h4>${escapeHTML(c.type)} (${escapeHTML(c.exp)})</h4>
          <p>${escapeHTML(c.pan)}</p>
        </div>
      </div>
    `).join('');
  }

  const inputCardNum = document.getElementById('input-card-number');
  const inputCardExp = document.getElementById('input-card-expiry');
  const previewNum = document.getElementById('preview-card-number');
  const previewExp = document.getElementById('preview-card-expiry');
  const previewLogo = document.getElementById('preview-card-logo');

  if (inputCardNum) {
    inputCardNum.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 16);
      e.target.value = val.replace(/(.{4})/g, '$1 ').trim();

      if (val.startsWith('8600')) previewLogo.textContent = 'Uzcard';
      else if (val.startsWith('9860')) previewLogo.textContent = 'Humo';
      else previewLogo.textContent = 'Visa';

      previewNum.textContent = val.replace(/(.{4})/g, '$1 ').trim() || '8600 •••• •••• ••••';
    });
  }

  if (inputCardExp) {
    inputCardExp.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (val.length >= 2) {
        val = val.substring(0, 2) + '/' + val.substring(2, 4);
      }
      e.target.value = val;
      previewExp.textContent = val || '12/28';
    });
  }

  document.getElementById('btn-save-new-card').addEventListener('click', () => {
    if (!isAuth) {
      redirectToAuth("🔒 Для сохранения карты войдите в аккаунт");
      return;
    }
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
    if (!list) return;
    if (!isAuth || savedAddresses.length === 0) {
      list.innerHTML = `
        <div style="padding:20px; text-align:center; color:var(--text-2); font-size:13px;">
          ${!isAuth ? '🔒 Войдите в аккаунт для управления адресами доставки' : 'Нет сохраненных адресов'}
        </div>
      `;
      return;
    }
    list.innerHTML = savedAddresses.map(a => `
      <div class="account-card-item" style="margin-bottom:8px;">
        <div class="acc-icon green-bg">${escapeHTML(a.icon)}</div>
        <div class="acc-text">
          <h4>${escapeHTML(a.title)}</h4>
          <p>${escapeHTML(a.text)}</p>
        </div>
      </div>
    `).join('');
  }

  document.getElementById('btn-save-new-address').addEventListener('click', () => {
    if (!isAuth) {
      redirectToAuth("🔒 Для сохранения адреса войдите в аккаунт");
      return;
    }
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
    if (!list) return;
    if (!isAuth) {
      list.innerHTML = `
        <div style="padding:28px 16px; text-align:center; color:var(--text-2); font-size:13.5px;">
          <p style="margin-bottom:14px;">🔒 Войдите в аккаунт, чтобы просмотреть историю ваших заказов</p>
          <button type="button" class="btn btn-primary" onclick="redirectToAuth('Вход в аккаунт')" style="font-size:13px; padding:10px 22px; border-radius:12px; margin:0 auto; cursor:pointer;">Войти в аккаунт</button>
        </div>
      `;
      return;
    }
    list.innerHTML = orderHistory.map(h => `
      <div class="account-card-item" style="margin-bottom:8px;">
        <div class="acc-icon orange-bg"><i class="fa-solid fa-gas-pump"></i></div>
        <div class="acc-text">
          <h4>${escapeHTML(h.title)} (${escapeHTML(h.code)})</h4>
          <p>${escapeHTML(h.date)} • <span style="color:#00e676;">${escapeHTML(h.status)}</span></p>
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

    const safeMsg = escapeHTML(msg);
    chatMessages.innerHTML += `<div class="chat-msg user">${safeMsg}</div>`;
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


  // ==================== MODAL & BACKDROP EVENT LISTENERS ====================
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
        closeModal(bd.id);
      }
    });
  });

  // Keyboard accessibility: ESC closes any open modal or side drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.active').forEach(m => closeModal(m.id));
      closeDrawer();
    }
  });

});
