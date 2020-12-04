jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));
import sendGrid from '@sendgrid/mail';
import { sendMassEmail } from './email';

const info = {
  name: 'Kyle',
  role: 'Tech Director',
  emailTo: 'contact@hackcu.org',
};
const apiKey = 'api-key';
const companies = [
  {
    name: 'Company A',
    email: 'companyA@gmail.com',
  },
  {
    name: 'Company B',
    email: 'companyB@gmail.com',
  },
  {
    name: 'Company C',
    email: 'companyC@gmail.com',
  },
];

describe('sendMassEmail', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  it('sends emails to all companies', async () => {
    expect.assertions(3);

    (sendGrid.send as jest.Mock).mockResolvedValue(undefined);

    await sendMassEmail(info, companies, {
      apiKey,
      verbose: false,
      send: true,
    });

    expect(sendGrid.setApiKey).toHaveBeenCalledWith(apiKey);
    expect(sendGrid.send).toHaveBeenCalledTimes(companies.length);
    expect((sendGrid.send as jest.Mock).mock.calls).toMatchSnapshot();
  });

  it('returns successful emails and failed emails for companies', async () => {
    expect.assertions(2);

    // Ignore console.error values
    jest.spyOn(console, 'error').mockReturnValue(undefined);

    // Works for first
    (sendGrid.send as jest.Mock).mockResolvedValueOnce(undefined);
    // Fails for second
    (sendGrid.send as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));
    // Works for third
    (sendGrid.send as jest.Mock).mockResolvedValueOnce(undefined);

    const { worked, failed } = await sendMassEmail(info, companies, {
      apiKey,
      verbose: false,
      send: true,
    });

    expect(worked).toEqual([companies[0], companies[2]]);
    expect(failed).toEqual([companies[1]]);
  });
});
