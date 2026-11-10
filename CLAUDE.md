# Payement

Appli mobile (PWA) de budget pour un couple : factures de chaque mois, rentrées, dépenses, objectifs d'épargne (mariage, gros achat…).
Un seul fichier `index.html`, publié par GitHub Pages depuis `main` : https://nicolas06061997.github.io/Payement/
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

## Partage en direct entre les téléphones : le « mot de famille »
Base Firebase Realtime Database de l'appli Céline (projet `celine-fcdb2`), chemin à part.
Au premier lancement, chacun tape le mot de famille choisi par le couple (`famScreen`). Ne JAMAIS écrire ce mot dans le code, le dépôt ou un commit.
`famKey(mot)` = PBKDF2-SHA256 (300 000 tours, sel fixe) du mot normalisé (`normWord` : sans accents, majuscules, espaces) → `SEC`, gardé dans `pay_fam` (jamais le mot).
`initKey()` calcule depuis `SEC` le chemin `PATH='pay2-'+sha256(...)` et la clé AES-GCM ; la base ne contient que `{d: chiffré, v:1}` (`seal`/`unseal`). Même mot = même budget.
En entrant le mot, un ancien espace à invitation (`pay_secret`, version du 09/11) et l'ancienne adresse non chiffrée (`OLD_URL`, `takeOld`) sont fusionnés dans le nouvel espace.
Les écrans d'invitation (`spaceScreen`/`createSpace`/`joinSpace`) restent dans le code mais ne sont plus utilisés.
Écoute en direct (EventSource) + relecture toutes les 30 s. Chaque élément a `u` ; suppressions dans `gone` ; factures payées `paid["AAAA-MM_id"]={v,u}`.
`merge()` garde le plus récent puis PUT du tout. Toute modification doit faire `touch(x)` (ou `gone(id)`) puis `save()`.
Prénom du téléphone (`pay_me`, `whoSheet()`) jamais partagé ; rempli automatiquement dans « Qui ? ».
Premier lancement (`onboard()`) : installer → mot de famille → prénom → code d'accès.
La session de développement ne peut pas joindre Firebase : tester avec un faux serveur (route Playwright).

## Code d'accès et empreinte (propres à chaque téléphone)
`#lock` : code à 4 chiffres (`pay_pin` = sha256, jamais le code), 5 erreurs → 30 s d'attente ; se reverrouille après 1 min hors de l'appli.
Empreinte/visage par WebAuthn (`bioSetup`/`bioUnlock`, `pay_bio` = id) : simple verrou local. « Code oublié » efface ce téléphone (`pay_*`) → retaper le mot de famille.
Test : Playwright + CDP `WebAuthn.addVirtualAuthenticator`.

## Installation et mises à jour
Écran `#ins` (`showIns`/`insHTML`, comme Céline : WhatsApp/Messenger → Safari/Chrome, étapes iPhone/Android), « Plus tard » = 24 h (`pay_ins`).
`chkUpd()` : nouvelle version → rechargement automatique (une fois par version, `pay_auto`), sinon bandeau `#upd` « Mettre à jour ». Vérifié au retour dans l'appli et toutes les 30 min.
`sw.js?v=APPV` (caches `pay-…`).

## Fiche de paye (capture d'écran → salaire du mois)
Bouton 📄 (`data-act=slip`, `#slipIn`) → `readSlip()` : Tesseract.js 5.1.1 chargé à la demande depuis jsdelivr (`loadTess`), langue `fra`, tout se passe sur le téléphone.
`parseSlip()` cherche « Net à payer / à virer / te betalen… » (sinon « net »), ignore « imposable/brut », trouve le mois (`MOIS`/`MAAND` ou MM/AAAA).
`slipForm()` : montant à vérifier + autres montants en boutons ; enregistre une rentrée `{c:'salaire', slip:1, rep:idSalaire}`.
`rep` = ce mois-là, le salaire habituel est remplacé (`replOf`, `incOf` ; `incAll` = tous). Aussi réglable dans `mvForm` pour toute rentrée.
Test : servir `tesseract.js`, `tesseract.js-core`, `@tesseract.js-data/fra` depuis node_modules via `page.route`.

