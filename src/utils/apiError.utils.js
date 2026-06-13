
class ApiError extends Error{

    constructor(
        statusCode , 
        message = "something went wrong", 
        success = false , 
        error = [] , 
        stack = "" , 
    ){
        super(message) 
        this.statusCode = statusCode , 
        this.data = null , 
        this.message = message , 
        this.success = success, 
        this.error = error , 
        this.stack = stack
    }

}

export {ApiError}