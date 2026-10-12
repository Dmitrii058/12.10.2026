// =========================================================================
// ЧАСТЬ 1: ПОДКЛЮЧЕНИЕ БАЗЫ, СИНХРОНИЗАЦИЯ ГОРОДОВ И СЕЛЕКТОР МЕНЕДЖЕРА
// =========================================================================

let contractorsDatabase = getGlobalDatabase(); 
let currentSelectedKey = "none";

document.addEventListener('DOMContentLoaded', () => {
    localStorage.setItem('am_user_role', 'client');

    const citySelector = document.getElementById('city-selector');
    if (citySelector) {
        const savedCity = localStorage.getItem('selectedCity') || 'Москва';
        citySelector.value = savedCity;
        citySelector.addEventListener('change', (e) => {
            localStorage.setItem('selectedCity', e.target.value);
        });
    }

    syncMemoryToDatabase();
    renderManagerSelectOptions();
});

function renderManagerSelectOptions() {
    const selector = document.getElementById('global-client-selector');
    if (!selector) return;
    
    selector.innerHTML = '<option value="none" selected disabled>-- Выберите клиента из списка --</option>';
    Object.keys(contractorsDatabase).forEach(emailKey => {
        const client = contractorsDatabase[emailKey];
        const option = document.createElement('option');
        option.value = emailKey;
        option.textContent = `${emailKey} (${client.name})`;
        selector.appendChild(option);
    });
}

function syncMemoryToDatabase() {
    const ivanEmail = "123456@mail.ru";
    if (localStorage.getItem('am_user_name') && contractorsDatabase[ivanEmail]) {
        contractorsDatabase[ivanEmail].name = localStorage.getItem('am_user_name');
        contractorsDatabase[ivanEmail].balance = parseInt(localStorage.getItem('am_user_balance') || '45200');
        if (localStorage.getItem('am_user_phone')) {
            contractorsDatabase[ivanEmail].phone = localStorage.getItem('am_user_phone');
        }
    }
}

// =========================================================================
// ЧАСТЬ 2: ОТОБРАЖЕНИЕ КАРТОЧКИ КЛИЕНТА, СПИСКА ТИКЕТОВ И ТАБЛИЦЫ ЗАКАЗОВ
// =========================================================================

function onSelectContractor() {
    const selector = document.getElementById('global-client-selector');
    currentSelectedKey = selector.value;

    if (currentSelectedKey === 'none') return;

    const data = contractorsDatabase[currentSelectedKey];

    document.getElementById('cfg-client-name').value = data.name;
    document.getElementById('cfg-client-phone').value = data.phone;
    document.getElementById('cfg-client-balance').value = data.balance;

    renderClientTickets(data.tickets);
    renderClientOrders(data.orders);

    document.getElementById('manager-workspace').style.display = 'block';
}

