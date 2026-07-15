// script.js
let currentQR = null;
let currentType = 0;
let logoImage = null;
let history = JSON.parse(localStorage.getItem('qrfy_history')) || [];
let favorites = JSON.parse(localStorage.getItem('qrfy_favorites')) || [];

const qrTypes = [
    { name: "URL / Link", icon: "🔗", placeholder: "https://example.com" },
    { name: "Plain Text", icon: "📝", placeholder: "Hello, World!" },
    { name: "WiFi", icon: "📶", fields: ["ssid", "password", "encryption"] },
    { name: "Phone", icon: "📞", placeholder: "+911234567890" },
    { name: "SMS", icon: "💬", fields: ["phone", "message"] },
    { name: "Email", icon: "✉️", placeholder: "hello@example.com" },
    { name: "WhatsApp", icon: "💬", placeholder: "919876543210" },
    { name: "UPI", icon: "💰", fields: ["upiId", "name", "amount"] },
    { name: "Location", icon: "📍", fields: ["lat", "lng"] },
    { name: "vCard", icon: "👤", fields: ["name", "phone", "email"] },
    { name: "Social", icon: "🌐", placeholder: "https://instagram.com/username" }
];

function init() {
    selectType(0);
    renderHistory();
    updateTheme();
    // PWA registration simulation
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
}

function selectType(index) {
    currentType = index;
    document.querySelectorAll('.type-item').forEach((el, i) => {
        el.classList.toggle('active', i === index);
    });
    renderInputFields();
    generateQR();
}

function renderInputFields() {
    const container = document.getElementById('input-fields');
    const type = qrTypes[currentType];
    
    let html = `<h3>${type.name}</h3>`;
    
    if (currentType === 0 || currentType === 1 || currentType === 5 || currentType === 6 || currentType === 10) {
        html += `<input type="text" id="main-input" class="main-input" placeholder="${type.placeholder}" onkeyup="generateQR()" value="${type.placeholder}">`;
    } 
    else if (currentType === 2) { // WiFi
        html += `
            <input type="text" id="wifi-ssid" placeholder="Network Name (SSID)" onkeyup="generateQR()">
            <input type="password" id="wifi-pass" placeholder="Password" onkeyup="generateQR()">
            <select id="wifi-enc" onchange="generateQR()">
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
            </select>
        `;
    } 
    else if (currentType === 9) { // vCard
        html += `
            <input type="text" id="v-name" placeholder="Full Name" onkeyup="generateQR()">
            <input type="tel" id="v-phone" placeholder="Phone" onkeyup="generateQR()">
            <input type="email" id="v-email" placeholder="Email" onkeyup="generateQR()">
        `;
    } 
    else {
        // other types with simple fields
        html += `<input type="text" id="main-input" class="main-input" placeholder="Enter details..." onkeyup="generateQR()">`;
    }
    
    container.innerHTML = html;
}

