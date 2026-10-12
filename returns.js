// База данных деталей для заказов
const ordersDatabase = {
    "AM-785112": [
        { id: "p1", name: "Фильтр масляный MANN-FILTER", article: "W 610/3", price: 850 },
        { id: "p2", name: "Свеча зажигания NGK BKR6E-11", article: "2756", price: 350 },
        { id: "p3", name: "Колодки тормозные передние Brembo", article: "P 85 020", price: 2000 }
    ],
    "AM-764301": [
        { id: "p4", name: "Амортизатор передний KYB Excel-G", article: "334812", price: 5800 },
        { id: "p5", name: "Комплект ремня ГРМ Gates", article: "K015671XS", price: 8700 }
    ]
};

let activeOrderId = null;
let selectedPartsMap = {}; // Хранит выбранные галочки деталей

document.addEventListener('DOMContentLoaded', () => {
    // Настройка города
    const citySelector = document.getElementById('city-selector');
    if (citySelector) {
        const savedCity = localStorage.getItem('selectedCity');
        if (savedCity) citySelector.value = savedCity;
        citySelector.addEventListener('change', (e) => {
            localStorage.setItem('selectedCity', e.target.value);
        });
    }

    // Данные профиля
    const greeting = document.getElementById('nav-user-greeting');
    const balance = document.getElementById('nav-user-balance');
    if (greeting) greeting.innerText = 'Добрый день, Иван Иванович!';
    if (balance) balance.innerText = '45 300 ₽';
});

// Клик по строке главной таблицы заказов (Ваша оригинальная функция с галочкой)
function toggleOrderRow(orderId) {
    // Очищаем прошлые галочки у других заказов, если выбрали новый
    if (activeOrderId && activeOrderId !== orderId) {
        const oldIndicator = document.getElementById('check-indicator-' + activeOrderId);
        if (oldIndicator) {
            oldIndicator.innerText = '';
            oldIndicator.style.background = 'transparent';
        }
        selectedPartsMap = {}; 
    }

    activeOrderId = orderId;
    const indicator = document.getElementById('check-indicator-' + orderId);
    
    if (indicator) {
        if (indicator.innerText === '✓') {
            // Если снимаем галочку с заказа — прячем блок деталей
            indicator.innerText = '';
            indicator.style.background = 'transparent';
            document.getElementById('parts-selection-block').style.display = 'none';
            activeOrderId = null;
        } else {
            // Если ставим галочку на заказ — красим её и загружаем артикулы
            indicator.innerText = '✓';
            indicator.style.background = '#ea580c';
            indicator.style.color = 'white';
            indicator.style.display = 'inline-block';
            indicator.style.width = '20px';
            indicator.style.height = '20px';
            indicator.style.borderRadius = '4px';
            indicator.style.lineHeight = '20px';
            
            loadOrderParts(orderId);
        }
    }
}

// Загрузка списка деталей конкретного выбранного заказа
function loadOrderParts(orderId) {
    document.getElementById('parts-block-title').innerText = `Выберите позиции внутри заказа № ${orderId} для возврата:`;
    const container = document.getElementById('parts-list-container');
    container.innerHTML = '';
    
    const parts = ordersDatabase[orderId] || [];
    
    parts.forEach(part => {
        const partRow = document.createElement('div');
        partRow.className = 'part-item-row';
        partRow.setAttribute('onclick', `togglePartCheckbox('${part.id}', ${part.price})`);
        
        partRow.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span class="part-checkbox-indicator" id="part-check-${part.id}"></span>
                <div>
                    <strong style="color: #0f172a;">${part.name}</strong>
                    <div style="color: #64748b; font-size: 13px;">Артикул: ${part.article}</div>
                </div>
            </div>
            <div style="font-weight: 700; color: #0f172a;">${part.price} ₽</div>
        `;
        container.appendChild(partRow);
    });

    document.getElementById('return-total-amount').innerText = '0 ₽';
    document.getElementById('parts-selection-block').style.display = 'block';
}

// Клик по галочке внутри артикула заказа
function togglePartCheckbox(partId, price) {
    const check = document.getElementById(`part-check-${partId}`);
    if (check) {
        if (check.innerText === '✓') {
            check.innerText = '';
            check.style.background = '#ffffff';
            check.style.color = '#000000';
            delete selectedPartsMap[partId];
        } else {
            check.innerText = '✓';
            check.style.background = '#ea580c';
            check.style.color = '#ffffff';
            check.style.borderColor = '#ea580c';
            selectedPartsMap[partId] = price;
        }
        calculatePartsTotal();
    }
}

// Подсчет суммы выбранных артикулов
function calculatePartsTotal() {
    let total = 0;
    for (let key in selectedPartsMap) {
        total += selectedPartsMap[key];
    }
    document.getElementById('return-total-amount').innerText = `${total.toLocaleString()} ₽`;
}

// Кнопка "Оформить возврат"
function submitReturnForm() {
    const keys = Object.keys(selectedPartsMap);
    if (keys.length === 0) {
        alert('Пожалуйста, выберите галочкой хотя бы один артикул внутри заказа!');
        return;
    }

    const reason = document.getElementById('return-reason').value;
    const alertBlock = document.getElementById('return-alert');
    const alertText = document.getElementById('alert-text');

    alertText.innerHTML = `Заявка на возврат по заказу <strong>№ ${activeOrderId}</strong> успешно отправлена! Выбрано деталей: ${keys.length} шт. Причина: "${reason}".`;
    alertBlock.style.display = 'flex';
    
    // Сбрасываем форму
    const indicator = document.getElementById('check-indicator-' + activeOrderId);
    if (indicator) {
        indicator.innerText = '';
        indicator.style.background = 'transparent';
    }
    document.getElementById('parts-selection-block').style.display = 'none';
    activeOrderId = null;
    selectedPartsMap = {};
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleLogout(e) { e.preventDefault(); alert('Выход...'); }
