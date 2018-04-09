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

        // 5 + 10 / 2 * 2 * 3 + 7 - 1 = 41
        // const result = chain(add(chain(multiply(10), divide(2), multiply(2))(3)), add(7), minus(1))(5);
        // console.log(result === 41, result);
    }

    onResize() {
        if (this.calculator && this.container) {
            const scale = Math.min(this.width / this.REAL_WIDTH, this.height / this.REAL_HEIGHT);
            this.container.style.zoom = scale.toString();
        }
    }

    clickNumber(num: number) {
        if (this.state.newlyClickedOperator) {
            this.state.value = 0;
            this.state.newlyClickedOperator = false;
        }

        // 10.23 10.234
        if (this.state.hasDot) {

        } else {

        }

        const newValue = this.state.value * 10 + num;
        if (newValue < 1000000) {
            this.state.value = newValue;
            this.state.newlyClickedNumber = true;
        }
    }

    clickOperator(operator: Operator) {
        switch (operator) {
            case Operator.add:
                this.updateStateOperations(this.state);
                this.displayLastPossibleValue();
                this.state.operator = operator;
                break;
            case Operator.minus:
                this.updateStateOperations(this.state);
                this.displayLastPossibleValue();
                this.state.operator = operator;
                break;
            case Operator.multiply:
                this.updateStateOperations(this.state);
                this.displayLastPossibleValue(true);
                this.state.operator = operator;
                break;
            case Operator.divide:
                this.updateStateOperations(this.state);
                this.displayLastPossibleValue(true);
                this.state.operator = operator;
                break;
            case Operator.equal:
                this.updateStateOperations(this.state, operator);
                this.state.operator = operator;
                this.state.value = this.evaluateOperations(this.state.operations);
                this.state.displayValue = null;
                this.state.operations = [];
                break;
            case Operator.plusMinus:
                this.state.value = -1 * this.state.value;
                this.state.newlyClickedNumber = true;
                this.state.newlyClickedOperator = false;
                break;
            case Operator.percent:
                this.state.value = this.state.value * 1 / 100;
                this.state.newlyClickedNumber = true;
                this.state.newlyClickedOperator = false;
                break;
            case Operator.allClear:
                this.resetState();
                break;
            case Operator.clear:
                this.state.value = 0;
                break;
            case Operator.dot:
                this.state.hasDot = true;
                break;
        }
        console.log(this.state);
    }

    updateStateOperations(state: State, operator?: Operator) {
        if (this.onlyChangingOperator(state) && operator !== Operator.equal) {
            return;
        }

        this.state.newlyClickedNumber = false;
        this.state.newlyClickedOperator = true;

        let newOperation: Operation = null;
        if (state.operator === Operator.none
            || state.operator === Operator.equal
            || state.operator === Operator.allClear
            || state.operator === Operator.clear) {
            newOperation = {
                value: state.value,
                func: add,
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

    isMathematicOperator(operator: Operator) {
        return operator === Operator.add ||
            operator === Operator.minus ||
            operator === Operator.multiply ||
            operator === Operator.divide;
    }

    onlyChangingOperator(state: State) {
        if (this.isMathematicOperator(state.operator) &&
            state.newlyClickedNumber === false) {
            return true;
        }
        return false;
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
        result = <any>this.insertComma(result);
        return result;
    }

    displayLastPossibleValue(onlyChildren = false) {
        if (this.state.operations) {
            const latestValue = this.evaluateOperations(this.state.operations, onlyChildren);
            this.state.value = latestValue;
        }
    }

    insertComma(num: number) {
        num = this.roundUpTo(num, 4);
        let result = num + '';

        if (num >= 1000 && num <= 1000000) {
            // 120305.12 120,305.12
            // 13.3333333 13.334
            const tmp = num.toString();

            const dotIndex = tmp.indexOf('.');
            let beforeDot = (dotIndex >= 0 && tmp.substr(0, dotIndex)) || tmp;
            const afterDot = (dotIndex >= 0 && tmp.substr(dotIndex)) || '';

            beforeDot = this.insertCommaFromRight(beforeDot);

            result = `${beforeDot}${afterDot}`;
        }
        return result;
    }

    insertCommaFromRight(str: string) {
        const left = str.substr(0, str.length - 3);
        const right = str.substr(str.length - 3);
        return `${left},${right}`;
    }

    roundUpTo(num: number, upTo: number) {
        const floored = Math.floor(num);
        const pow = Math.pow(10, upTo);
        let afterDot = num - floored;
        afterDot = afterDot * pow;
        afterDot = Math.round(afterDot);
        afterDot = afterDot / pow;
        return floored + afterDot;
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
    hasDot: false,
};

export interface State {
    value: number;
    displayValue: number;
    operator: Operator;
    newlyClickedOperator: boolean;
    newlyClickedNumber: boolean;
    operations: Operation[];
    hasDot: boolean;
}

interface Operation {
    value: number;
    func: ((a: number) => (b: number) => number);
    operations: Operation[];
}
