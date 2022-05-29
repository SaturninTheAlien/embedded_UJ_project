'use strict';

import { createSpanningTree } from "./spanning_tree.js";
import { calculateCost, calculateTime } from "./cost_and_time.js";
import { createEmbeddedSystemFromSpanningTree } from "./spanning_tree_to_system.js";
import { crossOver, mutation, cloneTree } from "./genetic.js";

class Individual{
    constructor(task_graph, tree, origin, calculateScoreFunc){
        /**
         * Spanning tree
         */
        this.tree = tree;

        /** Origin
         * 0 -> initial, best time/cost
         * 1 -> initial, random
         * 2 -> crossing-over,
         * 3 -> mutation,
         * 4 -> cloning
         */
        this.origin = origin;
        /**
         * System created from the spanning tree.
         */
        this.system = createEmbeddedSystemFromSpanningTree(task_graph, this.tree);
        
        /**
         * Cost of execution.
         */
        this.cost = calculateCost(this.system, task_graph);
        /**
         * Time of execution.
         */
        this.time = calculateTime(this.system, task_graph);
        /**
         * Score calculated by given function,
         * the lowest is the best, the highest is the worst.
         */
        this.score = calculateScoreFunc(this.time.total_time, this.cost.total_cost);
    }
}

class GeneticApp{
    constructor(root_div,
    task_graph,
    score_func,
    start_n = 2,
    max_n = 15,
    number_by_crossing = 10,
    number_by_mutation = 2,
    number_by_cloning = 1

    ){
        this.individuals = [];

        this.root_div = root_div;
        this.task_graph = task_graph;
        this.calculateScoreFunc = score_func;

        this.max_n = max_n;        
        this.number_by_crossing = number_by_crossing;
        this.number_by_mutation = number_by_mutation;
        this.number_by_cloning = number_by_cloning;

        for(let i=0;i<start_n;++i){
            this.individuals.push(new Individual(
                task_graph,
                createSpanningTree(task_graph),
                1,
                score_func));
        }

        this.best_individual = this.individuals[0];
        this.updateBestIndividual();
    }

    updateBestIndividual(){
        for(let ind of this.individuals){
            if(ind.score < this.best_individual.score){
                this.best_individual = ind;
            }
        }
    }

    randomIndex(){
        return Math.floor(Math.random() * this.individuals.length);
    }

    randomIndexOtherThan(index){
        let res = Math.floor(Math.random() * (this.individuals.length - 1));
        return res < index ? res : res + 1;
    }

    removeTheWorstRoulette(){

        let score_sum = this.individuals.map(a => a.score).reduce((a,b)=> a+b);

        let _this = this;
        function getIndexToRemove(){
            
            let x = Math.random() * score_sum;
            for(let i=0;i<_this.individuals.length;++i){
                x -= _this.individuals[i].score;
                if(x<=0)return i;
            }

            return -1;
        }

        let index_to_remove = getIndexToRemove();

        if(index_to_remove!=-1){
            this.individuals = this.individuals.slice(0, index_to_remove).concat(
                this.individuals.slice(index_to_remove + 1));
        }
        else{
            throw "Incorrect index to remove element.";
        }
    }

    render(){
        this.root_div.innerHTML = `
        <p>Individuals: ${this.individuals.length}/${this.max_n}
        <button type="button" name="next_generation">Next generation</button></p>

        <p>The best individual: <br/>
        
        Tree: ${this.best_individual.tree.constructionOptionsBracketNotation()} <br/>
        Cost: ${this.best_individual.cost.total_cost} <br/>
        Time: ${this.best_individual.time.total_time} <br/>
        Score:${this.best_individual.score} </p>

        <p> All individuals: </p>
        <table name="individuals_table" class="t1">
            <tr>
                <th> </th>
                <th>Tree  </th>
                <th>Cost  </th>
                <th>Time  </th>
                <th>Score </th>
            </tr>
        </table>
        `;

        let individuals_table = this.root_div.querySelector("table[name='individuals_table']");
        let next_generation_btn = this.root_div.querySelector("button[name='next_generation']");
        
        let _this = this;
        next_generation_btn.onclick = function(){
            _this.nextGeneration();
            _this.render();
        }

        let counter = 1;

        for(let ind of this.individuals){
            let row = individuals_table.insertRow(-1);

            row.classList.add(`orig-${ind.origin}`);
            
            let cell = row.insertCell(0);
            cell.innerText = counter.toString();
            ++counter;

            cell = row.insertCell(1);
            cell.innerText = ind.tree.constructionOptionsBracketNotation();

            cell = row.insertCell(2);
            cell.innerText = ind.cost.total_cost;

            cell = row.insertCell(3);
            cell.innerText = ind.time.total_time;

            cell = row.insertCell(4);
            cell.innerText = ind.score;
        }
    }

    createByCrossingOver(parent1, parent2){
        let crossResult = crossOver(parent1.tree, parent2.tree);
        return new Individual(this.task_graph, crossResult.tree1, 2, this.calculateScoreFunc);
    }

    createByMutation(parent){
        return new Individual(this.task_graph, mutation(parent.tree), 3, this.calculateScoreFunc);
    }

    createByCloning(parent){
        return new Individual(this.task_graph, cloneTree(parent.tree), 4, this.calculateScoreFunc);
    }

    nextGeneration(){

        for(let i=0;i<this.number_by_crossing;++i){
            let index1 = this.randomIndex();
            let index2 = this.randomIndexOtherThan(index1);

            let parent1 = this.individuals[index1];
            let parent2 = this.individuals[index2];

            this.individuals.push(this.createByCrossingOver(parent1, parent2));
        }

        for(let i=0;i<this.number_by_mutation;++i){
            let parent = this.individuals[this.randomIndex()];
            this.individuals.push(this.createByMutation(parent));
        }

        for(let i=0;i<this.number_by_cloning;++i){
            let parent = this.individuals[this.randomIndex()];
            this.individuals.push(this.createByCloning(parent));
        }

        while(this.individuals.length > this.max_n){
            this.removeTheWorstRoulette();
        }

        this.updateBestIndividual();
        
    }
}


export {GeneticApp};