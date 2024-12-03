const createError = (status, message, field = null) => {
  const error = new Error();
  error.statusCode = status;
  error.message = message;

  if (field) {
    error.errors = [{
      field: field,
      message: message
    }];
  }
  
  return error;
};

export {createError};