# Sanctum Chess Football — Android download landing

Standalone promotional website, maintained in a **private repository**, separate from the playable game.

## Website

Open `index.html` on a local static HTTP server (for example `python3 -m http.server 8000`). The site has a reversible scroll animation with a tactical arena, rotating phone, feature reveals, and a final Android/WhatsApp section. Source is plain HTML/CSS/JS with no build system.

## Hosting

Deploy the repository root as a static website using Cloudflare Pages or another service that supports private GitHub repositories. Set no build command. The playable web game is independently hosted at https://sanctum-chess-football.pages.dev/.

## Android APK

The download link is **disabled** until an official APK has been supplied and verified. Never claim an Android binary is published before that happens.

After independently verifying the APK filename, signing identity, file size and SHA-256, publish the binary on a **public** download endpoint and update `release.json` to:

```json
{"status":"ready","version":"1.0.0","apkUrl":"https://downloads.example.com/SanctumChessFootball-v1.0.0.apk","sha256":"<sha256-of-real-file>","sizeBytes":12345678}
```

The website source repository is private, so do **not** use a private GitHub release asset as a public download URL. Do not embed GitHub credentials, signing keys or other secrets in frontend code.

## Contact

Developer WhatsApp: https://wa.me/2349138907913
