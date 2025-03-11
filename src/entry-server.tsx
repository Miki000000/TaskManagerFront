// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";
import { onMount } from "solid-js";

export default createHandler(() => {
  // Define the theme initialization script
  const themeScript = `
    try {
      var theme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      console.error('Error setting initial theme:', e);
    }
  `;

  return (
    <StartServer
      document={({ assets, children, scripts }) => {
        return (
          <html lang="en">
            <head>
              <meta charset="utf-8" />
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
              />
              <link rel="icon" href="/favicon.ico" />
              <title>Task Manager</title>
              <script innerHTML={themeScript} type="text/javascript" />
              {assets}
            </head>
            <body>
              <div id="app">{children}</div>
              {scripts}
            </body>
          </html>
        );
      }}
    />
  );
});
