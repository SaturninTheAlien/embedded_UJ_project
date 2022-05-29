'use strict';

import {SpanningTreeNode, chooseRandomConstructionOption} from spanning_tree

class BracketTreeSymbol {}

class BracketTreeNode extends BracketTreeSymbol{
    constructor(task_index, construction_option){
        this.task_index = task_index;
        this.construction_option = construction_option;
    }

    toString(){
        return `[${this.task_index}, ${this.construction_option}]`;
    }

    toSpanningTreeNode(){
        return new SpanningTreeNode(this.task_index, this.construction_option);
    }
}

class _BraketTreeBracketOpen extends BracketTreeSymbol {
    toString(){
        return "(";
    }
}

class _BraketTreeBracketClose extends BracketTreeSymbol {
    toString(){
        return ")";
    }
}

const BRACKET_OPEN = new _BraketTreeBracketOpen();
const BRACKET_CLOSE = new _BraketTreeBracketClose();

class SpanningTreeBracketNotation{
    constructor(root){
        this.symbolsList = [];
        this.nodesNumber = 0;
        if(root!=null) this._addNode(root);
    }

    _addNode(node){
        this.nodesNumber+=1;
        this.symbolsList.push(new BracketTreeNode(node.task_index, node.construction_option));
        if(node.children!=null && node.children.length>0){
            this.symbolsList.push(BRACKET_OPEN);
            for(let childNode of node.children){
                this._addNode(childNode);
            }
            this.symbolsList.push(BRACKET_CLOSE);
        }
    }

    _addChildren(parent_node, start_index){
        let i = start_index + 1;
        let last_node = null;
        
        while(i<this.symbolsList.length){
            let symbol = this.symbolsList[i];
            if(Object.is(symbol, BRACKET_OPEN)){
                if(last_node==null){
                    throw "Incorrect bracket notation";
                }

                i = this._addChildren(last_node, i) + 1;
            }
            else if(Object.is(symbol, BRACKET_CLOSE)){
                return i;
            }
            else{
                last_node = symbol.toSpanningTreeNode();
                parent_node.children.push(last_node);
                ++i;
            }
        }
        return 0;
    }

    findIndexOfNthNode(n){
        let counter = 0;

        for(let i=0;i<this.symbolsList.length;++i){
            let symbol = this.symbolsList[i];
            if(symbol instanceof BracketTreeNode){
                if(counter==n){
                    return i;
                }
                ++counter;
            }
        }
        return -1;
    }

    toSpanningTree(){
        if(this.symbolsList.length==0)return null;

        let root = this.symbolsList[0].toSpanningTreeNode();

        if(this.symbolsList.length > 1 && Object.is(this.symbolsList[1], BRACKET_OPEN)){
            this._addChildren(root, 1);
        }
    }

    toString(){
        return this.symbolsList.map(s=>s.toString()).join(",");
    }
}


function crossOver(tree1, tree2){
    if(!tree1 instanceof SpanningTreeNode){
        throw "Tree1 is not a correct spanning tree.";
    }

    if(!tree2 instanceof SpanningTreeNode){
        throw "Tree2 is not a correct spanning tree.";
    }
    
    /** Convert normal spanning tree to bracket notation */
    tree1_bracket = new SpanningTreeBracketNotation(tree1);
    tree2_bracket = new SpanningTreeBracketNotation(tree2);

    if(tree1_bracket.nodesNumber!=tree2_bracket.nodesNumber){
        throw "Nodes numbers in tree1 and tree2 are not equal.";
    }
    
    let x = Math.floor(Math.random() * tree1_bracket.nodesNumber);
    
    let x1 = tree1_bracket.findIndexOfNthNode(x);
    let x2 = tree2_bracket.findIndexOfNthNode(x);

    let tmp1 = tree1_bracket.symbolsList.slice(0, x1).concat( tree2_bracket.symbolsList.slice(x2));
    let tmp2 = tree2_bracket.symbolsList.slice(0, x2).concat( tree1_bracket.symbolsList.slice(x1));
    
    tree1_bracket.symbolsList = tmp1;
    tree2_bracket.symbolsList = tmp2;

    return {
        "tree1": tree1_bracket.toSpanningTree(),
        "tree2": tree2_bracket.toSpanningTree()
    }
}

function mutation(tree, probablity){

    if(Math.random()<=probablity){
        tree_bracket = new SpanningTreeBracketNotation(tree);
        let x = Math.floor(Math.random() * tree_bracket.nodesNumber);
        let x1 = tree_bracket.findIndexOfNthNode(x);
        tree_bracket.symbolsList[x1].construction_option = chooseRandomConstructionOption();
        return tree_bracket.toSpanningTree();   
    }
    return tree;
}

function cloneTree(tree){

    function cloneNodeRecursive(old_node){
        let new_node = new SpanningTreeNode(old_node.task_index, old_node.construction_option);

        for(let child_node of old_node.children){
            new_node.children.push( cloneNodeRecursive(child_node) );
        }

        return new_node;
    }

    return cloneNodeRecursive(tree);
}


export {crossOver, mutation, cloneTree};