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

    @ViewChild('container') containerRef: ElementRef;

    constructor(
        private calculatorRef: ElementRef,
    ) { }

    ngOnInit() {
        const calculator: HTMLElement = this.calculatorRef.nativeElement;
        const container: HTMLElement = this.containerRef.nativeElement;

        // 5 + 10 * 2 * 3 + 7 + 1 = 73
        // const result = chain(add(chain(multiply(10), multiply(2))(3)), add(7), add(1))(5);
        // console.log(result === 73, result);
    }

    clickNumber(num: number) {
        if (this.state.newlyClickedOperator) {
            this.state.value = 0;
            this.state.newlyClickedOperator = false;
        }
        const newValue = this.state.value * 10 + num;
        this.state.value = newValue;
    }

    clickOperator(operator: Operator) {
        switch (operator) {
            case Operator.add:
                this.updateStateOperations(this.state);
                this.state.operator = operator;
                this.state.newlyClickedOperator = true;
                break;
            case Operator.minus:
                this.updateStateOperations(this.state);
                this.state.operator = operator;
                this.state.newlyClickedOperator = true;
                break;
            case Operator.multiply:
                this.updateStateOperations(this.state);
                this.state.operator = operator;
                this.state.newlyClickedOperator = true;
                break;
            case Operator.divide:
                this.updateStateOperations(this.state);
                this.state.operator = operator;
                this.state.newlyClickedOperator = true;
                break;
            case Operator.equal:
                this.updateStateOperations(this.state);
                this.state.operator = operator;
                this.state.newlyClickedOperator = true;
                this.state.value = this.evaluateOperations(this.state.operations);
                break;
            case Operator.allClear:
                this.state.operations = [];
                this.state.newlyClickedOperator = false;
                this.state.value = 0;
                this.state.operator = Operator.none;
                break;
        }
        console.log('state', this.state);
    }

    updateStateOperations(state: State) {
        let newOperation: Operation = null;
        if (state.operator === Operator.none
            || state.operator === Operator.allClear
            || state.operator === Operator.clear) {
            const func = state.value >= 0 ? add : minus;
            newOperation = {
                value: state.value,
                func: func,
                operations: [],
            };
            state.operations.push(newOperation);
        }

        if (state.operator === Operator.add
            || state.operator === Operator.minus) {
            const func = this.getFuncForOperator(state.operator);
            newOperation = {
                value: state.value,
                func: func,
                operations: [],
            };
            state.operations.push(newOperation);
        }

        if (state.operator === Operator.multiply
            || state.operator === Operator.divide) {
            const func = this.getFuncForOperator(state.operator);
            newOperation = {
                value: state.value,
                func: func,
                operations: [],
            };
            const lastOperation = state.operations[state.operations.length - 1];
            lastOperation.operations.push(newOperation);
        }
    }

    evaluateOperations(operations: Operation[]) {
        const arr = [];
        operations.forEach(oper => {
            const operFuncs = oper.operations.map(x => x.func(x.value));
            if (operFuncs && operFuncs.length > 0) {
                arr.push(oper.func(chain(...operFuncs)(oper.value)));
            } else {
                arr.push(oper.func(oper.value));
            }
        });
        const result = chain(...arr)(0);
        console.log('result of evaluation', result);
        return result;
    }

    getFuncForOperator(operator: Operator) {
        switch (operator) {
            case Operator.add:
                return add;
            case Operator.minus:
                return minus;
            case Operator.multiply:
                return multiply;
            case Operator.divide:
                return divide;
        }
    }

    isActiveOperator(operator: Operator) {
        return this.state.operator === operator && this.state.newlyClickedOperator;
    }

}

function add(a: number): (b: number) => number {
    return (b) => a + b;
}

function minus(a: number): (b: number) => number {
    return (b) => b - a;
}

function multiply(a: number): (b: number) => number {
    return (b) => a * b;
}

function divide(a: number): (b: number) => number {
    return (b) => a / b;
}

function chain(...fns: ((a: number) => number)[]): (b: number) => number {
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
    value: 0,
    operator: Operator.none,
    newlyClickedOperator: false,
    operations: [],
};

export interface State {
    value: number;
    operator: Operator;
    newlyClickedOperator: boolean;
    operations: Operation[];
}

interface Operation {
    value: number;
    func: ((a: number) => (b: number) => number);
    operations: Operation[];
}
