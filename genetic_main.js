'use strict';

import {readTaskGraph} from "./task_graph.js";

function genetic_main(task_graph_in, alpha){

    let task_graph = task_graph_in;
    if (typeof task_graph_in === "string"){
        task_graph = readTaskGraph(task_graph_in);
    }

    let n = task_graph.tasks.length;
    console.log(`n = ${n}`);
    
}

export {genetic_main};