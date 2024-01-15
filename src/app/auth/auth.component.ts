import { Component, OnInit } from '@angular/core';
import { ProjectService } from '@trungk18/project/state/project/project.service';
import { AuthService } from '@trungk18/auth/auth.service';
import { Router} from '@angular/router';
@Component({
  selector: 'auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  selectedForm: 'login' | 'signup' = 'login';
  isError: boolean = false;
  isValidMail: boolean = false;
  isValidPass: boolean = false;
  constructor(private _projectService: ProjectService,
              private authService: AuthService,
              private router: Router) {
    this._projectService.setLoading(false);
  }

  ngOnInit(): void {
    /*const isUser = localStorage.getItem("user");
    if(isUser !== null || isUser !== ""){
      this.router.navigate(['/']);
    }*/
  }

  toggleForm(form: 'login' | 'signup') {
    this.selectedForm = form;
  }


  checkPass(){
    const email = (document.querySelector('.signup input[name="email"]') as HTMLInputElement).value;
    const pass = (document.querySelector('.signup input[name="pass"]') as HTMLInputElement).value;
    const confirm = (document.querySelector('.signup input[name="confirm"]') as HTMLInputElement).value;
    this.isValidPass =  pass === confirm;
    this.isValidMail = email !== "";
  }

  signIn() {
    const email = (document.querySelector('.login input[name="email1"]') as HTMLInputElement).value;
    const pass = (document.querySelector('.login input[name="pass1"]') as HTMLInputElement).value;

    this.authService.signIn(email, pass).subscribe(
      (response) => {
        console.log('Sign In Response:', response);
        localStorage.setItem("user",email);
        this.router.navigate(['/']);
      },
      (error) => {
        console.error('Sign In Error:', error);
        this.isError = true;
      }
    );
  }

  signUp() {
    const email = (document.querySelector('.signup input[name="email"]') as HTMLInputElement).value;
    const pass = (document.querySelector('.signup input[name="pass"]') as HTMLInputElement).value;

    this.authService.signUp(email, pass).subscribe(
      (response) => {
        console.log('Sign Up Response:', response);
        localStorage.setItem("user",email);
        this.router.navigate(['/']);
      },
      (error) => {
        console.error('Sign Up Error:', error);
        this.isError = true;
      }
    );
  }
}
