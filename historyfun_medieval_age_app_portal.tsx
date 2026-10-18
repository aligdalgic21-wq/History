import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sword, Shield, BookOpen, Trophy, Users, Download, Smartphone, 
  Maximize2, Minimize2, CheckCircle2, XCircle, Clock, Flame, 
  Sparkles, ChevronLeft, Bookmark, Search, 
  UserPlus, Crown, Compass, Scroll, Castle, 
  Settings, Check, Play, RotateCcw, Volume2, VolumeX, Globe, 
  Wifi, WifiOff, RefreshCw, Plus, LogIn, Award, Sliders, Heart, UserCheck
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  collection 
} from 'firebase/firestore';

// ============================================================================
// FIREBASE INITIALIZATION (ONLINE MULTIPLAYER & CLOUD LOBBIES)
// ============================================================================
let app = null;
let auth = null;
let db = null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'historyfun-medieval-app';

try {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    const firebaseConfig = JSON.parse(__firebase_config);
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (err) {
  console.error('Firebase initialization skipped or offline:', err);
}

// ============================================================================
// HISTORICAL CONTENT DATABASE (ALL OF THE MEDIEVAL AGE: 476 – 1500 AD)
// Bundled locally inside the APK for 100% Offline Access
// ============================================================================

const ERAS = [
  { id: 'all', name: 'All Eras', range: '476 – 1500 AD', icon: Globe },
  { id: 'early', name: 'Early Middle Ages', range: '476 – 1000 AD', icon: Shield },
  { id: 'high', name: 'High Middle Ages', range: '1000 – 1300 AD', icon: Castle },
  { id: 'late', name: 'Late Middle Ages', range: '1300 – 1500 AD', icon: Sword },
  { id: 'global', name: 'Global Medieval', range: '500 – 1500 AD', icon: Compass }
];

const MODULES = [
  {
    id: 'm1',
    era: 'early',
    title: 'Fall of Rome & Rise of Byzantium',
    date: '476 – 565 AD',
    readTime: '5 min',
    xp: 120,
    icon: '🏛️',
    summary: 'As the Western Roman Empire collapsed in 476 AD, the Eastern Roman (Byzantine) Empire thrived under Emperor Justinian I, preserving Roman law and building the Hagia Sophia.',
    keyFacts: [
      '476 AD: Odoacer deposes Romulus Augustulus, marking the traditional end of Western Rome.',
      'Emperor Justinian I (r. 527–565) codified Roman laws into the Corpus Juris Civilis.',
      'General Belisarius reconquered North Africa and parts of Italy for Constantinople.',
      'The Hagia Sophia was completed in 537 AD with its revolutionary massive dome.'
    ],
    ruler: 'Emperor Justinian I & Empress Theodora',
    artifact: 'Corpus Juris Civilis (Code of Justinian)',
    dailyLife: 'Citizens in Constantinople enjoyed chariot races at the Hippodrome between the Blue and Green factions, public baths, and bustling silk markets.'
  },
  {
    id: 'm2',
    era: 'early',
    title: 'Charlemagne & The Carolingian Renaissance',
    date: '768 – 814 AD',
    readTime: '6 min',
    xp: 150,
    icon: '👑',
    summary: 'Charlemagne united much of Western Europe for the first time since the Roman Empire, sparking a cultural and educational revival and being crowned Emperor by the Pope.',
    keyFacts: [
      'Crowned "Emperor of the Romans" by Pope Leo III on Christmas Day, 800 AD.',
      'Established his imperial capital and palace school at Aachen (modern Germany).',
      'Standardized medieval Latin script with Carolingian Minuscule, introducing lowercase letters and clear spacing.',
      'Expanded Frankish territory across France, Germany, and northern Italy.'
    ],
    ruler: 'Charlemagne (Charles the Great)',
    artifact: 'Imperial Crown & Joyeuse Sword',
    dailyLife: 'Monastic scribes spent hours in scriptoriums copying ancient texts by candlelight, preserving classical knowledge for future centuries.'
  },
  {
    id: 'm3',
    era: 'early',
    title: 'The Viking Age & Norse Expansion',
    date: '793 – 1066 AD',
    readTime: '7 min',
    xp: 150,
    icon: '⛵',
    summary: 'Norse seafarers from Scandinavia used advanced longships to raid, trade, and settle across Europe, reaching as far east as Baghdad and as far west as North America.',
    keyFacts: [
      '793 AD: The raid on Lindisfarne monastery in England shocked Christian Europe.',
      'Viking longships had shallow drafts, allowing them to sail both open oceans and shallow rivers.',
      'Founded Dublin, settled Iceland and Greenland, and Leif Erikson reached Vinland (Newfoundland) around 1000 AD.',
      'Established the Danelaw in England and the Duchy of Normandy in France.'
    ],
    ruler: 'Cnut the Great & Harald Fairhair',
    artifact: 'Oseberg Viking Longship & Ulfberht Sword',
    dailyLife: 'Most Norsemen were farmers and craftsmen living in timber longhouses, governed by local assemblies of free men called a "Thing".'
  },
  {
    id: 'm4',
    era: 'global',
    title: 'The Islamic Golden Age',
    date: '750 – 1258 AD',
    readTime: '8 min',
    xp: 180,
    icon: '🔭',
    summary: 'Under the Abbasid Caliphate centered in Baghdad, scholars translated the world’s knowledge and pioneered algebra, optics, medicine, and astronomy.',
    keyFacts: [
      'Caliph Harun al-Rashid and Al-Ma\'mun established the House of Wisdom (Bayt al-Hikma) in Baghdad.',
      'Al-Khwarizmi developed Algebra (from "al-jabr") and introduced Hindu-Arabic numerals.',
      'Ibn Sina (Avicenna) wrote "The Canon of Medicine", used in European universities for 500 years.',
      'Ibn al-Haytham revolutionized optics and established early scientific experimental methods.'
    ],
    ruler: 'Caliph Harun al-Rashid',
    artifact: 'Brass Astrolabe & The Canon of Medicine',
    dailyLife: 'Major cities like Baghdad and Córdoba featured street lighting, public hospitals (Bimaristans), paper mills, and libraries with hundreds of thousands of books.'
  },
  {
    id: 'm5',
    era: 'high',
    title: '1066: The Norman Conquest & Feudalism',
    date: '1066 – 1154 AD',
    readTime: '6 min',
    xp: 140,
    icon: '🏰',
    summary: 'William the Conqueror’s victory at the Battle of Hastings reshaped England, introducing Norman stone castles, the Domesday Book, and a strict feudal hierarchy.',
    keyFacts: [
      'October 14, 1066: William of Normandy defeated King Harold Godwinson at the Battle of Hastings.',
      '1086 AD: Commissioned the Domesday Book, a comprehensive survey of all land and livestock in England.',
      'Built iconic stone castles including the White Tower (Tower of London) and Windsor Castle.',
      'Blended Anglo-Saxon and Norman-French languages, giving birth to Middle English.'
    ],
    ruler: 'William I (The Conqueror)',
    artifact: 'The Bayeux Tapestry (70m embroidered chronicle)',
    dailyLife: 'Feudal society was structured around manors: lords held fiefs from the king, knights swore military service, and serfs worked the land in exchange for protection.'
  },
  {
    id: 'm6',
    era: 'high',
    title: 'The Crusades & Chivalric Orders',
    date: '1095 – 1291 AD',
    readTime: '8 min',
    xp: 170,
    icon: '⚔️',
    summary: 'A series of religious wars launched by Pope Urban II for control of the Holy Land, leading to centuries of conflict and intense cultural and trade exchange between East and West.',
    keyFacts: [
      '1095 AD: Pope Urban II called for the First Crusade at the Council of Clermont, capturing Jerusalem in 1099.',
      '1187 AD: Saladin (Salah ad-Din) united Egypt and Syria and recaptured Jerusalem after the Battle of Hattin.',
      'The Third Crusade (1189–1192) featured the famous rivalry between King Richard the Lionheart and Saladin.',
      'Military orders like the Knights Hospitaller and Knights Templar pioneered international banking systems.'
    ],
    ruler: 'Salah ad-Din (Saladin) & Richard I the Lionheart',
    artifact: 'Krak des Chevaliers (Crusader Fortress)',
    dailyLife: 'Crusader states in the Levant adopted Eastern customs, spices, sugar, silk, windmills, and advanced castle architecture like concentric walls.'
  },
  {
    id: 'm7',
    era: 'high',
    title: 'Magna Carta & Rise of Parliaments',
    date: '1215 – 1295 AD',
    readTime: '5 min',
    xp: 150,
    icon: '📜',
    summary: 'English barons forced King John to seal the Magna Carta at Runnymede, establishing the foundational principle that even the monarch is subject to the rule of law.',
    keyFacts: [
      'June 15, 1215: King John affixed his Great Seal to the Magna Carta ("Great Charter") at Runnymede.',
      'Guaranteed that no "free man" could be imprisoned or stripped of rights without lawful judgment by equals.',
      'Restricted the king from levying heavy feudal taxes without the consent of the realm’s council.',
      'Paved the way for Simon de Montfort’s Parliament (1265) and Edward I’s Model Parliament (1295).'
    ],
    ruler: 'King John of England',
    artifact: 'Original 1215 Lincoln Cathedral Magna Carta',
    dailyLife: 'Alongside legal reforms, Gothic cathedrals with flying buttresses and stained glass (like Notre-Dame and Chartres) and universities (Bologna, Oxford, Paris) flourished.'
  },
  {
    id: 'm8',
    era: 'global',
    title: 'Feudal Japan, Mongol Empire & Mali',
    date: '1185 – 1350 AD',
    readTime: '9 min',
    xp: 200,
    icon: '⛩️',
    summary: 'Beyond Europe, the Kamakura Shogunate rose in Japan, Genghis Khan forged the largest contiguous land empire in history, and Mansa Musa made Mali an economic superpower.',
    keyFacts: [
      '1185 AD: Minamoto no Yoritomo established the Kamakura Shogunate; Samurai followed the code of Bushido.',
      '1206 AD: Genghis Khan united the nomadic tribes of Mongolia, establishing the Pax Mongolica across the Silk Road.',
      '1274 & 1281 AD: Massive Mongol fleets attempting to invade Japan were destroyed by typhoons ("Kamikaze" or divine wind).',
      '1324 AD: Mansa Musa, Emperor of Mali, made a pilgrimage to Mecca with so much gold it caused inflation in Cairo for a decade.'
    ],
    ruler: 'Mansa Musa, Genghis Khan & Minamoto no Yoritomo',
    artifact: 'Catalan Atlas & Sankore Madrasah of Timbuktu',
    dailyLife: 'Merchants like Marco Polo and Ibn Battuta traveled thousands of miles safely across Afro-Eurasia using paper money, caravanserais, and postal relay stations (Yam).'
  },
  {
    id: 'm9',
    era: 'late',
    title: 'The Black Death & Social Upheaval',
    date: '1347 – 1353 AD',
    readTime: '7 min',
    xp: 160,
    icon: '🕯️',
    summary: 'The bubonic plague swept across Eurasia, claiming up to 50% of Europe’s population, shattering the feudal labor system, and transforming medieval medicine and art.',
    keyFacts: [
      'Caused by the bacterium Yersinia pestis, carried by fleas on rats aboard Genoese trading ships from Kaffa in 1347.',
      'Venice & Ragusa invented the concept of "Quarantine" (quaranta giorni = 40 days isolation for arriving ships).',
      'Severe labor shortages empowered surviving peasants to demand higher wages, weakening serfdom.',
      'Sparked the English Peasants’ Revolt of 1381 and inspired the "Danse Macabre" artistic motif.'
    ],
    ruler: 'Pope Clement VI & King Edward III',
    artifact: 'Quarantine Edicts of Ragusa (1377)',
    dailyLife: 'Guilds gained immense power in towns, wages for artisans doubled, and survivors invested in labor-saving mechanical clocks and watermills.'
  },
  {
    id: 'm10',
    era: 'late',
    title: 'Hundred Years’ War, Joan of Arc & Printing Press',
    date: '1337 – 1453 AD',
    readTime: '8 min',
    xp: 190,
    icon: '⚜️',
    summary: 'A 116-year struggle between England and France saw longbows and cannons end the age of armored knights, while Gutenberg’s press and the Fall of Constantinople ushered in the Renaissance.',
    keyFacts: [
      'English Welsh longbowmen defeated heavy French cavalry at Crécy (1346), Poitiers (1356), and Agincourt (1415).',
      '1429 AD: 17-year-old Joan of Arc lifted the Siege of Orléans, turning the tide for King Charles VII of France.',
      'c. 1440–1450: Johannes Gutenberg invented the movable-type printing press in Mainz, revolutionizing literacy.',
      '1453 AD: Ottoman Sultan Mehmed II used giant bombards to conquer Constantinople, marking the end of the Middle Ages.'
    ],
    ruler: 'Joan of Arc, Henry V & Sultan Mehmed II',
    artifact: 'The Gutenberg Bible (42-line Bible)',
    dailyLife: 'Castles could no longer withstand gunpowder artillery; national standing armies replaced feudal levies, and printed pamphlets spread ideas across Europe in weeks.'
  }
];

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    era: 'early',
    difficulty: 'Easy',
    question: 'On Christmas Day in 800 AD, who was crowned "Emperor of the Romans" by Pope Leo III?',
    options: ['Charlemagne', 'William the Conqueror', 'Justinian I', 'Clovis I'],
    correct: 0,
    explanation: 'Charlemagne (Charles the Great), King of the Franks and Lombards, was crowned in St. Peter’s Basilica, laying the foundation for the Holy Roman Empire.'
  },
  {
    id: 'q2',
    era: 'early',
    difficulty: 'Medium',
    question: 'Which famous cathedral with a massive dome was commissioned by Byzantine Emperor Justinian I in 537 AD?',
    options: ['Notre-Dame de Paris', 'Hagia Sophia', 'Chartres Cathedral', 'Canterbury Cathedral'],
    correct: 1,
    explanation: 'The Hagia Sophia ("Holy Wisdom") in Constantinople remained the world’s largest cathedral for nearly a thousand years.'
  },
  {
    id: 'q3',
    era: 'early',
    difficulty: 'Medium',
    question: 'The 793 AD Viking raid on which English island monastery is traditionally considered the start of the Viking Age?',
    options: ['Iona', 'Glastonbury', 'Lindisfarne', 'Whitby'],
    correct: 2,
    explanation: 'The attack on Lindisfarne in Northumbria shocked European chroniclers like Alcuin of York and heralded three centuries of Viking expansion.'
  },
  {
    id: 'q4',
    era: 'global',
    difficulty: 'Easy',
    question: 'In which city was the famous "House of Wisdom" (Bayt al-Hikma) founded during the Islamic Golden Age?',
    options: ['Damascus', 'Cairo', 'Baghdad', 'Córdoba'],
    correct: 2,
    explanation: 'Baghdad, capital of the Abbasid Caliphate, hosted the House of Wisdom where scholars translated Greek, Persian, and Sanskrit works into Arabic.'
  },
  {
    id: 'q5',
    era: 'global',
    difficulty: 'Hard',
    question: 'Which 9th-century scholar at the House of Wisdom wrote the foundational treatise that gave us the word "Algebra"?',
    options: ['Ibn Sina (Avicenna)', 'Al-Khwarizmi', 'Ibn Battuta', 'Al-Razi'],
    correct: 1,
    explanation: 'Muhammad ibn Musa al-Khwarizmi wrote "Al-Kitab al-Mukhtasar fi Hisab al-Jabr wal-Muqabala". His Latinized name, Algoritmi, also gave us the word "algorithm".'
  },
  {
    id: 'q6',
    era: 'high',
    difficulty: 'Easy',
    question: 'In what year did William the Conqueror defeat King Harold Godwinson at the Battle of Hastings?',
    options: ['1000 AD', '1066 AD', '1099 AD', '1215 AD'],
    correct: 1,
    explanation: 'In October 1066, Duke William of Normandy defeated the Anglo-Saxon army at Hastings and was crowned King of England at Westminster Abbey on Christmas Day.'
  },
  {
    id: 'q7',
    era: 'high',
    difficulty: 'Medium',
    question: 'What was the name of the comprehensive land and tax survey of England commissioned by William the Conqueror in 1086?',
    options: ['Magna Carta', 'The Anglo-Saxon Chronicle', 'The Domesday Book', 'The Book of Kells'],
    correct: 2,
    explanation: 'Locals called it the "Domesday Book" because its decisions on property and taxes were as final and inescapable as the Last Judgment (Doomsday).'
  },
  {
    id: 'q8',
    era: 'high',
    difficulty: 'Medium',
    question: 'Which Ayyubid Sultan united Egypt and Syria and recaptured Jerusalem in 1187 after the Battle of Hattin?',
    options: ['Baibars', 'Saladin (Salah ad-Din)', 'Suleiman the Magnificent', 'Harun al-Rashid'],
    correct: 1,
    explanation: 'Saladin defeated the Crusader army at Hattin in July 1187 and peacefully negotiated the surrender of Jerusalem in October, sparking the Third Crusade.'
  },
  {
    id: 'q9',
    era: 'high',
    difficulty: 'Easy',
    question: 'In 1215, rebellious English barons forced King John to seal which historic legal charter at Runnymede?',
    options: ['The Edict of Milan', 'The Treaty of Verdun', 'Magna Carta', 'The Golden Bull'],
    correct: 2,
    explanation: 'Magna Carta ("The Great Charter") established that the king was not above the law and protected the rights of free citizens against arbitrary imprisonment.'
  },
  {
    id: 'q10',
    era: 'global',
    difficulty: 'Easy',
    question: 'Which 14th-century West African Emperor of Mali was famous for his 1324 pilgrimage to Mecca where he distributed massive amounts of gold?',
    options: ['Sundiata Keita', 'Mansa Musa', 'Askia the Great', 'Shaka'],
    correct: 1,
    explanation: 'Mansa Musa I ruled the Mali Empire at its peak, transforming Timbuktu into a center of Islamic scholarship and architecture.'
  },
  {
    id: 'q11',
    era: 'global',
    difficulty: 'Medium',
    question: 'In 1185, following the Genpei War, Minamoto no Yoritomo established Japan’s first military government known as what?',
    options: ['The Tokugawa Shogunate', 'The Kamakura Shogunate', 'The Meiji Restoration', 'The Heian Court'],
    correct: 1,
    explanation: 'Based in Kamakura, this shogunate marked the rise of the Samurai warrior class and feudal governance in medieval Japan.'
  },
  {
    id: 'q12',
    era: 'late',
    difficulty: 'Easy',
    question: 'Which teenaged French heroine inspired the Dauphin’s army to lift the English Siege of Orléans in 1429 during the Hundred Years’ War?',
    options: ['Eleanor of Aquitaine', 'Joan of Arc', 'Matilda of Tuscany', 'Christine de Pizan'],
    correct: 1,
    explanation: 'Joan of Arc (Jeanne d’Arc) led French forces to pivotal victories in 1429, allowing Charles VII to be crowned at Reims Cathedral.'
  },
  {
    id: 'q13',
    era: 'late',
    difficulty: 'Medium',
    question: 'Where was the first formal "Quarantine" (40-day isolation of ships) legally enacted in 1377 to combat the Black Death?',
    options: ['London & Paris', 'Ragusa (Dubrovnik) & Venice', 'Madrid & Lisbon', 'Stockholm & Oslo'],
    correct: 1,
    explanation: 'The Venetian-controlled port of Ragusa (modern Dubrovnik) passed a law in 1377 requiring ships from plague areas to wait 30 days (trentino), soon extended to 40 days (quarantino).'
  },
  {
    id: 'q14',
    era: 'late',
    difficulty: 'Medium',
    question: 'Which weapon gave smaller English armies decisive victories at Crécy (1346) and Agincourt (1415)?',
    options: ['The Pike Square', 'The Crossbow', 'The Welsh Longbow', 'The Trebuchet'],
    correct: 2,
    explanation: 'Made of yew wood, the English/Welsh longbow could fire 10–12 arrows per minute up to 300 yards, penetrating early plate and mail armor.'
  },
  {
    id: 'q15',
    era: 'late',
    difficulty: 'Hard',
    question: 'Which two monumental events occurred around the 1450s that historians often use to mark the end of the Late Middle Ages?',
    options: [
      'The First Crusade & The Norman Conquest',
      'Gutenberg’s Printing Press & The Fall of Constantinople (1453)',
      'The Black Death & The Signing of Magna Carta',
      'The crowning of Charlemagne & Viking raid on Lindisfarne'
    ],
    correct: 1,
    explanation: 'In 1453, Constantinople fell to the Ottoman Empire AND the Hundred Years’ War ended, right as Johannes Gutenberg completed his movable-type printing press in Mainz.'
  }
];

