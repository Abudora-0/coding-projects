const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function tick() {
    const d = new Date();
    const h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();

    hour.style.transform   = `rotate(${30 * h + m / 2}deg)`;
    minute.style.transform = `rotate(${m * 6}deg)`;
    second.style.transform = `rotate(${s * 6}deg)`;

    const ampm = h >= 12 ? "PM" : "AM";
    const hh = String(h % 12 || 12).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");

    document.getElementById("digitalTime").textContent = `${hh}:${mm}:${ss} ${ampm}`;
    document.getElementById("dateDisplay").textContent =
        `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

tick();
setInterval(tick, 1000);
