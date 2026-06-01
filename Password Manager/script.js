function maskPassword(pass){
    let str = ""
    for(let index= 0; index < pass.length; index++){
        str += "*";
    }
    return str;
}

function copyText(txt){
    navigator.clipboard.writeText(txt).then(
        ()=>{
            document.getElementById("alert").style.display = "inline"
            setTimeout(() => {
                document.getElementById("alert").style.display = "none"
            }, 2000);
        },
        ()=>{
            alert("Failed! Couldn't Copy")
        },
    );
}

const deletePassword = (website)=>{
    let data = localStorage.getItem("passwords");
    let arr = JSON.parse(data);
    arrUpdated = arr.filter((e)=>{
        return e.website != website;
    })
    localStorage.setItem("passwords", JSON.stringify(arrUpdated))
    alert("Successfully Deleted")
    showPasswords()
}
const showPasswords = () =>{
    let tb = document.querySelector("table");
    let data = localStorage.getItem("passwords")
    if(data == null || JSON.parse(data).length == 0){
        tb.innerHTML = "No Data is Found"
    }
    else{
        tb.innerHTML = `<tr>
        <th>Website</th>
        <th>Username</th>
        <th>Passwords</th>
        <th>Delete</th>
        </tr>`

        let arr = JSON.parse(data);
        let str = ""
        for (let index = 0; index < arr.length; index++) {
            const element = arr[index];


            str += `<tr>
            <td>${element.website} <img class="copy" onclick="copyText('${element.website}')" src="copy.svg" alt="copy btn" width="10" height="10"</td>
            <td>${element.username} <img class="copy"  onclick="copyText('${element.username}')" src="copy.svg" alt="copy btn" width="10" height="10"</td>
            <td>${maskPassword(element.password)} <img class="copy"  onclick="copyText('${element.password}')" src="copy.svg" alt="copy btn" width="10" height="10"</td>
            <td><button class="btnsm" onclick="deletePassword('${element.website}')">Delete</button></td>
            </tr>
            `
        }
        tb.innerHTML = tb.innerHTML + str;
    }
    website.value = ""
    username.value = ""
    password.value = ""
}


showPasswords()
document.querySelector(".btn").addEventListener("click", (e)=>{
    e.preventDefault();
    let passwords = localStorage.getItem("passwords")
    if(passwords == null){
        let json = []
        json.push({website: website.value, username: username.value, password: password.value})
        localStorage.setItem("passwords", JSON.stringify(json))
    }
    else{
        let json = JSON.parse(localStorage.getItem("passwords"));
        json.push({website: website.value, username: username.value, password: password.value})
        localStorage.setItem("passwords", JSON.stringify(json))
    
    }
    showPasswords()
})