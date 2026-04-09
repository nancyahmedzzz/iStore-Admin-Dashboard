// 1. إعداد الأيقونات بأمان تام
function initializeIcons() {
    try {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    } catch (error) {
        console.error("Lucide Icons Error:", error);
    }
}

// 2. دوال مساعدة لضمان عمل الجافا سكريبت على بيئة Local بسلاسة تامة
window.themeConfig = {
    currentTheme: 'dark'
};

// تحصين جلب الـ Theme لمعالجة مشكلة الـ LocalStorage في الـ Chrome.
try {
    window.themeConfig.currentTheme = localStorage.getItem('theme') || 'dark';
} catch (e) {
    console.warn("LocalStorage Blocked.");
}

// 3. دالة التبديل العالمية للوضع الليلي والنهاري ( مربوطة مباشرة في أزرار HTML )
window.toggleTheme = function() {
    const htmlElement = document.documentElement;
    window.themeConfig.currentTheme = window.themeConfig.currentTheme === 'dark' ? 'light' : 'dark';
    
    if (window.themeConfig.currentTheme === 'dark') {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }

    try {
        localStorage.setItem('theme', window.themeConfig.currentTheme);
    } catch (e) {}

    // تحديث الشارتات إن وجدت
    if(typeof updateCharts === 'function') {
        updateCharts();
    }
}

// 4. دالة تبديل القائمة الجانبية في الشاشات الصغيرة
window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (!sidebar) return;

    const isHidden = sidebar.classList.contains('translate-x-full');
    
    if (isHidden) {
        // Show
        sidebar.classList.remove('translate-x-full');
        sidebar.classList.add('translate-x-0');
        if (overlay) {
            overlay.classList.remove('hidden');
            setTimeout(() => {
                overlay.classList.remove('opacity-0');
            }, 10);
        }
    } else {
        // Hide
        sidebar.classList.add('translate-x-full');
        sidebar.classList.remove('translate-x-0');
        if (overlay) {
            overlay.classList.add('opacity-0');
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 300);
        }
    }
}

// --- مساحة الرسوم البيانية ---
let salesChartInstance = null;
let categoryPieInstance = null;
let monthlyBarInstance = null;

function getChartColors() {
    const isDark = document.documentElement.classList.contains('dark');
    return {
        text: isDark ? '#94a3b8' : '#475569',
        grid: isDark ? '#1e293b' : '#e2e8f0',
        line: isDark ? '#34d399' : '#10b981', 
        lineSecondary: isDark ? '#f8fafc' : '#0f172a',
        bgOpacity1: isDark ? 'rgba(52, 211, 153, 0.2)' : 'rgba(16, 185, 129, 0.15)',
        bgOpacity2: isDark ? 'rgba(52, 211, 153, 0)' : 'rgba(16, 185, 129, 0)',
        pieColors: isDark 
            ? ['#34d399', '#f8fafc', '#94a3b8', '#1e293b'] 
            : ['#10b981', '#0f172a', '#475569', '#e2e8f0']
    };
}

