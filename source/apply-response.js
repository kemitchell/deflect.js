module.exports = function(object, serverResponse) {
  serverResponse.writeHead(
    object.status || 200,
    object.headers || {}
  );
  var body = object.body;
  if (body && body.pipe && typeof body.pipe === 'function') {
    body.pipe(serverResponse);
  } else {
    serverResponse.end(body);
  }
};
