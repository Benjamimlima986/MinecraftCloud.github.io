import {
  Container,
  getContainer
} from "@cloudflare/containers";

export class MinecraftContainer
  extends Container {

  defaultPort = 8080;

  sleepAfter = "5m";
}

export default {

  async fetch(request, env) {

    const url =
      new URL(request.url);

    if (
      url.pathname.startsWith("/game")
    ) {

      return getContainer(
        env.MINECRAFT_CONTAINER
      ).fetch(request);

    }

    return env.ASSETS.fetch(request);
  }

};
