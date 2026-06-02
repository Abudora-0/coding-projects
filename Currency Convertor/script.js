// Get a free API key from https://currencyapi.com and replace YOUR_API_KEY_HERE
const API_KEY = "YOUR_API_KEY_HERE";

const populate = async (value, currency) => {
    const btn = document.querySelector(".btn");
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    btn.disabled = true;

    try {
        const url = `https://api.currencyapi.com/v3/latest?apikey=${API_KEY}&base_currency=${currency}`;
        const res = await fetch(url);
        const rJson = await res.json();

        if (rJson.message) throw new Error(rJson.message);

        const output = document.getElementById("output");
        const tableBody = document.querySelector("tbody");
        const meta = document.getElementById("outputMeta");

        output.style.display = "block";
        meta.textContent = `${value} ${currency} →`;

        tableBody.innerHTML = Object.keys(rJson.data).map(key => {
            const converted = (rJson.data[key].value * value).toLocaleString(undefined, { maximumFractionDigits: 2 });
            return `<tr>
                <td>${rJson.data[key].code}</td>
                <td>${rJson.data[key].code}</td>
                <td><strong>${converted}</strong></td>
            </tr>`;
        }).join("");

        output.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
        alert("Error: " + err.message + "\n\nMake sure you've added your API key in script.js");
    }

    btn.innerHTML = '<i class="fas fa-exchange-alt"></i> Convert';
    btn.disabled = false;
};

document.querySelector(".btn").addEventListener("click", (e) => {
    e.preventDefault();
    const value = parseFloat(document.getElementById("quantity").value);
    const currency = document.getElementById("currency").value;
    if (!value || value <= 0) return;
    populate(value, currency);
});
