import { Command } from '@krater/building-blocks';
import { SpanContext } from 'opentracing';

export interface CreateCustomerCommandPayload {
  firstName: string;
  lastName: string;
  email: string;
  context: SpanContext;
}

export class CreateCustomerCommand implements Command<CreateCustomerCommandPayload> {
  public readonly service = 'customers';

  constructor(public readonly payload: CreateCustomerCommandPayload) {}
}
