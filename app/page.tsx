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

  async function editTodo(id: string, title: string) {
    const newTitle = prompt("Editar tarea:", title);
    if (newTitle && newTitle.trim() !== title) {
      try {
        await supabase.from("todos").update({ title: newTitle.trim() }).eq("id", id);
        fetchTodos();
      } catch (error) {
        console.error("Error editing todo:", error);
      }
    }
  }

  return (
    <div className="container">
      <header className="app-header">
        <h1 className="app-title">Gestor de Tareas</h1>
      </header>

      <form onSubmit={addTodo} className="task-form">
        <input
          type="text"
          placeholder="Nueva tarea..."
          className="task-input"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">Agregar</button>
      </form>

      {loading ? (
        <div className="empty-state">Cargando tareas...</div>
      ) : todos.length === 0 ? (
        <div className="empty-state">No hay tareas pendientes. ¡Añade una!</div>
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
                  onClick={() => editTodo(todo.id, todo.title)} 
                  className="btn btn-edit"
                >
                  Editar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
