import type { NewUserInput, RegisteredUser } from '../models/RegisteredUser';

export interface UserRegistrationPort {
  registerUser(input: NewUserInput): Promise<RegisteredUser>;
}
