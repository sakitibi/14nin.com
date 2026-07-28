function applySeasonalTheme() {
    const month = new Date().getMonth() + 1;
    const root = document.documentElement;
    
    // デフォルト設定
    let theme = { 
        primary: '#00d2ff', 
        bgMain: '#f0f9ff', 
        isDark: false 
    };

    // 季節ごとのカラー定義
    switch (true) {
        case (month === 1 || month === 2): // 1-2月: 白・水色
            theme = { primary: '#81d4fa', bgMain: '#ffffff', isDark: false };
            break;
        case (month === 3 || month === 4): // 3-4月: ピンク
            theme = { primary: '#f48fb1', bgMain: '#fff5f8', isDark: false };
            break;
        case (month === 5 || month === 6): // 5-6月: 新緑色
            theme = { primary: '#81c784', bgMain: '#f1f8e9', isDark: false };
            break;
        case (month === 7 || month === 8): // 7-8月: 葉緑色
            theme = { primary: '#2e7d32', bgMain: '#edf7ed', isDark: false };
            break;
        case (month === 9 || month === 11): // 9,11月: オレンジ
            theme = { primary: '#ff9800', bgMain: '#fff8f0', isDark: false };
            break;
        case (month === 10): // 10月: 紫・黒 (DARK)
            theme = { primary: '#a78bfa', bgMain: '#0f172a', isDark: true };
            break;
        case (month === 12): // 12月: 赤・緑 (DARK)
            theme = { primary: '#ef4444', bgMain: '#064e3b', isDark: true };
            break;
    }

    // --- 変数の反映 ---
    root.style.setProperty('--theme-color', theme.primary);
    root.style.setProperty('--theme-bg-main', theme.bgMain);
    root.style.setProperty('--theme-bg', `${theme.primary}33`); // 20%透明度の影

    if (theme.isDark) {
        // ダークモード時の配色
        root.style.setProperty('--text-main', '#f8fafc');
        root.style.setProperty('--text-muted', '#94a3b8');
        root.style.setProperty('--sidebar-bg', '#1e293b');
        root.style.setProperty('--card-bg', '#1e293b');
        root.style.setProperty('--border-color', '#334155');
    } else {
        // ライトモード時の配色
        root.style.setProperty('--text-main', '#1e293b');
        root.style.setProperty('--text-muted', '#64748b');
        root.style.setProperty('--sidebar-bg', '#ffffff');
        root.style.setProperty('--card-bg', '#ffffff');
        root.style.setProperty('--border-color', '#e2e8f0');
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const navPlaceholder = document.getElementById('common-nav');
    if (!navPlaceholder) return;

    // パス判定の精度を向上
    const currentPath = window.location.pathname;

    const menuItems = [
        { name: '<i class="fa-solid fa-house"></i> ダッシュボード', url: '/14nin.com/SKNewRoles/dashboard/' },
        { name: '<i class="fa-solid fa-people-pants"></i> 役職構成', url: '/14nin.com/SKNewRoles/dashboard/game_config/role_config' },
        { name: '<i class="fa-duotone fa-solid fa-wand-sparkles"></i> スキル設定', url: '/14nin.com/SKNewRoles/dashboard/game_config/skill_config' },
        { name: '<i class="fa-solid fa-sack-dollar"></i> ショップ価格', url: '/14nin.com/SKNewRoles/dashboard/game_config/shop_config' },
        { name: '<i class="fa-etch fa-solid fa-book-open"></i> スタッフクレジット', url: '/14nin.com/SKNewRoles/dashboard/credits' }
    ];

    let navHtml = `<div class="logo">SKNewRoles2 ADMIN</div>`;

    menuItems.forEach(item => {
        // urlが現在のパスに含まれているか、または末尾が一致するかで判定
        const isActive = currentPath.endsWith(item.url) ? 'active' : '';
        navHtml += `<a href="${item.url}" class="nav-item ${isActive}">${item.name}</a>`;
    });

    // 共通のtext-muted変数を使用するように修正
    navHtml += `<div style="margin-top: auto; padding: 10px; font-size: 0.7rem; color: var(--text-muted);">v4.0.0.0 - Beta</div>`;

    navPlaceholder.innerHTML = navHtml;
    applySeasonalTheme();
});

document.addEventListener("contextmenu", function(e){
    e.preventDefault();
});