// DOM Elements
const taskText = document.getElementById("taskText");
const taskDate = document.getElementById("taskDate");
const taskCategory = document.getElementById("taskCategory");
const taskPriority = document.getElementById("taskPriority");
const taskNotes = document.getElementById("taskNotes");
const addTaskBtn = document.getElementById("addTask");
const taskList = document.getElementById("taskList");
const searchBox = document.getElementById("searchBox");
const sortBy = document.getElementById("sortBy");
const filterButtons = document.querySelectorAll(".filter-btn");
const priorityFilters = document.querySelectorAll(".priority-filter");
const undoBtn = document.getElementById("undoBtn");
const clearCompleted = document.getElementById("clearCompleted");
const emptyState = document.getElementById("emptyState");
const totalTasksEl = document.getElementById("totalTasks");
const completedCountEl = document.getElementById("completedCount");
const pendingCountEl = document.getElementById("pendingCount");

// Modal Elements
const editModal = document.getElementById("editModal");
const closeModal = document.querySelector(".close");
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const editTaskText = document.getElementById("editTaskText");
const editTaskNotes = document.getElementById("editTaskNotes");
const editTaskPriority = document.getElementById("editTaskPriority");
const editTaskDate = document.getElementById("editTaskDate");
const editTaskCategory = document.getElementById("editTaskCategory");

// State Management
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let taskHistory = [];
let currentFilter = "all";
let currentPriorityFilter = null;
let editingTaskId = null;
let draggedElement = null;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    renderTasks();
    updateStats();
    setDefaultDate();
});

// Event Listeners
addTaskBtn.addEventListener("click", addTask);
taskText.addEventListener("keypress", e => {
    if (e.key === "Enter") addTask();
});

searchBox.addEventListener("input", () => renderTasks());
sortBy.addEventListener("change", () => renderTasks());

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

priorityFilters.forEach(btn => {
    btn.addEventListener("click", () => {
        btn.classList.toggle("active");
        currentPriorityFilter = btn.classList.contains("active") ? btn.dataset.priority : null;
        renderTasks();
    });
});

undoBtn.addEventListener("click", undoLastAction);
clearCompleted.addEventListener("click", clearCompletedTasks);

// Modal Events
closeModal.addEventListener("click", () => closeEditModal());
cancelEditBtn.addEventListener("click", () => closeEditModal());
saveEditBtn.addEventListener("click", saveEditedTask);
window.addEventListener("click", (e) => {
    if (e.target === editModal) closeEditModal();
});

// Add Task Function
function addTask() {
    if (taskText.value.trim() === "") {
        showToast("Please enter a task!", "error");
        return;
    }

    // Save current state for undo
    taskHistory.push(JSON.parse(JSON.stringify(tasks)));

    const newTask = {
        id: Date.now(),
        text: taskText.value,
        notes: taskNotes.value,
        date: taskDate.value,
        category: taskCategory.value,
        priority: taskPriority.value,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
    saveAndRender();
    showToast("Task added successfully! ✓", "success");
    
    // Clear inputs
    taskText.value = "";
    taskDate.value = "";
    taskNotes.value = "";
    taskCategory.value = "General";
    taskPriority.value = "medium";
    setDefaultDate();
}

// Render Tasks Function
function renderTasks() {
    const searchTerm = searchBox.value.toLowerCase();
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let filteredTasks = tasks.filter(task => {
        // Search filter
        if (!task.text.toLowerCase().includes(searchTerm) && 
            !task.notes.toLowerCase().includes(searchTerm) &&
            !task.category.toLowerCase().includes(searchTerm)) {
            return false;
        }

        // Status filter
        if (currentFilter === "completed" && !task.completed) return false;
        if (currentFilter === "pending" && task.completed) return false;
        if (currentFilter === "today") {
            if (!task.date) return false;
            const taskDate = new Date(task.date);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === now.getTime();
        }
        if (currentFilter === "overdue") {
            if (!task.date || task.completed) return false;
            const taskDate = new Date(task.date);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() < now.getTime();
        }

        // Priority filter
        if (currentPriorityFilter && task.priority !== currentPriorityFilter) return false;

        return true;
    });

    // Sorting
    if (sortBy.value === "priority") {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        filteredTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (sortBy.value === "date") {
        filteredTasks.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(a.date) - new Date(b.date);
        });
    } else if (sortBy.value === "name") {
        filteredTasks.sort((a, b) => a.text.localeCompare(b.text));
    }

    // Clear task list
    taskList.innerHTML = "";

    // Show empty state
    if (filteredTasks.length === 0) {
        emptyState.classList.add("show");
        return;
    } else {
        emptyState.classList.remove("show");
    }

    // Render tasks
    filteredTasks.forEach((task, index) => {
        const li = createTaskElement(task);
        taskList.appendChild(li);
    });
}

