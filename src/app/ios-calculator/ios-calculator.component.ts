import {
    AfterViewChecked,
    Component,
    DoCheck,
    ElementRef,
    HostListener,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
    ViewChild
    } from '@angular/core';
import { build$ } from 'protractor/built/element';

@Component({
    selector: 'ios-calculator',
    templateUrl: './ios-calculator.component.html',
    styleUrls: ['./ios-calculator.component.scss']
})
export class IosCalculatorComponent implements OnInit {

    REAL_WIDTH = 750;
    REAL_HEIGHT = 1334;

    @ViewChild('container') containerRef: ElementRef;
    calculator: HTMLElement;
    container: HTMLElement;

    @Input() width = 375;
    @Input() height = 667;

    state: State = INITIAL_STATE;

    constructor(
        private calculatorRef: ElementRef,
    ) { }

    ngOnInit() {
        this.calculator = this.calculatorRef.nativeElement;
        this.container = this.containerRef.nativeElement;

        this.onResize();

        // window.addEventListener('resize', this.onResize);

        // 5 + 10 / 2 * 2 * 3 + 7 - 1 = 41
        // const result = chain(add(chain(multiply(10), divide(2), multiply(2))(3)), add(7), minus(1))(5);
        // console.log(result === 41, result);
    }

    onResize() {
        if (this.calculator && this.container) {
            // const width = this.calculator.clientWidth;
            // const height = this.calculator.clientHeight;
            const scale = Math.min(this.width / this.REAL_WIDTH, this.height / this.REAL_HEIGHT);

            this.container.style.zoom = scale.toString();
        }
    }

    clickNumber(num: number) {
        if (this.state.newlyClickedOperator) {
            this.state.value = 0;
            this.state.newlyClickedOperator = false;
        }
        const newValue = this.state.value * 10 + num;
        this.state.value = newValue;
        this.state.newlyClickedNumber = true;
    }

    clickOperator(operator: Operator) {
        this.state.newlyClickedNumber = false;
        this.state.newlyClickedOperator = true;
        switch (operator) {
            case Operator.add:
                this.displayLastPossibleValue();
                this.updateStateOperations(this.state);
                this.state.operator = operator;
                break;
            case Operator.minus:
                this.displayLastPossibleValue();
                this.updateStateOperations(this.state);
                this.state.operator = operator;
                break;
            case Operator.multiply:
                this.displayLastPossibleValue(true);
                this.updateStateOperations(this.state);
                this.state.operator = operator;
                break;
            case Operator.divide:
                this.displayLastPossibleValue(true);
                this.updateStateOperations(this.state);
                this.state.operator = operator;
                break;
            case Operator.equal:
                this.updateStateOperations(this.state);
                this.state.operator = operator;
                this.state.value = this.evaluateOperations(this.state.operations);
                this.state.displayValue = null;
                this.state.operations = [];
                break;
            case Operator.allClear:
                this.resetState();
                break;
        }
        console.log(this.state.operations);
    }

    updateStateOperations(state: State) {
        let newOperation: Operation = null;
        if (state.operator === Operator.none
            || state.operator === Operator.equal
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

    resetState() {
        this.state.operations = [];
        this.state.newlyClickedOperator = false;
        this.state.newlyClickedNumber = true;
        this.state.value = 0;
        this.state.displayValue = null;
        this.state.operator = Operator.none;
    }

    evaluateOperations(operations: Operation[], onlyChildren = false) {
        const arr = [];
        let result = 0;
        operations.forEach(oper => {
            const operFuncs = oper.operations.map(x => x.func(x.value));
            if ((operFuncs && operFuncs.length > 0) || onlyChildren) {
                arr.push(oper.func(chain(...operFuncs)(oper.value)));
            } else {
                arr.push(oper.func(oper.value));
            }
        });
        if (arr && arr.length > 0) {
            const items = (onlyChildren && [arr[arr.length - 1]]) || arr;
            result = chain(...items)(0);
        }
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

    getDisplayValue() {
        let result = 0;
        if (this.state.newlyClickedNumber) {
            result = this.state.value;
        } else {
            result = this.state.displayValue || this.state.value;
        }
        return result;
    }

    displayLastPossibleValue(onlyChildren = false) {
        if (this.state.operations) {
            const latestValue = this.evaluateOperations(this.state.operations, onlyChildren);
            this.state.displayValue = latestValue;
        }
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
    return (b) => b / a;
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
    displayValue: null,
    operator: Operator.none,
    newlyClickedOperator: false,
    newlyClickedNumber: false,
    operations: [],
};

export interface State {
    value: number;
    displayValue: number;
    operator: Operator;
    newlyClickedOperator: boolean;
    newlyClickedNumber: boolean;
    operations: Operation[];
}

interface Operation {
    value: number;
    func: ((a: number) => (b: number) => number);
    operations: Operation[];
}
