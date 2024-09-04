import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";
import express from "express";
import {createServer as createViteServer} from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const app = express();

  // Erstellen Sie den Vite-Server im Middleware-Modus und konfigurieren Sie den App-Typ als
  // 'custom', um die eigene HTML-Bereitstellungslogik von Vite zu deaktivieren, damit der übergeordnete Server
  // die Kontrolle übernehmen kann
  const vite = await createViteServer({
    server: {middlewareMode: true},
    appType: "custom"
  });

  // Verwenden Sie die Connect-Instanz von vite als Middleware. Wenn Sie Ihren eigenen
  // Express-Router (express.Router()) verwenden, sollten Sie router.use
  // Wenn der Server neu startet (z.B. nachdem der Benutzer die
  // vite.config.js), ist `vite.middlewares` immer noch die gleiche
  // Referenz (mit einem neuen internen Stapel von Vite und Plugin-injected
  // Middlewares). Das Folgende ist auch nach Neustarts gültig.
  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // 1. Lesen Sie die index.html
      let template = fs.readFileSync(
        path.resolve(__dirname, "index.html"),
        "utf-8",
      );

      // 2. Wenden Sie Vite-HTML-Transformationen an. Dadurch wird der Vite HMR-Client eingefügt,
      //    und es werden auch HTML-Transformationen von Vite-Plugins angewendet, z. B. globale
      //    Präambeln von @vitejs/plugin-react
      template = await vite.transformIndexHtml(url, template);

      // 3. Laden Sie den Server-Einstieg. ssrLoadModule transformiert automatisch
      //    ESM-Quellcode, damit er in Node.js verwendbar ist! Es ist kein Bündeln erforderlich und bietet
      //    effiziente Ungültigmachung ähnlich wie HMR.
      const {render} = await vite.ssrLoadModule("/src/entry-server.ts");

      // 4. Die HTML-Anwendung rendern. Dies setzt voraus, dass entry-server.js exportiert wird.
      //     Die Funktion `render` ruft entsprechende SSR-Rahmen-APIs auf,
      //    z.B. ReactDOMServer.renderToString()
      const appHtml = await render(url);

      // 5. Fügen Sie das vom App gerenderte HTML in die Vorlage ein.
      const html = template.replace(`<!--ssr-outlet-->`, appHtml);

      // 6. Senden Sie das gerenderte HTML zurück.
      res.status(200).set({"Content-Type": "text/html"}).end(html);
    } catch (e) {
      // Wenn ein Fehler auftritt, lässt Vite den Stapelverfolgung korrigieren, damit er auf Ihren tatsächlichen Quellcode verweist.
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  app.listen(5173);
}

createServer();
