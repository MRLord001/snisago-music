const { ipcRenderer, webUtils } = require('electron');
const APP_VERSION = "1.2.0";

// =========================================
// БАЗА ДАННЫХ И ИСТОРИЯ ОБНОВЛЕНИЙ
// =========================================
const appNews = [
    { 
        version: "1.2.0", 
        title: "Глобальное Обновление: Оверлей и Эквалайзер!", 
        details: "• <b>10-полосный эквалайзер:</b> настраивай звук под себя (Bass Boost, Rock и др.).<br>• <b>Тексты песен (Караоке):</b> синхронный текст в полноэкранном режиме.<br>• <b>Видео-обои:</b> поддержка MP4 и WebM на задний фон.<br>• <b>Статистика:</b> отслеживание времени, проведенного в плеере.<br>• <b>Независимый мини-плеер и микро-оверлей:</b> теперь они работают поверх всех окон без багов!"
    },
    { 
        version: "1.1.9", 
        title: "Шеринг, Ссылки и UI", 
        details: "Продвинутое контекстное меню, шеринг плейлистов по коду и кнопка быстрого добавления."
    }
];

// ВСТАВЬ СЮДА СВОЙ МАССИВ РАДИОСТАНЦИЙ:
const gistRadioStations = [
      { id: "rd-1", title: "Радио Мелодия (СПБ)", artist: "Ретро стиль", src: "https://r1.mgradio.ru/melodia128", type: "web", isRadio: true, category: "retro", cover: "linear-gradient(135deg, #b91c1c, #7f1d1d)" },
      { id: "rd-2", title: "French Jazz", artist: "Ретро стиль / Джаз", src: "https://jazz-wr01-128.creacast.com/jazz-wr01-128.mp3", type: "web", isRadio: true, category: "retro", cover: "linear-gradient(135deg, #78350f, #451a03)" },
      { id: "rd-3", title: "Качающееся Радио", artist: "Ретро стиль / Свинг", src: "https://swingfm.ice.infomaniak.ch/swingfm-128.mp3", type: "web", isRadio: true, category: "retro", cover: "linear-gradient(135deg, #065f46, #064e3b)" },
      { id: "rd-4", title: "Радио Золотой Век", artist: "Ретро стиль", src: "https://setmedia.ru:8000/high", type: "web", isRadio: true, category: "retro", cover: "linear-gradient(135deg, #1e3a8a, #172554)" },
      { id: "rd-5", title: "Радио Подмосковные вечера", artist: "Ретро стиль", src: "https://setmedia.ru:8000/high5", type: "web", isRadio: true, category: "retro", cover: "linear-gradient(135deg, #6b21a8, #4c1d95)" },
      { id: "rd-6", title: "Ностальжи", artist: "Ретро стиль", src: "https://potok.nostalgie.by/nostalgie-128", type: "web", isRadio: true, category: "retro", cover: "linear-gradient(135deg, #be185d, #831843)" },
      { id: "rd-7", title: "Радио Маяк", artist: "Ретро стиль / Инфо", src: "https://icecast-vgtrk.cdnvideo.ru/mayakfm_aac_64kbps", type: "web", isRadio: true, category: "retro", cover: "linear-gradient(135deg, #374151, #111827)" },
      { id: "rd-8", title: "Радио 1945", artist: "Ретро стиль / Историческое", src: "https://78.46.66.184:1945/128", type: "web", isRadio: true, category: "retro", cover: "linear-gradient(135deg, #15803d, #14532d)" },
      { id: "rd-9", title: "Радио Ретро Хит", artist: "Ретро стиль", src: "https://air.volna.top/Retro", type: "web", isRadio: true, category: "retro", cover: "linear-gradient(135deg, #b45309, #78350f)" },
      { id: "rd-10", title: "Радио Лучшие Песни", artist: "Ретро стиль", src: "https://85.114.140.64:8000/666", type: "web", isRadio: true, category: "retro", cover: "linear-gradient(135deg, #0369a1, #0c4a6e)" },
      { id: "rd-11", title: "НостальгияФМ", artist: "Ретро стиль", src: "https://nostalgiafm.hostingradio.ru:8000/nostalgiafm.mp3", type: "web", isRadio: true, category: "retro", cover: "linear-gradient(135deg, #4338ca, #311042)" },
      { id: "rd-12", title: "Fallout FM", artist: "Ретро стиль / Атмосфера", src: "https://fallout.fm:8000/falloutfm1.ogg", type: "web", isRadio: true, category: "retro", cover: "linear-gradient(135deg, #0f766e, #134e4a)" },
      { id: "rd-13", title: "Wasteland FM", artist: "Ретро стиль / Игры", src: "https://wasteland.su:8080/radio", type: "web", isRadio: true, category: "retro", cover: "linear-gradient(135deg, #2e1065, #3b0764)" },
      { id: "rd-14", title: "Jazz FM 89.1", artist: "Ретро стиль / Джаз", src: "https://nashe1.hostingradio.ru/jazz-128.mp3", type: "web", isRadio: true, category: "retro", cover: "linear-gradient(135deg, #1d4ed8, #1e3a8a)" },
      { id: "rd-15", title: "Рождественское радио", artist: "Ретро стиль", src: "https://relay4.181.fm:8124/;", type: "web", isRadio: true, category: "retro", cover: "linear-gradient(135deg, #e11d48, #4c0519)" },
      { id: "rd-16", title: "РетроФМ", artist: "Ретро стиль", src: "https://retro.hb.ru-ms.ru:8000/retro128", type: "web", isRadio: true, category: "retro", cover: "linear-gradient(135deg, #f59e0b, #d97706)" },
      { id: "rd-17", title: "Радиола Саратов", artist: "Ретро стиль", src: "https://online1.gkvr.ru:8000/radiola_srt_128.mp3", type: "web", isRadio: true, category: "retro", cover: "linear-gradient(135deg, #10b981, #047857)" },
      { id: "rd-18", title: "Pop FM 80", artist: "Ретро стиль / 80s", src: "https://5.8.213.195:8000/popfm_80", type: "web", isRadio: true, category: "retro", cover: "https://i122.fastpic.org/big/2023/1006/f6/306264920c08d040afd359a911b47cf6.jpg" },
      { id: "rd-19", title: "Retrowave.One Radio", artist: "Ретро стиль / Synth", src: "https://waveretro.ru:8443/stream", type: "web", isRadio: true, category: "retro", cover: "linear-gradient(135deg, #ec4899, #3b82f6)" },
      { id: "rd-20", title: "Хайп ФМ", artist: "Современное / Поп", src: "https://air.volna.top/HypeFM", type: "web", isRadio: true, category: "modern", cover: "linear-gradient(135deg, #db2777, #500724)" },
      { id: "rd-21", title: "Discover Trance", artist: "Современное / Транс", src: "https://paris.discovertrance.com:8006/;stream.nsv", type: "web", isRadio: true, category: "modern", cover: "linear-gradient(135deg, #2563eb, #1e3a8a)" },
      { id: "rd-22", title: "Евродэнс 90-х", artist: "Современное / Клубное", src: "https://listen1.myradio24.com:9000/5967", type: "web", isRadio: true, category: "modern", cover: "linear-gradient(135deg, #059669, #064e3b)" },
      { id: "rd-23", title: "Megapolis FM", artist: "Современное / Хаус", src: "https://109.239.129.43:8010/megapolis-48.aac", type: "web", isRadio: true, category: "modern", cover: "linear-gradient(135deg, #7c3aed, #2e1065)" },
      { id: "rd-24", title: "Маруся ФМ", artist: "Современное / Хиты", src: "https://msk7.radio-holding.ru/marusya_default", type: "web", isRadio: true, category: "modern", cover: "linear-gradient(135deg, #3b82f6, #06b6d4)" },
      { id: "rd-25", title: "Новое Радио", artist: "Современное / Поп", src: "https://icecast.newradio.cdnvideo.ru/newradio3", type: "web", isRadio: true, category: "modern", cover: "linear-gradient(135deg, #ef4444, #991b1b)" },
      { id: "rd-26", title: "Capital XTRA", artist: "Современное / RnB", src: "https://ice-the.musicradio.com/CapitalXTRANationalMP3", type: "web", isRadio: true, category: "modern", cover: "linear-gradient(135deg, #10b981, #047857)" },
      { id: "rd-27", title: "Europa Plus 128", artist: "Современное / Топ", src: "https://ep128.hostingradio.ru:8030/ep128", type: "web", isRadio: true, category: "modern", cover: "linear-gradient(135deg, #f59e0b, #b45309)" },
      { id: "rd-34", title: "Ремикс ФМ", artist: "Современное / Ремиксы", src: "https://rmx.amgradio.ru/RemixFM", type: "web", isRadio: true, category: "modern", cover: "linear-gradient(135deg, #8b5cf6, #ec4899)" },
      { id: "rd-28", title: "Дорожное Радио", artist: "Разное", src: "https://dorognoe.hostingradio.ru:8000/dorognoe", type: "web", isRadio: true, category: "other", cover: "linear-gradient(135deg, #6b7280, #374151)" },
      { id: "rd-29", title: "Радио Шансон 256", artist: "Разное", src: "https://chanson.hostingradio.ru:8041/chanson256.mp3", type: "web", isRadio: true, category: "other", cover: "linear-gradient(135deg, #78350f, #292524)" },
      { id: "rd-30", title: "Real Drift Radio", artist: "Разное / Фонк", src: "https://radio.real-drift.com/stream", type: "web", isRadio: true, category: "other", cover: "linear-gradient(135deg, #dc2626, #111827)" },
      { id: "rd-31", title: "Вести ФМ", artist: "Разное / Инфо", src: "https://icecast-vgtrk.cdnvideo.ru/vestifm_aac_64kbps", type: "web", isRadio: true, category: "other", cover: "linear-gradient(135deg, #4b5563, #1f2937)" },
      { id: "rd-32", title: "Русское Радио", artist: "Разное / Поп", src: "https://rusradio.hostingradio.ru/rusradio128.mp3", type: "web", isRadio: true, category: "other", cover: "linear-gradient(135deg, #ef4444, #7f1d1d)" },
      { id: "rd-33", title: "Моё Радио 24", artist: "Разное", src: "https://myradio24.org/2666", type: "web", isRadio: true, category: "other", cover: "linear-gradient(135deg, #6366f1, #311042)" },
      { id: "rec-1", title: "Record «Главный Стрим»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/rr_main96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #e11d48, #9f1239)" },
      { id: "rec-2", title: "Record «Русский микс»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/rus96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #2563eb, #1d4ed8)" },
      { id: "rec-3", title: "Record «Summer Dance от Т-Банк»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/summerparty96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #10b981, #047857)" },
      { id: "rec-4", title: "Record «Супердискотека 90-х»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/sd9096.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #ec4899, #be185d)" },
      { id: "rec-5", title: "Record «Пляжная вечеринка»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/beach64.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #06b6d4, #0891b2)" },
      { id: "rec-6", title: "Record «Русские хиты»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/russianhits64.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #ef4444, #dc2626)" },
      { id: "rec-7", title: "Record «Deep»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/deep96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #6366f1, #4f46e5)" },
      { id: "rec-8", title: "Record «Chill-Out»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/chil96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #84cc16, #65a30d)" },
      { id: "rec-9", title: "Record «На шашлыки!»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/nashashlyki96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #f59e0b, #d97706)" },
      { id: "rec-10", title: "Record «Мегамикс»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/mix96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #a855f7, #8b5cf6)" },
      { id: "rec-11", title: "Record «Рок»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/rock96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #374151, #1f2937)" },
      { id: "rec-12", title: "Record «Ремикс»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/rmx96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #ec4899, #c026d3)" },
      { id: "rec-13", title: "Record «Гоп FM»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/gop96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #ca8a04, #a16207)" },
      { id: "rec-14", title: "Record «Chill House»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/chillhouse96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #06b6d4, #0369a1)" },
      { id: "rec-15", title: "Record «Big Hits»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/bighits96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #f43f5e, #e11d48)" },
      { id: "rec-16", title: "Record «Рекорд 00-х»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/200096.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #3b82f6, #2563eb)" },
      { id: "rec-17", title: "Record «Рекорд 80-х»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/198096.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #ea580c, #c2410c)" },
      { id: "rec-18", title: "Record «Нафталин FM»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/naft96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #6b7280, #4b5563)" },
      { id: "rec-19", title: "Record «Маятник Фуко»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/mf96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #111827, #030712)" },
      { id: "rec-20", title: "Record «Trancemission»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/tm96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #2563eb, #7c3aed)" },
      { id: "rec-21", title: "Record «Русское золото»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/russiangold96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #eab308, #ca8a04)" },
      { id: "rec-22", title: "Record «Пиратская станция»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/ps96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #7f1d1d, #450a0a)" },
      { id: "rec-23", title: "Record «Невинность (Ibiza)»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/ibiza96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #06b6d4, #10b981)" },
      { id: "rec-24", title: "Record «Медляк FM»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/mdl96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #ec4899, #db2777)" },
      { id: "rec-25", title: "Record «Вечеринка 24/7»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/party96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #f43f5e, #be185d)" },
      { id: "rec-26", title: "Record «Фонк»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/phonk96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #1f2937, #111827)" },
      { id: "rec-27", title: "Record «Рекорд Голд»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/gold96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #ca8a04, #854d0e)" },
      { id: "rec-28", title: "Record «Руки Вверх!»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/rv96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #db2777, #9d174d)" },
      { id: "rec-29", title: "Record «На Хайпе»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/hype96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #f43f5e, #9f1239)" },
      { id: "rec-30", title: "Record «Рэп-хиты»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/rap96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #4b5563, #111827)" },
      { id: "rec-31", title: "Record «Классика рэпа»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/rapclassics96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #374151, #1f2937)" },
      { id: "rec-32", title: "Record «Классика транса»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/trancehits96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #2563eb, #1d4ed8)" },
      { id: "rec-33", title: "Record «Колбасный Цех»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/pump96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #ea580c, #b45309)" },
      { id: "rec-34", title: "Record «D'n'B Classics»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/drumhits96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #991b1b, #7f1d1d)" },
      { id: "rec-35", title: "Record «Armin van Buuren»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/armin96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #1d4ed8, #1e3a8a)" },
      { id: "rec-36", title: "Record «Summer Lounge»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/summerlounge64.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #10b981, #065f46)" },
      { id: "rec-37", title: "Record «Organic»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/organic96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #059669, #047857)" },
      { id: "rec-38", title: "Record «Ultra Music Festival»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/ultra64.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #3b82f6, #1d4ed8)" },
      { id: "rec-39", title: "Record «VIP House»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/vip96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #7c3aed, #5b21b6)" },
      { id: "rec-40", title: "Record «Breaks»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/brks96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #4b5563, #374151)" },
      { id: "rec-41", title: "Record «Liquid Funk»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/liquidfunk96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #06b6d4, #0891b2)" },
      { id: "rec-42", title: "Record «Workout»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/workout96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #ea580c, #ca8a04)" },
      { id: "rec-43", title: "Record «EDM»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/club96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #2563eb, #3b82f6)" },
      { id: "rec-44", title: "Record «Bass House»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/jackin96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #4f46e5, #4338ca)" },
      { id: "rec-45", title: "Record «GOA/PSY»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/goa96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #a855f7, #6b21a8)" },
      { id: "rec-46", title: "Record «10's Dance»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/201096.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #06b6d4, #047857)" },
      { id: "rec-47", title: "Record «Trancehouse»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/trancehouse96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #1e40af, #3b82f6)" },
      { id: "rec-48", title: "Record «Black Rap»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/yo96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #1f2937, #111827)" },
      { id: "rec-49", title: "Record «Techno»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/techno96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #111827, #000000)" },
      { id: "rec-50", title: "Record «Tropical»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/trop96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #f59e0b, #10b981)" },
      { id: "rec-51", title: "Record «Lo-Fi»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/lofi96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #84cc16, #06b6d4)" },
      { id: "rec-52", title: "Record «Tech House»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/techouse96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #4b5563, #1f2937)" },
      { id: "rec-53", title: "Record «Trap»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/trap96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #9d174d, #4c0519)" },
      { id: "rec-54", title: "Record «Technopop»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/technopop96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #2563eb, #a855f7)" },
      { id: "rec-55", title: "Record «Танец 70-х»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/197096.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #b45309, #78350f)" },
      { id: "rec-56", title: "Record «Танец мечты»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/dream96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #06b6d4, #4f46e5)" },
      { id: "rec-57", title: "Record «Нейрофанк»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/neurofunk96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #7f1d1d, #111827)" },
      { id: "rec-58", title: "Record «Эмбиент»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/ambient96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #1e1b4b, #311042)" },
      { id: "rec-59", title: "Record «Record Classix»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/classix64.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #4b5563, #374151)" },
      { id: "rec-60", title: "Record «Record Club Show»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/clubshow64.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #2563eb, #1e40af)" },
      { id: "rec-61", title: "Record «Eurodance»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/eurodance96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #059669, #064e3b)" },
      { id: "rec-62", title: "Record «Lo-Fi House»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/lofihouse64.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #06b6d4, #0891b2)" },
      { id: "rec-63", title: "Record «House Hits»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/househits96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #7c3aed, #4c1d95)" },
      { id: "rec-64", title: "Record «Uplifting»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/uplift96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #3b82f6, #1d4ed8)" },
      { id: "rec-65", title: "Record «Feel»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/feel64.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #10b981, #047857)" },
      { id: "rec-66", title: "Record «Tiesto»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/tiesto96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #1d4ed8, #1e3a8a)" },
      { id: "rec-67", title: "Record «Состояние транса»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/asot64.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #2563eb, #6b21a8)" },
      { id: "rec-68", title: "Record «Веснушка FM»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/deti96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #f59e0b, #e11d48)" },
      { id: "rec-69", title: "Record «Симфония FM»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/symph96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #4f46e5, #311042)" },
      { id: "rec-70", title: "Record «Minimal/Tech»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/mini96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #111827, #374151)" },
      { id: "rec-71", title: "Record «ТОП-100 EDM»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/top100edm96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #2563eb, #3b82f6)" },
      { id: "rec-72", title: "Record «Dream Pop»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/dreampop96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #ec4899, #a855f7)" },
      { id: "rec-73", title: "Record «House Classics»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/houseclss96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #4c1d95, #1e1b4b)" },
      { id: "rec-74", title: "Record «David Guetta»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/guetta96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #2563eb, #1e3a8a)" },
      { id: "rec-75", title: "Record «DJ ЦветкоFf»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/tsvetkov64.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #ef4444, #991b1b)" },
      { id: "rec-76", title: "Record «Disco/Funk»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/discofunk96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #ea580c, #ca8a04)" },
      { id: "rec-77", title: "Record «Hard Bass»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/hbass96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #b91c1c, #450a0a)" },
      { id: "rec-78", title: "Record «Afro House»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/afro64.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #f59e0b, #7c2d12)" },
      { id: "rec-79", title: "Record «Rave FM»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/rave96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #be185d, #4c0519)" },
      { id: "rec-80", title: "Record «Nu Dance»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/nudance64.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #10b981, #064e3b)" },
      { id: "rec-81", title: "Record «Танец 60-х»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/cadillac96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #b45309, #451a03)" },
      { id: "rec-82", title: "Record «Lady Waks»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/ladywaks64.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #7c3aed, #1e1b4b)" },
      { id: "rec-83", title: "Record «Dancecore»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/dc96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #2563eb, #06b6d4)" },
      { id: "rec-84", title: "Record «Future House»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/fut96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #06b6d4, #4338ca)" },
      { id: "rec-85", title: "Record «Darkside»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/darkside96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #111827, #000000)" },
      { id: "rec-86", title: "Record «Future Rave»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/futurerave96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #6366f1, #a855f7)" },
      { id: "rec-87", title: "Record «Reggae»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/reggae96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #10b981, #b45309)" },
      { id: "rec-88", title: "Record «Electro»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/elect96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #3b82f6, #1e3a8a)" },
      { id: "rec-89", title: "Record «Hardstyle»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/teo96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #ef4444, #7f1d1d)" },
      { id: "rec-90", title: "Record «Dubstep»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/dub96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #a855f7, #4c1d95)" },
      { id: "rec-91", title: "Record «Progressive»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/progr96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #1d4ed8, #4f46e5)" },
      { id: "rec-92", title: "Record «Nejtrino & Baur»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/nejtrinobaur64.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #f59e0b, #be185d)" },
      { id: "rec-93", title: "Record «Synthwave»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/synth96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #ec4899, #3b82f6)" },
      { id: "rec-94", title: "Record «Latina Dance»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/latina96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #ef4444, #f59e0b)" },
      { id: "rec-95", title: "Record «DJ Gvozd»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/djgvozd64.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #7f1d1d, #374151)" },
      { id: "rec-96", title: "Record «EDM Hits»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/edmhits96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #3b82f6, #1d4ed8)" },
      { id: "rec-97", title: "Record «Tecktonik»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/tecktonik96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #a855f7, #2563eb)" },
      { id: "rec-98", title: "Record «Jungle»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/jungle96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #15803d, #78350f)" },
      { id: "rec-99", title: "Record «Hypnotic»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/hypno96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #475569, #0f172a)" },
      { id: "rec-100", title: "Record «UK Garage»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/ukgarage96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #06b6d4, #4338ca)" },
      { id: "rec-101", title: "Record «Гастарбайтер FM»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/gast96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #ca8a04, #78350f)" },
      { id: "rec-102", title: "Record «Midtempo»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/mt96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #4b5563, #111827)" },
      { id: "rec-103", title: "Record «Future Bass»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/fbass96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #ec4899, #6366f1)" },
      { id: "rec-104", title: "Record «Martin Garrix»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/martingarrix64.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #2563eb, #1e3a8a)" },
      { id: "rec-105", title: "Record «Живые сеты»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/livedjsets96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #a855f7, #b45309)" },
      { id: "rec-106", title: "Record «Русская Зима»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/ruszima96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #06b6d4, #1e3a8a)" },
      { id: "rec-107", title: "Record «Оливер Хелденс»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/oliverheldens64.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #3b82f6, #4f46e5)" },
      { id: "rec-108", title: "Record «Moombahton»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/mmbt96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #ea580c, #b45309)" },
      { id: "rec-109", title: "Record «2-step»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/2step96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #06b6d4, #5b21b6)" },
      { id: "rec-110", title: "Record «Complextro»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/complextro96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #7c3aed, #4c1d95)" },
      { id: "rec-111", title: "Record «Groove/Tribal»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/groovetribal96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #10b981, #0f172a)" },
      { id: "rec-112", title: "Record «Christmas Chill»", artist: "Radio Record", src: "https://radiorecord.hostingradio.ru/christmaschill96.aacp", type: "web", isRadio: true, category: "record", cover: "linear-gradient(135deg, #f43f5e, #311042)" }
    ];

