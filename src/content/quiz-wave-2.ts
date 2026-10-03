import type { Level, Question } from "@/lib/types";

const mdn = [{ site: "mdn", url: "https://developer.mozilla.org/en-US/docs/Web" }];
const react = [{ site: "react-dev", url: "https://react.dev/reference/react" }];
const ts = [{ site: "typescript", url: "https://www.typescriptlang.org/docs/handbook/intro.html" }];
const owasp = [{ site: "owasp", url: "https://cheatsheetseries.owasp.org/" }];

type Refs = typeof mdn;

/** Rotate the correct answer through a/b/c/d so it is not always in the same slot. */
function position(topic: string): number {
  let hash = 0;
  for (const char of topic) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % 4;
}

function q(input: {
  topic: string;
  title: string;
  level: Level;
  tags: string[];
  prompt: string;
  hints: [string, string];
  approach: string;
  solution: string;
  notes: string;
  correct: string;
  wrong: [string, string, string];
  refs?: Refs;
}): Question {
  const labels = [...input.wrong];
  labels.splice(position(input.topic), 0, input.correct);
  const ids = ["a", "b", "c", "d"];
  return {
    id: `wave2-${input.topic}`,
    track: "quiz",
    level: input.level,
    title: input.title,
    tags: input.tags,
    status: "ready",
    canonicalTopic: input.topic,
    prompt: input.prompt,
    hints: input.hints,
    approach: input.approach,
    solution: input.solution,
    interviewerNotes: input.notes,
    sourceRefs: input.refs ?? mdn,
    options: labels.map((label, i) => ({
      id: ids[i],
      label,
      ...(label === input.correct ? { correct: true } : {}),
    })),
  };
}

