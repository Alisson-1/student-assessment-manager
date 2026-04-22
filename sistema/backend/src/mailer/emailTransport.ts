export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
}

export interface EmailTransport {
  deliver(message: EmailMessage): Promise<void>;
}

class ConsoleEmailTransport implements EmailTransport {
  async deliver(message: EmailMessage): Promise<void> {
    if (process.env.TALP2_EMAIL_TRANSPORT === 'silent') return;
    console.log(`[mailer] to=${message.to} subject="${message.subject}"`);
  }
}

let current: EmailTransport = new ConsoleEmailTransport();

export function getEmailTransport(): EmailTransport {
  return current;
}

export function setEmailTransport(transport: EmailTransport): void {
  current = transport;
}
