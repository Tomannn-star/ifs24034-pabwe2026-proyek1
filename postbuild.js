import fs from "fs";
import path from "path";

const routes = [
  "auth/login",
  "auth/register",
  "login",
  "transaksi",
  "transaksi/baru",
  "iuran",
  "anggota",
  "penunggak",
  "kategori",
  "design-system"
];

for (const route of routes) {
  const htmlFile = path.join("build", `${route}.html`);
  const routeDir = path.join("build", route);
  const indexFile = path.join(routeDir, "index.html");

  if (fs.existsSync(htmlFile)) {
    fs.mkdirSync(routeDir, { recursive: true });
    fs.copyFileSync(htmlFile, indexFile);
  }
}

// Pastikan 200.html dan 404.html juga tersedia sebagai fallback SPA
if (fs.existsSync("build/index.html")) {
  fs.copyFileSync("build/index.html", "build/200.html");
  fs.copyFileSync("build/index.html", "build/404.html");
}

console.log("✅ Postbuild: seluruh rute statis HTML & fallback 404.html berhasil digenerate!");

