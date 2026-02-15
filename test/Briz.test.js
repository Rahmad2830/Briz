import { it, describe, expect, vi, beforeEach } from 'vitest'
import '../dist/Briz.min.js'

beforeEach(() => {
  document.body.innerHTML = ''
  document.dispatchEvent(new Event('DOMContentLoaded'))
  vi.restoreAllMocks()
})

describe("mengetes fungsi swap", () => {
  it("harus melakukan swap element dengan mode default", async() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<div data-swap='result'>baru</div>")
    })
    
    document.body.innerHTML = `
    <form data-ajax action="/some" method="get">
      <button type="submit">Change</button>
    </form>
    
    <div data-swap='result'>lama</div>
    `
    
    const form = document.querySelector("form")
    form.dispatchEvent(new Event("submit", { cancelable: true, bubbles:true }))
    
    await vi.waitFor(() => {
      const el = document.querySelector("[data-swap='result']")
      expect(el.textContent).toBe("baru")
    })
  })
  
  it("harus melakukan swap element dengan mode append", async() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<div data-swap='result:append'>baru</div>")
    })
    
    document.body.innerHTML = `
    <form data-ajax action="/some" method="get">
      <button type="submit">Change</button>
    </form>
    
    <div data-swap='result:append'>lama</div>
    `
    
    const form = document.querySelector("form")
    form.dispatchEvent(new Event("submit", { cancelable: true, bubbles:true }))
    
    await vi.waitFor(() => {
      const el = document.querySelector("[data-swap]")
      expect(el.textContent).toBe("lamabaru")
    })
  })
  
  it("harus melakukan swap element dengan mode prepend", async() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<div data-swap='result:prepend'>baru</div>")
    })
    
    document.body.innerHTML = `
    <form data-ajax action="/some" method="get">
      <button type="submit">Change</button>
    </form>
    
    <div data-swap='result:prepend'>lama</div>
    `
    
    const form = document.querySelector("form")
    form.dispatchEvent(new Event("submit", { cancelable: true, bubbles:true }))
    
    await vi.waitFor(() => {
      const el = document.querySelector("[data-swap]")
      expect(el.textContent).toBe("barulama")
    })
  })
  
  it("harus melakukan swap element dengan mode before", async() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<div data-swap='result:before'><p>baru</p></div>")
    })
    
    document.body.innerHTML = `
    <form data-ajax action="/some" method="get">
      <button type="submit">Change</button>
    </form>
    
    <div data-swap='result:before'>lama</div>
    `
    
    const form = document.querySelector("form")
    form.dispatchEvent(new Event("submit", { cancelable: true, bubbles:true }))
    
    await vi.waitFor(() => {
      const el = document.querySelector("[data-swap]")
      expect(el.previousElementSibling.textContent).toBe("baru")
    })
  })
  
  it("harus melakukan swap element dengan mode after", async() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<div data-swap='result:after'><p>baru</p></div>")
    })
    
    document.body.innerHTML = `
    <form data-ajax action="/some" method="get">
      <button type="submit">Change</button>
    </form>
    
    <div data-swap='result:after'>lama</div>
    `
    
    const form = document.querySelector("form")
    form.dispatchEvent(new Event("submit", { cancelable: true, bubbles:true }))
    
    await vi.waitFor(() => {
      const el = document.querySelector("[data-swap]")
      expect(el.nextElementSibling.textContent).toBe("baru")
    })
  })
  
  it("harus swap beberapa element sekaligus dan tidak error ketika ada salah satu yang tidak di swap", async() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(`
      <div data-swap='result'>baru</div>
      <div data-swap='any'>baru</div>
      `)
    })
    
    document.body.innerHTML = `
    <form data-ajax action="/some" method="get">
      <button type="submit">Change</button>
    </form>
    
    <div data-swap='result'>lama</div>
    <div data-swap='any'>lama</div>
    <div data-swap='ya'>lama</div>
    `
    
    const form = document.querySelector("form")
    form.dispatchEvent(new Event("submit", { cancelable: true, bubbles:true }))
    
    await vi.waitFor(() => {
      const result = document.querySelector("[data-swap='result']")
      const any = document.querySelector("[data-swap='any']")
      const ya = document.querySelector("[data-swap='ya']")
      expect(result.textContent).toBe("baru")
      expect(any.textContent).toBe("baru")
      expect(ya.textContent).toBe("lama")
    })
  })
  
  it("harus bisa menambahkan header kustom melalui event z:before-request", async () => {
    // 1. Mock Fetch untuk mengecek header yang diterima
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("Done")
    });
  
    document.body.innerHTML = '<a data-nav href="/secret">Klik</a>';
    
    // 2. Pasang Listener untuk mencegat request
    document.addEventListener("z:before-request", (event) => {
      const { request } = event.detail;
      // Tambahkan header baru ke dalam objek request
      request.options.headers["Authorization"] = "Bearer MY_TOKEN";
      request.options.headers["X-Custom-Header"] = "Briz-Power";
    });
  
    // 3. Trigger Navigasi
    const nav = document.querySelector("[data-nav]");
    nav.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }));
  
    // 4. Assertion: Cek apakah fetch menerima header tersebut
    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Authorization": "Bearer MY_TOKEN",
            "X-Custom-Header": "Briz-Power",
            "Accept": "text/html" // Default header kamu tetap ada
          })
        })
      );
    });
  });
  
  it("harus memicu success dan after-request saat fetch berhasil", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<div>Success</div>")
    });
  
    const successSpy = vi.fn();
    const afterSpy = vi.fn();
  
    document.addEventListener("z:request-success", successSpy);
    document.addEventListener("z:after-request", afterSpy);
  
    // Trigger via form atau nav
    document.body.innerHTML = '<a data-nav href="/ok">Klik</a>';
    document.querySelector("a").dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }));
  
    await vi.waitFor(() => {
      // Cek success event
      expect(successSpy).toHaveBeenCalled();
      const successDetail = successSpy.mock.calls[0][0].detail;
      expect(successDetail.response.ok).toBe(true);
  
      // Cek after-request event
      expect(afterSpy).toHaveBeenCalled();
    });
  });
  
  it("harus memicu request-error saat server mengembalikan 500", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Server Meledak")
    });
  
    const errorSpy = vi.fn();
    document.addEventListener("z:request-error", errorSpy);
  
    document.body.innerHTML = '<a data-nav href="/fail">Klik</a>';
    document.querySelector("a").dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }));
  
    await vi.waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
      const detail = errorSpy.mock.calls[0][0].detail;
      
      // Pastikan pesan error dari server tertangkap
      expect(detail.error.message).toContain("Server Meledak");
    });
  });
  
  it("harus membatalkan request jika server tidak merespon dalam 10 detik", async () => {
    vi.useFakeTimers();
  
    // 1. Mock fetch yang merespon terhadap signal abort
    global.fetch = vi.fn().mockImplementation((url, { signal }) => {
      return new Promise((resolve, reject) => {
        // Jika timeout terjadi, signal akan trigger event 'abort'
        signal.addEventListener("abort", () => {
          const error = new Error("The operation was aborted");
          error.name = "AbortError";
          reject(error);
        });
      });
    });
  
    const errorSpy = vi.fn();
    document.addEventListener("z:request-error", errorSpy);
  
    document.body.innerHTML = '<a data-nav href="/slow">Klik</a>';
    const nav = document.querySelector("a");
    
    nav.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }));
  
    // 2. Majukan timer melampaui 10 detik
    await vi.advanceTimersByTimeAsync(10005);
  
    // 3. Pastikan urutan microtasks selesai
    await vi.waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
      const detail = errorSpy.mock.calls[0][0].detail;
      
      // Di kodemu: l("z:request-error", { request: u, error: f }, n.el)
      expect(detail.error.name).toBe("AbortError");
    });
  
    vi.useRealTimers();
  });
  
  it("harus membatalkan request sebelumnya jika URL yang sama diklik lagi", async () => {
    let abortSignal;
    global.fetch = vi.fn().mockImplementation((url, options) => {
      abortSignal = options.signal; // Ambil signal dari fetch
      return new Promise(() => {}); // Biarkan menggantung
    });
  
    document.body.innerHTML = '<a data-nav href="/test">Klik</a>';
    const nav = document.querySelector("a");
  
    // Klik pertama
    nav.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }));
    const signal1 = abortSignal;
  
    // Klik kedua (URL yang sama)
    nav.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }));
    const signal2 = abortSignal;
  
    // Signal pertama harusnya sudah 'aborted'
    expect(signal1.aborted).toBe(true);
    // Signal kedua harusnya masih aktif
    expect(signal2.aborted).toBe(false);
  });
  
  it("harus memicu event z:before-swap dan z:after-swap", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<div id="target" data-swap="result">Baru</div>')
    });
  
    document.body.innerHTML = `
      <form data-ajax action="/update">
        <button type="submit">Kirim</button>
      </form>
      <div id="target" data-swap="result">Lama</div>
    `;
  
    const beforeSpy = vi.fn();
    const afterSpy = vi.fn();
  
    document.addEventListener("z:before-swap", beforeSpy);
    document.addEventListener("z:after-swap", afterSpy);
  
    // Trigger form submit
    const form = document.querySelector("form");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  
    await vi.waitFor(() => {
      // 1. Pastikan event terpanggil
      expect(beforeSpy).toHaveBeenCalled();
      expect(afterSpy).toHaveBeenCalled();
  
      // 2. Cek apakah detailnya membawa elemen yang benar
      const afterDetail = afterSpy.mock.calls[0][0].detail;
      
      // Biasanya detail berisi elemen yang terlibat
      expect(afterDetail.el.textContent).toBe("Baru");
      expect(document.getElementById("target").textContent).toBe("Baru");
    });
  });
})

