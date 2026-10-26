const itemInput = document.getElementById("itemInput")
const priceInput = document.getElementById("priceInput")
const addButton = document.getElementById("addButton")
const activeList = document.getElementById("activeList")
const completedList = document.getElementById("completedList")
const totalAmount = document.getElementById("totalAmount")
const activeCount = document.getElementById("activeCount")
const completedCount = document.getElementById("completedCount")
const legacyInput = document.getElementById("myinput")
const legacyButton = document.getElementById("mybutton")
const legacyList = document.getElementById("jsUl")

let items = []

function loadItems() {
  try {
    const savedItems = JSON.parse(localStorage.getItem("k-shopping-items"))
    if (Array.isArray(savedItems)) {
      items = savedItems
    }
  } catch (error) {
    console.warn("Unable to load saved items.", error)
  }
}

function saveItems() {
  try {
    localStorage.setItem("k-shopping-items", JSON.stringify(items))
  } catch (error) {
    console.warn("Unable to save items.", error)
  }
}

function formatMoney(value) {
  return `<i class="fa-solid fa-naira-sign" aria-hidden="true"></i> ${Number(value || 0).toFixed(2)}`
}

function addItem() {
  const inputValue = (itemInput ? itemInput.value : legacyInput ? legacyInput.value : "").trim()
  const rawPrice = priceInput ? priceInput.value : ""
  const itemName = inputValue
  const itemPrice = Number.parseFloat(rawPrice) || 0

  if (!itemName) {
    const focusTarget = itemInput || legacyInput
    if (focusTarget) focusTarget.focus()
    return
  }

  items.push({
    id: Date.now() + Math.random(),
    name: itemName,
    price: itemPrice,
    completed: false,
  })

  if (itemInput) itemInput.value = ""
  if (priceInput) priceInput.value = ""
  if (legacyInput) legacyInput.value = ""

  saveItems()
  renderItems()
  updateTotal()

  if (itemInput) itemInput.focus()
}

function toggleComplete(id) {
  items = items.map((item) =>
    item.id === id ? { ...item, completed: !item.completed } : item
  )

  saveItems()
  renderItems()
  updateTotal()
}

function deleteItem(id) {
  items = items.filter((item) => item.id !== id)
  saveItems()
  renderItems()
  updateTotal()
}

function renderList(listElement, itemCollection, isCompleted) {
  if (!listElement) return

  listElement.innerHTML = ""

  if (!itemCollection.length) {
    const emptyRow = document.createElement("li")
    emptyRow.className = "empty-state"
    emptyRow.textContent = isCompleted ? "No completed items yet" : "No items yet"
    listElement.appendChild(emptyRow)
    return
  }

  itemCollection.forEach((item) => {
    const li = document.createElement("li")
    li.className = `list-item${item.completed ? " completed" : ""}`

    li.innerHTML = `
      <input type="checkbox" class="checkbox" ${item.completed ? "checked" : ""} aria-label="Mark ${item.name} as complete">
      <div class="item-content">
        <span class="item-name">${item.name}</span>
        <span class="item-price">${formatMoney(item.price)}</span>
      </div>
      <button class="delete-button" type="button" aria-label="Delete ${item.name}">🗑️</button>
    `

    const checkbox = li.querySelector(".checkbox")
    const deleteButton = li.querySelector(".delete-button")

    checkbox.addEventListener("change", () => toggleComplete(item.id))
    deleteButton.addEventListener("click", () => deleteItem(item.id))

    listElement.appendChild(li)
  })
}

function renderItems() {
  const activeItems = items.filter((item) => !item.completed)
  const completedItems = items.filter((item) => item.completed)

  renderList(activeList, activeItems, false)
  renderList(completedList, completedItems, true)

  if (legacyList) {
    legacyList.innerHTML = items
      .map(
        (item) => `
          <li class="legacy-item ${item.completed ? "completed" : ""}">
            <span>${item.name}</span>
            <button type="button" data-item-id="${item.id}" class="legacy-delete-btn">Delete</button>
          </li>
        `
      )
      .join("")

    legacyList.querySelectorAll(".legacy-delete-btn").forEach((button) => {
      button.addEventListener("click", () => deleteItem(Number(button.dataset.itemId)))
    })
  }

  if (activeCount) activeCount.textContent = String(activeItems.length)
  if (completedCount) completedCount.textContent = String(completedItems.length)
}

function updateTotal() {
  const total = items
    .filter((item) => !item.completed)
    .reduce((sum, item) => sum + Number(item.price || 0), 0)

  if (totalAmount) totalAmount.innerHTML = formatMoney(total)
}

if (addButton) {
  addButton.addEventListener("click", addItem)
}

if (legacyButton) {
  legacyButton.addEventListener("click", addItem)
}

if (itemInput) {
  itemInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addItem()
  })
}

if (priceInput) {
  priceInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addItem()
  })
}

if (legacyInput) {
  legacyInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addItem()
  })
}

loadItems()
renderItems()
updateTotal()
