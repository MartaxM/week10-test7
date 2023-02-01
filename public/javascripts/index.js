if (document.readyState !== "loading") {
    initializeCode();
} else {
    document.addEventListener("DOMContentLoaded", function () {
        initializeCode();
    });
}

function initializeCode() {
    const authToken = localStorage.getItem("auth_token");
    if (authToken) {
        // document.getElementById("login").style.display = "none";
        // document.getElementById("register").style.display = "none";
        // document.getElementById("logout").style.display = "inline-block";
        // document.getElementById("email").style.display = "inline-block";
        let userContainer = document.getElementById("user");
        let email = document.createElement("p");
        let logout = document.createElement("button");
        let addtodos = document.createElement("input");
        logout.innerHTML = "Logout";
        logout.setAttribute("onclick", "logOut()");
        logout.setAttribute("id", "logout");
        addtodos.setAttribute("id", "add-item");
        addtodos.setAttribute("type", "text");

        fetch("/api/private", {
            method: "GET",
            headers: {
                "authorization": "Bearer " + authToken
            }
        })
            .then((response) => response.json())
            .then((m) => {
                email.innerHTML = m.email;
            })
            .catch((e) => {
                console.log("error" + e)
            })

        addtodos.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                addTodo(authToken, addtodos.value);
            }
        });

        userContainer.appendChild(logout);
        userContainer.appendChild(email);
        userContainer.appendChild(addtodos);
        showTodos(authToken);
    } else {
        // document.getElementById("login").style.display = "inline-block";
        // document.getElementById("register").style.display = "inline-block";
        // document.getElementById("logout").style.display = "none";
        // document.getElementById("email").style.display = "none";
        let linksContainer = document.getElementById("links");
        let login = document.createElement("a");
        let register = document.createElement("a");
        login.innerHTML = "Login";
        register.innerHTML = "Register";
        login.setAttribute("href", "/login.html");
        register.setAttribute("href", "/register.html");

        linksContainer.appendChild(login);
        linksContainer.appendChild(register)
    }
}

function logOut() {
    localStorage.removeItem("auth_token");
    window.location.href = "/";
}

function addTodo(authToken, todo) {
    let todos = [];
    todos.push(todo);
    fetch("/api/todos", {
        method: "POST",
        body: JSON.stringify({ "items": todos }),
        headers: {
            "authorization": "Bearer " + authToken,
            'Content-Type': 'application/json'
        }
    })
        .then((response) => response.text())
}

function showTodos(authToken) {
    const todosContainer = document.getElementById("todos");
    fetch("/api/user/todos", {
        method: "GET",
        headers: {
            "authorization": "Bearer " + authToken,
        }
    }).then((response) => response.json())
        .then((r) => {
            r.items.forEach((todo) => {
                let p = document.createElement("p")
                p.innerHTML = todo;
                todosContainer.appendChild(p);
            });
            console.log(r.items);
        })
        .catch((e) => {
            console.log("error" + e)
        })
}