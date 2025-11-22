import { Chart } from "@/components/ui/chart"
// API Configuration
const API_BASE_URL = "/api"
let currentPage = 0
const itemsPerPage = 10
let authToken = localStorage.getItem("token")
let currentUser = JSON.parse(localStorage.getItem("user") || "{}")
let categoryChart, stockChart
const bootstrap = window.bootstrap // Declare the bootstrap variable

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  if (authToken) {
    showDashboard()
  } else {
    showLogin()
  }

  setupEventListeners()
})

// Event Listeners
function setupEventListeners() {
  // Navigation
  document.querySelectorAll("[data-page]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const page = e.target.closest("[data-page]").dataset.page
      navigateTo(page)
    })
  })

  // Login
  document.getElementById("loginForm")?.addEventListener("submit", handleLogin)
  document.getElementById("logoutBtn")?.addEventListener("click", handleLogout)

  // Add Item Form
  document.getElementById("addItemForm")?.addEventListener("submit", handleAddItem)

  // Edit Item Form
  document.getElementById("editItemForm")?.addEventListener("submit", handleEditItem)

  // Search and Filters
  document.getElementById("searchInput")?.addEventListener("input", (e) => {
    currentPage = 0
    loadItems(e.target.value)
  })

  document.getElementById("categoryFilter")?.addEventListener("change", () => {
    currentPage = 0
    loadItems()
  })

  // Export and Reports
  document.getElementById("exportBtn")?.addEventListener("click", exportToCSV)
  document.getElementById("reportLowStock")?.addEventListener("click", () => generateReport("low-stock"))
  document.getElementById("reportValue")?.addEventListener("click", () => generateReport("value"))
  document.getElementById("reportAll")?.addEventListener("click", () => generateReport("all"))
}

// Authentication
async function handleLogin(e) {
  e.preventDefault()
  const username = document.getElementById("username").value
  const password = document.getElementById("password").value

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    const data = await response.json()

    if (data.success) {
      authToken = data.data.token
      currentUser = data.data
      localStorage.setItem("token", authToken)
      localStorage.setItem("user", JSON.stringify(currentUser))
      document.getElementById("userDisplay").textContent = `Welcome, ${currentUser.fullName}`

      // Show admin menu if user is admin
      if (currentUser.role === "ADMIN") {
        document.getElementById("adminMenu").style.display = "block"
      }

      showDashboard()
    } else {
      showAlert("danger", "Login failed: " + data.message)
    }
  } catch (error) {
    console.error("Login error:", error)
    showAlert("danger", "Connection error")
  }
}

function handleLogout() {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  authToken = null
  currentUser = {}
  showLogin()
}

// Navigation
function navigateTo(page) {
  document.querySelectorAll("[data-page]").forEach((link) => {
    link.classList.remove("active")
  })
  document.querySelector(`[data-page="${page}"]`)?.classList.add("active")

  document.querySelectorAll(".page-content, #loginPage").forEach((el) => {
    el.style.display = "none"
  })

  switch (page) {
    case "dashboard":
      document.getElementById("dashboardPage").style.display = "block"
      loadDashboard()
      break
    case "items":
      document.getElementById("itemsPage").style.display = "block"
      loadItems()
      break
    case "add-item":
      document.getElementById("addItemPage").style.display = "block"
      loadCategories("itemCategory")
      break
    case "low-stock":
      document.getElementById("lowStockPage").style.display = "block"
      loadLowStockItems()
      break
    case "reports":
      document.getElementById("reportsPage").style.display = "block"
      break
    case "activity-log":
      document.getElementById("activityLogPage").style.display = "block"
      loadActivityLog()
      break
  }
}

function showLogin() {
  document.querySelectorAll(".page-content").forEach((el) => (el.style.display = "none"))
  document.getElementById("loginPage").style.display = "block"
  document.querySelector(".navbar").style.display = "none"
  document.querySelector(".sidebar").style.display = "none"
}

function showDashboard() {
  document.querySelector(".navbar").style.display = "block"
  document.querySelector(".sidebar").style.display = "block"
  document.getElementById("loginPage").style.display = "none"
  navigateTo("dashboard")
}

