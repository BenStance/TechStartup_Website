export class CreateUserDto {
  email: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
  phone?: string;
}