import { defineConfig, devices } from "@playwright/test";

const PORT = 3123;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  workers: 2,
  globalSetup: "./tests/e2e/global-setup.ts",
  use: { baseURL: `http://localhost:${PORT}`, ...devices["Pixel 7"] },
  webServer: {
    // Servidor dev propio con su carpeta de compilación (.next-e2e), para poder lanzar los e2e
    // mientras corre tu `npm run dev` sin pisarle la .next.
    // Ojo: NO usar `next build` aquí. Con `output: "export"`, distDir solo cambia la carpeta del
    // export y la compilación seguiría yendo a .next. El build de producción se comprueba con
    // `npm run build` aparte.
    command: `NEXT_DIST_DIR=.next-e2e npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}/es/`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
