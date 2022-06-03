'use strict';


import { drawGanttChart } from "./gantt.js";
import { calculateTime } from "./cost_and_time.js";

import { readTaskGraph} from "./task_graph.js";
import { createSpanningTree } from "./spanning_tree.js";
import { createEmbeddedSystemFromSpanningTree } from "./spanning_tree_to_system.js";
import { renderSystemDescription, renderSystemStatistics } from "./render.js";
import { crossOver, mutation, cloneTree } from "./genetic.js";


function renderSystemDescriptionFromTree(task_graph, spanning_tree, tree_name="Tree"){

    let system = createEmbeddedSystemFromSpanningTree(task_graph, spanning_tree);

    let inner_html = `
    <div style="display: flex;">
        <div style="flex: 1;">
            <p> ${tree_name} : ${spanning_tree.constructionOptionsBracketNotation()} </p>
            ${renderSystemStatistics(task_graph, system, false)}
        </div>
    
        <div style="flex: 1;">
            <p> ${renderSystemDescription(system)} </p>
        </div>
    </div>
    `

    return inner_html;
}

function mutation_test(task_graph_in){
    let task_graph = readTaskGraph(task_graph_in);

    let before_mutation = createSpanningTree(task_graph);
    let after_mutation = mutation(before_mutation);

    let inner_html = `<h2>Before mutation: </h2>`;
    inner_html += renderSystemDescriptionFromTree(task_graph, before_mutation);

    inner_html += `<h2>After mutation: </h2>`;
    inner_html += renderSystemDescriptionFromTree(task_graph, after_mutation);

    return inner_html;
}

function clone_test(task_graph_in){
    let task_graph = readTaskGraph(task_graph_in);
    let tree = createSpanningTree(task_graph);
    let tree_clone = cloneTree(tree);

    let inner_html = `<h2>Original tree: </h2>`;
    inner_html += renderSystemDescriptionFromTree(task_graph, tree);

    inner_html += `<h2>Cloned tree: </h2>`;
    inner_html += renderSystemDescriptionFromTree(task_graph, tree_clone);

    return inner_html;
}

function crossover_test(task_graph_in){
    let task_graph = readTaskGraph(task_graph_in);

    let tree1 = createSpanningTree(task_graph);
    let tree2 = createSpanningTree(task_graph);

    let crossing_results = crossOver(tree1, tree2);

    let inner_html = `<h2>Before crossing-over: </h2>`;
    inner_html += renderSystemDescriptionFromTree(task_graph, tree1, "Tree 1");
    inner_html += renderSystemDescriptionFromTree(task_graph , tree2, "Tree 2");

    inner_html += `<h2>After crossing-over: </h2>`;

    inner_html += renderSystemDescriptionFromTree(task_graph, crossing_results.tree1, "Tree 1");
    inner_html += renderSystemDescriptionFromTree(task_graph , crossing_results.tree2, "Tree 2");

    return inner_html;
}

function gantt_test(task_graph_in, container){
    let task_graph = readTaskGraph(task_graph_in);

    let tree = createSpanningTree(task_graph);
    let system = createEmbeddedSystemFromSpanningTree(task_graph, tree);
    let time_results = calculateTime(system, task_graph);
    drawGanttChart(container, time_results)
}

export {crossover_test, mutation_test, clone_test, gantt_test};