function renderClientTickets(tickets) {
    const listWrapper = document.getElementById('tickets-list-wrapper');
    const emptyState = document.getElementById('tickets-empty-state');

    if (!listWrapper) return;
    listWrapper.innerHTML = '';

    if (!tickets || tickets.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        listWrapper.style.display = 'none';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    listWrapper.style.display = 'flex';
    listWrapper.style.flexDirection = 'column';
    listWrapper.style.gap = '12px';

    tickets.forEach(t => {
        const div = document.createElement('div');
        div.className = 'ticket-inline-card';
        div.style.background = '#f8fafc';
        div.style.border = '1px solid #e2e8f0';
        div.style.padding = '12px';
        div.style.borderRadius = '8px';
        div.style.borderLeft = '4px solid #ea580c';
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; font-size:12px; color:#64748b; margin-bottom:4px;">
                <span>📍 Филиал: <strong>${t.city || 'Москва'}</strong></span>
                <span style="color:#ea580c; font-weight:bold;">● В обработке</span>
            </div>
            <p style="font-size:14px; color:#0f172a; line-height:1.4; margin: 0;">${t.text}</p>
        `;
        listWrapper.appendChild(div);
    });
}

function renderClientOrders(orders) {
    const tbody = document.getElementById('manager-orders-rows-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!orders || orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="padding:20px; text-align:center; color:#94a3b8; font-weight:600;">У данного клиента нет активных заказов.</td></tr>`;
        return;
    }

    orders.forEach((order, index) => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = "1px solid #e2e8f0";
        
        let statusBadge = '';
        let actionButton = '';

        if (order.status === "Создан") {
            statusBadge = `<span class="badge-status-created">Создан</span>`;
            actionButton = `<button class="btn-next-step" onclick="changeStatusStep('${index}', 'К отгрузке')">В отгрузку →</button>`;
        } else if (order.status === "К отгрузке") {
            statusBadge = `<span class="badge-status-shipping">К отгрузке</span>`;
            actionButton = `<button class="btn-next-step" style="background:#0c56ea;" onclick="changeStatusStep('${index}', 'Выдать')">Перевести в "Выдать" →</button>`;
        } else if (order.status === "Выдать") {
            statusBadge = `<span class="badge-status-ready">Готов к выдаче</span>`;
            actionButton = `<button class="btn-next-success" onclick="transferToSalesArchive('${index}')">📦 Выдать товар</button>`;
        }

        tr.innerHTML = `
            <td style="padding: 12px;"><strong style="color:#ea580c;">${order.id}</strong></td>
            <td style="padding: 12px; font-weight:600; color:#0f172a;">${order.title}</td>
            <td style="padding: 12px; font-family:monospace; font-weight:bold; color:#475569;">${order.article}</td>
            <td style="padding: 12px; font-weight:700; color:#0f172a;">${order.price.toLocaleString()} ₽</td>
            <td style="padding: 12px;">${statusBadge}</td>
            <td style="padding: 12px; text-align:center;">${actionButton}</td>
        `;
        tbody.appendChild(tr);
    });
}

// =========================================================================
// ЧАСТЬ 3: БИЗНЕС-ЛОГИКА СТАТУСОВ, ВЫДАЧА В АРХИВ И СОХРАНЕНИЕ КАРТОЧКИ
// =========================================================================

function changeStatusStep(index, nextStatus) {
    if (contractorsDatabase[currentSelectedKey] && contractorsDatabase[currentSelectedKey].orders[index]) {
        contractorsDatabase[currentSelectedKey].orders[index].status = nextStatus;
        
        saveGlobalDatabase(contractorsDatabase);
        renderClientOrders(contractorsDatabase[currentSelectedKey].orders);
        showNoticeAlert(`Статус товара успешно обновлен до: "${nextStatus}"`);
    }
}

function transferToSalesArchive(index) {
    if (contractorsDatabase[currentSelectedKey] && contractorsDatabase[currentSelectedKey].orders[index]) {
        const completedOrder = contractorsDatabase[currentSelectedKey].orders[index];
        let globalSales = JSON.parse(localStorage.getItem('am_sales_archive')) || [];
        
        const newSaleRecord = {
            date: new Date().toLocaleDateString('ru-RU'),
            client: contractorsDatabase[currentSelectedKey].name,
            title: completedOrder.title,
            article: completedOrder.article,
            qty: "1 шт.",
            price: `${completedOrder.price.toLocaleString()} ₽`
        };

        globalSales.unshift(newSaleRecord);
        localStorage.setItem('am_sales_archive', JSON.stringify(globalSales));

        contractorsDatabase[currentSelectedKey].orders.splice(index, 1);
        
        saveGlobalDatabase(contractorsDatabase);
        renderClientOrders(contractorsDatabase[currentSelectedKey].orders);
        showNoticeAlert(`🎉 Заказ успешно ВЫДАН! Сделка перенесена в раздел «Продажи (Архив сделок)»!`);
    }
}

function saveClientCard(event) {
    event.preventDefault();
    if (currentSelectedKey === 'none') return;

    const nameVal = document.getElementById('cfg-client-name').value.trim();
    const phoneVal = document.getElementById('cfg-client-phone').value.trim();
    const balanceVal = document.getElementById('cfg-client-balance').value.trim();

    contractorsDatabase[currentSelectedKey].name = nameVal;
    contractorsDatabase[currentSelectedKey].phone = phoneVal;
    contractorsDatabase[currentSelectedKey].balance = parseInt(balanceVal || '0');

    saveGlobalDatabase(contractorsDatabase);

    if (currentSelectedKey === '123456@mail.ru') {
        localStorage.setItem('am_user_name', nameVal);
        localStorage.setItem('am_user_balance', balanceVal);
        localStorage.setItem('am_user_phone', phoneVal);
    }

    renderManagerSelectOptions();
    document.getElementById('global-client-selector').value = currentSelectedKey;

    showNoticeAlert(`Данные клиента ${nameVal} успешно сохранены во всей системе!`);
}

function showNoticeAlert(msg) {
    const alertBox = document.getElementById('sandbox-alert');
    const alertText = document.getElementById('sandbox-alert-text');
    if (alertBox && alertText) {
        alertText.textContent = msg;
        alertBox.style.display = 'flex';
        setTimeout(() => alertBox.style.display = 'none', 3000);
    } else {
        alert(msg);
    }
}
