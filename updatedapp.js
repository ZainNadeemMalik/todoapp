class Manager {
   
   constructor(){
    this.projectArr =  JSON.parse(localStorage.getItem('task.projects')) || []
  }

   getProjects() {
    // doing this to add methods to projects after getting them from storage
    this.projectArr.forEach(project => {
      project.addTodo = function (todo) {
        this.todos.push(todo)
      }

      project.deleteTodo = function(todoId) {
        this.todos = this.todos.filter(todo => todo.id !== todoId)
      }   
    } )
    
    return this.projectArr
  }

   addProject(project) {
    this.projectArr.push(project)
    this.save()
  }

   save(selectedListId = null) {
    localStorage.setItem('task.projects', JSON.stringify(this.projectArr))
    if(selectedListId) {
      localStorage.setItem('task.selectedListId', selectedListId)
    }  
  }

   deleteProject(projectId) {
    this.projectArr = this.projectArr.filter(project => project.id !== projectId)
    this.save()
  }
}

class Project {
  constructor(name) {
    this.name = name;
    this.id = Date.now().toString();
    this.todos = []
  }

  addTodo(todo) {
    this.todos.push(todo);
  }

  deleteTodo(todoId) {
    this.todos = this.todos.filter(todo => todo.id !== todoId)
  }
}

class ProjectList {
  constructor(todoList, manager) {
    this.todoList = todoList
    this.manager = manager
    this.list = document.createElement('ul')
    this.list.classList.add('project-list')
    this.attachEventListeners()
    this.renderProjects()
  }

  attachEventListeners() {
    this.list.addEventListener('click', e => {
      const target = e.target
      if(target.tagName.toLowerCase() === 'li') {
        todoForm.form.style.display = 'block'
        const selectedListId = target.dataset.listId 
        const selectedProject = this.manager.getProjects().find(list => list.id === selectedListId)
        this.manager.save(selectedListId)
        this.todoList.appendTo(document.body)
        this.todoList.renderTodos(selectedProject) 
      }

      if (target.classList.contains('delete-btn')) {
        const projectId = target.parentElement.dataset.listId
        this.manager.deleteProject(projectId)
        // this is how i solved the todos not going away when deleting the selected project
        this.todoList.list.textContent = ''
        this.renderProjects()
      }

      if (target.classList.contains('edit-btn')) {
        this.editProject(target);// implement it if needed probably in the Manager
      }

      if (target.classList.contains('complete-btn')) {
        this.completeProject(target)
      }
    })
  }

  renderProjects() {
    this.list.textContent = ''
    this.manager.getProjects().forEach(project => {
      const listElement = document.createElement('li')
      listElement.dataset.listId = project.id
      listElement.classList.add('project-list-item')
      listElement.textContent = project.name

      const deleteBtn = document.createElement("button")
      deleteBtn.textContent = 'X'
      deleteBtn.classList.add('delete-btn', 'btn')

      const editBtn = document.createElement("button");
      editBtn.textContent = 'Edit';
      editBtn.classList.add('edit-btn', 'btn');

      const completeBtn = document.createElement("button");
      completeBtn.textContent = 'Complete';
      completeBtn.classList.add('complete-btn', 'btn');
        
      listElement.appendChild(deleteBtn)
      this.list.appendChild(listElement)
    })
  }

  appendTo(parent) {
    parent.appendChild(this.list)
  }
}

class ProjectForm {
  constructor(projectList, manager) {
    this.manager = manager
    this.projectlist = projectList
    this.form = document.createElement('form')
    this.form.classList.add('project-form')
  
    const label = document.createElement('label')
    label.setAttribute('for', 'project-input')
    label.textContent = 'Title:'
  
    this.input = document.createElement('input')
    this.input.type = 'text'
    this.input.setAttribute('id', 'project-input')
    this.input.setAttribute('name', 'project-input')
  
    const button = document.createElement('button')
    button.type = 'submit'
    button.textContent = 'Add Project'
    button.classList.add('project-submit-btn')
    button.classList.add('submit-btn')
  
    this.form.appendChild(label)
    this.form.appendChild(this.input)
    this.form.appendChild(button)

    this.attachEventListeners(this.projectlist)
  }

  appendTo(parent) {
    parent.appendChild(this.form)
  }
  
  attachEventListeners(projectList) {
    this.form.addEventListener('submit', e => {
      e.preventDefault()
      const projectName = this.input.value.trim()
      if (projectName == null || projectName === '') return
      const newProject = new Project(projectName, this.manager)
      this.manager.addProject(newProject)
      this.input.value = ''
      projectList.renderProjects()
    })
  }
}

class Todo {
  constructor(title, description, dueDate, priority) {
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.priority = priority;
    this.id = Date.now().toString();
  }
}

class TodoList {
  constructor(manager) {
    this.manager = manager
    this.list = document.createElement('ul')
    this.list.classList.add('todo-list')
    this.attachEventListeners()
  }

  completeTodo(target) {
    target.parentElement.classList.toggle('completed')
  }

  deleteTodo(target) {
    const listElement = target.parentElement
    const todoId = listElement.dataset.listId
    const selectedListId = localStorage.getItem('task.selectedListId')
    const selectedProject = this.manager.getProjects().find(project => project.id === selectedListId)
    if (selectedProject){
      selectedProject.deleteTodo(todoId)
      this.renderTodos(selectedProject)
    }
  }

