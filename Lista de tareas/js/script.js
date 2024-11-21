// Array para almacenar tareas en memoria
const tasks = [];
let currentTaskId = null;

// Abrir modal para agregar o editar tarea
document.getElementById('addTaskBtn').onclick = () => openModal();
document.querySelector('.close').onclick = () => closeModal();

function openModal(task = null) {
    const modal = document.getElementById('taskModal');
    modal.style.display = 'block';
    if (task) {
        // Si se edita, se precargan los valores
        currentTaskId = task.id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskDueDate').value = task.dueDate || '';
    } else {
        // Si es nueva tarea, reseteamos el formulario
        currentTaskId = null;
        document.getElementById('taskForm').reset();
    }
}

// Cerrar modal
function closeModal() {
    document.getElementById('taskModal').style.display = 'none';
}

// Guardar la tarea al enviar el formulario
document.getElementById('taskForm').onsubmit = (event) => {
    event.preventDefault();
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const dueDate = document.getElementById('taskDueDate').value;

    if (currentTaskId) {
        updateTask(currentTaskId, title, description, dueDate);
    } else {
        addTask(title, description, dueDate);
    }

    closeModal();
    renderTasks();
};

// Añadir una nueva tarea
function addTask(title, description, dueDate) {
    tasks.push({ id: Date.now().toString(), title, description, dueDate, status: 'pending' });
}

// Actualizar una tarea existente
function updateTask(id, title, description, dueDate) {
    const task = tasks.find(task => task.id === id);
    task.title = title;
    task.description = description;
    task.dueDate = dueDate;
}

// Renderizar todas las tareas en sus columnas
function renderTasks() {
    ['pending', 'inProgress', 'completed'].forEach(status => {
        const column = document.getElementById(status + 'Tasks');
        column.innerHTML = '';
        tasks.filter(task => task.status === status).forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task';
            taskElement.id = task.id;
            taskElement.draggable = true;
            taskElement.ondragstart = drag;

            // HTML para cada tarjeta de tarea
            taskElement.innerHTML = `
                <strong>${task.title}</strong>
                <p>${task.description}</p>
                ${task.dueDate ? `<small>Fecha de vencimiento: ${task.dueDate}</small>` : ''}
                <div class="button-group">
                    <button class="edit-btn" onclick="openModal(getTask('${task.id}'))">Editar</button>
                    <button class="delete-btn" onclick="deleteTask('${task.id}')">Eliminar</button>
                </div>
            `;
            column.appendChild(taskElement);
        });
    });
}

// Eliminar una tarea
function deleteTask(id) {
    const index = tasks.findIndex(task => task.id === id);
    if (index > -1) tasks.splice(index, 1);
    renderTasks();
}

// Obtener tarea por ID
function getTask(id) {
    return tasks.find(task => task.id === id);
}

/// Función para permitir el arrastre en las columnas
function allowDrop(event) {
    event.preventDefault();
}

// Función que se ejecuta al iniciar el arrastre de una tarea
function drag(event) {
    event.dataTransfer.setData('text', event.target.id);
}

// Función que se ejecuta al soltar una tarea en una columna
function drop(event) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('text');
    const task = getTask(taskId);
    const targetColumnId = event.target.closest('.column').id;

    // Validación de movimientos permitidos
    if ((task.status === 'pending' && targetColumnId === 'completed') ||
        (task.status === 'completed' && targetColumnId === 'inProgress')) {
        alert("Movimiento no permitido.");
        return;
    }

    // Actualizar el estado de la tarea y renderizar
    if (targetColumnId === 'pending' || targetColumnId === 'inProgress' || targetColumnId === 'completed') {
        task.status = targetColumnId;
        renderTasks();
    }
}

// Render inicial de las tareas
renderTasks();
