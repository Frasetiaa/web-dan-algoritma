// ==================== KONFIGURASI JADWAL ====================
const CONFIG = {
    tahun: 2026,
    bulan: 9, // Bulan 1-12 (9 = September)
    jumlahHari: 30,
    piketPerHari: 3,
    nginapPerHari: 2,
    daftarNama: [
        "Haydar", "Baihaqi", "Gibran", "Rafly", "Roket",
        "Lutfi", "Kausar", "Hakim", "Iksan", "Fras",
        "Dimas", "Sultan", "Agoy", "Mirja", "Ridho"
    ]
};

// 8 Orang Khusus yang Mendapatkan Jadwal Nginap (Jumat & Sabtu)
const KHUSUS_NGINAP = ['Haydar', 'Baihaqi', 'Gibran', 'Rafly', 'Roket', 'Lutfi', 'Kausar', 'Hakim'];

// Helper Format Hari & Tanggal
const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const NAMA_BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

let schedule = [];
let members = CONFIG.daftarNama;

// Algoritma Generasi Jadwal
function generateSchedule() {
    const totalHari = CONFIG.jumlahHari;
    const piketPerHari = CONFIG.piketPerHari;
    const nginapPerHari = CONFIG.nginapPerHari;
    const tahun = CONFIG.tahun;
    const bulan = CONFIG.bulan - 1; // 0-index JS Date

    // Tracking statistik per anggota
    let stats = members.map(name => ({
        name,
        piketCount: 0,
        nginapCount: 0,
        total: 0,
        lastDutyDay: -2
    }));

    schedule = [];

    for (let day = 1; day <= totalHari; day++) {
        const currentDate = new Date(tahun, bulan, day);
        const dayOfWeek = currentDate.getDay(); // 0: Minggu, ..., 5: Jumat, 6: Sabtu
        const namaHari = NAMA_HARI[dayOfWeek];
        const tanggalStr = `${currentDate.getDate()} ${NAMA_BULAN[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

        let dayDuty = { 
            day, 
            namaHari, 
            tanggalStr, 
            piket: [], 
            nginap: [] 
        };
        let assignedToday = new Set();

        // 1. Assign Nginap (Hanya Jumat & Sabtu, dan KHUSUS 8 orang tertentu)
        if (dayOfWeek === 5 || dayOfWeek === 6) {
            for (let i = 0; i < nginapPerHari; i++) {
                let candidates = stats.filter(m => 
                    !assignedToday.has(m.name) && 
                    KHUSUS_NGINAP.some(kn => kn.toLowerCase() === m.name.toLowerCase())
                );
                
                candidates.sort((a, b) => {
                    let aConsecutive = (a.lastDutyDay === day - 1) ? 1 : 0;
                    let bConsecutive = (b.lastDutyDay === day - 1) ? 1 : 0;
                    if (aConsecutive !== bConsecutive) return aConsecutive - bConsecutive;
                    if (a.nginapCount !== b.nginapCount) return a.nginapCount - b.nginapCount;
                    return a.total - b.total;
                });

                let selected = candidates[0];
                if (selected) {
                    dayDuty.nginap.push(selected.name);
                    assignedToday.add(selected.name);
                    selected.nginapCount++;
                    selected.total++;
                    selected.lastDutyDay = day;
                }
            }
        }

        // 2. Assign Piket (Berjalan setiap hari, terbuka untuk SEMUA anggota)
        for (let i = 0; i < piketPerHari; i++) {
            let candidates = stats.filter(m => !assignedToday.has(m.name));

            candidates.sort((a, b) => {
                let aConsecutive = (a.lastDutyDay === day - 1) ? 1 : 0;
                let bConsecutive = (b.lastDutyDay === day - 1) ? 1 : 0;
                if (aConsecutive !== bConsecutive) return aConsecutive - bConsecutive;
                if (a.piketCount !== b.piketCount) return a.piketCount - b.piketCount;
                return a.total - b.total;
            });

            let selected = candidates[0];
            if (selected) {
                dayDuty.piket.push(selected.name);
                assignedToday.add(selected.name);
                selected.piketCount++;
                selected.total++;
                selected.lastDutyDay = day;
            }
        }

        schedule.push(dayDuty);
    }

    renderCalendar();
}

// Render Kalender Jadwal
function renderCalendar() {
    const calendarEl = document.getElementById('calendar');
    calendarEl.innerHTML = '';

    schedule.forEach(dayData => {
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';

        let piketList = dayData.piket.map(name => 
            `<div class="duty-tag piket">${name}</div>`
        ).join('');

        let nginapSection = '';
        if (dayData.nginap.length > 0) {
            let nginapList = dayData.nginap.map(name => 
                `<div class="duty-tag nginap">${name}</div>`
            ).join('');

            nginapSection = `
                <div class="slot-group">
                    <div class="slot-title nginap">Nginap</div>
                    ${nginapList}
                </div>
            `;
        }

        dayCard.innerHTML = `
            <div class="day-header">
                <div class="day-name">${dayData.namaHari}</div>
                <div class="day-date">${dayData.tanggalStr}</div>
            </div>
            <div class="slot-group">
                <div class="slot-title piket">Piket</div>
                ${piketList}
            </div>
            ${nginapSection}
        `;

        calendarEl.appendChild(dayCard);
    });
}

// Jalankan pembuatan jadwal saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    
    generateSchedule();
});