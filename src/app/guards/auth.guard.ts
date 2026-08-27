import{inject}from'@angular/core';import{CanActivateFn,Router}from'@angular/router';import{AuthService}from'../services/auth.service';

export const authGuard:CanActivateFn=async(_,state)=>{
  const auth=inject(AuthService);if(!auth.enabled)return true;await auth.whenReady();
  return auth.user()&&auth.profile()?.active?true:inject(Router).createUrlTree(['/login'],{queryParams:{returnUrl:state.url}});
};