window.initChart = function() {
    if (typeof Chart === 'undefined') {
        console.warn("Chart.js Not Loaded.");
        return;
    }

    try {
        const colors = getChartColors();
        Chart.defaults.font.family = 'Plus Jakarta Sans';
        Chart.defaults.color = colors.text;

        // Overview Chart
        const ctxSales = document.getElementById('salesChart');
        if (ctxSales && ctxSales.offsetParent !== null) {
            const grad = ctxSales.getContext('2d').createLinearGradient(0, 0, 0, 300);
            grad.addColorStop(0, colors.bgOpacity1);
            grad.addColorStop(1, colors.bgOpacity2);

            salesChartInstance = new Chart(ctxSales, {
                type: 'line',
                data: {
                    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس'],
                    datasets: [{
                        label: 'المبيعات ($)',
                        data: [85000, 121000, 98000, 142000, 128000, 181000, 169000, 215000],
                        borderColor: colors.line,
                        backgroundColor: grad,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: colors.line,
                        pointBorderColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 8
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    animation: { duration: 1500, easing: 'easeOutQuart' },
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: colors.text } },
                        y: { grid: { color: colors.grid, drawBorder: false }, ticks: { color: colors.text, callback: function(v) { return '$' + v / 1000 + 'k'; } } }
                    }
                }
            });
        }

        // Pie Chart
        const ctxPie = document.getElementById('categoryPie');
        if (ctxPie && ctxPie.offsetParent !== null) {
            categoryPieInstance = new Chart(ctxPie, {
                type: 'doughnut',
                data: {
                    labels: ['iPhone', 'MacBook', 'Apple Watch', 'AirPods'],
                    datasets: [{ data: [55, 25, 12, 8], backgroundColor: colors.pieColors, borderWidth: 0, hoverOffset: 10 }]
                },
                options: { responsive: true, maintainAspectRatio: false, cutout: '75%', animation: { animateScale: true } }
            });
        }

        // Bar Chart
        const ctxBar = document.getElementById('monthlyBar');
        if (ctxBar && ctxBar.offsetParent !== null) {
            monthlyBarInstance = new Chart(ctxBar, {
                type: 'bar',
                data: {
                    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
                    datasets: [
                        { label: 'مبيعات المعارض', data: [45, 62, 54, 76, 60, 85], backgroundColor: colors.line, borderRadius: 6 },
                        { label: 'الأونلاين', data: [35, 45, 42, 60, 52, 70], backgroundColor: colors.lineSecondary, borderRadius: 6 }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { grid: { color: colors.grid, drawBorder: false } } } }
            });
        }
    } catch (error) {
        console.error("Chart Rendering Error:", error);
    }
};

window.updateCharts = function() {
    if(salesChartInstance) salesChartInstance.destroy();
    if(categoryPieInstance) categoryPieInstance.destroy();
    if(monthlyBarInstance) monthlyBarInstance.destroy();
    setTimeout(window.initChart, 50);
}

// --- الإشعارات ---
window.toggleNotifications = function() {
    const panel = document.getElementById('notificationsPanel');
    if (!panel) return;
    
    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        setTimeout(() => {
            panel.classList.remove('opacity-0', 'translate-y-[-10px]');
            panel.classList.add('opacity-100', 'translate-y-0');
        }, 10);
    } else {
        panel.classList.remove('opacity-100', 'translate-y-0');
        panel.classList.add('opacity-0', 'translate-y-[-10px]');
        setTimeout(() => {
            panel.classList.add('hidden');
        }, 300);
    }
}

// إغلاق الإشعارات عند النقر خارجها
document.addEventListener('click', function(event) {
    const panel = document.getElementById('notificationsPanel');
    const bellBtn = event.target.closest('button[onclick="toggleNotifications()"]');
    
    if (panel && !panel.classList.contains('hidden') && !bellBtn && !panel.contains(event.target)) {
        window.toggleNotifications();
    }
});

// --- مركز الإشعارات الشامل (Drawer) ---
window.openAllNotifications = function() {
    const smallPanel = document.getElementById('notificationsPanel');
    if (smallPanel && !smallPanel.classList.contains('hidden')) {
        window.toggleNotifications();
    }
    
    const drawer = document.getElementById('allNotificationsDrawer');
    const content = document.getElementById('allNotificationsContent');
    if (!drawer || !content) return;
    
    drawer.classList.remove('hidden');
    setTimeout(() => {
        content.classList.remove('-translate-x-full');
        content.classList.add('translate-x-0');
    }, 10);
};

window.closeAllNotifications = function() {
    const drawer = document.getElementById('allNotificationsDrawer');
    const content = document.getElementById('allNotificationsContent');
    if (!drawer || !content) return;
    
    content.classList.remove('translate-x-0');
    content.classList.add('-translate-x-full');
    setTimeout(() => {
        drawer.classList.add('hidden');
    }, 300);
};

