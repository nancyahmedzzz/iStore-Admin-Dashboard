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
