export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const errorResponse = (res, message = 'Server Error', statusCode = 500, errors = null) => {
  const responsePayload = {
    success: false,
    message
  };
  
  if (errors !== null) {
    responsePayload.errors = errors;
  }
  
  return res.status(statusCode).json(responsePayload);
};
