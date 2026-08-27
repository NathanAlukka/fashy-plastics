import{Injectable,signal}from'@angular/core';
import{getApps,initializeApp}from'firebase/app';
import{doc,getDoc,getFirestore}from'firebase/firestore';
import{firebaseConfig,firebaseConfigured}from'../../environments/environment';
import{AuthService}from'./auth.service';

export type FirebaseConnectionState='not-configured'|'idle'|'checking'|'connected'|'error';

@Injectable({providedIn:'root'})
export class FirebaseConnectionService{
  readonly state=signal<FirebaseConnectionState>(firebaseConfigured?'idle':'not-configured');
  readonly detail=signal(firebaseConfigured?'Ready to test.':'Add the Firebase web configuration to src/environments/environment.ts.');
  constructor(private auth:AuthService){}
  async check():Promise<void>{
    if(!firebaseConfigured){this.state.set('not-configured');return}
    this.state.set('checking');this.detail.set('Contacting Cloud Firestore…');
    try{
      const app=getApps()[0]??initializeApp(firebaseConfig);
      const firestore=getFirestore(app);
      const user=this.auth.user();
      if(!user){this.fail('Sign in before checking the protected Firestore connection.');return}
      const snapshot=await getDoc(doc(firestore,'users',user.uid));
      if(!snapshot.exists()){this.fail('Connected, but the signed-in user profile does not exist.');return}
      const data=snapshot.data();
      this.state.set('connected');
      this.detail.set(`Firebase connection successful. Signed in as ${String(data['displayName']??'user')}.`);
    }catch(error){
      const message=error instanceof Error?error.message:'Unknown Firebase error.';
      this.fail(message);
    }
  }

  private fail(message:string):void{this.state.set('error');this.detail.set(message)}
}
