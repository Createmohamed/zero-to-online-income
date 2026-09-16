/* ==========================================================================
   ZERO TO ONLINE INCOME — experience layer
   GSAP 3 + ScrollTrigger, native scroll only.

   01 CONFIG · 02 DOM · 03 HELPERS · 04 LOADER · 05 BOOK · 06 SCROLL EXPERIENCE
   07 CHAPTERS · 08 MICRO INTERACTIONS · 09 FAQ · 10 CTA · 11 REDUCED MOTION
   12 RESIZE / REFRESH · 13 INIT
   ========================================================================== */

/* --------------------------------------------------------------------------
   01 — CONFIG  (the only block you normally edit)
   -------------------------------------------------------------------------- */

/* Payment link. Set it ONCE here — every [data-buy] CTA reads it.
   While it is the placeholder, those buttons scroll to the price section. */
const PAYMENT_LINK = "https://solution73.gumroad.com/l/irofb";

/* Price shown on the page and counted up in the $19 section. */
const PRICE = { amount: 19, currency: "$" };

/* What the buyer actually receives. Only list what really ships. */
const PRODUCT_INCLUDES = [
  { title: "The complete playbook", text: "The full digital book, written to be used while you build." },
  { title: "The step-by-step sequence", text: "One ordered process: find, build, package, sell, repeat." },
  { title: "Instant digital access", text: "Delivered after purchase. Read it on phone, tablet or desktop." }
];

/* Optional image slots. The page is built to work with zero images —
   the book, the textures and the grain are CSS/SVG. Drop files into
   /assets/images/ and point an entry here to enable it. null = not rendered. */
const IMAGES = {
  bookCoverArt: "assets/images/book-cover-art.svg",   // artwork layered onto the 3D book cover
  ogImage: null,        // social share image (also set in <meta property="og:image">)
  voidTexture: null     // texture behind the opening section
};

/* --------------------------------------------------------------------------
   02 — DOM
   -------------------------------------------------------------------------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const dom = {
  loader:      null, loaderCount: null, loaderBar: null,
  nav:         null, navChapter:  null,
  burger:      null, menu:        null,
  actStage:    null, productStage: null,
  book:        null, cover:       null,
  productBook: null
};

/* --------------------------------------------------------------------------
   03 — HELPERS
   -------------------------------------------------------------------------- */
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const FINE_POINTER = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const isMobile = () => window.matchMedia("(max-width: 760px)").matches;

document.documentElement.classList.add("js");
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.addEventListener("beforeunload", () => window.scrollTo(0, 0));

function debounce(fn, ms) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

/* wrap each word in a mask so it can be revealed from below */
function splitWords(el) {
  if (!el || el.dataset.split) return;
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = "";
  words.forEach((word, i) => {
    const mask = document.createElement("span");
    mask.className = "w";
    const inner = document.createElement("i");
    inner.textContent = word;
    mask.appendChild(inner);
    el.appendChild(mask);
    if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
  });
  el.dataset.split = "true";
}

/* --------------------------------------------------------------------------
   04 — LOADER
   -------------------------------------------------------------------------- */
function runLoader(onDone) {
  document.body.classList.add("is-locked");
  const state = { v: 0 };
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    document.body.classList.remove("is-locked");
    dom.loader.style.display = "none";
    onDone();
  };

  // a tab loaded in the background pauses the GSAP ticker — never trap the page
  const guard = setTimeout(finish, 4200);

  gsap.to(state, {
    v: 100, duration: 1.4, ease: "power2.inOut",
    onUpdate() {
      const v = Math.round(state.v);
      dom.loaderCount.textContent = String(v).padStart(2, "0");
      dom.loaderBar.style.width = v + "%";
    },
    onComplete() {
      if (finished) return;
      document.body.classList.remove("is-locked");
      gsap.to(dom.loader.querySelector(".loader__inner"), { opacity: 0, duration: .35, ease: "power2.out" });
      gsap.to(dom.loader, {
        yPercent: -100, duration: 1, ease: "expo.inOut",
        onComplete() { clearTimeout(guard); finish(); }
      });
    }
  });
}