// =========================================
// СОСТОЯНИЕ ПРИЛОЖЕНИЯ
// =========================================
let playlist = []; 
let isPlaying = false; 
let currentTrackIndex = 0; 
let currentFilter = 'home';
let isShuffle = false;
let repeatMode = 0; 
let rightClickedTrackIndex = null;
let trackSortableInstance = null;

// Локальные базы данных
let myMusicTracks = JSON.parse(localStorage.getItem('snisago_my_music')) || [];
let favoriteTracks = JSON.parse(localStorage.getItem('snisago_fav_tracks')) || [];
let historyTracks = JSON.parse(localStorage.getItem('snisago_history')) || [];
let customPlaylists = JSON.parse(localStorage.getItem('snisago_playlists')) || [];
let appStats = JSON.parse(localStorage.getItem('snisago_stats')) || { total: 0, dates: {} };

// Настройки фона
let configCustomBg = localStorage.getItem('snisago_custom_bg') || '';

// DOM Элементы
const audio = document.getElementById('audioEngine');
const trackListContainer = document.getElementById('trackList');
const ctxMenu = document.getElementById('customContextMenu');

// =========================================
// СТАТИСТИКА ВРЕМЕНИ ПРОСЛУШИВАНИЯ
// =========================================
setInterval(() => {
    if(!isPlaying) return;
    const today = new Date().toISOString().split('T')[0];
    appStats.total++;
    appStats.dates[today] = (appStats.dates[today] || 0) + 1;
    localStorage.setItem('snisago_stats', JSON.stringify(appStats));
}, 1000);

