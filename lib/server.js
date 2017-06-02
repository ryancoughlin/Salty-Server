import Hapi from "hapi";
import routes from "./routes";

const server = new Hapi.Server();
server.connection({ port: process.env.PORT || 5000 });
server.route(routes);
server.start(err => {
  if (err) {
    throw err;
  }
  console.log("Server running at:", server.info.uri);
});