// Dashboard
async function loadDashboard() {
  try {
    // Fetch stats
    const itemsResponse = await fetchAPI(`${API_BASE_URL}/items?page=0&size=1`)
    const lowStockResponse = await fetchAPI(`${API_BASE_URL}/items/low-stock`)

    if (itemsResponse.success) {
      document.getElementById("totalItems").textContent = itemsResponse.data.totalElements || 0
    }

    if (lowStockResponse.success) {
      document.getElementById("lowStockCount").textContent = lowStockResponse.data.length || 0
    }

    loadCharts()
  } catch (error) {
    console.error("Dashboard error:", error)
  }
}

async function loadCharts() {
  try {
    const response = await fetchAPI(`${API_BASE_URL}/items?page=0&size=100`)
    if (!response.success) return

    const items = response.data.content || []

    // Category Chart
    const categoryData = {}
    items.forEach((item) => {
      categoryData[item.categoryName] = (categoryData[item.categoryName] || 0) + 1
    })

    const categoryCtx = document.getElementById("categoryChart")?.getContext("2d")
    if (categoryCtx) {
      if (categoryChart) categoryChart.destroy()
      categoryChart = new Chart(categoryCtx, {
        type: "doughnut",
        data: {
          labels: Object.keys(categoryData),
          datasets: [
            {
              data: Object.values(categoryData),
              backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom" },
          },
        },
      })
    }

    // Stock Chart
    const stockCtx = document.getElementById("stockChart")?.getContext("2d")
    if (stockCtx) {
      if (stockChart) stockChart.destroy()
      const stockLevels = items.slice(0, 10).map((item) => item.itemName)
      const quantities = items.slice(0, 10).map((item) => item.quantity)

      stockChart = new Chart(stockCtx, {
        type: "bar",
        data: {
          labels: stockLevels,
          datasets: [
            {
              label: "Stock Quantity",
              data: quantities,
              backgroundColor: "#3b82f6",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true },
          },
        },
      })
    }
  } catch (error) {
    console.error("Charts error:", error)
  }
}

// Items
async function loadItems(search = "") {
  try {
    const url = search
      ? `${API_BASE_URL}/items/search?query=${encodeURIComponent(search)}&page=${currentPage}&size=${itemsPerPage}`
      : `${API_BASE_URL}/items?page=${currentPage}&size=${itemsPerPage}`

    const response = await fetchAPI(url)
    if (!response.success) return

    const items = response.data.content || []
    const tbody = document.querySelector("#itemsTable tbody")
    tbody.innerHTML = ""

    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No items found</td></tr>'
      return
    }

    items.forEach((item) => {
      const row = tbody.insertRow()
      row.innerHTML = `
                <td>${item.itemId}</td>
                <td><strong>${item.itemName}</strong></td>
                <td>${item.categoryName}</td>
                <td><span class="badge ${item.quantity <= item.reorderLevel ? "bg-warning" : "bg-success"}">${item.quantity}</span></td>
                <td>PKR ${Number.parseFloat(item.unitPrice).toFixed(2)}</td>
                <td>PKR ${Number.parseFloat(item.totalValue).toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editItem(${item.itemId})">Edit</button>
                    ${currentUser.role === "ADMIN" ? `<button class="btn btn-sm btn-danger" onclick="deleteItem(${item.itemId})">Delete</button>` : ""}
                </td>
            `
    })

    // Pagination
    loadPagination(response.data.totalPages)
  } catch (error) {
    console.error("Load items error:", error)
  }
}

async function handleAddItem(e) {
  e.preventDefault()

  const item = {
    itemName: document.getElementById("itemName").value,
    category: { categoryId: Number.parseInt(document.getElementById("itemCategory").value) },
    quantity: Number.parseInt(document.getElementById("itemQuantity").value),
    unitPrice: Number.parseFloat(document.getElementById("itemPrice").value),
    sku: document.getElementById("itemSKU").value,
    location: document.getElementById("itemLocation").value,
    description: document.getElementById("itemDescription").value,
  }

  try {
    const response = await fetchAPI(`${API_BASE_URL}/items`, {
      method: "POST",
      body: JSON.stringify(item),
    })

    if (response.success) {
      showAlert("success", "Item added successfully")
      document.getElementById("addItemForm").reset()
      navigateTo("items")
    } else {
      showAlert("danger", response.message)
    }
  } catch (error) {
    console.error("Add item error:", error)
    showAlert("danger", "Error adding item")
  }
}