function formatTimeStats(seconds) {
    if(!seconds) return "0 мин";
    const h = Math.floor(seconds / 3600); 
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h} ч ${m} мин` : `${m} мин`;
}

// =========================================
// ИНИЦИАЛИЗАЦИЯ И ФОН
// =========================================
window.addEventListener('load', () => {
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        splash.style.opacity = '0';
        splash.style.visibility = 'hidden';
        setTimeout(() => splash.remove(), 600);
        
        if (!localStorage.getItem('snisago_eula_accepted')) {
            document.getElementById('eulaModal').style.display = 'flex';
        }
    }, 1500); 
});

document.getElementById('btnAcceptEula').addEventListener('click', () => {
    localStorage.setItem('snisago_eula_accepted', 'true');
    document.getElementById('eulaModal').style.display = 'none';
});

function applyBackground() {
    const videoEl = document.getElementById('appVideoBg');
    if (configCustomBg.match(/\.(mp4|webm)$/i)) {
        document.body.style.backgroundImage = 'none';
        videoEl.src = configCustomBg; 
        videoEl.style.display = 'block';
    } else {
        videoEl.style.display = 'none'; 
        videoEl.pause();
        document.body.style.backgroundImage = configCustomBg ? `url('${configCustomBg}')` : '';
    }
}
applyBackground();

// =========================================
// АУДИО ДВИЖОК: ЭКВАЛАЙЗЕР И ВИЗУАЛИЗАТОР
// =========================================
let audioCtx, analyser, source;
const eqFreqs = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
let eqFilters = [];
let savedEq = JSON.parse(localStorage.getItem('snisago_eq')) || [0,0,0,0,0,0,0,0,0,0];

function initAudioEngine() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    source = audioCtx.createMediaElementSource(audio);
    
    // Создаем 10 полос EQ
    eqFreqs.forEach((f, i) => {
        let filter = audioCtx.createBiquadFilter();
        filter.type = 'peaking'; 
        filter.frequency.value = f; 
        filter.gain.value = savedEq[i];
        eqFilters.push(filter);
    });
    
    // Соединяем цепь: Source -> EQ1 -> EQ2... -> Analyser -> Destination
    source.connect(eqFilters[0]);
    for(let i=0; i<eqFilters.length-1; i++) { 
        eqFilters[i].connect(eqFilters[i+1]); 
    }
    
    analyser = audioCtx.createAnalyser(); 
    analyser.fftSize = 256;
    eqFilters[eqFilters.length-1].connect(analyser);
    analyser.connect(audioCtx.destination);
    
    drawBgVisualizer();
}

// Генерация ползунков EQ
const eqContainer = document.getElementById('eqSlidersBlock');
eqFreqs.forEach((f, i) => {
    let label = f >= 1000 ? (f/1000)+'k' : f;
    eqContainer.innerHTML += `
        <div class="eq-band">
            <span style="color:var(--text-muted); font-size:12px;">+12</span>
            <input type="range" min="-12" max="12" value="${savedEq[i]}" data-idx="${i}">
            <span style="color:var(--text-muted); font-size:12px; margin-top:70px;">${label}</span>
        </div>`;
});

eqContainer.addEventListener('input', (e) => {
    if(e.target.tagName === 'INPUT') {
        const idx = e.target.dataset.idx; 
        const val = parseFloat(e.target.value);
        savedEq[idx] = val; 
        if(eqFilters[idx]) eqFilters[idx].gain.value = val;
        localStorage.setItem('snisago_eq', JSON.stringify(savedEq));
    }
});

window.setEqPreset = function(arr) {
    arr.forEach((val, i) => { 
        savedEq[i] = val; 
        if(eqFilters[i]) eqFilters[i].gain.value = val; 
        document.querySelector(`.eq-band input[data-idx="${i}"]`).value = val;
    });
    localStorage.setItem('snisago_eq', JSON.stringify(savedEq));
}

document.getElementById('btnEqOpen').addEventListener('click', () => { 
    document.getElementById('eqModal').style.display = 'flex'; 
});

// Фоновый визуализатор
const bgCanvas = document.getElementById('bgVisualizerCanvas'); 
const bgCtx = bgCanvas.getContext('2d');

function drawBgVisualizer() {
    requestAnimationFrame(drawBgVisualizer);
    if(!isPlaying || !analyser) { 
        bgCtx.clearRect(0,0,bgCanvas.width, bgCanvas.height); 
        return; 
    }
    bgCanvas.width = window.innerWidth; 
    bgCanvas.height = window.innerHeight;
    
    const bufferLength = analyser.frequencyBinCount; 
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    
    bgCtx.clearRect(0,0,bgCanvas.width, bgCanvas.height);
    const barWidth = (bgCanvas.width / bufferLength) * 2.5; 
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
        let barHeight = dataArray[i] * 2;
        bgCtx.fillStyle = `rgba(139, 92, 246, ${dataArray[i]/255})`;
        bgCtx.fillRect(x, bgCanvas.height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
    }
}

// =========================================
// ЛИРИКА (КАРАОКЕ ЧЕРЕЗ LRCLIB)
// =========================================
let currentLyrics = [];

async function fetchLyrics(title, artist) {
    const box = document.getElementById('lyricsBox');
    box.innerHTML = `<div style="color:var(--text-muted); text-align:center; margin-top:40%;">Ищем текст песни...</div>`;
    try {
        const cleanTitle = title.replace(/\(.*\)|\[.*\]/g, '').trim();
        const res = await fetch(`https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(artist)}`);
        const data = await res.json();
        
        if(data.syncedLyrics) {
            currentLyrics = parseLrc(data.syncedLyrics); 
            renderLyrics();
        } else { 
            box.innerHTML = `<div style="color:var(--text-muted); text-align:center; margin-top:40%;">Текст не найден :(</div>`; 
            currentLyrics = []; 
        }
    } catch(e) { 
        box.innerHTML = `<div style="color:var(--text-muted); text-align:center; margin-top:40%;">Ошибка загрузки текста</div>`; 
        currentLyrics = []; 
    }
}

function parseLrc(lrc) {
    const lines = lrc.split('\n'); 
    const result = [];
    lines.forEach(line => {
        const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
        if(match) result.push({ time: parseInt(match[1])*60 + parseFloat(match[2]), text: match[3].trim() });
    });
    return result;
}

function renderLyrics() {
    const box = document.getElementById('lyricsBox'); 
    box.innerHTML = '';
    currentLyrics.forEach((line, i) => {
        if(!line.text) return;
        box.innerHTML += `<div class="lyric-line" id="lrc-${i}" onclick="audio.currentTime=${line.time}">${line.text}</div>`;
    });
}

// =========================================
// УПРАВЛЕНИЕ ПЛЕЙЛИСТАМИ
// =========================================
function savePlaylists() { localStorage.setItem('snisago_playlists', JSON.stringify(customPlaylists)); }
function saveMyMusic() { localStorage.setItem('snisago_my_music', JSON.stringify(myMusicTracks)); }
function saveFavorites() { localStorage.setItem('snisago_fav_tracks', JSON.stringify(favoriteTracks)); }

// Удаление плейлиста
window.deletePlaylist = function(id, e) {
    e.stopPropagation();
    if(confirm("Вы уверены, что хотите удалить этот плейлист?")) {
        customPlaylists = customPlaylists.filter(p => p.id !== id);
        savePlaylists();
        renderPlaylistsSidebar(); 
        if(currentFilter === `playlist_${id}`) document.getElementById('menuHome').click();
    }
}

// Шеринг
window.exportPlaylist = function(plId) {
    const pl = customPlaylists.find(p => p.id === plId);
    if(!pl) return;
    const code = btoa(unescape(encodeURIComponent(JSON.stringify(pl))));
    navigator.clipboard.writeText("snisago-pl://" + code);
    showToast(`Ссылка на плейлист "${pl.name}" скопирована!`);
}

function renderPlaylistsSidebar() {
    const container = document.getElementById('playlistList'); 
    container.innerHTML = '';
    customPlaylists.forEach(pl => {
        const a = document.createElement('a'); 
        a.href = '#'; 
        a.id = `playlist_${pl.id}`;
        a.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15V6"></path><path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path><path d="M12 12H3"></path><path d="M16 6H3"></path><path d="M12 18H3"></path></svg> 
            ${pl.name} 
            <button class="del-pl-btn" onclick="deletePlaylist('${pl.id}', event)" title="Удалить плейлист">✖</button>`;
        
        a.addEventListener('click', () => setMenuFilter(`playlist_${pl.id}`, a.id, pl.name));
        container.appendChild(a);
    });
}

