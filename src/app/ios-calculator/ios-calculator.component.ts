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

        // console.log(this.elRef);
        // console.log(this.container);

        // 5 + 10 * 2 * 3 + 7 + 1 = 73
        const result = chain(add(chain(multiply(10), multiply(2))(3)), add(7), add(1))(5);
        console.log(result === 73, result);
    }

    clickNumber(num: number) {
        const state = this.state;
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
        console.log('state', this.state);
        switch (operator) {
            case Operator.add:
                let newOperation: Operation = null;
                let newState: State = null;
                if (!this.state.rootOperation) {
                    newOperation = {
                        value: this.state.value,
                        funcs: [],
                        operator: operator,
                        child: null,
                    };

                    newState = {
                        ...this.state,
                        rootOperation: newOperation,
                        operation: newOperation,
                    };
                } else {
                    newOperation = {
                        value: this.state.value,
                        funcs: [],
                        operator: operator,
                        child: null,
                    };

                    newState = {
                        ...this.state,
                    };
                    newState.operation.child = newOperation;
                    newState.operation = newOperation;
                }

                newState.value = 0;
                this.state = newState;
                break;
            case Operator.equal:
                this.evaluateOperation(this.state.rootOperation);
                break;
            case Operator.allClear:
                break;
        }
        console.log('root', this.state.rootOperation);
        console.log('new', this.state.operation);
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
}

interface Operation {
    value: number;
    funcs: ((a: number) => number)[];
    operator: Operator;
    child: Operation;
}
