class ApiResponse {     // create a class called ApiResponse
    constructor(statusCode, data, message) { // create a constructor that takes in the following parameters
        this.statusCode = statusCode; // set the statusCode property of the class to the statusCode parameter
        this.data = data; // set the data property of the class to the data parameter
        this.message = message; // set the message property of the class to the message parameter
        this.success = statusCode <400; // set the success property of the class to true if the statusCode is less than 400, otherwise set it to false
    }
}   
export { ApiResponse }; // export the ApiResponse class