function hideLoaderInstantly() {
  document.body.classList.remove("is-locked");
  dom.loader.style.display = "none";
}

/* --------------------------------------------------------------------------
   05 — THE BOOK
   one object, moved between the acts that need it
   -------------------------------------------------------------------------- */
/* The book is stamped from one template. The opening act and the product
   section each get their own instance, so neither timeline can leave state
   on the other's object. */
function mountBook(stage) {
  const tpl = $("#bookTemplate");
  const node = tpl.content.firstElementChild.cloneNode(true);
  stage.appendChild(node);

  if (IMAGES.bookCoverArt) {
    const front = $(".book__front", node);
    front.style.backgroundImage =
      `linear-gradient(200deg, rgba(10,9,8,.6), rgba(10,9,8,.88)), url("${IMAGES.bookCoverArt}")`;
    front.style.backgroundSize = "cover";
    front.style.backgroundPosition = "center";
  }
  return node;
}

function mountBooks() {
  dom.book = mountBook(dom.actStage);
  dom.cover = $("[data-cover]", dom.book);
  dom.productBook = mountBook(dom.productStage);
}

/* --------------------------------------------------------------------------
   06 — SCROLL EXPERIENCE
   -------------------------------------------------------------------------- */

/* 01 · THE VOID — type is pushed apart and left behind */
function actVoid() {
  const lines = $$("[data-void-line]");

  const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
  gsap.set(lines.map(l => l.firstElementChild), { yPercent: 112, y: 0 });
  intro.to(lines.map(l => l.firstElementChild), { yPercent: 0, duration: 1.3, stagger: .09 }, 0)
       .from("[data-void-mark]", { opacity: 0, duration: 1 }, .5)
       .from("[data-void-scroll]", { opacity: 0, y: 16, duration: 1 }, .7)
       .from(".nav__inner > *", { opacity: 0, y: -14, duration: .8, stagger: .06 }, .4);

  const out = gsap.timeline({
    scrollTrigger: { trigger: ".void", start: "top top", end: "bottom bottom", scrub: .7 }
  });
  out.to(lines[0], { xPercent: -26, opacity: 0, ease: "power2.in" }, 0)
     .to(lines[1], { xPercent: 22, opacity: 0, ease: "power2.in" }, .05)
     .to(lines[2], { yPercent: 70, opacity: 0, ease: "power2.in" }, .1)
     .to("[data-void-scroll], [data-void-mark]", { opacity: 0, duration: .3 }, 0);
}

/* 02 · THE PROBLEM — statements arrive from different directions */
function actClaims() {
  const claims = $$("[data-claim]");
  const index = $("[data-claims-index]");
  const last = claims.length - 1;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".claims", start: "top top", end: "bottom bottom", scrub: .6,
      onUpdate: (self) => {
        const i = Math.min(last, Math.floor(self.progress * claims.length));
        index.textContent = String(i + 1).padStart(2, "0");
      }
    }
  });

  claims.forEach((claim, i) => {
    const words = $$(".cw", claim);
    const fromX = i % 2 === 0 ? -120 : 120;
    const fromY = i === last ? 90 : (i % 3 === 0 ? 60 : -60);

    tl.fromTo(claim, { opacity: 0 }, { opacity: 1, duration: .2, ease: "none" }, i)
      .fromTo(words,
        { x: fromX, y: fromY, opacity: 0, rotationZ: i % 2 ? 3 : -3 },
        { x: 0, y: 0, opacity: 1, rotationZ: 0, duration: .5, stagger: .06, ease: "power3.out" }, i);

    if (i !== last) {
      tl.to(words, { y: -50, opacity: 0, duration: .35, stagger: .03, ease: "power2.in" }, i + .68)
        .to(claim, { opacity: 0, duration: .2, ease: "none" }, i + .82);
    } else {
      tl.to(claim, { scale: 1.06, duration: .8, ease: "power1.inOut" }, i + .2);
    }
  });
}

