// ===== State =====
let currentUser = null;
let currentPage = 'dashboard';
let isLoginMode = true;
let chatMessages = [];
let deadlines = [];
let aiConfig = {
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo',
  provider: 'openai'
};
// ===== Constants =====
const AVATAR_COLORS = [
  'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  'linear-gradient(135deg, #8b5cf6, #ec4899)',
  'linear-gradient(135deg, #10b981, #3b82f6)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #ec4899, #8b5cf6)',
  'linear-gradient(135deg, #14b8a6, #3b82f6)',
];
const PROVIDERS = {
  openai: { 
    baseUrl: 'https://api.openai.com/v1', 
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    link: 'https://platform.openai.com/api-keys',
    linkText: 'Получить ключ OpenAI'
  },
  groq: { 
    baseUrl: 'https://api.groq.com/openai/v1', 
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
    link: 'https://console.groq.com/keys',
    linkText: 'Получить ключ Groq (бесплатно)'
  },
  openrouter: { 
    baseUrl: 'https://openrouter.ai/api/v1', 
    models: ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'google/gemini-pro'],
    link: 'https://openrouter.ai/keys',
    linkText: 'Получить ключ OpenRouter'
  },
  together: { 
    baseUrl: 'https://api.together.xyz/v1', 
    models: ['meta-llama/Llama-3-70b-chat-hf', 'mistralai/Mixtral-8x7B-Instruct-v0.1'],
    link: 'https://api.together.xyz/',
    linkText: 'Получить ключ Together AI'
  },
  custom: { 
    baseUrl: '', 
    models: [],
    link: '',
    linkText: ''
  }
};
const SOCRATIC_SYSTEM_PROMPT = `Ты — ИИ-ассистент для самостоятельной работы студентов, работающий по сократическому методу.
ТВОЯ ГЛАВНАЯ ЗАДАЧА: Помогать студентам разобраться в материале самостоятельно, НЕ давая готовых решений, ответов или кода.
ПРИНЦИПЫ РАБОТЫ:
1. НИКОГДА не давай готовый код, даже если студент настойчиво просит
2. НИКОГДА не давай прямые ответы на задачи и упражнения
3. ВСЕГДА задавай наводящие вопросы, чтобы студент сам пришёл к решению
4. Направляй к методическим материалам и документации
5. Предлагай разбить сложную задачу на простые шаги
6. Проверяй понимание через уточняющие вопросы
СТРАТЕГИИ СОКРАТИЧЕСКОГО ДИАЛОГА:
- "Что ты уже знаешь об этой теме?"
- "Какой первый шаг, по твоему мнению, нужно сделать?"
- "Можешь объяснить это понятие своими словами?"
- "Какие данные у тебя есть на входе? Что нужно получить на выходе?"
- "Где ты мог бы найти информацию об этом?"
- "Попробуй разбить задачу на более мелкие части. С чего начнём?"
ЕСЛИ СТУДЕНТ ПРОСИТ ГОТОВОЕ РЕШЕНИЕ:
Мягко откажи и объясни, что твоя задача — помочь ему научиться решать задачи самостоятельно. Предложи вместе разобрать задачу по шагам.
ДОПУСТИМО:
- Объяснять теоретические концепции (без решения конкретных задач)
- Давать подсказки и направления для размышления
- Указывать на ошибки в рассуждениях студента
- Рекомендовать ресурсы для изучения
- Приводить аналогии из повседневной жизни
ФОРМАТ ОТВЕТОВ:
- Используй эмодзи для дружелюбного тона
- Структурируй длинные ответы списками
- Задавай 1-2 вопроса в конце каждого ответа, чтобы продолжить диалог
- Будь терпелив и поддерживай студента
ЯЗЫК: Отвечай на русском языке.`;
const STUDY_MATERIALS = [
  {
    id: '1',
    title: 'Основы программирования на Python',
    description: 'Переменные, типы данных, условия, циклы, функции',
    category: 'Программирование',
    icon: '🐍',
    content: `<strong>Python</strong> — один из самых популярных языков программирования.
<strong>Переменные и типы данных</strong>
- int, float, str, bool, list, dict, tuple, set
- Динамическая типизация
<strong>Условные конструкции</strong>
- if / elif / else
- Тернарный оператор
<strong>Циклы</strong>
- for, while
- break, continue, else в циклах
<strong>Функции</strong>
- def, return, параметры
- *args, **kwargs
- Лямбда-выражения`,
    links: [
      { title: 'Документация Python', url: 'https://docs.python.org/3/' },
      { title: 'Python Tutorial', url: 'https://docs.python.org/3/tutorial/' },
    ],
  },
  {
    id: '2',
    title: 'Объектно-ориентированное программирование',
    description: 'Классы, наследование, полиморфизм, инкапсуляция',
    category: 'Программирование',
    icon: '🏗️',
    content: `<strong>ООП</strong> — парадигма программирования, основанная на концепции объектов.
<strong>Четыре принципа ООП:</strong>
1. <strong>Инкапсуляция</strong> — сокрытие внутренней реализации
2. <strong>Наследование</strong> — создание новых классов на основе существующих
3. <strong>Полиморфизм</strong> — один интерфейс для различных типов данных
4. <strong>Абстракция</strong> — выделение существенных характеристик объекта
<strong>Ключевые понятия:</strong>
- Класс и объект (экземпляр)
- Конструктор (__init__)
- Методы экземпляра, класса, статические
- Свойства (property)
- Множественное наследование и MRO`,
    links: [
      { title: 'Python Classes', url: 'https://docs.python.org/3/tutorial/classes.html' },
    ],
  },
  {
    id: '3',
    title: 'Базы данных и SQL',
    description: 'Реляционные БД, SQL-запросы, нормализация',
    category: 'Базы данных',
    icon: '🗄️',
    content: `<strong>Базы данных</strong> — организованная совокупность данных.
<strong>Основные SQL-команды:</strong>
- SELECT, INSERT, UPDATE, DELETE
- JOIN (INNER, LEFT, RIGHT, FULL)
- GROUP BY, HAVING, ORDER BY
- Подзапросы и CTE
<strong>Нормальные формы:</strong>
- 1НФ — атомарность значений
- 2НФ — полная функциональная зависимость
- 3НФ — отсутствие транзитивных зависимостей
- НФБК — усиленная 3НФ
<strong>Индексы и оптимизация:</strong>
- B-Tree индексы
- EXPLAIN ANALYZE
- Оптимизация запросов`,
    links: [
      { title: 'SQLite Documentation', url: 'https://www.sqlite.org/docs.html' },
      { title: 'SQL Tutorial', url: 'https://www.w3schools.com/sql/' },
    ],
  },
  {
    id: '4',
    title: 'Веб-разработка',
    description: 'HTML, CSS, JavaScript, HTTP, REST API',
    category: 'Веб-технологии',
    icon: '🌐',
    content: `<strong>Веб-разработка</strong> включает создание сайтов и веб-приложений.
<strong>Frontend:</strong>
- HTML5 — структура страницы
- CSS3 — стилизация (Flexbox, Grid)
- JavaScript — интерактивность
- DOM — Document Object Model
<strong>Backend:</strong>
- HTTP-протокол (GET, POST, PUT, DELETE)
- REST API — архитектурный стиль
- Flask / FastAPI (Python)
- Аутентификация (JWT, сессии)
<strong>Инструменты:</strong>
- DevTools браузера
- Postman для тестирования API
- Git для контроля версий`,
    links: [
      { title: 'MDN Web Docs', url: 'https://developer.mozilla.org/' },
      { title: 'Flask Documentation', url: 'https://flask.palletsprojects.com/' },
    ],
  },
  {
    id: '5',
    title: 'Алгоритмы и структуры данных',
    description: 'Сортировки, поиск, графы, деревья, сложность',
    category: 'Информатика',
    icon: '⚡',
    content: `<strong>Алгоритмы</strong> — основа эффективного программирования.
<strong>Структуры данных:</strong>
- Массивы, связные списки
- Стек, очередь, дек
- Хеш-таблицы
- Деревья (BST, AVL, красно-чёрные)
- Графы
<strong>Алгоритмы сортировки:</strong>
- Пузырьковая, вставками, выбором — O(n²)
- Быстрая, слиянием — O(n log n)
- Поразрядная — O(nk)
<strong>Сложность алгоритмов:</strong>
- O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)
- Амортизированный анализ`,
    links: [
      { title: 'Visualgo', url: 'https://visualgo.net/' },
    ],
  },
  {
    id: '6',
    title: 'Математический анализ',
    description: 'Пределы, производные, интегралы, ряды',
    category: 'Математика',
    icon: '📐',
    content: `<strong>Математический анализ</strong> — фундамент высшей математики.
<strong>Пределы:</strong>
- Определение предела по Коши
- Замечательные пределы
- Правило Лопиталя
<strong>Производные:</strong>
- Определение через предел
- Правила дифференцирования
- Производные элементарных функций
- Применение: экстремумы, касательные
<strong>Интегралы:</strong>
- Неопределённый интеграл
- Определённый интеграл (формула Ньютона-Лейбница)
- Методы интегрирования: замена, по частям
- Приложения: площадь, объём`,
    links: [
      { title: 'Wolfram MathWorld', url: 'https://mathworld.wolfram.com/' },
    ],
  },
];
const INITIAL_DEADLINES = [
  {
    id: '1',
    title: 'Лабораторная работа №3',
    subject: 'Программирование на Python',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    priority: 'high',
    completed: false,
    description: 'Реализовать классы для библиотечной системы',
  },
  {
    id: '2',
    title: 'Курсовая работа (промежуточный отчёт)',
    subject: 'Базы данных',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    priority: 'high',
    completed: false,
    description: 'Подготовить ER-диаграмму и описание таблиц',
  },
  {
    id: '3',
    title: 'Домашнее задание №7',
    subject: 'Математический анализ',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    priority: 'medium',
    completed: false,
    description: 'Задачи на интегрирование по частям',
  },
  {
    id: '4',
    title: 'Тест по HTML/CSS',
    subject: 'Веб-разработка',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    priority: 'low',
    completed: false,
    description: 'Онлайн-тестирование в LMS',
  },
  {
    id: '5',
    title: 'Реферат',
    subject: 'Алгоритмы и структуры данных',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    priority: 'medium',
    completed: true,
    description: 'Обзор алгоритмов сортировки',
  },
];
const SOCRATIC_RESPONSES = {
  code_request: [
    'Я не даю готовый код — но давайте разберёмся вместе! 🤔\n\nСкажите, какую задачу вы пытаетесь решить? Опишите её своими словами.',
    'Я помогу вам дойти до решения самостоятельно! 💡\n\nДавайте начнём с основ: какие данные у вас есть на входе, и какой результат вы хотите получить?',
    'Вместо готового кода предлагаю разобрать задачу по шагам. 📝\n\nКакой первый шаг, по вашему мнению, нужно сделать для решения этой задачи?',
  ],
  answer_request: [
    'Я не даю готовых ответов, но мы можем разобрать задачу вместе! 📚\n\nКакие шаги вы уже предприняли? В чём именно возникло затруднение?',
    'Давайте подойдём к этому вопросу иначе. 🔍\n\nЧто вы уже знаете по этой теме? Попробуйте сформулировать своё текущее понимание.',
    'Я помогу вам найти ответ самостоятельно! 🎯\n\nДавайте разобьём задачу на части. С какой частью вы хотели бы начать?',
  ],
  concept_question: [
    'Отличный вопрос! Давайте разберёмся. 🧠\n\nПопробуйте вспомнить — встречали ли вы это понятие раньше? В каком контексте?',
    'Хороший вопрос для изучения! 📖\n\nПрежде чем я помогу с объяснением, скажите: как бы вы объяснили это понятие своими словами? Даже если неточно — это поможет найти пробелы.',
    'Давайте разберёмся в этом шаг за шагом. 🪜\n\nМожете ли вы привести пример из повседневной жизни, который мог бы быть связан с этим понятием?',
  ],
  math_question: [
    'Давайте решим это вместе! ✏️\n\nКакую формулу или теорему, по вашему мнению, нужно применить здесь? Вспомните, что мы знаем о данном типе задач.',
    'Математика — это шаг за шагом. 📐\n\nНачните с того, что запишите условия задачи. Какие величины известны? Что нужно найти?',
    'Хорошая задача! Давайте подумаем вместе. 🤔\n\nКакой метод решения вы бы попробовали первым? Почему именно его?',
  ],
  general: [
    'Интересная тема! Давайте разберёмся. 💬\n\nЧто именно вас интересует в этом вопросе? Попробуйте сформулировать конкретнее.',
    'Давайте углубимся в эту тему! 🔬\n\nКакой аспект этого вопроса вызывает наибольшие затруднения?',
    'Хороший вопрос! 👍\n\nПрежде чем мы начнём, скажите — что вы уже знаете по этой теме? Это поможет мне подобрать правильный уровень объяснения.',
  ],
};
// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  setupAuthForm();
  
  // Initialize with welcome message
  if (chatMessages.length === 0) {
    chatMessages.push({
      id: 'welcome',
      role: 'assistant',
      content: `Здравствуйте! 👋 Я ваш ИИ-ассистент, работающий по **сократическому методу**.
Я не даю готовых ответов и решений — вместо этого я помогу вам разобраться в материале самостоятельно через наводящие вопросы и подсказки.
**Что я умею:**
• Помогаю разобраться в сложных темах
• Направляю к нужным учебным материалам
• Помогаю разбить задачу на шаги
• Проверяю ваше понимание концепций
**Как это работает:**
Просто задайте вопрос по учебному материалу, и мы вместе разберёмся! 🎓
С какой темой вам нужна помощь?`,
      timestamp: new Date()
    });
  }
  
  if (deadlines.length === 0) {
    deadlines = INITIAL_DEADLINES;
  }
});
// ===== Storage =====
function loadFromStorage() {
  try {
    const savedUser = localStorage.getItem('socratai_user');
    const savedConfig = localStorage.getItem('socratai_config');
    const savedMessages = localStorage.getItem('socratai_messages');
    const savedDeadlines = localStorage.getItem('socratai_deadlines');
    
    if (savedUser) {
      currentUser = JSON.parse(savedUser);
      showApp();
    }
    
    if (savedConfig) {
      aiConfig = { ...aiConfig, ...JSON.parse(savedConfig) };
    }
    
    if (savedMessages) {
      chatMessages = JSON.parse(savedMessages).map(m => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
    }
    
    if (savedDeadlines) {
      deadlines = JSON.parse(savedDeadlines).map(d => ({
        ...d,
        dueDate: new Date(d.dueDate)
      }));
    }
  } catch (e) {
    console.error('Error loading from storage:', e);
  }
}
function saveToStorage() {
  try {
    if (currentUser) {
      localStorage.setItem('socratai_user', JSON.stringify(currentUser));
    }
    localStorage.setItem('socratai_config', JSON.stringify(aiConfig));
    localStorage.setItem('socratai_messages', JSON.stringify(chatMessages));
    localStorage.setItem('socratai_deadlines', JSON.stringify(deadlines));
  } catch (e) {
    console.error('Error saving to storage:', e);
  }
}
// ===== Auth =====
function setupAuthForm() {
  document.getElementById('auth-form').addEventListener('submit', handleAuth);
}
function handleAuth(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('auth-error');
  
  if (!username || !password) {
    showAuthError('Заполните все обязательные поля');
    return;
  }
  
  if (password.length < 4) {
    showAuthError('Пароль должен быть не менее 4 символов');
    return;
  }
  
  if (!isLoginMode) {
    const consent = document.getElementById('consent').checked;
    if (!consent) {
      showAuthError('Необходимо согласие на обработку данных');
      return;
    }
  }
  
  const fullName = document.getElementById('fullname').value.trim() || username;
  const email = document.getElementById('email').value.trim();
  const group = document.getElementById('group').value.trim() || 'Не указана';
  
  currentUser = {
    id: Date.now().toString(),
    username,
    fullName,
    email,
    group,
    avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
  };
  
  errorEl.classList.add('hidden');
  saveToStorage();
  showApp();
}
function showAuthError(message) {
  const errorEl = document.getElementById('auth-error');
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}
function toggleAuthMode() {
  isLoginMode = !isLoginMode;
  
  document.getElementById('auth-title').textContent = isLoginMode ? 'Вход в систему' : 'Регистрация';
  document.getElementById('auth-subtitle').textContent = isLoginMode 
    ? 'Войдите, чтобы продолжить обучение' 
    : 'Создайте аккаунт для начала работы';
  document.getElementById('auth-btn-text').textContent = isLoginMode ? 'Войти' : 'Зарегистрироваться';
  document.getElementById('auth-switch-btn').textContent = isLoginMode 
    ? 'Нет аккаунта? Зарегистрируйтесь' 
    : 'Уже есть аккаунт? Войти';
  
  document.getElementById('fullname-field').classList.toggle('hidden', isLoginMode);
  document.getElementById('email-field').classList.toggle('hidden', isLoginMode);
  document.getElementById('group-field').classList.toggle('hidden', isLoginMode);
  document.getElementById('consent-field').classList.toggle('hidden', isLoginMode);
  document.getElementById('auth-error').classList.add('hidden');
}
function togglePassword() {
  const input = document.getElementById('password');
  const eyeIcon = document.querySelector('#auth-form .eye-icon');
  const eyeOffIcon = document.querySelector('#auth-form .eye-off-icon');
  
  if (input.type === 'password') {
    input.type = 'text';
    eyeIcon.classList.add('hidden');
    eyeOffIcon.classList.remove('hidden');
  } else {
    input.type = 'password';
    eyeIcon.classList.remove('hidden');
    eyeOffIcon.classList.add('hidden');
  }
}
function logout() {
  currentUser = null;
  localStorage.removeItem('socratai_user');
  document.getElementById('app').classList.add('hidden');
  document.getElementById('auth-page').classList.remove('hidden');
  closeSidebar();
}
// ===== App Navigation =====
function showApp() {
  document.getElementById('auth-page').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  
  updateUserInfo();
  navigateTo('dashboard');
}
function updateUserInfo() {
  if (!currentUser) return;
  
  const initials = currentUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  document.getElementById('user-avatar').textContent = initials;
  document.getElementById('user-avatar').style.background = currentUser.avatarColor;
  document.getElementById('user-name').textContent = currentUser.fullName;
  document.getElementById('user-group').textContent = currentUser.group;
}
function navigateTo(page) {
  currentPage = page;
  
  // Update nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
  
  // Update pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  
  // Update mobile header
  const titles = {
    dashboard: 'Главная',
    chat: 'ИИ-ассистент',
    materials: 'Материалы',
    schedule: 'Расписание',
    profile: 'Профиль'
  };
  document.getElementById('page-title').textContent = titles[page];
  
  // Render page
  renderPage(page);
  closeSidebar();
}
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('active');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('active');
}
// ===== Page Rendering =====
function renderPage(page) {
  switch (page) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'chat':
      renderChat();
      break;
    case 'materials':
      renderMaterials();
      break;
    case 'schedule':
      renderSchedule();
      break;
    case 'profile':
      renderProfile();
      break;
  }
}
// ===== Dashboard =====
function renderDashboard() {
  const greeting = getGreeting();
  const firstName = currentUser.fullName.split(' ')[0];
  const totalMessages = chatMessages.filter(m => m.role === 'user').length;
  const completedCount = deadlines.filter(d => d.completed).length;
  const pendingCount = deadlines.filter(d => !d.completed && new Date(d.dueDate) >= new Date()).length;
  const overdueCount = deadlines.filter(d => !d.completed && new Date(d.dueDate) < new Date()).length;
  
  const upcomingDeadlines = deadlines
    .filter(d => !d.completed && new Date(d.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);
  
  document.getElementById('page-dashboard').innerHTML = `
    <div class="page-content">
      <div class="dashboard-header">
        <div>
          <h1>${greeting}, ${firstName}! 👋</h1>
          <p>Что будем изучать сегодня?</p>
        </div>
        <button class="btn-chat" onclick="navigateTo('chat')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Начать диалог с ИИ
        </button>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div class="stat-value">${totalMessages}</div>
          <div class="stat-label">Сообщений в чате</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div class="stat-value">${completedCount}</div>
          <div class="stat-label">Выполнено заданий</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon yellow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div class="stat-value">${pendingCount}</div>
          <div class="stat-label">Осталось заданий</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div class="stat-value">${overdueCount}</div>
          <div class="stat-label">Просрочено</div>
        </div>
      </div>
      
      <div class="dashboard-grid">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Ближайшие дедлайны
            </h2>
            <a href="#" class="card-link" onclick="navigateTo('schedule'); return false;">
              Все <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </a>
          </div>
          ${upcomingDeadlines.length > 0 ? `
            <div class="deadline-list">
              ${upcomingDeadlines.map(d => `
                <div class="deadline-item">
                  <div class="deadline-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div class="deadline-info">
                    <div class="deadline-title">${d.title}</div>
                    <div class="deadline-subject">${d.subject}</div>
                  </div>
                  <div class="deadline-meta">
                    <span class="deadline-date">${formatRelativeDate(d.dueDate)}</span>
                    <span class="priority-badge ${d.priority}">${getPriorityLabel(d.priority)}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <p>Нет предстоящих дедлайнов!</p>
            </div>
          `}
        </div>
        
        <div class="sidebar-cards">
          <div class="info-card">
            <div class="info-card-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              <h3>Сократический метод</h3>
            </div>
            <p>ИИ-ассистент не даёт готовых ответов. Вместо этого он задаёт наводящие вопросы, помогая вам прийти к решению самостоятельно.</p>
            <a href="#" class="info-card-link" onclick="navigateTo('chat'); return false;">
              Попробовать <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </a>
          </div>
          
          <div class="card progress-card">
            <div class="card-header">
              <h2 class="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--green-400)"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                Прогресс
              </h2>
            </div>
            <div class="progress-item">
              <div class="progress-header">
                <span>Задания</span>
                <span>${completedCount}/${deadlines.length}</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill green" style="width: ${deadlines.length > 0 ? (completedCount / deadlines.length * 100) : 0}%"></div>
              </div>
            </div>
            <div class="progress-item">
              <div class="progress-header">
                <span>Материалы</span>
                <span>2/${STUDY_MATERIALS.length}</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill primary" style="width: ${(2 / STUDY_MATERIALS.length * 100)}%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card materials-preview">
        <div class="card-header">
          <h2 class="card-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--accent-400)"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            Учебные материалы
          </h2>
          <a href="#" class="card-link" onclick="navigateTo('materials'); return false;">
            Все материалы <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
        </div>
        <div class="materials-grid">
          ${STUDY_MATERIALS.slice(0, 3).map(m => `
            <button class="material-card" onclick="navigateTo('materials')">
              <div class="icon">${m.icon}</div>
              <h3>${m.title}</h3>
              <p>${m.description}</p>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return 'Доброй ночи';
  if (h < 12) return 'Доброе утро';
  if (h < 18) return 'Добрый день';
  return 'Добрый вечер';
}
function formatRelativeDate(date) {
  const now = new Date();
  const d = new Date(date);
  const diff = d.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  if (days < 0) return `Просрочено на ${Math.abs(days)} дн.`;
  if (days === 0) return 'Сегодня';
  if (days === 1) return 'Завтра';
  if (days <= 7) return `Через ${days} дн.`;
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}
function getPriorityLabel(priority) {
  const labels = { high: 'Высокий', medium: 'Средний', low: 'Низкий' };
  return labels[priority];
}
// ===== Chat =====
let isTyping = false;
let streamingContent = '';
function renderChat() {
  const isConnected = aiConfig.apiKey.trim() !== '';
  
  document.getElementById('page-chat').innerHTML = `
    <div class="chat-header">
      <div class="chat-info">
        <div class="chat-avatar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        </div>
        <div>
          <div class="chat-title">ИИ-ассистент (Сократический метод)</div>
          <div class="chat-status">
            ${isConnected ? `
              <span class="status-dot online"></span>
              <span class="connected">API подключён</span>
              <span class="model">• ${aiConfig.model}</span>
            ` : `
              <span class="status-dot demo"></span>
              <span class="demo-mode">Демо-режим</span>
            `}
          </div>
        </div>
      </div>
      <div class="chat-actions">
        <button class="chat-action settings ${isConnected ? '' : 'demo'}" onclick="openAISettings()" title="Настройки API">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>
        <button class="chat-action" onclick="toggleChatInfo()" title="Информация">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        </button>
        <button class="chat-action delete" onclick="clearChat()" title="Очистить чат">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    </div>
    
    ${!isConnected ? `
      <div class="chat-banner warning">
        <div class="banner-content">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <p>Работает в демо-режиме. Подключите API для реальных ответов ИИ.</p>
        </div>
        <button class="banner-btn" onclick="openAISettings()">Настроить</button>
      </div>
    ` : ''}
    
    <div id="chat-info-banner" class="chat-banner info hidden">
      <div class="banner-content">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <p><strong>О сократическом методе:</strong> Ассистент использует метод Сократа — вместо прямых ответов задаёт наводящие вопросы, помогая вам самостоятельно прийти к пониманию.</p>
      </div>
      <button class="banner-close" onclick="toggleChatInfo()">✕</button>
    </div>
    
    <div id="chat-error-banner" class="chat-banner error hidden">
      <div class="banner-content">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        <p id="chat-error-text"></p>
      </div>
      <button class="banner-close" onclick="hideChatError()">✕</button>
    </div>
    
    <div class="chat-messages" id="chat-messages">
      ${chatMessages.map(m => renderMessage(m)).join('')}
    </div>
    
    ${chatMessages.length <= 1 ? `
      <div class="quick-prompts">
        <button class="quick-prompt" onclick="setQuickPrompt('Помоги разобраться с ООП')">Помоги разобраться с ООП</button>
        <button class="quick-prompt" onclick="setQuickPrompt('Как работают SQL JOIN?')">Как работают SQL JOIN?</button>
        <button class="quick-prompt" onclick="setQuickPrompt('Что такое рекурсия?')">Что такое рекурсия?</button>
        <button class="quick-prompt" onclick="setQuickPrompt('Помоги решить задачу по матану')">Помоги решить задачу по матану</button>
      </div>
    ` : ''}
    
    <div class="chat-input-container">
      <div class="chat-input-wrapper">
        <textarea 
          id="chat-input" 
          class="chat-input" 
          placeholder="Задайте вопрос по учебному материалу..."
          rows="1"
          onkeydown="handleChatKeydown(event)"
          oninput="autoResizeTextarea(this); updateSendButton()"
        ></textarea>
        <button id="chat-send" class="chat-send" onclick="sendChatMessage()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
      <div class="chat-input-hint">
        ${isConnected 
          ? `Подключено к ${aiConfig.model} • Сократический метод активен`
          : 'ИИ-ассистент использует сократический метод и не даёт готовых решений'
        }
      </div>
    </div>
  `;
  
  scrollToBottom();
}
function renderMessage(msg) {
  const time = new Date(msg.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const content = formatMessageContent(msg.content);
  
  return `
    <div class="message ${msg.role}">
      <div class="message-avatar ${msg.role}">
        ${msg.role === 'user' 
          ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
          : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'
        }
      </div>
      <div class="message-content">
        <div class="message-bubble">${content}</div>
        <div class="message-time">${time}</div>
      </div>
    </div>
  `;
}
function formatMessageContent(content) {
  let html = content;
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Line breaks
  html = html.replace(/\n/g, '<br>');
  // Horizontal rule
  html = html.replace(/<br>---<br>/g, '<hr>');
  
  return html;
}
function toggleChatInfo() {
  document.getElementById('chat-info-banner').classList.toggle('hidden');
}
function hideChatError() {
  document.getElementById('chat-error-banner').classList.add('hidden');
}
function showChatError(message) {
  document.getElementById('chat-error-text').textContent = message;
  document.getElementById('chat-error-banner').classList.remove('hidden');
}
function setQuickPrompt(text) {
  document.getElementById('chat-input').value = text;
  document.getElementById('chat-input').focus();
  updateSendButton();
}
function handleChatKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
}
function autoResizeTextarea(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}
function updateSendButton() {
  const input = document.getElementById('chat-input');
  const btn = document.getElementById('chat-send');
  if (input && btn) {
    btn.classList.toggle('active', input.value.trim() !== '' && !isTyping);
  }
}
function scrollToBottom() {
  const container = document.getElementById('chat-messages');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}
async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  if (!input || !input.value.trim() || isTyping) return;
  
  const userMessage = {
    id: Date.now().toString(),
    role: 'user',
    content: input.value.trim(),
    timestamp: new Date()
  };
  
  chatMessages.push(userMessage);
  input.value = '';
  autoResizeTextarea(input);
  updateSendButton();
  hideChatError();
  
  // Render user message
  const messagesContainer = document.getElementById('chat-messages');
  messagesContainer.innerHTML += renderMessage(userMessage);
  
  // Remove quick prompts
  const quickPrompts = document.querySelector('.quick-prompts');
  if (quickPrompts) quickPrompts.remove();
  
  scrollToBottom();
  
  isTyping = true;
  
  // Show typing indicator
  messagesContainer.innerHTML += `
    <div class="message assistant" id="typing-indicator">
      <div class="message-avatar assistant">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
      </div>
      <div class="message-content">
        <div class="message-bubble">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  scrollToBottom();
  
  let response;
  
  if (aiConfig.apiKey.trim()) {
    // Use real API
    try {
      response = await sendToAI(chatMessages);
    } catch (error) {
      showChatError(error.message);
      response = `⚠️ ${error.message}\n\nПроверьте настройки API или попробуйте позже.`;
    }
  } else {
    // Demo mode
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    response = getDemoResponse(userMessage.content);
    response += '\n\n---\n*💡 Это демо-ответ. Подключите API ключ в настройках для получения реальных ответов от ИИ.*';
  }
  
  // Remove typing indicator
  document.getElementById('typing-indicator')?.remove();
  
  const assistantMessage = {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: response,
    timestamp: new Date()
  };
  
  chatMessages.push(assistantMessage);
  messagesContainer.innerHTML += renderMessage(assistantMessage);
  
  isTyping = false;
  updateSendButton();
  scrollToBottom();
  saveToStorage();
}
async function sendToAI(messages) {
  const apiMessages = [
    { role: 'system', content: SOCRATIC_SYSTEM_PROMPT },
    ...messages
      .filter(m => m.role !== 'system')
      .slice(-20)
      .map(m => ({ role: m.role, content: m.content }))
  ];
  
  const response = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${aiConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: aiConfig.model,
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error('Неверный API ключ');
    } else if (response.status === 429) {
      throw new Error('Превышен лимит запросов. Попробуйте позже.');
    }
    throw new Error(error.error?.message || `Ошибка API: ${response.status}`);
  }
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Не удалось получить ответ';
}
function getDemoResponse(message) {
  const lower = message.toLowerCase();
  
  if (lower.includes('напиши код') || lower.includes('дай код') || lower.includes('покажи код') || lower.includes('реализуй')) {
    return SOCRATIC_RESPONSES.code_request[Math.floor(Math.random() * SOCRATIC_RESPONSES.code_request.length)];
  }
  
  if (lower.includes('дай ответ') || lower.includes('скажи ответ') || lower.includes('реши')) {
    return SOCRATIC_RESPONSES.answer_request[Math.floor(Math.random() * SOCRATIC_RESPONSES.answer_request.length)];
  }
  
  if (lower.includes('что такое') || lower.includes('объясни') || lower.includes('расскажи')) {
    return SOCRATIC_RESPONSES.concept_question[Math.floor(Math.random() * SOCRATIC_RESPONSES.concept_question.length)];
  }
  
  if (lower.includes('вычисли') || lower.includes('посчитай') || lower.includes('интеграл') || lower.includes('производн')) {
    return SOCRATIC_RESPONSES.math_question[Math.floor(Math.random() * SOCRATIC_RESPONSES.math_question.length)];
  }
  
  return SOCRATIC_RESPONSES.general[Math.floor(Math.random() * SOCRATIC_RESPONSES.general.length)];
}
function clearChat() {
  chatMessages = [{
    id: 'welcome-' + Date.now(),
    role: 'assistant',
    content: 'Диалог очищен. Я готов помочь вам разобраться в новой теме! 🎓\n\nС какой темой вам нужна помощь?',
    timestamp: new Date()
  }];
  saveToStorage();
  renderChat();
}
// ===== AI Settings =====
function openAISettings() {
  document.getElementById('ai-settings-modal').classList.remove('hidden');
  
  // Load current config
  document.getElementById('api-key').value = aiConfig.apiKey;
  document.getElementById('api-base-url').value = aiConfig.baseUrl;
  
  selectProvider(aiConfig.provider || 'openai');
  
  // Reset test result
  document.getElementById('api-test-result').classList.add('hidden');
}
function closeAISettings() {
  document.getElementById('ai-settings-modal').classList.add('hidden');
}
function selectProvider(provider) {
  aiConfig.provider = provider;
  
  // Update UI
  document.querySelectorAll('.provider-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.provider === provider);
  });
  
  const providerConfig = PROVIDERS[provider];
  
  // Update base URL
  if (provider !== 'custom') {
    aiConfig.baseUrl = providerConfig.baseUrl;
    document.getElementById('api-base-url').value = providerConfig.baseUrl;
  }
  
  // Show/hide custom URL field
  document.getElementById('custom-url-field').classList.toggle('hidden', provider !== 'custom');
  
  // Update model dropdown
  const modelSelect = document.getElementById('api-model');
  if (providerConfig.models.length > 0) {
    modelSelect.innerHTML = providerConfig.models.map(m => 
      `<option value="${m}" ${m === aiConfig.model ? 'selected' : ''}>${m}</option>`
    ).join('');
  }
  
  // Update API key link
  const linkEl = document.getElementById('api-key-link');
  if (providerConfig.link) {
    linkEl.href = providerConfig.link;
    linkEl.innerHTML = `${providerConfig.linkText} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
    linkEl.classList.remove('hidden');
  } else {
    linkEl.classList.add('hidden');
  }
  
  // Reset test result
  document.getElementById('api-test-result').classList.add('hidden');
}
function toggleApiKeyVisibility() {
  const input = document.getElementById('api-key');
  const eyeIcon = document.querySelector('#ai-settings-modal .eye-icon');
  const eyeOffIcon = document.querySelector('#ai-settings-modal .eye-off-icon');
  
  if (input.type === 'password') {
    input.type = 'text';
    eyeIcon.classList.add('hidden');
    eyeOffIcon.classList.remove('hidden');
  } else {
    input.type = 'password';
    eyeIcon.classList.remove('hidden');
    eyeOffIcon.classList.add('hidden');
  }
}
async function testApiKey() {
  const resultEl = document.getElementById('api-test-result');
  const apiKey = document.getElementById('api-key').value.trim();
  const baseUrl = aiConfig.provider === 'custom' 
    ? document.getElementById('api-base-url').value.trim() 
    : aiConfig.baseUrl;
  const model = document.getElementById('api-model').value;
  
  if (!apiKey) {
    resultEl.className = 'test-result error';
    resultEl.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Введите API ключ';
    resultEl.classList.remove('hidden');
    return;
  }
  
  resultEl.className = 'test-result';
  resultEl.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-pulse"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Проверка...';
  resultEl.classList.remove('hidden');
  
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5,
      }),
    });
    
    if (response.ok) {
      resultEl.className = 'test-result success';
      resultEl.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> API ключ работает!';
    } else {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Ошибка ${response.status}`);
    }
  } catch (error) {
    resultEl.className = 'test-result error';
    resultEl.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> ${error.message}`;
  }
}
function saveAISettings() {
  aiConfig.apiKey = document.getElementById('api-key').value.trim();
  aiConfig.model = document.getElementById('api-model').value;
  
  if (aiConfig.provider === 'custom') {
    aiConfig.baseUrl = document.getElementById('api-base-url').value.trim();
  }
  
  saveToStorage();
  closeAISettings();
  
  if (currentPage === 'chat') {
    renderChat();
  }
}
// ===== Materials =====
let materialsSearchQuery = '';
let materialsCategory = null;
let expandedMaterialId = null;
function renderMaterials() {
  const categories = [...new Set(STUDY_MATERIALS.map(m => m.category))];
  
  const filtered = STUDY_MATERIALS.filter(m => {
    const matchesSearch = !materialsSearchQuery || 
      m.title.toLowerCase().includes(materialsSearchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(materialsSearchQuery.toLowerCase());
    const matchesCategory = !materialsCategory || m.category === materialsCategory;
    return matchesSearch && matchesCategory;
  });
  
  document.getElementById('page-materials').innerHTML = `
    <div class="page-content">
      <div class="page-header">
        <h1>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          Учебные материалы
        </h1>
        <p>Структурированная база знаний по основным предметам</p>
      </div>
      
      <div class="search-filters">
        <div class="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Поиск по материалам..." value="${materialsSearchQuery}" oninput="searchMaterials(this.value)">
          ${materialsSearchQuery ? '<button class="search-clear" onclick="clearMaterialsSearch()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' : ''}
        </div>
        <div class="filter-buttons">
          <button class="filter-btn ${!materialsCategory ? 'active' : ''}" onclick="filterMaterials(null)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Все
          </button>
          ${categories.map(cat => `
            <button class="filter-btn ${materialsCategory === cat ? 'active' : ''}" onclick="filterMaterials('${cat}')">${cat}</button>
          `).join('')}
        </div>
      </div>
      
      ${filtered.length > 0 ? `
        <div class="materials-list">
          ${filtered.map(m => `
            <div class="material-item ${expandedMaterialId === m.id ? 'expanded' : ''}">
              <button class="material-header" onclick="toggleMaterial('${m.id}')">
                <div class="material-icon">${m.icon}</div>
                <div class="material-meta">
                  <h3>${m.title}</h3>
                  <p>${m.description}</p>
                  <span class="material-category">${m.category}</span>
                </div>
                <svg class="material-toggle" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div class="material-body">
                <div class="material-content">${m.content}</div>
                ${m.links.length > 0 ? `
                  <div class="material-links">
                    <div class="material-links-title">Полезные ссылки</div>
                    <div class="material-links-list">
                      ${m.links.map(link => `
                        <a href="${link.url}" target="_blank" class="material-link">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                          ${link.title}
                        </a>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="empty-state" style="padding: 4rem;">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--surface-700); margin-bottom: 1rem;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          <h3 style="color: white; font-size: 1.125rem; margin-bottom: 0.5rem;">Ничего не найдено</h3>
          <p>Попробуйте изменить параметры поиска</p>
        </div>
      `}
    </div>
  `;
}
function searchMaterials(query) {
  materialsSearchQuery = query;
  renderMaterials();
}
function clearMaterialsSearch() {
  materialsSearchQuery = '';
  renderMaterials();
}
function filterMaterials(category) {
  materialsCategory = category;
  renderMaterials();
}
function toggleMaterial(id) {
  expandedMaterialId = expandedMaterialId === id ? null : id;
  renderMaterials();
}
// ===== Schedule =====
let scheduleFilter = 'all';
let showAddForm = false;
function renderSchedule() {
  const now = new Date();
  
  const stats = {
    total: deadlines.length,
    active: deadlines.filter(d => !d.completed && new Date(d.dueDate) >= now).length,
    completed: deadlines.filter(d => d.completed).length,
    overdue: deadlines.filter(d => !d.completed && new Date(d.dueDate) < now).length
  };
  
  const filtered = deadlines.filter(d => {
    switch (scheduleFilter) {
      case 'active': return !d.completed && new Date(d.dueDate) >= now;
      case 'completed': return d.completed;
      case 'overdue': return !d.completed && new Date(d.dueDate) < now;
      default: return true;
    }
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
  
  document.getElementById('page-schedule').innerHTML = `
    <div class="page-content">
      <div class="schedule-header">
        <div class="page-header">
          <h1>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary-400)"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Расписание и дедлайны
          </h1>
          <p>Управляйте своими заданиями и сроками</p>
        </div>
        <button class="btn-chat" onclick="toggleAddForm()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Добавить задание
        </button>
      </div>
      
      <div class="schedule-stats">
        <div class="schedule-stat">
          <div class="schedule-stat-value primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${stats.total}
          </div>
          <div class="schedule-stat-label">Всего</div>
        </div>
        <div class="schedule-stat">
          <div class="schedule-stat-value blue">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${stats.active}
          </div>
          <div class="schedule-stat-label">Активные</div>
        </div>
        <div class="schedule-stat">
          <div class="schedule-stat-value green">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            ${stats.completed}
          </div>
          <div class="schedule-stat-label">Выполнено</div>
        </div>
        <div class="schedule-stat">
          <div class="schedule-stat-value red">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            ${stats.overdue}
          </div>
          <div class="schedule-stat-label">Просрочено</div>
        </div>
      </div>
      
      ${showAddForm ? `
        <div class="add-task-form">
          <h3 class="form-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Новое задание
          </h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Название *</label>
              <input type="text" id="task-title" placeholder="Лабораторная работа №5">
            </div>
            <div class="form-group">
              <label>Предмет</label>
              <input type="text" id="task-subject" placeholder="Программирование">
            </div>
            <div class="form-group">
              <label>Дата сдачи *</label>
              <input type="date" id="task-date">
            </div>
            <div class="form-group">
              <label>Приоритет</label>
              <select id="task-priority">
                <option value="high">Высокий</option>
                <option value="medium" selected>Средний</option>
                <option value="low">Низкий</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>Описание</label>
              <input type="text" id="task-description" placeholder="Краткое описание задания">
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-text" onclick="toggleAddForm()">Отмена</button>
            <button class="btn-primary" style="width: auto;" onclick="addTask()">Добавить</button>
          </div>
        </div>
      ` : ''}
      
      <div class="task-filters">
        <button class="filter-btn ${scheduleFilter === 'all' ? 'active' : ''}" onclick="setScheduleFilter('all')">Все</button>
        <button class="filter-btn ${scheduleFilter === 'active' ? 'active' : ''}" onclick="setScheduleFilter('active')">Активные</button>
        <button class="filter-btn ${scheduleFilter === 'completed' ? 'active' : ''}" onclick="setScheduleFilter('completed')">Выполненные</button>
        <button class="filter-btn ${scheduleFilter === 'overdue' ? 'active' : ''}" onclick="setScheduleFilter('overdue')">Просроченные</button>
      </div>
      
      ${filtered.length > 0 ? `
        <div class="task-list">
          ${filtered.map(d => {
            const isOverdue = !d.completed && new Date(d.dueDate) < now;
            return `
              <div class="task-item ${d.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}">
                <button class="task-checkbox ${d.completed ? 'checked' : ''}" onclick="toggleTask('${d.id}')">
                  ${d.completed ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                </button>
                <div class="task-priority ${d.priority}"></div>
                <div class="task-info">
                  <div class="task-title">${d.title}</div>
                  <div class="task-details">
                    <span class="task-subject">${d.subject}</span>
                    ${d.description ? `<span class="task-separator">·</span><span class="task-description">${d.description}</span>` : ''}
                  </div>
                </div>
                <div class="task-meta">
                  <span class="task-days">${d.completed ? '✓ Выполнено' : formatRelativeDate(d.dueDate)}</span>
                  <span class="task-date">${new Date(d.dueDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <button class="task-delete" onclick="deleteTask('${d.id}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            `;
          }).join('')}
        </div>
      ` : `
        <div class="empty-state" style="padding: 4rem;">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--surface-700); margin-bottom: 1rem;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <h3 style="color: white; font-size: 1.125rem; margin-bottom: 0.5rem;">Нет заданий</h3>
          <p>${scheduleFilter !== 'all' ? 'Нет заданий с таким фильтром' : 'Добавьте первое задание'}</p>
          ${scheduleFilter !== 'all' ? `<button class="btn-text" style="margin-top: 0.5rem; color: var(--primary-400);" onclick="setScheduleFilter('all')">Показать все</button>` : ''}
        </div>
      `}
    </div>
  `;
}
function toggleAddForm() {
  showAddForm = !showAddForm;
  renderSchedule();
}
function setScheduleFilter(filter) {
  scheduleFilter = filter;
  renderSchedule();
}
function addTask() {
  const title = document.getElementById('task-title').value.trim();
  const date = document.getElementById('task-date').value;
  
  if (!title || !date) {
    alert('Заполните название и дату');
    return;
  }
  
  deadlines.push({
    id: Date.now().toString(),
    title,
    subject: document.getElementById('task-subject').value.trim() || 'Без предмета',
    dueDate: new Date(date),
    priority: document.getElementById('task-priority').value,
    completed: false,
    description: document.getElementById('task-description').value.trim()
  });
  
  saveToStorage();
  showAddForm = false;
  renderSchedule();
}
function toggleTask(id) {
  const task = deadlines.find(d => d.id === id);
  if (task) {
    task.completed = !task.completed;
    saveToStorage();
    renderSchedule();
  }
}
function deleteTask(id) {
  deadlines = deadlines.filter(d => d.id !== id);
  saveToStorage();
  renderSchedule();
}
// ===== Profile =====
function renderProfile() {
  const initials = currentUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const totalMessages = chatMessages.filter(m => m.role === 'user').length;
  const completedTasks = deadlines.filter(d => d.completed).length;
  
  document.getElementById('page-profile').innerHTML = `
    <div class="page-content" style="max-width: 48rem;">
      <div class="page-header">
        <h1>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary-400)"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Личный кабинет
        </h1>
      </div>
      
      <div class="profile-card">
        <div class="profile-header">
          <div class="profile-avatar" style="background: ${currentUser.avatarColor}">${initials}</div>
          <div>
            <h2 class="profile-name">${currentUser.fullName}</h2>
            <p class="profile-username">@${currentUser.username}</p>
            <div class="profile-details">
              ${currentUser.email ? `
                <span class="profile-detail">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  ${currentUser.email}
                </span>
              ` : ''}
              <span class="profile-detail">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                Группа: ${currentUser.group}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="profile-stats">
        <div class="profile-stat">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary-400)"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <div class="profile-stat-value">${totalMessages}</div>
          <div class="profile-stat-label">Диалогов</div>
        </div>
        <div class="profile-stat">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--green-400)"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <div class="profile-stat-value">${completedTasks}</div>
          <div class="profile-stat-label">Выполнено</div>
        </div>
        <div class="profile-stat">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--accent-400)"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          <div class="profile-stat-value">${STUDY_MATERIALS.length}</div>
          <div class="profile-stat-label">Материалов</div>
        </div>
      </div>
      
      <div class="socratic-info">
        <div class="socratic-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          <h3>О сократическом методе</h3>
        </div>
        <p>Сократический метод — это метод обучения через диалог, названный в честь древнегреческого философа Сократа. Вместо прямых ответов используются наводящие вопросы, которые помогают ученику самостоятельно прийти к пониманию.</p>
        <div class="socratic-benefits">
          <div class="socratic-benefit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Развивает критическое мышление
          </div>
          <div class="socratic-benefit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Углубляет понимание материала
          </div>
          <div class="socratic-benefit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Формирует навык самообучения
          </div>
          <div class="socratic-benefit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Повышает запоминаемость
          </div>
        </div>
      </div>
      
      <div class="data-actions">
        <h3>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Управление данными
        </h3>
        <div class="actions-list">
          <button class="action-btn primary" onclick="exportDialogs()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <div class="action-info">
              <h4>Экспорт диалогов</h4>
              <p>Скачать историю чата в текстовом формате</p>
            </div>
          </button>
          <button class="action-btn danger" onclick="clearChatHistory()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            <div class="action-info">
              <h4>Очистить историю диалогов</h4>
              <p>Удалить все сообщения из чата (необратимое действие)</p>
            </div>
          </button>
        </div>
      </div>
      
      <div class="disclaimer">
        <p>⚠️ Это демо-версия платформы. В продакшене данные хранятся на сервере с шифрованием. ИИ-ассистент не даёт готовых ответов по этическим причинам. Все диалоги могут быть использованы для улучшения качества сервиса (с вашего согласия).</p>
      </div>
    </div>
  `;
}
function exportDialogs() {
  const content = chatMessages
    .map(m => `[${new Date(m.timestamp).toLocaleString('ru-RU')}] ${m.role === 'user' ? 'Студент' : 'Ассистент'}:\n${m.content}`)
    .join('\n\n---\n\n');
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dialog_${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
function clearChatHistory() {
  if (confirm('Вы уверены, что хотите удалить всю историю диалогов? Это действие необратимо.')) {
    chatMessages = [{
      id: 'welcome-' + Date.now(),
      role: 'assistant',
      content: 'История очищена. Я готов помочь вам разобраться в новой теме! 🎓\n\nС какой темой вам нужна помощь?',
      timestamp: new Date()
    }];
    saveToStorage();
    renderProfile();
  }
}