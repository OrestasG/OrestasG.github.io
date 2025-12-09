// Atnaujinti laiką real-time
function updateTime() {
    const now = new Date();
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('time').textContent = `${hours}:${minutes}`;
    
    const monthsLT = ['Sausis', 'Vasaris', 'Kovas', 'Balandis', 'Gegužė', 'Birželis', 
                      'Liepa', 'Rugpjūtis', 'Rugsėjis', 'Spalis', 'Lapkritis', 'Gruodis'];
    const date = now.getDate();
    const month = monthsLT[now.getMonth()];
    document.getElementById('date').textContent = `${month} ${date}`;
}

const STEPS_GOAL = 10000;
const SLEEP_GOAL = 8; // hours
const CALORIES_GOAL = 1000; // kcal

// Atnaujinti sveikatos duomenis
function updateHealthData() {
    const heartRate = 65 + Math.floor(Math.random() * 30);
    const steps = Math.floor(2000 + Math.random() * 8000);
    // simulate outdoor temperature between -10.0 and 35.0 °C
    const temp = (Math.random() * 45 - 10).toFixed(1);

    // simulate sleep and calories
    const sleepHours = (4 + Math.random() * 4).toFixed(1); // 4.0 - 8.0
    const calories = Math.floor(100 + Math.random() * 700); // 100 - 800 kcal

    document.getElementById('heart-rate').textContent = heartRate;
    // store numeric steps and show formatted
    const stepsFormatted = steps.toLocaleString('lt-LT');
    document.getElementById('steps').textContent = stepsFormatted;
    document.getElementById('temperature').textContent = temp + '°C';

    // Update steps report (use id for reliability)
    const stepsReport = document.getElementById('steps-text');
    if (stepsReport) stepsReport.textContent = `${stepsFormatted} / ${STEPS_GOAL.toLocaleString('lt-LT')}`;

    // Update sleep report
    const sleepText = document.getElementById('sleep-text');
    const sleepHoursEl = document.getElementById('sleep-hours');
    if (sleepText) sleepText.textContent = `${sleepHours} / ${SLEEP_GOAL} val.`;
    if (sleepHoursEl) sleepHoursEl.textContent = sleepHours;

    // Update calories report
    const caloriesText = document.getElementById('calories-text');
    const caloriesEl = document.getElementById('calories-value');
    if (caloriesText) caloriesText.textContent = `${calories} / ${CALORIES_GOAL} kcal`;
    if (caloriesEl) caloriesEl.textContent = calories;

    // Update progress bars
    updateStepsProgress(steps);
    updateSleepProgress(parseFloat(sleepHours));
    updateCaloriesProgress(calories);

    return steps;
}

// Meniu valdymas
let currentMenu = 0;
const menus = ['notifications', 'fitness', 'settings'];
let _wheelRotation = 0; // persistent rotation for roulette

function showMenu(menuName) {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach((item) => {
        item.style.background = 'rgba(0, 212, 255, 0.15)';
        item.style.borderColor = 'rgba(0, 212, 255, 0.4)';
    });

    // Highlight the matching menu item by data-name or inner text
    let selected = null;
    menuItems.forEach(item => {
        const nameAttr = (item.getAttribute('onclick') || '').toLowerCase();
        if (nameAttr.includes(menuName.toLowerCase())) selected = item;
    });

    if (selected) {
        selected.style.background = 'rgba(0, 212, 255, 0.4)';
        selected.style.borderColor = 'rgba(0, 212, 255, 0.8)';
    }

    // Set currentMenu index so next/previous still work if used
    const idx = menus.indexOf(menuName);
    if (idx !== -1) currentMenu = idx;

    // Ensure the menu-section is visible when a menu is selected
    const menuSection = document.querySelector('.menu-section');
    if (menuSection) menuSection.style.display = 'flex';

    // Also show the associated in-display panel (compact and scrollable)
    try { showPanel(menuName); } catch (e) { /* ignore */ }

    console.log('Atidarytas meniu:', menuName);
}

