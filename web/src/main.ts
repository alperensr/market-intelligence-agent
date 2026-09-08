import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Web application root element was not found.");
}

app.innerHTML = `
  <main>
    <h1>Market Intelligence Agent</h1>
    <p>Live market analysis will appear here soon.</p>
  </main>
`;