// =========================================
// ВОСПРОИЗВЕДЕНИЕ ТРЕКОВ
// =========================================
function loadTrack(index) {
    if(playlist.length === 0) return;
    if (index < 0) index = playlist.length - 1;
    if (index >= playlist.length) index = 0;

    currentTrackIndex = index; 
    const track = playlist[index];
    
    // Сохранение в историю
    historyTracks = historyTracks.filter(t => t.src !== track.src);
    historyTracks.unshift(track);
    if (historyTracks.length > 10) historyTracks.pop();
    localStorage.setItem('snisago_history', JSON.stringify(historyTracks));

    // Загрузка ресурса
    audio.src = track.type === 'web' ? track.src : `file://${track.src}`;
    
    // Обновление UI
    document.getElementById('currentTitle').innerText = track.title;
    document.getElementById('npTitle').innerText = track.title;
    document.getElementById('currentArtist').innerText = track.artist;
    document.getElementById('npArtist').innerText = track.artist;
    
    if (track.cover.startsWith('http') || track.cover.startsWith('data:image')) {
        document.getElementById('currentCoverContainer').innerHTML = `<img src="${track.cover}" style="width:100%; height:100%; border-radius:10px; object-fit:cover;">`;
        document.getElementById('npCoverContainer').innerHTML = `<img src="${track.cover}" style="width:100%; height:100%; object-fit:cover;">`;
        document.getElementById('npBg').style.backgroundImage = `url(${track.cover})`;
    } else {
        document.getElementById('currentCoverContainer').innerHTML = `<div class="player-letter-cover" style="width:100%; height:100%; font-size:24px; background:${track.cover}; color:#fff; display:flex; align-items:center; justify-content:center; border-radius:10px;">🎶</div>`;
        document.getElementById('npCoverContainer').innerHTML = `<div class="player-letter-cover" style="width:100%; height:100%; font-size:80px; background:${track.cover}; color:#fff; display:flex; align-items:center; justify-content:center;">🎶</div>`;
        document.getElementById('npBg').style.backgroundImage = 'none';
        document.getElementById('npBg').style.backgroundColor = track.cover;
    }
    
    fetchLyrics(track.title, track.artist);
    playTrack();
    
    // Отправка сигнала для OSD Оверлея (Бэкенд)
    ipcRenderer.send('track-changed', { title: track.title, artist: track.artist });
}

