import{Component,ElementRef,EventEmitter,forwardRef,Input,Output,ViewChild}from'@angular/core';import{FormsModule,ControlValueAccessor,NG_VALUE_ACCESSOR}from'@angular/forms';import{MatFormFieldModule}from'@angular/material/form-field';import{MatSelectModule}from'@angular/material/select';

@Component({selector:'app-searchable-select',standalone:true,imports:[FormsModule,MatFormFieldModule,MatSelectModule],providers:[{provide:NG_VALUE_ACCESSOR,useExisting:forwardRef(()=>SearchableSelectComponent),multi:true}],templateUrl:'./searchable-select.component.html',styleUrl:'./searchable-select.component.scss'})
export class SearchableSelectComponent implements ControlValueAccessor{
@ViewChild('searchInput')searchInput?:ElementRef<HTMLInputElement>;@Input()options:readonly string[]=[];@Input()placeholder='Select';@Input()label='';@Input()panelWidth:string|null=null;@Input()disabled=false;@Output()selectionChange=new EventEmitter<string>();
value='';query='';controlDisabled=false;private onChange:(value:string)=>void=()=>{};private onTouched:()=>void=()=>{};
get filteredOptions():readonly string[]{const q=this.query.trim().toLocaleLowerCase();return q?this.options.filter(option=>option.toLocaleLowerCase().includes(q)):this.options}
get isDisabled():boolean{return this.disabled||this.controlDisabled}
writeValue(value:string|null|undefined):void{this.value=value??''}
registerOnChange(fn:(value:string)=>void):void{this.onChange=fn}registerOnTouched(fn:()=>void):void{this.onTouched=fn}setDisabledState(disabled:boolean):void{this.controlDisabled=disabled}
selected(value:string):void{if(!value)return;this.value=value;this.onChange(value);this.onTouched();this.selectionChange.emit(value)}
opened(open:boolean):void{this.query='';if(open)setTimeout(()=>this.searchInput?.nativeElement.focus());else this.onTouched()}
keepOpen(event:Event):void{event.stopPropagation()}
searchKeydown(event:KeyboardEvent):void{if(event.key!=='Escape'&&event.key!=='Tab')event.stopPropagation()}
}
