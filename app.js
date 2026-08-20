/* ==========================================================================
   POYTUG GNS — COMPLETE INTERACTIVE ENGINE v3.1 (FULL PRODUCTION READY)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==================== STATE MANAGEMENT ====================
  let currentLang = localStorage.getItem('lpg_lang') || 'ru';
  let isAuth = localStorage.getItem('lpg_auth') === 'true';
  let userPhone = localStorage.getItem('lpg_phone') || '';
  let currentUserName = localStorage.getItem('lpg_user_name') || "Алишер Алишеров";
  let soundFxEnabled = localStorage.getItem('lpg_sound') !== 'false';
  let isDarkMode = localStorage.getItem('lpg_dark') !== 'false';

  let cylinderQuantity = 1;
  let isWholesale = false;
  let appliedBonusDiscount = 0;

  let selectedCylinder = { type: '10kg', price: 45000, wholesalePrice: 38000, name: 'Баллон 10 КГ' };
  let selectedAddress = 'г. Ташкент, ул. Амира Темура, 45, кв. 12';
  let selectedPayment = 'cash';
  let companyInn = '';
  let countdownTimerInterval = null;
  let trackingCourierInterval = null;

  let cart = JSON.parse(localStorage.getItem('lpg_cart') || '[]');
  let appliedPromoDiscount = 0;
  let loyaltyBalance = parseInt(localStorage.getItem('lpg_balance') || '25000', 10);

  let savedCards = JSON.parse(localStorage.getItem('lpg_cards') || JSON.stringify([
    { type: 'UZCARD', pan: '8600 •••• •••• 4412', exp: '12/28' },
    { type: 'HUMO', pan: '9860 •••• •••• 9821', exp: '08/29' }
  ]));

  let savedAddresses = JSON.parse(localStorage.getItem('lpg_addresses') || JSON.stringify([
    { title: 'Дом', text: 'г. Ташкент, ул. Амира Темура, 45, кв. 12', icon: '🏠' },
    { title: 'Дача / Частный дом', text: 'г. Ташкент, Сергели, Массив 4, д. 18', icon: '🏡' }
  ]));

  let orderHistory = JSON.parse(localStorage.getItem('lpg_orders') || JSON.stringify([
    { code: 'LPG-8821', date: '14 Авг 2026', title: 'Заправка баллона 20 кг (1 шт)', price: 75000, status: 'Доставлен' },
    { code: 'LPG-7104', date: '02 Июл 2026', title: 'Заправка баллона 10 кг (1 шт)', price: 45000, status: 'Доставлен' }
  ]));

  function saveAppState() {
    localStorage.setItem('lpg_cards', JSON.stringify(savedCards));
    localStorage.setItem('lpg_addresses', JSON.stringify(savedAddresses));
    localStorage.setItem('lpg_orders', JSON.stringify(orderHistory));
    localStorage.setItem('lpg_balance', loyaltyBalance.toString());
    localStorage.setItem('lpg_cart', JSON.stringify(cart));
  }

  function updateBalanceDisplay() {
    const accBal = document.getElementById('acc-balance-display');
    const modalBal = document.getElementById('modal-balance-display');
    const menuBal = document.getElementById('menu-balance-amount');
    if (accBal) accBal.textContent = `${loyaltyBalance.toLocaleString()} UZS`;
    if (modalBal) modalBal.textContent = loyaltyBalance.toLocaleString();
    if (menuBal) menuBal.textContent = `${loyaltyBalance.toLocaleString()} UZS`;
  }

  // Apply Theme on load
  document.body.classList.toggle('theme-light', !isDarkMode);
  const toggleDarkTheme = document.getElementById('toggle-dark-theme');
  if (toggleDarkTheme) toggleDarkTheme.checked = isDarkMode;
  const toggleSoundFx = document.getElementById('toggle-sound-fx');
  if (toggleSoundFx) toggleSoundFx.checked = soundFxEnabled;


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
      resetPwdTitle: "Восстановление пароля",
      resetPwdSub: "Введите ваш номер телефона для отправки кода сброса пароля",
      btnSendResetCode: "Отправить СМС-код",
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
      myBalanceModalTitle: "Мой баланс и баллы",
      myBalanceModalSub: "Бонусная программа лояльности Poytug Club",
      security2fa: "Безопасность и 2FA",
      settings: "Настройки",
      appLanguage: "Язык приложения / Til",
      settingsSubPreview: "Язык, звуковые эффекты, тема",
      aboutCompany: "О компании",
      aboutCompanyTitle: "О компании «Poytug GNS»",
      aboutCompanySub: "Официальный сертифицированный поставщик LPG в Узбекистане",
      support: "Служба поддержки",
      btnLogout: "Выйти из аккаунта",
      btnSignIn: "Войти / Зарегистрироваться",
      heroServiceTag: "Экспресс-доставка газа",
      refillGasTitle: "Заправка СУГ / LPG",
      refillGasSub: "Быстрая заправка вашего баллона с доставкой",
      statusEmpty: "ПУСТОЙ",
      btnRefill: "ЗАПРАВИТЬ",
      selectCylinderTitle: "Выберите размер баллона",
      selectCylinderSub: "Круговое переключение между баллонами",
      cyl10Title: "Баллон 10 КГ",
      cyl20Title: "Баллон 20 КГ",
      pillBestHome: "Для дома и кухни",
      pillCompact: "Компактный / Дача",
      pillIndustrial: "Для кафе и отопления",
      cylindersQtyLabel: "Количество баллонов:",
      b2bWholesaleTitle: "ОПТОВЫЙ ЗАКАЗ (от 10 шт.)",
      b2bWholesaleSub: "Оптовая скидка до 15% + Доставка спец-транспортом + Е-Фактура",
      btnConfirmSelection: "Подтвердить выбор",
      fillingProgressTitle: "Процесс заправки газа...",
      pressure: "Давление",
      gasVolume: "Объем",
      totalCost: "Стоимость",
      addressSelectTitle: "Адрес доставки",
      addressSelectSub: "Выберите сохраненный адрес или укажите новый",
      addrHome: "Дом",
      addrDacha: "Дача / Частный дом",
      tagHome: "🏠 Дом",
      tagDacha: "🏡 Дача",
      tagWork: "🏢 Работа",
      tagOther: "📍 Другое",
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
      payB2BInvoice: "Перечислением (Е-Фактура)",
      b2bInvoiceSub: "Для юрлиц и организаций с выпиской счета",
      companyInnLabel: "ИНН Компании / Организации:",
      companyInnSub: "Для автоматического выставления Е-Фактуры",
      btnConfirmOrder: "Подтвердить и Оплатить",
      orderProcessedTitle: "Заказ взят в обработку!",
      orderProcessedSub: "Курьер спешит к вам с заправленным баллоном",
      estimatedWait: "Примерное время ожидания",
      statusAccepted: "Принят",
      statusInTransit: "В пути",
      statusDelivered: "Доставлен",
      btnViewReceipt: "Электронный чек (Soliq.uz)",
      btnNewOrder: "Сделать новый заказ",
      navHome: "Главная",
      navMap: "Карта",
      navStore: "Баллоны",
      navAccount: "Аккаунт",
      storeTitle: "Магазин газовых баллонов",
      storeSub: "Новые пустые и заправленные баллоны с гарантией",
      store20kgTitle: "Газовый баллон 20 КГ (Новый)",
      store20kgDesc: "Высокопрочный стальной баллон с предохранительным клапаном.",
      store10kgTitle: "Газовый баллон 10 КГ (Новый)",
      store10kgDesc: "Удобный портативный баллон для дачи, гриля и походов.",
      storeRegulatorTitle: "Комплект: Редуктор + Шланг 2м",
      storeRegulatorDesc: "Итальянский редуктор давления газа и армированный шланг с манометром.",
      qtySublabel: "Кол-во:",
      btnBuy: "Купить",
      verifiedClient: "Подтвержденный клиент",
      bonusCashbackSub: "Бонусные баллы и кэшбэк",
      savedCards: "Мои карты",
      savedCardsSub: "Управление привязанными картами Uzcard и Humo",
      savedAddresses: "Мои адреса",
      savedAddressesSub: "Список ваших сохраненных адресов доставки",
      orderHistory: "История заказов",
      orderHistorySub: "Просмотр всех заправок",
      twoFaStatusActive: "Пароль + СМС (Включено)",
      aboutSubText: "Лицензия, безопасность, контакты",
      cartTitle: "Корзина покупок",
      cartSub: "Ваши выбранные товары и расчет доставки",
      btnApply: "Применить",
      cartItemsCost: "Стоимость товаров:",
      cartPromoDiscount: "Скидка по промокоду:",
      cartBonusDiscount: "Скидка бонусами клуба:",
      btnCheckout: "Оформить заказ",
      btnExploreCatalog: "Перейти в каталог",
      cartEmptyTitle: "Ваша корзина пуста",
      cartEmptySub: "Выберите заправку газа или новые баллоны в каталоге",
      openNow: "Открыто",
      btnBuildRoute: "Маршрут",
      btnOrderHere: "Заказать отсюда",
      emergencyTitle: "Аварийная служба газа",
      emergencySub: "Инструкция по безопасности при обнаружении запаха газа СУГ:",
      emergencyCallBtn: "Вызвать Аварийную 104",
      safetyStep1: "Немедленно перекройте вентиль газового баллона.",
      safetyStep2: "Откройте все окна и двери для проветривания.",
      safetyStep3: "Не включайте выключатели света, выдерните приборы.",
      safetyStep4: "Покиньте помещение и вызовите службу 104.",
      soliqReceiptTitle: "Электронный Фискальный Чек",
      soliqReceiptCode: "Soliq.uz Фискальный код",
      addNewCardHeader: "Добавить новую карту",
      btnSaveCard: "Сохранить карту",
      addNewAddressHeader: "Добавить новый адрес",
      btnSaveAddress: "Сохранить адрес",
      goldLevelCashback: "Золотой уровень • 2% Кэшбэк",
      balanceHintText: "1 бонус = 1 сум. Оплачивайте бонусами до 50% стоимости заправки и покупки баллонов!",
      bonusHistoryTitle: "История начислений",
      btnUseBonus: "Заправить газ со скидкой",
      soundFxSetting: "Звуковые эффекты (шипение газа)",
      pushNotifSetting: "Push-уведомления",
      darkThemeSetting: "Темная тема интерфейса",
      settingsSub: "Управление параметрами отображения и звука",
      companyDesc: "ООО «Poytug' GNS» — надежный поставщик сжиженного углеводородного газа (СУГ / Пропан-Бутан) для населения и предприятий Узбекистана. Мы гарантируем 100% точность заправки, регулярное освидетельствование баллонов и экспресс-доставку до двери в течение 30 минут.",
      companyBadgeIso: "Государственный сертификат ISO 9001:2026",
      companyBadge247: "Круглосуточная заправка и доставка 24/7",
      companyBadgeCallCenter: "Единый колл-центр: +998 71 200-00-00",
      companyBadgeOffice: "Центральный офис: г. Ташкент, ул. Катартал, 28",
      supportChatHeader: "Онлайн-чат с оператором Poytug GNS",
      botBadgeTitle: "Poytug Ассистент",
      supportBotGreeting: "Здравствуйте! Я онлайн-помощник Poytug GNS. Чем могу помочь по поводу заправки или доставки газа?"
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
      resetPwdTitle: "Parolni tiklash",
      resetPwdSub: "Parolni tiklash kodini olish uchun telefon raqamingizni kiriting",
      btnSendResetCode: "SMS-kodni yuborish",
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
      myBalanceModalTitle: "Mening balansim va ballarim",
      myBalanceModalSub: "Poytug Club sodiqlik bonus dasturi",
      security2fa: "Xavfsizlik va 2FA",
      settings: "Sozlamalar",
      appLanguage: "Ilova tili / Til",
      settingsSubPreview: "Til, tovushlar, mavzu",
      aboutCompany: "Kompaniya haqida",
      aboutCompanyTitle: "«Poytug GNS» kompaniyasi haqida",
      aboutCompanySub: "O'zbekistonda rasmiy sertifikatlangan LPG yetkazib beruvchi",
      support: "Qo'llab-quvvatlash",
      btnLogout: "Hisobdan chiqish",
      btnSignIn: "Kirish / Ro'yxatdan o'tish",
      heroServiceTag: "Tezkor gaz yetkazish",
      refillGasTitle: "LPG Gaz Quyish",
      refillGasSub: "Balloningizni tezkor to'ldirish va yetkazish",
      statusEmpty: "BO'SH",
      btnRefill: "GAZ QUYISH",
      selectCylinderTitle: "Ballon hajmini tanlang",
      selectCylinderSub: "Ballonlar o'rtasida aylanma almashtirish",
      cyl10Title: "10 KG ballon",
      cyl20Title: "20 KG ballon",
      pillBestHome: "Uy va oshxona uchun",
      pillCompact: "Ixcham / Dala hovli",
      pillIndustrial: "Kafe va isitish uchun",
      cylindersQtyLabel: "Ballonlar soni:",
      b2bWholesaleTitle: "ULGURJI BUYURTMA (10 tadan)",
      b2bWholesaleSub: "15% gacha ulgurji chegirma + Maxsus transport + E-Faktura",
      btnConfirmSelection: "Tanlovni tasdiqlash",
      fillingProgressTitle: "Gaz to'ldirish jarayoni...",
      pressure: "Bosim",
      gasVolume: "Hajmi",
      totalCost: "Narxi",
      addressSelectTitle: "Yetkazib berish manzili",
      addressSelectSub: "Saqlangan manzilni tanlang yoki yangisini kiriting",
      addrHome: "Uy",
      addrDacha: "Dala hovli",
      tagHome: "🏠 Uy",
      tagDacha: "🏡 Dala hovli",
      tagWork: "🏢 Ishxona",
      tagOther: "📍 Boshqa",
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
      payB2BInvoice: "Bank o'tkazmasi (E-Faktura)",
      b2bInvoiceSub: "Yuridik shaxslar va tashkilotlar uchun hisob-faktura",
      companyInnLabel: "Tashkilot STIR (INN):",
      companyInnSub: "E-Faktura avtomatik yuborilishi uchun",
      btnConfirmOrder: "Tasdiqlash va To'lash",
      orderProcessedTitle: "Buyurtma qabul qilindi!",
      orderProcessedSub: "Kuryer to'ldirilgan ballon bilan yo'lda",
      estimatedWait: "Taxminiy kutish vaqti",
      statusAccepted: "Qabul qilindi",
      statusInTransit: "Yo'lda",
      statusDelivered: "Yetkazildi",
      btnViewReceipt: "Elektron chek (Soliq.uz)",
      btnNewOrder: "Yangi buyurtma berish",
      navHome: "Bosh sahifa",
      navMap: "Xarita",
      navStore: "Ballonlar",
      navAccount: "Kabinet",
      storeTitle: "Gaz ballonlari do'koni",
      storeSub: "Kafolatlangan yangi bo'sh va to'la ballonlar",
      store20kgTitle: "20 KG Gaz balloni (Yangi)",
      store20kgDesc: "Xavfsizlik klapanli yuqori mustahkam po'lat ballon.",
      store10kgTitle: "10 KG Gaz balloni (Yangi)",
      store10kgDesc: "Dala hovli, mangal va sayohatlar uchun qulay ixcham ballon.",
      storeRegulatorTitle: "To'plam: Reduktor + 2m Shlang",
      storeRegulatorDesc: "Italiya gaz bosim reduktori va manometrli mustahkamlangan shlang.",
      qtySublabel: "Soni:",
      btnBuy: "Sotib olish",
      verifiedClient: "Tasdiqlangan mijoz",
      bonusCashbackSub: "Bonus ballari va keshbek",
      savedCards: "Mening kartalarim",
      savedCardsSub: "Ulangan Uzcard va Humo kartalarini boshqarish",
      savedAddresses: "Mening manzillarim",
      savedAddressesSub: "Yetkazib berish uchun saqlangan manzillar",
      orderHistory: "Buyurtmalar tarixi",
      orderHistorySub: "Barcha to'ldirishlar ro'yxati",
      twoFaStatusActive: "Parol + SMS (Faol)",
      aboutSubText: "Litsenziya, xavfsizlik, aloqa",
      cartTitle: "Haridlar savatchasi",
      cartSub: "Tanlangan mahsulotlaringiz va yetkazish hisobi",
      btnApply: "Qo'llash",
      cartItemsCost: "Mahsulotlar narxi:",
      cartPromoDiscount: "Promokod bo'yicha chegirma:",
      cartBonusDiscount: "Bonus ballari bo'yicha chegirma:",
      btnCheckout: "Buyurtmani rasmiylashtirish",
      btnExploreCatalog: "Katalogga o'tish",
      cartEmptyTitle: "Savatchangiz bo'sh",
      cartEmptySub: "Katalogdan gaz quyish yoki yangi ballonlarni tanlang",
      openNow: "Ochiq",
      btnBuildRoute: "Yo'nalish tuzish",
      btnOrderHere: "Shu yerdan buyurtma",
      emergencyTitle: "Fevqulodda gaz xizmati",
      emergencySub: "Gaz hidi sezilganda xavfsizlik qoidalari:",
      emergencyCallBtn: "104 Fevqulodda xizmatga qo'ng'iroq",
      safetyStep1: "Darhol gaz balloni ventilini yoping.",
      safetyStep2: "Xonani shamollatish uchun deraza va eshiklarni oching.",
      safetyStep3: "Elektr chiroqlarini yoqmang, asboblarni tarmoqdan uzing.",
      safetyStep4: "Binodan chiqing va 104 xizmatiga qo'ng'iroq qiling.",
      soliqReceiptTitle: "Elektron Fiskal Chek",
      soliqReceiptCode: "Soliq.uz Fiskal kodi",
      addNewCardHeader: "Yangi karta qo'shish",
      btnSaveCard: "Kartani saqlash",
      addNewAddressHeader: "Yangi manzil qo'shish",
      btnSaveAddress: "Manzilni saqlash",
      goldLevelCashback: "Oltin daraja • 2% Keshbek",
      balanceHintText: "1 bonus = 1 so'm. Bonuslar bilan gaz to'ldirish narxining 50% gacha to'lang!",
      bonusHistoryTitle: "Hisoblanishlar tarixi",
      btnUseBonus: "Chegirma bilan gaz quyish",
      soundFxSetting: "Ovozli effektlar (gaz shivirlashi)",
      pushNotifSetting: "Push-bildirishnomalar",
      darkThemeSetting: "Qorong'u interfeys mavzusi",
      settingsSub: "Ko'rinish va ovoz parametrlarini boshqarish",
      companyDesc: "«Poytug' GNS» MChJ — O'zbekiston aholisi va korxonalari uchun suyultirilgan uglevodorod gazi (LPG / Propan-Butan) ishonchli yetkazib beruvchisi. Biz 100% to'g'ri quyish, muntazam ballon ko'rigi va 30 daqiqada yetkazib berishni kafolatlaymiz.",
      companyBadgeIso: "Davlat standarti ISO 9001:2026 sertifikati",
      companyBadge247: "Tunu-kun 24/7 gaz quyish va yetkazish",
      companyBadgeCallCenter: "Yagona koll-markaz: +998 71 200-00-00",
      companyBadgeOffice: "Bosh ofis: Toshkent sh., Qatortol ko'chasi, 28",
      supportChatHeader: "Poytug GNS operatori bilan onlayn chat",
      botBadgeTitle: "Poytug Yordamchisi",
      supportBotGreeting: "Assalomu alaykum! Men Poytug GNS onlayn yordamchisiman. Gaz quyish yoki yetkazish bo'yicha qanday yordam bera olaman?"
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
      resetPwdTitle: "Password Recovery",
      resetPwdSub: "Enter your phone number to receive a password reset SMS code",
      btnSendResetCode: "Send SMS Code",
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
      myBalanceModalTitle: "My Balance & Points",
      myBalanceModalSub: "Poytug Club Loyalty Program",
      security2fa: "Security & 2FA",
      settings: "Settings",
      appLanguage: "App Language / Til",
      settingsSubPreview: "Language, sound effects, theme",
      aboutCompany: "About Company",
      aboutCompanyTitle: "About Poytug GNS",
      aboutCompanySub: "Official certified LPG gas supplier in Uzbekistan",
      support: "Support Service",
      btnLogout: "Log Out",
      btnSignIn: "Sign In / Register",
      heroServiceTag: "Express Gas Delivery",
      refillGasTitle: "LPG Gas Refill",
      refillGasSub: "Fast refill for your cylinder with door delivery",
      statusEmpty: "EMPTY",
      btnRefill: "REFILL GAS",
      selectCylinderTitle: "Select Cylinder Size",
      selectCylinderSub: "Swipe to switch between sizes",
      cyl10Title: "10 KG Cylinder",
      cyl20Title: "20 KG Cylinder",
      pillBestHome: "For Home & Kitchen",
      pillCompact: "Compact / Outdoor",
      pillIndustrial: "Commercial & Heating",
      cylindersQtyLabel: "Number of cylinders:",
      b2bWholesaleTitle: "WHOLESALE ORDER (10+ pcs)",
      b2bWholesaleSub: "Up to 15% discount + Specialized freight + E-Invoice",
      btnConfirmSelection: "Confirm Selection",
      fillingProgressTitle: "Gas Refilling Process...",
      pressure: "Pressure",
      gasVolume: "Volume",
      totalCost: "Total Cost",
      addressSelectTitle: "Delivery Address",
      addressSelectSub: "Choose a saved address or specify a new one",
      addrHome: "Home",
      addrDacha: "Summer House",
      tagHome: "🏠 Home",
      tagDacha: "🏡 Summer House",
      tagWork: "🏢 Office",
      tagOther: "📍 Other",
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
      payB2BInvoice: "Bank Transfer (E-Invoice)",
      b2bInvoiceSub: "For legal entities with tax invoice",
      companyInnLabel: "Company Tax ID (INN):",
      companyInnSub: "For automated E-Invoice issuance",
      btnConfirmOrder: "Confirm & Pay",
      orderProcessedTitle: "Order in Progress!",
      orderProcessedSub: "Courier is on the way with your filled cylinder",
      estimatedWait: "Estimated Waiting Time",
      statusAccepted: "Accepted",
      statusInTransit: "In Transit",
      statusDelivered: "Delivered",
      btnViewReceipt: "Electronic Receipt (Soliq.uz)",
      btnNewOrder: "Place New Order",
      navHome: "Home",
      navMap: "Map",
      navStore: "Cylinders",
      navAccount: "Account",
      storeTitle: "Gas Cylinder Store",
      storeSub: "Brand new empty and refilled cylinders",
      store20kgTitle: "20 KG Gas Cylinder (New)",
      store20kgDesc: "High-strength steel cylinder with safety valve.",
      store10kgTitle: "10 KG Gas Cylinder (New)",
      store10kgDesc: "Convenient portable cylinder for summer houses, grill and camping.",
      storeRegulatorTitle: "Kit: Regulator + 2m Hose",
      storeRegulatorDesc: "Italian gas pressure regulator and reinforced hose with manometer.",
      qtySublabel: "Qty:",
      btnBuy: "Buy Now",
      verifiedClient: "Verified Client",
      bonusCashbackSub: "Bonus points & cashback",
      savedCards: "My Cards",
      savedCardsSub: "Manage your linked Uzcard & Humo cards",
      savedAddresses: "My Addresses",
      savedAddressesSub: "List of saved delivery locations",
      orderHistory: "Order History",
      orderHistorySub: "View all gas refills",
      twoFaStatusActive: "Password + SMS (Enabled)",
      aboutSubText: "License, safety & contacts",
      cartTitle: "Shopping Cart",
      cartSub: "Your selected items and delivery calculation",
      btnApply: "Apply",
      cartItemsCost: "Items Subtotal:",
      cartPromoDiscount: "Promo Discount:",
      cartBonusDiscount: "Loyalty Points Discount:",
      btnCheckout: "Proceed to Checkout",
      btnExploreCatalog: "Browse Catalog",
      cartEmptyTitle: "Your cart is empty",
      cartEmptySub: "Select gas refills or new cylinders from the catalog",
      openNow: "Open Now",
      btnBuildRoute: "Get Directions",
      btnOrderHere: "Order from Here",
      emergencyTitle: "Emergency Gas Service",
      emergencySub: "Safety instructions upon detecting LPG gas odor:",
      emergencyCallBtn: "Call Emergency 104",
      safetyStep1: "Immediately close the gas cylinder valve.",
      safetyStep2: "Open all windows and doors for ventilation.",
      safetyStep3: "Do not turn on light switches, unplug appliances.",
      safetyStep4: "Evacuate the premises and call 104 emergency service.",
      soliqReceiptTitle: "Electronic Fiscal Receipt",
      soliqReceiptCode: "Soliq.uz Fiscal Code",
      addNewCardHeader: "Add New Card",
      btnSaveCard: "Save Card",
      addNewAddressHeader: "Add New Address",
      btnSaveAddress: "Save Address",
      goldLevelCashback: "Gold Tier • 2% Cashback",
      balanceHintText: "1 bonus = 1 UZS. Pay up to 50% of gas refill cost with bonus points!",
      bonusHistoryTitle: "Accrual History",
      btnUseBonus: "Refill Gas with Discount",
      soundFxSetting: "Sound Effects (Gas Hissing)",
      pushNotifSetting: "Push Notifications",
      darkThemeSetting: "Dark Interface Theme",
      settingsSub: "Manage display and sound settings",
      companyDesc: "Poytug GNS LLC is a certified LPG supplier in Uzbekistan. We guarantee 100% filling precision, regular cylinder safety inspection, and express door delivery within 30 minutes.",
      companyBadgeIso: "State Certified ISO 9001:2026",
      companyBadge247: "24/7 Round-the-clock Gas Delivery",
      companyBadgeCallCenter: "Unified Call Center: +998 71 200-00-00",
      companyBadgeOffice: "Head Office: Tashkent, Katartal str., 28",
      supportChatHeader: "Online chat with Poytug GNS operator",
      botBadgeTitle: "Poytug Assistant",
      supportBotGreeting: "Hello! I am Poytug GNS online assistant. How can I help you with gas refill or delivery?"
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

    // Update guest vs auth text in drawer and profile
    updateAuthUI();
  }

  function formatFullPhone(phoneStr) {
    if (!phoneStr) return "+998 90 123 45 67";
    const digits = phoneStr.toString().replace(/\D/g, '');
    let raw = digits.startsWith('998') && digits.length > 3 ? digits.substring(3) : digits;
    raw = raw.substring(0, 9);
    let res = '';
    if (raw.length > 0) res = raw.substring(0, 2);
    if (raw.length > 2) res += ' ' + raw.substring(2, 5);
    if (raw.length > 5) res += ' ' + raw.substring(5, 7);
    if (raw.length > 7) res += ' ' + raw.substring(7, 9);
    return res ? `+998 ${res}` : "+998 90 123 45 67";
  }

  function updateAuthUI() {
    const drawerName = document.getElementById('drawer-user-name');
    const drawerPhone = document.getElementById('drawer-user-phone');
    const drawerLogoutText = document.getElementById('drawer-logout-text');
    const accountLogoutText = document.getElementById('account-logout-text');
    const accName = document.getElementById('acc-user-name');
    const accPhone = document.getElementById('acc-user-phone');

    if (isAuth) {
      if (drawerName) drawerName.textContent = currentUserName;
      if (drawerPhone) drawerPhone.textContent = formatFullPhone(userPhone);
      if (drawerLogoutText) drawerLogoutText.textContent = translations[currentLang].btnLogout;
      if (accountLogoutText) accountLogoutText.textContent = translations[currentLang].btnLogout;
      if (accName) accName.textContent = currentUserName;
      if (accPhone) accPhone.textContent = formatFullPhone(userPhone);
    } else {
      if (drawerName) drawerName.textContent = translations[currentLang].guestUser;
      if (drawerPhone) drawerPhone.textContent = "+998 90 123 45 67";
      if (drawerLogoutText) drawerLogoutText.textContent = translations[currentLang].btnSignIn;
      if (accountLogoutText) accountLogoutText.textContent = translations[currentLang].btnSignIn;
    }
    updateBalanceDisplay();
  }

  function updateHeaderControls(screenId) {
    const isAuthScreen = (screenId === 'screen-auth') || (document.getElementById('screen-auth') && document.getElementById('screen-auth').classList.contains('active'));
    const langSelector = document.getElementById('lang-selector');
    const btnCloseAuth = document.getElementById('btn-close-auth');
    const btnOpenCart = document.getElementById('btn-open-cart');

    if (isAuthScreen) {
      if (langSelector) langSelector.style.display = 'flex';
      if (btnCloseAuth) btnCloseAuth.style.display = 'flex';
      if (btnOpenCart) btnOpenCart.style.display = 'none';
    } else {
      if (langSelector) langSelector.style.display = 'none';
      if (btnCloseAuth) btnCloseAuth.style.display = 'none';
      if (btnOpenCart) btnOpenCart.style.display = 'flex';
    }
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
  // Uzbekistan Phone Formatter (+998 90 123 45 67)
  function formatUzbekPhone(value) {
    if (!value) return '';
    let digits = value.toString().replace(/\D/g, '');
    
    // Strip leading country code 998 if entered/pasted
    if (digits.startsWith('998') && digits.length > 3) {
      digits = digits.substring(3);
    }
    
    // Max 9 national digits (e.g. 90 123 45 67)
    digits = digits.substring(0, 9);
    
    let res = '';
    if (digits.length > 0) res = digits.substring(0, 2);
    if (digits.length > 2) res += ' ' + digits.substring(2, 5);
    if (digits.length > 5) res += ' ' + digits.substring(5, 7);
    if (digits.length > 7) res += ' ' + digits.substring(7, 9);
    return res;
  }

  function setupPhoneInput(input) {
    if (!input) return;
    input.addEventListener('input', () => {
      input.value = formatUzbekPhone(input.value);
    });
    input.addEventListener('paste', () => {
      setTimeout(() => {
        input.value = formatUzbekPhone(input.value);
      }, 0);
    });
  }

  let storedUsers = JSON.parse(localStorage.getItem('lpg_users') || JSON.stringify([
    { name: "Алишер Алишеров", phone: "+998 90 123 45 67", password: "123456" }
  ]));
  let pendingAuthData = { name: 'Алишер Алишеров', phone: '+998 90 123 45 67', password: '123456' };
  let authTimers = {};

  function startTimer(elemId, seconds) {
    if (authTimers[elemId]) clearInterval(authTimers[elemId]);
    const el = document.getElementById(elemId);
    let rem = seconds;
    if (el) el.textContent = rem;
    authTimers[elemId] = setInterval(() => {
      rem--;
      if (el) el.textContent = rem;
      if (rem <= 0) clearInterval(authTimers[elemId]);
    }, 1000);
  }

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

  // Forgot Password Modal
  const btnForgotPwd = document.getElementById('btn-forgot-pwd');
  if (btnForgotPwd) {
    btnForgotPwd.addEventListener('click', () => {
      openModal('modal-forgot-pwd');
    });
  }

  const btnSendResetCode = document.getElementById('btn-send-reset-code');
  if (btnSendResetCode) {
    btnSendResetCode.addEventListener('click', () => {
      closeModal('modal-forgot-pwd');
      showToast("💬 СМС с кодом восстановления отправлено!");
    });
  }

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
  function enterApp(asGuest = false, name = "Алишер Алишеров", phone = "+998 90 123 45 67") {
    document.getElementById('screen-auth').classList.remove('active');
    document.getElementById('screen-home').classList.add('active');
    updateHeaderControls('screen-home');
    
    if (!asGuest) {
      isAuth = true;
      currentUserName = name;
      userPhone = phone;
      localStorage.setItem('lpg_auth', 'true');
      localStorage.setItem('lpg_phone', userPhone);
      localStorage.setItem('lpg_user_name', currentUserName);

      const drawerName = document.getElementById('drawer-user-name');
      const drawerPhone = document.getElementById('drawer-user-phone');
      const accName = document.getElementById('acc-user-name');
      const accPhone = document.getElementById('acc-user-phone');

      if (drawerName) drawerName.textContent = currentUserName;
      if (drawerPhone) drawerPhone.textContent = formatFullPhone(userPhone);
      if (accName) accName.textContent = currentUserName;
      if (accPhone) accPhone.textContent = formatFullPhone(userPhone);
      showToast(`Добро пожаловать, ${currentUserName}!`);
      launchConfettiCannon();
    } else {
      showToast("Вход в гостевом режиме");
    }
    updateAuthUI();
  }

  if (isAuth) {
    enterApp(false, currentUserName, userPhone || "+998 90 123 45 67");
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

  setupPhoneInput(inputLoginPhone);

  btnLoginNext.addEventListener('click', () => {
    const rawPhone = inputLoginPhone.value.trim();
    const password = inputLoginPwd.value.trim();

    if (!rawPhone || rawPhone.replace(/\D/g, '').length < 7) {
      showToast("Введите корректный номер телефона!");
      inputLoginPhone.focus();
      return;
    }
    if (!password || password.length < 6) {
      showToast("Пароль должен содержать минимум 6 символов!");
      inputLoginPwd.focus();
      return;
    }

    const formattedPhone = `+998 ${formatUzbekPhone(rawPhone)}`;
    const cleanDigits = rawPhone.replace(/\D/g, '');
    
    // Check if user exists in local database
    const existing = storedUsers.find(u => u.phone.replace(/\D/g, '').includes(cleanDigits) || cleanDigits.includes(u.phone.replace(/\D/g, '')));
    if (existing && existing.password !== password) {
      showToast("Неверный пароль! (Для демо: 123456)");
      inputLoginPwd.focus();
      return;
    }

    const userName = existing ? existing.name : "Алишер Алишеров";
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

  setupPhoneInput(inputRegPhone);

  const inputResetPhone = document.getElementById('input-reset-phone');
  setupPhoneInput(inputResetPhone);

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
    if (!rawPhone || rawPhone.replace(/\D/g, '').length < 7) {
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

    const formattedPhone = `+998 ${formatUzbekPhone(rawPhone)}`;
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
      updateHeaderControls('screen-auth');
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
  let previousScreenId = 'screen-home';

  function navigateToScreen(targetId) {
    const currentActiveScreen = Array.from(screens).find(s => s.classList.contains('active'));
    if (currentActiveScreen && currentActiveScreen.id !== targetId && currentActiveScreen.id !== 'screen-cart') {
      previousScreenId = currentActiveScreen.id;
    }

    navItems.forEach(n => {
      n.classList.toggle('active', n.dataset.target === targetId);
    });

    screens.forEach(s => s.classList.toggle('active', s.id === targetId));

    updateHeaderControls(targetId);

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
    item.addEventListener('click', () => {
      navigateToScreen(item.dataset.target);
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
    openModal('modal-balance');
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
      updateHeaderControls('screen-auth');
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
      const rawTotal = unitPrice * cylinderQuantity;
      const finalToPay = Math.max(0, rawTotal - appliedBonusDiscount);

      document.getElementById('summary-cyl-type').textContent = `Заправка: ${selectedCylinder.name} (${cylinderQuantity} шт)`;
      document.getElementById('summary-cyl-price').textContent = `${rawTotal.toLocaleString()} UZS`;
      
      const summaryBonusRow = document.getElementById('summary-bonus-row');
      const summaryBonusAmount = document.getElementById('summary-bonus-amount');
      if (summaryBonusRow && summaryBonusAmount) {
        if (appliedBonusDiscount > 0) {
          summaryBonusRow.style.display = 'flex';
          summaryBonusAmount.textContent = `-${appliedBonusDiscount.toLocaleString()} UZS`;
        } else {
          summaryBonusRow.style.display = 'none';
        }
      }

      document.getElementById('summary-total-price').textContent = `${finalToPay.toLocaleString()} UZS`;
      switchHomeStage('payment');
    });
  }

  btnGotoPayment.addEventListener('click', () => {
    const inputCustom = document.getElementById('input-custom-address');
    const customAddr = inputCustom ? inputCustom.value.trim() : '';
    if (customAddr) selectedAddress = customAddr;

    const unitPrice = isWholesale ? selectedCylinder.wholesalePrice : selectedCylinder.price;
    const rawTotal = unitPrice * cylinderQuantity;
    const finalToPay = Math.max(0, rawTotal - appliedBonusDiscount);

    document.getElementById('summary-cyl-type').textContent = `Заправка: ${selectedCylinder.name} (${cylinderQuantity} шт)`;
    document.getElementById('summary-cyl-price').textContent = `${rawTotal.toLocaleString()} UZS`;

    const summaryBonusRow = document.getElementById('summary-bonus-row');
    const summaryBonusAmount = document.getElementById('summary-bonus-amount');
    if (summaryBonusRow && summaryBonusAmount) {
      if (appliedBonusDiscount > 0) {
        summaryBonusRow.style.display = 'flex';
        summaryBonusAmount.textContent = `-${appliedBonusDiscount.toLocaleString()} UZS`;
      } else {
        summaryBonusRow.style.display = 'none';
      }
    }

    document.getElementById('summary-total-price').textContent = `${finalToPay.toLocaleString()} UZS`;
    switchHomeStage('payment');
  });

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

    const unitPrice = isWholesale ? selectedCylinder.wholesalePrice : selectedCylinder.price;
    const rawTotal = unitPrice * cylinderQuantity;
    const finalToPay = Math.max(0, rawTotal - appliedBonusDiscount);

    // If bonus used, deduct from balance
    if (appliedBonusDiscount > 0) {
      loyaltyBalance = Math.max(0, loyaltyBalance - appliedBonusDiscount);
      appliedBonusDiscount = 0;
      saveAppState();
      updateBalanceDisplay();
    }

    // Dynamic Courier info based on wholesale vs retail
    const courierDriverName = document.getElementById('courier-driver-name');
    const courierVehicleInfo = document.getElementById('courier-vehicle-info');
    if (isWholesale) {
      if (courierDriverName) courierDriverName.textContent = "Шерзод Умаров";
      if (courierVehicleInfo) courierVehicleInfo.textContent = "🚛 Isuzu Cargo • 01 888 BBA";
    } else {
      if (courierDriverName) courierDriverName.textContent = "Фарход Рахимов";
      if (courierVehicleInfo) courierVehicleInfo.textContent = "🚚 Labo Auto • 01 A 777 AA";
    }

    switchHomeStage('tracking');
    startCountdownTimer(25 * 60);
    initTrackingMiniMap();
    launchConfettiCannon();

    const orderCode = `LPG-${Math.floor(1000 + Math.random() * 9000)}`;
    orderHistory.unshift({
      code: orderCode,
      date: 'Сегодня',
      title: `Заправка: ${selectedCylinder.name} (${cylinderQuantity} шт)`,
      price: finalToPay,
      status: 'В пути'
    });
    saveAppState();
    showToast(`Заказ ${orderCode} успешно оформлен!`);
  });

  function startCountdownTimer(seconds) {
    if (countdownTimerInterval) clearInterval(countdownTimerInterval);
    const timerDisplay = document.getElementById('order-countdown-timer');

    let rem = seconds;
    countdownTimerInterval = setInterval(() => {
      const mins = Math.floor(rem / 60);
      const secs = rem % 60;
      if (timerDisplay) timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  const btnCallCourier = document.getElementById('btn-call-courier');
  if (btnCallCourier) {
    btnCallCourier.addEventListener('click', () => {
      const driverName = isWholesale ? "Шерзоду (+998 90 888-88-88)" : "Фарходу (+998 97 777-77-77)";
      showToast(`Звонок курьеру ${driverName}...`);
    });
  }

  // Fiscal Receipt Trigger
  const btnViewReceipt = document.getElementById('btn-view-receipt');
  if (btnViewReceipt) {
    btnViewReceipt.addEventListener('click', () => {
      const unitPrice = isWholesale ? selectedCylinder.wholesalePrice : selectedCylinder.price;
      const rawTotal = unitPrice * cylinderQuantity;
      const finalPrice = Math.max(0, rawTotal - appliedBonusDiscount);

      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const formattedDate = `${day}.${month}.${year} ${hours}:${mins}`;

      const recCode = document.getElementById('rec-code');
      const recDate = document.getElementById('rec-date');
      const recClient = document.getElementById('rec-client');
      const recInnRow = document.getElementById('rec-inn-row');
      const recInnVal = document.getElementById('rec-inn-val');
      const recItem = document.getElementById('rec-item');
      const recTotal = document.getElementById('rec-total');

      if (recCode) recCode.textContent = orderHistory.length > 0 ? orderHistory[0].code : `LPG-${Math.floor(1000 + Math.random() * 9000)}`;
      if (recDate) recDate.textContent = formattedDate;
      if (recClient) recClient.textContent = isAuth ? currentUserName : "Гость";
      if (recInnRow && recInnVal) {
        if (companyInn) {
          recInnRow.style.display = 'flex';
          recInnVal.textContent = companyInn;
        } else {
          recInnRow.style.display = 'none';
        }
      }
      if (recItem) recItem.textContent = `${selectedCylinder.name} x ${cylinderQuantity} шт`;
      if (recTotal) recTotal.textContent = `${finalPrice.toLocaleString()} UZS`;

      openModal('modal-receipt');
    });
  }

  // Animated Tracking Map
  function initTrackingMiniMap() {
    if (trackingCourierInterval) clearInterval(trackingCourierInterval);
    const container = document.getElementById('tracking-map-container');
    if (!container) return;
    container.innerHTML = '';
    const tMap = L.map('tracking-map-container', { zoomControl: false }).setView([41.2920, 69.2200], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(tMap);

    L.circleMarker([41.2995, 69.2401], { color: '#ef4444', fillColor: '#ffffff', fillOpacity: 1, radius: 8 }).addTo(tMap).bindPopup("Ваш адрес");

    let courierLat = 41.2850;
    let courierLng = 69.2050;
    const destLat = 41.2995;
    const destLng = 69.2401;

    const courierPopupLabel = isWholesale ? "🚛 Курьер Шерзод (Isuzu Cargo)" : "🚚 Курьер Фарход (Labo Auto)";
    const courierMarker = L.marker([courierLat, courierLng]).addTo(tMap).bindPopup(courierPopupLabel);
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
    saveAppState();
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartBadgeCount) cartBadgeCount.textContent = totalCount;

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
          <div class="cart-item-info">
            <span class="cart-item-title">${item.name}</span>
            <span class="cart-item-unit-price">${item.price.toLocaleString()} UZS / шт</span>
          </div>
          <div class="cart-item-right">
            <div class="cart-qty-ctrl">
              <button class="qty-btn" onclick="changeQty(${i}, -1)" aria-label="Уменьшить">-</button>
              <span class="cart-qty-num">${item.qty}</span>
              <button class="qty-btn" onclick="changeQty(${i}, 1)" aria-label="Увеличить">+</button>
            </div>
            <strong class="cart-item-price">${(item.price * item.qty).toLocaleString()} UZS</strong>
            <button class="cart-remove-btn" onclick="removeCartItem(${i})" title="Удалить" aria-label="Удалить"><i class="fa-regular fa-trash-can"></i></button>
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

    const btnRemovePromo = document.getElementById('btn-remove-promo');
    if (btnRemovePromo) {
      btnRemovePromo.style.display = appliedPromoDiscount > 0 ? 'inline-flex' : 'none';
    }
  }

  window.changeQty = function(idx, delta) {
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    updateCartUI();
  };

  window.removeCartItem = function(idx) {
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

  const btnRemovePromo = document.getElementById('btn-remove-promo');
  if (btnRemovePromo) {
    btnRemovePromo.addEventListener('click', () => {
      appliedPromoDiscount = 0;
      const promoInput = document.getElementById('input-promocode');
      if (promoInput) promoInput.value = '';
      showToast("Промокод удален");
      updateCartUI();
    });
  }

  const btnCartCheckout = document.getElementById('btn-cart-checkout');
  if (btnCartCheckout) {
    btnCartCheckout.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast("Корзина пуста!");
        return;
      }

      let rawTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      let discountVal = Math.round(rawTotal * (appliedPromoDiscount / 100));
      let finalTotal = rawTotal - discountVal;

      const orderCode = `LPG-${Math.floor(1000 + Math.random() * 9000)}`;
      orderHistory.unshift({
        code: orderCode,
        date: 'Сегодня',
        title: `Заказ товаров (${cart.length} наим.)`,
        price: finalTotal,
        status: 'Оформлен'
      });

      cart = [];
      appliedPromoDiscount = 0;
      saveAppState();
      updateCartUI();
      launchConfettiCannon();
      showToast(`Заказ ${orderCode} успешно оформлен!`);

      setTimeout(() => {
        navigateToScreen('screen-home');
      }, 1000);
    });
  }


  // ==================== CARDS, ADDRESSES & BALANCE ====================
  // Loyalty Balance in Account Screen
  const btnAccBalanceItem = document.getElementById('btn-acc-balance-item');
  if (btnAccBalanceItem) {
    btnAccBalanceItem.addEventListener('click', () => {
      updateBalanceDisplay();
      openModal('modal-balance');
    });
  }

  const btnUseBalanceNow = document.getElementById('btn-use-balance-now');
  if (btnUseBalanceNow) {
    btnUseBalanceNow.addEventListener('click', () => {
      closeModal('modal-balance');
      appliedBonusDiscount = Math.min(loyaltyBalance, 25000);
      const homeNav = document.querySelector('[data-target="screen-home"]');
      if (homeNav) homeNav.click();
      if (btnStartRefill) btnStartRefill.click();
      showToast(`Бонусы ${appliedBonusDiscount.toLocaleString()} UZS будут применены к заказу!`);
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

  if (inputCardNum) {
    inputCardNum.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.startsWith('8600')) previewLogo.textContent = 'Uzcard';
      else if (val.startsWith('9860')) previewLogo.textContent = 'Humo';
      else previewLogo.textContent = 'Visa';

      previewNum.textContent = val.replace(/(.{4})/g, '$1 ').trim() || '8600 •••• •••• ••••';
    });
  }

  if (inputCardExp) {
    inputCardExp.addEventListener('input', (e) => {
      previewExp.textContent = e.target.value || '12/28';
    });
  }

  const btnSaveNewCard = document.getElementById('btn-save-new-card');
  if (btnSaveNewCard) {
    btnSaveNewCard.addEventListener('click', () => {
      const rawPan = inputCardNum.value.replace(/\D/g, '');
      if (rawPan.length < 16) {
        showToast("Введите корректный 16-значный номер карты!");
        return;
      }
      const masked = `${rawPan.substring(0, 4)} •••• •••• ${rawPan.substring(12)}`;
      savedCards.push({ type: previewLogo.textContent.toUpperCase(), pan: masked, exp: inputCardExp.value || '12/28' });
      saveAppState();
      renderCards();
      const cardsPreview = document.getElementById('acc-cards-preview');
      if (cardsPreview) cardsPreview.textContent = `${savedCards.length} привязанные карты`;
      showToast("Карта успешно привязана!");
      inputCardNum.value = '';
      inputCardExp.value = '';
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
    const list = document.getElementById('address-manager-list');
    if (!list) return;
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

  const btnSaveNewAddr = document.getElementById('btn-save-new-address');
  if (btnSaveNewAddr) {
    btnSaveNewAddr.addEventListener('click', () => {
      const titleInput = document.getElementById('input-new-addr-title');
      const textInput = document.getElementById('input-new-addr-text');
      const title = titleInput.value.trim();
      const text = textInput.value.trim();
      if (!text) {
        showToast("Введите адрес!");
        textInput.focus();
        return;
      }
      savedAddresses.push({ title: title || 'Другой адрес', text: text, icon: '📍' });
      saveAppState();
      renderAddressManager();
      const countDisplay = document.getElementById('acc-addresses-count');
      if (countDisplay) countDisplay.textContent = `${savedAddresses.length} адресов доставки`;
      showToast("Адрес успешно сохранен!");
      titleInput.value = '';
      textInput.value = '';
    });
  }


  // ==================== HISTORY & SUPPORT CHAT ====================
  document.getElementById('btn-acc-history').addEventListener('click', () => {
    renderHistory();
    openModal('modal-history');
  });

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


  // Settings in Account Profile
  const btnAccSettings = document.getElementById('btn-acc-settings');
  if (btnAccSettings) {
    btnAccSettings.addEventListener('click', () => {
      openModal('modal-settings');
    });
  }

  const togglePushNotif = document.getElementById('toggle-push-notif');
  if (togglePushNotif) {
    togglePushNotif.addEventListener('change', (e) => {
      showToast(e.target.checked ? "Push-уведомления включены" : "Push-уведомления отключены");
    });
  }

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
    if (toastText) toastText.textContent = msg;
    if (toast) {
      toast.classList.add('active');
      setTimeout(() => {
        toast.classList.remove('active');
      }, 2800);
    }
  }

  updateAuthUI();
  updateHeaderControls();

});
