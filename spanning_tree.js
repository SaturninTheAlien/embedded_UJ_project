/**
 * Spanning tree module.
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
class SpanningTreeNode{
    constructor(task_index, construction_option=0){
        this.task_index = task_index;
        this.construction_option = construction_option;
        this.children = [];
    }

    toString(){
        let result = `${this.task_index}<${this.construction_option}>`

        if(this.children.length>0){
            result+="(" + this.children.map(a=>a.toString()).join(",") + ")";
        }

        return result;
    }

    constructionOptionsBracketNotation(){
        let result = this.construction_option.toString();
        if(this.children.length>0){
            result+="(" + this.children.map(a=>a.constructionOptionsBracketNotation()).join(",") + ")"; 
        }
        return result;
    }

}

function chooseRandomConstructionOption(task){
    return Math.floor(Math.random() * 9) + 1;
}

function createSpanningTree(task_graph, choose_construction_option=chooseRandomConstructionOption){
    if(task_graph.tasks.length==0)return null;

    let s1 = new Set();
    
    function f1(parent_node, task){
        for(let s of task.successors){

            let s_id = s.id;
            if(!s1.has(s_id)){

                s1.add(s_id);
                let s_task = task_graph.tasks[s_id];
                let child_node = new SpanningTreeNode(s_id, choose_construction_option(s_task));

                f1(child_node, s_task);

                parent_node.children.push(child_node);
            }
        }
    }

    let root_task = task_graph.tasks[0];
    let root = new SpanningTreeNode(0, choose_construction_option(root_task));

    s1.add(0);
    f1(root, root_task);

    return root;
}



export {SpanningTreeNode, createSpanningTree, chooseRandomConstructionOption};