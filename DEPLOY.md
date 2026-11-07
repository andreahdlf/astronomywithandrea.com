# Publishing astronomywithandrea.com on GitHub Pages

## Where things stand (7 November 2026)

Steps 1, 2 and 4 below are done:
- The site lives at https://github.com/andreahdlf/astronomywithandrea.com (branch `main`).
- GitHub Pages is switched on and the custom domain astronomywithandrea.com is set.
- The domain is registered at Porkbun. Its DNS still points at Porkbun's parking page,
  so step 3 (the DNS records) is the one thing left, and only the Porkbun account holder
  can do it. In Porkbun: Domain Management, then the DNS link next to the domain. Delete
  the parking A records for the bare domain and the parking CNAME for `www`, then add the
  records in step 3 with andreahdlf = andreahdlf. After that, come back to step 4.3
  (Enforce HTTPS).

Publishing an update later is just: edit the files, then in Terminal inside the site folder
`git add -A`, `git commit -m "what changed"`, `git push`. The live site updates within a minute.

One-off setup. Takes about twenty minutes plus DNS waiting time.

## 1. Put the site on GitHub

1. Go to https://github.com/new. Repository name: `astronomywithandrea.com` (any name works).
   Make it Public (GitHub Pages on a free account needs a public repository). Do not add a
   README or .gitignore; the folder already has what it needs.
2. In Terminal, inside the site folder:

       cd "astronomywithandrea"
       git init
       git add .
       git commit -m "First version of the site"
       git branch -M main
       git remote add origin https://github.com/andreahdlf/astronomywithandrea.com.git
       git push -u origin main

## 2. Switch on GitHub Pages

1. On GitHub, open the repository, then Settings, then Pages (left menu).
2. Under "Build and deployment", Source: "Deploy from a branch". Branch: `main`, folder `/ (root)`. Save.
3. After a minute the page shows "Your site is live at https://andreahdlf.github.io/astronomywithandrea.com/".
   Check that it loads. The galaxy will look right; the custom domain comes next.

## 3. Point the domain at GitHub (DNS)

Log in to wherever you bought astronomywithandrea.com (the registrar) and open its DNS
settings. Add these records exactly. Delete any existing A or AAAA records for the
bare domain first, and any existing CNAME for `www`.

| Type | Host / Name | Value | TTL |
|---|---|---|---|
| A | `@` | `185.199.108.153` | 3600 or default |
| A | `@` | `185.199.109.153` | |
| A | `@` | `185.199.110.153` | |
| A | `@` | `185.199.111.153` | |
| AAAA | `@` | `2606:50c0:8000::153` | |
| AAAA | `@` | `2606:50c0:8001::153` | |
| AAAA | `@` | `2606:50c0:8002::153` | |
| AAAA | `@` | `2606:50c0:8003::153` | |
| CNAME | `www` | `andreahdlf.github.io` | |

Notes:
- `@` means the bare domain (astronomywithandrea.com). Some registrars want it left blank instead.
- The AAAA records are for IPv6. Add them if your registrar allows; it is fine to skip them.
- The CNAME for `www` makes www.astronomywithandrea.com work too.
- These four IP addresses are GitHub's published Pages addresses. If they ever change, the
  current ones are at https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## 4. Tell GitHub about the domain

1. Back in Settings, then Pages, under "Custom domain" type `astronomywithandrea.com` and Save.
   This writes the `CNAME` file into the repository (the folder already contains one with the
   same content, so nothing changes).
2. GitHub checks the DNS. The check may say "DNS check in progress" for a while. DNS changes
   usually take minutes but can take up to 24 hours.
3. Once the check passes, tick "Enforce HTTPS". If the box is greyed out, wait an hour and
   try again; GitHub is fetching the certificate.

## 5. Check

- https://astronomywithandrea.com loads with a padlock.
- https://www.astronomywithandrea.com redirects to the bare domain.
- Paste the link into a WhatsApp message to yourself: the preview card should show the
  galaxy image with your name. (If it shows an old preview, the app cached it; try
  https://astronomywithandrea.com/?v=2 to force a fresh fetch.)

## Updating the site later

Edit the files, then:

    git add .
    git commit -m "Describe the change"
    git push

GitHub republishes within a minute or two.
