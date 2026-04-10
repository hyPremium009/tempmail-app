async function loadEmails() {
  const res = await fetch("/emails");
  const data = await res.json();

  const box = document.getElementById("emailList");

  box.innerHTML = data.map(e => `
    <div class="card">
      <b>From:</b> ${e.from} <br>
      <b>To:</b> ${e.to} <br>
      <b>Subject:</b> ${e.subject} <br>
      <p>${e.text || ""}</p>
    </div>
  `).join("");
}

setInterval(loadEmails, 3000);
loadEmails();