async function editItem(itemId) {
  try {
    const response = await fetchAPI(`${API_BASE_URL}/items/${itemId}`)
    if (!response.success) return

    const item = response.data
    document.getElementById("editItemId").value = itemId
    document.getElementById("editItemName").value = item.itemName
    document.getElementById("editItemQuantity").value = item.quantity
    document.getElementById("editItemPrice").value = item.unitPrice

    bootstrap.Modal(document.getElementById("editModal")).show()
  } catch (error) {
    console.error("Edit item error:", error)
  }
}

async function handleEditItem(e) {
  e.preventDefault()
  const itemId = document.getElementById("editItemId").value

  const item = {
    itemName: document.getElementById("editItemName").value,
    quantity: Number.parseInt(document.getElementById("editItemQuantity").value),
    unitPrice: Number.parseFloat(document.getElementById("editItemPrice").value),
  }

  try {
    const response = await fetchAPI(`${API_BASE_URL}/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(item),
    })

    if (response.success) {
      showAlert("success", "Item updated successfully")
      bootstrap.Modal.getInstance(document.getElementById("editModal")).hide()
      loadItems()
    } else {
      showAlert("danger", response.message)
    }
  } catch (error) {
    console.error("Update item error:", error)
  }
}

async function deleteItem(itemId) {
  if (!confirm("Are you sure you want to delete this item?")) return

  try {
    const response = await fetchAPI(`${API_BASE_URL}/items/${itemId}`, {
      method: "DELETE",
    })

    if (response.success) {
      showAlert("success", "Item deleted successfully")
      loadItems()
    } else {
      showAlert("danger", response.message)
    }
  } catch (error) {
    console.error("Delete item error:", error)
  }
}

// Categories
async function loadCategories(selectId) {
  try {
    const response = await fetchAPI(`${API_BASE_URL}/categories`)
    if (!response.success) return

    const select = document.getElementById(selectId)
    select.innerHTML = '<option value="">Select Category</option>'

    response.data.forEach((category) => {
      const option = document.createElement("option")
      option.value = category.categoryId
      option.textContent = category.categoryName
      select.appendChild(option)
    })
  } catch (error) {
    console.error("Load categories error:", error)
  }
}

// Low Stock Items
async function loadLowStockItems() {
  try {
    const response = await fetchAPI(`${API_BASE_URL}/items/low-stock`)
    if (!response.success) return

    const tbody = document.querySelector("#lowStockTable tbody")
    tbody.innerHTML = ""

    response.data.forEach((item) => {
      const row = tbody.insertRow()
      row.innerHTML = `
                <td>${item.itemName}</td>
                <td>${item.categoryName}</td>
                <td><strong>${item.quantity}</strong></td>
                <td>${item.reorderLevel}</td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="addStockModal(${item.itemId})">
                        <i class="fas fa-plus"></i> Add Stock
                    </button>
                </td>
            `
    })
  } catch (error) {
    console.error("Low stock error:", error)
  }
}

async function addStockModal(itemId) {
  const quantity = prompt("Enter quantity to add:")
  if (!quantity) return

  try {
    const response = await fetchAPI(`${API_BASE_URL}/items/${itemId}/add-stock?quantity=${quantity}`, {
      method: "POST",
    })

    if (response.success) {
      showAlert("success", "Stock added successfully")
      loadLowStockItems()
    } else {
      showAlert("danger", response.message)
    }
  } catch (error) {
    console.error("Add stock error:", error)
  }
}

// Activity Log
async function loadActivityLog() {
  try {
    const response = await fetchAPI(`${API_BASE_URL}/activity-logs?page=0&size=50`)
    if (!response.success) return

    const tbody = document.querySelector("#activityTable tbody")
    tbody.innerHTML = ""

    const logs = response.data.content || response.data || []
    logs.forEach((log) => {
      const row = tbody.insertRow()
      const date = new Date(log.createdAt).toLocaleString()
      row.innerHTML = `
                <td>${date}</td>
                <td>${log.user?.fullName || "System"}</td>
                <td><span class="badge bg-info">${log.action}</span></td>
                <td>${log.description || "-"}</td>
            `
    })
  } catch (error) {
    console.error("Activity log error:", error)
  }
}

// Reports
function generateReport(type) {
  const date = new Date().toISOString().split("T")[0]
  const filename = `report-${type}-${date}.csv`

  switch (type) {
    case "low-stock":
      exportLowStockReport(filename)
      break
    case "value":
      exportValueReport(filename)
      break
    case "all":
      exportToCSV()
      break
  }
}

async function exportToCSV() {
  try {
    const response = await fetchAPI(`${API_BASE_URL}/items?page=0&size=10000`)
    if (!response.success) return

    const items = response.data.content || []
    let csv = "Item ID,Item Name,Category,Quantity,Unit Price,Total Value,Location,Created Date\n"

    items.forEach((item) => {
      csv += `${item.itemId},"${item.itemName}","${item.categoryName}",${item.quantity},${item.unitPrice},${item.totalValue},"${item.location || ""}","${item.createdAt}"\n`
    })

    downloadCSV(csv, `inventory-${new Date().toISOString().split("T")[0]}.csv`)
  } catch (error) {
    console.error("Export error:", error)
  }
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

// Pagination
function loadPagination(totalPages) {
  const pagination = document.getElementById("pagination")
  pagination.innerHTML = ""

  if (currentPage > 0) {
    const li = document.createElement("li")
    li.className = "page-item"
    li.innerHTML = `<a class="page-link" href="#" onclick="goToPage(${currentPage - 1})">Previous</a>`
    pagination.appendChild(li)
  }

  for (let i = 0; i < totalPages && i < 5; i++) {
    const li = document.createElement("li")
    li.className = `page-item ${i === currentPage ? "active" : ""}`
    li.innerHTML = `<a class="page-link" href="#" onclick="goToPage(${i})">${i + 1}</a>`
    pagination.appendChild(li)
  }

  if (currentPage < totalPages - 1) {
    const li = document.createElement("li")
    li.className = "page-item"
    li.innerHTML = `<a class="page-link" href="#" onclick="goToPage(${currentPage + 1})">Next</a>`
    pagination.appendChild(li)
  }
}

function goToPage(page) {
  currentPage = page
  loadItems()
}

// Utilities
async function fetchAPI(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  return response.json()
}

function showAlert(type, message) {
  const alertDiv = document.createElement("div")
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`
  alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `

  const mainContent = document.getElementById("mainContent")
  mainContent.insertBefore(alertDiv, mainContent.firstChild)

  setTimeout(() => alertDiv.remove(), 5000)
}

// Additional Export Functions
async function exportLowStockReport(filename) {
  try {
    const response = await fetchAPI(`${API_BASE_URL}/items/low-stock`)
    if (!response.success) return

    let csv = "Item Name,Category,Current Quantity,Reorder Level,Shortage\n"

    response.data.forEach((item) => {
      const shortage = item.reorderLevel - item.quantity
      csv += `"${item.itemName}","${item.categoryName}",${item.quantity},${item.reorderLevel},${shortage}\n`
    })

    downloadCSV(csv, filename)
  } catch (error) {
    console.error("Report error:", error)
  }
}

async function exportValueReport(filename) {
  try {
    const response = await fetchAPI(`${API_BASE_URL}/items?page=0&size=10000`)
    if (!response.success) return

    const items = response.data.content || []
    let csv = "Item Name,Category,Quantity,Unit Price,Total Value\n"
    let grandTotal = 0

    items.forEach((item) => {
      csv += `"${item.itemName}","${item.categoryName}",${item.quantity},${item.unitPrice},${item.totalValue}\n`
      grandTotal += Number.parseFloat(item.totalValue)
    })

    csv += `\nGrand Total Value (PKR),${grandTotal.toFixed(2)}\n`
    downloadCSV(csv, filename)
  } catch (error) {
    console.error("Value report error:", error)
  }
}