window.markAllNotificationsAsRead = function() {
    const list = document.getElementById('notificationsList');
    if (!list) return;
    
    list.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full py-20 opacity-0 scale-95 transition-all duration-500" id="emptyNotifications">
            <div class="w-20 h-20 bg-emerald-100 text-emerald-500 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                <i data-lucide="check-circle-2" class="w-10 h-10"></i>
            </div>
            <h4 class="text-base font-bold text-[var(--text-primary)]">لا توجد إشعارات جديدة</h4>
            <p class="text-sm text-[var(--text-secondary)] mt-2 text-center leading-relaxed">لقد قمت بمراجعة جميع التنبيهات والأحداث الخاصة بمتجرك.</p>
        </div>
    `;
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    setTimeout(() => {
        const emptyState = document.getElementById('emptyNotifications');
        if(emptyState) {
            emptyState.classList.remove('opacity-0', 'scale-95');
            emptyState.classList.add('opacity-100', 'scale-100');
        }
    }, 50);
    
    const redDots = document.querySelectorAll('span.bg-rose-500');
    redDots.forEach(dot => {
        dot.style.display = 'none';
    });
    
    const badges = document.querySelectorAll('span.bg-emerald-100');
    badges.forEach(badge => {
        if(badge.textContent.includes('جديد') && badge.classList.contains('px-2')) {
            badge.style.display = 'none';
        }
    });
};

// --- إضافة عميل جديد ---
window.openNewClientModal = function() {
    const modal = document.getElementById('newClientModal');
    const content = document.getElementById('newClientModalContent');
    if (!modal) return;
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
};

window.closeNewClientModal = function() {
    const modal = document.getElementById('newClientModal');
    const content = document.getElementById('newClientModalContent');
    if (!modal) return;
    
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
};

window.handleNewClientSubmit = function(e) {
    e.preventDefault();
    
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');
    
    if(btnText && btnLoader) {
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
    }
    
    setTimeout(() => {
        const name = document.getElementById('clientName').value;
        const email = document.getElementById('clientEmail').value;
        const products = document.getElementById('clientProducts').value;
        const amount = document.getElementById('clientAmount').value;
        
        const tableBody = document.querySelector('tbody');
        
        if(tableBody) {
            const formattedAmount = '$' + parseFloat(amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
            const newRow = document.createElement('tr');
            newRow.className = 'hover:bg-[var(--hover-bg)] group cursor-pointer transition-colors bg-emerald-500/10 transition-colors duration-500';
            
            newRow.innerHTML = `
                <td class="px-6 py-3">
                    <div class="flex items-center">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random" class="w-9 h-9 rounded-full ml-3 border border-[var(--border-color)]">
                        <span class="font-bold text-[var(--text-primary)]">${name}</span>
                    </div>
                </td>
                <td class="px-6 py-3 text-[var(--text-secondary)] font-en">${email}</td>
                <td class="px-6 py-3 font-en text-xs">
                    <div class="flex items-center gap-1">
                        <i data-lucide="shopping-bag" class="w-4 h-4 text-emerald-500"></i>
                        <span>${products}</span>
                    </div>
                </td>
                <td class="px-6 py-3 font-bold text-[var(--text-primary)] font-en">${formattedAmount}</td>
                <td class="px-6 py-3">
                    <span class="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 py-1 px-3 rounded-full text-[10px] font-bold">جديد</span>
                </td>
            `;
            
            tableBody.insertBefore(newRow, tableBody.firstChild);
            
            // Re-initialize icons for the newly added row
            if (typeof lucide !== 'undefined') {
                lucide.createIcons({
                    root: newRow
                });
            }
            
            setTimeout(() => {
                newRow.classList.remove('bg-emerald-500/10');
            }, 2000);
        }
        
        e.target.reset();
        if(btnText && btnLoader) {
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
        }
        closeNewClientModal();
        
    }, 800);
};

// --- الإقلاع الرئيسي المباشر للسكريبت بمجرد تحميل الصفحة ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. تهيئة الأيقونات
    initializeIcons();

    // 2. تطبيق الثيم الإفتراضي بقوة على DOM
    const htmlElement = document.documentElement;
    if (window.themeConfig.currentTheme === 'dark') {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }

    // 3. تهيئة الرسوم البيانية بأمان
    setTimeout(window.initChart, 150);
});
