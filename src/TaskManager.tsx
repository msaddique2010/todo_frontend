import React, { useState, useEffect, useCallback } from "react";

interface Todo {
    _id: string;
    task: string;
}

const API_BASE = "http://localhost:3000";

export default function TaskManager() {
    const [tasks, setTasks] = useState<Todo[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const [newTask, setNewTask] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTask, setEditTask] = useState<string>("");

    const loadTasks = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/tasks`);
            if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
            const data: Todo[] = await res.json();
            setTasks(data);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        setSubmitting(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/task`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ task: newTask }),
            });
            if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
            const created: Todo = await res.json();
            setTasks((prev) => [...prev, created]);
            setNewTask("");
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setSubmitting(false);
        }
    };

    const startEdit = (todo: Todo) => {
        setEditingId(todo._id);
        setEditTask(todo.task);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditTask("");
    };

    const saveEdit = async (todo: Todo) => {
        if (!editTask.trim()) return;
        try {
            const res = await fetch(`${API_BASE}/task/${todo._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ task: editTask }),
            });
            if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
            const updated: Todo = await res.json();
            setTasks((prev) => prev.map((t) => (t._id === todo._id ? updated : t)));
            cancelEdit();
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const handleDelete = async (todo: Todo) => {
        try {
            const res = await fetch(`${API_BASE}/task/${todo._id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
            setTasks((prev) => prev.filter((t) => t._id !== todo._id));
        } catch (err) {
            setError((err as Error).message);
        }
    };

    return (
        <div>
        <h1>Tasks</h1>

        {error && <p>Error: {error}</p>}
        {loading && <p>Loading...</p>}

        <form onSubmit={handleAdd}>
            <input type="text" placeholder="Task" value={newTask} onChange={(e) => setNewTask(e.target.value)} />
            <button type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Add Task"}
            </button>
        </form>

        <ul>
            {tasks.map((todo) => (
            <li key={todo._id}>
                {editingId === todo._id ? (
                <>
                    <input type="text" value={editTask} onChange={(e) => setEditTask(e.target.value)} />
                    <button onClick={() => saveEdit(todo)}>Save</button>
                    <button onClick={cancelEdit}>Cancel</button>
                </>
                ) : (
                <>
                    <span>{todo.task}</span>
                    <button onClick={() => startEdit(todo)}>Edit</button>
                    <button onClick={() => handleDelete(todo)}>Delete</button>
                </>
                )}
            </li>
            ))}
        </ul>
        </div>
    );
}