import type { NewUserInput, RegisteredUser } from '../../domain/models/RegisteredUser';
import type { SessionPort } from '../../domain/ports/SessionPort';
import type { UserRegistrationPort } from '../../domain/ports/UserRegistrationPort';

export class RegisterUserUseCase {
  private registrationPort: UserRegistrationPort;
  private sessionPort: SessionPort;

  constructor(registrationPort: UserRegistrationPort, sessionPort: SessionPort) {
    this.registrationPort = registrationPort;
    this.sessionPort = sessionPort;
  }

  async execute(input: NewUserInput): Promise<RegisteredUser> {
    const user = await this.registrationPort.registerUser(input);
    this.sessionPort.saveUser(user);
    return user;
  }
}

export class SelectUserUseCase {
  private sessionPort: SessionPort;

  constructor(sessionPort: SessionPort) {
    this.sessionPort = sessionPort;
  }

  execute(personaId: number): RegisteredUser | null {
    return this.sessionPort.setActiveUser(personaId);
  }
}

export class GetRegisteredUsersUseCase {
  private sessionPort: SessionPort;

  constructor(sessionPort: SessionPort) {
    this.sessionPort = sessionPort;
  }

  execute(): RegisteredUser[] {
    return this.sessionPort.getUsers();
  }
}

export class GetActiveUserUseCase {
  private sessionPort: SessionPort;

  constructor(sessionPort: SessionPort) {
    this.sessionPort = sessionPort;
  }

  execute(): RegisteredUser | null {
    return this.sessionPort.getActiveUser();
  }
}
