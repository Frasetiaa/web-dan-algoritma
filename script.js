let schedule = [];
let members = [];


const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const NAMA_BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];


const KHUSUS_NGINAP = ['Haydar', 'Baihaqi', 'Gibran', 'Rafly', 'Roket', 'Lutfi', 'Kausar', 'Hakim'];


function updateSlotStats() {
    const hari = parseInt(document.getElementById('cfg-hari').value) || 0;
    const piket = parseInt(document.getElementById('cfg-piket-hari').value) || 0;
    const nginap = parseInt(document.getElementById('cfg-nginap-hari').value) || 0;
    const tahun = parseInt(document.getElementById('cfg-tahun').value) || 2026;
    const bulan = (parseInt(document.getElementById('cfg-bulan').value) || 1) - 1;

    
    let totalHariNginap = 0;
    for (let d = 1; d <= hari; d++) {
        const date = new Date(tahun, bulan, d);
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 5 || dayOfWeek === 6) { 
            totalHariNginap++;
        }
    }

    const totalPiket = hari * piket;
    const totalNginap = totalHariNginap * nginap;

    document.getElementById('stat-piket').innerText = totalPiket;
    document.getElementById('stat-nginap').innerText = totalNginap;
    document.getElementById('stat-total').innerText = totalPiket + totalNginap;
}


function generateSchedule() {
    const totalHari = parseInt(document.getElementById('cfg-hari').value);
    const totalAnggota = parseInt(document.getElementById('cfg-anggota').value);
    const piketPerHari = parseInt(document.getElementById('cfg-piket-hari').value);
    const nginapPerHari = parseInt(document.getElementById('cfg-nginap-hari').value);
    const tahun = parseInt(document.getElementById('cfg-tahun').value) || 2026;
    const bulan = (parseInt(document.getElementById('cfg-bulan').value) || 1) - 1;

    
    const inputNama = document.getElementById('cfg-daftar-nama').value;
    let customMembers = inputNama.split('\n').map(name => name.trim()).filter(name => name !== '');

    
    members = [];
    for (let i = 0; i < totalAnggota; i++) {
        if (customMembers[i]) {
            members.push(customMembers[i]);
        } else {
            members.push(`Anggota ${i + 1}`);
        }
    }

    
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
        const dayOfWeek = currentDate.getDay(); // 
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
    renderSummary();
}


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


function renderSummary() {
    const summaryTbody = document.getElementById('summary-table');
    summaryTbody.innerHTML = '';

    let counts = {};
    members.forEach(m => counts[m] = { piket: 0, nginap: 0, total: 0 });

    schedule.forEach(day => {
        day.piket.forEach(m => { if(counts[m]) { counts[m].piket++; counts[m].total++; } });
        day.nginap.forEach(m => { if(counts[m]) { counts[m].nginap++; counts[m].total++; } });
    });

    Object.keys(counts).forEach(member => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><b>${member}</b></td>
            <td>${counts[member].piket}</td>
            <td>${counts[member].nginap}</td>
            <td><b>${counts[member].total}</b></td>
        `;
        summaryTbody.appendChild(row);
    });
}


document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.grid-config input, #cfg-daftar-nama').forEach(input => {
        input.addEventListener('input', updateSlotStats);
    });
    updateSlotStats();
    generateSchedule();
});