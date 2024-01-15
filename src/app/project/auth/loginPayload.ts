export class LoginPayload {
  email: string;
  password: string;
  constructor() {
    this.email = '';
    this.password = `${new Date().getTime()}`;
  }
}
