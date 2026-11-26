// ==========================================================================
// Инициализация скриптов после загрузки DOM
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    initScrollSpy();
    initContactForm();
    initCalculator();
    initPortfolio();
    initProjectModal();
    initReviews();
});

// ==========================================================================
// 1. Управление темой (Светлая / Тёмная)
// ==========================================================================
function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn.querySelector('.theme-icon');

    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '☀️';
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeIcon.textContent = '🌙';
    }

    themeToggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeIcon.textContent = '🌙';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeIcon.textContent = '☀️';
        }
    });
}

// ==========================================================================
// 2. Мобильное меню (Burger)
// ==========================================================================
function initMobileMenu() {
    const burgerBtn = document.getElementById('burger-btn');
    const navLinks = document.getElementById('nav-links');
    const links = navLinks.querySelectorAll('.nav-link');

    burgerBtn.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('active');
        burgerBtn.classList.toggle('open', isOpen);
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            burgerBtn.classList.remove('open');
        });
    });

    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !burgerBtn.contains(e.target) && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            burgerBtn.classList.remove('open');
        }
    });
}

// ==========================================================================
// 3. Подсветка активного пункта навигации при скролле (ScrollSpy)
// ==========================================================================
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 120;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });
}

// ==========================================================================
// 4. Интерактивный Калькулятор стоимости и сроков
// ==========================================================================
function initCalculator() {
    const typeRadios = document.querySelectorAll('input[name="projectType"]');
    const radioCards = document.querySelectorAll('.radio-card');
    const pageRange = document.getElementById('page-range');
    const pageCountVal = document.getElementById('page-count-val');
    
    const optDesign = document.getElementById('opt-design');
    const optSeo = document.getElementById('opt-seo');
    const optPay = document.getElementById('opt-pay');
    const optUrgent = document.getElementById('opt-urgent');

    const priceEl = document.getElementById('calc-total-price');
    const daysEl = document.getElementById('calc-total-days');
    const breakdownEl = document.getElementById('calc-breakdown');
    const applyBtn = document.getElementById('calc-apply-btn');

    const projectTypeNames = {
        landing: 'Лендинг',
        corporate: 'Корпоративный сайт',
        ecommerce: 'Интернет-магазин',
        webapp: 'Веб-сервис'
    };

    function calculate() {
        let selectedType = 'landing';
        let basePrice = 15000;
        let baseDays = 3;

        typeRadios.forEach(radio => {
            if (radio.checked) {
                selectedType = radio.value;
                basePrice = parseInt(radio.getAttribute('data-price'), 10);
                baseDays = parseInt(radio.getAttribute('data-days'), 10);
            }
        });

        radioCards.forEach(card => {
            const radio = card.querySelector('input');
            card.classList.toggle('active', radio.checked);
        });

        // Расчет страниц (каждая страница выше 1 добавляет 2500 руб и 0.5 дня)
        const pages = parseInt(pageRange.value, 10);
        pageCountVal.textContent = pages;
        const extraPages = Math.max(0, pages - 1);
        const pagesPrice = extraPages * 2500;
        const pagesDays = Math.ceil(extraPages * 0.5);

        // Дополнительные опции
        let optionsPrice = 0;
        let optionsDays = 0;
        const selectedOptions = [];

        if (optDesign.checked) {
            optionsPrice += parseInt(optDesign.getAttribute('data-price'), 10);
            optionsDays += parseInt(optDesign.getAttribute('data-days'), 10);
            selectedOptions.push('Индивидуальный UI/UX дизайн');
        }
        if (optSeo.checked) {
            optionsPrice += parseInt(optSeo.getAttribute('data-price'), 10);
            optionsDays += parseInt(optSeo.getAttribute('data-days'), 10);
            selectedOptions.push('SEO-оптимизация и аналитика');
        }
        if (optPay.checked) {
            optionsPrice += parseInt(optPay.getAttribute('data-price'), 10);
            optionsDays += parseInt(optPay.getAttribute('data-days'), 10);
            selectedOptions.push('Онлайн-оплата и CRM');
        }

        let totalPrice = basePrice + pagesPrice + optionsPrice;
        let totalDays = baseDays + pagesDays + optionsDays;

        // Срочность (+25% стоимости, -40% срока)
        if (optUrgent.checked) {
            totalPrice = Math.round(totalPrice * 1.25);
            totalDays = Math.max(1, Math.round(totalDays * 0.6));
            selectedOptions.push('Срочный запуск (-40% времени)');
        }

        // Обновляем числа
        animateNumber(priceEl, totalPrice);
        daysEl.textContent = totalDays;

        // Обновляем разбивку
        breakdownEl.innerHTML = `
            <div class="breakdown-row"><span>Тип:</span><strong>${projectTypeNames[selectedType]}</strong></div>
            <div class="breakdown-row"><span>Объем:</span><strong>${pages} ${declensionPages(pages)}</strong></div>
            ${selectedOptions.length ? `<div class="breakdown-row"><span>Опции:</span><strong>${selectedOptions.length} выбрано</strong></div>` : ''}
        `;

        return {
            typeName: projectTypeNames[selectedType],
            pages,
            selectedOptions,
            totalPrice,
            totalDays
        };
    }

    // Слушатели событий калькулятора
    typeRadios.forEach(r => r.addEventListener('change', calculate));
    pageRange.addEventListener('input', calculate);
    [optDesign, optSeo, optPay, optUrgent].forEach(el => el.addEventListener('change', calculate));

    // Кнопка "Оформить заказ с этим расчетом"
    applyBtn.addEventListener('click', () => {
        const data = calculate();
        const messageInput = document.getElementById('message');
        const nameInput = document.getElementById('name');

        const optionsText = data.selectedOptions.length 
            ? `\n- Доп. опции: ${data.selectedOptions.join(', ')}` 
            : '';

        messageInput.value = `Здравствуйте! Меня интересует расчет сайта:
- Тип проекта: ${data.typeName}
- Количество страниц: ${data.pages}
- Ориентировочный бюджет: ${data.totalPrice.toLocaleString('ru-RU')} ₽
- Желаемый срок: ${data.totalDays} раб. дней${optionsText}

Хотелось бы обсудить подробности!`;

        // Плавный скролл к форме и фокус
        const contactSection = document.getElementById('contact');
        contactSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
            nameInput.focus();
        }, 600);
    });

    // Первый расчет при загрузке
    calculate();
}

