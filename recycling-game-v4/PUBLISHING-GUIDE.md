# Publishing the game as a direct webpage

The ZIP/folder is only the source package for the person publishing the game. Players should receive a normal website URL and will not download anything.

## Recommended: GitHub Pages

1. Create a free GitHub account at github.com.
2. Create a new **public** repository, for example `recycling-challenge`.
3. Choose **Add file → Upload files**.
4. Upload `index.html` and the entire `assets` folder. The repository root must show `index.html` directly—not inside another nested folder.
5. Open **Settings → Pages**.
6. Under **Build and deployment**, select **Deploy from a branch**.
7. Select branch **main**, folder **/(root)**, then **Save**.
8. GitHub will display a public address similar to:
   `https://YOUR-USERNAME.github.io/recycling-challenge/`
9. Share that URL. Anyone opening it goes directly to the game.

## Cloudflare Pages (direct upload)

1. Create/sign into a Cloudflare account.
2. Go to **Workers & Pages → Create → Pages → Upload assets**.
3. Give the project a name.
4. Drag the unzipped `recycling-game-v4` folder into the upload area.
5. Deploy. Cloudflare provides a URL similar to:
   `https://recycling-challenge.pages.dev`
6. Share that URL.

If a corporate network blocks uploads with a 403, perform the one-time upload from an approved personal connection/device or ask Tradeweb IT/Communications to publish the folder on an approved internal host.

## Internal Tradeweb / SharePoint route

Modern SharePoint document libraries normally serve `.html` files as downloads or restrict scripts, so simply uploading the files to a library may not produce a playable webpage. Ask the internal web/intranet team for one of these:

- a static website location;
- an approved Azure Static Web Apps / internal web-server deployment;
- an iframe/embed location that allows local HTML, CSS and JavaScript;
- publication within the intranet CMS by the owning team.

Give them the unzipped folder and specify that `index.html` is the entry point and no server-side code, database, cookies or external libraries are used.

## Netlify clarification

Netlify's file-sharing link is not a website deployment. It lets recipients download files. A Netlify **site deployment** produces the direct webpage URL. If site uploads return 403 on a corporate device, use another approved host rather than sharing a download link.

## Updating the game later

Replace the hosted files with the updated versions while retaining the same folder structure. The public URL can remain unchanged.
