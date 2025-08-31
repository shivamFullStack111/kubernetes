import { useEffect, useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL 

// Main App Component
const App = () => {
  const [todos, setTodos] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Fetch todos from backend
  useEffect(() => {
    fetchTodos();
    console.log("Backend url is ",BACKEND_URL)
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/todos`);
      const data = await response.json();
      setTodos(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (taskInput.trim() === '') return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task: taskInput }),
      });
      
      const newTodo = await response.json();
      setTodos([newTodo, ...todos]);
      setTaskInput('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleComplete = async (id) => {
    try {
      const todoToUpdate = todos.find(todo => todo._id === id);
      const response = await fetch(`${BACKEND_URL}/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !todoToUpdate.completed }),
      });
      
      const updatedTodo = await response.json();
      setTodos(todos.map(todo => todo._id === id ? updatedTodo : todo));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await fetch(`${BACKEND_URL}/todos/${id}`, {
        method: 'DELETE',
      });
      
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const editTodo = async (id, newText) => {
    try {
      const response = await fetch(`${BACKEND_URL}/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task: newText }),
      });
      
      const updatedTodo = await response.json();
      setTodos(todos.map(todo => todo._id === id ? updatedTodo : todo));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const clearCompleted = () => {
    todos.forEach(todo => {
      if (todo.completed) {
        deleteTodo(todo._id);
      }
    });
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        <h1 style={styles.title}>My Todo List</h1>
        <p style={styles.subtitle}>Organize your tasks in style</p>
        
        <div style={styles.inputContainer}>
          <input
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a new task..."
            style={styles.input}
          />
          <button onClick={addTodo} style={styles.addButton}>
            <i className="fas fa-plus"></i>
          </button>
        </div>
        
        {loading ? (
          <div style={styles.loading}>Loading tasks...</div>
        ) : (
          <>
            <div style={styles.todoCount}>
              {todos.filter(todo => !todo.completed).length} active tasks, {todos.filter(todo => todo.completed).length} completed
            </div>
            
            <div style={styles.todoList}>
              {filteredTodos.length === 0 ? (
                <div style={styles.emptyState}>
                  <i className="fas fa-check-circle" style={styles.emptyIcon}></i>
                  <p>No tasks found. Add a task to get started!</p>
                </div>
              ) : (
                filteredTodos.map(todo => (
                  <TodoItem
                    key={todo._id}
                    todo={todo}
                    onToggleComplete={toggleComplete}
                    onDelete={deleteTodo}
                    onEdit={editTodo}
                  />
                ))
              )}
            </div>
            
            <div style={styles.filters}>
              <button
                onClick={() => setFilter('all')}
                style={filter === 'all' ? styles.filterButtonActive : styles.filterButton}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                style={filter === 'active' ? styles.filterButtonActive : styles.filterButton}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('completed')}
                style={filter === 'completed' ? styles.filterButtonActive : styles.filterButton}
              >
                Completed
              </button>
              <button onClick={clearCompleted} style={styles.clearButton}>
                Clear Completed
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App

// Todo Item Component
const TodoItem = ({ todo, onToggleComplete, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.task);

  const handleEdit = () => {
    if (editText.trim() !== '') {
      onEdit(todo._id, editText);
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleEdit();
    }
  };

  return (
    <div style={todo.completed ? { ...styles.todoItem, ...styles.todoItemCompleted } : styles.todoItem}>
      <div style={styles.todoContent}>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggleComplete(todo._id)}
          style={styles.checkbox}
        />
        
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleEdit}
            onKeyPress={handleKeyPress}
            style={styles.editInput}
            autoFocus
          />
        ) : (
          <span
            style={todo.completed ? styles.todoTextCompleted : styles.todoText}
            onDoubleClick={() => setIsEditing(true)}
          >
            {todo.task}
          </span>
        )}
      </div>
      
      <div style={styles.todoActions}>
        <button onClick={() => setIsEditing(!isEditing)} style={styles.actionButton}>
          <i className={isEditing ? "fas fa-times" : "fas fa-edit"}></i>
        </button>
        <button onClick={() => onDelete(todo._id)} style={styles.actionButton}>
          <i className="fas fa-trash"></i>
        </button>
      </div>
    </div>
  );
};

// Styles
const styles = {
  app: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    margin: 0,
    background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "15px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
    width: "90%",
    maxWidth: "500px",
    padding: "25px",
  },
  title: {
    textAlign: "center",
    color: "#333",
    marginBottom: "5px",
    fontWeight: "600",
    fontSize: "28px",
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginTop: 0,
    marginBottom: "25px",
    fontSize: "14px",
  },
  inputContainer: {
    display: "flex",
    marginBottom: "20px",
  },
  input: {
    flex: 1,
    padding: "14px",
    border: "2px solid #ddd",
    borderRight: "none",
    borderRadius: "8px 0 0 8px",
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.3s",
  },
  addButton: {
    background: "linear-gradient(to right, #6a11cb, #2575fc)",
    color: "white",
    border: "none",
    padding: "14px 20px",
    borderRadius: "0 8px 8px 0",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "opacity 0.3s",
  },
  todoCount: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "15px",
    padding: "0 5px",
  },
  todoList: {
    maxHeight: "350px",
    overflowY: "auto",
    paddingRight: "5px",
  },
  emptyState: {
    textAlign: "center",
    color: "#999",
    padding: "20px",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "10px",
    opacity: "0.5",
  },
  loading: {
    textAlign: "center",
    padding: "20px",
    color: "#666",
  },
  todoItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 15px",
    marginBottom: "10px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    borderLeft: "4px solid #6a11cb",
    transition: "all 0.3s ease",
  },
  todoItemCompleted: {
    borderLeftColor: "#4CAF50",
    opacity: 0.8,
  },
  todoContent: {
    display: "flex",
    alignItems: "center",
    flex: 1,
  },
  checkbox: {
    marginRight: "12px",
    width: "18px",
    height: "18px",
    cursor: "pointer",
  },
  todoText: {
    fontSize: "16px",
    color: "#333",
  },
  todoTextCompleted: {
    fontSize: "16px",
    color: "#888",
    textDecoration: "line-through",
  },
  editInput: {
    flex: 1,
    padding: "8px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "16px",
    outline: "none",
  },
  todoActions: {
    display: "flex",
    gap: "5px",
  },
  actionButton: {
    background: "transparent",
    border: "none",
    color: "#666",
    cursor: "pointer",
    fontSize: "16px",
    padding: "5px 8px",
    borderRadius: "4px",
    transition: "all 0.2s ease",
  },
  filters: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
    paddingTop: "15px",
    borderTop: "1px solid #eee",
    flexWrap: "wrap",
    gap: "10px",
  },
  filterButton: {
    background: "#e0e0e0",
    color: "#666",
    border: "none",
    padding: "8px 15px",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  filterButtonActive: {
    background: "#6a11cb",
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  clearButton: {
    background: "#ff6b6b",
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
};

// Render the app