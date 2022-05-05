import { AccountEmailCheckerService } from '@core/account-email/account-email-checker.service';
import { PasswordHashProviderService } from '@core/account-password/password-hash-provider.service';
import { AccountRegistration } from '@core/account-registration/account-registration.aggregate-root';
import { AccountRegistrationRepository } from '@core/account-registration/account-registration.repository';
import { EmailVerificationCodeProviderService } from '@core/email-verification-code/email-verification-code-provider.service';
import { CommandHandler, MessageBus, ServiceClient } from '@krater/building-blocks';
import { FORMAT_HTTP_HEADERS, SpanContext, Tracer } from 'opentracing';
import { RegisterNewAccountCommand } from './register-new-account.command';

interface Dependencies {
  accountEmailCheckerService: AccountEmailCheckerService;
  passwordHashProviderService: PasswordHashProviderService;
  messageBus: MessageBus;
  tracer: Tracer;
  accountRegistrationRepository: AccountRegistrationRepository;
  emailVerificationCodeProviderService: EmailVerificationCodeProviderService;
  serviceClient: ServiceClient;
}

export class RegisterNewAccountCommandHandler implements CommandHandler<RegisterNewAccountCommand> {
  constructor(private readonly dependencies: Dependencies) {}

  public async handle({
    payload: { context, ...payload },
  }: RegisterNewAccountCommand): Promise<void> {
    const {
      accountEmailCheckerService,
      passwordHashProviderService,
      messageBus,
      emailVerificationCodeProviderService,
      accountRegistrationRepository,
    } = this.dependencies;

    const span = this.dependencies.tracer.startSpan(
      '[Command] Register new account command handler',
      {
        childOf: context,
      },
    );

    span.addTags({
      'x-type': 'command',
    });

    const headers = {};

    this.dependencies.tracer.inject(span.context(), FORMAT_HTTP_HEADERS, headers);

    const accountRegistration = await AccountRegistration.registerNew(payload, {
      accountEmailCheckerService,
      passwordHashProviderService,
      emailVerificationCodeProviderService,
    });

    await accountRegistrationRepository.insert(accountRegistration);

    const eventPromises = accountRegistration.getDomainEvents().map((event) =>
      messageBus.sendEvent(event, {
        spanContext: headers as SpanContext,
      }),
    );

    await Promise.all(eventPromises);

    span.finish();
  }
}
