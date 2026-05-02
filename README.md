# Sauce Demo — E2E (Playwright + TypeScript)

Automatisation E2E du site **[Swag Labs / Sauce Demo](https://www.saucedemo.com/)** avec **Playwright**, **TypeScript**, authentification partagée via **`globalSetup`**, et rapports **Allure**.

## Dépôt Git distant

- **Remote**: `git@github.com:mouhamedfs/saucedemoE2E.git`
- **Branche principale**: `main`
- **Workflow conseillé**: développer sur une branche `feat/…`, pousser, ouvrir une **pull request** vers `main`, puis merger après revue.

```bash
git checkout -b feat/ma-feature
# … commits …
git push -u origin feat/ma-feature
```

Ensuite créer la PR sur GitHub (**Compare & pull request**) ou avec GitHub CLI :  
`gh pr create --base main --head feat/ma-feature`

## Prérequis

- Node.js + npm
- Compte & navigateurs Playwright installés localement

## Installation

```bash
npm install
npx playwright install
```

## Variables d’environnement (`.env`)

Le fichier **`.env` à la racine** n’est **pas versionné** (voir `.gitignore`). Copie les clés suivantes — valeurs d’exemple pour Sauce Demo :

```env
SAUCE_USERNAME=standard_user
SAUCE_PASSWORD=secret_sauce
FAKE_USERNAME=fake_user
FAKE_PASSWORD=fake_password
LOCKED_OUT_USER=locked_out_user
PROBLEM_USER=problem_user
PERFORMANCE_GLITCH_USER=performance_glitch_user
ERROR_USER=error_user
VISUAL_USER=visual_user
```

- **`globalSetup.ts`** utilise **`SAUCE_USERNAME`** / **`SAUCE_PASSWORD`** pour générer `playwright/.auth/user.json`.
- **`tests/login.spec.ts`** lit toutes ces variables selon les scénarios.

## Scripts npm

| Script | Commande |
|--------|----------|
| `npm test` | `playwright test` |
| `npm run test:ui` | Interface Playwright |
| `npm run test:headed` | Tests en navigateur visible |
| `npm run report` | Rapport HTML Playwright après coup |

## Commandes utiles

```bash
npm test
npx playwright test tests/login.spec.ts
npx playwright test --grep "visual_user"
npx playwright show-report
```

**Important — reporters**: si tu lances `npx playwright test --reporter=line`, tu **remplaces** les reporters définis dans `playwright.config.ts`, donc **Allure peut ne pas produire** `allure-results/` pour ce run. Pour Allure + console, garde la config par défaut ou ajoute `line` dans le tableau `reporter` du config.

## Structure du projet

| Fichier / dossier | Rôle |
|-------------------|------|
| `playwright.config.ts` | `baseURL`, projets navigateurs, `globalSetup` / `globalTeardown`, `storageState`, reporters |
| `globalSetup.ts` | Login une fois, écrit `playwright/.auth/user.json` (lit `.env`) |
| `globalTeardown.ts` | `allure generate` après la suite |
| `playwright/.auth/user.json` | État de session généré (ignoré par git) |
| `tests/login.spec.ts` | Scénarios **login** sans session préchargée (`storageState` vide) |
| `tests/inventory.spec.ts` | Exemple avec session issue du `storageState` global |
| `pom/LoginPage.ts` | Page Object login |
| `fixtures.ts` | Fixture `loginPage` |
| `tsconfig.json` | Compilation TypeScript |

## Authentification : `globalSetup` + `storageState`

1. Avant les tests, **`globalSetup`** ouvre un navigateur, se connecte avec les creds `.env`, puis **`context.storageState({ path: '…/user.json' })`**.
2. Dans **`playwright.config.ts`**, **`use.storageState`** pointe vers ce fichier : la plupart des specs démarrent **déjà connectées**.

### Tests qui ne doivent pas utiliser cette session

Pour **`tests/login.spec.ts`**, le fichier commence par :

```ts
test.use({ storageState: { cookies: [], origins: [] } });
```

Sinon le navigateur resterait connecté et la page login ne serait pas testée correctement.

### `data-test` et `getByTestId`

- Config tests : `testIdAttribute: 'data-test'` dans `playwright.config.ts`.
- Dans **`globalSetup`**, `selectors.setTestIdAttribute('data-test')` aligne le comportement hors runner.

## Reporting Allure

- Reporter **`allure-playwright`** dans la config.
- **`globalTeardown`** : `npx allure generate allure-results -o allure-report --clean`.

```bash
npx allure generate allure-results -o allure-report --clean
npx allure open allure-report
```

Si `allure open` échoue (permissions / port), ouvre **`allure-report/index.html`** dans le navigateur.

## TypeScript

Le `tsconfig.json` inclut les `**/*.ts` du repo. Une erreur du type *« No inputs were found »* venait souvent d’un `include` vers un dossier inexistant (ex. `src/` uniquement).

---

## Documentation Notion & lien avec ce projet

Il n’y a **pas de liaison automatique** fichier-par-fichier entre ton dossier local et Notion. Ce qui relie ton travail à Notion, c’est :

1. **Le plugin Notion dans Cursor** (serveur MCP `plugin-notion-workspace-notion`).
2. **L’authentification** une fois dans Cursor (outil `mcp_auth` / flux OAuth Notion).
3. **Les actions explicites** : créer ou mettre à jour une page / une tâche (comme ta carte dans la base **Tâches**), y coller le **lien GitHub**, la **PR**, ou une note dans **Résumé**.

Pour « suivre » le projet dans Notion : garde une **tâche ou une page projet** avec le champ **Résumé** ou une propriété URL pointant vers ce repo et vers la PR principale — c’est la méthode la plus simple et lisible pour la revue.

---

## TODO / pistes

- CI (GitHub Actions) : `npm ci`, `npx playwright install --with-deps`, `npm test`
- Éventuel projet Playwright dédié « sans auth » si tu multiplies les specs login
