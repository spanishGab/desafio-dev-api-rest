import fastify from "fastify";
import app from "./App";

app.getApp().listen({ port: 3000 }, (err, address) => {
  if (err) {
    app.getApp().log.error(err);
    process.exit(1);
  }
  app.getApp().log.info('SERVER LISTENING ON PORT 3000');
});
