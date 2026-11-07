import{Component}from'@angular/core';
import{FormsModule}from'@angular/forms';
import{MatButtonModule}from'@angular/material/button';
import{MatFormFieldModule}from'@angular/material/form-field';
import{MatIconModule}from'@angular/material/icon';
import{MatInputModule}from'@angular/material/input';
import{MatSlideToggleModule}from'@angular/material/slide-toggle';
import{EmployeeAdminService,ManagedEmployee}from'../../services/employee-admin.service';

@Component({standalone:true,imports:[FormsModule,MatButtonModule,MatFormFieldModule,MatIconModule,MatInputModule,MatSlideToggleModule],templateUrl:'./manage-employees.component.html',styleUrl:'./manage-employees.component.scss'})
export class ManageEmployeesComponent{
  name='';pin='';search='';message='';workerAccess=true;controllerAccess=false;editing:ManagedEmployee|null=null;editName='';
  constructor(public employees:EmployeeAdminService){void this.load()}
  get activeCount():number{return this.employees.employees().filter(employee=>employee.active).length}
  get filtered():ManagedEmployee[]{const query=this.search.trim().toLocaleLowerCase();return this.employees.employees().filter(employee=>!query||employee.displayName.toLocaleLowerCase().includes(query))}
  pinInput(value:string):void{this.pin=value.replace(/\D/g,'').slice(0,6)}
  async add():Promise<void>{if(!this.name.trim()||this.pin.length!==6)return;try{await this.employees.add(this.name,this.pin,this.workerAccess,this.controllerAccess);this.name='';this.pin='';this.workerAccess=true;this.controllerAccess=false;this.show(this.employees.message())}catch{this.show(this.employees.message())}}
  async toggleAccess(employee:ManagedEmployee,mode:'worker'|'controller',enabled:boolean):Promise<void>{try{await this.employees.setAccess(employee,mode,enabled);this.show(this.employees.message())}catch{this.show(this.employees.message())}}
  setUpLogin(employee:ManagedEmployee):void{this.name=employee.displayName;this.pin='';window.scrollTo({top:0,behavior:'smooth'})}
  startEdit(employee:ManagedEmployee):void{this.editing=employee;this.editName=employee.displayName}
  cancelEdit():void{this.editing=null;this.editName=''}
  async saveEdit():Promise<void>{if(!this.editing||!this.editName.trim())return;try{await this.employees.rename(this.editing,this.editName);this.cancelEdit();this.show(this.employees.message())}catch{this.show(this.employees.message())}}
  async remove(employee:ManagedEmployee):Promise<void>{if(!window.confirm(`Remove ${employee.displayName} from the company list? Their login will be disabled.`))return;try{await this.employees.remove(employee);this.show(this.employees.message())}catch{this.show(this.employees.message())}}
  async reactivate(employee:ManagedEmployee):Promise<void>{try{await this.employees.reactivate(employee);this.show(this.employees.message())}catch{this.show(this.employees.message())}}
  private async load():Promise<void>{try{await this.employees.load()}catch{this.show(this.employees.message())}}
  private show(message:string):void{this.message=message;setTimeout(()=>this.message='',4000)}
}
