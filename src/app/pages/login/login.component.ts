import{Component}from'@angular/core';
import{FormsModule}from'@angular/forms';
import{ActivatedRoute,Router}from'@angular/router';
import{MatButtonModule}from'@angular/material/button';
import{MatFormFieldModule}from'@angular/material/form-field';
import{MatInputModule}from'@angular/material/input';
import{AppMode}from'../../models';
import{AuthService}from'../../services/auth.service';
import{MockDataService}from'../../services/mock-data.service';
import{MasterDataService}from'../../services/master-data.service';
import{SearchableSelectComponent}from'../../shared/searchable-select/searchable-select.component';

@Component({standalone:true,imports:[FormsModule,MatButtonModule,MatFormFieldModule,MatInputModule,SearchableSelectComponent],templateUrl:'./login.component.html',styleUrl:'./login.component.scss'})
export class LoginComponent{
readonly headName='Fashy';selectedMode:AppMode|null=null;name='';pin='';submitting=false;
constructor(public auth:AuthService,public data:MockDataService,private master:MasterDataService,private router:Router,private route:ActivatedRoute){if(auth.user())void auth.signOut();void master.loadPublicWorkers()}
get workerNames():string[]{const allowed=new Set(this.master.workerModeNames().map(name=>name.toLocaleLowerCase()));return this.data.workers.filter(name=>name.toLocaleLowerCase()!==this.headName.toLocaleLowerCase()&&allowed.has(name.toLocaleLowerCase()))}
get controllerNames():string[]{const allowed=new Set(this.master.controllerNames().map(name=>name.toLocaleLowerCase()));return this.data.workers.filter(name=>name.toLocaleLowerCase()===this.headName.toLocaleLowerCase()||allowed.has(name.toLocaleLowerCase()))}
chooseMode(mode:AppMode):void{this.auth.error.set('');this.selectedMode=mode;this.name=mode==='head'?this.headName:'';this.pin=''}
back():void{this.auth.error.set('');this.selectedMode=null;this.name='';this.pin=''}
pinInput(value:string):void{this.pin=value.replace(/\D/g,'').slice(0,6)}
async submit():Promise<void>{if(!this.selectedMode||!this.name||!/^[0-9]{6}$/.test(this.pin)||this.submitting)return;this.submitting=true;try{await this.auth.signInWithPin(this.name,this.pin,this.selectedMode);if(this.auth.profile()?.active)await this.router.navigateByUrl(this.route.snapshot.queryParamMap.get('returnUrl')||'/dashboard')}catch{}finally{this.submitting=false}}
}