// Create Task Element
function createTaskElement(task) {
    const li = document.createElement("li");
    li.className = "task-item";
    li.draggable = true;
    if (task.completed) li.classList.add("completed");
    li.dataset.taskId = task.id;

    const daysUntil = task.date ? Math.ceil((new Date(task.date) - new Date()) / (1000 * 60 * 60 * 24)) : null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const taskDate = task.date ? new Date(task.date) : null;
    if (taskDate) taskDate.setHours(0, 0, 0, 0);
    const isOverdue = taskDate && taskDate < now && !task.completed;
    const isToday = taskDate && taskDate.getTime() === now.getTime();

    let dueDateText = "";
    if (task.date) {
        if (isOverdue) {
            dueDateText = `<span class="due-date overdue"><i class="fas fa-exclamation-circle"></i> Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''}</span>`;
        } else if (isToday) {
            dueDateText = `<span class="due-date today"><i class="fas fa-clock"></i> Due Today</span>`;
        } else if (daysUntil > 0) {
            dueDateText = `<span class="due-date"><i class="fas fa-calendar-alt"></i> Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}</span>`;
        } else {
            dueDateText = `<span class="due-date"><i class="fas fa-calendar-alt"></i> ${formatDate(task.date)}</span>`;
        }
    }

    li.innerHTML = `
        <div class="task-checkbox" onclick="toggleTask(${task.id})"></div>
        <div class="task-content">
            <div class="task-header">
                <span class="task-title">${escapeHtml(task.text)}</span>
                <span class="priority-badge ${task.priority}">${task.priority}</span>
            </div>
            <div class="task-meta">
                <span class="meta-item"><i class="fas fa-folder"></i> <span class="category-tag">${task.category}</span></span>
                ${dueDateText}
            </div>
            ${task.notes ? `<div class="task-notes"><i class="fas fa-sticky-note"></i> ${escapeHtml(task.notes)}</div>` : ''}
        </div>
        <div class="task-actions">
            <button class="task-btn" onclick="editTaskModal(${task.id})" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="task-btn delete" onclick="deleteTask(${task.id})" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
    `;

    // Drag events
    li.addEventListener("dragstart", handleDragStart);
    li.addEventListener("dragend", handleDragEnd);
    li.addEventListener("dragover", handleDragOver);
    li.addEventListener("drop", handleDrop);

    return li;
}

// Toggle Task Completion
function toggleTask(id) {
    taskHistory.push(JSON.parse(JSON.stringify(tasks)));
    tasks = tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveAndRender();
}

// Delete Task
function deleteTask(id) {
    taskHistory.push(JSON.parse(JSON.stringify(tasks)));
    tasks = tasks.filter(task => task.id !== id);
    saveAndRender();
    showToast("Task deleted", "error");
}

// Open Edit Modal
function editTaskModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editingTaskId = id;
    editTaskText.value = task.text;
    editTaskNotes.value = task.notes;
    editTaskPriority.value = task.priority;
    editTaskDate.value = task.date;
    editTaskCategory.value = task.category;

    editModal.classList.add("show");
}

// Close Edit Modal
function closeEditModal() {
    editModal.classList.remove("show");
    editingTaskId = null;
}

// Save Edited Task
function saveEditedTask() {
    if (!editTaskText.value.trim()) {
        showToast("Task name cannot be empty", "error");
        return;
    }

    taskHistory.push(JSON.parse(JSON.stringify(tasks)));
    tasks = tasks.map(task =>
        task.id === editingTaskId
            ? {
                ...task,
                text: editTaskText.value,
                notes: editTaskNotes.value,
                priority: editTaskPriority.value,
                date: editTaskDate.value,
                category: editTaskCategory.value
            }
            : task
    );

    saveAndRender();
    closeEditModal();
    showToast("Task updated successfully! ✓", "success");
}

// Undo Last Action
function undoLastAction() {
    if (taskHistory.length === 0) {
        showToast("Nothing to undo", "error");
        return;
    }

    tasks = taskHistory.pop();
    saveAndRender();
    showToast("Action undone ↶", "success");
}

// Clear Completed Tasks
function clearCompletedTasks() {
    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount === 0) {
        showToast("No completed tasks to clear", "error");
        return;
    }

    if (confirm(`Are you sure you want to delete ${completedCount} completed task${completedCount !== 1 ? 's' : ''}?`)) {
        taskHistory.push(JSON.parse(JSON.stringify(tasks)));
        tasks = tasks.filter(task => !task.completed);
        saveAndRender();
        showToast(`${completedCount} task${completedCount !== 1 ? 's' : ''} cleared! ✓`, "success");
    }
}

// Update Statistics
function updateStats() {
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.filter(t => !t.completed).length;

    totalTasksEl.textContent = tasks.length;
    completedCountEl.textContent = completed;
    pendingCountEl.textContent = pending;
}

// Drag and Drop Functions
function handleDragStart(e) {
    draggedElement = this;
    this.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
}

function handleDragEnd(e) {
    this.classList.remove("dragging");
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (this !== draggedElement) {
        this.style.borderTop = "3px solid var(--primary)";
    }
}

function handleDrop(e) {
    e.preventDefault();
    if (this !== draggedElement) {
        const draggedId = parseInt(draggedElement.dataset.taskId);
        const targetId = parseInt(this.dataset.taskId);
        const draggedIndex = tasks.findIndex(t => t.id === draggedId);
        const targetIndex = tasks.findIndex(t => t.id === targetId);

        if (draggedIndex !== -1 && targetIndex !== -1) {
            taskHistory.push(JSON.parse(JSON.stringify(tasks)));
            [tasks[draggedIndex], tasks[targetIndex]] = [tasks[targetIndex], tasks[draggedIndex]];
            saveAndRender();
        }
    }
    this.style.borderTop = "";
}

// Save and Render
function saveAndRender() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
    updateStats();
    undoBtn.style.opacity = taskHistory.length > 0 ? "1" : "0.5";
}

// Show Toast Notification
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add("show");
    
    setTimeout(() => {
        toast.classList.remove("show");
        toast.classList.add("hide");
        setTimeout(() => {
            toast.classList.remove("hide");
        }, 400);
    }, 5000);
}

// Format Date
function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Set Default Date to Today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    taskDate.value = today;
}