// Initialize QR Code Styling
let qrCode = new QRCodeStyling({
    width: 500,
    height: 500,
    data: "https://google.com",
    image: "",
    dotsOptions: { color: "#ffffff", type: "rounded" },
    backgroundOptions: { color: "#00000000" },
    imageOptions: { crossOrigin: "anonymous", margin: 10 }
});

const qrContainer = document.getElementById("qrcode");
const dynamicFields = document.getElementById("dynamic-fields");
const navItems = document.querySelectorAll(".nav-item");
const qrColorInput = document.getElementById("qr-color");
const bgColorInput = document.getElementById("bg-color");
const sizeSelect = document.getElementById("qr-size");
const logoUpload = document.getElementById("logo-upload");

let currentType = 'url';

// Field Configurations
const fieldConfigs = {
    url: [{ label: 'Website URL', id: 'url-input', type: 'url', placeholder: 'https://example.com' }],
    text: [{ label: 'Your Text', id: 'text-input', type: 'textarea', placeholder: 'Enter your message...' }],
    wifi: [
        { label: 'Network Name (SSID)', id: 'wifi-ssid', type: 'text' },
        { label: 'Password', id: 'wifi-pass', type: 'password' },
        { label: 'Security', id: 'wifi-enc', type: 'select', options: ['WPA', 'WEP', 'None'] }
    ],
    upi: [
        { label: 'UPI ID (VPA)', id: 'upi-id', type: 'text', placeholder: 'name@upi' },
        { label: 'Payee Name', id: 'upi-name', type: 'text' },
        { label: 'Amount (Optional)', id: 'upi-amount', type: 'number' }
    ],
    whatsapp: [
        { label: 'Phone Number', id: 'wa-num', type: 'tel', placeholder: '919876543210' },
        { label: 'Pre-filled Message', id: 'wa-msg', type: 'text' }
    ],
    vcard: [
        { label: 'Full Name', id: 'vc-name', type: 'text' },
        { label: 'Phone', id: 'vc-phone', type: 'tel' },
        { label: 'Email', id: 'vc-email', type: 'email' },
        { label: 'Company', id: 'vc-comp', type: 'text' }
    ]
};

// Functions
function renderFields(type) {
    const fields = fieldConfigs[type] || fieldConfigs['url'];
    dynamicFields.innerHTML = fields.map(f => `
        <div class="input-group">
            <label>${f.label}</label>
            ${f.type === 'select' 
                ? `<select id="${f.id}">${f.options.map(o => `<option value="${o}">${o}</option>`).join('')}</select>`
                : f.type === 'textarea'
                ? `<textarea id="${f.id}" placeholder="${f.placeholder}"></textarea>`
                : `<input type="${f.type}" id="${f.id}" placeholder="${f.placeholder || ''}">`
            }
        </div>
    `).join('');

    // Attach listeners to new inputs
    dynamicFields.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('input', generateQR);
    });
}

function generateQR() {
    let data = "";
    
    switch(currentType) {
        case 'url': data = document.getElementById('url-input').value; break;
        case 'text': data = document.getElementById('text-input').value; break;
        case 'wifi':
            const ssid = document.getElementById('wifi-ssid').value;
            const pass = document.getElementById('wifi-pass').value;
            const enc = document.getElementById('wifi-enc').value;
            data = `WIFI:T:${enc};S:${ssid};P:${pass};;`;
            break;
        case 'upi':
            const upi = document.getElementById('upi-id').value;
            const name = document.getElementById('upi-name').value;
            data = `upi://pay?pa=${upi}&pn=${encodeURIComponent(name)}`;
            break;
        case 'whatsapp':
            const num = document.getElementById('wa-num').value;
            const msg = document.getElementById('wa-msg').value;
            data = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
            break;
        // Add more cases for other types...
    }

    if(!data) data = "QR Pro";

    qrCode.update({
        data: data,
        dotsOptions: { color: qrColorInput.value },
        backgroundOptions: { color: bgColorInput.value },
        width: sizeSelect.value,
        height: sizeSelect.value
    });
}

// Nav Switch logic
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        currentType = item.dataset.type;
        document.getElementById('current-title').innerText = `${item.innerText} QR Generator`;
        renderFields(currentType);
        generateQR();
    });
});

// Logo Upload
logoUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        qrCode.update({ image: reader.result });
        document.getElementById('remove-logo').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
});

document.getElementById('remove-logo').addEventListener('click', () => {
    qrCode.update({ image: "" });
    logoUpload.value = "";
    document.getElementById('remove-logo').classList.add('hidden');
});

// Downloads
document.getElementById('download-png').addEventListener('click', () => qrCode.download({ name: "qr-pro", extension: "png" }));
document.getElementById('download-svg').addEventListener('click', () => qrCode.download({ name: "qr-pro", extension: "svg" }));

// Theme Toggle
const themeBtn = document.getElementById('theme-toggle');
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    themeBtn.innerHTML = isLight ? '<i data-lucide="moon"></i> <span>Dark Mode</span>' : '<i data-lucide="sun"></i> <span>Light Mode</span>';
    lucide.createIcons();
    qrColorInput.value = isLight ? "#000000" : "#ffffff";
    generateQR();
});

// Initial Render
renderFields('url');
qrCode.append(qrContainer);

// History Logic (Simplified)
function saveToHistory(data) {
    let history = JSON.parse(localStorage.getItem('qr_history') || '[]');
    history.unshift({ data, date: new Date().toLocaleDateString(), type: currentType });
    localStorage.setItem('qr_history', JSON.stringify(history.slice(0, 10)));
}
