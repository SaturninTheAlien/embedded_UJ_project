/**
 * Module to draw gantt charts.
 */

const horizontal_label_value_helper = 100;

google.charts.load('current', {'packages':['timeline']});


function value_to_year(value) {
    let date =  new Date(value, 1, 1);
    date.setFullYear(value + horizontal_label_value_helper); // library does not show horizontal labels for values < 100
    return date;
}

function drawGanttChart(container, time_results) {
    

    //let normalization_required = time_results.total_time > 500;

    let normalization_required = true;
    let chart = new google.visualization.Timeline(container);
    let dataTable = new google.visualization.DataTable();

    dataTable.addColumn({ type: 'string', id: 'ProcessingElement' });
    dataTable.addColumn({ type: 'string', id: 'TaskName' });
    dataTable.addColumn({ type: 'string', role: 'tooltip' });
    dataTable.addColumn({ type: 'date', id: 'Start' });
    dataTable.addColumn({ type: 'date', id: 'End' });

    let rows = [];
    for(let a of time_results.detailed_results){

        let start_time = a.start_time;
        let end_time = a.end_time;

        if(normalization_required){
            start_time = 200*start_time/time_results.total_time;
            end_time = 200*end_time/time_results.total_time;
        }

        let row = [
            a.proc_name,
            a.task_name,
            `Time: ${a.end_time - a.start_time}`,
            value_to_year(start_time),
            value_to_year(end_time)
        ];
        rows.push(row);
    }

    dataTable.addRows(rows);

    let options = {
        avoidOverlappingGridLines: false
    };
    chart.draw(dataTable, options);

    for (let horizontalLabel of container.querySelectorAll('svg > g:nth-child(3) > text')) {
        
        let new_label_value = parseInt(horizontalLabel.textContent) - horizontal_label_value_helper;
        
        if(normalization_required){
            new_label_value = Math.round(new_label_value*time_results.total_time/200);
        }

        horizontalLabel.textContent = new_label_value.toString();
    }
}

export {drawGanttChart};