function getQRData() {
    let data = '';
    const type = qrTypes[currentType];
    
    switch(currentType) {
        case 0: // URL
            data = document.getElementById('main-input').value || 'https://example.com';
            break;
        case 2: // WiFi
            const ssid = document.getElementById('wifi-ssid').value || 'MyNetwork';
            const pass = document.getElementById('wifi-pass').value || 'password';
            const enc = document.getElementById('wifi-enc').value;
            data = `WIFI:S:${ssid};T:${enc};P:${pass};;`;
            break;
        case 9: // vCard
            const name = document.getElementById('v-name').value || 'John Doe';
            const phone = document.getElementById('v-phone').value || '';
            const email = document.getElementById('v-email').value || '';
            data = `BEGIN:VCARD\nVERSION:3.0\nN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
            break;
        default:
            data = document.getElementById('main-input') ? document.getElementById('main-input').value : 'QRify Demo';
    }
    return data;
}

function generateQR() {
    const container = document.getElementById('qr-container');
    container.innerHTML = '';
    
    const data = getQRData();
    const size = parseInt(document.getElementById('qr-size').value);
    const color = document.getElementById('qr-color').value;
    const bg = document.getElementById('bg-color').value;
    const level = document.getElementById('error-level').value;
    
    currentQR = new QRCode(container, {
        text: data,
        width: size,
        height: size,
        colorDark: color,
        colorLight: bg,
        correctLevel: QRCode.CorrectLevel[level]
    });
    
    // Re-apply logo if exists
    if (logoImage) {
        setTimeout(() => applyLogo(), 100);
    }
    
    document.getElementById('qr-data-display').textContent = data.substring(0, 60) + (data.length > 60 ? '...' : '');
}

function applyLogo() {
    if (!currentQR || !logoImage) return;
    const canvas = document.querySelector('#qr-container canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const logoSize = canvas.width * 0.22;
    const x = (canvas.width - logoSize) / 2;
    const y = (canvas.height - logoSize) / 2;
    
    ctx.drawImage(logoImage, x, y, logoSize, logoSize);
}

function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(ev) {
        logoImage = new Image();
        logoImage.onload = function() {
            document.getElementById('remove-logo-btn').style.display = 'inline-block';
            generateQR();
        };
        logoImage.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

function removeLogo() {
    logoImage = null;
    document.getElementById('remove-logo-btn').style.display = 'none';
    generateQR();
}

function downloadPNG() {
    const canvas = document.querySelector('#qr-container canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    saveToHistory();
    showToast('✅ PNG downloaded');
}

function downloadSVG() {
    // Simple SVG generation
    showToast('SVG download coming in next update ✨');
    // For full production, implement canvas to SVG or use another lib
}

function printQR() {
    const canvas = document.querySelector('#qr-container canvas');
    if (!canvas) return;
    const printWin = window.open('', '_blank');
    printWin.document.write(`<img src="${canvas.toDataURL()}" style="max-width:100%">`);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 500);
}

function copyQR() {
    const canvas = document.querySelector('#qr-container canvas');
    if (!canvas) return;
    canvas.toBlob(blob => {
        navigator.clipboard.write([new ClipboardItem({'image/png': blob})]);
        showToast('📋 QR copied to clipboard');
    });
}

async function shareQR() {
    const canvas = document.querySelector('#qr-container canvas');
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
        const file = new File([blob], "qrcode.png", { type: "image/png" });
        if (navigator.share) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'My QR Code'
                });
            } catch(e) {}
        } else {
            showToast('Share not supported on this device');
        }
    });
}

function saveToHistory() {
    const data = getQRData();
    const entry = {
        id: Date.now(),
        type: qrTypes[currentType].name,
        data: data.substring(0, 80),
        timestamp: new Date().toISOString(),
        color: document.getElementById('qr-color').value
    };
    history.unshift(entry);
    if (history.length > 50) history.pop();
    localStorage.setItem('qrfy_history', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('history-list');
    container.innerHTML = '';
    
    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div>
                <strong>${item.type}</strong><br>
                <small>${item.data}</small>
            </div>
            <div class="history-actions">
                <button onclick="loadHistoryItem(${item.id})">Load</button>
                <button onclick="deleteHistoryItem(${item.id})" class="delete">🗑</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function loadHistoryItem(id) {
    const item = history.find(h => h.id === id);
    if (!item) return;
    // For simplicity, switch to URL type and fill
    selectType(0);
    document.getElementById('main-input').value = item.data;
    generateQR();
    navigateTo('home');
}

function deleteHistoryItem(id) {
    history = history.filter(h => h.id !== id);
    localStorage.setItem('qrfy_history', JSON.stringify(history));
    renderHistory();
}

function clearHistory() {
    if (confirm('Clear all history?')) {
        history = [];
        localStorage.removeItem('qrfy_history');
        renderHistory();
    }
}

function filterHistory() {
    // Implement search if needed
    renderHistory();
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.display = 'flex';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 2800);
}

function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    document.getElementById('theme-toggle').textContent = isDark ? '☀️' : '🌙';
}

function updateTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    document.getElementById('theme-toggle').textContent = saved === 'dark' ? '☀️' : '🌙';
}

function navigateTo(page) {
    document.querySelectorAll('.content-area').forEach(el => el.classList.add('hidden'));
    document.getElementById(page + '-page').classList.remove('hidden');
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.textContent.toLowerCase().includes(page));
    });
}

function showLegal(type) {
    let msg = '';
    if (type === 'privacy') msg = 'We respect your privacy. No data is stored on servers.';
    else if (type === 'terms') msg = 'Use responsibly. All generated QR codes are your responsibility.';
    else msg = 'This is a demo project for educational purposes.';
    alert(msg);
}

function showMenu() {
    alert('Mobile menu would expand here in full version ✨');
}

function filterTypes() {
    const term = document.getElementById('search-types').value.toLowerCase();
    document.querySelectorAll('.type-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(term) ? 'flex' : 'none';
    });
}

// Initialize
window.onload = init;
