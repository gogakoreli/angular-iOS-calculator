import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'ios-calculator',
    templateUrl: './ios-calculator.component.html',
    styleUrls: ['./ios-calculator.component.scss']
})
export class IosCalculatorComponent implements OnInit {

    currentValue: number;
    displayedValue: number;
    operator: CalculatorOperator;

    constructor() { }

    ngOnInit() {

    }

    clickNumber(num: number) {

    }

    clickOperator(operator: CalculatorOperator) {

    }

}

export enum CalculatorOperator {
    divide,
    multiply,
    minus,
    add,
    equal,
    percent,
    plusMinus,
    clear,
    allClear,
}
