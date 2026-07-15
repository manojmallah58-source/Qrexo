// Initialize Library
const qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    dotsOptions: { color: "#000000", type: "extra-rounded" },
    backgroundOptions: { color: "#ffffff" },
    imageOptions: { crossOrigin: "anonymous", margin: 10 }
});

let currentType = 'url';

// Field Data Configuration
const fieldMap = {
    url: [{ label: 'Website Link', id: 'f-url', type: 'url', ph: 'https://example.com' }],
    wifi: [
        { label: 'SSID / Name', id: 'f-ssid', type: 'text', ph: 'Home WiFi' },
        { label: 'Password', id: 'f-pass', type: 'password', ph: '••••••' }
    ],
    upi: [
        { label: 'UPI ID', id: 'f-upi', type: 'text', ph: 'payee@upi' },
        { label: 'Name', id: 'f-name', type: 'text', ph: 'Payee Name' }
    ],
    vcard: [
        { label: 'Full Name', id: 'f-vc-n', type: 'text', ph: 'John Doe' },
        { label: 'Phone', id: 'f-vc-p', type: 'tel', ph: '+91 00000 00000' }
    ],
    text: [{ label: 'Content', id: 'f-txt', type: 'textarea', ph: 'Type something...' }]
};

function renderInputs(type) {
    const container = document.getElementById('fields-container');
    const fields = fieldMap[type] || fieldMap.url;
    
    container.innerHTML = fields.map(f => `
        <div class="field-group">
            <label>${f.label}</label>
            ${f.type === 'textarea' 
                ? `<textarea id="${f.id}" placeholder="${f.ph}"></textarea>`
                : `<input type="${f.type}" id="${f.id}" placeholder="${f.ph}">`
            }
        </div>
    `).join('');

    container.querySelectorAll('input, textarea').forEach(el => {
        el.addEventListener('input', generate);
    });
}

function generate() {
    let dataString = "";
    if(currentType === 'url') dataString = document.getElementById('f-url').value;
    else if(currentType === 'wifi') {
        const s = document.getElementById('f-ssid').value;
        const p = document.getElementById('f-pass').value;
        dataString = `WIFI:T:WPA;S:${s};P:${p};;`;
    }
    else if(currentType === 'upi') {
        const id = document.getElementById('f-upi').value;
        const name = document.getElementById('f-name').value;
        dataString = `upi://pay?pa=${id}&pn=${encodeURIComponent(name)}`;
    }
    else if(currentType === 'text') {
        dataString = document.getElementById('f-txt').value;
    }

    qrCode.update({
        data: dataString || "QR Pro",
        dotsOptions: { color: document.getElementById('qr-color').value },
        backgroundOptions: { color: document.getElementById('bg-color').value }
    });
}

// Navigation Logic
document.querySelectorAll('.nav-item').forEach(btn => {
    btn.onclick = () => {
        document.querySelector('.nav-item.active').classList.remove('active');
        btn.classList.add('active');
        currentType = btn.dataset.type;
        document.getElementById('generator-title').innerText = btn.innerText + " Generator";
        renderInputs(currentType);
        generate();
    };
});

// Logo Handling
document.getElementById('logo-btn').onclick = () => document.getElementById('logo-input').click();
document.getElementById('logo-input').onchange = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        qrCode.update({ image: reader.result });
        document.getElementById('logo-label').innerText = "Logo Added";
    };
    reader.readAsDataURL(file);
};

// Design Accordion
function toggleDesign() {
    const panel = document.getElementById('design-panel');
    const chevron = document.getElementById('design-chevron');
    panel.classList.toggle('hidden');
    chevron.style.transform = panel.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
}

// Downloads
document.getElementById('btn-png').onclick = () => qrCode.download({ name: "qr-code", extension: "png" });
document.getElementById('btn-svg').onclick = () => qrCode.download({ name: "qr-code", extension: "svg" });

// Dark Mode
document.getElementById('theme-toggle').onclick = () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    document.getElementById('theme-toggle').innerHTML = isDark ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
    lucide.createIcons();
};

// Initial Render
renderInputs('url');
qrCode.append(document.getElementById('qr-output'));
