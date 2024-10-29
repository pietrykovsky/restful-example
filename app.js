const API_URL = 'http://localhost:8000/api';
let editItemId = null;

// DOM Elements
const createForm = document.getElementById('createForm');
const nameInput = document.getElementById('nameInput');
const descriptionInput = document.getElementById('descriptionInput');
const itemsList = document.getElementById('itemsList');
const editModal = document.getElementById('editModal');
const editNameInput = document.getElementById('editName');
const editDescriptionInput = document.getElementById('editDescription');
const saveEditButton = document.getElementById('saveEditButton');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadItems();
    setupEventListeners();
});

function setupEventListeners() {
    saveEditButton.addEventListener('click', () => {
        if (editItemId !== null) {
            saveUpdate(editItemId);
        }
    });
}

// Create
async function createItem() {
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    
    if (!name || !description) {
        showAlert('Please fill in all fields', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, description }),
        });
        
        if (response.ok) {
            nameInput.value = '';
            descriptionInput.value = '';
            loadItems();
            showAlert('Item created successfully', 'success');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error creating item', 'danger');
    }
}

// Read
async function loadItems() {
    try {
        const response = await fetch(`${API_URL}/items`);
        const items = await response.json();
        displayItems(items);
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error loading items', 'danger');
    }
}

// Update
function updateItem(id, name, description) {
    editItemId = id;
    editNameInput.value = name;
    editDescriptionInput.value = description;
    
    const modal = new bootstrap.Modal(editModal);
    modal.show();
}

async function saveUpdate(id) {
    const name = editNameInput.value.trim();
    const description = editDescriptionInput.value.trim();
    
    if (!name || !description) {
        showAlert('Please fill in all fields', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/items/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, description }),
        });
        
        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(editModal);
            modal.hide();
            editItemId = null;
            loadItems();
            showAlert('Item updated successfully', 'success');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error updating item', 'danger');
    }
}

// Delete
async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
        const response = await fetch(`${API_URL}/items/${id}`, {
            method: 'DELETE',
        });
        
        if (response.ok) {
            loadItems();
            showAlert('Item deleted successfully', 'success');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error deleting item', 'danger');
    }
}

// Display items
function displayItems(items) {
    if (items.length === 0) {
        itemsList.innerHTML = '<p class="text-center">No items found</p>';
        return;
    }
    itemsList.innerHTML = items.map(item => `
        <div class="card mb-3">
            <div class="card-body">
                <h5 class="card-title">${item.name}</h5>
                <p class="card-text">${item.description}</p>
                <button class="btn btn-warning btn-sm me-2" 
                        onclick="updateItem(${item.id}, '${item.name}', '${item.description}')">
                    Edit
                </button>
                <button class="btn btn-danger btn-sm" 
                        onclick="deleteItem(${item.id})">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Utility Functions
function showAlert(message, type) {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    const alertContainer = document.createElement('div');
    alertContainer.style.position = 'fixed';
    alertContainer.style.top = '20px';
    alertContainer.style.right = '20px';
    alertContainer.style.zIndex = '1050';
    alertContainer.innerHTML = alertHtml;
    
    document.body.appendChild(alertContainer);
    
    // Remove alert after 3 seconds
    setTimeout(() => {
        alertContainer.remove();
    }, 3000);
}