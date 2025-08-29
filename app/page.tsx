"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";


type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    let { data, error } = await supabase.from("todos").select("*").order("inserted_at", { ascending: false });
    if (!error && data) setTodos(data);
  }

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask) return;
    await supabase.from("todos").insert([{ title: newTask }]);
    setNewTask("");
    fetchTodos();
  }

  async function toggleComplete(id: string, current: boolean) {
    await supabase.from("todos").update({ completed: !current }).eq("id", id);
    fetchTodos();
  }

  async function editTodo(id: string, title: string) {
    const newTitle = prompt("Editar tarea:", title);
    if (newTitle) {
      await supabase.from("todos").update({ title: newTitle }).eq("id", id);
      fetchTodos();
    }
  }

  return (
    <main className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">To-Do List</h1>

      <form onSubmit={addTodo} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Nueva tarea"
          className="border rounded p-2 flex-1"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white px-4 rounded">Agregar</button>
      </form>

      <ul className="space-y-2">
        {todos.map((todo) => (
          <li key={todo.id} className="flex justify-between items-center border p-2 rounded">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleComplete(todo.id, todo.completed)}
              />
              <span className={todo.completed ? "line-through text-gray-400" : ""}>{todo.title}</span>
            </div>
            <button onClick={() => editTodo(todo.id, todo.title)} className="text-sm text-blue-600">Editar</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