/* 03 / 04 / 05 · THE BOOK APPEARS, OPENS AND SPEAKS */
function actBook() {
  const book = dom.book, cover = dom.cover;
  const spreads = $$("[data-spread] > *", book);
  const caps = $$(".act__cap");
  const print = $$("[data-print] li");
  const rail = $("[data-act-rail]");
  const takeover = $("[data-takeover]");
  const glow = $(".act__glow");

  gsap.set(spreads, { opacity: 0, y: 12 });
  gsap.set(print, { opacity: 0, x: isMobile() ? 0 : 40, y: isMobile() ? 24 : 0 });

  const openAngle = () => (isMobile() ? -150 : -158);
  const openShift = () => (isMobile() ? 24 : 30);
  const openScale = () => (isMobile() ? .68 : 1);
  const openDrop  = () => (isMobile() ? 60 : 0);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".act", start: "top top", end: "bottom bottom", scrub: .8,
      onUpdate: (self) => { if (rail) rail.style.width = (self.progress * 100) + "%"; }
    }
  });

  /* 1 — out of the dark, spine first */
  tl.fromTo(book,
    { opacity: 0, scale: .46, rotationX: 14, rotationY: -88, y: 90 },
    { opacity: 1, scale: .72, rotationX: 10, rotationY: -60, y: 30, duration: 1.1, ease: "power2.out" }, 0)
    .fromTo(glow, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "none" }, 0);

  /* 2 — the camera closes in, the cover turns to face the reader */
  tl.to(book, { scale: 1, rotationX: 6, rotationY: -22, y: 0, duration: 1, ease: "power1.inOut" }, 1.1);

  /* 3 — the cover opens */
  tl.to(cover, { rotationY: openAngle(), duration: 1.5, ease: "power2.inOut" }, 2.1)
    .to(book, { xPercent: openShift(), scale: openScale(), y: openDrop(), rotationY: -3, rotationX: 4, duration: 1.5, ease: "power2.inOut" }, 2.1)
    .to(spreads, { opacity: 1, y: 0, duration: .7, stagger: .08, ease: "power2.out" }, 3.0);

  /* 4 — what is printed inside is read out by the page */
  tl.to(print, { opacity: 1, x: 0, y: 0, duration: .5, stagger: .14, ease: "power3.out" }, 3.5);

  /* 5 — the page takes over and becomes the website */
  tl.to(print, { opacity: 0, duration: .35, stagger: .05, ease: "power2.in" }, 4.9)
    .to(book, { scale: .9, opacity: 0, duration: .6, ease: "power2.in" }, 4.95)
    .fromTo(takeover,
      { clipPath: "circle(0% at 60% 46%)" },
      { clipPath: "circle(125% at 60% 46%)", duration: 1, ease: "power2.inOut" }, 5.1)
    .fromTo(takeover.querySelector(".act__takeover-inner"),
      { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .6, ease: "power2.out" }, 5.5);

  /* captions */
  [[0, 1.05], [1.7, 2.7], [2.9, 3.45]].forEach(([inT, outT], i) => {
    tl.fromTo(caps[i], { opacity: 0 }, { opacity: 1, duration: .45, ease: "power2.out" }, inT)
      .to(caps[i], { opacity: 0, duration: .45, ease: "power2.in" }, outT);
  });

}