describe("mengetes fungsi Navigasi", () => {
  it("harus mengubah isi <body>", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(`
        <html>
          <head><title>about</title></head>
          <body><p>baru</p></body>
        </html>
      `)
    })
    
    const testUrl = `${window.location.origin}/about`
    
    document.documentElement.innerHTML = `
      <html>
        <head><title>home</title></head>
        <body>
          <h1>lama</h1>
          <a data-nav href="${testUrl}">pindah</a>
        </body>
      </html>
    `
    
    const nav = document.querySelector("[data-nav]")
    nav.dispatchEvent(new MouseEvent("click", { 
      bubbles: true, 
      cancelable: true, 
      button: 0 
    }))
    
    await vi.waitFor(() => {
      expect(document.title).toBe("about")
      expect(document.body.firstElementChild.tagName).toBe("P")
      expect(document.body.firstElementChild.textContent).toBe("baru")
    })
  })
  
  it("harus melakukan diffing pada meta tags di <head>", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(`
        <html>
          <head>
            <title>About Page</title>
            <meta name="description" content="Halaman Tentang Kami">
            <meta name="keywords" content="briz, spa, js">
          </head>
          <body><p>Konten Baru</p></body>
        </html>
      `)
    })
  
    document.head.innerHTML = `
      <title>Home Page</title>
      <meta name="description" content="Halaman Depan">
      <meta name="author" content="Gemini">
    `
    document.body.innerHTML = '<a data-nav href="/about">Pindah</a>'
  
    const nav = document.querySelector("[data-nav]")
    nav.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }))
  
    await vi.waitFor(() => {
      expect(document.title).toBe("About Page")
      const desc = document.querySelector('meta[name="description"]')
      expect(desc.getAttribute('content')).toBe("Halaman Tentang Kami")
      const keys = document.querySelector('meta[name="keywords"]')
      expect(keys.getAttribute('content')).toBe("briz, spa, js")
      const author = document.querySelector('meta[name="author"]')
      expect(author).toBeNull()
    })
  })
  
  it("harus memicu event lifecycle navigasi dengan urutan yang benar", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<title>About</title><body><p>Baru</p></body>")
    })
  
    document.body.innerHTML = '<a data-nav href="/about">Pindah</a>'
    
    const beforeSpy = vi.fn()
    const afterSpy = vi.fn()
  
    document.addEventListener("z:before-navigation", beforeSpy)
    document.addEventListener("z:after-navigation", afterSpy)
  
    const nav = document.querySelector("[data-nav]")
    nav.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }))
  
    await vi.waitFor(() => {
      expect(beforeSpy).toHaveBeenCalled()
      expect(afterSpy).toHaveBeenCalled()
      
      const beforeCallTime = beforeSpy.mock.invocationCallOrder[0]
      const afterCallTime = afterSpy.mock.invocationCallOrder[0]
      expect(beforeCallTime).toBeLessThan(afterCallTime)
    })
  })
})

describe("Streams test", () => {
  it("harus menjalankan polling dan memperbarui elemen secara berkala", async () => {
    vi.useFakeTimers();
  
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(`<div data-swap="poll">Update ${callCount}</div>`)
      });
    });
  
    document.body.innerHTML = `
      <div data-polling="/api/status" data-refresh="1s" data-swap="poll">Awal</div>
    `;
  
    // 1. Inisialisasi - Ini akan memicu fetch pertama secara instan
    document.dispatchEvent(new Event("DOMContentLoaded"));
    
    // Tunggu sejenak agar fetch pertama (instan) selesai
    await vi.advanceTimersByTimeAsync(0);
  
    await vi.waitFor(() => {
      expect(document.querySelector('[data-swap="poll"]').textContent).toBe("Update 1");
    });
  
    // 2. Majukan 1 detik untuk memicu fetch kedua
    await vi.advanceTimersByTimeAsync(1000);
  
    await vi.waitFor(() => {
      expect(document.querySelector('[data-swap="poll"]').textContent).toBe("Update 2");
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  
    vi.useRealTimers();
  });
})