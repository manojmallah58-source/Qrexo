// Configuration
let currentType = 'url';
const qrData = {
    url: "https://google.com",
    wifi: "WIFI:T:WPA;S:MyNetwork;P:password123;;",
    upi: "upi://pay?pa=yours@upi&pn=Name",
    vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:Full Name\nEND:VCARD",
    text: "Hello World",
    social: "https://instagram.com"
};

// Initialize QR Library
const qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    type: "svg",
    data: qrData.url,
    image: "",
    dotsOptions: { color: "#6366f1", type: "extra-rounded" },
    backgroundOptions: { color: "#ffffff" },
    imageOptions: { crossOrigin: "anonymous", margin: 8 }
});

const canvasHolder = document.getElementById("canvas-holder");
const dynamicInputs = document.getElementById("dynamic-inputs");

// Render Fields Function
function updateInputs(type) {
    let html = '';
    if(type === 'url') {
        html = `<div class="input-group"><label>Website Link</label><input type="url" id="val-url" placeholder="https://example.com" value="https://google.com"></div>`;
    } else if(type === 'wifi') {
        html = `
            <div class="input-group"><label>Network Name (SSID)</label><input type="text" id="wifi-s" placeholder="Home_WiFi"></div>
            <div class="input-group"><label>Password</label><input type="password" id="wifi-p" placeholder="••••••••"></div>
        `;
    } else if(type === 'upi') {
        html = `
            <div class="input-group"><label>UPI ID</label><input type="text" id="upi-id" placeholder="name@bank"></div>
            <div class="input-group"><label>Merchant Name</label><input type="text" id="upi-n" placeholder="John Doe"></div>
        `;
    } else {
        html = `<div class="input-group"><label>Enter Content</label><textarea id="val-gen" rows="4"></textarea></div>`;
    }
    
    dynamicInputs.innerHTML = html;
    
    // Add event listeners to new inputs
    dynamicInputs.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', updateQR);
    });
}

function updateQR() {
    let dataString = "";
    
    if(currentType === 'url') dataString = document.getElementById('val-url').value;
    else if(currentType === 'wifi') {
        const s = document.getElementById('wifi-s').value;
        const p = document.getElementById('wifi-p').value;
        dataString = `WIFI:T:WPA;S:${s};P:${p};;`;
    } else if(currentType === 'upi') {
        const id = document.getElementById('upi-id').value;
        const n = document.getElementById('upi-n').value;
        dataString = `upi://pay?pa=${id}&pn=${encodeURIComponent(n)}`;
    } else {
        dataString = document.getElementById('val-gen').value;
    }

    qrCode.update({
        data: dataString || " ",
        dotsOptions: { color: document.getElementById('qr-color').value },
        backgroundOptions: { color: document.getElementById('bg-color').value }
    });
}

// Navigation Logic
document.querySelectorAll('.menu-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.menu-btn.active').classList.remove('active');
        btn.classList.add('active');
        currentType = btn.dataset.type;
        document.getElementById('page-title').innerText = `Generate ${currentType.toUpperCase()} QR`;
        updateInputs(currentType);
        updateQR();
    });
});

// Logo Upload Logic
document.getElementById('drop-zone').addEventListener('click', () => document.getElementById('logo-input').click());
document.getElementById('logo-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        qrCode.update({ image: reader.result });
        showToast("Logo Added!");
    };
    reader.readAsDataURL(file);
});

// Color change listeners
document.getElementById('qr-color').addEventListener('input', updateQR);
document.getElementById('bg-color').addEventListener('input', updateQR);

// Downloads
document.getElementById('dl-png').addEventListener('click', () => qrCode.download({ name: "qr_pro", extension: "png" }));
document.getElementById('dl-svg').addEventListener('click', () => qrCode.download({ name: "qr_pro", extension: "svg" }));

// Theme Toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isDark = document.body.classList.contains('dark-mode');
    document.getElementById('theme-toggle').innerHTML = isDark ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
    lucide.createIcons();
});

function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

// Initial Setup
updateInputs('url');
qrCode.append(canvasHolder);
