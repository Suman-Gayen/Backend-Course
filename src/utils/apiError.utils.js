class ApiError extends Error { // create a class called ApiError that extends the Error class 
    constructor( // create a constructor that takes in the following parameters 
        statusCode,  // the status code of the error 
        message = "Something went wrong" , // the error message
        errors = [], // an array of errors
        stack = " " // the stack trace of the error

    ) {
        super(message); // call the super class constructor and pass the message to it set the statusCode property of the class to the statusCode parameter
        this.statusCode = statusCode; // set the statusCode property of the class to the statusCode parameter 
        this.message = message; // set the message pr operty of the class to the message parameter 
        this.data = null; // set the data property of the class to null 
        this.success = false; // set the success property of the class to false 
        this.errors = this.errors; // set the error property of the class to the error property of the class 

        if(stack) { // if the stack parameter is passed to the constructor 
            this.stack = stack; // set the stack property of the class to the stack parameter
        }else{
            Error.captureStackTrace(this, this.constructor); // capture the stack trace of the error and set it to the stack property of the class 
        }
    }
}
export { ApiError }; // export the ApiError class