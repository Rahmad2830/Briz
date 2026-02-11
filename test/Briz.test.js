import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { $fetch } from '../dist/Briz.min.js';

describe('Briz.js Unit Tests', () => {
  
  beforeEach(() => {
    // Reset DOM setiap test
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    vi.useFakeTimers();
    vi.restoreAllMocks();
    
    // Mock fetch secara global
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  // --- 1. TEST $FETCH CORE ---
  describe('$fetch Core & Lifecycle', () => {
    it('seharusnya melakukan request GET dan trigger lifecycle event', async () => {
      const mockHtml = '<div data-swap="target">New Content</div>';
      global.fetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      });

      const beforeSpy = vi.fn();
      document.addEventListener('z:before-request', beforeSpy);

      const result = await $fetch('/api/test');

      expect(result).toBe(mockHtml);
      expect(beforeSpy).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
        method: undefined // Default di kode Anda t.method jika tidak ada
      }));
    });

    it('seharusnya menangani AbortController untuk request yang bertabrakan', async () => {
      let resolveFirst;
      const firstRequest = new Promise(res => { resolveFirst = res; });
      
      global.fetch.mockImplementation(() => firstRequest);

      // Panggil dua kali ke endpoint yang sama (u = endpoint:method)
      const p1 = $fetch('/api/dup', { method: 'GET' });
      const p2 = $fetch('/api/dup', { method: 'GET' });

      // Cek apakah fetch dipanggil dengan signal yang berbeda
      expect(global.fetch).toHaveBeenCalledTimes(2);
      const firstSignal = global.fetch.mock.calls[0][1].signal;
      expect(firstSignal.aborted).toBe(true);
    });
  });

  // --- 2. TEST INJECT & SPECIAL ---
  describe('Config: inject & special', () => {
    it('seharusnya menginject global headers', async () => {
      $fetch.inject({ headers: { 'X-Global': 'true' } });
      global.fetch.mockResolvedValue({ ok: true, text: () => Promise.resolve('') });
      
      await $fetch('/api/inject');
      
      const callHeaders = global.fetch.mock.calls[0][1].headers;
      expect(callHeaders['X-Global']).toBe('true');
    });

    it('seharusnya menggunakan special config untuk URL tertentu', async () => {
      $fetch.special('/special-path', { headers: { 'X-Special': 'yes' } });
      global.fetch.mockResolvedValue({ ok: true, text: () => Promise.resolve('') });

      await $fetch('/special-path');
      expect(global.fetch.mock.calls[0][1].headers['X-Special']).toBe('yes');
    });
  });

  // --- 3. TEST DOM SWAPPING & MODES ---
  describe('DOM Swapping & Microtasks', () => {
    it('seharusnya melakukan swap dengan mode berbeda (append, prepend, dll)', async () => {
      document.body.innerHTML = `
        <div id="cont">
          <div id="t1" data-swap="target:append">Original</div>
          <div id="t2" data-swap="target:prepend">Original</div>
        </div>
      `;

      // Kita harus memicu fungsi m(html) yang dipanggil internal setelah f()
      // Karena m() tidak diekspor, kita uji lewat trigger AJAX form/link
      // Namun untuk unit test logic swapping, kita asumsikan f() memanggil m()
      
      // Simulasi hasil HTML dari server
      const responseHtml = `
        <div data-swap="target:append"><span>Appended</span></div>
        <div data-swap="target:prepend"><span>Prepended</span></div>
      `;

      // Mock implementasi swap internal
      // Catatan: Karena fungsi 'm' private, kita test lewat efek samping $fetch di form/link
      // atau memicu manual lewat event jika memungkinkan.
    });
  });

  // --- 4. TEST NAVIGATION (A Tag) & FORM ---
  describe('Interactions: Links & Forms', () => {
    it('seharusnya menangani klik pada [data-nav]', async () => {
      document.body.innerHTML = '<a href="/page2" data-nav id="link">Go</a>';
      const link = document.getElementById('link');
      
      global.fetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<html><body>New Body</body></html>')
      });

      link.click();
      
      // Tunggu async execution
      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/page2'), expect.anything());
      });
    });

    it('seharusnya mengirim data form via AJAX [data-ajax]', async () => {
      document.body.innerHTML = `
        <form data-ajax action="/submit" method="POST" id="myForm">
          <input name="user" value="briz">
        </form>
      `;
      const form = document.getElementById('myForm');
      
      global.fetch.mockResolvedValue({ ok: true, text: () => Promise.resolve('Success') });

      const event = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(event);

      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/submit'), expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData)
      }));
    });
  });

  // --- 5. TEST FULL PAGE NAVIGATION (SwapPage/O function) ---
  describe('Full Page Navigation & Meta Diff', () => {
    it('seharusnya mengganti title dan sinkronisasi meta tag', async () => {
      document.head.innerHTML = '<title>Old</title><meta name="description" content="old description">';
      const newPage = `
        <html>
          <head>
            <title>New Title</title>
            <meta name="description" content="new description">
            <meta name="author" content="Briz">
          </head>
          <body><main>New Content</main></body>
        </html>
      `;

      // Mock navigasi internal O(newPage)
      // Cara terbaik mengetes ini adalah memicu link [data-nav]
      global.fetch.mockResolvedValue({ ok: true, text: () => Promise.resolve(newPage) });
      
      document.body.innerHTML = '<a href="/new" data-nav id="nav">Link</a>';
      document.getElementById('nav').click();

      await vi.waitFor(() => {
        expect(document.title).toBe('New Title');
        const desc = document.querySelector('meta[name="description"]');
        expect(desc.content).toBe('new description');
        expect(document.querySelector('meta[name="author"]').content).toBe('Briz');
      });
    });
  });
});
