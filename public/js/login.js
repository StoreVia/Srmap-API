(function () {
    document.addEventListener("contextmenu", (event) => event.preventDefault());
})();

const eyes = document.querySelector(".eyes");
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const pupils = document.querySelectorAll(".pupil");
usernameInput.addEventListener("input", () => {
    let words = usernameInput.value.split(/\s+/).length;
    let moveX = Math.min(words * 6, 24);
    pupils.forEach((pupil) => {
        pupil.style.transform = `translate(${moveX}px, 8px)`;
    });
});
passwordInput.addEventListener("focus", () => {
    eyes.classList.add("closed-eyes");
});
document.addEventListener("click", (e) => {
    if (e.target !== passwordInput) {
        eyes.classList.remove("closed-eyes");
    }
});

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

if (getCookie("un") && getCookie("pass")) {
    window.location.href = '/dashboard';
}
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    setLoginCookies(username, password);
    window.location.href = '/dashboard';
});

document.querySelector('.forgot-password[type="test"]').addEventListener('click', function() {
    setLoginCookies('AP24110000000', '123');
    window.location.href = '/dashboard';
});

function setLoginCookies(username, password) {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    document.cookie = `un=${username}; expires=${expiryDate.toUTCString()}; path=/`;
    document.cookie = `pass=${password}; expires=${expiryDate.toUTCString()}; path=/`;
}

function togglePassword() {
    const eyes = document.querySelector(".eyes");
    const passwordInput = document.getElementById("password");
    const icon = document.querySelector(".toggle-password");
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.textContent = "🙈";
        eyes.classList.remove("closed-eyes");
    } else {
        passwordInput.type = "password";
        icon.textContent = "👀";
        eyes.classList.add("closed-eyes");
    }
}

