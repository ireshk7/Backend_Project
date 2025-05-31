const asyncHandlers = (requestHandler) => {
    return  (req,res,next) => {
        Promise.resolve(requestHandler(res,req,next)).catch((err) => next(err))
    }
}

export {asyncHandlers}















// const asyncHandlers = (requestHandler) =>{
//     return (req,res,next) => {
//         Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
//     }
// }