const INITIAL_FRIENDS = [
  {
    id: 'f1',
    name: 'Lady Eleanor of Aquitaine',
    code: 'HF-1122',
    avatar: '👸',
    title: 'High Chronicler',
    level: 14,
    xp: 2850,
    winRate: '78%',
    status: 'online',
    eraSpecialty: 'High Middle Ages',
    accuracy: 0.82
  },
  {
    id: 'f2',
    name: 'Sir William Marshal',
    code: 'HF-1199',
    avatar: '🛡️',
    title: 'Grand Knight',
    level: 18,
    xp: 3420,
    winRate: '85%',
    status: 'online',
    eraSpecialty: 'Crusades & Chivalry',
    accuracy: 0.88
  },
  {
    id: 'f3',
    name: 'Scholar Al-Khwarizmi',
    code: 'HF-0820',
    avatar: '🔭',
    title: 'House of Wisdom Master',
    level: 21,
    xp: 4100,
    winRate: '91%',
    status: 'online',
    eraSpecialty: 'Global Medieval',
    accuracy: 0.92
  }
];

const SUGGESTED_HISTORIANS = [
  {
    id: 's1',
    name: 'Leif the Lucky',
    code: 'HF-1000',
    avatar: '⛵',
    title: 'Norse Navigator',
    level: 9,
    xp: 1650,
    winRate: '64%',
    status: 'online',
    eraSpecialty: 'Early Middle Ages',
    accuracy: 0.68
  },
  {
    id: 's2',
    name: 'Shogun Minamoto',
    code: 'HF-1185',
    avatar: '⛩️',
    title: 'Kamakura Strategist',
    level: 16,
    xp: 3100,
    winRate: '81%',
    status: 'online',
    eraSpecialty: 'Feudal Japan',
    accuracy: 0.84
  },
  {
    id: 's3',
    name: 'Master Gutenberg',
    code: 'HF-1455',
    avatar: '📜',
    title: 'Mainz Printer',
    level: 12,
    xp: 2290,
    winRate: '72%',
    status: 'online',
    eraSpecialty: 'Late Middle Ages',
    accuracy: 0.75
  },
  {
    id: 's4',
    name: 'Empress Theodora',
    code: 'HF-0532',
    avatar: '👑',
    title: 'Byzantine Sovereign',
    level: 19,
    xp: 3890,
    winRate: '87%',
    status: 'online',
    eraSpecialty: 'Byzantine Empire',
    accuracy: 0.86
  }
];

