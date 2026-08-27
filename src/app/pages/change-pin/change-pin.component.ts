import{Component}from'@angular/core';
import{FormsModule}from'@angular/forms';
import{MatButtonModule}from'@angular/material/button';
import{MatFormFieldModule}from'@angular/material/form-field';
import{MatInputModule}from'@angular/material/input';
import{AuthService}from'../../services/auth.service';

@Component({standalone:true,imports:[FormsModule,MatButtonModule,MatFormFieldModule,MatInputModule],templateUrl:'./change-pin.component.html',styleUrl:'./change-pin.component.scss'})
export class ChangePinComponent{
  currentPin='';newPin='';confirmPin='';saving=false;message='';success=false;
  constructor(public auth:AuthService){}
  digits(field:'currentPin'|'newPin'|'confirmPin',value:string):void{this[field]=value.replace(/\D/g,'').slice(0,6)}
  async save():Promise<void>{this.message='';this.success=false;if(this.newPin!==this.confirmPin){this.message='The new PINs do not match.';return}this.saving=true;try{await this.auth.changeOwnPin(this.currentPin,this.newPin);this.currentPin='';this.newPin='';this.confirmPin='';this.success=true;this.message='Your PIN was changed successfully.'}catch(error){this.message=error instanceof Error?error.message:'Unable to change your PIN.'}finally{this.saving=false}}
}
