module.exports.success = function (res, req, data) {
  const formattedResponse = {
    success: true,
    data: data,
  };

  return res.status(200).send(formattedResponse);
};

module.exports.pagination = function (res, req, data, total_records) {
  res.setHeader("total-records", total_records);
  return this.success(res, req, data);
};

module.exports.success_with_headers = function (res, req, data, headers) {
  if (headers.length > 0) {
    for (let i = 0; i < headers.length; i++) {
      res.setHeader(headers[i].key, headers[i].value);
    }
  }
  return this.success(res, req, data);
};

module.exports.fail = function (res, data, status = 400) {
  if (status === 403 && (data == "" || !data)) data = "You are not allowed";
  if (status === 401 && (data == "" || !data)) data = "Unauthorized";
  const formattedResponse = {
    success: false,
    data: data,
  };

  return res.status(status).send(formattedResponse);
};
