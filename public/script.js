let currentEmail = "";
let isLogin = true;

// AUTH UI
function openAuth() {
  document.getElementById("authBox").style.display = "block";
}

function toggleAuth() {
  isLogin = !isLogin;
  document.getElementById("authTitle").innerText =
    isLogin ? "Login" : "Register";
}

// SUBMIT LOGIN / REGISTER
async function submitAuth() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const url = isLogin ? "/login" : "/register";

  const res = await fetch(url, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (data.error) return alert(data.error);

  alert(data.status);

  document.getElementById("authBox").style.display = "none";
  document.getElementById("userBox").style.display = "flex";
  document.getElementById("userBox").innerText = username[0].toUpperCase();
}

// EMAIL
function customEmail() {
  const name = prompt("Nama email:");
  currentEmail = name + "@hypremium.com";
  document.getElementById("emailText").innerText = currentEmail;
}

function deleteEmail() {
  const rand = Math.random().toString(36).substring(2, 8);
  currentEmail = rand + "@hypremium.com";
  document.getElementById("emailText").innerText = currentEmail;
}

function copyEmail() {
  navigator.clipboard.writeText(currentEmail);
  alert("Copied!");
}

function refreshInbox() {
  document.getElementById("result").innerText = "Belum ada email masuk";
}