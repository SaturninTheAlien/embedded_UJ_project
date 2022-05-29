/**
 * Module to create system form spanning tree.
 * Available construction options:
 *  1. New (not allocated) the fastest
 *  2. New (not allocated) the cheapest
 *  3. Used the fastest                  -> fallback 1
 *  4. Used the cheapest                 -> fallback 2
 *  5. Used min (time*cost)              -> fallback 6
 *  6. New min (time*cost)  
 *  7. Idle for the longest time         -> fallback 6
 *  8. The rarest used                   -> fallback 6
 *  9. The same as predecessor           -> fallback 6
 */

'use strict';

function createEmbeddedSystemFromSpanningTree(task_graph, spanning_tree){

    let embedded_system = [];

    function addNewProcessor(task, calculate_score){
        
        let chosen_index = 0;
        let chosen_score = calculate_score(0);

        for(let i=1;i<task_graph.processors.length;++i){
            let new_score = calculate_score(i);
            if(new_score < chosen_score){
                chosen_score = new_score;
                chosen_index = i;
            }
        }

        let chosen_proc_type = task_graph.processors[chosen_index];
        if(chosen_proc_type.hardware_core){
            let e = embedded_system.find(a => a.proc_type_id == chosen_index);
            if(e==null){
                embedded_system.push({
                    "tasks": [task.name, ],
                    "processor": {
                        "hardware_core": true,
                        "type_id": chosen_index,
                        "name": chosen_proc_type.name
                    }
                });
            }
            else{
                e.tasks.push(task.name);
            }

            return null;
        }
        else{
            let proc_counter = embedded_system.filter(a => a.processor.type_id == chosen_index).length;
            embedded_system.push({
                "tasks": [task.name, ],
                "processor": {
                    "hardware_core": false,
                    "type_id": chosen_index,
                    "name": chosen_proc_type.name +"_"+proc_counter
                }
            });

            return embedded_system[embedded_system.length-1]; 
        }
    }

    function selectAlreadyUsedProcessor(task, calculate_score){
        let chosen_element = null;
        let chosen_score = Number.MAX_VALUE;
        for(let e of embedded_system){
            if(!e.processor.hardware_core){
                let new_score = calculate_score(e.processor.type_id);
                if(new_score<chosen_score){
                    chosen_score = new_score;
                    chosen_element = e;
                }
            }
        }

        if(chosen_element==null){
            //Fallback, no processor meeting the criteria exists.
            return addNewProcessor(task, calculate_score);
        }
        else{
            chosen_element.tasks.push(task.name);
            return chosen_element;
        }
    }

    function new_the_fastest(task){
        return addNewProcessor(task, function(index){
            return task.times_per_processor[index];
        });
    }

    function new_the_cheapest(task){
        return addNewProcessor(task, function(index){
            return task.costs_per_processor[index];
        });
    }

    function new_best_tcm(task){
        return addNewProcessor(task, function(index){
            return task.costs_per_processor[index]*task.times_per_processor[index];
        });
    }

    function used_the_fastest(task){
        return selectAlreadyUsedProcessor(task, function(index){
            return task.times_per_processor[index];
        });
    }

    function used_the_cheapest(task){
        return selectAlreadyUsedProcessor(task, function(index){
            return task.costs_per_processor[index];
        });
    }

    function used_best_tcm(task){
        return selectAlreadyUsedProcessor(task, function(index){
            return task.costs_per_processor[index] * task.times_per_processor[index];
        });
    }


    function the_rarest_used(task){
        let chosen_element = null;
        let tmp = Number.MAX_VALUE;

        for(let e of embedded_system){
            if(!e.processor.hardware_core){
                let new_tmp = e.tasks.length;
                if(new_tmp<tmp){

                    tmp = new_tmp;
                    chosen_element = e;
                }
            }
        }

        if(chosen_element==null){
            return new_best_tcm(task);
        }
        else{
            chosen_element.tasks.push(task.name);
            return chosen_element;
        }
    }

    function mCalculateTime(task_name, proc_type_id){
        let task = task_graph.tasks.find(t => t.name==task_name);
        if(task==null){
            throw `Task with the name ${task_name} not found`;
        }
        return task.times_per_processor[proc_type_id];
    }

    function idle_the_longest_time(task){
        let chosen_element = null;
        let tmp = Number.MAX_VALUE;

        for(let e of embedded_system){
            if(!e.processor.hardware_core){
                let new_tmp = e.tasks.
                map(t_name => mCalculateTime(t_name, e.processor.type_id)).
                reduce((a,b)=>a+b);

                if(new_tmp<tmp){

                    tmp = new_tmp;
                    chosen_element = e;
                }
            }
        }

        if(chosen_element==null){
            return new_best_tcm(task);
        }
        else{
            chosen_element.tasks.push(task.name);
            return chosen_element;
        }
    }

    function f1(tree_node){
        if(tree_node==null)return;

        let task = task_graph.tasks[tree_node.task_index];
        let previous_element = null;

        switch(tree_node.construction_option){
            case 1:{
                previous_element = new_the_fastest(task);
            }
            break;
            case 2:{
                previous_element = new_the_cheapest(task);
            }
            break;
            case 3:{
                previous_element = used_the_fastest(task);
            }
            break;
            case 4:{
                previous_element = used_the_cheapest(task);
            }
            break;
            case 5:{
                previous_element = used_best_tcm(task);
            }
            break;
            case 6:{
                previous_element = new_best_tcm(task);
            }
            break;
            case 7:{
                previous_element = idle_the_longest_time(task);
            }
            break;
            case 8:{
                previous_element = the_rarest_used(task);
            }
            break;
            case 9:{
                if(previous_element!=null){
                    previous_element.tasks.push(task.name);
                }
                else{
                    previous_element = new_best_tcm(task);
                }
            }
            break;
            default:
                throw `Unsupported construction option: ${tree_node.construction_option}`;
        }

        for(let child_node of tree_node.children){
            f1(child_node);
        }
    }

    f1(spanning_tree);    
    return embedded_system;
}

export {createEmbeddedSystemFromSpanningTree};