/* 06 · THE METHOD — oversized numbers drift against the type */
function actMethod() {
  $$("[data-stage-step]").forEach((stage) => {
    const num = $("[data-stage-n]", stage);
    const title = $(".stage__title", stage);
    const q = $(".stage__q", stage);
    const note = $(".stage__note", stage);

    gsap.fromTo(num, { yPercent: 26 }, {
      yPercent: -26, ease: "none",
      scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: .6 }
    });

    const reveal = gsap.timeline({ scrollTrigger: { trigger: stage, start: "top 74%" } });
    gsap.set($$(".w > i", title), { yPercent: 112, y: 0 });
    reveal.to($$(".w > i", title), { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: .04 }, 0)
          .from(q, { opacity: 0, y: 26, duration: .9, ease: "expo.out" }, .12)
          .from(note, { opacity: 0, y: 20, duration: .9, ease: "expo.out" }, .2)
          .from(num, { opacity: 0, duration: 1, ease: "power2.out" }, 0);
  });
}

/* 08 · THE TRANSFORMATION — one state wipes into the other */
function actShift() {
  const before = $("[data-shift-before]");
  const after = $("[data-shift-after]");
  const wipe = $("[data-shift-wipe]");
  const hint = $("[data-shift-hint]");

  const tl = gsap.timeline({
    scrollTrigger: { trigger: ".shift", start: "top top", end: "bottom bottom", scrub: .7 }
  });

  gsap.set($$("li", after), { yPercent: 110 });

  tl.from($$("li", before), { opacity: 0, yPercent: 60, duration: .5, stagger: .1, ease: "power3.out" }, 0)
    .to(wipe, { scaleY: 1, duration: .8, ease: "power2.inOut" }, 1.0)
    .to(before, { opacity: 0, scale: .86, duration: .4, ease: "power2.in" }, 1.05)
    .set(after, { opacity: 1 }, 1.3)
    .to($$("li", after), { yPercent: 0, duration: .6, stagger: .08, ease: "expo.out" }, 1.35)
    .to(hint, { opacity: 0, duration: .25 }, 1.0)
    .to(hint, { opacity: .55, duration: .35 }, 1.85);

  /* the hint changes wording as the wipe lands */
  ScrollTrigger.create({
    trigger: ".shift", start: "top top", end: "bottom bottom",
    onUpdate: (self) => {
      hint.textContent = self.progress > .5 ? "That is what the playbook builds" : "The difference is a process";
    }
  });
}

/* 09 · THE PRODUCT — the object returns, larger and calmer */
function actProduct() {
  gsap.fromTo(dom.productBook,
    { rotationY: -30, rotationX: 10, y: 50 },
    {
      rotationY: -12, rotationX: 4, y: -30, ease: "none",
      scrollTrigger: { trigger: ".product", start: "top bottom", end: "bottom top", scrub: .8 }
    });

  const copy = gsap.timeline({ scrollTrigger: { trigger: ".product__copy", start: "top 78%" } });
  gsap.set($$(".product__title .w > i"), { yPercent: 112, y: 0 });
  copy.to($$(".product__title .w > i"), { yPercent: 0, duration: 1.05, ease: "expo.out", stagger: .03 }, 0)
      .from(".product__sub, .product__for", { opacity: 0, y: 20, duration: .9, ease: "expo.out", stagger: .06 }, .15)
      .from(".product__gets li", { opacity: 0, y: 26, duration: .8, ease: "expo.out", stagger: .08 }, .3)
      .from(".product .btn", { opacity: 0, y: 20, duration: .8, ease: "expo.out" }, .5);
}

/* 10 · THE $19 DECISION */
function actDecision() {
  const el = $("[data-price]");
  const obj = { v: 0 };

  gsap.to(obj, {
    v: PRICE.amount, duration: 1.2, ease: "power2.out",
    onUpdate: () => { el.textContent = PRICE.currency + Math.round(obj.v); },
    scrollTrigger: { trigger: ".decision", start: "top 65%" }
  });

  gsap.from(el, {
    scale: .82, opacity: 0, duration: 1.2, ease: "expo.out",
    scrollTrigger: { trigger: ".decision", start: "top 68%" }
  });

  gsap.fromTo(el, { yPercent: 6 }, {
    yPercent: -6, ease: "none",
    scrollTrigger: { trigger: ".decision", start: "top bottom", end: "bottom top", scrub: .6 }
  });

  gsap.from(".decision__foot > *", {
    opacity: 0, y: 24, duration: .9, ease: "expo.out", stagger: .08,
    scrollTrigger: { trigger: ".decision__foot", start: "top 92%" }
  });
}

