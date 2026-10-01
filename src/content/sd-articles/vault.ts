import type { SystemDesignGuide } from "@/lib/types";

export const vaultGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `A password manager’s web UI: unlock with a master password, browse entries, copy a secret, and add or edit an item. The server stores ciphertext. The master password never goes to the server.

What you commit to:

- Unlock derives a key in the browser (a slow KDF, then a wrapping key) and decrypts the vault locally. The network sees ciphertext and an opaque auth to your account, not the master password and not plaintext secrets.
- The key lives in memory for the session and is dropped on lock, on a timeout, and on sign-out. It is not written to localStorage.
- Listing can show titles and domains only after decrypt, or those fields are encrypted too and the locked UI shows nothing sensitive. Say which. Prefer encrypting titles if the threat includes a curious server.
- Copy puts the secret on the clipboard and clears it after a short time. The screen does not leave the password visible unless the user toggles reveal.
- A breach check, if you offer it, sends a prefix or a hash prefix (k-anonymity), not the password.

Scale: a personal vault of hundreds or a few thousand items. Decrypting all of them on unlock can be acceptable if you say the cost, or you decrypt titles first and bodies on open. The UI virtualizes the list.

Out of scope: the browser extension autofill injection into other origins, and account recovery that escrow the master key at the server. Recovery is a tradeoff you must mention: a recovery kit the user holds, or a key you cannot restore. You cannot honestly offer both “we cannot read it” and “we can email you your passwords.”`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `A locked shell, a crypto session, and an item list.

Locked: an email or account step that authenticates to your backend without the master password (a normal session), then a master-password field. Submitting it runs the KDF on salt the server stored (the salt is not secret) and unwraps the vault key. Verify with a MAC or a decrypt of a known verifier so a wrong password fails locally without uploading a guess. The server can still rate-limit unlock attempts if you send a verifier proof. Do not send the password.

Unlocked: the vault key is in a module-level variable or a closure the React tree does not serialize into logs. Items download as ciphertext, decrypt into a store, and render. Search runs on decrypted titles in memory, or on tokens you built locally. Do not ship a server search index of plaintext titles if you claimed the server cannot read them. If you need server search, you are building a different, weaker threat model. Say it.

Edit: decrypt one item, edit in a form, encrypt, PUT the ciphertext and a version. Conflict if the version moved. Generate-password runs locally (\`crypto.getRandomValues\`).

Lock: drop the key, clear the decrypted store, leave ciphertext if you must but it is useless without the key, and show the unlock screen. Also lock on \`visibilityState\` if the product is strict, or after idle. Picking idle is a product choice. Name the timer.

## Clipboard

\`navigator.clipboard.writeText\` then a timer to overwrite with empty or a space if the platform allows. Document that overwrite is best-effort on some browsers. Reveal toggles a password input attribute and turns itself off when the row blurs or after a few seconds.

## Sharing

If an item is shared, encrypt the item key to the recipient’s public key. The server stores the wrapped key and still cannot read the secret. If you do not have public keys yet, sharing is out of scope. Do not “share” by decrypting and POSTing plaintext to a mailbox endpoint.`,
      diagram: {
        caption: "The server stores ciphertext and salt. The key is derived in the page and never sent.",
        mermaid: `flowchart TB
  Unlock[Master password]
  KDF[KDF in the browser]
  Key[Vault key in memory]
  API[Ciphertext API]
  Store[Decrypted items]
  Unlock --> KDF
  KDF --> Key
  API --> Key
  Key --> Store
  Store --> Key`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `Account auth is a normal session cookie, HttpOnly. It authorizes “this user may read their ciphertext.” It is not the vault key.

Vault header: \`{ kdf: "argon2id" or "PBKDF2", salt, iterations or memory, wrappedVaultKey, verifier }\`. Argon2id needs a WASM or similar implementation. PBKDF2 is in WebCrypto and is the practical baseline to name if you cannot ship Argon2. Say the parameters are high enough to be slow on purpose.

Item ciphertext: \`{ id, version, nonce, ciphertext }\`. Plaintext inside, after decrypt: \`{ title, username, password, urls, notes, totp? }\`.

TOTP seeds are secrets. Display a code computed locally with a clock, and allow a small window. Do not send the seed to a “current code” API.

The decrypted list is in memory only. Persistence of ciphertext in IndexedDB is optional for offline and must be cleared on sign-out if the device is shared, or encrypted already which it is. The key is still the thing you must not persist. A “remember unlock” that stores the key in the browser is a product exception you should argue against, or limit to a non-extractable platform credential if you really know that API. Default is session memory.

Generator options: length, character sets. Entropy comes from \`crypto.getRandomValues\`, not \`Math.random\`.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /vault
→ { kdf, salt, wrappedVaultKey, verifier, items: ciphertext[] }

PUT /vault/items/{id}
{ version, nonce, ciphertext }
→ { version } or 409

No endpoint accepts password, masterPassword, or plaintext.
\`\`\`

Unlock is a form. The master password input is \`type="password"\` with a show button that is explicit. Errors say the password was wrong without echoing it. After too many failures, the server can lock the account session. That lock is on the session, not on “upload the password so we can check it.”

The list can show title and domain after decrypt, with a copy button per secret that does not display the secret in the DOM. A details view can reveal. Edit uses labeled fields. Notes are plain text.

Search is a labeled input that filters the in-memory list. It does not add the query to the server logs via a query string you did not need. If the list is remote-paged you cannot filter plaintext locally without downloading it. Download and decrypt the vault on unlock for a personal vault of this size, and say the upper bound where you would paginate ciphertext and decrypt pages.

Lock is a button and a timeout. Timeout warns before it drops the key if you can, without extending forever on a background timer that never fires. Use a generous definition of activity (pointer, key) while the tab is visible.`,
      diagram: {
        caption: "Unlock unwraps the key locally. Item saves upload ciphertext only.",
        mermaid: `sequenceDiagram
  participant User
  participant Page
  participant API
  User->>Page: master password
  Page->>Page: derive and unwrap key
  Page->>API: GET ciphertext
  API-->>Page: items
  Page->>Page: decrypt in memory
  Page->>API: PUT ciphertext`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Threat model in one minute

You are defending against a server breach and a network observer. The attacker gets ciphertext, salt, and the wrapped key. They do not get the master password, so they must guess it offline, which is why the KDF is slow. You are not, in a plain web app, fully defending against XSS. XSS in the unlocked origin can read the key from memory and exfiltrate plaintext. Say that. Mitigations are CSP, no untrusted HTML in notes, Trusted Types if you can, and a short unlock window. An extension has a different origin and a different story. Do not claim the web UI is as isolated as a hardware token.

## Wrong password and verifiers

Decrypt a small verifier ciphertext or check a MAC. Fail without a network round trip if you already have the header. Still rate-limit on the server if each attempt otherwise lets an attacker grind in the user’s browser session. Never log the attempt’s password, including in error trackers and \`autocomplete\` analytics.

## Clipboard and screenshots

Clear the clipboard on a timer, best effort. Do not put the secret in the URL, the document title, or an \`aria-label\` that a tooltip will expose longer than needed. The copy button’s accessible name is “Copy password for Example,” not the password. Reveal is opt-in and reverts. Autocomplete on the master password field is the user’s password manager, which is fine and a bit recursive. Autocomplete on vault item fields inside the app should be off so the browser does not store them again in the clear.

## Recovery

Offer a recovery kit: a randomly generated key the user downloads once, which can unwrap the vault key. If they lose both the master password and the kit, the data is gone. That is the product. Account email reset restores the login session and still cannot decrypt. The UI should say that at enrollment so it is not a surprise later. Do not add a “forgot master password” that sends plaintext to support.`,
    },
  ],
};
