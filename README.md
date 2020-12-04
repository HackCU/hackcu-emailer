<br>
<p align="center">
  <img alt="HackCU IV" src="https://raw.githubusercontent.com/HackCU/HackCU/master/assets/images/hackcu2020logo.png" width="200"/>
</p>
<br>

# hackcu-emailer

A cli for sending emails to sponsors

## CLI Usage

Make sure you have npm or yarn installed.

Then run `npm install -g hackcu-emailer` to install the package globally.

Then generate the template csv file: `hackcu-emailer generate` This will create `generated.csv`
(ignore the last column).

Then plug in the data there.

Note: `hackcu-emailer test sends a test email`

To send **mass** use `hackcu-emailer email`.

**Note:** the full usage would be
`hackcu-emailer email --file generated.csv --apiKey SENDGRID_API_KEY --name Kyle --role "Tech Director" --email kyle@hackcu.org --send -v`

Note without `--send` or `-s` the cli will **not** send the emails.

## Run project

Needs: `node.js` and `yarn`

## Local

1. `git clone https://github.com/HackCU/hackcu-emailer.git && cd hackcu-emailer`
2. `yarn`
3. `yarn start -h`

## Deploy

1. Push changes to master
2. There's no `2`

Deployment is done automatically by GitHub Actions. Pushes to master will trigger publishes to npm.

**Note:** you need to use conventional commits style. Take a look at
[commitizen](https://github.com/commitizen/cz-cli). This is needed for semantic-release to
understand what's changed.

## Want to contribute?

Please read our [Code of Conduct](.github/CODE_OF_CONDUCT.md), then follow these
[guidelines](.github/CONTRIBUTING.md)

# License

MIT © HackCU
