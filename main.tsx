import { Webview } from "@webview/webview";
import type { FC } from 'hono/jsx'
import type { JSX } from 'hono/jsx/runtime'

const Layout: FC = (props) => {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        {props.children}
      </body>
    </html>
  )
}

const pages: { [key: string]: JSX.Element } = {}

pages["html"]=(<Layout>
  <h1>Hello</h1>
  <button onclick="Alink('setting')" type="button">設定</button>
</Layout>)

pages["setting"] = (<Layout>
  <h1>Setting</h1>
  <button onclick="Alink('html')" type="button">back</button>
</Layout>)

const webview = new Webview();
webview.title = "Hello World";
webview.bind("Alink", (pagename:string) => {
  webview.navigate(`data:text/html,${encodeURIComponent("<!DOCTYPE html>"+pages[pagename].toString())}`);
});
webview.navigate(`data:text/html,${encodeURIComponent("<!DOCTYPE html>"+pages["html"].toString())}`);
webview.run();