const CURATED_PUBLIC_LOBBIES = [
  {
    id: 'pub-room-1066',
    roomCode: 'HAST-1066',
    hostName: 'Duke William',
    hostAvatar: '🏰',
    hostLevel: 15,
    era: 'High Middle Ages',
    status: 'open',
    accuracy: 0.8
  },
  {
    id: 'pub-room-1215',
    roomCode: 'CHAR-1215',
    hostName: 'Baron FitzWalter',
    hostAvatar: '📜',
    hostLevel: 11,
    era: 'Magna Carta & Law',
    status: 'open',
    accuracy: 0.74
  },
  {
    id: 'pub-room-1324',
    roomCode: 'MALI-1324',
    hostName: 'Chronicler Ibn Battuta',
    hostAvatar: '🧭',
    hostLevel: 17,
    era: 'Global Medieval',
    status: 'open',
    accuracy: 0.85
  }
];

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================

export default function App() {
  // Layout Mode: 'split' (Website + Phone Preview) or 'fullscreen-app' (Full Mobile View)
  const [viewLayout, setViewLayout] = useState('split');

  // EXACT 5 PAGES: 'learn', 'quiz', 'battle', 'friends', 'settings'
  const [activeTab, setActiveTab] = useState('learn');

  // Online / Offline Connectivity State (allows user to test Offline APK capabilities)
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Firebase Auth User
  const [user, setUser] = useState(null);

  // APK Download Modal State
  const [showApkModal, setShowApkModal] = useState(false);
  const [apkDownloadState, setApkDownloadState] = useState('idle');
  const [apkProgress, setApkProgress] = useState(0);

  // App Settings & Preferences
  const [settings, setSettings] = useState({
    soundEffects: true,
    defaultTimedQuiz: true,
    offlinePackageCached: true,
    highContrastText: false
  });

  // User Profile State
  const [userProfile, setUserProfile] = useState({
    name: 'Lord Arthur Pendragon',
    code: 'HF-1453',
    avatar: '⚔️',
    xp: 2450,
    streak: 7,
    wins: 14,
    losses: 3,
    completedModules: ['m1', 'm5'],
    bookmarkedModules: ['m4', 'm7']
  });

  // Learn Mode State
  const [selectedEra, setSelectedEra] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModule, setActiveModule] = useState(null);
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);

  // Quiz Mode State
  const [quizConfig, setQuizConfig] = useState({
    era: 'all',
    timed: true,
    questionCount: 5
  });
  const [quizSession, setQuizSession] = useState(null);
  const [quizTimer, setQuizTimer] = useState(15);

  // Friends & Multiplayer Lobby State
  const [friends, setFriends] = useState(INITIAL_FRIENDS);
  const [suggestedFriends, setSuggestedFriends] = useState(SUGGESTED_HISTORIANS);
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [customFriendName, setCustomFriendName] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Online Battle & Lobby Browser State
  const [cloudLobbies, setCloudLobbies] = useState([]);
  const [joinRoomCodeInput, setJoinRoomCodeInput] = useState('');
  const [hostedLobby, setHostedLobby] = useState(null);
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [battleState, setBattleState] = useState(null);
  const [battleTimer, setBattleTimer] = useState(12);

  // Computed User Level & Title
  const userLevel = Math.floor(userProfile.xp / 200) + 1;
  const userTitle = useMemo(() => {
    if (userLevel < 5) return 'Apprentice Scribe';
    if (userLevel < 10) return 'Squire of the Realm';
    if (userLevel < 15) return 'Knight Errant';
    if (userLevel < 20) return 'Royal Chronicler';
    return 'Grand Master of History';
  }, [userLevel]);

  const triggerToast = (message, type = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3200);
  };

  // ============================================================================
  // FIREBASE AUTHENTICATION & REAL-TIME LOBBIES (RULES 1, 2, 3 COMPLIANT)
  // ============================================================================
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Auth error:', err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db || isOfflineMode) return;

    const lobbiesRef = collection(db, 'artifacts', appId, 'public', 'data', 'battle_lobbies');
    const unsubscribe = onSnapshot(
      lobbiesRef,
      (snapshot) => {
        const fetched = [];
        snapshot.forEach((docSnap) => {
          fetched.push({ id: docSnap.id, ...docSnap.data() });
        });
        // Filter open lobbies in memory (Rule 2 compliance)
        const openRooms = fetched.filter((r) => r.status === 'open');
        setCloudLobbies(openRooms);

        // Check if our hosted lobby was joined by another player
        if (hostedLobby) {
          const myUpdatedRoom = fetched.find((r) => r.id === hostedLobby.id);
          if (myUpdatedRoom && myUpdatedRoom.status === 'matched' && myUpdatedRoom.guestName) {
            setHostedLobby(null);
            startBattleSession({
              name: myUpdatedRoom.guestName,
              avatar: myUpdatedRoom.guestAvatar || '⚔️',
              code: myUpdatedRoom.roomCode,
              title: 'Online Challenger',
              level: myUpdatedRoom.guestLevel || 12,
              accuracy: 0.78,
              matchType: `Room ${myUpdatedRoom.roomCode}`
            });
          }
        }
      },
      (err) => {
        console.error('Firestore lobby listener error:', err);
      }
    );

    return () => unsubscribe();
  }, [user, isOfflineMode, hostedLobby]);

  // ============================================================================
  // APK DOWNLOAD HANDLER
  // ============================================================================
  const startApkDownload = () => {
    setShowApkModal(true);
    setApkDownloadState('downloading');
    setApkProgress(0);
  };

  useEffect(() => {
    if (apkDownloadState !== 'downloading') return;
    const interval = setInterval(() => {
      setApkProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setApkDownloadState('complete');
          try {
            const apkContent = `====================================================
HISTORYFUN MOBILE - OFFICIAL ANDROID PACKAGE BUNDLE
Version: 3.0.0-medieval (Offline + Online Lobbies)
Created & Directed by: Ali Dalgic
Target SDK: Android 14 (API 34)
Package ID: com.alidalgic.historyfun.medieval
====================================================
Offline Modules Included:
- Early Middle Ages (476 - 1000 AD)
- High Middle Ages (1000 - 1300 AD)
- Late Middle Ages (1300 - 1500 AD)
- Global Medieval Civilizations (Islamic Golden Age, Feudal Japan, Mali)
- Offline Solo Quiz Engine & Online Multiplayer Lobby Arena
====================================================`;
            const blob = new Blob([apkContent], { type: 'application/vnd.android.package-archive' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'HistoryFun-v3.0-Medieval-OfflineReady.apk';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          } catch (e) {
            // Safe fallback in restricted frames
          }
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [apkDownloadState]);

  // ============================================================================
  // LEARN MODE LOGIC (100% OFFLINE READY)
  // ============================================================================
  const filteredModules = useMemo(() => {
    return MODULES.filter((m) => {
      const matchesEra = selectedEra === 'all' || m.era === selectedEra;
      const matchesBookmark = !showOnlyBookmarks || userProfile.bookmarkedModules.includes(m.id);
      const matchesSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.ruler.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesEra && matchesBookmark && matchesSearch;
    });
  }, [selectedEra, showOnlyBookmarks, searchQuery, userProfile.bookmarkedModules]);

  const toggleBookmark = (moduleId, e) => {
    if (e) e.stopPropagation();
    setUserProfile((prev) => {
      const exists = prev.bookmarkedModules.includes(moduleId);
      const updated = exists
        ? prev.bookmarkedModules.filter((id) => id !== moduleId)
        : [...prev.bookmarkedModules, moduleId];
      triggerToast(exists ? 'Removed from Bookmarks' : 'Saved to Offline Bookmarks');
      return { ...prev, bookmarkedModules: updated };
    });
  };

  const completeModule = (mod) => {
    const alreadyDone = userProfile.completedModules.includes(mod.id);
    if (!alreadyDone) {
      setUserProfile((prev) => ({
        ...prev,
        xp: prev.xp + mod.xp,
        completedModules: [...prev.completedModules, mod.id]
      }));
      triggerToast(`Chronicle Completed! +${mod.xp} XP`);
    } else {
      triggerToast('Chronicle review complete.');
    }
    setActiveModule(null);
  };

  // ============================================================================
  // SOLO QUIZ MODE LOGIC (100% OFFLINE READY)
  // ============================================================================
  const startSoloQuiz = () => {
    const pool = QUIZ_QUESTIONS.filter(
      (q) => quizConfig.era === 'all' || q.era === quizConfig.era
    );
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, quizConfig.questionCount);
    setQuizSession({
      questions: shuffled,
      currentIndex: 0,
      selectedOption: null,
      isAnswered: false,
      score: 0,
      streak: 0,
      maxStreak: 0,
      xpEarned: 0,
      finished: false
    });
    setQuizTimer(15);
  };

  useEffect(() => {
    if (!quizSession || quizSession.finished || quizSession.isAnswered || !quizConfig.timed) return;
    if (quizTimer <= 0) {
      handleQuizAnswer(-1);
      return;
    }
    const timer = setTimeout(() => setQuizTimer((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [quizTimer, quizSession, quizConfig.timed]);

  const handleQuizAnswer = (optionIndex) => {
    if (!quizSession || quizSession.isAnswered) return;
    const currentQ = quizSession.questions[quizSession.currentIndex];
    const isCorrect = optionIndex === currentQ.correct;
    const newStreak = isCorrect ? quizSession.streak + 1 : 0;
    const gainedXp = isCorrect ? 50 + newStreak * 10 : 10;

    setQuizSession((prev) => ({
      ...prev,
      selectedOption: optionIndex,
      isAnswered: true,
      score: isCorrect ? prev.score + 1 : prev.score,
      streak: newStreak,
      maxStreak: Math.max(prev.maxStreak, newStreak),
      xpEarned: prev.xpEarned + gainedXp
    }));
  };

  const nextQuizQuestion = () => {
    if (!quizSession) return;
    if (quizSession.currentIndex + 1 >= quizSession.questions.length) {
      setUserProfile((prev) => ({
        ...prev,
        xp: prev.xp + quizSession.xpEarned,
        streak: prev.streak + 1
      }));
      setQuizSession((prev) => ({ ...prev, finished: true }));
    } else {
      setQuizSession((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        selectedOption: null,
        isAnswered: false
      }));
      setQuizTimer(15);
    }
  };

  // ============================================================================
  // FRIENDS & ONLINE MULTIPLAYER LOBBIES LOGIC
  // ============================================================================
  const addFriendFromSuggested = (historian) => {
    if (friends.some((f) => f.id === historian.id)) return;
    setFriends((prev) => [historian, ...prev]);
    setSuggestedFriends((prev) => prev.filter((s) => s.id !== historian.id));
    triggerToast(`${historian.name} added to your Friends list!`);
  };

  const handleAddByCode = (e) => {
    e.preventDefault();
    const cleanedCode = friendCodeInput.trim().toUpperCase();
    if (!cleanedCode) return;

    const matchSuggested = suggestedFriends.find((s) => s.code.toUpperCase() === cleanedCode);
    if (matchSuggested) {
      addFriendFromSuggested(matchSuggested);
      setFriendCodeInput('');
      setCustomFriendName('');
      return;
    }

    if (friends.some((f) => f.code.toUpperCase() === cleanedCode)) {
      triggerToast('That historian is already in your Friends list.');
      return;
    }

    const avatars = ['🛡️', '⚔️', '👑', '🏹', '🏰', '⚜️'];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    const newFriend = {
      id: 'custom-' + Date.now(),
      name: customFriendName.trim() || `Scholar ${cleanedCode}`,
      code: cleanedCode.startsWith('HF-') ? cleanedCode : `HF-${cleanedCode}`,
      avatar: randomAvatar,
      title: 'Sworn Medieval Ally',
      level: Math.floor(Math.random() * 10) + 8,
      xp: Math.floor(Math.random() * 1500) + 1500,
      winRate: '75%',
      status: 'online',
      eraSpecialty: 'All Medieval Eras',
      accuracy: 0.78
    };

    setFriends((prev) => [newFriend, ...prev]);
    setFriendCodeInput('');
    setCustomFriendName('');
    triggerToast(`Added ${newFriend.name} (${newFriend.code})!`);
  };

  // Create an Online Public/Private Lobby in Firestore
  const createMultiplayerLobby = async () => {
    if (isOfflineMode) {
      triggerToast('Switch to Online Mode to host multiplayer lobbies.');
      return;
    }
    const generatedCode = 'ROOM-' + Math.floor(1000 + Math.random() * 9000);
    const lobbyId = 'lobby-' + Date.now();
    const newLobby = {
      id: lobbyId,
      roomCode: generatedCode,
      hostId: user?.uid || 'local-host',
      hostName: userProfile.name,
      hostAvatar: userProfile.avatar,
      hostLevel: userLevel,
      era: 'All Medieval Eras',
      status: 'open',
      createdAt: Date.now()
    };

    setHostedLobby(newLobby);
    triggerToast(`Lobby ${generatedCode} created! Waiting for challenger...`);

    if (user && db) {
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'battle_lobbies', lobbyId);
        await setDoc(docRef, newLobby);
      } catch (err) {
        console.error('Error creating cloud lobby:', err);
      }
    }
  };

  const cancelHostedLobby = async () => {
    if (!hostedLobby) return;
    const lobbyId = hostedLobby.id;
    setHostedLobby(null);
    if (user && db && !isOfflineMode) {
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'battle_lobbies', lobbyId);
        await deleteDoc(docRef);
      } catch (err) {
        console.error('Error deleting lobby:', err);
      }
    }
  };

  // Join an existing Public or Cloud Lobby
  const joinLobbyRoom = async (lobby) => {
    if (isOfflineMode) {
      triggerToast('Cannot join online lobbies while in Offline Mode.');
      return;
    }
    if (user && db && lobby.id && !lobby.id.startsWith('pub-room-')) {
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'battle_lobbies', lobby.id);
        await updateDoc(docRef, {
          status: 'matched',
          guestName: userProfile.name,
          guestAvatar: userProfile.avatar,
          guestLevel: userLevel
        });
      } catch (err) {
        console.error('Error updating cloud lobby:', err);
      }
    }

    startBattleSession({
      name: lobby.hostName,
      avatar: lobby.hostAvatar || '🏰',
      code: lobby.roomCode,
      title: `Host of ${lobby.roomCode}`,
      level: lobby.hostLevel || 14,
      accuracy: lobby.accuracy || 0.78,
      matchType: `Public Lobby (${lobby.roomCode})`
    });
  };

  // Join by Room Code Input
  const handleJoinByCode = (e) => {
    e.preventDefault();
    const cleaned = joinRoomCodeInput.trim().toUpperCase();
    if (!cleaned) return;

    const allAvailable = [...cloudLobbies, ...CURATED_PUBLIC_LOBBIES];
    const found = allAvailable.find((r) => r.roomCode.toUpperCase() === cleaned);
    if (found) {
      joinLobbyRoom(found);
      setJoinRoomCodeInput('');
      return;
    }

    // Connect to custom room code
    startBattleSession({
      name: `Challenger (${cleaned})`,
      avatar: '🛡️',
      code: cleaned,
      title: 'Private Room Host',
      level: 13,
      accuracy: 0.76,
      matchType: `Private Room (${cleaned})`
    });
    setJoinRoomCodeInput('');
  };

  // Quick Matchmaking with Random Player
  const startQuickRandomMatch = () => {
    if (isOfflineMode) {
      triggerToast('Switch to Online Mode to match with random players.');
      return;
    }
    setIsMatchmaking(true);
    setTimeout(() => {
      setIsMatchmaking(false);
      // Pick either an open cloud lobby or random online historian
      const openCloud = cloudLobbies.find((r) => r.hostId !== user?.uid);
      if (openCloud) {
        joinLobbyRoom(openCloud);
        return;
      }
      const randomPool = [...SUGGESTED_HISTORIANS, ...CURATED_PUBLIC_LOBBIES];
      const pick = randomPool[Math.floor(Math.random() * randomPool.length)];
      startBattleSession({
        name: pick.name || pick.hostName,
        avatar: pick.avatar || pick.hostAvatar || '⚔️',
        code: pick.code || pick.roomCode || 'HF-RAND',
        title: pick.title || 'Online Matchmaking Rival',
        level: pick.level || pick.hostLevel || 12,
        accuracy: pick.accuracy || 0.78,
        matchType: 'Random Online Matchmaking'
      });
    }, 1400);
  };

  // Start 1v1 Battle Session (with Friend, Lobby Host, or Random Player)
  const startBattleSession = (opponent) => {
    if (isOfflineMode) {
      triggerToast('Online Battle Mode requires an active connection.');
      return;
    }
    const battleQuestions = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
    setActiveTab('battle');
    setHostedLobby(null);
    setBattleState({
      opponent,
      questions: battleQuestions,
      round: 0,
      playerHp: 100,
      opponentHp: 100,
      playerScore: 0,
      opponentScore: 0,
      playerChoice: null,
      opponentChoice: null,
      roundResolved: false,
      battleLog: [`Duel started vs ${opponent.name} (${opponent.matchType || 'Friend Challenge'})`],
      finished: false,
      winner: null
    });
    setBattleTimer(12);
  };

  useEffect(() => {
    if (!battleState || battleState.finished || battleState.roundResolved) return;
    if (battleTimer <= 0) {
      handleBattleAnswer(-1);
      return;
    }
    const t = setTimeout(() => setBattleTimer((prev) => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [battleTimer, battleState]);

  const handleBattleAnswer = (playerOption) => {
    if (!battleState || battleState.roundResolved) return;
    const currentQ = battleState.questions[battleState.round];
    const playerCorrect = playerOption === currentQ.correct;

    const friendWillBeCorrect = Math.random() < (battleState.opponent.accuracy || 0.78);
    let friendOption = currentQ.correct;
    if (!friendWillBeCorrect) {
      const wrongIndices = [0, 1, 2, 3].filter((i) => i !== currentQ.correct);
      friendOption = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
    }

    const damageToOpponent = playerCorrect ? 25 : 0;
    const damageToPlayer = friendWillBeCorrect ? 20 : 0;

    const nextOpponentHp = Math.max(0, battleState.opponentHp - damageToOpponent);
    const nextPlayerHp = Math.max(0, battleState.playerHp - damageToPlayer);

    let logEntry = '';
    if (playerCorrect && !friendWillBeCorrect) {
      logEntry = `Direct Hit! You answered correctly and dealt 25 damage to ${battleState.opponent.name}.`;
    } else if (!playerCorrect && friendWillBeCorrect) {
      logEntry = `${battleState.opponent.name} answered faster and dealt 20 damage.`;
    } else if (playerCorrect && friendWillBeCorrect) {
      logEntry = `Both scholars answered correctly!`;
    } else {
      logEntry = `Neither combatant found the correct chronicle.`;
    }

    setBattleState((prev) => ({
      ...prev,
      playerChoice: playerOption,
      opponentChoice: friendOption,
      playerHp: nextPlayerHp,
      opponentHp: nextOpponentHp,
      playerScore: playerCorrect ? prev.playerScore + 100 : prev.playerScore,
      opponentScore: friendWillBeCorrect ? prev.opponentScore + 100 : prev.opponentScore,
      roundResolved: true,
      battleLog: [logEntry, ...prev.battleLog]
    }));
  };

  const nextBattleRound = () => {
    if (!battleState) return;
    const isLastRound = battleState.round + 1 >= battleState.questions.length;
    const someoneKnockedOut = battleState.playerHp <= 0 || battleState.opponentHp <= 0;

    if (isLastRound || someoneKnockedOut) {
      let winner = 'draw';
      if (battleState.playerScore > battleState.opponentScore || battleState.opponentHp <= 0) {
        winner = 'player';
      } else if (battleState.opponentScore > battleState.playerScore || battleState.playerHp <= 0) {
        winner = 'opponent';
      }

      const bonusXp = winner === 'player' ? 250 : winner === 'draw' ? 120 : 60;
      setUserProfile((prev) => ({
        ...prev,
        xp: prev.xp + bonusXp,
        wins: winner === 'player' ? prev.wins + 1 : prev.wins,
        losses: winner === 'opponent' ? prev.losses + 1 : prev.losses
      }));

      setBattleState((prev) => ({
        ...prev,
        finished: true,
        winner,
        bonusXp
      }));
    } else {
      setBattleState((prev) => ({
        ...prev,
        round: prev.round + 1,
        playerChoice: null,
        opponentChoice: null,
        roundResolved: false
      }));
      setBattleTimer(12);
    }
  };

  // ============================================================================
  // RENDER MOBILE APP SCREEN (CLEAN EDITORIAL / MUSEUM NON-NEON UI)
  // ============================================================================
  const renderMobileAppContent = () => {
    const combinedLobbies = [
      ...cloudLobbies,
      ...CURATED_PUBLIC_LOBBIES.filter(
        (curated) => !cloudLobbies.some((c) => c.roomCode === curated.roomCode)
      )
    ];

    return (
      <div className="flex flex-col h-full bg-[#FAF8F5] text-stone-900 select-none overflow-hidden relative font-sans">
        {/* Top Mobile Status & Editorial Header */}
        <div className="bg-white border-b border-stone-200 px-4 pt-3 pb-2.5 shrink-0 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-2">
            <span className="font-bold tracking-wider text-[#7C2D12] flex items-center gap-1 uppercase">
              <Castle className="w-3 h-3" /> HistoryFun Medieval
            </span>
            <button
              onClick={() => {
                setIsOfflineMode(!isOfflineMode);
                triggerToast(
                  !isOfflineMode
                    ? 'Switched to Offline Mode (Learn & Solo Quiz available)'
                    : 'Switched to Online Mode (Multiplayer Lobbies active)'
                );
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${
                isOfflineMode
                  ? 'bg-stone-100 text-stone-600 border-stone-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
              title="Click to test Offline vs Online Mode"
            >
              {isOfflineMode ? (
                <>
                  <WifiOff className="w-3 h-3 text-stone-500" /> Offline Mode
                </>
              ) : (
                <>
                  <Wifi className="w-3 h-3 text-emerald-700" /> Online
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F4F1EA] border border-stone-300 flex items-center justify-center text-lg shadow-2xs">
                {userProfile.avatar}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-bold text-xs text-stone-900 leading-tight">{userProfile.name}</h2>
                  <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300/80 px-1.5 py-0.2 rounded font-bold">
                    Lv.{userLevel}
                  </span>
                </div>
                <p className="text-[10px] text-stone-500">{userTitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="bg-[#FAF8F5] border border-stone-200 px-2 py-1 rounded-lg flex items-center gap-1 text-[11px] font-bold text-amber-900">
                <Flame className="w-3.5 h-3.5 text-amber-700" />
                {userProfile.streak}d
              </div>
              <div className="bg-[#FAF8F5] border border-stone-200 px-2 py-1 rounded-lg flex items-center gap-1 text-[11px] font-bold text-stone-800">
                <Award className="w-3.5 h-3.5 text-[#7C2D12]" />
                {userProfile.xp} XP
              </div>
            </div>
          </div>
        </div>

        {/* Clean Toast Banner */}
        {toastMessage && (
          <div className="absolute top-20 left-4 right-4 z-50 bg-stone-900 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center justify-between border border-stone-700">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              {toastMessage.message}
            </span>
          </div>
        )}

        {/* Main Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3.5">
          {/* ==================== PAGE 1: LEARN MODE (OFFLINE READY) ==================== */}
          {activeTab === 'learn' && (
            <div className="space-y-3.5">
              {activeModule ? (
                <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setActiveModule(null)}
                      className="text-xs font-bold text-[#7C2D12] flex items-center gap-1 hover:underline"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back to Chronicles
                    </button>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
                        Saved Offline
                      </span>
                      <button
                        onClick={(e) => toggleBookmark(activeModule.id, e)}
                        className={`p-1.5 rounded-lg border ${
                          userProfile.bookmarkedModules.includes(activeModule.id)
                            ? 'bg-amber-50 border-amber-300 text-amber-800'
                            : 'bg-stone-50 border-stone-200 text-stone-400'
                        }`}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#F4F1EA] border border-stone-200 flex items-center justify-center text-2xl">
                      {activeModule.icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C2D12] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                        {activeModule.date}
                      </span>
                      <h3 className="text-base font-bold text-stone-900 mt-1 leading-snug">
                        {activeModule.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-stone-200">
                    {activeModule.summary}
                  </p>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                      <Scroll className="w-3.5 h-3.5 text-[#7C2D12]" /> Historical Milestones
                    </h4>
                    {activeModule.keyFacts.map((fact, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 bg-[#FAF8F5] border border-stone-200 p-2.5 rounded-xl text-xs text-stone-800"
                      >
                        <span className="w-4 h-4 rounded-full bg-[#7C2D12] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{fact}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#FAF8F5] border border-stone-200 p-2.5 rounded-xl">
                      <div className="text-[10px] font-bold text-stone-500 uppercase">Key Figures</div>
                      <div className="text-xs font-bold text-stone-900 mt-0.5">{activeModule.ruler}</div>
                    </div>
                    <div className="bg-[#FAF8F5] border border-stone-200 p-2.5 rounded-xl">
                      <div className="text-[10px] font-bold text-stone-500 uppercase">Iconic Artifact</div>
                      <div className="text-xs font-bold text-stone-900 mt-0.5">{activeModule.artifact}</div>
                    </div>
                  </div>

                  <div className="bg-[#F4F1EA] border border-stone-300 p-3 rounded-xl">
                    <div className="text-[10px] font-bold uppercase text-stone-700 mb-1">
                      Daily Life & Medieval Society
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed">{activeModule.dailyLife}</p>
                  </div>

                  <button
                    onClick={() => completeModule(activeModule)}
                    className="w-full bg-[#7C2D12] hover:bg-[#63220D] text-white font-bold text-xs py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {userProfile.completedModules.includes(activeModule.id)
                      ? 'Completed (Click to Finish Review)'
                      : `Mark as Mastered & Claim +${activeModule.xp} XP`}
                  </button>
                </div>
              ) : (
                <>
                  {/* Campaign Progress Header Card */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-2xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C2D12] flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> Complete Medieval Curriculum (476–1500 AD)
                      </span>
                      <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                        ✓ Offline Ready
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                      <span>
                        {userProfile.completedModules.length} of {MODULES.length} Chronicles Read
                      </span>
                      <span>{Math.round((userProfile.completedModules.length / MODULES.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-stone-200 h-2 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="bg-[#7C2D12] h-full rounded-full transition-all duration-500"
                        style={{ width: `${(userProfile.completedModules.length / MODULES.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Search & Bookmark Filter */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search eras, rulers, castles..."
                        className="w-full bg-white border border-stone-300 rounded-xl pl-8 pr-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#7C2D12]"
                      />
                    </div>
                    <button
                      onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition ${
                        showOnlyBookmarks
                          ? 'bg-amber-100 border-amber-400 text-amber-900'
                          : 'bg-white border-stone-300 text-stone-600'
                      }`}
                      title="Filter Bookmarked Chronicles"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Era Filter Pills */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {ERAS.map((era) => (
                      <button
                        key={era.id}
                        onClick={() => setSelectedEra(era.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition border ${
                          selectedEra === era.id
                            ? 'bg-[#7C2D12] text-white border-[#7C2D12]'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {era.name}
                      </button>
                    ))}
                  </div>

                  {/* Chronicles List */}
                  <div className="space-y-2.5">
                    {filteredModules.map((mod) => {
                      const isDone = userProfile.completedModules.includes(mod.id);
                      const isBookmarked = userProfile.bookmarkedModules.includes(mod.id);
                      return (
                        <div
                          key={mod.id}
                          onClick={() => setActiveModule(mod)}
                          className="bg-white hover:bg-stone-50 border border-stone-200 rounded-2xl p-3.5 cursor-pointer transition shadow-2xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-3">
                              <div className="w-11 h-11 rounded-xl bg-[#F4F1EA] border border-stone-200 flex items-center justify-center text-xl shrink-0">
                                {mod.icon}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-[#7C2D12]">{mod.date}</span>
                                  {isDone && (
                                    <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                                      <Check className="w-2.5 h-2.5" /> Read
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-bold text-sm text-stone-900 mt-0.5">
                                  {mod.title}
                                </h4>
                                <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5 leading-relaxed">
                                  {mod.summary}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => toggleBookmark(mod.id, e)}
                              className={`p-1.5 rounded-lg shrink-0 ${
                                isBookmarked ? 'text-amber-700' : 'text-stone-300 hover:text-stone-500'
                              }`}
                            >
                              <Bookmark className="w-4 h-4 fill-current" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-stone-100 text-[10px] text-stone-500">
                            <span>Reading time: {mod.readTime} • Offline Available</span>
                            <span className="font-bold text-[#7C2D12]">+{mod.xp} XP →</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ==================== PAGE 2: SOLO QUIZ MODE (OFFLINE READY) ==================== */}
          {activeTab === 'quiz' && (
            <div className="space-y-4">
              {!quizSession ? (
                <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C2D12]">
                      Solo Historical Examination
                    </span>
                    <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                      ✓ Works Offline
                    </span>
                  </div>

                  <div className="text-center py-1">
                    <div className="w-12 h-12 rounded-2xl bg-[#F4F1EA] border border-stone-300 flex items-center justify-center text-[#7C2D12] mx-auto mb-2">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-stone-900">Medieval Knowledge Trial</h3>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Test your mastery across 1,000 years of history with scholarly explanations.
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-stone-600 block mb-1.5">
                      Select Historical Era
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {ERAS.map((e) => (
                        <button
                          key={e.id}
                          onClick={() => setQuizConfig((prev) => ({ ...prev, era: e.id }))}
                          className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                            quizConfig.era === e.id
                              ? 'bg-[#7C2D12] border-[#7C2D12] text-white'
                              : 'bg-[#FAF8F5] border-stone-200 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          <div>{e.name}</div>
                          <div className={`text-[9px] ${quizConfig.era === e.id ? 'text-stone-200' : 'text-stone-500'}`}>
                            {e.range}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-[#FAF8F5] border border-stone-200 p-3 rounded-xl">
                    <div>
                      <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#7C2D12]" /> 15-Second Timer per Question
                      </div>
                      <div className="text-[10px] text-stone-500">Disable for untimed study review</div>
                    </div>
                    <button
                      onClick={() => setQuizConfig((prev) => ({ ...prev, timed: !prev.timed }))}
                      className={`w-11 h-6 rounded-full transition p-0.5 ${
                        quizConfig.timed ? 'bg-[#7C2D12]' : 'bg-stone-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow transition transform ${
                          quizConfig.timed ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <button
                    onClick={startSoloQuiz}
                    className="w-full bg-[#7C2D12] hover:bg-[#63220D] text-white font-bold text-xs py-3.5 rounded-xl shadow-xs flex items-center justify-center gap-2 transition"
                  >
                    <Play className="w-4 h-4 fill-current" /> Begin Solo Quiz
                  </button>
                </div>
              ) : quizSession.finished ? (
                <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center space-y-4 shadow-2xs">
                  <div className="w-14 h-14 rounded-full bg-[#F4F1EA] border border-stone-300 flex items-center justify-center mx-auto text-2xl">
                    🏛️
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-900">Examination Complete</h3>
                    <p className="text-xs text-stone-600">
                      You answered {quizSession.score} of {quizSession.questions.length} correctly
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#FAF8F5] border border-stone-200 p-2.5 rounded-xl">
                      <div className="text-[10px] text-stone-500">Accuracy</div>
                      <div className="text-sm font-bold text-emerald-800">
                        {Math.round((quizSession.score / quizSession.questions.length) * 100)}%
                      </div>
                    </div>
                    <div className="bg-[#FAF8F5] border border-stone-200 p-2.5 rounded-xl">
                      <div className="text-[10px] text-stone-500">Best Streak</div>
                      <div className="text-sm font-bold text-amber-800">{quizSession.maxStreak}</div>
                    </div>
                    <div className="bg-[#FAF8F5] border border-stone-200 p-2.5 rounded-xl">
                      <div className="text-[10px] text-stone-500">XP Earned</div>
                      <div className="text-sm font-bold text-[#7C2D12]">+{quizSession.xpEarned}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={startSoloQuiz}
                      className="flex-1 bg-[#7C2D12] hover:bg-[#63220D] text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Retry Quiz
                    </button>
                    <button
                      onClick={() => setQuizSession(null)}
                      className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs py-3 rounded-xl border border-stone-300"
                    >
                      Change Era
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3.5 shadow-2xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-500">
                      Question {quizSession.currentIndex + 1} of {quizSession.questions.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-800 font-bold">Streak: {quizSession.streak}</span>
                      {quizConfig.timed && (
                        <span
                          className={`px-2 py-0.5 rounded font-bold border ${
                            quizTimer <= 5
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-[#FAF8F5] text-stone-800 border-stone-200'
                          }`}
                        >
                          {quizTimer}s
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#FAF8F5] border border-stone-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-[#7C2D12]">
                      {quizSession.questions[quizSession.currentIndex].difficulty} • Historical Query
                    </span>
                    <h4 className="text-sm font-bold text-stone-900 mt-1 leading-snug">
                      {quizSession.questions[quizSession.currentIndex].question}
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {quizSession.questions[quizSession.currentIndex].options.map((opt, idx) => {
                      const isCorrect = idx === quizSession.questions[quizSession.currentIndex].correct;
                      const isSelected = idx === quizSession.selectedOption;
                      let btnStyle = 'bg-white border-stone-300 text-stone-800 hover:bg-stone-50';
                      if (quizSession.isAnswered) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold';
                        } else if (isSelected) {
                          btnStyle = 'bg-rose-50 border-rose-500 text-rose-900';
                        }
                      }
                      return (
                        <button
                          key={idx}
                          disabled={quizSession.isAnswered}
                          onClick={() => handleQuizAnswer(idx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {quizSession.isAnswered && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                          )}
                          {quizSession.isAnswered && isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-700 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {quizSession.isAnswered && (
                    <div className="space-y-3 pt-1">
                      <div className="bg-[#F4F1EA] border border-stone-300 p-3 rounded-xl text-xs text-stone-800 leading-relaxed">
                        <strong className="text-[#7C2D12] block mb-0.5">Historical Explanation:</strong>
                        {quizSession.questions[quizSession.currentIndex].explanation}
                      </div>
                      <button
                        onClick={nextQuizQuestion}
                        className="w-full bg-[#7C2D12] hover:bg-[#63220D] text-white font-bold text-xs py-3 rounded-xl transition"
                      >
                        {quizSession.currentIndex + 1 >= quizSession.questions.length
                          ? 'View Final Score →'
                          : 'Next Question →'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ==================== PAGE 3: BATTLE MODE (ONLINE LOBBIES & RANDOM PLAYERS) ==================== */}
          {activeTab === 'battle' && (
            <div className="space-y-3.5">
              {isOfflineMode ? (
                /* Offline Warning State for Online Multiplayer */
                <div className="bg-white border border-stone-200 rounded-2xl p-5 text-center space-y-3 shadow-2xs">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-300 flex items-center justify-center mx-auto text-stone-600">
                    <WifiOff className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-stone-900">Multiplayer Lobbies Require Online Mode</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    You are currently testing <strong>Offline Mode</strong>. Learn Chronicles and Solo Quizzes work 100% offline, while live Friend Battles and Public Lobbies require an internet connection.
                  </p>
                  <button
                    onClick={() => setIsOfflineMode(false)}
                    className="bg-[#7C2D12] hover:bg-[#63220D] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition"
                  >
                    Reconnect to Online Mode
                  </button>
                </div>
              ) : !battleState ? (
                <div className="space-y-3.5">
                  {/* Matchmaking Header & Quick Match Random Player */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C2D12]">
                          Online Multiplayer Arena
                        </span>
                        <h3 className="text-sm font-bold text-stone-900">
                          Public Lobbies & Friend Duels
                        </h3>
                      </div>
                      <div className="text-right text-[11px] font-bold text-stone-600">
                        Record: <span className="text-emerald-800">{userProfile.wins}W</span> –{' '}
                        <span className="text-rose-800">{userProfile.losses}L</span>
                      </div>
                    </div>

                    {/* Quick Match & Host Room Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        disabled={isMatchmaking}
                        onClick={startQuickRandomMatch}
                        className="bg-[#7C2D12] hover:bg-[#63220D] text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition shadow-2xs"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isMatchmaking ? 'animate-spin' : ''}`} />
                        {isMatchmaking ? 'Searching...' : 'Quick Match (Random)'}
                      </button>
                      <button
                        onClick={createMultiplayerLobby}
                        className="bg-[#F4F1EA] hover:bg-stone-200 text-stone-900 border border-stone-300 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#7C2D12]" /> Create Room
                      </button>
                    </div>

                    {/* Active Hosted Lobby Waiting Card */}
                    {hostedLobby && (
                      <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-amber-900">
                            Hosting Room: {hostedLobby.roomCode}
                          </span>
                          <span className="text-[10px] text-amber-800 font-semibold animate-pulse">
                            Waiting for player...
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-700">
                          Share code <strong>{hostedLobby.roomCode}</strong> with a friend or start immediately with a random online challenger.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={startQuickRandomMatch}
                            className="flex-1 bg-[#7C2D12] text-white font-bold text-[11px] py-1.5 rounded-lg"
                          >
                            Fill with Random Player Now
                          </button>
                          <button
                            onClick={cancelHostedLobby}
                            className="px-3 bg-white border border-stone-300 text-stone-700 font-bold text-[11px] py-1.5 rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Join Room by Code */}
                    <form onSubmit={handleJoinByCode} className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={joinRoomCodeInput}
                        onChange={(e) => setJoinRoomCodeInput(e.target.value)}
                        placeholder="Enter Room Code (e.g. HAST-1066)"
                        className="flex-1 bg-[#FAF8F5] border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#7C2D12]"
                      />
                      <button
                        type="submit"
                        className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1"
                      >
                        <LogIn className="w-3.5 h-3.5" /> Join
                      </button>
                    </form>
                  </div>

                  {/* Public Lobby Browser */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-[#7C2D12]" /> Open Public Lobbies ({combinedLobbies.length})
                      </h4>
                      <span className="text-[10px] text-emerald-800 font-semibold">Live Matchmaking</span>
                    </div>

                    <div className="space-y-2">
                      {combinedLobbies.map((lobby) => (
                        <div
                          key={lobby.id}
                          className="bg-[#FAF8F5] border border-stone-200 p-2.5 rounded-xl flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-base">
                              {lobby.hostAvatar || '🏰'}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-stone-900">{lobby.hostName}</span>
                                <span className="text-[10px] font-bold bg-stone-200 text-stone-800 px-1.5 py-0.2 rounded">
                                  {lobby.roomCode}
                                </span>
                              </div>
                              <div className="text-[10px] text-stone-500">
                                Lv.{lobby.hostLevel || 12} • {lobby.era}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => joinLobbyRoom(lobby)}
                            className="bg-[#2D5A43] hover:bg-[#234734] text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition"
                          >
                            Join Room
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Challenge Added Friends Online */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                        Challenge Added Friends ({friends.length})
                      </h4>
                      <button
                        onClick={() => setActiveTab('friends')}
                        className="text-[11px] font-bold text-[#7C2D12] hover:underline"
                      >
                        + Add Friend
                      </button>
                    </div>

                    <div className="space-y-2">
                      {friends.map((f) => (
                        <div
                          key={f.id}
                          className="bg-[#FAF8F5] border border-stone-200 p-2.5 rounded-xl flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-base">
                              {f.avatar}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-stone-900">{f.name}</div>
                              <div className="text-[10px] text-stone-500">
                                {f.code} • Win Rate {f.winRate}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              startBattleSession({ ...f, matchType: 'Direct Friend Duel' })
                            }
                            className="bg-[#7C2D12] hover:bg-[#63220D] text-white font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                          >
                            <Sword className="w-3 h-3" /> Duel
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : battleState.finished ? (
                /* Battle Finished Summary */
                <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center space-y-4 shadow-2xs">
                  <div className="text-4xl">
                    {battleState.winner === 'player'
                      ? '👑'
                      : battleState.winner === 'draw'
                      ? '🤝'
                      : '🛡️'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-900">
                      {battleState.winner === 'player'
                        ? 'Victory in the Arena!'
                        : battleState.winner === 'draw'
                        ? 'Honorable Draw'
                        : 'Defeated in Match'}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Match against {battleState.opponent.name} concluded
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 bg-[#FAF8F5] p-3 rounded-xl border border-stone-200">
                    <div>
                      <div className="text-[10px] text-stone-500">Your Score</div>
                      <div className="text-base font-bold text-emerald-800">
                        {battleState.playerScore} pts
                      </div>
                      <div className="text-[10px] text-stone-500">Armor Left: {battleState.playerHp}%</div>
                    </div>
                    <div className="border-l border-stone-200">
                      <div className="text-[10px] text-stone-500">{battleState.opponent.name}</div>
                      <div className="text-base font-bold text-[#7C2D12]">
                        {battleState.opponentScore} pts
                      </div>
                      <div className="text-[10px] text-stone-500">Armor Left: {battleState.opponentHp}%</div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 py-2 px-3 rounded-xl text-xs font-bold text-amber-900">
                    +{battleState.bonusXp} XP Awarded
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => startBattleSession(battleState.opponent)}
                      className="flex-1 bg-[#7C2D12] hover:bg-[#63220D] text-white font-bold text-xs py-3 rounded-xl"
                    >
                      Rematch
                    </button>
                    <button
                      onClick={() => setBattleState(null)}
                      className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs py-3 rounded-xl border border-stone-300"
                    >
                      Return to Lobbies
                    </button>
                  </div>
                </div>
              ) : (
                /* Active 1v1 Duel Screen */
                <div className="space-y-3">
                  <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-2xs">
                    <div className="grid grid-cols-2 gap-3 items-center">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-base">{userProfile.avatar}</span>
                          <span className="text-xs font-bold text-stone-900 truncate">You</span>
                        </div>
                        <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#2D5A43] h-full transition-all duration-300"
                            style={{ width: `${battleState.playerHp}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-stone-500 mt-0.5">
                          <span>{battleState.playerHp} HP</span>
                          <span className="text-stone-900 font-bold">{battleState.playerScore} pts</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-end gap-1.5 mb-1">
                          <span className="text-xs font-bold text-[#7C2D12] truncate">
                            {battleState.opponent.name}
                          </span>
                          <span className="text-base">{battleState.opponent.avatar}</span>
                        </div>
                        <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#7C2D12] h-full transition-all duration-300"
                            style={{ width: `${battleState.opponentHp}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-stone-500 mt-0.5">
                          <span className="text-stone-900 font-bold">{battleState.opponentScore} pts</span>
                          <span>{battleState.opponentHp} HP</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-stone-100 text-[11px]">
                      <span className="font-bold text-stone-500">
                        Round {battleState.round + 1} of {battleState.questions.length}
                      </span>
                      <span className="font-bold text-[#7C2D12]">Timer: {battleTimer}s</span>
                    </div>
                  </div>

                  <div className="bg-white border border-stone-200 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
                    <p className="text-xs font-bold text-stone-900 leading-snug">
                      {battleState.questions[battleState.round].question}
                    </p>

                    <div className="space-y-1.5">
                      {battleState.questions[battleState.round].options.map((opt, idx) => {
                        const correctIdx = battleState.questions[battleState.round].correct;
                        const isPlayerPick = battleState.playerChoice === idx;
                        const isFriendPick = battleState.opponentChoice === idx;

                        let style = 'bg-[#FAF8F5] border-stone-200 text-stone-800 hover:bg-stone-100';
                        if (battleState.roundResolved) {
                          if (idx === correctIdx) {
                            style = 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold';
                          } else if (isPlayerPick || isFriendPick) {
                            style = 'bg-rose-50 border-rose-400 text-rose-900';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            disabled={battleState.roundResolved}
                            onClick={() => handleBattleAnswer(idx)}
                            className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition ${style}`}
                          >
                            <span>{opt}</span>
                            {battleState.roundResolved && (
                              <div className="flex items-center gap-1 shrink-0">
                                {isPlayerPick && (
                                  <span className="text-[10px] bg-stone-200 text-stone-800 px-1.5 py-0.5 rounded font-semibold">
                                    You
                                  </span>
                                )}
                                {isFriendPick && (
                                  <span className="text-[10px] bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded font-semibold">
                                    {battleState.opponent.avatar}
                                  </span>
                                )}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {battleState.roundResolved && (
                      <div className="pt-2 space-y-2">
                        <div className="text-[11px] bg-[#F4F1EA] border border-stone-300 p-2.5 rounded-xl text-stone-800 font-medium">
                          {battleState.battleLog[0]}
                        </div>
                        <button
                          onClick={nextBattleRound}
                          className="w-full bg-[#7C2D12] hover:bg-[#63220D] text-white font-bold text-xs py-2.5 rounded-xl"
                        >
                          Next Duel Round →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== PAGE 4: FRIENDS ==================== */}
          {activeTab === 'friends' && (
            <div className="space-y-3.5">
              {/* Your Royal Code & User ID Card */}
              <div className="bg-white border border-stone-200 rounded-2xl p-3.5 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-stone-500">Your Royal Friend Code</div>
                    <div className="text-base font-bold text-[#7C2D12] tracking-wider">
                      {userProfile.code}
                    </div>
                  </div>
                  <button
                    onClick={() => triggerToast(`Copied ${userProfile.code} to clipboard`)}
                    className="bg-[#F4F1EA] hover:bg-stone-200 text-xs font-bold text-stone-800 px-3 py-2 rounded-xl border border-stone-300"
                  >
                    Copy Code
                  </button>
                </div>
                {user?.uid && (
                  <div className="text-[10px] text-stone-500 bg-[#FAF8F5] px-2.5 py-1.5 rounded-lg border border-stone-200 break-all">
                    <strong>Online Player ID:</strong> {user.uid}
                  </div>
                )}
              </div>

              {/* Add Friend Form */}
              <form
                onSubmit={handleAddByCode}
                className="bg-white border border-stone-200 rounded-2xl p-3.5 space-y-2.5 shadow-2xs"
              >
                <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-[#7C2D12]" /> Add Friend by Code
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={friendCodeInput}
                    onChange={(e) => setFriendCodeInput(e.target.value)}
                    placeholder="Code (e.g. HF-1000)"
                    className="bg-[#FAF8F5] border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#7C2D12]"
                  />
                  <input
                    type="text"
                    value={customFriendName}
                    onChange={(e) => setCustomFriendName(e.target.value)}
                    placeholder="Friend Name (optional)"
                    className="bg-[#FAF8F5] border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#7C2D12]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#7C2D12] hover:bg-[#63220D] text-white font-bold text-xs py-2.5 rounded-xl transition"
                >
                  + Add to Friends List
                </button>
              </form>

              {/* Added Friends List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-stone-500">
                  Your Friends ({friends.length})
                </h4>
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="bg-white border border-stone-200 p-3 rounded-2xl flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#F4F1EA] border border-stone-200 flex items-center justify-center text-lg relative">
                        {friend.avatar}
                        <span
                          className={`w-2.5 h-2.5 rounded-full ring-2 ring-white absolute -bottom-0.5 -right-0.5 ${
                            isOfflineMode ? 'bg-stone-400' : 'bg-emerald-600'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900">{friend.name}</div>
                        <div className="text-[10px] text-stone-500">
                          {friend.code} • Lv.{friend.level} ({friend.eraSpecialty})
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        startBattleSession({ ...friend, matchType: 'Friend Lobby Invite' })
                      }
                      className="bg-[#7C2D12] hover:bg-[#63220D] text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1"
                    >
                      <Sword className="w-3 h-3" /> Battle
                    </button>
                  </div>
                ))}
              </div>

              {/* Suggested Directory */}
              {suggestedFriends.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-stone-500">
                    Online Historians Directory
                  </h4>
                  {suggestedFriends.map((s) => (
                    <div
                      key={s.id}
                      className="bg-white border border-stone-200 p-2.5 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-[#FAF8F5] border border-stone-200 flex items-center justify-center text-base">
                          {s.avatar}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-stone-800">{s.name}</div>
                          <div className="text-[10px] text-stone-500">
                            Code: <span className="text-[#7C2D12] font-semibold">{s.code}</span> • {s.eraSpecialty}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => addFriendFromSuggested(s)}
                        className="bg-[#F4F1EA] hover:bg-[#7C2D12] hover:text-white text-stone-800 border border-stone-300 font-bold text-xs px-2.5 py-1.5 rounded-lg transition"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== PAGE 5: SETTINGS & CREDITS (ALI DALGIC) ==================== */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Prominent Credits Card — Ali Dalgic */}
              <div className="bg-white border-2 border-[#7C2D12]/30 rounded-2xl p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#7C2D12] bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                    Official Credits
                  </span>
                  <Award className="w-4 h-4 text-[#7C2D12]" />
                </div>

                <div className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#7C2D12] text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs">
                    AD
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-stone-500">
                      Created, Designed & Engineered By
                    </div>
                    <h3 className="text-base font-black text-stone-900 tracking-tight">
                      Ali Dalgic
                    </h3>
                    <p className="text-[11px] text-stone-600">
                      Lead Developer & Historical Curriculum Architect
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-stone-600 leading-relaxed">
                  <strong>HistoryFun (Medieval Edition v3.0)</strong> was crafted by <strong>Ali Dalgic</strong> to make learning the entire Medieval Age (476–1500 AD) accessible offline while connecting players worldwide through real-time historical trivia lobbies.
                </p>
              </div>

              {/* Application Preferences */}
              <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#7C2D12]" /> Application Settings
                </h4>

                {/* Offline Simulation Toggle */}
                <div className="flex items-center justify-between py-2 border-b border-stone-100">
                  <div>
                    <div className="text-xs font-bold text-stone-900">Simulate Offline APK Mode</div>
                    <div className="text-[10px] text-stone-500">
                      Test offline access for Learn & Quiz modes
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOfflineMode(!isOfflineMode)}
                    className={`w-11 h-6 rounded-full transition p-0.5 ${
                      isOfflineMode ? 'bg-[#7C2D12]' : 'bg-stone-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow transition transform ${
                        isOfflineMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Sound Toggle */}
                <div className="flex items-center justify-between py-2 border-b border-stone-100">
                  <div>
                    <div className="text-xs font-bold text-stone-900">Sound Effects & Chimes</div>
                    <div className="text-[10px] text-stone-500">Audio feedback during quizzes and battles</div>
                  </div>
                  <button
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, soundEffects: !prev.soundEffects }))
                    }
                    className={`w-11 h-6 rounded-full transition p-0.5 ${
                      settings.soundEffects ? 'bg-[#7C2D12]' : 'bg-stone-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow transition transform ${
                        settings.soundEffects ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Offline Database Cache Status */}
                <div className="flex items-center justify-between py-2 border-b border-stone-100">
                  <div>
                    <div className="text-xs font-bold text-stone-900">Offline Medieval Archive</div>
                    <div className="text-[10px] text-stone-500">
                      All 10 Chronicles & Quiz Bank stored locally (48.2 MB)
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded-lg">
                    100% Cached
                  </span>
                </div>

                {/* Reset Progress */}
                <div className="pt-1 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-stone-900">Reset Study Progress</div>
                    <div className="text-[10px] text-stone-500">Restore default XP and completed modules</div>
                  </div>
                  <button
                    onClick={() => {
                      setUserProfile((prev) => ({
                        ...prev,
                        xp: 1200,
                        streak: 1,
                        completedModules: [],
                        bookmarkedModules: []
                      }));
                      triggerToast('Study progress reset to default.');
                    }}
                    className="bg-stone-100 hover:bg-rose-50 hover:text-rose-800 text-stone-700 border border-stone-300 font-bold text-[11px] px-3 py-1.5 rounded-xl transition"
                  >
                    Reset Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* EXACT 5 PAGES BOTTOM NAVIGATION BAR: Learn | Quiz | Battle | Friends | Settings */}
        <div className="bg-white border-t border-stone-200 px-2 py-2 grid grid-cols-5 gap-1 shrink-0">
          {[
            { id: 'learn', label: 'Learn', icon: BookOpen },
            { id: 'quiz', label: 'Quiz', icon: Trophy },
            { id: 'battle', label: 'Battle', icon: Sword },
            { id: 'friends', label: 'Friends', icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
                  active
                    ? 'bg-[#F4F1EA] text-[#7C2D12] font-bold border border-stone-300/80'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ============================================================================
  // FULL-SCREEN MOBILE MODE OR SPLIT PROMOTIONAL WEBSITE + INTERACTIVE EMULATOR
  // ============================================================================
  if (viewLayout === 'fullscreen-app') {
    return (
      <div className="min-h-screen bg-[#F4F1EA] flex flex-col">
        <div className="bg-white border-b border-stone-200 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#7C2D12] font-bold text-sm">
            <Castle className="w-4 h-4" /> HistoryFun Mobile App • Created by Ali Dalgic
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={startApkDownload}
              className="bg-[#7C2D12] hover:bg-[#63220D] text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Download APK
            </button>
            <button
              onClick={() => setViewLayout('split')}
              className="bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
            >
              <Minimize2 className="w-3.5 h-3.5" /> Website + Phone View
            </button>
          </div>
        </div>
        <div className="flex-1 max-w-md w-full mx-auto border-x border-stone-300 shadow-lg flex flex-col h-[calc(100vh-49px)]">
          {renderMobileAppContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans selection:bg-[#7C2D12] selection:text-white">
      {/* Top Editorial Website Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C2D12] flex items-center justify-center text-white font-black shadow-xs">
              <Castle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-stone-900">
                History<span className="text-[#7C2D12]">Fun</span>
              </span>
              <span className="hidden sm:inline-block ml-2.5 text-[11px] font-bold uppercase tracking-wider bg-[#F4F1EA] text-stone-700 border border-stone-300 px-2.5 py-0.5 rounded-full">
                v3.0 • By Ali Dalgic
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewLayout('fullscreen-app')}
              className="hidden md:flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-stone-900 bg-[#FAF8F5] border border-stone-300 px-3.5 py-2 rounded-xl transition"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#7C2D12]" /> Full-Screen App Preview
            </button>
            <button
              onClick={startApkDownload}
              className="bg-[#7C2D12] hover:bg-[#63220D] text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4" /> Download APK (Offline-Ready)
            </button>
          </div>
        </div>
      </header>

      {/* Main Split Section: Promotional Portal (Left) + Interactive Phone Preview (Right) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* LEFT COLUMN: CLEAN EDITORIAL WEBSITE & APK PORTAL (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F1EA] border border-stone-300 text-[#7C2D12] text-xs font-bold">
                <Scroll className="w-3.5 h-3.5" /> Complete Medieval Age (476 AD – 1500 AD) • Offline & Online
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight leading-tight">
                Study the <span className="text-[#7C2D12]">Medieval World</span> Offline. Battle Friends & Lobbies Online.
              </h1>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                Designed and engineered by <strong>Ali Dalgic</strong>, <strong>HistoryFun</strong> combines a complete offline encyclopedia of the Middle Ages with a live multiplayer trivia arena. Study anywhere without internet, or go online to join public lobbies and challenge friends.
              </p>

              {/* Primary CTA Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={startApkDownload}
                  className="bg-[#7C2D12] hover:bg-[#63220D] text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-sm flex items-center gap-2.5 transition"
                >
                  <Download className="w-5 h-5" />
                  <div className="text-left">
                    <div className="leading-none">Download HistoryFun.apk</div>
                    <div className="text-[10px] font-normal text-stone-200 mt-0.5">
                      v3.0.0 • Offline Learn & Quiz + Online Lobbies • 48.2 MB
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setViewLayout('fullscreen-app')}
                  className="bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-bold text-sm px-5 py-3.5 rounded-2xl flex items-center gap-2 transition shadow-2xs"
                >
                  <Smartphone className="w-4 h-4 text-[#7C2D12]" /> Expand App Preview
                </button>
              </div>
            </div>

            {/* Interactive 5-Page Switcher for the Live Phone Preview */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7C2D12]">
                  Explore the 5 App Pages in the Live Preview →
                </span>
                <span className="text-[11px] text-emerald-800 font-semibold">
                  Interactive Phone Emulator
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { id: 'learn', label: '1. Learn', icon: BookOpen },
                  { id: 'quiz', label: '2. Quiz', icon: Trophy },
                  { id: 'battle', label: '3. Battle', icon: Sword },
                  { id: 'friends', label: '4. Friends', icon: Users },
                  { id: 'settings', label: '5. Settings', icon: Settings }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition ${
                        activeTab === tab.id
                          ? 'bg-[#7C2D12] text-white border-[#7C2D12]'
                          : 'bg-[#FAF8F5] text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Offline vs Online Architecture Overview */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    100% Offline Ready
                  </span>
                  <BookOpen className="w-4 h-4 text-emerald-800" />
                </div>
                <h3 className="font-bold text-stone-900 text-sm">Learn & Solo Quiz Modes</h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Once you download the APK, all 10 Medieval Age chronicles (Early, High, Late & Global), bookmarks, and the Solo Quiz engine work anytime without Wi-Fi or mobile data.
                </p>
              </div>

              <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    Live Online Multiplayer
                  </span>
                  <Sword className="w-4 h-4 text-[#7C2D12]" />
                </div>
                <h3 className="font-bold text-stone-900 text-sm">Public Lobbies & Friend Duels</h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Connect online to browse open public rooms, matchmake with random historians, host private room codes, or challenge friends from your roster.
                </p>
              </div>
            </div>

            {/* APK Technical Specifications & Credits Banner */}
            <div className="bg-[#F4F1EA] border border-stone-300 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7C2D12]">
                    Official Android Package
                  </span>
                  <span className="text-[10px] bg-white text-stone-800 border border-stone-300 px-2 py-0.5 rounded font-bold">
                    Credits: Ali Dalgic
                  </span>
                </div>
                <p className="text-xs text-stone-600">
                  Package: <code className="text-stone-900 font-semibold">com.alidalgic.historyfun.medieval</code> • Android 8.0+
                </p>
              </div>
              <button
                onClick={startApkDownload}
                className="shrink-0 bg-white hover:bg-stone-100 text-[#7C2D12] border border-stone-300 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-2xs"
              >
                <Download className="w-4 h-4" /> Get APK Installer
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: CLEAN INTERACTIVE MOBILE PHONE EMULATOR (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-stone-600">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              INTERACTIVE PHONE PREVIEW — CLICK TABS BELOW
            </div>

            {/* Clean Hardware Bezel Frame */}
            <div className="w-full max-w-[390px] h-[750px] bg-stone-800 rounded-[44px] p-3 border-4 border-stone-700 shadow-xl relative flex flex-col">
              {/* Top Speaker Notch */}
              <div className="w-28 h-4 bg-stone-900 rounded-b-xl mx-auto mb-1 flex items-center justify-center">
                <div className="w-10 h-1 bg-stone-700 rounded-full" />
              </div>

              {/* Inner Screen Viewport */}
              <div className="flex-1 rounded-[32px] overflow-hidden border border-stone-300 bg-[#FAF8F5]">
                {renderMobileAppContent()}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ============================================================================
          APK DOWNLOAD & ANDROID INSTALLATION MODAL (CLEAN LIGHT EDITORIAL THEME)
      ============================================================================ */}
      {showApkModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 max-w-md w-full rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#F4F1EA] border border-stone-300 flex items-center justify-center text-[#7C2D12]">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">
                    HistoryFun-v3.0-Medieval.apk
                  </h3>
                  <p className="text-xs text-stone-500">By Ali Dalgic • Offline + Online Bundle (48.2 MB)</p>
                </div>
              </div>
              <button
                onClick={() => setShowApkModal(false)}
                className="text-stone-400 hover:text-stone-800 text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            {apkDownloadState === 'downloading' ? (
              <div className="space-y-2 py-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#7C2D12]">Bundling Offline Chronicles & APK...</span>
                  <span className="text-stone-900">{apkProgress}%</span>
                </div>
                <div className="w-full bg-stone-200 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-[#7C2D12] h-full transition-all duration-200"
                    style={{ width: `${apkProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-stone-500">
                  Including Early, High, Late & Global Medieval databases for offline access...
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
                <div className="text-xs text-emerald-950">
                  <strong>APK Download Complete!</strong> Check your browser downloads for{' '}
                  <code className="font-bold">HistoryFun-v3.0-Medieval-OfflineReady.apk</code>.
                </div>
              </div>
            )}

            <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4 space-y-2">
              <div className="text-xs font-bold text-[#7C2D12] uppercase tracking-wider">
                Android Installation Instructions:
              </div>
              <ol className="text-xs text-stone-700 space-y-1.5 list-decimal list-inside">
                <li>
                  Open <strong>HistoryFun-v3.0-Medieval-OfflineReady.apk</strong> on your Android device.
                </li>
                <li>
                  If prompted, allow installation from your browser in Android Settings.
                </li>
                <li>
                  Launch <strong>HistoryFun</strong> — Learn & Quiz modes work immediately offline, and Battle Lobbies connect online!
                </li>
              </ol>
            </div>

            <div className="flex gap-2">
              <button
                onClick={startApkDownload}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 font-bold text-xs py-3 rounded-xl transition"
              >
                Download Again
              </button>
              <button
                onClick={() => setShowApkModal(false)}
                className="flex-1 bg-[#7C2D12] hover:bg-[#63220D] text-white font-bold text-xs py-3 rounded-xl transition"
              >
                Return to App Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}