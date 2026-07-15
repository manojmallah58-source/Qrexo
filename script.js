// QR Stylings
const qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    dotsOptions: { color: "#4f46e5", type: "extra-rounded" },
    backgroundOptions: { color: "#ffffff" },
    imageOptions: { crossOrigin: "anonymous", margin: 10 }
});

let currentType = 'url';

// Configurations for inputs
const config = {
    url: {
        title: "URL Generator",
        desc: "Convert any website link into a QR code.",
        fields: [{ label: "Website Link", id: "in-url", type: "url", ph: "https://example.com" }]
    },
    whatsapp: {
        title: "WhatsApp Chat",
        desc: "Direct users to a WhatsApp chat with a message.",
        fields: [
            { label: "Phone Number (with Country Code)", id: "in-wa-num", type: "tel", ph: "919876543210" },
            { label: "Message (Optional)", id: "in-wa-msg", type: "text", ph: "Hi, I am interested!" }
        ]
    },
    wifi: {
        title: "WiFi Access",
        desc: "Let guests join your network instantly.",
        fields: [
            { label: "Network Name (SSID)", id: "in-wifi-s", type: "text", ph: "Home_WiFi" },
            { label: "Password", id: "in-wifi-p", type: "password", ph: "••••••••" }
        ]
    },
    upi: {
        title: "UPI Payment",
        desc: "Receive payments directly to your bank.",
        fields: [
            { label: "Payee UPI ID", id: "in-upi-vpa", type: "text", ph: "name@bank" },
            { label: "Merchant Name", id: "in-upi-n", type: "text", ph: "Business Name" }
        ]
    },
    vcard: {
        title: "Business Card",
        desc: "Share your contact details instantly.",
        fields: [
            { label: "Full Name", id: "in-vc-n", type: "text", ph: "John Doe" },
            { label: "Phone", id: "in-vc-p", type: "tel", ph: "+91 99999 88888" }
        ]
    }
};

function renderInputs(type) {
    const box = document.getElementById('fields-holder');
    const data = config[type];
    
    document.getElementById('active-title').innerText = data.title;
    document.getElementById('active-desc').innerText = data.desc;
    
    box.innerHTML = data.fields.map(f => `
        <div class="input-group">
            <label>${f.label}</label>
            <input type="${f.type}" id="${f.id}" placeholder="${f.ph}">
        </div>
    `).join('');

    box.querySelectorAll('input').forEach(el => el.addEventListener('input', generate));
}

function generate() {
    let dataString = "";
    
    if(currentType === 'url') {
        dataString = document.getElementById('in-url').value;
    } else if(currentType === 'whatsapp') {
        const n = document.getElementById('in-wa-num').value;
        const m = document.getElementById('in-wa-msg').value;
        dataString = `https://wa.me/${n}?text=${encodeURIComponent(m)}`;
    } else if(currentType === 'wifi') {
        const s = document.getElementById('in-wifi-s').value;
        const p = document.getElementById('in-wifi-p').value;
        dataString = `WIFI:T:WPA;S:${s};P:${p};;`;
    } else if(currentType === 'upi') {
        const v = document.getElementById('in-upi-vpa').value;
        const n = document.getElementById('in-upi-n').value;
        dataString = `upi://pay?pa=${v}&pn=${encodeURIComponent(n)}`;
    } else if(currentType === 'vcard') {
        const n = document.getElementById('in-vc-n').value;
        const p = document.getElementById('in-vc-p').value;
        dataString = `BEGIN:VCARD\nVERSION:3.0\nFN:${n}\nTEL:${p}\nEND:VCARD`;
    }

    qrCode.update({
        data: dataString || "QR Studio Elite",
        dotsOptions: { color: document.getElementById('qr-color').value },
        backgroundOptions: { color: document.getElementById('bg-color').value }
    });
}

// Navigation
document.querySelectorAll('.tab-item').forEach(btn => {
    btn.onclick = () => {
        document.querySelector('.tab-item.active').classList.remove('active');
        btn.classList.add('active');
        currentType = btn.dataset.type;
        renderInputs(currentType);
        generate();
    };
});

// Logo Upload
document.getElementById('logo-trigger').onclick = () => document.getElementById('logo-input').click();
document.getElementById('logo-input').onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        qrCode.update({ image: reader.result });
        document.getElementById('logo-text').innerText = "Logo Attached";
    };
    reader.readAsDataURL(file);
};

// UI Toggles
function toggleAccordion() {
    const body = document.getElementById('accordion-body');
    const icon = document.getElementById('acc-icon');
    body.classList.toggle('hidden');
    icon.style.transform = body.classList.contains('hidden') ? 'rotate(0)' : 'rotate(180deg)';
}

document.getElementById('theme-btn').onclick = () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    document.getElementById('theme-btn').innerHTML = isDark ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
    lucide.createIcons();
};

// Downloads
document.getElementById('dl-png').onclick = () => qrCode.download({ name: "qr-studio", extension: "png" });
document.getElementById('dl-svg').onclick = () => qrCode.download({ name: "qr-studio", extension: "svg" });

// Initialize
renderInputs('url');
qrCode.append(document.getElementById('qr-canvas-container'));
