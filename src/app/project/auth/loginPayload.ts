export class LoginPayload {
  email: string;
  password: string;
  constructor() {
    this.email = localStorage.getItem("user");
  }
}
