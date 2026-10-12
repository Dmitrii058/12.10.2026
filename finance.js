document.addEventListener('DOMContentLoaded', () => {
    const greeting = document.getElementById('nav-user-greeting');
    const navBalance = document.getElementById('nav-user-balance');
    const citySelector = document.getElementById('city-selector');

    // 1. МГНОВЕННЫЙ ВЫВОД ДАННЫХ КЛИЕНТА (Сразу перезаписывает "Загрузка...")
    if (greeting) {
        greeting.innerText = 'Добрый день, Иван Иванович!';
    }
    if (navBalance) {
        navBalance.innerText = '45 200 ₽';
    }

    // 2. СИНХРОНИЗАЦИЯ ГОРОДА ПОЛОЖЕНИЯ КЛИЕНТА
    if (citySelector) {
        const savedCity = localStorage.getItem('selectedCity');
        if (savedCity) {
            citySelector.value = savedCity;
        }
        citySelector.addEventListener('change', (e) => {
            localStorage.setItem('selectedCity', e.target.value);
        });
    }

    // 3. ЖИВОЙ ПОИСК ПО ФИНАНСОВЫМ ДОКУМЕНТАМ
    const searchInput = document.getElementById('finance-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchText = this.value.toLowerCase().trim();
            const rows = document.querySelectorAll('#finance-history-rows tr');
            
            rows.forEach(row => {
                const rowText = row.textContent.toLowerCase();
                if (rowText.includes(searchText)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
});

// Переключение интерактивных вкладок (История операций / График платежей)
function switchFinanceTab(tabId) {
    document.querySelectorAll('.finance-tab-btn').forEach(btn => {
        btn.style.background = '#ffffff';
        btn.style.color = '#0f172a';
        btn.style.border = '1px solid #cbd5e1';
    });
    
    document.querySelectorAll('.finance-screen-content').forEach(content => content.style.display = 'none');

    const currentBtn = document.getElementById(`tab-btn-${tabId}`);
    if (currentBtn) {
        currentBtn.style.background = '#ea580c';
        currentBtn.style.color = '#ffffff';
        currentBtn.style.border = 'none';
    }
    
    const currentContent = document.getElementById(`finance-tab-content-${tabId}`);
    if (currentContent) currentContent.style.display = 'block';
}

function handleLogout(e) { 
    e.preventDefault(); 
    localStorage.clear();
    alert('Выход из учетной записи АвтоМаркет...'); 
    window.location.href = 'index.html';
}
