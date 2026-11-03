/** Ponto de entrada único. A composição e o ciclo de vida ficam em SiteApp. */
import { SiteApp } from "./core/SiteApp.js?v=15";

const app = new SiteApp();
await app.init();
