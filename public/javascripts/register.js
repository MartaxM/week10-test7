if (document.readyState !== "loading") {
    initializeCode();
} else {
    document.addEventListener("DOMContentLoaded", function () {
        initializeCode();
    });
}

function initializeCode() {
    document.getElementById("register-form").addEventListener("submit", onSubmit);
}

function onSubmit(event) {


    event.preventDefault();
    const formData = new FormData(event.target);
    // from form to json object
    let formDataObject = Object.fromEntries(formData.entries());
    // from json to string
    let formDataJsonString = JSON.stringify(formDataObject);

    fetch("/api/user/register", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: formDataJsonString
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.errors) {
                let passwordbad = false;
                data.errors.forEach((e) => { if (e.param == "password" && e.msg == "Invalid value") { passwordbad = true } })
                console.log(data.errors);
                if (passwordbad) {
                    document.getElementById("error").innerHTML = "Password is not strong enough";
                }
                else {
                    document.getElementById("error").innerHTML = "Very strange error!";
                }
            }
            else if (data.email) {
                document.getElementById("error").innerHTML = data.email;
            } else {
                window.location.href = "/login.html";
            }
        })
}