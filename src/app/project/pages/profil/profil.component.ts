import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { JUser } from '@trungk18/interface/user';
import { AuthService } from '@trungk18/auth/auth.service';
import Swal from 'sweetalert2'; // Import SweetAlert2

@Component({
  selector: 'profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss']
})
export class ProfilComponent implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef; // ViewChild for file input

  user : JUser;
  user2 : JUser;
  pass1 : string = "";
  pass2 : string = "";
  updatable : boolean = false;
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    const userEmail = localStorage.getItem("user");
    this.authService.getUser(userEmail).subscribe(
      (a:JUser)=>{
        this.user = a ;
        this.user2 = {...a} ;
      }
    );
  }

  updateUser(){
    this.user2.password = this.pass1;
    this.authService.setUser(this.user2).subscribe(
      (a)=>{
        this.user = this.user2;
        // Show success alert using SweetAlert2
        Swal.fire({
          icon: 'success',
          title: 'Profile Modifié!',
          text: 'Votre profile est modifé avec succés',
          showConfirmButton: false,
          timer: 2000 // Auto close after 2 seconds
        });
        console.log(a);
      },(error) =>{
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.message,
        });
        console.log(error);
      }
    )
  }

  updatePicture() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      const file: File = inputElement.files[0];

      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.user2.avatarUrl = `assets/avatars/${file.name}`;

          // Call the service method to update the profile picture
          this.authService.updateProfilePicture(this.user.email, file).subscribe(
            (response) => {
              Swal.fire({
                icon: 'success',
                title: 'Profile Modifié!',
                text: 'Votre Image de profile est modifé avec succés',
                showConfirmButton: false,
                timer: 2000 // Auto close after 2 seconds
              });
              window.location.reload();
            },
            (error) => {
              Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: error.message(),
              });
              console.error(error);
            }
          );
        };
        reader.readAsDataURL(file);
      }
    }
  }

}
