import "expo-router/entry";

import { createServer, Response, Server } from "miragejs";

declare global {
  interface Window {
    server: Server;
  }
}

if (__DEV__) {
  if (window.server) {
    window.server.shutdown();
  }

  window.server = createServer({
    routes() {
      this.post("/login", (schema, request) => {
        const { username, password } = JSON.parse(request.requestBody);
        console.log(username, password);
        if (username === "eastzoo" && password === "1234") {
          return {
            accessToken: "accessToken",
            refreshToken: "refreshToken",
            user: {
              id: "eastzoo",
              username: "eastzoo",
              email: "eastzoo@gmail.com",
              profileImage: "https://github.com/eastzoo.png",
            },
          };
        } else {
          return new Response(401, {}, { message: "Invalid credentials" });
        }
      });
    },
  });
}
