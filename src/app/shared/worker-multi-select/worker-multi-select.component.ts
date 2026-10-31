import{Component,EventEmitter,Input,Output}from'@angular/core';
import{FormsModule}from'@angular/forms';
import{MatButtonModule}from'@angular/material/button';

@Component({selector:'app-worker-multi-select',standalone:true,imports:[FormsModule,MatButtonModule],templateUrl:'./worker-multi-select.component.html',styleUrl:'./worker-multi-select.component.scss'})
export class WorkerMultiSelectComponent{
@Input()options:readonly string[]=[];@Input()selected:readonly string[]=[];@Input()disabled=false;@Input()compact=false;@Input()label='Select workers';@Output()selectedChange=new EventEmitter<string[]>();@Output()addSelected=new EventEmitter<string[]>();
open=false;query='';draft=new Set<string>();
get filtered():readonly string[]{const q=this.query.trim().toLocaleLowerCase();return q?this.options.filter(value=>value.toLocaleLowerCase().includes(q)):this.options}
show():void{if(this.disabled)return;this.draft=new Set(this.selected);this.query='';this.open=true;document.body.classList.add('selection-open')}
close():void{this.open=false;document.body.classList.remove('selection-open')}
toggle(value:string):void{this.draft.has(value)?this.draft.delete(value):this.draft.add(value)}
clear():void{this.draft.clear()}
confirm():void{const values=[...this.draft];this.selectedChange.emit(values);this.addSelected.emit(values);this.close()}
}
