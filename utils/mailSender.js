import nodemailer from 'nodemailer'

export const mailSender=async(email,title,body)=>{
    try{
    //transporter function
    let transporter=nodemailer.createTransport({
        host:process.env.MAIL_HOST,
        auth:{ 
            user:process.env.MAIL_USER,
            pass:process.env.MAIL_PASS
        }
    })
    //send emails to user
    let info=await transporter.sendMail({
        from:'www.rahulrajesh.me - Rahul Rajesh',
        to:email,
        subject:title,
        html:body,
    });
    console.log("Email info:",info);
    return info;
    }catch(err){
        console.log(err)
    }

}