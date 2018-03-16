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
                break;
            case Operator.minus:
                break;
            case Operator.multiply:
                break;
            case Operator.equal:
                break;
            case Operator.allClear:
                this.state = INITIAL_STATE;
                break;
        }
        console.log('state', this.state);
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
}
