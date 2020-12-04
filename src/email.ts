import { Ora } from 'ora';
import sendGrid from '@sendgrid/mail';
import { generateTemplate } from './template';

interface Company {
  name: string;
  email: string;
}

export async function sendMassEmail(
  info: { name: string; role: string; emailTo: string },
  companies: Company[],
  {
    apiKey,
    verbose,
    send,
  }: {
    apiKey: string;
    verbose: boolean;
    send: boolean;
  },
  spinner?: Ora,
): Promise<{ worked: Company[]; failed: Company[] }> {
  const worked: Company[] = [];
  const failed: Company[] = [];

  if (send) {
    sendGrid.setApiKey(apiKey);
  }

  for (const company of companies) {
    spinner?.start(`Sending email to "${company.name}" with email "${company.email}".`);

    if (send) {
      try {
        await sendGrid.send({
          to: company.email,
          from: {
            name: 'HackCU',
            email: 'contact@hackcu.org',
          },
          subject: 'Sponsoring HackCU',
          html: generateTemplate({
            company: company.name,
            name: info.name,
            role: info.role,
            emailTo: info.emailTo,
          }),
        });
        spinner?.succeed(`Sent email to "${company.name}" with email "${company.email}"`);
        worked.push(company);
      } catch (error) {
        console.error(error);
        spinner?.fail(`Failed to send email to "${company.name}" with email "${company.email}"`);
        failed.push(company);
      }
    } else {
      spinner?.succeed(`Sent email to "${company.name}" with email "${company.email}"`);
    }
  }

  return { worked, failed };
}
