/**
 * Module to calculate time and cost of execution.
 */

'use strict';

function findProcInSystemByTaskName(embedded_system, task_name){
    for(let e of embedded_system){
        if(e.tasks.find(o=>o==task_name)!=null){
            return e.processor;
        }
    }
    return null;
}

function calculateTime(embedded_system, task_graph){
    let detailed_results = [];

    let channel = task_graph.channels.find(function(channel){
        for(let b of channel.suitable_for_processors){
            if(!b)return false;
        }
        return true;
    });

    if(channel==null){
        throw "Systems without default channel not supported yet";
    }

    function f1(programmable_proc_name, start_time){
        let tmp = detailed_results.filter(dr => dr.proc_name==programmable_proc_name);
        if(tmp.length==0)return start_time;

        let last_task_end_time = tmp.map(t=>t.end_time).reduce((a,b)=>a>b?a:b);
        return last_task_end_time > start_time ? last_task_end_time : start_time;
    }

    function f2(task_name, start_time){
        let task = task_graph.tasks.find(t=>t.name==task_name);

        let proc = findProcInSystemByTaskName(embedded_system, task_name);
        if(proc==null){
            return;
        }

        if(!proc.hardware_core){
            start_time = f1(proc.name, start_time);
        }

        let proc_type_id = proc.type_id;
        let end_time = start_time + task.times_per_processor[proc_type_id];


        detailed_results.push({
            "task_name":task_name,
            "start_time":start_time,
            "end_time":end_time,
            "proc_name":proc.name
        })

        for(let successor of task.successors){
            let successor_name = task_graph.tasks[successor.id].name;
            if(detailed_results.find(t=>t.task_name==successor_name)==null){
                let data_transfer_time = 0;
                if(successor.data!=0){
                    data_transfer_time = Math.ceil(successor.data / channel.data);
                }
                f2(successor_name, end_time + data_transfer_time);
            }
        }
    }

    let t0 = task_graph.tasks[0];
    f2(t0.name, 0);

    let total_time = detailed_results.map(o=>o.end_time).reduce(
        (prev, current) => prev > current ? prev : current
    );
    
    return {
        "detailed_results":detailed_results,
        "total_time":total_time
    };
}

function calculateCost(embedded_system, task_graph){

    let total_number_of_processors = 0;

    let cost_of_processors = 0;
    let cost_of_channels = 0;
    let cost_of_execution = 0;

    for(let e of embedded_system){

        let proc_type_id = e.processor.type_id;

        if(e.processor.hardware_core){
            total_number_of_processors += e.tasks.length;
        }
        else{
            ++total_number_of_processors;
            cost_of_processors += task_graph.processors[proc_type_id].cost;
        }

        for(let t_name of e.tasks){
            let task = task_graph.tasks.find(t=>t.name == t_name);
            cost_of_execution+=task.costs_per_processor[proc_type_id];
        }
    }

    let channel = task_graph.channels.find(function(channel){
        for(let b of channel.suitable_for_processors){
            if(!b)return false;
        }
        return true;
    });

    if(channel==null){
        throw "Systems without default channel not supported yet";
    }

    cost_of_channels = channel.cost * total_number_of_processors;

    return {
        "cost_of_processors":cost_of_processors,
        "cost_of_channels":cost_of_channels,
        "cost_of_execution":cost_of_execution,
        "total_cost":cost_of_channels+cost_of_processors+cost_of_execution
    }
}

export {calculateCost, calculateTime};