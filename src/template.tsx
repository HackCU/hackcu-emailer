import React from 'react';
import ReactDOMServer from 'react-dom/server';

export function generateTemplate({
  company,
  name,
  role,
  emailTo,
}: // filePath,
{
  company: string;
  name: string;
  role: string;
  emailTo: string;
  // filePath: string;
}): string {
  const template = (
    <div>
      <p>Hello {company},</p>
      <p>
        My name is {name} and I'm currently a student studying at the University of Colorado,
        Boulder. I'm also an organizer of HackCU, a student run organization that is committed to
        bringing high quality, inclusive technology and design events including some of Colorado's
        largest student hackathons. We would love to have {company} be a sponsor this year!
      </p>
      <p>
        In March, we will be hosting HackCU 007, our main hackathon! HackCU 007 is our first virtual
        hackathon for 2021 where most passionate student developers will come together to build
        things such as mobile apps, websites, hardware devices, and other cool stuff to show off
        their talent and skills!
      </p>
      <p>
        You can find more information about HackCU here:{' '}
        <a href="https://hackcu.org/">https://hackcu.org/</a>
      </p>
      <p>
        Over the past few years, we have brought together some of the most gifted and innovative
        minds in an inspiring and fun setting and are excited to continue to bring sponsorship
        packages for our event. Feel free to reach out to us if you have any questions. We look
        forward to hearing back from you!
      </p>
      <p>
        Best, <br />
        {name}
        <br />
        {role}
        <br />
        {emailTo}
        <br />
      </p>
    </div>
  );

  // Converts JSX html to html string
  return ReactDOMServer.renderToStaticMarkup(template);
}
