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
- Code de secours (`copyCode`/`pasteCode`, préfixe `PAY1:`).

## Partage en direct entre les deux téléphones (comme l'appli Céline)
Même base Firebase Realtime Database que Céline (projet `celine-fcdb2`), mais chemin à part : `FB/familles/FAM.json` avec `FAM='pay-bkc7j-rtopc-xzd3k-kwsk4'`.
Écoute en direct (EventSource) + relecture toutes les 30 s. Chaque élément a `u` (date de modif.) ; suppressions dans `gone` ; factures payées `paid["AAAA-MM_id"]={v,u}`.
`merge()` garde le plus récent puis PUT du tout. Toute modification doit faire `touch(x)` (ou `gone(id)`) puis `save()`.
Prénom du téléphone (`pay_me`, `whoSheet()`) jamais partagé ; rempli automatiquement dans « Qui ? ».
La session de développement ne peut pas joindre Firebase : tester avec un faux serveur (route Playwright).

## Installation et mises à jour
Écran `#ins` (`showIns`/`insHTML`, comme Céline : WhatsApp/Messenger → Safari/Chrome, étapes iPhone/Android), « Plus tard » = 24 h (`pay_ins`).
`chkUpd()` : nouvelle version → rechargement automatique (une fois par version, `pay_auto`), sinon bandeau `#upd` « Mettre à jour ». Vérifié au retour dans l'appli et toutes les 30 min.
`sw.js?v=APPV` (caches `pay-…`).
