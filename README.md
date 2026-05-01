# TestArchi (Playwright + TypeScript)

Projet d’automatisation E2E basé sur **Playwright** et **TypeScript**, avec authentification “préparée” via un **`globalSetup`** qui génère un `storageState`.

## Prérequis

- Node.js + npm

## Installation

```bash
npm install
```

Télécharger les navigateurs Playwright (à faire au moins une fois) :

```bash
npx playwright install
```

## Variables d’environnement (`.env`)

Ce projet lit les identifiants dans le fichier `.env` (à la racine) :

```env
SAUCE_USERNAME=standard_user
SAUCE_PASSWORD=secret_sauce
```

## Commandes utiles

- Lancer les tests :

```bash
npx playwright test
```

- Lancer avec un reporter console simple :

```bash
npx playwright test --reporter=line
```

- Ouvrir le rapport HTML :

```bash
npx playwright show-report
```

## Reporting: Allure

Le projet génère aussi un rapport **Allure**.

### Comment c’est configuré

- **Reporter Playwright**: `allure-playwright` (déclaré dans `playwright.config.ts`)
- **Génération du rapport HTML**: `globalTeardown.ts` exécute à la fin :
  - `npx allure generate allure-results -o allure-report --clean`

### Commandes utiles

- Générer le rapport manuellement :

```bash
npx allure generate allure-results -o allure-report --clean
```

- Ouvrir le rapport (serveur local) :

```bash
npx allure open allure-report
```

## Structure du projet

- **`playwright.config.ts`** : configuration Playwright (baseURL, projets navigateurs, `storageState`, `globalSetup`, etc.)
- **`globalSetup.ts`** : login 1 fois et génération du fichier d’auth
- **`globalTeardown.ts`** : génération du rapport Allure en fin d’exécution
- **`playwright/.auth/user.json`** : fichier généré (cookies + storage) utilisé par les tests
- **`tests/`** : specs E2E
- **`pom/`** : Page Objects (ex: `LoginPage.ts`)
- **`fixtures.ts`** : fixtures Playwright custom (Page Objects, etc.)
- **`tsconfig.json`** : config TypeScript du repo

## Authentification: `globalSetup.ts` + `storageState`

### Objectif

Éviter de refaire le login dans chaque test :

- `globalSetup.ts` fait un login sur `baseURL`
- Sauvegarde l’état d’auth dans `playwright/.auth/user.json`
- Tous les tests réutilisent cet état via `use.storageState`

### Fichier `globalSetup.ts` (résumé)

Ce fichier :

- Charge `.env` via `dotenv`
- Force l’attribut de test id à **`data-test`** (pour que `getByTestId()` soit cohérent même hors test runner)
- Lance Chromium, se connecte, attend `inventory.html`, puis écrit `storageState`

Points importants :

- **Pourquoi pas les fixtures dans `globalSetup` ?**
  - `globalSetup` s’exécute en dehors du “test runner”, donc il n’a pas accès à `test.extend(...)` de `fixtures.ts`.
  - On réutilise donc directement les **POM** (ex: `LoginPage`).

### Où est configuré le `storageState` ?

Dans `playwright.config.ts` :

- `globalSetup: require.resolve('./globalSetup')`
- `use.storageState: 'playwright/.auth/user.json'`

Donc chaque test démarre avec une session déjà authentifiée.

## Convention “data-test”

Le projet utilise l’attribut **`data-test="..."`**.

- Dans les tests, c’est configuré via `testIdAttribute: 'data-test'` (`playwright.config.ts`).
- Dans `globalSetup.ts`, on a ajouté `selectors.setTestIdAttribute('data-test')` car `globalSetup` n’hérite pas automatiquement de `testIdAttribute`.

## TypeScript (`tsconfig.json`)

Le `tsconfig.json` compile les fichiers TypeScript du repo et exclut les outputs / dépendances.

Si TypeScript disait “No inputs were found…”, c’était typiquement dû à un `include` pointant vers un dossier absent (ex: `src/`).

---

## Notes / TODO (à enrichir quand tu me le demanderas)

- Ajouter une section “CI”
- Ajouter des scripts npm (`package.json`) pour `test`, `test:ui`, `report`, etc.
- Ajouter un exemple de test “avec session” vs “sans session”

