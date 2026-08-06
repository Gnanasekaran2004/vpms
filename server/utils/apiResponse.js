// helper for success
export const ok = (res, myData, msg = 'Success', code = 200) => {
  return res.status(code).json({ success: true, message: msg, data: myData });
};

// helper for error
export const err = (res, msg = 'Server Error', code = 500, errList = null) => {
  const payload = { success: false, message: msg };
  if (errList) {
    payload.errors = errList;
  }
  return res.status(code).json(payload);
};
