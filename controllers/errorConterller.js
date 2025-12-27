const AppError = require('../utils/appError');

const handleCasTError = err =>{
    const message = `Invalid ${err.path} : ${err.value}`;
    return new AppError(message,400);

}

const handleDuplicateError = err =>{
    const value =  err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value ${value} enter another value`;
    return new AppError(message,400);

}

const handleValidationError = err =>{

    const errors = Object.values(err.errors).map(el => el.message);
    const message = `invalid input data ${errors.join('. ')}`;
    return new AppError(message,400);

}
const handleJWTError = () => new AppError('Invalid token.Please login again',401);

const handleJWTExpiredError = () => new AppError('Token expired.Please login again',401);

const sendDevError = (err,req,res) =>{
    if(req.originalUrl.startsWith('/api')){
err.statusCode = err.statusCode ||500;
          err.status = err.status || 'error';
          res.status(err.statusCode).json({
               status : err.status,
               error : err,
               errorStack : err.stack,
               message : err.message
          });
    }else{
        res.status(err.statusCode).render('error',{
            title:'Something went wrong!',
            msg: err.message
        });
    }
    
}
const sendProdError = (err,req,res) =>{
    if(req.originalUrl.startsWith('/api')){
    if(err.isOperational){
    res.status(err.statusCode).render('error',{
            title:'Something went wrong!',
            msg: err.message
        });
        }// programming or other errors waldi client ta details ywanne na
        else{
            //1.Apita
            console.error("ERROR",err);

            //2. clientta
            res.status(500).json({
                status : "error",
                message : "Something went wrong!"
            });
        }
    }else{
         if(err.isOperational){
    res.status(err.statusCode).json({
               status : err.status,
               message : err.message
          });
        }// programming or other errors waldi client ta details ywanne na
        else{
            //1.Apita
            console.error("ERROR",err);

            //2. clientta
            res.status(err.statusCode).render('error',{
            title:'Something went wrong!',
            msg: 'Please try again later!'
        });
        }
    }
}


module.exports = ( err,req, res, next) => {

    if(process.env.NODE_ENV === 'development'){
           sendDevError(err, req,res)
    } else if(process.env.NODE_ENV === 'production'){

        let error = { ...err };
        error.message= err.message;
        if(error.name === 'CastError'){
            error = handleCasTError(error);
        }
        if(error.code === 11000){
            error = handleDuplicateError(error);
        }
        if(error.name === 'ValidationError'){
            error = handleValidationError(error);
        }
        if(error.name === 'JsonWebTokenError'){
            error = handleJWTError();
        }
        if(error.name === 'TokenExpiredError'){
            error = handleJWTExpiredError();
        }
        sendProdError(error,req,res);
    }
       
     }