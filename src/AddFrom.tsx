import { useEffect, useState } from "react";

export default function AddFrom() {
    const [task, setTask] = useState("");
    const [tasks, setTasks] = useState([]);
    
    

    useEffect(() => {
        const allTasks = async () => {
        try{
            const response = await fetch("http://localhost:3000/tasks");
            if (!response.ok){
                throw new Error(`Response failed: ${response.status}`);
            }

            const result = await response.json();
            setTasks(result);
        }
        catch(error){
            console.log(`Error in catch: ${error}`);
        }
    }

        allTasks();
    },[]);

    const listTasks = tasks.map(({_id, task}) => {
        return (
            <li key={_id}>{task}</li>
        );
    })
    return (
        <>
            <form>
                <input type="text" placeholder="Task" onChange={(e) => setTask(e.target.value)} className="border px-2 py-1" />
                <button type="submit" className="border px-3 py-1">Submit</button>
            </form>

            <ul>
                {listTasks}
            </ul>
        </>
    )
}