/* 11 · FINAL CTA */
function actEnd() {
  const lines = $$("[data-end-line]").map(l => l.firstElementChild);
  gsap.set(lines, { yPercent: 112, y: 0 });

  gsap.to(lines, {
    yPercent: 0, duration: 1.25, ease: "expo.out", stagger: .12,
    scrollTrigger: { trigger: ".end", start: "top 62%" }
  });

  gsap.from(".end__cta", {
    opacity: 0, y: 30, duration: 1, ease: "expo.out",
    scrollTrigger: { trigger: ".end", start: "top 45%" }
  });
}

/* generic small reveals (labels, one-liners) */
function smallReveals() {
  $$("[data-reveal-line]").forEach((el) => {
    gsap.from(el, {
      opacity: 0, y: 20, duration: .9, ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 92%" }
    });
  });

  $$(".faq__title").forEach((el) => {
    gsap.set($$(".w > i", el), { yPercent: 112, y: 0 });
    gsap.to($$(".w > i", el), {
      yPercent: 0, duration: 1.05, ease: "expo.out", stagger: .03,
      scrollTrigger: { trigger: el, start: "top 88%" }
    });
  });

  $$(".qa").forEach((qa) => {
    gsap.from(qa, {
      opacity: 0, y: 22, duration: .8, ease: "expo.out",
      scrollTrigger: { trigger: qa, start: "top 92%" }
    });
  });
}

/* --------------------------------------------------------------------------
   07 — CHAPTERS
   -------------------------------------------------------------------------- */
function initChapters() {
  const beats = $$("[data-beat]");
  const num = $("[data-journey-num]");
  const title = $("[data-journey-title]");
  const line = $("[data-journey-line]");
  const items = $$("[data-journey-list] li");

  const show = (beat, i) => {
    const swap = gsap.timeline({ defaults: { duration: .4, ease: "power2.out" } });
    swap.to([num, title, line], { opacity: 0, y: -14, duration: .25, stagger: .02 })
        .add(() => {
          num.textContent = beat.dataset.num;
          title.textContent = beat.dataset.title;
          line.textContent = beat.dataset.line;
        })
        .fromTo([num, title, line], { opacity: 0, y: 18 }, { opacity: 1, y: 0, stagger: .05 });

    items.forEach((li, j) => li.classList.toggle("is-on", j === i));
  };

  beats.forEach((beat, i) => {
    ScrollTrigger.create({
      trigger: beat, start: "top center", end: "bottom center",
      onToggle: (self) => { if (self.isActive) show(beat, i); }
    });
  });

  items[0].classList.add("is-on");
}

/* --------------------------------------------------------------------------
   08 — MICRO INTERACTIONS
   -------------------------------------------------------------------------- */
function initNav() {
  const nav = dom.nav;
  const label = dom.navChapter;

  const names = {
    ".void": "", ".claims": "The problem", ".act": "The book", ".method": "The method",
    ".journey": "Chapters", ".shift": "Before / after", ".product": "The product",
    ".faq": "Questions", ".decision": "$19", ".end": ""
  };

  $$("[data-theme]").forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec, start: "top top+=64", end: "bottom top+=64",
      onToggle: (self) => {
        if (!self.isActive) return;
        const theme = sec.dataset.theme;
        nav.classList.toggle("is-light", theme === "cream");
        nav.classList.toggle("is-ember", theme === "ember");

        const key = Object.keys(names).find(k => sec.matches(k));
        const text = key ? names[key] : "";
        label.textContent = text;
        label.classList.toggle("is-on", !!text);
      }
    });
  });

  let last = 0;
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: (self) => {
      const y = self.scroll();
      if (y > 500 && y > last + 6) nav.classList.add("is-hidden");
      else if (y < last - 6) nav.classList.remove("is-hidden");
      last = y;
    }
  });
}

