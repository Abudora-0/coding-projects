let result = {  
        "email": "support@emailvalidation.io",
        "user": "support",
        "tag": "",
        "domain": "emailvalidation.io",
        "smtp_check": true,
        "mx_found": true,
        "did_you_mean": "",
        "role": true,
        "disposable": false,
        "score": 0.64,
        "state": "deliverable",
        "reason": "valid_mailbox",
        "free": false,
        "format_valid": true,
        "catch_all": null
}

sumbitBtn.addEventListener("click", async (e)=>{
    e.preventDefault();

    resultCont.innerHTML = `<img width="123" src="img/loading.svg" alt="">`
    let key = "ema_live_nfCPC9D43rOE7mmsf1bMV1InVRFzNpnedFwXFSNF";
    let email = document.getElementById("username").value;
    let url = `https://api.emailvalidation.io/v1/info?apikey=${key}&email=${email}`;
    let res = await fetch(url);
    result = await res.json();
    let str = ``;
    for (key of Object.keys(result)){
        if(result[key] !== "" && result[key] !== " "){
            str = str + `<div>${key}: ${result[key]}</div>`
        }
    }

    resultCont.innerHTML = str;

})