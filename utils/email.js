const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');




module.exports = class Email{
    constructor(user,url){
        this.to =user.email;
        this.url = url;
        this.firstName = user.name.split(' ')[0];
        this.from = `Viraj ${process.env.EMAIL_FROM}`;
    }

    newTransport(){

        if(process.env.NODE_ENV ==='production'){
            return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD
      }
    });
        }
         //1 create transporter

        return nodemailer.createTransport({
       host  : process.env.EMAIL_HOST,
       port : process.env.EMAIL_PORT,
       auth:{
        user : process.env.EMAIL_USERNAME,
        pass : process.env.EMAIL_PASSWORD
       } 
    });


    }

    //sending actual email
    async send(template,subject){
        //1 render HTML based on pug template
        const html =pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,{
            firstName : this.firstName,
            url : this.url,
            subject
        });

        //2 email options
        const mailOptions = {
        from : this.from,
        to : this.to,
        subject :subject,
        html : html,
        text : htmlToText.convert(html)
    }

        //3create the transport and send the email
        
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome(){
        await this.send('welcome', 'Welcome to the Natours family!');
    }

    async sendPasswordRest(){
        await this.send('passwordReset', 'Your password reset token (valid for only 10min)');
    }
}

