// Verify the public response, not just that an artifact was uploaded successfully.
const site = new URL(process.argv[2] || "https://www.cfeat.cc.cd/DeepSea/");
site.protocol = "https:";
site.search = "";
site.hash = "";
if (!site.pathname.endsWith("/")) site.pathname += "/";

async function read(url, type) {
  const target = new URL(url, site);
  if (
    target.origin !== site.origin ||
    !target.pathname.startsWith(site.pathname)
  )
    throw new Error(`Asset outside the site: ${target.href}`);
  target.searchParams.set("pages-check", Date.now().toString(36));
  const response = await fetch(target, { signal: AbortSignal.timeout(15000) });
  if (!response.ok || !response.headers.get("content-type")?.includes(type))
    throw new Error(
      `${target.pathname}: HTTP ${response.status}, ${response.headers.get("content-type")}`,
    );
  return response.text();
}

for (let attempt = 1; attempt <= 4; attempt++) {
  try {
    const html = await read(site, "text/html");
    if (!html.includes('id="root"'))
      throw new Error("The public entry is not the app");
    const assets = [
      ...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g),
    ].map((match) => match[1]);
    if (!assets.some((asset) => asset.endsWith(".js")))
      throw new Error("The entry script is missing");
    const [missingPage] = await Promise.all([
      read("404.html", "text/html"),
      ...assets.map((asset) =>
        read(asset, asset.endsWith(".css") ? "text/css" : "javascript"),
      ),
    ]);
    if (!missingPage.includes("这页没有找到"))
      throw new Error("The recovery page is missing");
    console.log(
      `Pages verified: ${site.href}, ${assets.length} app assets, 404 recovery page`,
    );
    break;
  } catch (error) {
    console.error(`Public check ${attempt}/4: ${error.message}`);
    if (attempt === 4) process.exit(1);
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}