function playTrack() {
    initAudioEngine();
    if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    
    audio.play().catch(e => console.error("Ошибка воспроизведения:", e));
    isPlaying = true; 
    
    document.getElementById('playIcon').style.display = 'none';
    document.getElementById('pauseIcon').style.display = 'block';
    
    // Перерисовка треков для выделения активного
    if (currentFilter !== 'home' && currentFilter !== 'settings') displayTracksUI();
}

function pauseTrack() { 
    audio.pause(); 
    isPlaying = false; 
    document.getElementById('playIcon').style.display = 'block'; 
    document.getElementById('pauseIcon').style.display = 'none';
    if (currentFilter !== 'home' && currentFilter !== 'settings') displayTracksUI();
}

document.getElementById('playBtn').addEventListener('click', () => {
    if(audio.paused) { 
        if(!audio.src && playlist.length > 0) loadTrack(0); 
        else playTrack(); 
    } else { 
        pauseTrack(); 
    }
});

document.getElementById('nextBtn').addEventListener('click', () => { 
    if (isShuffle) loadTrack(Math.floor(Math.random() * playlist.length));
    else loadTrack(currentTrackIndex + 1); 
});

document.getElementById('prevBtn').addEventListener('click', () => { 
    if (isShuffle) loadTrack(Math.floor(Math.random() * playlist.length));
    else loadTrack(currentTrackIndex - 1); 
});

