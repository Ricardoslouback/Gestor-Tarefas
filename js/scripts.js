// Seleção de elementos no DOcumento
const todoForm = document.querySelector("#todo-form"); // Formulário para adicionar tarefas
const todoInput = document.querySelector("#todo-input"); // Campo de entrada para nova tarefa
const todoList = document.querySelector("#todo-list"); // Lista onde as tarefas serão exibidas
const editForm = document.querySelector("#edit-form"); // Formulário para edição de tarefas
const editInput = document.querySelector("#edit-input"); // Campo de entrada para edição de tarefas
const cancelEditBtn = document.querySelector("#cancel-edit-btn"); // Botão para cancelar edição
const searchInput = document.querySelector("#search-input"); // Campo de busca
const eraseBtn = document.querySelector("#erase-button"); // Botão para apagar busca
const filterBtn = document.querySelector("#filter-select"); // Dropdown para filtrar tarefas
let oldInputValue; // Armazena o valor antigo de uma tarefa durante a edição

// Função para salvar uma nova tarefa
const saveTodo = (text, done = 0, save = 1) => {
  // Cria o contêiner da tarefa
  const todo = document.createElement("div");
  todo.classList.add("todo");

  // Adiciona o título da tarefa
  const todoTitle = document.createElement("h3");
  todoTitle.innerText = text;
  todo.appendChild(todoTitle);

  // Adiciona o botão de marcar como concluída
  const doneBtn = document.createElement("button");
  doneBtn.classList.add("finish-todo");
  doneBtn.innerHTML = '<i class="fa-solid fa-checks"></i>';
  todo.appendChild(doneBtn);

  // Adiciona o botão de edição
  const editBtn = document.createElement("button");
  editBtn.classList.add("edit-todo");
  editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
  todo.appendChild(editBtn);

  // Adiciona o botão de exclusão
  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("remove-todo");
  deleteBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  todo.appendChild(deleteBtn);

  // Se a tarefa estiver marcada como concluída, adiciona a classe 'done'
  if (done) {
    todo.classList.add("done");
  }

  // Salva a tarefa no localStorage, se necessário
  if (save) {
    saveTodoLocalStorage({ text, done: 0 });
  }

  // Adiciona a tarefa na lista
  todoList.appendChild(todo);

  // Limpa o campo de entrada
  todoInput.value = "";
};

// Alterna entre os formulários de adicionar e editar tarefas
const toggleForms = () => {
  editForm.classList.toggle("hide");
  todoForm.classList.toggle("hide");
  todoList.classList.toggle("hide");
};

// Atualiza o título de uma tarefa
const updateTodo = (text) => {
  const todos = document.querySelectorAll(".todo");

  todos.forEach((todo) => {
    let todoTitle = todo.querySelector("h3");

    // Encontra a tarefa pelo título antigo e atualiza
    if (todoTitle.innerText === oldInputValue) {
      todoTitle.innerText = text;
      updateTodoLocalStorage(oldInputValue, text); // Atualiza no localStorage
    }
  });
};

// Filtra tarefas com base no texto da busca
const getSearchedTodos = (search) => {
  const todos = document.querySelectorAll(".todo");

  todos.forEach((todo) => {
    const todoTitle = todo.querySelector("h3").innerText.toLowerCase();
    todo.style.display = "flex"; // Exibe inicialmente

    // Oculta tarefas que não correspondem ao termo de busca
    if (!todoTitle.includes(search)) {
      todo.style.display = "none";
    }
  });
};

// Filtra tarefas por status (todas, concluídas ou pendentes)
const filterTodos = (filterValue) => {
  const todos = document.querySelectorAll(".todo");

  switch (filterValue) {
    case "all": // Exibe todas as tarefas
      todos.forEach((todo) => (todo.style.display = "flex"));
      break;

    case "done": // Exibe apenas as tarefas concluídas
      todos.forEach((todo) =>
        todo.classList.contains("done")
          ? (todo.style.display = "flex")
          : (todo.style.display = "none")
      );
      break;

    case "todo": // Exibe apenas as tarefas pendentes
      todos.forEach((todo) =>
        !todo.classList.contains("done")
          ? (todo.style.display = "flex")
          : (todo.style.display = "none")
      );
      break;

    default:
      break;
  }
};

