#!/bin/env node
import yargs from 'yargs';
import path from 'path';
import neatCsv from 'neat-csv';
import fs from 'fs/promises';
import emailValidator from 'email-validator';
import camelcase from 'camelcase';
import ora from 'ora';
import { table } from 'table';
import inquirer from 'inquirer';
import sendGrid from '@sendgrid/mail';
import { generateTemplate } from './template';
import * as csvWritier from 'csv-writer';
import { sendMassEmail } from './email';

type SponsorRow = {
  contactEmail: string;
  company: string;
};

const filterRow = (row: SponsorRow) => emailValidator.validate(row.contactEmail) && !!row.company;

yargs
  .command<{ file: string }>(
    'generate',
    'Creates a template csv file for loading data from.',
    (yargs) => {
      yargs.option('f', {
        alias: 'file',
        describe: 'The csv file name (without .csv extension).',
        type: 'string',
        default: 'generated',
      });
    },
    async ({ file }) => {
      const writer = csvWritier.createArrayCsvWriter({
        path: path.join(process.cwd(), `${file}.csv`),
        header: ['Company', 'Contact Email', 'Send Email?'],
      });
      await writer.writeRecords([]);
    },
  )
  .command<{
    file: string;
    send: boolean;
    verbose: boolean;
    apiKey: string;

    name: string;
    role: string;
    email: string;
  }>(
    'email',
    'Load sponsorship data from file and send emails using a template to them.',
    (yargs) => {
      yargs.option('f', {
        alias: 'file',
        demandOption: true,
        describe: 'The sponsorship csv file to load in.',
        type: 'string',
      });
      yargs.option('k', {
        alias: 'apiKey',
        demandOption: true,
        describe: 'The SendGrid api key.',
        type: 'string',
      });
      yargs.option('s', {
        alias: 'send',
        demandOption: false,
        default: false,
        describe: 'Actually and send emails.',
        type: 'boolean',
      });
      yargs.option('v', {
        alias: 'verbose',
        describe: 'Log all possible details.',
        type: 'boolean',
        default: false,
      });

      yargs.option('n', {
        alias: 'name',
        describe: 'Your first name.',
        type: 'string',
        demandOption: true,
      });
      yargs.option('r', {
        alias: 'role',
        describe: 'Your role.',
        type: 'string',
        demandOption: true,
      });
      yargs.option('e', {
        alias: 'email',
        describe: 'Your contact email (person@hackcu.org).',
        type: 'string',
        demandOption: true,
      });
    },
    async ({ file, apiKey, send, verbose, name, role, email }) => {
      const filePath = path.join(process.cwd(), file);
      const sponsorData = (
        await neatCsv<SponsorRow>(await fs.readFile(filePath), {
          mapHeaders: ({ header }) => camelcase(header.trim()),
          mapValues: ({ value }) => (value as string).trim(),
        })
      ).filter((row) => Object.values([row.company, row.contactEmail]).some((value) => !!value)); // Filter out completely empty rows

      if (sponsorData.length === 0) {
        console.log('No Data');
        return;
      } else if (!('company' in sponsorData[0]) || !('contactEmail' in sponsorData[0])) {
        console.log('Invalid CSV format.');
        return;
      }

      const spinner = ora();

      const validData = sponsorData.filter(filterRow);

      if (sponsorData.length !== validData.length) {
        const { option } = await inquirer.prompt<{
          option: 'yes' | 'no' | 'see-invalid';
        }>([
          {
            type: 'list',
            name: 'option',
            default: 1,
            message: `The numbers of valid (valid email address and has a company name) rows differs from the actual rows. invalid row count: ${
              sponsorData.length - validData.length
            }, actual row count: ${sponsorData.length}. Continue?`,
            choices: [
              { name: 'Yes', value: 'yes' },
              { name: 'No', value: 'no' },
              { name: 'See Invalid Rows', value: 'see-invalid' },
            ],
          },
        ]);
        switch (option) {
          case 'no':
            spinner.succeed('Not sending emails');
            return;
          case 'see-invalid': {
            console.log(
              `Removed ${sponsorData.length - validData.length} rows (${validData.length}/${
                sponsorData.length
              }).`,
            );
            console.log(
              table([
                ['Company', 'Company Email'],
                ...sponsorData
                  .filter((row) => !filterRow(row)) // Get invalid rows
                  .map((data) => [
                    `"${data.company ?? ''}"`,
                    `"${data.contactEmail ?? 'INVALID EMAIL FORMAT'}"`,
                  ]),
              ]),
            );
            return;
          }
        }
      }

      const info = {
        name,
        role,
        emailTo: email,
      };

      const { worked, failed } = await sendMassEmail(
        info,
        validData.map((data) => ({ name: data.company, email: data.contactEmail })),
        { apiKey, verbose, send },
        spinner,
      );

      // Save working sent emails to file
      // Save failed emails to file
      const goodWriter = csvWritier.createArrayCsvWriter({
        path: path.join(process.cwd(), 'worked.csv'),
        header: ['Company', 'Contact Email'],
      });
      await goodWriter.writeRecords(worked.map(({ name, email }) => [name, email]));

      // Save failed emails to file
      const failedWriter = csvWritier.createArrayCsvWriter({
        path: path.join(process.cwd(), 'failed.csv'),
        header: ['Company', 'Contact Email'],
      });
      await failedWriter.writeRecords(failed.map(({ name, email }) => [name, email]));

      spinner.stopAndPersist();
    },
  )
  .command<{
    apiKey: string;
    send: boolean;

    emailTo: string;

    name: string;
    role: string;
    email: string;
  }>(
    'test',
    'test send email',
    (yargs) => {
      yargs.option('k', {
        alias: 'apiKey',
        demandOption: true,
        describe: 'The sendgrid api key',
        type: 'string',
      });
      yargs.option('s', {
        alias: 'send',
        demandOption: false,
        default: false,
        describe: 'Actually run and send emails',
        type: 'boolean',
      });

      // For testing
      yargs.option('t', {
        alias: 'emailTo',
        describe: 'Where the test email is sent to.',
        type: 'string',
        demandOption: true,
      });

      // Regular Arguments
      yargs.option('n', {
        alias: 'name',
        describe: 'Your first name.',
        type: 'string',
        demandOption: true,
      });
      yargs.option('r', {
        alias: 'role',
        describe: 'Your role.',
        type: 'string',
        demandOption: true,
      });
      yargs.option('e', {
        alias: 'email',
        describe: 'Your contact email (person@hackcu.org).',
        type: 'string',
        demandOption: true,
      });
    },
    async ({ apiKey, send, emailTo, name, role, email }) => {
      const body = generateTemplate({
        company: 'COMPANY',
        role: role,
        emailTo: email,
        name: name,
      });

      console.log(
        `Sending email to "${emailTo}" from "${'contact@hackcu.org'}" with subject "${'Sponsoring HackCU'} and body:\n\n${body}"`,
      );

      if (send) {
        sendGrid.setApiKey(apiKey);
        await sendGrid.send({
          to: emailTo,
          from: {
            email: 'contact@hackcu.org',
            name: 'HackCU',
          },
          subject: 'Sponsoring HackCU',
          html: body,
        });
      }

      return;
    },
  )
  .alias('v', 'version')
  .alias('h', 'help')
  .scriptName('hackcu-emailer')
  .version()
  .help().argv;
