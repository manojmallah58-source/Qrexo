const qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    dotsOptions: { color: "#4f46e5", type: "extra-rounded" },
    backgroundOptions: { color: "#ffffff" },
    imageOptions: { crossOrigin: "anonymous", margin: 10 }
});

let currentType = 'url';

const fieldsData = {
    url: [{ label: 'Website URL', id: 'inp-url', type: 'url', placeholder: 'https://example.com' }],
    wifi: [
        { label: 'Network SSID', id: 'wifi-s', type: 'text', placeholder: 'WiFi Name' },
        { label: 'Password', id: 'wifi-p', type: 'password', placeholder: '••••••' }
    ],
    upi: [
        { label: 'VPA / UPI ID', id: 'upi-id', type: 'text', placeholder: 'username@upi' },
        { label: 'Payee Name', id: 'upi-n', type: 'text', placeholder: 'Full Name' }
    ],
    wa: [{ label: 'WhatsApp Number', id: 'wa-num', type: 'text', placeholder: '919876543210' }]
};

function renderFields(type) {
    const container = document.getElementById('fields-container');
    const fields = fieldsData[type] || fieldsData['url'];
    container.innerHTML = fields.map(f => `
        <div class="field-group">
            <label>${f.label}</label>
            <input type="${f.type}" id="${f.id}" placeholder="${f.placeholder}" class="main-input">
        </div>
    `).join('');

    container.querySelectorAll('input').forEach(i => i.addEventListener('input', generate));
}

function generate() {
    let data = "";
    if(currentType === 'url') data = document.getElementById('inp-url').value;
    if(currentType === 'wifi') {
        const s = document.getElementById('wifi-s').value;
        const p = document.getElementById('wifi-p').value;
        data = `WIFI:T:WPA;S:${s};P:${p};;`;
    }
    if(currentType === 'upi') {
        const id = document.getElementById('upi-id').value;
        const n = document.getElementById('upi-n').value;
        data = `upi://pay?pa=${id}&pn=${encodeURIComponent(n)}`;
    }
    if(currentType === 'wa') {
        const num = document.getElementById('wa-num').value;
        data = `https://wa.me/${num}`;
    }

    qrCode.update({
        data: data || "QR Elite",
        dotsOptions: { color: document.getElementById('qr-color').value },
        backgroundOptions: { color: document.getElementById('bg-color').value }
    });
}

// Logo Handling
document.getElementById('logo-dropzone').onclick = () => document.getElementById('logo-file').click();
document.getElementById('logo-file').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
        qrCode.update({ image: reader.result });
        document.getElementById('logo-preview').src = reader.result;
        document.getElementById('logo-preview').classList.remove('hidden');
    };
    reader.readAsDataURL(e.target.files[0]);
};

// Nav logic
document.querySelectorAll('.nav-pill').forEach(btn => {
    btn.onclick = () => {
        document.querySelector('.nav-pill.active').classList.remove('active');
        btn.classList.add('active');
        currentType = btn.dataset.type;
        renderFields(currentType);
        generate();
    };
});

// Download
document.getElementById('btn-png').onclick = () => qrCode.download({ name: "qr", extension: "png" });

// Init
renderFields('url');
qrCode.append(document.getElementById('qrcode-canvas'));
