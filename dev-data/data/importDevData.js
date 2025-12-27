const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');


dotenv.config({path: './config.env'}); // meka app ekt kalin enna one, ntnm variables app ekt enne na.
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



const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'));

const importData = async () => {
  try {
    console.log('⏳ Importing tours...');
    for (const tour of tours) {
      await Tour.create(tour);
    }
    console.log('✅ Tours done');

    console.log('⏳ Importing users...');
    await User.create(users, { validateBeforeSave: false });
    console.log('✅ Users done');

    console.log('⏳ Importing reviews...');
    await Review.create(reviews);
    console.log('✅ Reviews done');

    console.log('🎉 Data loaded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ ERROR:', err);
    process.exit(1);
  }
};


const deleteData = async () =>{
    try{
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("Data deleted successfully!");
        process.exit();

    }catch(err){
        console.log(err);
    }
}

if(process.argv[2] ==='--import'){
    importData();
}else if(process.argv[2] ==='--delete'){
    deleteData();
}