audio.addEventListener('ended', () => {
    if (repeatMode === 2) { audio.currentTime = 0; playTrack(); } 
    else if (isShuffle) { loadTrack(Math.floor(Math.random() * playlist.length)); } 
    else {
        if (currentTrackIndex + 1 < playlist.length) { loadTrack(currentTrackIndex + 1); } 
        else if (repeatMode === 1) { loadTrack(0); } 
        else { pauseTrack(); }
    }
});

// Обновление прогресса и караоке
audio.addEventListener('timeupdate', () => {
    if (!audio.duration || audio.duration === Infinity) { 
        document.getElementById('currentTime').innerText = "LIVE"; 
        document.getElementById('duration').innerText = "∞"; 
        return; 
    }
    
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    const progressBar = document.getElementById('progressBar');
    progressBar.value = progressPercent;
    progressBar.style.background = `linear-gradient(to right, var(--accent) ${progressPercent}%, rgba(255,255,255,0.25) ${progressPercent}%)`;
    
    let mins = Math.floor(audio.currentTime / 60); 
    let secs = Math.floor(audio.currentTime % 60);
    document.getElementById('currentTime').innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    
    let dMins = Math.floor(audio.duration / 60); 
    let dSecs = Math.floor(audio.duration % 60);
    document.getElementById('duration').innerText = `${dMins}:${dSecs < 10 ? '0' : ''}${dSecs}`;
    
    // Синхронизация текста
    if(currentLyrics.length > 0 && document.getElementById('nowPlayingOverlay').classList.contains('active')) {
        let activeIdx = currentLyrics.findIndex((l, i) => audio.currentTime >= l.time && (!currentLyrics[i+1] || audio.currentTime < currentLyrics[i+1].time));
        if(activeIdx !== -1) {
            document.querySelectorAll('.lyric-line').forEach(el => el.classList.remove('active'));
            const activeEl = document.getElementById(`lrc-${activeIdx}`);
            if(activeEl) { 
                activeEl.classList.add('active'); 
                activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
            }
        }
    }
});

document.getElementById('progressBar').addEventListener('input', (e) => { 
    if (audio.duration && audio.duration !== Infinity) { 
        audio.currentTime = (e.target.value / 100) * audio.duration; 
    } 
});

document.getElementById('volumeBar').addEventListener('input', (e) => { 
    audio.volume = e.target.value / 100; 
    e.target.style.background = `linear-gradient(to right, #fff ${e.target.value}%, rgba(255,255,255,0.25) ${e.target.value}%)`;
});

