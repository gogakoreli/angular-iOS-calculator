import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'ios-calculator',
    templateUrl: './ios-calculator.component.html',
    styleUrls: ['./ios-calculator.component.scss']
})
export class IosCalculatorComponent implements OnInit {

    currentValue: number;
    operator: CalculatorOperator;

    constructor() { }

    ngOnInit() {

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
}
