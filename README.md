# Paper Harbour

A playable marine insurance office in the fictional port of Ledgerwick, summer 1962. Pull one of six cargo files, compare the manifest with the quay tally and decide what Tide Mutual owes the merchant.

[Open Paper Harbour](https://thaithinhtim602.github.io/paper-harbour/)

## At the desk

1. On the light table, drag the blue tally vertically, use the keyboard slider or press **Square the sheets**. Clip the marks that need explaining.
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

The harbour cover and six evidence plates are original generated illustrations made for this game. DM Serif Text is included under the SIL Open Font License in `media/Font-Licence.txt`.