  attachEventListeners() {
    this.list.addEventListener('click', e => {
      const target = e.target

      if (target.classList.contains('delete-btn')) {
        this.deleteTodo(target)
        this.manager.save()
      }

      // if (target.classList.contains('edit-btn')) {
      //   this.editTodo(target);
      // }

      if (target.classList.contains('complete-btn')) {
        this.completeTodo(target)
      }
    })
  }

  appendTo(parent) {
    parent.appendChild(this.list)
  }

  renderTodos(selectedProject) {
    this.list.textContent = ''
    selectedProject.todos.forEach(todo => {
      const listElement = document.createElement('li')
      listElement.dataset.listId = todo.id

      listElement.classList.add("todo-list-item")

      const titleSpan = document.createElement("span")
      titleSpan.textContent = "Title: " + todo.title

      const descriptionSpan = document.createElement("span")
      descriptionSpan.textContent = "Description: " + todo.description

      const dueDateSpan = document.createElement("span")
      dueDateSpan.textContent = "Due Date: " + todo.dueDate

      const prioritySpan = document.createElement("span")
      prioritySpan.textContent = "Prioriry: " + todo.priority

      const deleteBtn = document.createElement("button")
      deleteBtn.textContent = 'X'
      deleteBtn.classList.add('delete-btn', 'btn')

      const completeBtn = document.createElement("button");
      completeBtn.textContent = 'Complete';
      completeBtn.classList.add('complete-btn', 'btn');

      // const editButton = document.createElement("button")
      // editButton.textContent = "Edit"
      // editButton.classList.add('edit-btn', 'btn')

      listElement.appendChild(titleSpan)
      listElement.appendChild(descriptionSpan)
      listElement.appendChild(dueDateSpan)
      listElement.appendChild(prioritySpan)
     
      listElement.appendChild(deleteBtn)
      listElement.appendChild(completeBtn)
      // listElement.appendChild(editButton)

      this.list.appendChild(listElement)
    })
  }
}

class TodoForm {
  constructor(todoList, manager) {
    this.todoList = todoList
    this.manager = manager
    this.form = document.createElement('form')
    this.form.classList.add('todo-form')

    const titleLabel = document.createElement('label')
    titleLabel.htmlFor = 'todo-title-input'
    titleLabel.textContent = 'Title:'

    this.titleInput = document.createElement('input')
    this.titleInput.type = 'text'
    this.titleInput.id = 'todo-title'
    this.titleInput.name = 'todo-title'

    const descriptionLabel = document.createElement('label')
    descriptionLabel.htmlFor = 'todo-description'
    descriptionLabel.textContent = 'Description:'

    this.descriptionTextarea = document.createElement('textarea')
    this.descriptionTextarea.id = 'todo-description' 
    this.descriptionTextarea.name = 'todo-description'
    this.descriptionTextarea.rows = '4'
    this.descriptionTextarea.cols = '50'

    const dueDateLabel = document.createElement('label')
    dueDateLabel.htmlFor = 'todo-dueDate'
    dueDateLabel.textContent = 'Due Date:'

    this.dueDateInput = document.createElement('input')
    this.dueDateInput.type = 'date'
    this.dueDateInput.id = 'todo-dueDate'
    this.dueDateInput.name = 'todo-dueDate'

    const priorityLabel = document.createElement('label')
    priorityLabel.htmlFor = 'todo-priority'
    priorityLabel.textContent = 'Priority:'

    this.selectPriority = document.createElement('select');
    this.selectPriority.id = 'todo-priority'; 
    this.selectPriority.name = 'todo-priority';

    const optionValues = ['Low', 'Medium', 'High'];
    optionValues.forEach(value => {
      const option = document.createElement('option');
      option.value = value.toLowerCase();  
      option.textContent = value; 
      this.selectPriority.appendChild(option); 
    });

    const button = document.createElement('button')
    button.type = 'submit'
    button.textContent = 'Add Todo'
    button.classList.add('todo-submit-btn', 'btn')

    this.form.appendChild(titleLabel)
    this.form.appendChild(this.titleInput)

    this.form.appendChild(descriptionLabel)
    this.form.appendChild(this.descriptionTextarea)

    this.form.appendChild(dueDateLabel)
    this.form.appendChild(this.dueDateInput)

    this.form.appendChild(priorityLabel)
    this.form.appendChild(this.selectPriority)

    this.form.appendChild(button)
    this.attachEventListeners(this.todoList)
  }

  appendTo(parent) {
    parent.appendChild(this.form)
  }

  attachEventListeners() {
    this.form.addEventListener('submit', e => {
      e.preventDefault()
      const title = this.titleInput.value.trim()
      const description = this.descriptionTextarea.value.trim()
      const dueDate = this.dueDateInput.value
      const priority = this.selectPriority.value
      const newTodo = new Todo(title, description, dueDate, priority)
      const selectedListId = localStorage.getItem('task.selectedListId')
      const selectedProject = this.manager.getProjects().find(project => project.id === selectedListId)
      if(selectedProject) {
        selectedProject.addTodo(newTodo)
        this.manager.save()
        this.todoList.appendTo(document.body)
        this.todoList.renderTodos(selectedProject)
      }
      this.form.reset()
    }) 
  }
}

const manager = new Manager()
const todoList = new TodoList(manager)
const todoForm = new TodoForm(todoList, manager)
const projectList = new ProjectList(todoList, manager)
projectList.appendTo(document.body)

const projectForm = new ProjectForm(projectList, manager)
projectForm.appendTo(document.body)

todoForm.appendTo(document.body)