// =========================================
// РЕНДЕР ИНТЕРФЕЙСА (TRACKS UI)
// =========================================
function displayTracksUI() {
    if (trackSortableInstance) { trackSortableInstance.destroy(); trackSortableInstance = null; }
    trackListContainer.innerHTML = '';
    
    const searchQuery = document.getElementById('searchBox').value.toLowerCase().trim();
    let filtered = [...playlist];
    
    if (searchQuery !== "") { 
        filtered = filtered.filter(t => t.title.toLowerCase().includes(searchQuery) || t.artist.toLowerCase().includes(searchQuery)); 
    }
    
    if (filtered.length === 0) { 
        trackListContainer.innerHTML = `<div style="padding: 20px; color: var(--text-muted);">Список пуст.</div>`; 
        return; 
    }
    
    const canReorder = (currentFilter === 'myMusic' || currentFilter.startsWith('playlist_')) && searchQuery === '';

    filtered.forEach((track, index) => {
        const row = document.createElement('div');
        row.className = `track-row ${track.src === audio.src && isPlaying ? 'active-track' : ''}`;
        
        let handleHtml = canReorder ? `<div class="drag-handle">☰</div>` : '';
        let coverHtml = track.cover.startsWith('http') || track.cover.startsWith('data:image') 
            ? `<img src="${track.cover}" style="width: 46px; height: 46px; border-radius: 8px; flex-shrink:0; object-fit: cover;">` 
            : `<div style="width: 46px; height: 46px; border-radius: 8px; flex-shrink:0; background: ${track.cover}; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold;">🎶</div>`;
        
        const isFav = favoriteTracks.some(f => f.src === track.src);
        const heartIcon = `<svg class="fav-btn-svg ${isFav ? 'active' : ''}" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
        const quickAddIcon = `<button class="quick-add-btn" title="Добавить в плейлист"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>`;

        row.innerHTML = `
            ${handleHtml}
            ${coverHtml}
            <div class="track-meta">
                <div class="title">${track.title}</div>
                <div class="artist">${track.artist} <span class="source-badge ${track.type === 'local' ? 'badge-local' : 'badge-web'}">${track.type.toUpperCase()}</span></div>
            </div>
            ${quickAddIcon}
            <div class="fav-action-wrapper" style="padding: 10px; display: flex; align-items: center; justify-content: center;">${heartIcon}</div>
        `;

        // Клик по треку
        row.addEventListener('click', (e) => { 
            if (e.target.closest('.fav-action-wrapper') || e.target.closest('.drag-handle') || e.target.closest('.quick-add-btn')) return; 
            const exactIndex = playlist.findIndex(p => p.src === track.src); 
            loadTrack(exactIndex); 
        });
        
        // Кнопка избранного
        row.querySelector('.fav-action-wrapper').addEventListener('click', () => { 
            if (!isFav) favoriteTracks.push({ ...track, isFavorite: true }); 
            else favoriteTracks = favoriteTracks.filter(f => f.src !== track.src); 
            saveFavorites(); 
            if (currentFilter === 'fav') setMenuFilter('fav', 'menuFavorites', 'Любимые треки'); 
            else displayTracksUI(); 
        });

        // Кнопка быстрого добавления в плейлист
        row.querySelector('.quick-add-btn').addEventListener('click', () => {
            rightClickedTrackIndex = playlist.findIndex(p => p.src === track.src);
            openPlaylistPicker();
        });
        
        // Контекстное меню
        row.addEventListener('contextmenu', (e) => { 
            e.preventDefault(); 
            rightClickedTrackIndex = playlist.findIndex(p => p.src === track.src); 
            ctxMenu.style.display = 'block'; 
            ctxMenu.style.left = `${e.clientX}px`; 
            ctxMenu.style.top = `${e.clientY}px`; 
            
            const favText = document.getElementById('ctxFavorite');
            if(isFav) {
                favText.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg> Убрать из избранного`;
            } else {
                favText.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> В избранное`;
            }
        });
        
        trackListContainer.appendChild(row);
    });

    // Инициализация Drag and Drop
    if (canReorder) {
        trackSortableInstance = Sortable.create(trackListContainer, {
            animation: 150, 
            handle: '.drag-handle',
            onEnd: function (evt) {
                let targetArray = currentFilter === 'myMusic' ? myMusicTracks : customPlaylists.find(p => `playlist_${p.id}` === currentFilter).tracks;
                const movedTrack = targetArray.splice(evt.oldIndex, 1)[0];
                targetArray.splice(evt.newIndex, 0, movedTrack);
                if (currentFilter === 'myMusic') saveMyMusic(); else savePlaylists();
                playlist = [...targetArray]; 
            }
        });
    }
}

// =========================================
// НАВИГАЦИЯ И ВИДЫ (VIEWS)
// =========================================
const setMenuFilter = (filterType, elementId, titleText) => {
    currentFilter = filterType; 
    document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
    if(document.getElementById(elementId)) document.getElementById(elementId).classList.add('active'); 
    
    let sectionTitle = document.getElementById('sectionTitle');
    if (sectionTitle) sectionTitle.innerHTML = titleText;
    
    const topBar = document.getElementById('appTopBar');
    
    if (filterType === 'home') {
        topBar.style.display = 'none'; 
        
        let newsHtml = '';
        appNews.forEach((news, idx) => {
            newsHtml += `<div class="stat-card" style="cursor:pointer; text-align:left;" onclick="showNews(${idx})"><div class="stat-val" style="font-size:18px;">${news.version}</div><div class="stat-label" style="text-transform:none;">${news.title}</div></div>`;
        });

        trackListContainer.innerHTML = `
            <div style="padding: 10px 0;">
                <h1 style="font-size: 42px; font-weight: 800; margin-bottom: 5px;">Добро пожаловать</h1>
                <p style="color: var(--text-muted); margin-bottom: 40px;">Библиотека готова к работе. С чего начнем сегодня?</p>
                
                <h3 style="color:#fff; margin-bottom:15px;">История обновлений</h3>
                <div style="display:flex; gap:15px; margin-bottom:40px;">${newsHtml}</div>
            </div>`;
        return;
    }
    
    if (filterType === 'settings') {
        topBar.style.display = 'none';
        const today = new Date().toISOString().split('T')[0];
        let yestDate = new Date(); yestDate.setDate(yestDate.getDate() - 1);
        const yesterday = yestDate.toISOString().split('T')[0];
        
        let displayedBgValue = configCustomBg;
        if (configCustomBg.startsWith('file:///')) displayedBgValue = "Локальный видео/фото файл";

        trackListContainer.innerHTML = `
        <div class="settings-card">
          <div style="padding:30px;">
              <h2 style="margin-bottom: 20px;">Настройки приложения</h2>
              
              <div class="setting-row">
                  <div>
                      <div class="setting-title">Статистика использования</div>
                      <div class="setting-desc">Время, проведенное за прослушиванием музыки</div>
                  </div>
                  <div class="stats-block">
                      <div class="stat-card"><div class="stat-val">${formatTimeStats(appStats.dates[today])}</div><div class="stat-label">Сегодня</div></div>
                      <div class="stat-card"><div class="stat-val">${formatTimeStats(appStats.dates[yesterday])}</div><div class="stat-label">Вчера</div></div>
                      <div class="stat-card"><div class="stat-val">${formatTimeStats(appStats.total)}</div><div class="stat-label">За все время</div></div>
                  </div>
              </div>

              <div class="setting-row">
                  <div>
                      <div class="setting-title">Кастомный фон (Фото или Видео MP4/WebM)</div>
                      <div class="setting-desc">Вставьте прямую ссылку или выберите локальный файл. Видео автоматически зациклится на фоне плеера.</div>
                  </div>
                  <div style="display:flex; gap:10px; width:400px; align-items:center;">
                      <input type="text" id="inputCustomBg" class="settings-input" style="flex:1;" value="${displayedBgValue}" placeholder="URL картинки или видео...">
                      <button class="btn-add" id="btnBrowseBg">📁 Файл</button>
                      <input type="file" id="fileInputBg" accept="image/*,video/mp4,video/webm" style="display:none;">
                  </div>
              </div>
              
              <p style="color:var(--text-muted); margin-top:40px; font-size:12px;">Сборка: Snisago Music v${APP_VERSION} | Независимые окна работают через API Electron.</p>
          </div>
        </div>`;
        
        document.getElementById('btnBrowseBg').addEventListener('click', () => document.getElementById('fileInputBg').click());
        document.getElementById('fileInputBg').addEventListener('change', (e) => { 
            if(e.target.files[0]) { 
                configCustomBg = 'file:///' + webUtils.getPathForFile(e.target.files[0]).replace(/\\/g, '/'); 
                localStorage.setItem('snisago_custom_bg', configCustomBg); 
                applyBackground(); 
                document.getElementById('inputCustomBg').value = "Локальный файл загружен";
            } 
        });
        document.getElementById('inputCustomBg').addEventListener('change', (e) => {
            const val = e.target.value.trim();
            if(!val.startsWith("Локальный")) {
                configCustomBg = val;
                localStorage.setItem('snisago_custom_bg', configCustomBg);
                applyBackground();
            }
        });
        return;
    }

    // Рендер списков треков
    topBar.style.display = 'flex';
    let plIdForExport = null;

    if (filterType === 'myMusic') playlist = [...myMusicTracks];
    else if (filterType === 'fav') playlist = [...favoriteTracks];
    else if (filterType.startsWith('playlist_')) { 
        const plId = filterType.replace('playlist_', ''); 
        plIdForExport = plId; 
        const pl = customPlaylists.find(p => p.id === plId); 
        playlist = pl ? [...pl.tracks] : []; 
    }
    else if (filterType === 'record') playlist = radioDatabase.filter(r => r.category === 'record');
    else if (filterType === 'retro') playlist = radioDatabase.filter(r => r.category === 'retro');
    else if (filterType === 'modern') playlist = radioDatabase.filter(r => r.category === 'modern');
    else if (filterType === 'other') playlist = radioDatabase.filter(r => r.category === 'other');

    // Кнопка шеринга плейлиста в заголовке
    if (plIdForExport) {
        if (!sectionTitle.querySelector('.share-btn-head')) {
            sectionTitle.innerHTML += `<button class="share-btn-head btn-add" style="font-size:12px; padding:6px 12px;" onclick="exportPlaylist('${plIdForExport}')">🔗 Поделиться кодом</button>`;
        }
    }

    displayTracksUI();
};

document.getElementById('menuHome').addEventListener('click', () => setMenuFilter('home', 'menuHome', 'Главная'));
document.getElementById('menuMyMusic').addEventListener('click', () => setMenuFilter('myMusic', 'menuMyMusic', 'Моя музыка'));
document.getElementById('menuFavorites').addEventListener('click', () => setMenuFilter('fav', 'menuFavorites', 'Любимые треки'));
document.getElementById('menuSettings').addEventListener('click', () => setMenuFilter('settings', 'menuSettings', 'Настройки'));

// Инициализация Drag and Drop для бокового меню
Sortable.create(document.getElementById('sidebar'), {
    animation: 150, 
    handle: 'h3'
});

// =========================================
// ПОДКЛЮЧЕНИЕ ФАЙЛОВ И ССЫЛОК
// =========================================

// Загрузка локальных файлов с ПК
document.getElementById('btnLoadLocalFile').addEventListener('click', () => document.getElementById('localAudioFiles').click());
document.getElementById('localAudioFiles').addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        files.forEach(file => {
            const realPath = webUtils.getPathForFile(file);
            const cleanName = file.name.replace(/\.[^/.]+$/, "");
            let trackObj = { 
                id: 'local-' + Date.now() + Math.random(), 
                title: cleanName, 
                artist: "Локальный файл", 
                src: realPath, 
                type: "local", 
                cover: 'linear-gradient(135deg, #64748b, #334155)'
            };
            
            if (window.jsmediatags) {
                window.jsmediatags.read(file, {
                    onSuccess: function(tag) {
                        if (tag.tags.title) trackObj.title = tag.tags.title;
                        if (tag.tags.artist) trackObj.artist = tag.tags.artist;
                        if (tag.tags.picture) {
                            let base64String = "";
                            for (let i = 0; i < tag.tags.picture.data.length; i++) { 
                                base64String += String.fromCharCode(tag.tags.picture.data[i]); 
                            }
                            trackObj.cover = "data:" + tag.tags.picture.format + ";base64," + window.btoa(base64String);
                        }
                        myMusicTracks.unshift(trackObj); saveMyMusic(); 
                        if(currentFilter === 'myMusic') setMenuFilter('myMusic', 'menuMyMusic', 'Моя музыка');
                    },
                    onError: function() { 
                        myMusicTracks.unshift(trackObj); saveMyMusic(); 
                        if(currentFilter === 'myMusic') setMenuFilter('myMusic', 'menuMyMusic', 'Моя музыка');
                    }
                });
            } else { 
                myMusicTracks.unshift(trackObj); saveMyMusic(); 
                if(currentFilter === 'myMusic') setMenuFilter('myMusic', 'menuMyMusic', 'Моя музыка');
            }
        });
        showToast("Файлы успешно загружены!");
    }
});

// Парсинг ссылок из сети (yt-dlp)
document.getElementById('btnAddUrl').addEventListener('click', async () => { 
    const urlInput = document.getElementById('urlBox'); 
    const val = urlInput.value.trim(); 
    if (!val) return; 
    
    const addBtn = document.getElementById('btnAddUrl'); 
    addBtn.innerText = "⏳...";
    
    try {
        if(val.endsWith('.mp3')) {
            myMusicTracks.unshift({ id: Date.now(), title: "Аудио поток", artist: "Unknown", src: val, type: "web", cover: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' });
        } else {
            const res = await fetch(`http://localhost:3000/api/info?url=${encodeURIComponent(val)}`).then(r => { if (!r.ok) throw new Error(); return r.json(); });
            myMusicTracks.unshift({ id: Date.now(), title: res.title || "Трек", artist: res.uploader || "Сеть", src: `http://localhost:3000/api/stream?url=${encodeURIComponent(val)}`, type: "web", cover: res.thumbnailUrl || 'linear-gradient(135deg, #8b5cf6, #d946ef)' });
        }
        saveMyMusic(); 
        urlInput.value = '';
        if (currentFilter === 'myMusic') setMenuFilter('myMusic', 'menuMyMusic', 'Моя музыка');
        showToast("Трек успешно добавлен в медиатеку!");
    } catch(e) { 
        alert("Ошибка парсинга ссылки! Убедитесь, что сервер работает и платформа не блокирует скачивание."); 
    }
    addBtn.innerText = "Добавить";
});