// Вспомогательная анимация чисел
function animateNumber(element, finalValue) {
    const startValue = parseInt(element.textContent.replace(/\s+/g, ''), 10) || 0;
    if (startValue === finalValue) return;

    const duration = 300;
    const startTime = performance.now();

    function update(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const current = Math.floor(startValue + (finalValue - startValue) * progress);
        element.textContent = current.toLocaleString('ru-RU');
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}

function declensionPages(n) {
    if (n % 10 === 1 && n % 100 !== 11) return 'страница';
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'страницы';
    return 'страниц';
}

// ==========================================================================
// 5. Фильтрация, живой поиск и лайки проектов
// ==========================================================================
function initPortfolio() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('project-search');
    const clearBtn = document.getElementById('search-clear');
    const projectCards = document.querySelectorAll('.project-card');
    const noResultsMsg = document.getElementById('no-projects-msg');

    let currentFilter = 'all';

    function applyFilterAndSearch() {
        const query = searchInput.value.trim().toLowerCase();
        let visibleCount = 0;

        clearBtn.classList.toggle('visible', query.length > 0);

        projectCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const title = card.querySelector('h3').textContent.toLowerCase();
            const desc = card.querySelector('p').textContent.toLowerCase();

            const matchesFilter = (currentFilter === 'all' || category === currentFilter);
            const matchesSearch = (!query || title.includes(query) || desc.includes(query));

            if (matchesFilter && matchesSearch) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        noResultsMsg.classList.toggle('hidden', visibleCount > 0);
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            applyFilterAndSearch();
        });
    });

    searchInput.addEventListener('input', applyFilterAndSearch);
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        applyFilterAndSearch();
        searchInput.focus();
    });

    // Система лайков с сохранением в LocalStorage
    initLikes();
}

