const list = document.getElementById("items");
const status = document.getElementById("status");

async function load() {
  status.textContent = "Загружаю…";
  list.replaceChildren();
  try {
    const res = await fetch("/api/items");
    if (!res.ok) throw new Error("HTTP " + res.status + ": " + (await res.text()));
    const items = await res.json();
    if (items.length === 0) {
      status.textContent = "В таблице items пока нет записей.";
      return;
    }
    for (const it of items) {
      const li = document.createElement("li");
      li.textContent = "#" + it.id + " — " + it.name;
      list.appendChild(li);
    }
    status.textContent = "Записей: " + items.length;
  } catch (e) {
    status.textContent = "Не удалось получить данные: " + e.message;
  }
}

document.getElementById("reload").addEventListener("click", load);
load();
