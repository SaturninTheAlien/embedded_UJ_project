'use strict';

import {calculateCost, calculateTime} from "./cost_and_time.js";

function renderSystemDescription(system_in){
    let inner_html = "<p>";
    for(let e of system_in){
        inner_html += `${e.processor.name}: ${e.tasks.join(",")} <br/>`;
    }
    inner_html += "</p>";
    return inner_html;
}

function renderSystemStatistics(task_graph, system_in, show_detailed_time_results=true){

    let cost_results = calculateCost(system_in, task_graph);
    let time_results = calculateTime(system_in, task_graph);

    let inner_html =  `
    <p>
    Cost of programmable processors: ${cost_results.cost_of_processors}<br/>
    Cost of execution: ${cost_results.cost_of_execution}<br/>
    Cost of channels: ${cost_results.cost_of_channels}<br/>
    Total cost: ${cost_results.total_cost}<br/>
    Total time: ${time_results.total_time}
    </p>
    `;

    if(show_detailed_time_results){
        for(let dr of time_results.detailed_results){
            inner_html += `<p>${dr.task_name}: ${dr.start_time} _ ${dr.end_time} # ${dr.proc_name}</p>`
        }
    }

    return inner_html;
}

function renderSystemDescriptionWithStatistics(task_graph, system_in, show_detailed_time_results=true){
    let inner_html = renderSystemDescription(system_in);
    inner_html += renderSystemStatistics(task_graph, system_in, show_detailed_time_results);

    return inner_html;
}

export {renderSystemDescription, renderSystemStatistics, renderSystemDescriptionWithStatistics};