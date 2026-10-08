// Verify the public response, not just that an artifact was uploaded successfully.
const site = new URL(process.argv[2] || "https://www.cfeat.cc.cd/DeepSea/");
site.protocol = "https:";
site.search = "";
site.hash = "";
if (!site.pathname.endsWith("/")) site.pathname += "/";

const phones = [
  {
    name: "iPhone Safari",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1",
  },
  {
    name: "Android WeChat",
    userAgent:
      "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 MicroMessenger/8.0.55",
  },
];

async function read(url, type, { fresh = false, userAgent } = {}) {
  const target = new URL(url, site);
  if (
    target.origin !== site.origin ||
    !target.pathname.startsWith(site.pathname)
  )
    throw new Error(`Asset outside the site: ${target.href}`);
  if (fresh) target.searchParams.set("pages-check", Date.now().toString(36));
  let response;
  try {
    response = await fetch(target, {
      signal: AbortSignal.timeout(15000),
      headers: userAgent ? { "User-Agent": userAgent } : undefined,
    });
  } catch (error) {
    const detail = error.cause?.code || error.cause?.message || error.message;
    throw new Error(`${target.href}: ${detail}`, { cause: error });
  }
  const final = new URL(response.url);
  if (
    final.protocol !== "https:" ||
    final.origin !== site.origin ||
    !final.pathname.startsWith(site.pathname)
  )
    throw new Error(`${target.href}: unexpected redirect to ${final.href}`);
  if (
    target.searchParams.has("creature") &&
    final.searchParams.get("creature") !== target.searchParams.get("creature")
  )
    throw new Error(`${target.href}: the species query was lost during redirect`);
  if (!response.ok || !response.headers.get("content-type")?.includes(type))
    throw new Error(
      `${target.href}: HTTP ${response.status}, ${response.headers.get("content-type")}${userAgent ? " (mobile request)" : ""}`,
    );
  return response.text();
}

for (let attempt = 1; attempt <= 4; attempt++) {
  try {
    // Check the URLs readers actually use as well as a fresh deployment response.
    // A cache-busting request alone can miss a cached 404 at the ordinary URL.
    const entries = await Promise.all([
      read(site, "text/html"),
      read(site, "text/html", { fresh: true }),
      ...phones.flatMap(({ userAgent }) => [
        read(site, "text/html", { userAgent }),
        read("?creature=vampire-squid", "text/html", { userAgent }),
      ]),
    ]);
    const assets = new Set();
    for (const html of entries) {
      if (!html.includes('id="root"'))
        throw new Error("A public entry is not the app");
      const entryAssets = [
        ...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g),
      ].map((match) => match[1]);
      if (!entryAssets.some((asset) => asset.endsWith(".js")))
        throw new Error("An entry script is missing");
      entryAssets.forEach((asset) => assets.add(asset));
    }
    const [missingPage] = await Promise.all([
      read("404.html", "text/html", { fresh: true }),
      ...[undefined, ...phones.map((phone) => phone.userAgent)].flatMap(
        (userAgent) =>
          [...assets].map((asset) =>
            read(asset, asset.endsWith(".css") ? "text/css" : "javascript", {
              userAgent,
            }),
          ),
      ),
    ]);
    if (!missingPage.includes("这页没有找到"))
      throw new Error("The recovery page is missing");
    console.log(
      `Pages verified: ${site.href}, ordinary and fresh entries, ${phones.map((phone) => phone.name).join(" + ")}, ${assets.size} app assets, 404 recovery page`,
    );
    break;
  } catch (error) {
    console.error(`Public check ${attempt}/4: ${error.message}`);
    if (attempt === 4) process.exit(1);
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}
