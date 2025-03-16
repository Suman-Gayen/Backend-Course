const asyncHandler = (requestHandler) => { // requestHandler is the function that will be passed to the asyncHandler 
  (req, res, next) => { // return a new function that takes the request, response, and next arguments 
    Promise.resolve(requestHandler(req, res, next)).catch((error) => // call the requestHandler function and pass the request and response to it if the requestHandler function returns a promise, resolve it and catch any errors that occur during the execution of the promise 
      next(error) // pass the error to the next middleware function 
    );
  };
};

export default asyncHandler;

// -----------or-----------

// const asyncHandler = (fn) => async (req, res, next) => { // fn is the function that will be passed to the asyncHandler 
//   try {
//     await fn(req, res, next); // call the function that was passed to the asyncHandler 
//   } catch (error) { // catch any errors that occur during the execution of the function 
//     res.status(error.code || 500).json({ // set the status code of the response to the error code or 500 
//       success: false, // set the success property of the response to false 
//       message: error.message,   // set the message property of the response to the error message
//     //   stack: process.env.NODE_ENV === "production" ? "🥞" : error.stack, // set the stack property of the response to the error stack trace if the environment is not production 
//     });
//   }
// };