function initLikes() {
    const likeButtons = document.querySelectorAll('.like-btn');
    const savedLikes = JSON.parse(localStorage.getItem('user_project_likes') || '{}');

    likeButtons.forEach(btn => {
        const card = btn.closest('.project-card');
        const projectId = card.getAttribute('data-id');
        const countSpan = btn.querySelector('.like-count');
        const iconSpan = btn.querySelector('.like-icon');

        let currentLikes = parseInt(countSpan.textContent, 10);

        if (savedLikes[projectId]) {
            btn.classList.add('liked');
            iconSpan.textContent = '❤️';
            countSpan.textContent = currentLikes + 1;
        }

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isLiked = btn.classList.toggle('liked');
            let count = parseInt(countSpan.textContent, 10);

            if (isLiked) {
                count += 1;
                iconSpan.textContent = '❤️';
                savedLikes[projectId] = true;
            } else {
                count = Math.max(0, count - 1);
                iconSpan.textContent = '🤍';
                delete savedLikes[projectId];
            }

            countSpan.textContent = count;
            localStorage.setItem('user_project_likes', JSON.stringify(savedLikes));
        });
    });
}

// ==========================================================================
// 6. Модальное окно просмотра деталей проекта
// ==========================================================================
function initProjectModal() {
    const modal = document.getElementById('project-modal');
    const closeBtn = document.getElementById('modal-close');
    const dismissBtn = document.getElementById('modal-dismiss-btn');
    const orderBtn = document.getElementById('modal-order-btn');
    const openBtns = document.querySelectorAll('.open-modal-btn');

    const modalBanner = document.getElementById('modal-banner');
    const modalTag = document.getElementById('modal-tag');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalTech = document.getElementById('modal-tech');

    const projectsData = {
        '1': {
            title: 'Эко-магазин товаров',
            tag: 'Landing Page',
            gradient: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
            desc: 'Комплексный промо-сайт для экологичного бренда с витриной натуральной продукции. Включает корзину покупок без перезагрузки страницы, калькулятор доставки и интеграцию с мессенджерами для мгновенного подтверждения заказа.',
            tech: ['HTML5', 'CSS Grid', 'JavaScript', 'LocalStorage', 'Responsive Design']
        },
        '2': {
            title: 'Финансовый трекер',
            tag: 'Web App',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            desc: 'Веб-приложение для планирования личного бюджета. Поддерживает разделение по категориям расходов, фильтрацию по датам, интерактивные круговые диаграммы и сохранение финансовой истории.',
            tech: ['React', 'Chart.js', 'LocalStorage', 'CSS Modules', 'Web Storage API']
        },
        '3': {
            title: 'IT Консалтинг',
            tag: 'Corporate',
            gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
            desc: 'Многостраничный корпоративный сайт международной компании. Разработаны интерактивные прайс-листы, форма заказа бесплатного аудита, блог экспертных статей и мультиязычный интерфейс.',
            tech: ['TypeScript', 'SCSS', 'REST API', 'Figma', 'SEO Architecture']
        },
        '4': {
            title: 'Генератор резюме',
            tag: 'Web App',
            gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            desc: 'Удобный онлайн-конструктор резюме с готовыми шаблонами оформления, предпросмотром правок в реальном времени и моментальной генерацией PDF-документа для скачивания.',
            tech: ['Vue.js', 'PDFKit', 'Tailwind CSS', 'Drag & Drop API']
        }
    };

    function openModal(id) {
        const data = projectsData[id];
        if (!data) return;

        modalBanner.style.background = data.gradient;
        modalTag.textContent = data.tag;
        modalTitle.textContent = data.title;
        modalDesc.textContent = data.desc;

        modalTech.innerHTML = data.tech
            .map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`)
            .join('');

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        orderBtn.onclick = () => {
            closeModal();
            const messageInput = document.getElementById('message');
            messageInput.value = `Здравствуйте! Меня заинтересовал ваш проект "${data.title}". Хочу заказать разработку похожего сайта.`;
        };
    }

    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    openBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-project');
            openModal(id);
        });
    });

    closeBtn.addEventListener('click', closeModal);
    dismissBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

// ==========================================================================
// 7. Интерактивные отзывы с LocalStorage и рейтингом
// ==========================================================================
function initReviews() {
    const reviewsList = document.getElementById('reviews-list');
    const form = document.getElementById('add-review-form');
    const authorInput = document.getElementById('review-author');
    const textInput = document.getElementById('review-text');
    const starContainer = document.getElementById('star-rating');
    const stars = starContainer.querySelectorAll('.star');

    let currentRating = 5;

    // Начальные отзывы
    const defaultReviews = [
        {
            author: 'Михаил Романов, СЕО стартапа TechPulse',
            rating: 5,
            text: 'Отличная скорость разработки и внимание к мелочам. Сайт запустился раньше срока и показал отличную конверсию в первую же неделю.',
            date: '18 ноября 2026'
        },
        {
            author: 'Елена Воронина, Владелец эко-бренда',
            rating: 5,
            text: 'Очень понравился онлайн-калькулятор и адаптивность сайта на iPhone. Клиенты отмечают, что заказывать стало в разы удобнее.',
            date: '10 ноября 2026'
        }
    ];

    function getReviews() {
        const saved = localStorage.getItem('site_user_reviews');
        return saved ? JSON.parse(saved) : defaultReviews;
    }

    function saveReviews(reviews) {
        localStorage.setItem('site_user_reviews', JSON.stringify(reviews));
    }

    function renderReviews() {
        const reviews = getReviews();
        reviewsList.innerHTML = reviews.map(r => `
            <div class="review-card">
                <div class="review-header">
                    <span class="review-author">${escapeHtml(r.author)}</span>
                    <span class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                </div>
                <p class="review-text">${escapeHtml(r.text)}</p>
                <span class="review-date">${escapeHtml(r.date)}</span>
            </div>
        `).join('');
    }

    // Выбор рейтинга звездами
    stars.forEach(star => {
        star.addEventListener('click', () => {
            currentRating = parseInt(star.getAttribute('data-rating'), 10);
            updateStars(currentRating);
        });

        star.addEventListener('mouseenter', () => {
            const hoverRating = parseInt(star.getAttribute('data-rating'), 10);
            updateStars(hoverRating);
        });
    });

    starContainer.addEventListener('mouseleave', () => {
        updateStars(currentRating);
    });

    function updateStars(rating) {
        stars.forEach(s => {
            const r = parseInt(s.getAttribute('data-rating'), 10);
            s.classList.toggle('active', r <= rating);
        });
    }

    // Добавление отзыва
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const author = authorInput.value.trim();
        const text = textInput.value.trim();
        if (!author || !text) return;

        const newReview = {
            author,
            rating: currentRating,
            text,
            date: 'Только что'
        };

        const reviews = getReviews();
        reviews.unshift(newReview);
        saveReviews(reviews);
        renderReviews();

        form.reset();
        currentRating = 5;
        updateStars(5);

        // Показываем подтверждение
        alert('Спасибо за ваш отзыв! Он успешно добавлен.');
    });

    renderReviews();
}

// ==========================================================================
// 8. Обработка формы контактов с реальной отправкой на почту
// ==========================================================================
function initContactForm() {
    const form = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');
    const submitBtn = form.querySelector('.submit-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');

        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';

        try {
            const response = await fetch('https://formsubmit.co/ajax/metrazh2000@mail.ru', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    'Имя': nameInput.value,
                    'Email клиента': emailInput.value,
                    'Текст сообщения': messageInput.value,
                    _subject: `Новая заявка с сайта от ${nameInput.value}`,
                    _template: 'table',
                    _captcha: 'false'
                })
            });

            const result = await response.json();

            if (response.ok && result.success !== 'false') {
                feedback.className = 'form-feedback success';
                feedback.innerHTML = `✅ Спасибо, <strong>${escapeHtml(nameInput.value)}</strong>! Ваша заявка успешно отправлена на <code>metrazh2000@mail.ru</code>.<br><small style="opacity: 0.85;">(Если это первая отправка, проверьте почту metrazh2000@mail.ru и подтвердите активацию письма в 1 клик)</small>`;
                feedback.classList.remove('hidden');
                form.reset();
            } else {
                throw new Error(result.message || 'Не удалось отправить форму');
            }
        } catch (error) {
            feedback.className = 'form-feedback error';
            feedback.innerHTML = `⚠️ Ошибка отправки: ${escapeHtml(error.message || 'Проверьте подключение к сети')}`;
            feedback.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;

            setTimeout(() => {
                feedback.classList.add('hidden');
            }, 9000);
        }
    });
}

// Функция для безопасного вывода текста (XSS защита)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
