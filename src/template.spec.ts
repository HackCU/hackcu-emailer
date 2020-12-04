import { generateTemplate } from './template';

describe('generateTemplate', () => {
  it('creates an email template string', () => {
    const htmlString = generateTemplate({
      company: 'COMPANY',
      role: 'ROLE',
      name: 'MY NAME',
      emailTo: 'EMAIL@TO.COM',
    });

    expect(htmlString).toMatchInlineSnapshot(
      `"<div><p>Hello COMPANY,</p><p>My name is MY NAME and I&#x27;m currently a student studying at the University of Colorado, Boulder. I&#x27;m also an organizer of HackCU, a student run organization that is committed to bringing high quality, inclusive technology and design events including some of Colorado&#x27;s largest student hackathons. We would love to have COMPANY be a sponsor this year!</p><p>In March, we will be hosting HackCU 007, our main hackathon! HackCU 007 is our first virtual hackathon for 2021 where most passionate student developers will come together to build things such as mobile apps, websites, hardware devices, and other cool stuff to show off their talent and skills!</p><p>You can find more information about HackCU here: <a href=\\"https://hackcu.org/\\">https://hackcu.org/</a></p><p>Over the past few years, we have brought together some of the most gifted and innovative minds in an inspiring and fun setting and are excited to continue to bring sponsorship packages for our event. Feel free to reach out to us if you have any questions. We look forward to hearing back from you!</p><p>Best, <br/>MY NAME<br/>ROLE<br/>EMAIL@TO.COM</p></div>"`,
    );
  });
});
