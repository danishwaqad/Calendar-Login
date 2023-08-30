const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");

module.exports = function(app) {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    next();
  });

  const secureRoute = (path, middlewares, handler) =>
      app.get(`/api/test${path}`, [...middlewares], handler);

  secureRoute("/all", [], controller.allAccess);
  secureRoute("/user", [authJwt.verifyToken], controller.userBoard);
};

