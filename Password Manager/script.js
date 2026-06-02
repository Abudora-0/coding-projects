function maskPassword(pass) {
    return "•".repeat(pass.length);
}

function copyText(txt) {
    navigator.clipboard.writeText(txt).then(
        () => {
            const badge = document.getElementById("alert");
            badge.style.display = "inline-flex";
            setTimeout(() => { badge.style.display = "none"; }, 2000);
        },
        () => { alert("Failed! Couldn't Copy"); }
    );
}

const deletePassword = (website) => {
    if (!confirm(`Delete password for "${website}"?`)) return;
    let arr = JSON.parse(localStorage.getItem("passwords")) || [];
    arr = arr.filter(e => e.website !== website);
    localStorage.setItem("passwords", JSON.stringify(arr));
    showPasswords();
}

const showPasswords = () => {
    const tb = document.getElementById("tableBody");
    const data = localStorage.getItem("passwords");
    const arr = data ? JSON.parse(data) : [];

    if (arr.length === 0) {
        tb.innerHTML = `<tr class="empty-row"><td colspan="4"><i class="fas fa-lock"></i> No passwords saved yet</td></tr>`;
        return;
    }

    tb.innerHTML = arr.map(e => `
        <tr>
            <td>${e.website} <img class="copy" onclick="copyText('${e.website}')" src="copy.svg" alt="copy" title="Copy"></td>
            <td>${e.username} <img class="copy" onclick="copyText('${e.username}')" src="copy.svg" alt="copy" title="Copy"></td>
            <td>${maskPassword(e.password)} <img class="copy" onclick="copyText('${e.password}')" src="copy.svg" alt="copy" title="Copy"></td>
            <td><button class="btnsm" onclick="deletePassword('${e.website}')"><i class="fas fa-trash"></i> Delete</button></td>
        </tr>
    `).join("");

    document.getElementById("website").value = "";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
}

showPasswords();

document.querySelector(".btn").addEventListener("click", (e) => {
    e.preventDefault();
    const w = document.getElementById("website").value.trim();
    const u = document.getElementById("username").value.trim();
    const p = document.getElementById("password").value;
    if (!w || !u || !p) return;

    let arr = JSON.parse(localStorage.getItem("passwords")) || [];
    arr.push({ website: w, username: u, password: p });
    localStorage.setItem("passwords", JSON.stringify(arr));
    showPasswords();
});