export const quizWave2: Question[] = [
  q({
    topic: "explain-event-capturing-vs-bubbling",
    title: "Explain event capturing vs bubbling",
    level: "beginner",
    tags: ["dom", "events"],
    prompt: "A click on a button inside a div fires listeners on both. In what order can they run, and how do you choose?",
    hints: ["An event travels down to the target and then back up.", "The third argument to addEventListener (or { capture: true }) chooses the phase."],
    approach: "Name the three phases, say which one listeners use by default, and mention the events that do not bubble.",
    solution:
      "A DOM event has three phases. Capture runs from `window` down to the parent of the target. The target phase runs on the element itself. Bubble runs back up from the target to `window`. Listeners run in the bubble phase by default. Pass `{ capture: true }` to run in the capture phase, which fires before any bubble listener on a descendant. Not every event bubbles: `focus`, `blur`, `mouseenter`, and `mouseleave` do not, which is why `focusin` and `focusout` exist for delegation. Event delegation depends on bubbling: one listener on a list sees clicks from every row. `stopPropagation()` ends the journey at the current node in either direction.",
    notes: "A strong answer mentions delegation and the events that do not bubble. “Bubbling goes up, capturing goes down” alone is thin.",
    correct: "Capture runs from window down to the target, then bubble runs back up. Listeners default to the bubble phase",
    wrong: [
      "Bubbling runs first from the target up to window, and capturing runs afterwards from window down to the target",
      "Only one phase ever runs for a given event, chosen by whichever listener was added to the DOM first",
      "Capturing is the default phase for addEventListener, and bubbling listeners need a special flag to be enabled",
    ],
  }),
  q({
    topic: "what-is-stoppropagation-vs-preventdefault",
    title: "What is stopPropagation vs preventDefault?",
    level: "beginner",
    tags: ["dom", "events"],
    prompt: "A link inside a clickable card should not navigate, and the card should not also handle the click. Which calls do you need?",
    hints: ["One controls where the event travels. The other controls what the browser does afterward.", "Neither implies the other."],
    approach: "Define each in one sentence, show that they are independent, then mention stopImmediatePropagation and passive listeners.",
    solution:
      "`preventDefault()` cancels the browser’s default action for a cancelable event: following a link, submitting a form, or toggling a checkbox. The event still propagates. `stopPropagation()` stops the event reaching other nodes on its path. The default action still happens. For the link-in-card case you need both only if you want no navigation and no card handler. `stopImmediatePropagation()` also blocks the remaining listeners on the same element. A listener registered with `{ passive: true }` promises not to call `preventDefault()`, and the call is ignored. `return false` does nothing in a plain `addEventListener` handler. Stopping propagation breaks delegated listeners and analytics higher up, so prefer checking `event.target` over silencing the event.",
    notes: "The mistake is treating them as synonyms. Bonus for noting that stopping propagation has side effects on delegation.",
    correct: "preventDefault cancels the default action; stopPropagation stops the event reaching other nodes. They are independent",
    wrong: [
      "stopPropagation cancels the browser’s default action such as navigation, and preventDefault stops the event bubbling up",
      "They are aliases of each other, so calling either one both cancels the default action and stops propagation",
      "preventDefault removes the listener from the element, and stopPropagation removes the element from the DOM",
    ],
  }),
  q({
    topic: "explain-defer-vs-async-attributes",
    title: "Explain defer vs async attributes",
    level: "beginner",
    tags: ["browser", "performance"],
    prompt: "Two external scripts depend on each other. Which attribute keeps them in order without blocking HTML parsing?",
    hints: ["Both download in parallel with parsing.", "Only one of them preserves document order."],
    approach: "Compare download, execution timing, and ordering for classic scripts, then note that module scripts defer by default.",
    solution:
      "A plain `<script src>` blocks parsing while it downloads and runs. `async` downloads in parallel and runs as soon as it arrives, which can interrupt parsing, and the order among async scripts is not guaranteed. `defer` downloads in parallel and runs after the document is parsed, just before `DOMContentLoaded`, in document order. So two dependent scripts want `defer`. Both attributes only apply to external classic scripts. Module scripts (`type=\"module\"`) are deferred by default. Use `async` for independent scripts such as analytics that do not touch the DOM or other scripts. Put the script at the end of the body only if you cannot use `defer`.",
    notes: "Order is the discriminator. Many candidates say “async is faster” without saying what it costs.",
    correct: "defer: parallel download, runs after parsing in document order. async: runs when ready, in any order",
    wrong: [
      "async downloads in parallel and preserves document order, while defer runs the script before parsing continues",
      "Both block HTML parsing until the script has downloaded and run; they only differ in how caching works",
      "defer works on inline scripts and async works only on module scripts, so ordering is the same for both",
    ],
  }),
  q({
    topic: "what-does-array-prototype-sort-mutate",
    title: "What does Array.prototype.sort mutate?",
    level: "beginner",
    tags: ["javascript", "arrays"],
    prompt: "A React component calls `items.sort(...)` on a prop. What goes wrong, and what is the fix?",
    hints: ["Read the return value carefully.", "ES2023 added non-mutating versions."],
    approach: "Say it sorts in place, returns the same array, and explain the default string comparison. Offer copy-then-sort or toSorted.",
    solution:
      "`sort` mutates the array in place and returns a reference to the same array, so `const sorted = items.sort(fn)` makes `sorted === items`. Sorting a prop or state array this way mutates data you do not own, and React may skip an update because the reference did not change. Copy first (`[...items].sort(fn)`) or use `items.toSorted(fn)` (ES2023), which returns a new array. Without a comparator the default order converts values to strings, so `[10, 2, 1].sort()` gives `[1, 10, 2]`. Pass `(a, b) => a - b` for numbers. `sort` is stable in modern engines, so equal elements keep their relative order.",
    notes: "Listen for the default string comparison and the stability point, not only the mutation.",
    correct: "It sorts in place and returns the same array; copy first or use toSorted",
    wrong: [
      "It returns a new sorted array and leaves the original untouched, so no copy is needed",
      "It sorts a shallow copy of the first level only, so nested arrays keep their original order",
      "It mutates only arrays of numbers; arrays of strings are copied before sorting, so they are safe",
    ],
  }),
  q({
    topic: "what-is-the-difference-between-for-of-and-for-in",
    title: "What is the difference between for...of and for...in?",
    level: "beginner",
    tags: ["javascript", "iteration"],
    prompt: "You loop over an array with `for (const x in arr)` and get strings like \"0\", \"1\". Why, and what should you use?",
    hints: ["One walks keys. The other walks values from an iterator.", "Inherited enumerable properties show up in one of them."],
    approach: "State what each iterates, mention the prototype chain, then list which to use for arrays, objects, Maps, and strings.",
    solution:
      "`for...in` iterates the enumerable string keys of an object, including inherited ones, so on an array it yields index strings and can surface properties added to a prototype. `for...of` iterates the values produced by an object’s iterator, so it works on arrays, strings, Maps, Sets, NodeLists, and generators, but throws on a plain object because it is not iterable. Use `for...of` for arrays and other iterables. For an object’s own keys, use `Object.keys`, `Object.values`, or `Object.entries`. Use `for...in` rarely, and pair it with `Object.hasOwn` if you must. `forEach` cannot `break` or `await` in sequence, and `for...of` can.",
    notes: "A good answer mentions inherited keys and that plain objects are not iterable.",
    correct: "for...in walks enumerable keys, including inherited ones. for...of walks the values of an iterable",
    wrong: [
      "for...in walks the values of an array and for...of walks its keys, so for...of returns index strings",
      "They are identical in behaviour, except that for...of is faster and only works on arrays and strings",
      "for...of works on plain objects and for...in works only on arrays, so use for...in to read array values",
    ],
  }),
  q({
    topic: "explain-abortcontroller",
    title: "Explain AbortController",
    level: "mid",
    tags: ["javascript", "networking"],
    prompt: "A search box fires a fetch on every keystroke and an older, slower response overwrites a newer one. How does AbortController help?",
    hints: ["The controller owns a signal that you pass to the work.", "An aborted fetch rejects with a specific error you should not treat as a failure."],
    approach: "Show create, pass the signal, abort on the next call or unmount, and ignore the AbortError. Mention AbortSignal.timeout and addEventListener signals.",
    solution:
      "`new AbortController()` gives you a `signal` to pass to `fetch` and an `abort()` method. Calling `abort()` rejects the pending fetch with a `DOMException` named `AbortError`, and the browser can cancel the request. For a search box, keep the previous controller, abort it before starting a new request, and catch `AbortError` quietly so it is not shown as an error. In a React effect, return a cleanup that aborts so an unmounted component never sets state. `AbortSignal.timeout(ms)` builds a signal that aborts on its own, and `AbortSignal.any([a, b])` combines signals. The same signal works with `addEventListener(type, fn, { signal })` to remove many listeners at once. Aborting does not guarantee the server stopped working. It only stops the client waiting.",
    notes: "Look for ignoring the AbortError and the cleanup pattern. Saying it “cancels the request on the server” is wrong.",
    correct: "Pass its signal to fetch and abort the previous one; the old fetch rejects with AbortError",
    wrong: [
      "It pauses the in-flight request and resumes it when you call controller.resume() after the user stops typing",
      "It guarantees the server stops processing the request as soon as the signal fires, which saves server work",
      "It only works with XMLHttpRequest and cannot be passed to fetch, so you need a library for fetch requests",
    ],
  }),
  q({
    topic: "what-is-queuemicrotask",
    title: "What is queueMicrotask?",
    level: "mid",
    tags: ["javascript", "event-loop"],
    prompt: "`setTimeout(a, 0)`, `Promise.resolve().then(b)`, and `queueMicrotask(c)` are all scheduled in that order. Which runs first, and why?",
    hints: ["Microtasks drain completely after the current script, before the next task.", "Promise reactions use the same queue."],
    approach: "Order the call stack, microtask queue, and task queue. Then explain the starvation risk of a microtask that schedules itself.",
    solution:
      "`queueMicrotask(fn)` adds `fn` to the microtask queue. After the running script finishes, the engine drains the whole microtask queue before it takes the next task (a timer, an input event) or paints. Promise reactions are microtasks in the same queue, so `b` runs before `c` because it was queued first, and both run before the `setTimeout` callback `a`. Use `queueMicrotask` to defer work until the current synchronous code completes without waiting for a timer. A microtask that schedules another microtask forever starves rendering and input, because the queue never empties. `setTimeout(0)` yields to the browser; a microtask does not.",
    notes: "Check that they know promises and queueMicrotask share one queue and that timers wait for it to drain.",
    correct: "Microtasks run first, in queue order: the promise callback, then queueMicrotask, then the timeout",
    wrong: [
      "The setTimeout callback runs first, because a delay of zero milliseconds means it runs immediately",
      "queueMicrotask runs after the setTimeout callback but before the promise callback, using a separate queue",
      "They run in parallel on separate threads, so the output order is not deterministic from run to run",
    ],
  }),
  q({
    topic: "explain-requestanimationframe",
    title: "Explain requestAnimationFrame",
    level: "mid",
    tags: ["javascript", "performance"],
    prompt: "You animate an element by changing its style from a `setInterval`. It stutters. Why is requestAnimationFrame better?",
    hints: ["It is tied to the display’s refresh, not to a wall-clock timer.", "It pauses when the tab is hidden."],
    approach: "Explain when the callback runs, why intervals drift, and how to use the timestamp. Mention batching reads and writes.",
    solution:
      "`requestAnimationFrame(cb)` runs `cb` once before the browser’s next repaint, passing a high-resolution timestamp. It lines up with the display refresh (often 60 Hz), so a visual update lands once per frame instead of at an arbitrary time that may fall between frames and be dropped or doubled. It pauses in background tabs, saving CPU and battery. For a loop, call it again from inside the callback and use `cancelAnimationFrame` to stop. Derive progress from the timestamp, not a counter, so speed does not depend on frame rate. Read layout first and write style after inside the callback to avoid forced reflow. Do not use it for non-visual timing such as polling.",
    notes: "Elapsed-time math and tab pausing are the differentiators.",
    correct: "It runs before the next repaint, aligned with the display and paused in hidden tabs",
    wrong: [
      "It runs exactly every 16.7 ms like a timer, and keeps running at the same rate in hidden tabs",
      "It runs the callback on a worker thread, so the main thread stays free while the animation updates",
      "It runs just after paint, so the user always sees the old frame once before the new one appears",
    ],
  }),
  q({
    topic: "explain-web-workers",
    title: "Explain Web Workers",
    level: "senior",
    tags: ["javascript", "performance"],
    prompt: "A CSV import freezes the UI for two seconds. Can a worker fix it, and what does it cost?",
    hints: ["Workers cannot touch the DOM.", "Data moves by copying unless you transfer it."],
    approach: "Say what runs where, how messages move, transferables, and when a worker is not worth it.",
    solution:
      "A Web Worker runs a script on a separate thread with its own event loop, so a long computation does not block rendering or input. It has no DOM, no `window`, and shares no variables with the page. The two sides communicate with `postMessage`, and data is copied with the structured clone algorithm. Large `ArrayBuffer`s can be transferred, which moves ownership without a copy. `SharedArrayBuffer` allows shared memory but requires cross-origin isolation. A worker pays a startup cost and a copy cost, so it helps for CPU-heavy work such as parsing, hashing, or image processing and not for a few milliseconds of work. Module workers (`new Worker(url, { type: \"module\" })`) can use imports. Terminate with `worker.terminate()` when done.",
    notes: "Listen for “no DOM” and the transfer-versus-copy trade-off. A candidate who claims workers speed up any code is guessing.",
    correct: "A separate thread with no DOM that talks to the page by postMessage, copying data unless transferred",
    wrong: [
      "A second thread that shares the page’s variables and can edit the DOM directly, so no messages are needed",
      "A background tab that keeps running timers at full speed after the user switches away from the page",
      "A service that intercepts network requests and caches the responses so the page can work while offline",
    ],
  }),
  q({
    topic: "what-is-websocket-vs-sse",
    title: "What is WebSocket vs SSE?",
    level: "senior",
    tags: ["networking", "realtime"],
    prompt: "You need live price updates pushed to the browser, with no messages back. Which transport, and what are the trade-offs?",
    hints: ["One is full duplex. The other rides plain HTTP in one direction.", "Think about reconnect, headers, and proxies."],
    approach: "Compare direction, protocol, reconnect behavior, data types, and auth. Pick SSE for one-way and say why.",
    solution:
      "A WebSocket is a persistent, full-duplex connection after an HTTP upgrade. It carries text or binary frames in both directions, but you own reconnection, backoff, heartbeats, and message framing. Server-Sent Events is a one-way stream of text events from server to client over ordinary HTTP. `EventSource` reconnects automatically and resumes with `Last-Event-ID`. It works well with HTTP/2 and existing auth cookies, but it cannot set custom request headers and it is text only. For live prices with no client messages, SSE is simpler. Choose a WebSocket for chat, collaboration, or games where the client sends frequently or you need binary. Over HTTP/1.1 browsers cap connections per origin, which limits many SSE tabs.",
    notes: "The right answer depends on direction. Penalize “WebSocket is always better.” Credit mentioning reconnect and header limits.",
    correct: "SSE for one-way server push over HTTP with auto-reconnect. WebSocket for two-way or binary traffic",
    wrong: [
      "WebSocket for one-way server push over plain HTTP, and SSE for two-way chat with binary frames",
      "They are the same protocol exposed under two JavaScript names, so the choice is only a matter of style",
      "SSE supports binary frames and custom request headers, while WebSocket supports only text and no headers",
    ],
  }),
  q({
    topic: "what-is-the-difference-between-cookie-samesite-values",
    title: "What is the difference between cookie SameSite values?",
    level: "mid",
    tags: ["security", "cookies"],
    prompt: "A user clicks a link to your site from an email. Their session cookie is missing on the first request. Which SameSite value caused it?",
    hints: ["“Site” means the registrable domain, not the origin.", "One value allows cookies on top-level navigations."],
    approach: "Define same-site, then walk Strict, Lax, and None, including the Secure requirement and the browser default.",
    solution:
      "SameSite controls whether a cookie is sent on cross-site requests. A site is the registrable domain (eTLD+1), so `app.example.com` and `api.example.com` are same-site even though they are different origins. `Strict` never sends the cookie cross-site, including when a user follows a link from another site, which is why they can look signed out on arrival. `Lax` sends it on top-level navigations that use safe methods such as GET, but not on cross-site subrequests, iframes, or POST forms. `None` sends it everywhere and requires `Secure`. Browsers treat a cookie with no attribute as `Lax`. Lax is a good default session cookie and blocks most CSRF, but it is not a complete defense on its own.",
    notes: "Check that they separate site from origin. Many say “same-origin” and get the subdomain case wrong.",
    correct: "Strict, which is not sent on any cross-site request, including a followed link",
    wrong: [
      "None, which is never sent on cross-site requests, so it is the safest choice for embedded widgets",
      "Lax, which is never sent on a top-level navigation, only on subresource requests like images",
      "HttpOnly, which hides the cookie from the server and keeps it available only to page scripts",
    ],
    refs: owasp,
  }),
  q({
    topic: "explain-httponly-and-secure-cookie-flags",
    title: "Explain HttpOnly and Secure cookie flags",
    level: "mid",
    tags: ["security", "cookies"],
    prompt: "What does each flag protect against, and what does neither protect against?",
    hints: ["One concerns scripts. The other concerns the network.", "Think about what an XSS payload can still do."],
    approach: "Define each, then state the limit: HttpOnly stops reading the token, not using it.",
    solution:
      "`HttpOnly` hides the cookie from `document.cookie`, so an injected script cannot read and exfiltrate a session token. `Secure` makes the browser send the cookie only over HTTPS, so it is not exposed on a plain-HTTP request (localhost is an exception in browsers). Together with `SameSite` they form the baseline for a session cookie. Neither stops XSS itself. A script running on your page can still make authenticated requests, because the browser attaches the cookie automatically. The `__Host-` prefix adds a rule that the cookie must be `Secure`, have `Path=/`, and carry no `Domain`, which blocks a subdomain from overwriting it. Set an expiry that matches your session policy.",
    notes: "The key insight is “cannot read” versus “cannot use.” Candidates who say HttpOnly prevents XSS are wrong.",
    correct: "HttpOnly blocks script access to the cookie; Secure limits it to HTTPS. Neither prevents XSS from acting as the user",
    wrong: [
      "HttpOnly encrypts the cookie value in the browser, and Secure adds a signature that prevents tampering",
      "Secure blocks script access to the cookie, and HttpOnly forces the cookie to be sent only over HTTPS",
      "Together they make XSS harmless, because an attacker script can no longer act on the user’s behalf",
    ],
    refs: owasp,
  }),
  q({
    topic: "what-is-jwt-storage-risk-on-the-frontend",
    title: "What is JWT storage risk on the frontend?",
    level: "mid",
    tags: ["security", "auth"],
    prompt: "Where should a single-page app keep its access token, and what are the trade-offs of each place?",
    hints: ["Anything JavaScript can read, XSS can read.", "A cookie brings CSRF back."],
    approach: "Compare localStorage, an HttpOnly cookie, and memory, then describe the common split: short access token in memory, refresh token in an HttpOnly cookie.",
    solution:
      "`localStorage` and `sessionStorage` are readable by any script on the page, so one XSS bug can steal a long-lived token. An `HttpOnly` cookie cannot be read by script, but the browser sends it automatically, so you need `SameSite` and CSRF protection. Holding the access token in memory removes persistent theft, but the token is lost on reload. A common compromise is a short-lived access token in memory and a refresh token in an `HttpOnly`, `Secure`, `SameSite` cookie scoped to the refresh endpoint, with rotation. On reload the app calls refresh to get a new access token. None of this replaces fixing XSS, because a script can still call the API while the page is open. Keep token lifetimes short and never put secrets in the JWT payload; it is only encoded, not encrypted.",
    notes: "No storage is perfect. Reward naming the threat each one trades for and the rotation detail.",
    correct: "Any script-readable store exposes it to XSS; prefer a short-lived in-memory token with an HttpOnly refresh cookie",
    wrong: [
      "localStorage is the safest place, because it is never sent automatically and scripts cannot read it",
      "A JWT is encrypted by default, so the storage location makes no difference to how exposed it is",
      "Cookies are always safer than any other store and need no CSRF defence when marked HttpOnly",
    ],
    refs: owasp,
  }),
  q({
    topic: "explain-postmessage-and-origin-checks",
    title: "Explain postMessage and origin checks",
    level: "senior",
    tags: ["security", "browser"],
    prompt: "Your page embeds a widget in an iframe and talks to it with postMessage. What must you check on each side?",
    hints: ["Two origins are involved: where you send and where a message came from.", "Never trust the shape of the data."],
    approach: "Cover targetOrigin when sending, event.origin when receiving, event.source, and validating the payload.",
    solution:
      "`window.postMessage(data, targetOrigin)` sends a structured-cloneable message across windows, frames, or workers. When sending, pass the exact `targetOrigin` instead of `\"*\"`, otherwise a navigated frame could receive the data. When receiving, compare `event.origin` to an allow-list with strict equality (not `includes` or `endsWith`), and check `event.source` is the window you expect. Then validate the payload shape, because the sender may be compromised or buggy. Never `eval` message data or write it into the DOM as HTML. Remove listeners you no longer need. For a sandboxed iframe with no `allow-same-origin`, the origin is `\"null\"`, so give such frames a dedicated channel or a `MessageChannel` port.",
    notes: "Strict origin equality is the test. “I check that it is from our domain” with an `indexOf` is a known bug class.",
    correct: "Send to an exact targetOrigin, verify event.origin by strict allow-list on receive, and validate the data",
    wrong: [
      "Use * as the targetOrigin, because the browser filters out unsafe senders on the receiving side for you",
      "Checking that event.origin contains your domain name as a substring is a sufficient origin check",
      "Origin checks are only needed for messages sent to workers, not for messages between windows or iframes",
    ],
    refs: owasp,
  }),
  q({
    topic: "what-is-indexeddb-vs-localstorage",
    title: "What is IndexedDB vs localStorage?",
    level: "mid",
    tags: ["browser", "storage"],
    prompt: "An offline-first notes app stores thousands of notes with attachments. Why is localStorage the wrong tool?",
    hints: ["Think synchronous versus asynchronous.", "Think about what values can be stored and how much."],
    approach: "Compare API style, data types, capacity, transactions, and worker availability.",
    solution:
      "`localStorage` is a synchronous string key-value store with a small quota (around 5 MB). Every read or write blocks the main thread, values must be serialized, and it is not available in workers. IndexedDB is an asynchronous, transactional object database. It stores structured-cloneable values including `Blob`s and typed arrays, supports indexes and cursors for queries, offers a much larger quota subject to browser limits, and works in workers and service workers. Its raw API is verbose, so libraries such as `idb` wrap it in promises. For a few small preferences, `localStorage` is fine. For many records, attachments, or offline sync, use IndexedDB. Storage can be evicted under pressure unless you request persistence with `navigator.storage.persist()`.",
    notes: "Mention blocking, string-only values, and eviction. Transactions are a bonus.",
    correct: "IndexedDB is async, transactional, stores structured data and blobs, and has a larger quota",
    wrong: [
      "IndexedDB is synchronous and limited to strings, while localStorage handles large binary data well",
      "They are the same underlying store exposed through two different APIs, so quota and speed are equal",
      "localStorage is encrypted by default, and IndexedDB is stored in plain text so it suits secrets less",
    ],
  }),
  q({
    topic: "explain-unknown-vs-any",
    title: "Explain unknown vs any",
    level: "beginner",
    tags: ["typescript"],
    prompt: "A function parses JSON from the network. Why is `unknown` a better return type than `any`?",
    hints: ["One disables type checking. The other forces you to prove the type.", "Narrowing is how you prove it."],
    approach: "State what each allows, show a narrowing example, and recommend unknown at trust boundaries.",
    solution:
      "`any` turns off type checking for a value: you can call it, index it, or assign it anywhere, and errors surface only at runtime. `unknown` is the type-safe counterpart. You can assign anything to it, but you cannot use it until you narrow it with `typeof`, `instanceof`, `in`, a user-defined type guard, or a schema validator. At a boundary such as `JSON.parse` or `catch (e)`, annotate `unknown` and validate before use, so a malformed payload fails at the edge instead of deep in a component. `any` also spreads: a property read from an `any` is `any`. Reserve `any` for rare migration shims and prefer `unknown` or a generic.",
    notes: "Credit mentioning that `any` is contagious and that validation libraries produce the narrowed type.",
    correct: "unknown accepts any value but must be narrowed before use; any disables checking entirely",
    wrong: [
      "unknown and any are interchangeable, and unknown is only an alias that reads better in code review",
      "any forces you to narrow before use, while unknown lets you call methods without any checks at all",
      "unknown can only hold object values, while any can hold primitives such as strings and numbers",
    ],
    refs: ts,
  }),
  q({
    topic: "what-is-type-vs-interface",
    title: "What is type vs interface?",
    level: "beginner",
    tags: ["typescript"],
    prompt: "When can you only use `type`, and when does `interface` give you something `type` cannot?",
    hints: ["Think unions and tuples on one side, merging on the other.", "Both can describe an object shape."],
    approach: "List the shared use, then the differences: unions and mapped types versus declaration merging and extends error messages.",
    solution:
      "Both can describe an object shape and both can be extended or implemented by a class. `type` is more general: it can alias unions (`A | B`), tuples, primitives, and mapped or conditional types, which an `interface` cannot. An `interface` supports declaration merging: two declarations with the same name merge into one, which is how libraries let you augment global types such as `Window`. Interfaces also tend to give clearer error messages and are cached by name, which can help compile speed in large codebases. A `type` with the same name twice is an error. Pick one convention per codebase. A common rule is `interface` for public object contracts that others may extend, and `type` for unions and computed types.",
    notes: "Avoid dogma. The strong answer names declaration merging and unions as the real differences.",
    correct: "type can alias unions and tuples; interface supports declaration merging",
    wrong: [
      "interface can alias unions and tuples; type supports declaration merging",
      "type exists only at runtime and interface exists only at compile time",
      "interfaces cannot be implemented by classes",
    ],
    refs: ts,
  }),
  q({
    topic: "explain-utility-types-partial-pick-omit-record",
    title: "Explain utility types: Partial, Pick, Omit, Record",
    level: "mid",
    tags: ["typescript"],
    prompt: "A PATCH endpoint accepts some fields of a `User`. Which utility types describe the body and the lookup table of users by id?",
    hints: ["Make every property optional, and map keys to values.", "Pick and Omit are opposites."],
    approach: "Define each in one line with a type example, and name the Omit-on-unions caveat.",
    solution:
      "`Partial<T>` makes every property optional, which fits a PATCH body: `Partial<User>`. `Required<T>` does the opposite. `Pick<T, K>` keeps only the listed keys, and `Omit<T, K>` removes them, for example `Omit<User, \"passwordHash\">` for a response. `Record<K, V>` builds an object type whose keys are `K` and values are `V`, so `Record<string, User>` is a lookup by id and `Record<\"admin\" | \"member\", Permissions>` forces every role to be present. `Readonly<T>` marks properties as read-only. These are mapped types built into the standard library. `Omit` does not distribute over a union, so omitting from a union flattens it. Write a distributive version if you need per-member omission.",
    notes: "Bonus for the union caveat and knowing these are plain mapped types, not magic.",
    correct: "Partial for optional fields, Omit/Pick to drop or keep keys, Record for a key-to-value map",
    wrong: [
      "Partial removes properties, Omit makes them optional, and Record freezes the object so it cannot change",
      "Record makes every property optional, and Pick deletes the listed keys from an existing type",
      "They only work on interfaces and not on type aliases, so a type alias must be converted first",
    ],
    refs: ts,
  }),
  q({
    topic: "what-is-satisfies-operator",
    title: "What is satisfies operator?",
    level: "mid",
    tags: ["typescript"],
    prompt: "You annotate a config object as `Record<string, string | number>` and lose the specific key and value types. How does `satisfies` avoid that?",
    hints: ["An annotation widens. satisfies only checks.", "It pairs well with as const."],
    approach: "Contrast annotation, assertion, and satisfies on the same object, then say when to use each.",
    solution:
      "A type annotation (`const c: Config = {...}`) checks the value against `Config` and then gives it type `Config`, so specific literal types are widened away. An assertion (`as Config`) silences checks. `expr satisfies T` (TypeScript 4.9) checks that the expression is assignable to `T`, reports missing or extra properties, and keeps the expression’s own narrower inferred type. For `const routes = { home: \"/\", user: \"/u/:id\" } satisfies Record<string, string>`, `routes.home` is still known and `routes.nope` is an error, while a typo in the value type is caught at the declaration. Combine with `as const` to also keep literal values and make them readonly. Use an annotation when you want the wider contract type, and `satisfies` when you want validation without losing detail.",
    notes: "The comparison to annotation and assertion is the substance. Naming the 4.9 release is a plus, not required.",
    correct: "It checks the value against a type but keeps the value’s narrower inferred type",
    wrong: [
      "It converts the value to the target type at runtime, so the value is cast and validated when run",
      "It widens the value to the target type, exactly like a type annotation on the variable would",
      "It silences type errors on the value in the same way a type assertion with as does",
    ],
    refs: ts,
  }),
  q({
    topic: "what-is-z-index-stacking-context",
    title: "What is z-index stacking context?",
    level: "mid",
    tags: ["css", "layout"],
    prompt: "A dropdown with `z-index: 9999` still renders behind a sibling card. What is happening?",
    hints: ["z-index compares siblings inside the same context.", "Some properties create a new context without you noticing."],
    approach: "Explain that z-index is scoped, list what creates a context, and give a debugging method.",
    solution:
      "A stacking context is an isolated group that is painted as a unit. `z-index` only competes with siblings in the same context. A child cannot escape its parent’s context, so `z-index: 9999` inside a parent that sits below another context still loses. A new context is created by the root element, by positioned elements with a `z-index` other than `auto`, by flex or grid children with a `z-index`, and by `opacity` below 1, `transform`, `filter`, `perspective`, `mix-blend-mode`, `will-change`, `contain`, and `isolation: isolate`. To debug, walk up the ancestors and find the one that created a context. Fix by moving the dropdown to a portal at the end of `body`, or by removing the incidental property. Use `isolation: isolate` deliberately on a component so its internal z-indexes do not leak.",
    notes: "Mentioning transform and opacity as accidental creators, plus portals, is the strong version.",
    correct: "z-index is scoped to a stacking context; an ancestor with its own context traps the child",
    wrong: [
      "z-index is global across the page, so the element with the highest number always appears on top",
      "z-index applies only to elements with display: block, so inline and flex items ignore it entirely",
      "A larger z-index on a child always overrides a smaller one on its parent’s sibling, whatever the context",
    ],
  }),
  q({
    topic: "explain-rem-vs-em-vs-px",
    title: "Explain rem vs em vs px",
    level: "beginner",
    tags: ["css", "accessibility"],
    prompt: "Which unit should body text and spacing use if users change their browser’s default font size?",
    hints: ["One unit ignores user settings.", "One compounds when nested."],
    approach: "Define each reference point, show compounding for em, and tie it to accessibility.",
    solution:
      "`px` is a fixed CSS pixel and does not follow the user’s font-size preference when used for text. `rem` is relative to the root element’s font size, so `1.125rem` scales when a user raises their default and does not compound with nesting. `em` is relative to the element’s own font size for most properties (and to the parent’s font size when used for `font-size` itself), so nested `em` font sizes multiply. That makes `em` good for spacing that should scale with a component’s text, such as button padding, and risky for nested font sizes. Prefer `rem` for type and layout rhythm, `em` for component-relative spacing, and `px` for hairlines and borders. Media queries in `em` or `rem` respond to the user’s font size, unlike `px`.",
    notes: "The accessibility link is the point. Do not accept “rem is for fonts, px is for everything else” without reasoning.",
    correct: "rem scales from the root font size and respects user settings; em compounds; px is fixed",
    wrong: [
      "px respects the user’s font size settings and rem does not, so px is better for accessibility",
      "em and rem are both relative to the viewport width, so they change when the window is resized",
      "rem is relative to the parent element’s font size and compounds when nested inside other elements",
    ],
  }),
  q({
    topic: "explain-position-relative-absolute-fixed-sticky",
    title: "Explain position: relative, absolute, fixed, sticky",
    level: "beginner",
    tags: ["css", "layout"],
    prompt: "A sticky table header does not stick. What are the usual causes?",
    hints: ["Sticky needs a threshold and a scrolling ancestor.", "Overflow on an ancestor changes which container scrolls."],
    approach: "Define each value by flow and containing block, then diagnose the sticky case.",
    solution:
      "`relative` keeps the element in normal flow, offsets it visually, and makes it the containing block for absolutely positioned children. `absolute` removes it from flow and positions it against the nearest positioned ancestor (or the initial containing block). `fixed` positions against the viewport and stays during scroll, unless an ancestor has `transform`, `filter`, or `perspective`, which makes that ancestor the containing block. `sticky` behaves like `relative` until the element would cross a threshold such as `top: 0` relative to its nearest scrolling ancestor, then it sticks until the end of its parent. A sticky header fails when no threshold is set, when an ancestor has `overflow: hidden`, `auto`, or `scroll` and is not the scroller you expect, or when the parent is only as tall as the element.",
    notes: "The sticky diagnosis (threshold, overflow ancestor, parent height) separates people who have used it from those who memorized the table.",
    correct: "Sticky needs a threshold like top, and an overflow ancestor or a short parent can stop it working",
    wrong: [
      "Sticky works only when the parent is display: flex, and it ignores top, left, and bottom values",
      "Sticky is the same as fixed but slower, because the browser repaints it on every scroll event",
      "Sticky ignores top and always follows the bottom of the viewport, whatever the ancestor’s overflow",
    ],
  }),
  q({
    topic: "what-is-container-queries",
    title: "What is container queries?",
    level: "senior",
    tags: ["css", "responsive"],
    prompt: "A card is used in a sidebar and in a wide main column. How do container queries let it adapt without knowing the viewport?",
    hints: ["The query asks about an ancestor’s size.", "The ancestor must declare itself a container."],
    approach: "Show container-type, the @container rule, and how it differs from a media query. Mention container units and the limits.",
    solution:
      "A media query reacts to the viewport. A container query reacts to the size of a containing element. Declare the ancestor with `container-type: inline-size` (and optionally `container-name`), then write `@container (min-width: 480px) { .card { grid-template-columns: 1fr 2fr; } }`. The card now switches layout when its own container is wide, wherever it is placed, which makes components reusable. An element cannot query itself, only an ancestor, and declaring `inline-size` containment means the container’s inline size cannot depend on its children. Container query length units such as `cqw` size things relative to the container. Style queries and a `size` container type exist but have narrower support. Keep media queries for page-level layout and use container queries for components.",
    notes: "Listen for “component responds to its container” and the containment requirement.",
    correct: "A component adapts to an ancestor container’s size, declared with container-type, instead of the viewport",
    wrong: [
      "An element queries its own width and rewrites its styles, with no ancestor needing to be declared a container",
      "They replace media queries entirely and need no declaration, so any ancestor is queried automatically",
      "They query the number of children in a flex row and apply styles once a threshold is reached",
    ],
  }),
  q({
    topic: "explain-flex-grow-flex-shrink-flex-basis",
    title: "Explain flex-grow, flex-shrink, flex-basis",
    level: "beginner",
    tags: ["css", "flexbox"],
    prompt: "What does `flex: 1` mean, and why does a long word in a flex child still overflow?",
    hints: ["It is shorthand for three values.", "The default minimum size of a flex item is its content."],
    approach: "Define basis, grow, and shrink, expand `flex: 1`, and cover the min-width: auto gotcha.",
    solution:
      "`flex-basis` is the item’s starting size along the main axis. `flex-grow` says how free space is shared among items when there is extra room. `flex-shrink` says how overflow is shared when there is not enough room, weighted by each item’s basis. The initial values are `0 1 auto`. `flex: 1` expands to `1 1 0%`, so items start from zero and share all space equally. `flex: auto` is `1 1 auto` and `flex: none` is `0 0 auto`. A flex item has `min-width: auto`, which resolves to its content’s minimum size, so a long unbroken word or a wide `pre` will not shrink below it. Set `min-width: 0` (and `overflow: hidden` or `overflow-wrap: anywhere`) on the item to let it shrink.",
    notes: "The `min-width: 0` fix is the practical knowledge interviewers are fishing for.",
    correct: "flex: 1 is 1 1 0%, so items share space equally; min-width: auto stops items shrinking below their content",
    wrong: [
      "flex: 1 sets the width to 1px and disables shrinking, so items overflow once the content grows past that",
      "flex-basis always overrides width with the container size, which is why flex items fill their parent",
      "flex-shrink increases item size when there is spare room, and flex-grow reduces it when space runs out",
    ],
  }),
  q({
    topic: "explain-focus-visible-vs-focus",
    title: "Explain :focus-visible vs :focus",
    level: "mid",
    tags: ["css", "accessibility"],
    prompt: "Designers want no outline when a mouse user clicks a button, but keyboard users still need a clear focus ring. How?",
    hints: ["The browser decides when a ring is helpful.", "Do not remove the outline for everyone."],
    approach: "Contrast the two pseudo-classes, show the pattern, and mention the accessibility requirement.",
    solution:
      "`:focus` matches an element whenever it has focus, including after a mouse click on a button. `:focus-visible` matches only when the browser decides a focus indicator is helpful: typically after keyboard navigation, and always for text inputs. Style the ring on `:focus-visible` and leave the default alone otherwise: `button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }`. If you reset the outline, scope it as `:focus:not(:focus-visible)`, never as a global `outline: none`. WCAG requires a visible focus indicator with enough contrast. A custom ring must be at least as visible as the default, and `outline` survives Windows high-contrast mode better than `box-shadow`.",
    notes: "Reject `outline: none` as a solution. The selector pattern and contrast mention are the pass mark.",
    correct: "Use :focus-visible for the ring so keyboard users get it and mouse clicks usually do not",
    wrong: [
      "Remove outlines globally with outline: none, since keyboard users do not need a visible focus indicator",
      ":focus-visible matches only while the pointer hovers the element, so it replaces :hover for focus styles",
      ":focus never matches buttons in any browser, so only :focus-visible can style a button’s focus ring",
    ],
  }),
  q({
    topic: "what-is-css-grid-auto-fit-vs-auto-fill",
    title: "What is CSS Grid auto-fit vs auto-fill?",
    level: "mid",
    tags: ["css", "grid"],
    prompt: "`repeat(auto-fit, minmax(200px, 1fr))` and `auto-fill` look identical until a row has only two cards. What differs?",
    hints: ["Both create as many tracks as fit.", "One keeps empty tracks and one collapses them."],
    approach: "Describe both with the same minmax, then show what happens with few items.",
    solution:
      "Both `auto-fill` and `auto-fit` create as many tracks as fit in the container using the repeat size. With enough items they look the same. With fewer items than tracks, `auto-fill` keeps the empty tracks, so the existing cards stay at their column width and leave blank space at the end. `auto-fit` collapses the empty tracks to zero, so with `minmax(200px, 1fr)` the remaining cards stretch to fill the row. Use `auto-fill` when you want a stable column width regardless of item count, and `auto-fit` when items should expand to use the space. Add a `min()` such as `minmax(min(200px, 100%), 1fr)` so a track never exceeds a narrow container.",
    notes: "The behavior with few items is the whole question. Credit the `min()` guard against overflow.",
    correct: "auto-fill keeps empty tracks; auto-fit collapses them so existing items stretch",
    wrong: [
      "auto-fit keeps empty tracks and auto-fill collapses them, so auto-fit leaves blank columns at the end",
      "auto-fill only works in fixed-width grids, and auto-fit is required whenever columns use fr units",
      "They differ only in browser support, and both give exactly the same layout in every current browser",
    ],
  }),
  q({
    topic: "explain-react-reconciliation",
    title: "Explain React reconciliation",
    level: "mid",
    tags: ["react", "rendering"],
    prompt: "Why does typing in an input lose its text when a parent defines the child component inside its own render?",
    hints: ["React compares element type and position between renders.", "A new function identity is a new type."],
    approach: "Explain the diff heuristics, the role of keys, and the inline-component bug.",
    solution:
      "Reconciliation is how React compares the element tree from this render with the previous one to decide the minimal DOM changes. It uses two heuristics. Elements of different types produce different trees, so React unmounts the old subtree and mounts the new one, discarding its state. Elements of the same type at the same position are updated in place, keeping state. In lists, `key` identifies items across renders so reordering keeps state with the right item. If you define a component inside another component’s body, every render creates a new function, which React sees as a new type, so it remounts the subtree and the input loses its text and focus. Define components at module scope, and use stable keys, not array indexes, for lists that reorder.",
    notes: "The inline-component bug is the practical test. Index keys on reorderable lists is the second common miss.",
    correct: "A different element type or key remounts and drops state; same type and position updates in place",
    wrong: [
      "React rebuilds the entire DOM tree on every render and relies on the browser to diff old and new nodes",
      "State is stored on the DOM node itself, so remounting an element never loses what the component held",
      "Keys are optional hints that never change behaviour, so changing a key does not remount the component",
    ],
    refs: react,
  }),
  q({
    topic: "what-is-uselayouteffect-vs-useeffect",
    title: "What is useLayoutEffect vs useEffect?",
    level: "mid",
    tags: ["react", "hooks"],
    prompt: "A tooltip flickers at the wrong position for one frame before jumping into place. Which hook fixes it, and what does it cost?",
    hints: ["One runs before the browser paints, the other after.", "Blocking paint has a price."],
    approach: "Place each in the render pipeline, give the measuring use case, and note the cost and server behavior.",
    solution:
      "Both run after React commits changes to the DOM. `useLayoutEffect` runs synchronously before the browser paints, so you can measure the DOM (for example `getBoundingClientRect`) and update state, and the user never sees the intermediate frame. `useEffect` runs after paint, so it is the default for subscriptions, fetching, and logging because it does not delay rendering. For the flickering tooltip, measure and position in `useLayoutEffect`. The cost is that long work inside it delays the first paint. Neither runs on the server during rendering, and `useLayoutEffect` is the one people mistakenly use for data fetching. Reach for it only for layout measurement and mutation that must be visible in the same frame.",
    notes: "Listen for “measure before paint” and “do not block paint.” Using it everywhere is a smell.",
    correct: "useLayoutEffect runs before paint, so use it to measure and position without flicker; otherwise use useEffect",
    wrong: [
      "useLayoutEffect runs after the browser has painted and useEffect runs before it, so layout effects are later",
      "useLayoutEffect runs only on the server during rendering, and useEffect runs only in the browser",
      "They behave identically in every case, and the two names are only historical from earlier React versions",
    ],
    refs: react,
  }),
  q({
    topic: "what-are-error-boundaries",
    title: "What are Error Boundaries?",
    level: "mid",
    tags: ["react", "errors"],
    prompt: "A rendering error in one widget blanks the whole page. How do you contain it, and what will a boundary not catch?",
    hints: ["It is a class-based feature.", "It watches rendering, not everything that can throw."],
    approach: "Explain how to build one, what it catches, what it does not, and where to place boundaries.",
    solution:
      "An error boundary is a component that catches errors thrown while rendering its descendants, in lifecycle methods, and in constructors, then renders a fallback instead of unmounting the whole tree. It is a class component that defines `static getDerivedStateFromError` (to switch to the fallback) and optionally `componentDidCatch` (to log). Libraries such as `react-error-boundary` give a hook-friendly wrapper. A boundary does not catch errors in event handlers, in async code such as promises and timers, in server rendering, or in the boundary itself. Handle those with `try/catch` or a rejection handler and set state yourself. Place boundaries around route-level views and independent widgets so one failure degrades one area, and give the fallback a reset (for example change a `key`) so the user can retry.",
    notes: "Check for what is not caught. Candidates who say “it catches all errors” have not used one in anger.",
    correct: "It catches render and lifecycle errors in its subtree, not event handlers or async code",
    wrong: [
      "It catches every error in the application, including errors in event handlers and unhandled promise rejections",
      "It is a hook such as useErrorBoundary, so function components can use it and class components cannot",
      "It prevents errors from being logged to the console, so neither users nor developers see the stack trace",
    ],
    refs: react,
  }),
  q({
    topic: "explain-useref-use-cases",
    title: "Explain useRef use cases",
    level: "beginner",
    tags: ["react", "hooks"],
    prompt: "When is `useRef` the right tool, and why is reading `ref.current` during render a smell?",
    hints: ["Changing it does not cause a re-render.", "It survives across renders."],
    approach: "List the two main uses, contrast with state, and explain the render-purity caveat.",
    solution:
      "`useRef` returns a stable object with a mutable `.current` that persists across renders. Changing it does not trigger a re-render. The first use is to reach a DOM node: attach `ref={inputRef}` and call `inputRef.current.focus()` in an event handler or effect. The second is to store a value that is not part of the rendered output: a timer id, the previous value of a prop, an `AbortController`, or a flag like “already mounted.” Use state for anything the screen displays. Reading or writing `ref.current` during render makes the component impure and unpredictable under concurrent rendering, so do it in effects and handlers. A ref is the escape hatch for imperative APIs, not a way to avoid state.",
    notes: "The state-versus-ref distinction and the render-purity point are the signals.",
    correct: "Hold a DOM node or a mutable value that persists across renders without causing a re-render",
    wrong: [
      "Store values that should update the UI whenever they change, because writing to ref.current triggers a render",
      "Replace useState everywhere to avoid all re-renders in the app, since refs update without a re-render",
      "Memoize an expensive computed value across renders, recomputing it only when its dependency list changes",
    ],
    refs: react,
  }),
  q({
    topic: "what-are-memory-leaks-in-spas",
    title: "What are memory leaks in SPAs?",
    level: "senior",
    tags: ["performance", "debugging"],
    prompt: "A dashboard slows down after an hour of use. How do you find and prevent the leak?",
    hints: ["Something is holding references after the screen is gone.", "Compare heap snapshots over time."],
    approach: "List the usual retainers, describe a repeatable DevTools procedure, and give the prevention habits.",
    solution:
      "A leak is memory the app no longer needs but still references. In SPAs the common causes are event listeners and `setInterval` timers not removed on unmount, subscriptions (sockets, observers, store listeners) never unsubscribed, closures that capture large objects, detached DOM nodes still referenced from a variable or cache, and caches or global stores that only grow. To find one, take a heap snapshot, perform the suspect action several times (open and close a view), force garbage collection, take another, and compare: look for growing counts of detached DOM nodes or retained component instances, then follow the retainer path. The Performance Monitor shows heap and listener counts over time. Prevent leaks by returning cleanup from every effect, aborting requests with `AbortController`, using `WeakMap` or `WeakRef` for caches keyed by objects, and capping cache size.",
    notes: "Listen for a procedure, not a list. “Use a profiler” without snapshot comparison is vague.",
    correct: "Uncleaned listeners, timers, subscriptions, and retained DOM or closures; confirm by comparing heap snapshots",
    wrong: [
      "JavaScript has no garbage collector in the browser, so every allocation made by a page leaks until reload",
      "Leaks only happen in server-side code and never in the browser, where each tab has its memory reset",
      "Closing the browser tab is the only way to free memory used by an SPA, so leaks cannot be fixed in code",
    ],
  }),
  q({
    topic: "what-is-usesyncexternalstore",
    title: "What is useSyncExternalStore?",
    level: "senior",
    tags: ["react", "state"],
    prompt: "A small global store updates outside React. Why can `useEffect` plus `useState` show tearing under concurrent rendering, and how does this hook fix it?",
    hints: ["Concurrent renders can pause between reading the store and committing.", "The hook reads a snapshot and re-checks it."],
    approach: "Define the three arguments, explain tearing, and state the snapshot-stability rule.",
    solution:
      "`useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)` lets a component read a store that lives outside React. `subscribe` registers a callback and returns an unsubscribe function. `getSnapshot` returns the current value, and it must return the same reference when nothing changed, otherwise React loops. `getServerSnapshot` supplies the value for server rendering and hydration. With concurrent rendering, a render can be interrupted, and if the store changes mid-render, different components may read different values: tearing. This hook makes React re-read the snapshot before commit and re-render synchronously if it differs, so the whole tree is consistent. State libraries such as Redux and Zustand use it internally. In app code you rarely call it, except to subscribe to browser state like `matchMedia` or `navigator.onLine`.",
    notes: "Tearing and snapshot stability are the two terms that show real understanding.",
    correct: "It reads an external store consistently during concurrent rendering by re-checking a stable snapshot",
    wrong: [
      "It copies the external store into React state once at mount, and later changes are ignored by the component",
      "It makes any plain object reactive by wrapping it in a Proxy that notifies React about every property write",
      "It is only for server components and cannot run in the browser, where useEffect should be used instead",
    ],
    refs: react,
  }),
];
