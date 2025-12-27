const dotenv = require('dotenv');
const mongoose = require('mongoose');

 process.on('uncaughtException', err =>{
        console.log(err.name,err.message);
     process.exit(1);

    });
dotenv.config({path: './config.env'}); // meka app ekt kalin enna one, ntnm variables app ekt enne na.

const app = require('./app');

const DB = process.env.DB_CLOUD.replace(
    '<PASSWORD>',
    process.env.DB_PASSWORD
);

mongoose.connect(DB,{
    useNewUrlParser : true,
    useCreateIndex : true,
    useFindAndModify : false
}).then( () =>{
    
    console.log("Database connected successfully!");

});




const port = process.env.PORT;
    const server =app.listen(port, () =>{
        console.log('App is running on port 3000');
    });

    process.on('unhandledRejection', err =>{
        console.log(err.name,err.message);
        server.close(() =>{
            process.exit(1);
        });
        
    });

    process.on('SIGTERM', () =>{
        console.log('SIGTERM RECEIVED! Shutting Down...');
        server.close(() =>{
            console.log('Process Terminated!');
        });

    });

   