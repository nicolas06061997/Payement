# Payement

Appli mobile (PWA) de budget pour un couple : factures de chaque mois, rentrées, dépenses, objectifs d'épargne (mariage, gros achat…).
Un seul fichier `index.html`, publié par GitHub Pages depuis `main` : https://nicolas06061997.github.io/payement/
Projet indépendant des jeux du dépôt La-Fine-Crasse.

L'utilisateur parle français et n'est pas développeur : réponses courtes, en français, étape par étape.

## À chaque modification
1. Changer `APPV` dans `index.html` **et** `v` dans `version.json` (même valeur, format `AAAA-MM-JJ.n`), + une phrase dans `notes` (affichée lors de la mise à jour automatique).
2. Commit + push sur `main`.

## Lancer
`python3 -m http.server 8000` puis `http://localhost:8000/`. Pas de build, aucune bibliothèque externe.

## Code
- Sauvegarde `localStorage` clé `pay_save` (`sv:1`) : `bills` (factures {id,nm,amt,day,c,freq,start,end}), `paid[mois]` (ids payées), `inc` (rentrées chaque mois), `mv` (rentrées/dépenses ponctuelles {t:'in'|'out',amt,c,nm,d,who}), `goals` ({nm,target,i,when}), `dep` (versements vers un objectif, négatif = retrait).
- Mois au format `AAAA-MM` ; `mi()`/`fromMi()` ; `due(facture,mois)` gère la fréquence ; `totals(mois)` = rentrées − factures − dépenses − épargne.
- Écrans : `home`, `bills`, `mv`, `goals`, `set` ; fenêtres de saisie `form()` (`billForm`, `incForm`, `mvForm`, `goalForm`, `depForm`).
- Données uniquement sur le téléphone ; partage entre téléphones par code de sauvegarde (`copyCode`/`pasteCode`, préfixe `PAY1:`).
- `sw.js?v=APPV` (caches `pay-…`) ; `chkUpd` recharge tout seul quand `version.json` change.