// Eventos para manipulação de tarefas
todoForm.addEventListener("submit", (e) => {
  e.preventDefault(); // Previne o comportamento padrão do formulário
  const inputValue = todoInput.value;

  if (inputValue) {
    saveTodo(inputValue); // Salva a nova tarefa
  }
});

// Evento de clique para ações nos botões
document.addEventListener("click", (e) => {
  const targetEl = e.target; // Elemento clicado
  const parentEl = targetEl.closest("div"); // Contêiner da tarefa
  let todoTitle;

  if (parentEl && parentEl.querySelector("h3")) {
    todoTitle = parentEl.querySelector("h3").innerText || "";
  }

  if (targetEl.classList.contains("finish-todo")) {
    parentEl.classList.toggle("done"); // Alterna o status de concluído
    updateTodoStatusLocalStorage(todoTitle); // Atualiza no localStorage
  }

  if (targetEl.classList.contains("remove-todo")) {
    parentEl.remove(); // Remove do DOM
    removeTodoLocalStorage(todoTitle); // Remove do localStorage
  }

  if (targetEl.classList.contains("edit-todo")) {
    toggleForms(); // Exibe o formulário de edição
    editInput.value = todoTitle; // Preenche o campo de edição
    oldInputValue = todoTitle; // Armazena o valor antigo
  }
});

// Cancela a edição e volta ao formulário de adicionar
cancelEditBtn.addEventListener("click", (e) => {
  e.preventDefault();
  toggleForms();
});

// Atualiza a tarefa ao enviar o formulário de edição
editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const editInputValue = editInput.value;

  if (editInputValue) {
    updateTodo(editInputValue); // Atualiza o título
  }

  toggleForms();
});

// Busca tarefas ao digitar no campo de busca
searchInput.addEventListener("keyup", (e) => {
  const search = e.target.value;
  getSearchedTodos(search);
});

// Limpa o campo de busca
eraseBtn.addEventListener("click", (e) => {
  e.preventDefault();
  searchInput.value = "";
  searchInput.dispatchEvent(new Event("keyup")); // Atualiza a lista
});

// Filtra tarefas ao alterar o valor do filtro
filterBtn.addEventListener("change", (e) => {
  const filterValue = e.target.value;
  filterTodos(filterValue);
});

// Funções de manipulação do localStorage
const getTodosLocalStorage = () => JSON.parse(localStorage.getItem("todos")) || [];

const loadTodos = () => {
  const todos = getTodosLocalStorage();
  todos.forEach((todo) => saveTodo(todo.text, todo.done, 0));
};

const saveTodoLocalStorage = (todo) => {
  const todos = getTodosLocalStorage();
  todos.push(todo);
  localStorage.setItem("todos", JSON.stringify(todos));
};

const removeTodoLocalStorage = (todoText) => {
  const todos = getTodosLocalStorage();
  const filteredTodos = todos.filter((todo) => todo.text !== todoText);
  localStorage.setItem("todos", JSON.stringify(filteredTodos));
};

const updateTodoStatusLocalStorage = (todoText) => {
  const todos = getTodosLocalStorage();
  todos.map((todo) => (todo.text === todoText ? (todo.done = !todo.done) : null));
  localStorage.setItem("todos", JSON.stringify(todos));
};

const updateTodoLocalStorage = (todoOldText, todoNewText) => {
  const todos = getTodosLocalStorage();
  todos.map((todo) => (todo.text === todoOldText ? (todo.text = todoNewText) : null));
  localStorage.setItem("todos", JSON.stringify(todos));
};

// Carrega as tarefas do localStorage ao iniciar
loadTodos();
