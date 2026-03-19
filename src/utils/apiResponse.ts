export const successResponse = (data: any, message = "Success") => {
    return {
        success: true,
        message,
        data
    };
};

export const errorResponse = (message: string) => {
    return {
        success: false,
        message
    };
};