function initCursor() {
  if (!FINE_POINTER) return;
  const cur = $(".cursor");
  const dot = $(".cursor__dot", cur);
  const ring = $(".cursor__ring", cur);

  const dx = gsap.quickTo(dot, "x", { duration: .12, ease: "power3.out" });
  const dy = gsap.quickTo(dot, "y", { duration: .12, ease: "power3.out" });
  const rx = gsap.quickTo(ring, "x", { duration: .45, ease: "power3.out" });
  const ry = gsap.quickTo(ring, "y", { duration: .45, ease: "power3.out" });

  window.addEventListener("pointermove", (e) => {
    gsap.set(cur, { opacity: 1 });
    dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
  }, { passive: true });

  $$("a, button, .qa__q, .stage, .journey__list li").forEach((el) => {
    el.addEventListener("pointerenter", () => cur.classList.add("is-hot"));
    el.addEventListener("pointerleave", () => cur.classList.remove("is-hot"));
  });
}

function initMagnetic() {
  if (!FINE_POINTER) return;
  $$(".magnetic").forEach((el) => {
    const x = gsap.quickTo(el, "x", { duration: .5, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: .5, ease: "power3.out" });
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * .3);
      y((e.clientY - (r.top + r.height / 2)) * .4);
    });
    el.addEventListener("pointerleave", () => { x(0); y(0); });
  });
}

/* the book leans very slightly into the scroll — the inner body only,
   so it never fights the timelines that own .book */
function initBookInertia() {
  const bodies = [dom.book, dom.productBook].filter(Boolean).map(b => $(".book__body", b));
  if (!bodies.length) return;

  // smoothed through a plain object, written out as a CSS variable, so the
  // lean never touches the transforms the scroll timelines own
  const state = { v: 0 };
  const apply = () => bodies.forEach(b => b.style.setProperty("--lean", state.v.toFixed(2) + "deg"));
  const lean = gsap.quickTo(state, "v", { duration: .6, ease: "power3.out", onUpdate: apply });

  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: (self) => lean(gsap.utils.clamp(-3.2, 3.2, self.getVelocity() / -420))
  });
}

function initMenu() {
  const burger = dom.burger, menu = dom.menu;

  const close = () => {
    menu.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("is-locked");
    setTimeout(() => { if (!menu.classList.contains("is-open")) menu.hidden = true; }, 700);
  };

  burger.addEventListener("click", () => {
    if (burger.getAttribute("aria-expanded") === "true") { close(); return; }
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add("is-open"));
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Close menu");
    document.body.classList.add("is-locked");
  });

  menu.querySelectorAll("a").forEach(a => a.addEventListener("click", close));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

/* --------------------------------------------------------------------------
   09 — FAQ
   -------------------------------------------------------------------------- */
function initFaq() {
  const setHeight = (panel, h) => {
    if (window.gsap && !REDUCED) {
      gsap.to(panel, {
        height: h, duration: .55, ease: "expo.out",
        onComplete() {
          if (h !== 0) panel.style.height = "auto";
          if (window.ScrollTrigger) ScrollTrigger.refresh();
        }
      });
    } else {
      panel.style.height = h === 0 ? "0px" : "auto";
    }
  };

  $$(".qa").forEach((qa) => {
    const btn = $(".qa__q", qa);
    const panel = $(".qa__a", qa);
    const id = "qa-" + Math.random().toString(36).slice(2, 8);
    panel.id = id;
    panel.setAttribute("role", "region");
    btn.setAttribute("aria-controls", id);

    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";

      $$(".qa").forEach((other) => {
        if (other === qa) return;
        const ob = $(".qa__q", other);
        if (ob.getAttribute("aria-expanded") === "true") {
          ob.setAttribute("aria-expanded", "false");
          setHeight($(".qa__a", other), 0);
        }
      });

      btn.setAttribute("aria-expanded", String(!open));
      setHeight(panel, open ? 0 : panel.scrollHeight);
    });
  });
}

