# Mise en production du backend

Ce document liste **ce qu'il faut configurer pour un déploiement de production**,
et sépare explicitement ce qui diffère du développement. Il complète
`.env.example`, qui contient les valeurs de développement.

Le mode est déterminé par `MODE` :

| `MODE` | Interprétation |
|---|---|
| `DEV` | développement local et CI |
| toute autre valeur, ou variable absente | **production** |

---

## 1. Variables d'environnement

### 1.1 Communes dev / prod (mêmes clés, valeurs différentes)

| Variable | Obligatoire | Rôle |
|---|---|---|
| `MODE` | oui | `DEV` en dev/CI, `PROD` en production |
| `PORT` | oui | port d'écoute HTTP |
| `POSTGRES_HOST` | oui | hôte PostgreSQL (en prod : l'hôte pgbouncer) |
| `POSTGRES_PORT` | oui | port PostgreSQL |
| `POSTGRES_USER` | oui | utilisateur PostgreSQL |
| `POSTGRES_PASSWORD` | oui | mot de passe PostgreSQL |
| `POSTGRES_DATABASE` | oui | base de données |
| `JWT_SECRET` | oui | signature des access tokens — **le démarrage échoue si absent** |

Générer chaque secret avec :

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 1.2 Spécifiques à la production (mutualisation impossible)

Ces réglages ne peuvent pas partager la même valeur entre dev et prod : ils
arbitrent entre confort de développement et sécurité.

| Variable | Valeur DEV | Valeur PROD | Pourquoi la mutualisation est impossible |
|---|---|---|---|
| `DB_SYNCHRONIZE` | `true` | `false` | `synchronize` réécrit le schéma à chaud : indispensable en dev, destructeur en prod (voir §2) |
| `SEED_ON_BOOT` | `true` | `false` | Le seed insère un praticien et des créneaux de démonstration : ils n'ont rien à faire dans une base de production |
| `SWAGGER_ENABLED` | `true` | `false` | La documentation expose l'intégralité de la surface d'API, y compris les routes d'administration |
| `CORS_ORIGINS` | vide (`*`) | liste explicite | En dev on accepte n'importe quelle origine ; en prod seules les origines web légitimes doivent l'être. L'application mobile n'envoie pas d'en-tête `Origin` : elle n'est pas concernée par ce réglage |
| `JWT_REFRESH_SECRET` | facultatif (repli sur `JWT_SECRET`) | **obligatoire** | Séparer les secrets limite l'impact de la fuite de l'un des deux. En dev, le repli évite d'imposer une seconde variable ; en prod le démarrage échoue si elle manque |
| `SEED_PRACTITIONER_EMAIL` / `SEED_PRACTITIONER_PASSWORD` / `SEED_PRACTITIONER_NAME` | définies | **non définies** | Compte de démonstration : n'existe qu'en dev. Sans ces variables, aucun compte n'est semé |

### 1.3 Utilisées dans les deux environnements, valeurs au choix

| Variable | Défaut | Rôle |
|---|---|---|
| `JWT_ACCESS_EXPIRES_IN` | `1h` | durée de vie de l'access token |
| `JWT_REFRESH_EXPIRES_IN` | `30d` | durée de vie du refresh token |
| `PUBLIC_PRACTITIONER_EMAILS` | vide | liste blanche, séparée par des virgules, des adresses interrogeables sans authentification via `GET /practitioner-profile/by-email/:email` (voir §4) |

---

## 2. Schéma de base de données

Le module utilisateur gagne une colonne `tokenVersion`, support de la
révocation de jetons. Comme `DB_SYNCHRONIZE` doit rester à `false` en
production, appliquer la migration **avant** le premier déploiement :

```sql
ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS "tokenVersion" integer NOT NULL DEFAULT 0;
```

Le dépôt ne contient pas encore de dossier de migrations TypeORM
(`migrations: ['src/migration/*.ts']` pointe vers un répertoire vide et n'est de
toute façon pas résolu depuis `dist/`). Deux options pour l'amorçage initial :

1. exécuter le SQL ci-dessus (recommandé) ;
2. démarrer **une seule fois** avec `DB_SYNCHRONIZE=true`, puis repasser
   immédiatement à `false`.

Mettre en place de vraies migrations reste un chantier à part entière, à
planifier avant la prochaine évolution du schéma.

---

## 3. Secrets

`render.yaml` ne contient plus aucune valeur secrète : les identifiants de base
proviennent de `fromDatabase`, les secrets applicatifs sont déclarés
`sync: false` et saisis dans le dashboard Render.

> **Action obligatoire avant mise en production.** Le mot de passe PostgreSQL
> qui figurait en clair dans `render.yaml` reste présent dans l'historique git
> (commit `9830c53`). Il doit être considéré comme **compromis** :
>
> 1. roter le mot de passe de la base dans Render ;
> 2. générer de nouveaux `JWT_SECRET` et `JWT_REFRESH_SECRET` (la rotation de
>    `JWT_SECRET` invalide toutes les sessions en cours, ce qui est l'effet
>    recherché) ;
> 3. ne jamais réintroduire de secret dans un fichier versionné.
>
> Purger l'historique git (`git filter-repo`) ne dispense pas de la rotation :
> le secret a été exposé, la seule remédiation est de le changer.

---

## 4. Praticien d'accueil et route publique

`GET /practitioner-profile/by-email/:email` est la seule route publique du
module praticien : le parcours d'inscription professionnelle l'appelle avant
toute connexion, pour afficher les créneaux du praticien d'accueil.

Elle ne répond plus que pour les adresses listées dans
`PUBLIC_PRACTITIONER_EMAILS`, et renvoie une projection sans donnée de compte.
Toute adresse hors liste reçoit un `404` **sans que la base soit interrogée** :
la réponse ne dépend plus de l'existence du compte, ce qui supprime
l'énumération d'adresses.

**À configurer en production** : renseigner l'adresse du praticien d'accueil,
c'est-à-dire celle que le client mobile interroge aujourd'hui en dur.

```
PUBLIC_PRACTITIONER_EMAILS=adresse-du-praticien-accueil@exemple.com
```

Sans cette variable, l'écran « Choisissez votre créneau » de l'inscription
praticien affichera une erreur.

*Suivi recommandé* : sortir cette adresse du code du client mobile et la servir
depuis une configuration, pour ne plus dépendre d'une adresse personnelle
codée en dur.

---

## 5. Changements d'API à connaître côté clients

| Avant | Maintenant |
|---|---|
| `POST /user/login` renvoyait `{ access_token }` | renvoie `{ access_token, refresh_token, expires_in }` |
| — | `POST /auth/refresh` `{ refresh_token }` renouvelle le couple de jetons |
| — | `POST /auth/logout` (authentifié) révoque tous les jetons du compte |
| `POST /user/register` acceptait `role` | `role` est ignoré : la route crée toujours un compte `user` |
| `GET /user`, `PATCH /user/:id`, `DELETE /user/:id` publics | authentification requise ; `:id` doit être celui de l'appelant (ou un administrateur) |
| `GET /user/:id` (paramètre `email` sur une route `:id`) | supprimée ; remplacée par `GET /user/by-email/:email`, réservée aux administrateurs |
| — | `GET /user/me`, `PATCH /user/me`, `PUT /user/me`, `PATCH /user/me/password` |
| `GET /health`, `GET|PATCH|DELETE /health/:id` (échafaudage) | supprimées ; `GET /health` désigne sans ambiguïté la sonde de disponibilité |
| `GET /appointments*`, `GET /activity`, `GET /pratitioner-diplome` publics | authentification + contrôle de propriété |
| `POST /practitioner-profile/me/availability` prenait un `userId` | le créneau est rattaché au profil de l'appelant |

Le mot de passe ne peut plus être modifié via `PATCH /user/:id` : utiliser
`PATCH /user/me/password`, qui exige le mot de passe courant et révoque les
sessions ouvertes.

---

## 6. Checklist de déploiement

- [ ] Mot de passe PostgreSQL roté (§3)
- [ ] `JWT_SECRET` et `JWT_REFRESH_SECRET` générés et saisis dans Render
- [ ] `MODE=PROD`, `DB_SYNCHRONIZE=false`, `SEED_ON_BOOT=false`, `SWAGGER_ENABLED=false`
- [ ] `CORS_ORIGINS` renseignée si une interface web consomme l'API
- [ ] `PUBLIC_PRACTITIONER_EMAILS` renseignée (§4)
- [ ] Colonne `tokenVersion` créée (§2)
- [ ] `healthCheckPath` positionné sur `/health`
- [ ] Aucune variable `SEED_PRACTITIONER_*` définie en production

---

## 7. Points restants (hors périmètre de ce lot)

- **Migrations TypeORM** : à mettre en place (§2).
- **Politique de mot de passe** : la contrainte reste `MinLength(6)`, comme
  avant. La renforcer (longueur, complexité) est souhaitable mais rejetterait
  des inscriptions que le client mobile actuel laisse passer, avec un message
  d'erreur générique — à traiter conjointement avec le client.
- **`forbidNonWhitelisted`** : laissé à `false` pour rester compatible avec les
  clients mobiles publiés, qui envoient des champs surnuméraires. À passer à
  `true` une fois le parc aligné.
- **`GET /appointments/as-practitioner/:id`** : le client mobile appelle cette
  route, qui n'existe pas côté API (l'API expose
  `GET /appointments/practitioner/:id`). Incohérence préexistante, non corrigée
  ici.
- **Journalisation et supervision** : aucune journalisation d'accès aux données
  de santé n'est en place ; l'article 32 du RGPD la rend souhaitable.
