# Paper Harbour

Take the night shift on Relay Nine, a fictional orbital cargo station. Its six workshops reconstruct marine insurance files from Ledgerwick in summer 1962. Choose a bay on the illustrated deck, follow the service corridor and decide what Tide Mutual owes each merchant. Spool, the station’s cable reel mechanic, has a different lead for each file.

[Open Paper Harbour](https://thaithinhtim602.github.io/paper-harbour/)

## On the cargo deck

Select a room on the deck or use the previous and next bay controls. With a room focused, the arrow keys, Home and End work too. Open the selected case to begin. Ask Spool on the deck or at any workbench to hear a lead or jump to the matching exhibit.

1. On the light table, drag the blue tally, use the keyboard slider or press **Square the sheets**. Select a cargo mark directly on the manifest to clip it. Open a survey photograph to move a magnifier over the print or turn it over for the case note.
2. Work the exhibit and read the papers. Each file has its own instrument, from a salt test or temperature recorder to the captain’s order carbons. Keep up to four passages or readings with the cargo comparisons.
3. Write the number of units to allow and review the calculated payment. A second action stamps the figures into the book.
4. Read the audit, examine how a different policy clause changes the entitlement, and open return post in the cash ledger. Six signed summer rulings produce a closing newspaper and a printable bound casebook.

The wire room generates reproducible versions of these six cases with different terms, quantities and prices. Send a dispatch address to another player, then exchange return slip addresses to compare both rulings and their evidence. On arrival, a return stays folded in the interface until the recipient files a ruling on that shipment. Codes are compact encodings with typo checks. They carry no account identity, signature verification or encryption.

Progress is kept on the device. Use **Ledger → Desk copies and a fresh book** to download or restore a JSON copy. All slips, people, prices and policy rules are fictional.

## Run locally

Start a static server from this directory with a modern Python installation.

```sh
python3 -m http.server 8000
```

Open http://localhost:8000/. To check the casebook using Node.js 22 or later, run `npm test`. The application has no package installation step, external data feed or account requirement.

## How the accounts work

Each accepted unit uses the lower of declared and invoice value, less its scrap bid, or a cheaper certified repair. Contributions, the owner's deductible, the insurer's share and the final policy limit are then applied in that order. The program carries money in integer pence and rounds percentage payments once per file.

Stamping a ruling pays cash immediately. At the next summer filing or when the post is opened, an underpayment is made good with a handling cost. Unsupported evidence incurs an audit cost. Overpayments stay with the claimant. Reinsurance only covers valid contractual entitlement and is subject to the selected treaty's limits. Wire files never change the summer ledger.

## Source

The case data and correspondence are in `cases.mjs`. The financial model, durable save validation and wire encodings are in `office.mjs`. Physical exhibits live in `exhibits.mjs`. Tests reconcile the six signed files, exercise generated shipments and exchanged return slips, and run every possible order of the summer casebook under all three treaties.

The Relay Nine cutaway and Spool portrait are original illustrations generated for this edition. Their functional bay overlays, animated corridor routes and parcel emblem were created for Paper Harbour. The 1962 files retain their period survey plates and correspondence. The mounted Liverpool photograph shows the *Vigilant* taking aboard a gas buoy at Herculaneum Dock. The Mersey Docks and Harbour Board supplied the plate for E. Keble Chatterton’s *Steamships and Their Story*, published by Cassell in 1910. [Original plate and credit](https://www.gutenberg.org/cache/epub/72045/pg72045-images.html#il_102)

The six game evidence plates and the closing newspaper illustration were generated for the fictional cases. The station uses Barlow and Barlow Condensed. The archive also includes Old Standard TT and DM Serif Text. The SIL Open Font License notices are in `media/Barlow-Licence.txt`, `media/OldStandard-Licence.txt` and `media/Font-Licence.txt`.