/* --------------------------------------------------------------------------
   10 — CTA / CONFIG APPLICATION
   -------------------------------------------------------------------------- */
function applyConfig() {
  const linkSet = PAYMENT_LINK && PAYMENT_LINK !== "YOUR_PAYMENT_LINK_HERE";
  $$("[data-buy]").forEach((el) => {
    if (linkSet) { el.setAttribute("href", PAYMENT_LINK); el.setAttribute("rel", "noopener"); }
  });

  const price = $("[data-price]");
  if (price) price.textContent = PRICE.currency + PRICE.amount;

  const gets = $("[data-gets]");
  if (gets) {
    gets.innerHTML = PRODUCT_INCLUDES.map((item, i) => `
      <li>
        <em class="mono">${String(i + 1).padStart(2, "0")}</em>
        <span><b>${item.title}</b><p>${item.text}</p></span>
      </li>`).join("");
  }

  if (IMAGES.voidTexture) {
    const v = $(".void__sticky");
    v.style.backgroundImage = `linear-gradient(rgba(10,10,10,.82), rgba(10,10,10,.94)), url("${IMAGES.voidTexture}")`;
    v.style.backgroundSize = "cover";
    v.style.backgroundPosition = "center";
  }
}

/* --------------------------------------------------------------------------
   11 — REDUCED MOTION
   static composition, every word and CTA still reachable
   -------------------------------------------------------------------------- */
function initStatic() {
  document.body.classList.add("is-static");
  hideLoaderInstantly();
  mountBooks();

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const theme = e.target.dataset.theme;
      dom.nav.classList.toggle("is-light", theme === "cream");
      dom.nav.classList.toggle("is-ember", theme === "ember");
    });
  }, { rootMargin: "-64px 0px -85% 0px" });
  $$("[data-theme]").forEach(s => io.observe(s));

  /* the chapter panel is hidden in reduced motion; the full list stays visible */
  $$("[data-journey-list] li").forEach(li => li.classList.add("is-on"));
}

/* --------------------------------------------------------------------------
   12 — RESIZE / REFRESH
   -------------------------------------------------------------------------- */
function initRefresh() {
  const refresh = debounce(() => ScrollTrigger.refresh(), 220);
  window.addEventListener("resize", refresh);
  window.addEventListener("orientationchange", refresh);

  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(refresh);
    ro.observe(document.body);
  }
}

/* --------------------------------------------------------------------------
   13 — INIT
   -------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  dom.loader = $("#loader");
  dom.loaderCount = $("#loaderCount");
  dom.loaderBar = $("#loaderBar");
  dom.nav = $("#nav");
  dom.navChapter = $("[data-nav-chapter]");
  dom.burger = $("#burger");
  dom.menu = $("#menu");
  dom.actStage = $('[data-stage="act"]');
  dom.productStage = $('[data-stage="product"]');

  applyConfig();
  initMenu();
  initFaq();

  if (REDUCED || !window.gsap || !window.ScrollTrigger) { initStatic(); return; }

  $$("[data-reveal-words]").forEach(splitWords);
  mountBooks();

  runLoader(startExperience);
});

function startExperience() {
  gsap.registerPlugin(ScrollTrigger);

  actVoid();
  actClaims();
  actBook();
  actMethod();
  initChapters();
  actShift();
  actProduct();
  actDecision();
  actEnd();
  smallReveals();

  initNav();
  initCursor();
  initMagnetic();
  initBookInertia();
  initRefresh();

  ScrollTrigger.refresh();
}
