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

    
    console.log(container);
    let chart = new google.visualization.Timeline(container);
    let dataTable = new google.visualization.DataTable();

    dataTable.addColumn({ type: 'string', id: 'ProcessingElement' });
    dataTable.addColumn({ type: 'string', id: 'TaskName' });
    dataTable.addColumn({ type: 'string', role: 'tooltip' });
    dataTable.addColumn({ type: 'date', id: 'Start' });
    dataTable.addColumn({ type: 'date', id: 'End' });

    let rows = [];
    for(let a of time_results.detailed_results){

        let start_time_normalized = 100*a.start_time / time_results.total_time;
        let end_time_normalized = 100*a.end_time / time_results.total_time;

        let row = [
            a.proc_name,
            a.task_name,
            `Time: ${a.end_time - a.start_time}`,
            value_to_year(start_time_normalized),
            value_to_year(end_time_normalized)
        ];
        rows.push(row);
    }

    dataTable.addRows(rows);

    let options = {
        avoidOverlappingGridLines: false
    };
    chart.draw(dataTable, options);

    for (let horizontalLabel of container.querySelectorAll('svg > g:nth-child(3) > text')) {

        horizontalLabel.textContent = Math.round(time_results.total_time*
        (parseInt(horizontalLabel.innerHTML) - horizontal_label_value_helper)/100);
    }
}

export {drawGanttChart};