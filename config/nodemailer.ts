import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { ConfigService } from '@nestjs/config';

// let mailConfig;
// if (process.env.NODE_ENV === 'production') {
//   // all emails are delivered to destination
//   mailConfig = {
//     host: 'smtp.sendgrid.net',
//     port: 587,
//     auth: {
//       user: 'real.user',
//       pass: 'verysecret'
//     }
//   };
// } else {
//   // all emails are catched by ethereal.email
//   mailConfig = {
//     host: 'smtp.ethereal.email',
//     port: 587,
//     auth: {
//       user: 'donato31@ethereal.email',
//       pass: 'kHCxnW46qzWC8heJz3'
//     }
//   };
// }

const mailConfig = (config: ConfigService) => ({
  host: 'smtp.sendgrid.net',
  port: 465,
  secure: true,
  auth: {
    user: 'apikey',
    pass: config.get<string>('sendgridKey'),
  }
});

const nodemailerConfig = (configService: ConfigService) => ({
  transport: mailConfig(configService),
  defaults: {
    from: '"nest-modules" <modules@nestjs.com>',
  },
  template: {
    dir: __dirname + '/../templates',
    adapter: new PugAdapter(),
    options: {
      strict: true,
    },
  },
});

export default nodemailerConfig;