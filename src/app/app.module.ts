import { AppComponent } from './app.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IosCalculatorComponent } from './ios-calculator/ios-calculator.component';

@NgModule({
    declarations: [
        AppComponent,
        IosCalculatorComponent
    ],
    imports: [
        BrowserModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
