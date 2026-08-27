import{Component}from'@angular/core';
import{MatButtonModule}from'@angular/material/button';
import{MatIconModule}from'@angular/material/icon';
import{FirebaseConnectionService}from'../../services/firebase-connection.service';
import{MasterDataService}from'../../services/master-data.service';import{AuthService}from'../../services/auth.service';

@Component({standalone:true,imports:[MatButtonModule,MatIconModule],templateUrl:'./backend-status.component.html',styleUrl:'./backend-status.component.scss'})
export class BackendStatusComponent{constructor(public connection:FirebaseConnectionService,public master:MasterDataService,public auth:AuthService){}}
