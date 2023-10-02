class customErrorHandler extends Error
{
    constructor(status, msg){
        super();
        this.status = status,
        this.message = msg
    }
    static alreadyExist(message)
    {   
        return new customErrorHandler(409,message);
    }
    static wrongCredentials(message="Invalid Credentials")
    {
        return new customErrorHandler(401,message);
    }

    static unAuthorized(message="unAuthorized")
    {
        return new customErrorHandler(401,message);
    }

    static notFound(message="User not Found")
    {
        return new customErrorHandler(401,message);
    }

    static serverError(message="Internal Server Error")
    {
        return new customErrorHandler(500,message);
    }



}

export default customErrorHandler;