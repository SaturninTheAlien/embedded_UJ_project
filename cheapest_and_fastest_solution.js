/**
 * Module to find cheapest and fastests embedded systems.
 */

'use strict';
function findFastestProcessorTypeIndex(task){

    let chosen_index = 0;
    let chosen_time = task.times_per_processor[0];
    let chosen_cost = task.costs_per_processor[0];

    for(let i=1;i<task.times_per_processor.length;++i){
        let time2 = task.times_per_processor[i];
        let cost2 = task.costs_per_processor[i];

        if(time2<chosen_time || (time2==chosen_time && cost2<chosen_cost)){
            chosen_index = i;
            chosen_time = time2;
            chosen_cost = cost2;
        }
    }
    return chosen_index;
}


function findTheFastestSolution(task_graph){

    let embedded_system = [];

    let pp_counter = 0;
    for(let task of task_graph.tasks){
        let chosen_proccessor_index = findFastestProcessorTypeIndex(task);

        let processor_type = task_graph.processors[chosen_proccessor_index];
        if(processor_type.hardware_core){
            let s = embedded_system.find(s=>s.processor.type_id == chosen_proccessor_index);
            if(s!=null){
                s.tasks.push(task.name);
            }
            else{
                embedded_system.push({
                    "tasks": [task.name],
                    "processor":{
                        "hardware_core": true,
                        "type_id": chosen_proccessor_index,
                        "name": processor_type.name
                    }
                })
            }
        }
        else{
            embedded_system.push({
                "tasks": [task.name],
                "processor": {
                    "hardware_core": false,
                    "type_id": chosen_proccessor_index,
                    "name": processor_type.name+"_"+pp_counter.toString()
                }
            })
            ++pp_counter;
        }
    }

    return embedded_system;
}

function findTheCheapestSolution(task_graph){

    let tmp = [];
    for(let i=0;i<task_graph.processors.length;++i){
        
        let proc = task_graph.processors[i];
        if(proc.hardware_core)continue;
        let total_cost = proc.cost +
        task_graph.tasks.map(t=>t.costs_per_processor[i]).reduce((a,b)=>a+b);

        tmp.push({
            "proc": proc,
            "totol_cost": total_cost,
            "proc_id": i
        });
    }

    tmp = tmp.reduce((a,b)=>a.totol_cost>b.totol_cost?b:a);
    return [{
        "processor":{
            "hardware_core":false,
            "name": tmp.proc.name + "_0",
            "type_id": tmp.proc_id,
        },
        "tasks": task_graph.tasks.map(t=>t.name),
    }]
}

export {findTheFastestSolution, findTheCheapestSolution, findFastestProcessorTypeIndex};