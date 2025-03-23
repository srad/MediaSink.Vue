import { http, HttpResponse } from "msw";
import channels from "./channels";
import jobs from "./jobs";

const lasId = channels.map((channel) => channel.channelId).sort((a, b) => b - a);

export const restHandlers = [
  http.get("http://localhost:3000/channels", () => HttpResponse.json(channels)),

  http.post("http://localhost:3000/channels", ({ request }) => {
    return HttpResponse.json({
      ...request.body,
      channelId: lasId[0] + 1, // Increment only the highest channelId.
    });
  }),

  http.post("http://localhost:3000/jobs/list", () => HttpResponse.json(jobs)),
];
