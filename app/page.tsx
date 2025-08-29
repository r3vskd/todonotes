"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import "@/app/theme.css";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<{id: string, title: string} | null>(null);
  const [editedTitle, setEditedTitle] = useState("");

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    setLoading(true);
    try {
      let { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("inserted_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching todos:", error);
        return;
      }
      
      if (data) setTodos(data);
    } catch (err) {
      console.error("Exception when fetching todos:", err);
    } finally {
      setLoading(false);
    }
  }

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    try {
      await supabase.from("todos").insert([{ title: newTask.trim() }]);
      setNewTask("");
      fetchTodos();
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  }

  async function toggleComplete(id: string, current: boolean) {
    try {
      await supabase.from("todos").update({ completed: !current }).eq("id", id);
      fetchTodos();
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  }

  function openEditModal(id: string, title: string) {
    setEditingTask({ id, title });
    setEditedTitle(title);
  }

  function closeEditModal() {
    setEditingTask(null);
    setEditedTitle("");
  }

  async function saveEdit() {
    if (!editingTask || !editedTitle.trim() || editedTitle.trim() === editingTask.title) {
      closeEditModal();
      return;
    }

    try {
      await supabase.from("todos").update({ title: editedTitle.trim() }).eq("id", editingTask.id);
      fetchTodos();
      closeEditModal();
    } catch (error) {
      console.error("Error editing todo:", error);
    }
  }

  return (
    <div className="container">
      <header className="app-header">
        <h1 className="app-title">Tasks TO-DO App</h1>
      </header>

      <form onSubmit={addTodo} className="task-form">
        <input
          type="text"
          placeholder="New Task"
          className="task-input"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">Add Task</button>
      </form>

      {loading ? (
        <div className="empty-state">Loading tasks...</div>
      ) : todos.length === 0 ? (
        <div className="empty-state">No tasks pending. Add a new one!</div>
      ) : (
        <ul className="task-list">
          {todos.map((todo) => (
            <li key={todo.id} className="task-item">
              <div className="task-content">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleComplete(todo.id, todo.completed)}
                  className="task-checkbox"
                />
                <span className={`task-text ${todo.completed ? 'task-completed' : ''}`}>
                  {todo.title}
                </span>
              </div>
              <div className="task-actions">
                <button 
                  onClick={() => openEditModal(todo.id, todo.title)} 
                  className="btn btn-edit"
                >
                  Edit
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal de edición */}
      {editingTask && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <h3 className="edit-modal-title">Editar tarea</h3>
            <input
              type="text"
              className="task-input"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              autoFocus
            />
            <div className="edit-modal-actions">
              <button onClick={closeEditModal} className="btn">Cancelar</button>
              <button onClick={saveEdit} className="btn btn-primary">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
