import http from "node:http";
import { WebSocketServer } from "ws";

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("CloudCraft container online");
});

const wss = new WebSocketServer({
  port: 9000
});

wss.on("connection", socket => {

  console.log("Browser conectado");

  socket.send(JSON.stringify({
    type: "status",
    message: "Container conectado"
  }));

  socket.on("message", data => {

    try {

      const message =
        JSON.parse(data.toString());

      console.log(
        "Input:",
        message
      );

      /*
       * Futuramente:
       *
       * keyboard
       * mouse
       * touch
       * ESC
       * F1
       * inventário
       * chat
       * ENTER
       */

    } catch {
      console.log(
        "Mensagem inválida"
      );
    }
  });

  socket.on("close", () => {
    console.log("Browser desconectado");
  });
});
