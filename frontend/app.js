const list = document.getElementById("items");
const status = document.getElementById("status");
const form = document.getElementById("form");
const input = document.getElementById("name");

async function api(path, options) {
  const res = await fetch(path, options);
  if (!res.ok) throw new Error("HTTP " + res.status + ": " + (await res.text()).trim());
  return res.status === 204 ? null : res.json();
}

function render(items) {
  list.replaceChildren();
  for (const it of items) {
    const li = document.createElement("li");

    const label = document.createElement("label");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = it.done;
    box.addEventListener("change", () => act(() => api("/api/items/" + it.id, { method: "PATCH" })));
    const text = document.createElement("span");
    text.textContent = it.name;
    if (it.done) text.className = "done";
    label.append(box, text);

    const del = document.createElement("button");
    del.type = "button";
    del.className = "delete";
    del.textContent = "Удалить";
    del.setAttribute("aria-label", "Удалить: " + it.name);
    del.addEventListener("click", () => act(() => api("/api/items/" + it.id, { method: "DELETE" })));

    li.append(label, del);
    list.appendChild(li);
  }
  const done = items.filter((it) => it.done).length;
  status.textContent = items.length === 0
    ? "Задач пока нет."
    : "Выполнено: " + done + " из " + items.length;
}

async function load() {
  try {
    render(await api("/api/items"));
  } catch (e) {
    status.textContent = "Не удалось получить данные: " + e.message;
  }
}

async function act(fn) {
  try {
    await fn();
    await load();
  } catch (e) {
    status.textContent = "Ошибка: " + e.message;
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = input.value.trim();
  if (!name) return;
  act(() => api("/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })).then(() => {
    input.value = "";
    input.focus();
  });
});

load();