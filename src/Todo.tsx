import { useRef, useEffect, useState } from "react";
import type { Todo } from "./Types";

export default function Todo() {
    const [task, setTask] = useState<string>("");
    const inputRef = useRef(null);
    const [tasks, setTasks] = useState<Todo[]>([]);
    const BASE_URL = "http://localhost:3000";
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
    const addTask = async(event) => {
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
        <>
            <form onSubmit={addTask}>
                <input ref={inputRef} type="text" placeholder="Enter Task" onChange={(e) => {
                    setTask(e.target.value);
                    // setTaskObj({
                    //     task: task,
                    // });
                }}/>
                <button type="submit">Submit</button>
            </form>
            <ul>
                {tasks.map(({task, _id}) => {
                    return (
                        <li key={_id}>{task} 
                            <button onClick={() => editTask(_id, task)}>Edit</button>
                            <button onClick={() => deleteTask(_id)}>Delete</button>
                        </li>
                    );
                })}
            </ul>
        </>
    );
}