// =========================================
// UI СОБЫТИЯ И МОДАЛКИ
// =========================================

// Полноэкранный плеер
document.getElementById('btnOpenNowPlaying').addEventListener('click', () => document.getElementById('nowPlayingOverlay').classList.add('active'));
document.getElementById('npCloseBtn').addEventListener('click', () => document.getElementById('nowPlayingOverlay').classList.remove('active'));

// Тост уведомления
function showToast(text) {
    const modal = document.getElementById('updateStatusModal');
    document.getElementById('updateStatusText').innerText = text;
    modal.style.display = 'block';
    setTimeout(() => modal.style.display = 'none', 4000);
}

// Показ новостей
window.showNews = function(index) {
    const news = appNews[index];
    document.getElementById('newsModalTitle').innerText = `Версия ${news.version} - ${news.title}`;
    document.getElementById('newsModalBody').innerHTML = news.details;
    document.getElementById('newsModal').style.display = 'flex';
}

// Создание плейлиста
const plModal = document.getElementById('playlistModal');
document.getElementById('btnCreatePlaylist').addEventListener('click', () => { 
    document.getElementById('playlistNameInput').value = ''; 
    plModal.style.display = 'flex'; 
});
document.getElementById('btnCancelPlaylist').addEventListener('click', () => plModal.style.display = 'none');
document.getElementById('btnSavePlaylist').addEventListener('click', () => {
    const name = document.getElementById('playlistNameInput').value.trim();
    if (name !== '') { 
        customPlaylists.push({ id: Date.now().toString(), name: name, tracks: [] }); 
        savePlaylists(); 
        renderPlaylistsSidebar(); 
    }
    plModal.style.display = 'none';
});

// Добавление в плейлист через контекстное меню
function openPlaylistPicker() {
    if (customPlaylists.length === 0) { showToast("Сначала создайте плейлист!"); return; }
    const plList = document.getElementById('plPickerList'); 
    plList.innerHTML = '';
    
    customPlaylists.forEach(pl => {
        const btn = document.createElement('button'); 
        btn.className = 'btn-cancel'; 
        btn.style.width = '100%'; btn.style.marginBottom = '8px'; btn.style.textAlign = 'left';
        btn.innerText = `🎵 ${pl.name}`;
        btn.onclick = () => {
            const track = playlist[rightClickedTrackIndex];
            if(!pl.tracks.some(t => t.src === track.src)) {
                pl.tracks.push(track); savePlaylists(); showToast(`Трек добавлен в "${pl.name}"`);
            } else { showToast(`Трек уже есть в "${pl.name}"`); }
            document.getElementById('addToPlaylistModal').style.display = 'none';
        };
        plList.appendChild(btn);
    });
    document.getElementById('addToPlaylistModal').style.display = 'flex';
}

// Клики по контекстному меню
document.getElementById('ctxPlay').addEventListener('click', () => { if (rightClickedTrackIndex !== null) loadTrack(rightClickedTrackIndex); });
document.getElementById('ctxCopy').addEventListener('click', () => { if (rightClickedTrackIndex !== null) navigator.clipboard.writeText(playlist[rightClickedTrackIndex].src); showToast('Ссылка скопирована!'); });
document.getElementById('ctxAddToPlaylistBtn').addEventListener('click', () => { if (rightClickedTrackIndex !== null) openPlaylistPicker(); });

document.getElementById('ctxFavorite').addEventListener('click', () => { 
    if (rightClickedTrackIndex !== null) { 
        const track = playlist[rightClickedTrackIndex]; 
        const isFav = favoriteTracks.some(f => f.src === track.src); 
        if (!isFav) favoriteTracks.push(track); 
        else favoriteTracks = favoriteTracks.filter(f => f.src !== track.src); 
        saveFavorites(); displayTracksUI(); 
    } 
});

document.getElementById('ctxDelete').addEventListener('click', () => { 
    if (rightClickedTrackIndex !== null) { 
        const track = playlist[rightClickedTrackIndex]; 
        if (currentFilter.startsWith('playlist_')) {
            const plId = currentFilter.replace('playlist_', '');
            const pl = customPlaylists.find(p => p.id === plId);
            if (pl) { pl.tracks = pl.tracks.filter(t => t.id !== track.id); savePlaylists(); }
        } else {
            myMusicTracks = myMusicTracks.filter(l => l.id !== track.id); saveMyMusic();
            favoriteTracks = favoriteTracks.filter(f => f.src !== track.src); saveFavorites(); 
        }
        displayTracksUI(); 
    } 
});

// Закрытие менюшек при клике мимо
window.addEventListener('click', () => { ctxMenu.style.display = 'none'; });

// =========================================
// ИНТЕГРАЦИЯ С MAIN.JS (БЭКЕНД ELECTRON)
// =========================================

// Запрос на открытие независимого окна мини-плеера
document.getElementById('btnMiniPlayer').addEventListener('click', () => {
    ipcRenderer.send('open-mini-player'); 
});

// Инициализация при старте
setMenuFilter('home', 'menuHome', 'Главная');
renderPlaylistsSidebar();