// Show/hide panels inside the display
function showPanel(name) {
    const container = document.querySelector('.panel-container');
    if (!container) return;
    const panels = container.querySelectorAll('.panel');
    panels.forEach(p => p.style.display = 'none');
    const panelMap = {
        'notifications': 'panel-notifications',
        'fitness': 'panel-fitness',
        'settings': 'panel-settings'
    };
    const id = panelMap[name];
    const el = id ? document.getElementById(id) : null;
    if (el) {
        // show only if the requested in-display panel exists
        container.style.display = 'block';
        el.style.display = 'block';
    } else {
        // hide container when no in-display panel should be shown
        container.style.display = 'none';
    }
}

// Show a bottom drawer panel by name ('notifications' | 'fitness' | 'settings')
function showBottomPanel(name) {
    const drawer = document.getElementById('bottom-drawer');
    if (!drawer) return;
    const titleMap = {
        'notifications': 'Pranešimai',
        'fitness': 'Sportas',
        'settings': 'Nustatymai'
    };
    const panelMap = {
        'notifications': 'drawer-notifications',
        'fitness': 'drawer-fitness',
        'settings': 'drawer-settings'
    };

    // hide all drawer panels
    const panels = drawer.querySelectorAll('.drawer-panel');
    panels.forEach(p => p.style.display = 'none');

    // show requested
    const panelId = panelMap[name];
    if (panelId) {
        const el = document.getElementById(panelId);
        if (el) el.style.display = 'block';
        const title = titleMap[name] || 'Panel';
        const titleEl = document.getElementById('drawer-title');
        if (titleEl) titleEl.textContent = title;

        // show drawer
        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');
    }
}

function closeBottomDrawer() {
    const drawer = document.getElementById('bottom-drawer');
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
}

function nextMenu() {
    currentMenu = (currentMenu + 1) % menus.length;
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems[currentMenu].click();
    console.log('Kitas meniu');
}

function previousMenu() {
    currentMenu = (currentMenu - 1 + menus.length) % menus.length;
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems[currentMenu].click();
    console.log('Ankstesnis meniu');
}

function toggleMenu() {
    const menuSection = document.querySelector('.menu-section');
    menuSection.style.display = menuSection.style.display === 'none' ? 'flex' : 'none';
    console.log('Meniu įjungtas/išjungtas');
}

// Activity hours removed — no simulation needed

// Žingsnių progreso aktualizacija
function updateStepsProgress(stepsValue) {
    if (typeof stepsValue !== 'number') {
        // try to parse fallback
        const txt = document.getElementById('steps').textContent || '0';
        stepsValue = parseInt(txt.replace(/\s|\u00A0|,/g, ''), 10) || 0;
    }
    const progressFill = document.querySelector('.progress-fill');
    const percentage = (stepsValue / STEPS_GOAL) * 100;
    if (progressFill) progressFill.style.width = Math.min(percentage, 100) + '%';
}

function updateSleepProgress(hours) {
    const pct = Math.min(100, Math.max(0, Math.round((hours / SLEEP_GOAL) * 100)));
    const fill = document.querySelector('.sleep-progress-fill');
    if (fill) fill.style.width = pct + '%';
}

function updateCaloriesProgress(kcal) {
    const pct = Math.min(100, Math.max(0, Math.round((kcal / CALORIES_GOAL) * 100)));
    const fill = document.querySelector('.calories-progress-fill');
    if (fill) fill.style.width = pct + '%';
}

// Pulsavimo efektas širdžiai
function addHeartbeat() {
    const heartIcon = document.querySelector('.control-item .icon');
    setInterval(() => {
        heartIcon.style.transform = 'scale(1.2)';
        setTimeout(() => {
            heartIcon.style.transform = 'scale(1)';
        }, 300);
    }, 1000);
}

// Šildytuvų animacija (širdies ritmo grafikas)
function animateBars() {
    const bars = document.querySelectorAll('.bar');
    setInterval(() => {
        bars.forEach(bar => {
            const randomHeight = 30 + Math.random() * 70;
            bar.style.height = randomHeight + '%';
        });
    }, 2000);
}

