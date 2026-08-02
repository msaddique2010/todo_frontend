import { useRef, useEffect, useState } from "react";
import type { Todo } from "./Types";

export default function Todo() {
    const [task, setTask] = useState<string>("");
    const inputRef = useRef<HTMLInputElement>(null);
    const [tasks, setTasks] = useState<Todo[]>([]);
    const BASE_URL = "https://todo-backend-0l3v.onrender.com";
    useEffect(() => {
        const fetchTasks = async() => {
            try{
                const response = await fetch(`${BASE_URL}/tasks`);
                if (!response.ok){
                    throw new Error(`Response Status: ${response.status}`);
                }
                const result = await response.json();
                setTasks(result);
            }
            catch (error){
                console.log(error);
            }
        }
        fetchTasks();
    },[]);

    // Add TAsk
    const addTask = async(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try{
            const response = await fetch(`${BASE_URL}/task`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    task: task,
                }),
            });
            if (!response.ok){
                throw new Error(`Response Status: ${response.status}`);
            }
            const result = await response.json();
            const tasksClone = [...tasks, result];
            setTasks(tasksClone);

            if (inputRef.current){
                inputRef.current.value = "";
            }
        }
        catch (error){
            console.log(error);
        }
    }

    // deleteTask
    const deleteTask = async(id: string) => {
        try{
            const response = await fetch(`${BASE_URL}/task/${id}`, {
                method: "DELETE",
            });
            if (!response.ok){
                throw new Error(`Response Status: ${response.status}`);
            }
            setTasks((prevTasks) =>
                prevTasks.filter((task) => task._id !== id)
            );
        }
        catch (error){
            console.log(error);
        }
    }

    // editTask
    const editTask = async (id: string, task: string) => {
        const updatedValue = prompt("Enter the updated value:", task);

        // User clicked Cancel
        if (updatedValue === null) {
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/task/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    task: updatedValue,
                }),
            });

            if (!response.ok) {
                throw new Error(`Response Status: ${response.status}`);
            }

            const updatedTask = await response.json();

            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task._id === id ? updatedTask : task
                )
            );
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-100 border border-slate-200 p-4 sm:p-6 md:p-8 w-full transition-all duration-300">
            <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center justify-between">
                <span>Todo List</span>
                <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-2.5 py-1 rounded-full border border-indigo-100">
                    {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                </span>
            </h1>
            
            <form onSubmit={addTask} className="flex gap-2 mb-6">
                <input 
                    ref={inputRef} 
                    type="text" 
                    placeholder="Enter Task" 
                    onChange={(e) => {
                        setTask(e.target.value);
                    }}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-base sm:text-sm"
                />
                <button 
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-medium rounded-xl transition-all shadow-md shadow-indigo-100 hover:shadow-lg hover:shadow-indigo-200 text-sm"
                >
                    Submit
                </button>
            </form>

            {tasks.length === 0 ? (
                <div className="text-center py-10 px-4 border border-dashed border-slate-250 rounded-xl bg-slate-50/50">
                    <p className="text-sm text-slate-500">No tasks yet. Get started by adding one!</p>
                </div>
            ) : (
                <ul className="space-y-2">
                    {tasks.map(({task, _id}) => {
                        return (
                            <li 
                                key={_id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 gap-3 bg-slate-50 border border-slate-200 rounded-xl hover:shadow-sm hover:border-slate-300 transition-all"
                            >
                                <span className="text-sm font-medium text-slate-700 break-all pr-0 sm:pr-4">{task}</span> 
                                <div className="flex gap-2 justify-end sm:justify-start shrink-0 w-full sm:w-auto">
                                    <button 
                                        onClick={() => editTask(_id, task)}
                                        className="flex-1 sm:flex-none text-center p-1.5 px-3 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 hover:text-slate-900 border border-slate-200 rounded-lg shadow-sm transition-all cursor-pointer"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => deleteTask(_id)}
                                        className="flex-1 sm:flex-none text-center p-1.5 px-3 text-xs font-semibold text-red-600 bg-white hover:bg-red-50 hover:text-red-700 border border-slate-200 hover:border-red-100 rounded-lg shadow-sm transition-all cursor-pointer"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
