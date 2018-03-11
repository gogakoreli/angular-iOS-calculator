import {
    Component,
    ElementRef,
    OnInit,
    ViewChild
    } from '@angular/core';
import { build$ } from 'protractor/built/element';

@Component({
    selector: 'ios-calculator',
    templateUrl: './ios-calculator.component.html',
    styleUrls: ['./ios-calculator.component.scss']
})
export class IosCalculatorComponent implements OnInit {

    state: State = INITIAL_STATE;

    currentValue: number;
    displayedValue: number;
    operator: Operator;

    @ViewChild('container') container: ElementRef;

    constructor(
        private elRef: ElementRef,
    ) { }

    ngOnInit() {
        const calcElem: HTMLElement = this.elRef.nativeElement;
        const contElem: HTMLElement = this.container.nativeElement;

        // const scale = Math.min(
        //     contElem.size.width / elWidth,
        //     ui.size.height / elHeight
        // );

        // 5 + 10 * 2 * 3 + 7 + 1 = 73
        const result = chain(add(chain(multiply(10), multiply(2))(3)), add(7), add(1))(5);
        console.log(result === 73, result);
    }

    clickNumber(num: number) {
        const state = this.state;

        if (this.state.newlyClickedOperator) {
            this.state.value = 0;
            this.state.newlyClickedOperator = false;
        }

        if (state.operator !== Operator.none) {
            const newValue = state.value * 10 + num;
        } else {
            const newValue = state.value * 10 + num;
            this.state = {
                ...this.state,
                value: newValue
            };
        }
    }

    clickOperator(operator: Operator) {
        switch (operator) {
            case Operator.add:
                const addState = this.getNewOperationState(this.state, this.state.value, operator);
                addState.newlyClickedOperator = true;
                this.state = addState;
                break;
            case Operator.minus:
                const mnsState = this.getNewOperationState(this.state, this.state.value, operator);
                mnsState.newlyClickedOperator = true;
                this.state = mnsState;
                break;
            case Operator.multiply:
                const mltState = this.getMultiplyOperationState(this.state);
                mltState.newlyClickedOperator = true;
                this.state = mltState;
                break;
            case Operator.equal:
                const eqState = this.getNewEqualOperationState(this.state);
                this.state = eqState;
                break;
            case Operator.allClear:
                this.state = INITIAL_STATE;
                break;
        }
        console.log('root', this.state.rootOperation);
        console.log('new', this.state.operation);
    }

    getNewOperationState(oldState: State, value: number, operator?: Operator): State {
        const newOperation: Operation = {
            value: value,
            funcs: [],
            operator: operator,
            child: null,
        };
        let newState: State = null;

        if (!oldState.rootOperation) {
            newState = {
                ...oldState,
                rootOperation: newOperation,
                operation: newOperation,
            };
        } else {
            newState = {
                ...oldState,
            };
        }

        newState.operation.child = newOperation;
        newState.operation = newOperation;
        return newState;
    }

    getNewEqualOperationState(state: State): State {
        let newRootOperation: Operation = null;
        let result: State = null;
        if (!state.rootOperation && state.operation) {
            newRootOperation = {
                ...state.operation,
                value: state.value,
            };
            const oldOperationValue = state.operation.value;
            state.rootOperation = newRootOperation;
            state.operation = newRootOperation;
            result = this.getNewOperationState(state, oldOperationValue);
        } else {
            result = this.getNewOperationState(state, state.value);
        }
        const newValue = this.evaluateOperation(result.rootOperation);

        const newOperation: Operation = {
            ...result.operation,
            operator: state.operation.operator,
        };

        result.operation = newOperation;
        result.rootOperation = null;
        result.value = newValue;

        console.log('evaluation', newValue);
        return result;
    }

    getMultiplyOperationState(state: State): State {
        const result: State = this.getNewOperationState(state, state.value, Operator.multiply);

        if (!result.operation.funcs) {
            result.operation.funcs = [];
        }
        result.operation.funcs.push(multiply(state.value));

        return result;
    }

    evaluateOperation(operation: Operation) {
        let childValue = operation.value;
        if (operation.child) {
            childValue = this.evaluateOperation(operation.child);
        }
        switch (operation.operator) {
            case Operator.add:
                return add(operation.value)(childValue);
            case Operator.minus:
                return minus(operation.value)(childValue);
        }
        return childValue;
    }
}

function add(a: number): (b: number) => number {
    return (b) => a + b;
}

function minus(a: number): (b: number) => number {
    return (b) => a - b;
}

function multiply(a: number): (b: number) => number {
    return (b) => a * b;
}

function divide(a: number): (b: number) => number {
    return (b) => a / b;
}

function chain(...fns: ((a: number) => number)[]) {
    return (b: number): number => fns.reduce((cur, fn) => fn(cur), b);
}

export enum Operator {
    none = 'none',
    divide = 'divide',
    multiply = 'multiply',
    minus = 'minus',
    add = 'add',
    equal = 'equal',
    percent = 'percent',
    plusMinus = 'plusMinus',
    clear = 'clear',
    dot = 'dot',
    allClear = 'allClear',
}

const INITIAL_STATE: State = {
    first: 0,
    second: 0,
    display: 0,
    value: 0,
    operator: Operator.none,
    chain: (a: number) => a,
    rootOperation: null,
    operation: null,
    newlyClickedOperator: false,
};

export interface State {
    first: number;
    second: number;
    display: number;
    value: number;
    operator: Operator;
    chain: (a: number) => number;
    operation: Operation;
    rootOperation: Operation;
    newlyClickedOperator: boolean;
}

interface Operation {
    value: number;
    funcs: ((a: number) => number)[];
    operator: Operator;
    child: Operation;
}
