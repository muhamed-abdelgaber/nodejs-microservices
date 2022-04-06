import { Command } from '@krater/building-blocks';

export interface CreateCustomerCommandPayload {
  firstName: string;
  lastName: string;
  email: string;
}

export class CreateCustomerCommand implements Command<CreateCustomerCommandPayload> {
  constructor(public readonly payload: CreateCustomerCommandPayload) {}
}
