module.exports = func =>{
    return(req, res, next) =>{
        func(req, res, next).catch(next);
    }
    // this func return new fnc which catch error. 
    // if error occurs in the code, this catch automatically. 
}

