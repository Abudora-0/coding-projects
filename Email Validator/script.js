// Get a free API key from https://emailvalidation.io and replace YOUR_API_KEY_HERE
const API_KEY = "YOUR_API_KEY_HERE";

const friendlyLabels = {
    email: "Email", user: "Username", domain: "Domain", state: "State",
    reason: "Reason", score: "Score", format_valid: "Format Valid",
    smtp_check: "SMTP Check", mx_found: "MX Record Found",
    role: "Role Account", disposable: "Disposable", free: "Free Provider",
    did_you_mean: "Did You Mean", catch_all: "Catch All", tag: "Tag"
};

document.getElementById("validateForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = document.getElementById("submitBtn");
    const email = document.getElementById("emailInput").value.trim();
    const resultCard = document.getElementById("resultCard");
    const resultCont = document.getElementById("resultCont");
    const resultsHeader = document.getElementById("resultsHeader");

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validating...';
    btn.disabled = true;

    try {
        const url = `https://api.emailvalidation.io/v1/info?apikey=${API_KEY}&email=${encodeURIComponent(email)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        // Determine badge
        let badgeClass = "badge-risky", badgeIcon = "fa-circle-exclamation", badgeText = "Risky";
        if (data.state === "deliverable" && data.format_valid) {
            badgeClass = "badge-valid"; badgeIcon = "fa-circle-check"; badgeText = "Valid";
        } else if (data.state === "undeliverable" || !data.format_valid) {
            badgeClass = "badge-invalid"; badgeIcon = "fa-circle-xmark"; badgeText = "Invalid";
        }

        resultsHeader.innerHTML = `
            <span class="status-badge ${badgeClass}"><i class="fas ${badgeIcon}"></i> ${badgeText}</span>
            <span class="results-email">${data.email || email}</span>
        `;

        resultCont.innerHTML = Object.keys(friendlyLabels)
            .filter(k => data[k] !== undefined && data[k] !== "" && data[k] !== null || k === "catch_all")
            .map(k => {
                const val = data[k];
                let displayVal = val;
                let cls = "";
                if (val === true) { displayVal = "Yes"; cls = "true"; }
                else if (val === false) { displayVal = "No"; cls = "false"; }
                else if (val === null) { displayVal = "Unknown"; cls = "null-val"; }
                else if (k === "score") { displayVal = Math.round(val * 100) + "%"; }
                return `
                    <div class="result-item">
                        <div class="result-key">${friendlyLabels[k]}</div>
                        <div class="result-value ${cls}">${displayVal}</div>
                    </div>`;
            }).join("");

        resultCard.style.display = "block";
        resultCard.scrollIntoView({ behavior: "smooth", block: "start" });

    } catch (err) {
        alert("Error: " + err.message + "\n\nMake sure you've added your API key in script.js");
    }

    btn.innerHTML = '<i class="fas fa-search"></i> Validate';
    btn.disabled = false;
});