## Factures et épargne (09/11)
- `FREQ` : 1 = chaque mois (revient tout seul), 0 = une seule fois, 2/3/6/12. « Arrêter à partir de ce mois » (`stopBill`) met `end` au mois précédent ; « Supprimer complètement » efface aussi le passé. Ajout rapide `QUICK` (`data-act=quick`).
- Comptes épargne `st.acc` ({nm,init,i}) : solde `accBal` = init + `dep` avec `acc` ; `accMvForm` (verser/retirer), `accFix` (correction `adj:1`, pas comptée dans « mis de côté »). Un versement pour un objectif peut aller sur un compte (`dep.g` + `dep.acc`). Total `totSav()`.

## Look (refait le 09/11 : « plus propre et jolie »)
Police Plus Jakarta Sans (Google Fonts), couleurs dans `:root` (clair/sombre), icônes SVG `ICONS`/`svg()`, carte principale `.hero` (`.hero.blue` pour l'épargne), actions rapides `.qa`, titres de section `.sec`, montants `eurH()` (centimes plus petits). Vérifier par capture d'écran après un changement visuel.

## Facture en photo / capture
Bouton Facture de l'accueil → `billChoice()` (photo ou à la main) ; onglet Factures : « 📷 Avec une photo » (`#billIn`).
`ocrText(file, quoi)` (Tesseract, partagé avec la fiche de paye) → `parseBill()` : fournisseur (`PROV` : nom + catégorie, sinon 1re ligne), montant (« montant à payer / total à payer / à payer », sinon « total TVAC »), échéance (« avant le / échéance… »), communication structurée +++…+++, IBAN BE.
Préremplit `billForm(null, pre)` en « une seule fois » au mois de l'échéance ; champs `com`/`iban` sur toutes les factures, boutons 📋 pour les copier (`data-act=copy2`).

## Profils (pour tout retrouver après avoir effacé les données du navigateur)
`st.prof` (partagé et chiffré comme le reste) = `{id,nm,pin,bio,u}` ; `pay_prof` (local) = profil de ce téléphone.
`profSave()` après chaque changement de prénom, code ou empreinte ; créé tout seul au démarrage si absent.
`whoSheet()` propose les prénoms existants → `useProf()` remet prénom, code et empreinte, puis demande le code pour confirmer.
« Code oublié » retire le code du profil (puis `sync`) avant d'effacer le téléphone. `navigator.storage.persist()` au démarrage.

## Styles au choix (10/11) — propres à chaque téléphone
`html[data-theme]` : `a` Nuit violette (toujours sombre, anneau `donut()`, barre du bas flottante), `b` Coloré (Nunito, tuiles `.tiles`), `c` Chic doré (Playfair, carte noire et or), vide = Simple.
`pay_theme` (local, aussi dans le profil `th`) ; `applyTheme`/`setTheme`/`themePicker` (Réglages) ; `themeSheet()` proposé une fois (`pay_thc`). Jamais partagé dans les données du budget.
Polices Google : Plus Jakarta Sans, Outfit, Nunito, Playfair Display. Test sans réseau : servir @fontsource via `page.route`.
- 10/11 : carte `.hero` en haut de chaque page (Factures : reste à payer ; Argent : rentrées − dépenses, actions rondes `.qa`) ; la carte de l'accueil a la classe `home` (anneau A, tuiles B). Chic doré : boutons noir/or, icônes `.ico` sépia sans fond, petits dessins retirés des titres dans `render()`.
- Manifeste en `fullscreen` (comme Céline) : plus de barre de couleur en bas sur Android. Un téléphone déjà installé garde l'ancienne couleur jusqu'à la mise à jour de Chrome ou une réinstallation.