// Pradinė inicijalizacija
document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    const initialSteps = updateHealthData();
    updateStepsProgress(initialSteps);
    
    // Atnaujinti laiką kas sekundę
    setInterval(updateTime, 1000);
    
    // Atnaujinti sveikatos duomenis kas 30 sekundžių
    setInterval(() => {
        const steps = updateHealthData();
        updateStepsProgress(steps);
    }, 30000);
    
    // Activity hours section removed; no periodic simulation
    
    // Pridėti animacijas
    addHeartbeat();
    animateBars();
    
    // Nustatyti numatytąjį meniu
    showMenu('notifications');
    
    console.log('Išmanusis laikrodis inicijalizuotas!');
});

// Attach robust click handlers to menu items (uses data-menu)
document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(mi => {
        const menuName = mi.getAttribute('data-menu');
        if (!menuName) return;
        mi.addEventListener('click', (e) => {
            e.preventDefault();
            showMenu(menuName);
            // also open bottom drawer for full view
            try { showBottomPanel(menuName); } catch (err) {}
        });
    });
});

// attach close button handler
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('drawer-close');
    if (closeBtn) closeBtn.addEventListener('click', () => closeBottomDrawer());
});

// Nykščio valdymas (jei reikalinga)
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') previousMenu();
    if (e.key === 'ArrowRight') nextMenu();
    if (e.key === 'Enter') toggleMenu();
});

// Ruletės sukimas
function spinRoulette() {
    const overlay = document.getElementById('roulette-overlay');
    const wheel = document.getElementById('wheel');
    const resultText = document.getElementById('roulette-result-text');
    if (!overlay || !wheel || !resultText) return;

    overlay.style.display = 'flex';
    resultText.textContent = '';

    // 16 sectors: alternating red/black
    const segmentCount = 16;
    const spins = Math.floor(Math.random() * 4) + 4; // 4-7 full spins
    const winningIndex = Math.floor(Math.random() * segmentCount);
    const segmentAngle = 360 / segmentCount;

    // aim for center of chosen segment
    const targetAngle = spins * 360 + winningIndex * segmentAngle + segmentAngle / 2;

    // accumulate rotation to avoid reset
    _wheelRotation += targetAngle;
    // set transition and rotate
    wheel.style.transition = 'transform 3s cubic-bezier(.2,.8,.2,1)';
    wheel.style.transform = `rotate(${_wheelRotation}deg)`;

    // After animation finishes, compute result and show
    setTimeout(() => {
        const normalized = _wheelRotation % 360;
        let index = Math.floor(normalized / segmentAngle) % segmentCount;
        if (index < 0) index += segmentCount;
        // Casino numbers (example): 0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30
        const numbers = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30];
        const colors = numbers.map((n,i)=>i===0?'green':i%2===0?'red':'black');
        const label = numbers[index];
        const color = colors[index];
        // Map English color to Lithuanian name
        const colorNames = { red: 'Raudona', black: 'Juoda', green: 'Žalia' };
        const colorName = colorNames[color] || color;
        // Show color name and number; keep text color white
        resultText.textContent = `Laimėjo: ${colorName} ${label}`;
        resultText.style.color = '#ffffff';

        // hide overlay after a short delay
        setTimeout(() => {
            overlay.style.display = 'none';
            // reset text color to default
            resultText.style.color = '';
            // reset transition so subsequent spins can set it fresh
            try { wheel.style.transition = ''; } catch(e){}
            // clear result text shortly after hiding
            setTimeout(() => { resultText.textContent = ''; }, 300);
        }, 1600);
    }, 3200);
}

// Ensure spin button and wheel clicks trigger the spin
document.addEventListener('DOMContentLoaded', () => {
    const spinBtn = document.getElementById('coin-btn');
    if (spinBtn) spinBtn.addEventListener('click', (e) => {
        e.preventDefault();
        spinRoulette();
    });
    const wheelEl = document.getElementById('wheel');
    if (wheelEl) wheelEl.addEventListener('click', (e) => {
        e.preventDefault();
        spinRoulette();
    });
    // allow clicking outside the wheel (overlay) to close early
    const overlayEl = document.getElementById('roulette-overlay');
    if (overlayEl) overlayEl.addEventListener('click', (e) => {
        if (e.target === overlayEl) overlayEl.style.display = 'none';
    });
});
