const populate = async (value, currency) =>{
    let myStr = ""
    // Get a free API key from https://currencyapi.com and replace YOUR_API_KEY_HERE
    const API_KEY = "YOUR_API_KEY_HERE"
    url = `https://api.currencyapi.com/v3/latest?apikey=${API_KEY}&base_currency=` + currency
    let res = await fetch(url)
    let rJson = await res.json()
    document.querySelector(".output").style.display ="block"

    for(let key of Object.keys(rJson["data"])){
        myStr += `
            <tr>
            <td>${key}</td>
            <td>${rJson["data"][key]["code"]}</td>
            <td>${Math.round(rJson["data"][key]["value"] * value)}</td>
            </tr>
        `
    }
    const tableBody = document.querySelector('tbody')
    tableBody.innerHTML = myStr;
}

const btn = document.querySelector(".btn");
btn.addEventListener("click", (e)=>{
    e.preventDefault();
    const value = parseInt(document.querySelector("input[name='quantity']").value);
    const currency = document.querySelector("select[name='currency']").value;
    console.log(value)
    console.log(currency)
    populate(value,currency);
})