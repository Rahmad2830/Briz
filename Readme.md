# Briz.js

<div style="display: flex; justify-content: center;">
  <img src="assets/Briz.webp" width="300" alt="Briz-logo" style="display: block; margin: 0 auto;" />
</div>

![Build-Passing](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Dependency](https://img.shields.io/badge/Dependency_Count-0-brightgreen?style=for-the-badge)
![Size](https://img.shields.io/badge/Size-~2.5kb_Gzip-brightgreen?style=for-the-badge)

Briz.js is a lightweight JavaScript library for building dynamic, server-driven web interfaces using declarative HTML attributes. It handles AJAX requests, HTML swapping, client-side navigation, server-sent events, and DOM polling — all without a build step or heavy dependencies.

**✨ Key Features**
- Declarative AJAX forms and navigation via `data-ajax` and `data-nav`
- Intelligent HTML swapping via `data-swap`
- Client-side navigation with history & scroll restoration
- Real-time updates via Server-Sent Events (`data-sse`)
- Automatic DOM polling with configurable intervals (`data-polling`)
- Built-in request lifecycle events (`z:before-request`, `z:after-swap`, etc.)
- Abort controller support to prevent duplicate requests
- Zero dependencies, extremely lightweight

**🚀 Quickstart**

```html
<form data-ajax action="/user" method="get">
  <button type="submit">Get User</button>
</form>

<div data-swap="listUser">
  ...waiting for server response
</div>
```

> make a request to the url **/user** then replace the entire data-swap with the server response that has the same data-swap value

**📦 Installation**

Simply include Briz.js into your project via cdn

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/Rahmad2830/Briz@v1.0.3/dist/Briz.min.js"></script>
```

**📚 Documentation**

For full guides, examples, and API reference, visit the official documentation:

👉 https://withcable.pages.dev

**☕ Buy me a Coffee**

I really appreciate your support. Thank you.

<a href="https://ko-fi.com/rahmatnurhidayat">
  <img src="assets/support_me_on_kofi_beige.png" width="250" alt="Support-me" />
</a>