/**
 * @file mailer.js
 * @author zebullon
 * Utilities related to mailing
 */

const path = require('path');
const Email = require('email-templates');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const sendmailTransporter = nodemailer.createTransport(smtpTransport({
  host: 'mail.hover.com',
  name: 'www.saltymotion.com',
  secureConnection: true,
  port: 587,
  auth: {
    user: `${process.env.HOVER_USER}`,
    pass: `${process.env.HOVER_PASS}`,
  },
  authMethod: 'LOGIN',
  tls: {
    secureProtocol: 'TLSv1_method',
    rejectUnauthorized: false,
  },
}));

const emailDevConfig = {
  views: {
    root: path.normalize(path.join(__dirname, '..', 'template/email')),
    options: {
      extension: 'pug',
    },
  },
  preview: {
    open: {
      app: 'firefox',
      wait: false,
    },
  },
  send: true,
  transport: sendmailTransporter,
  juice: true,
  juiceResources: {
    preserveImportant: true,
    webResources: {
      relativeTo: path.join(__dirname, '..', 'template/assets'),
      images: true,
    },
  },
};

// eslint-disable-next-line no-unused-vars
const emailProdConfig = {
  views: {
    root: path.normalize(path.join(__dirname, '..', 'template/email')),
    options: {
      extension: 'pug',
    },
  },
  send: true,
  transport: sendmailTransporter,
  juice: true,
  juiceResources: {
    preserveImportant: true,
    webResources: {
      relativeTo: path.join(__dirname, '..', 'template/assets'),
      images: true,
    },
  },
};

/**
 * Send the account confirmation email to user
 * @param {string} address - User email address
 * @param {string} nickname - User name
 * @param {string} userID - User account ID
 * @param {string} secret - Confirmation link token
 * @return {Promise<*>}
 */
module.exports.sendSignUpConfirmationEmail = ({address, nickname, userID, secret}) => {
  const email = new Email(process.env.NODE_ENV === 'production' ? emailProdConfig : emailDevConfig);
  return email.send({
    template: 'confirmSignup',
    message: {
      from: `${process.env.HOVER_USER}`,
      to: address,
      attachments: [{
        filename: 'signature.png',
        path: path.join(__dirname, '../..', 'template/assets/images/logo_signature__dark.png'),
        cid: 'logo_confirm_email',
      }],
    },
    locals: {
      userID,
      nickname,
      secret,
    },
  }).then(console.debug).catch(console.error);
};

/**
 * Send the mail to reset password
 * @param {string} address - User email address
 * @param {string} nickname - User name
 * @param {string} secret - temporary reset link
 * @return {Promise<*>}
 */
module.exports.sendResetPasswordEmail = ({address, nickname, secret}) => {
  const email = new Email(process.env.NODE_ENV === 'production' ? emailProdConfig : emailDevConfig);
  return email.send({
    template: 'resetPassword',
    message: {
      from: `${process.env.HOVER_USER}`,
      to: address,
      attachments: [{
        filename: 'signature.png',
        path: path.join(__dirname, '../..', 'template/assets/images/logo_signature__dark.png'),
        cid: 'logo_reset_email',
      }],
    },
    locals: {
      nickname,
      secret,
    },
  }).then(console.debug).catch(console.error);
};


/**
 * Send the mail to inform a reviewer of a potential review opportunity
 * @param {string} address - User email address
 * @param {string} fromName - Uploader user name
 * @param {string} toName - Reviewer user name
 * @param {string} game - Game name
 * @param {number} bounty
 * @return {Promise<*>}
 */
module.exports.sendReviewOpportunityEmail = ({address, fromName, bounty, game, toName}) => {
  const email = new Email(process.env.NODE_ENV === 'production' ? emailProdConfig : emailDevConfig);
  return email.send({
    template: 'reviewOpportunity',
    message: {
      from: `${process.env.HOVER_USER}`,
      to: address,
      attachments: [{
        filename: 'signature.png',
        path: path.join(__dirname, '../..', 'template/assets/images/logo_signature__dark.png'),
        cid: 'logo_auction_opportunity',
      }],
    },
    locals: {
      game,
      bounty,
      fromName,
      toName,
    },
  }).then(console.debug).catch(console.error);
};

/**
 * Send the mail to inform an uploader that a new comment was posted on his video
 * @param {string} address - User email address
 * @param {string} fromName - Uploader user name
 * @param {string} excerpt
 * @param {string} toName - Reviewer user name
 * @param {string} atelierTitle
 * @param {number} atelierID - Atelier ID
 * @return {Promise<*>}
 */
module.exports.sendNewAtelierCommentEmail = ({address, fromName, excerpt, toName, atelierTitle, atelierID}) => {
  const email = new Email(process.env.NODE_ENV === 'production' ? emailProdConfig : emailDevConfig);
  return email.send({
    template: 'atelierComment',
    message: {
      from: `${process.env.HOVER_USER}`,
      to: address,
      attachments: [{
        filename: 'signature.png',
        path: path.join(__dirname, '../..', 'template/assets/images/logo_signature__dark.png'),
        cid: 'logo_new_comment',
      }],
    },
    locals: {
      excerpt,
      fromName,
      toName,
      atelierTitle,
      atelierID,
    },
  }).then(console.debug).catch(console.error);
};

/**
 * Send the mail to inform an uploader that a review is waiting for him
 * @param {string} address - User email address
 * @param {string} fromName - Uploader user name
 * @param {string} toName - Reviewer user name
 * @param {string} game - Game name
 * @param {number} atelierID - Atelier ID
 * @return {Promise<*>}
 */
module.exports.sendReviewCompleteEmail = ({address, fromName, game, toName, atelierID}) => {
  const email = new Email(process.env.NODE_ENV === 'production' ? emailProdConfig : emailDevConfig);
  return email.send({
    template: 'reviewComplete',
    message: {
      from: `${process.env.HOVER_USER}`,
      to: address,
      attachments: [{
        filename: 'signature.png',
        path: path.join(__dirname, '../..', 'template/assets/images/logo_signature__dark.png'),
        cid: 'logo_review_complete',
      }],
    },
    locals: {
      game,
      fromName,
      toName,
      atelierID,
    },
  }).then(console.debug).catch(console.error);
};
