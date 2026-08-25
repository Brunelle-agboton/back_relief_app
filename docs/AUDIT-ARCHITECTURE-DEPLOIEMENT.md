# Audit d'architecture, de logique métier et de déploiement — BackRelief

**Périmètre** : `backend/` (NestJS 11 / TypeORM / PostgreSQL) et `front-client/` (Expo SDK 53 / React Native 0.79), infrastructure (`docker-compose.yml`, `render.yaml`, CI GitHub Actions).
**Objectif** : évaluer la maturité technique en vue d'une publication complète sur l'App Store et le Google Play Store, pour les marchés canadien et français.
**Date** : 2026-08-21 — **Commit analysé** : `f3d2ff4`

---

## Verdict

**L'application n'est pas publiable en l'état.** Trois familles de problèmes bloquent la mise en production, dans cet ordre de gravité :

1. **Sécurité** — 47 des 69 routes de l'API sont accessibles sans authentification, dont l'intégralité des données de santé et la base utilisateurs (hash de mots de passe inclus). Aucune validation d'entrée n'est active.
2. **Déploiement** — dans la configuration `PROD` actuelle, le schéma de base de données n'est jamais créé : `synchronize` est désactivé et aucune migration n'existe. L'API ne peut pas démarrer utilement.
3. **Conformité & stores** — la suppression de compte in-app (obligatoire chez Apple), la politique de confidentialité accessible et l'internationalisation FR/EN sont absentes ; l'hébergement actuel n'est pas compatible avec l'hébergement de données de santé en France.

Le code applicatif lui-même est structuré et lisible. Les problèmes relevés sont principalement des **couches manquantes** (autorisation, validation, migrations, configuration d'environnement), pas une dette structurelle profonde. C'est une bonne nouvelle : le chemin vers la production est long mais linéaire.

---

## 1. Architecture technique — état des lieux

### 1.1 Vue d'ensemble

| Couche | Technologie | État |
|---|---|---|
| Application mobile | Expo SDK 53, React Native 0.79, expo-router 5, New Architecture | Fonctionnelle, buildable |
| API | NestJS 11, TypeORM 0.3, PostgreSQL | Fonctionnelle en dev, non déployable en prod |
| Temps réel | Socket.IO (`/webrtc`), signalisation WebRTC | Signalisation seule, sans client |
| Base de données | PostgreSQL + PgBouncer (Render) | Provisionnée, schéma non versionné |
| Monitoring | Sentry (front) | Intégré |
| CI | GitHub Actions (build, tests, lint) | Partielle |

Le monorepo compte **15 modules NestJS** (`user`, `auth`, `health`, `activity`, `program`, `program-line`, `exercise`, `summary`, `notification`, `appointment`, `availability`, `practitioner_profile`, `practitioner_diplome`, `rooms`/`webrtc`), suivant tous la même structure `controller` / `service` / `entity` / `dto`.

### 1.2 Points forts

- **Découpage modulaire cohérent.** La convention NestJS est respectée partout ; l'ajout d'un module ne demande aucune décision d'architecture.
- **Stockage du token côté client bien fait.** `expo-secure-store` (Keychain / Keystore) et non AsyncStorage, avec intercepteur Axios qui purge le token et déconnecte sur `401` (`front-client/services/api.ts:38`).
- **Système de feature flags** (`front-client/config/featureFlags.ts`) permettant un lancement segmenté — la téléconsultation et l'espace praticien sont déjà désactivés pour la V1. C'est exactement la bonne approche pour un premier dépôt sur les stores.
- **Horodatages en `timestamp with time zone`** sur `appointments` et `availabilities` — indispensable pour un service Canada/France, et souvent oublié.
- **Rate limiting** global (`ThrottlerModule`) et renforcé sur `login` / `register` (5 req/min).
- **Sentry** déjà intégré côté mobile, `targetSdkVersion 35` conforme aux exigences Play Store 2025.

### 1.3 Faiblesses structurelles

| # | Faiblesse | Conséquence |
|---|---|---|
| ARC-01 | **Aucune couche d'autorisation.** `JwtAuthGuard` est appliqué route par route, manuellement. Pas de RBAC, pas de vérification de propriété des ressources. | Sécurité (§2) — et blocage direct pour la 2ᵉ interface prévue (§8) |
| ARC-02 | **`ValidationPipe` global absent.** Les décorateurs `class-validator` des 30+ DTO ne sont jamais exécutés. | Toute la validation d'entrée est du code mort |
| ARC-03 | **Aucune migration.** `migrations: ['src/migration/*.ts']` pointe vers un dossier inexistant, et vers des sources TS non présentes dans le build. | Schéma non reproductible, non déployable (§4) |
| ARC-04 | **Pas de séparation dev / prod.** Le seed s'exécute à chaque démarrage, Swagger est exposé publiquement, CORS est en `*`. | Fuites d'information et pollution des données de production |
| ARC-05 | **État WebSocket en mémoire** (`socketsByUser`, `rooms`, `initiatorByRoom`). | Rend toute mise à l'échelle horizontale impossible |
| ARC-06 | **Couplage front↔back par URL en dur.** `front-client/context/SocketContext.tsx:25` contient un tunnel ngrok. | Le socket ne fonctionnera pas en production |
| ARC-07 | **Aucune internationalisation.** Toutes les chaînes sont en français, en dur dans les composants. | Bloque le marché canadien anglophone (§7) |
| ARC-08 | **Authentification symétrique (HS256) à secret partagé.** | Bloque l'ajout d'un backend complémentaire (§8) |

---

## 2. Sécurité

### 2.1 Le chiffre principal

Inventaire automatisé des routes exposées :

```
TOTAL : 69 routes    SANS AUTHENTIFICATION : 47    AVEC JWT : 22
```

Parmi les 47 routes publiques figurent la lecture intégrale des utilisateurs, des relevés de douleur, des rendez-vous et des activités.

### 2.2 Vulnérabilités bloquantes

#### SEC-01 — Exposition complète de la base utilisateurs *(bloquant)*
`GET /user` (`backend/src/modules/user/user.controller.ts:35`) n'a aucun guard et retourne `usersRepository.find()` sans projection. L'entité `User` n'a **ni `@Exclude()` ni `select: false`** sur `password`.

Sont exposés publiquement : e-mail, nom, rôle, **hash bcrypt du mot de passe**, âge, poids, taille, sexe. Le même défaut affecte `POST /user/register`, qui renvoie l'objet `User` complet.

> Ce point constitue à lui seul une violation caractérisée du RGPD (art. 32) et de la Loi 25 québécoise, avec obligation de notification à la CNIL / CAI en cas d'exploitation.

#### SEC-02 — Modification et suppression de n'importe quel compte *(bloquant)*
`PATCH /user/:id` et `DELETE /user/:id` sont publics. N'importe qui peut supprimer un compte arbitraire ou en modifier les données.

#### SEC-03 — Escalade de privilèges à l'inscription *(bloquant)*
`CreateUserDto` expose `role: string`, repris tel quel par `usersRepository.create({...dto})`. Un `POST /user/register` avec `"role": "practitioner"` crée un compte praticien. Combiné à `PATCH /user/:id` (SEC-02), n'importe quel rôle peut être attribué à n'importe quel compte, sans authentification.

#### SEC-04 — Données de santé accessibles sans authentification *(bloquant)*
| Route | Donnée exposée |
|---|---|
| `GET /health/:id` | Relevé de douleur de n'importe quel utilisateur |
| `PATCH /health/:id`, `DELETE /health/:id` | Modification / suppression de ces relevés |
| `GET /appointments` | Tous les rendez-vous patient↔praticien |
| `GET /appointments/as-patient/:id` | Agenda médical d'un patient donné |
| `GET /activity` | Historique d'activité de tous les utilisateurs |
| `GET /pratitioner-diplome` | Diplômes et pièces justificatives des praticiens |
| `GET /practitioner-profile/by-email/:email` | Énumération d'e-mails de praticiens |

Ce sont des **données de santé au sens de l'art. 9 du RGPD** (catégorie particulière).

> *Nuance :* `HealthController.findAll()` (`GET /health`) est en pratique inaccessible, masqué par la sonde de disponibilité `GET /health` déclarée dans `AppController`, enregistré avant lui. Le listing global est donc neutralisé — **par accident, pas par conception**. Les routes unitaires `:id` restent, elles, pleinement exposées.

#### SEC-05 — Aucune validation d'entrée *(bloquant)*
`main.ts` n'appelle jamais `app.useGlobalPipes(new ValidationPipe(...))`. Aucun `@UsePipes` local n'existe. Conséquences :
- les contraintes `@IsEmail`, `@MinLength`, `@IsNumber` ne s'appliquent pas ;
- l'absence de `whitelist: true` autorise le **mass assignment** — `UserService.update()` fait un `Object.assign(user, dto)` brut ;
- des types inattendus atteignent directement TypeORM.

#### SEC-06 — Secret de production versionné *(bloquant)*
`render.yaml:12` contient en clair la chaîne de connexion PostgreSQL :
```
postgresql://backrelief:8oZs…KV0@dpg-d7h6ve67r5hc73duiu1g-a/healthtracker_51um
```
Le secret est également **présent dans l'historique git** (commit `9830c53`). Il doit être considéré comme compromis : rotation obligatoire, la suppression du fichier ne suffit pas.

Par ailleurs, `front-client/.env` est versionné (le DSN Sentry public y figure — acceptable, mais la pratique est à corriger).

### 2.3 Vulnérabilités critiques

#### SEC-07 — Références directes non contrôlées (IDOR)
Ces routes sont authentifiées mais n'associent jamais la ressource à l'appelant :

| Route | Problème |
|---|---|
| `GET /user/me/:id` | Utilise `:id` au lieu de `req.user.userId` — lecture de n'importe quel profil |
| `GET /activity/:id` | `findByUser(+id)` ignore `req.user` |
| `PATCH /practitioner-profile/:id`, `DELETE /practitioner-profile/:id` | Aucun contrôle de propriété |
| `PATCH /practitioner-profile/complete-profile/:id` | Idem |
| `POST /practitioner-profile/me/availability` | `req.user` est explicitement ignoré (ligne commentée) — un utilisateur peut créer des créneaux pour un autre praticien |
| `PATCH /user/:id/settings` | Aucun contrôle de propriété |

#### SEC-08 — Faiblesses de la chaîne JWT
- **Secret de repli en dur** : `webrtc.gateway.ts:44` utilise `process.env.JWT_SECRET || 'secretKey'`. Si la variable manque, tout jeton devient forgeable.
- **Le rôle est perdu à la validation** : `jwt.strategy.ts` retourne `{ userId, email }` et **supprime `role`**, alors que le payload le contient. Aucun contrôle de rôle n'est donc possible côté API.
- **Pas de refresh token** : expiration à 1 h, sans renouvellement. L'utilisateur est déconnecté toutes les heures — un motif fréquent de rejet en revue Apple et un problème d'usage majeur.
- **Pas de révocation** : la déconnexion supprime le token côté client uniquement ; un jeton volé reste valide jusqu'à expiration.

#### SEC-09 — Mots de passe stockés en clair
`UserService.update()` ne hashe pas le champ `password` (contrairement à `create()`). Un `PATCH /user/:id` avec un mot de passe écrit une valeur **en clair** en base — et rend le compte inutilisable, `bcrypt.compare` échouant ensuite.

Le seed (`seedTF.ts:17`) insère de la même façon un praticien avec le mot de passe en clair `Password100` et une adresse e-mail personnelle réelle.

### 2.4 Vulnérabilités majeures

| # | Constat | Emplacement |
|---|---|---|
| SEC-10 | `CORS: origin '*'` avec `Authorization` autorisé, et **Swagger exposé publiquement sur `/api`** en production — l'API entière est cartographiée pour un attaquant | `main.ts:14`, `main.ts:52` |
| SEC-11 | `ssl: { rejectUnauthorized: false }` en production — le certificat du serveur PostgreSQL n'est pas vérifié (MITM possible) | `config/config.service.ts:52` |
| SEC-12 | Le throttler indexe par IP sans `trust proxy`. Derrière un load balancer, **tous les utilisateurs partagent le même quota** (10 req/min) | `app.module.ts:44` |
| SEC-13 | Salons WebRTC : tout utilisateur authentifié peut rejoindre n'importe quel `roomId` de moins de 2 participants. Les identifiants sont **prédictibles** (`room-${Date.now()}`) et aucun lien n'est vérifié avec un rendez-vous | `rooms.controller.ts:10`, `webrtc.gateway.ts:88` |
| SEC-14 | Absence de `helmet`, de `compression`, de logs structurés et de `enableShutdownHooks()` | `main.ts` |

---

## 3. Logique métier

#### MET-01 — Double réservation possible *(critique)*
`AppointmentService.create()` enchaîne : recherche du créneau → test `isBooked` → écriture `isBooked = true` → création du rendez-vous. Ces quatre étapes ne sont **ni transactionnelles ni verrouillées**, et aucune contrainte d'unicité ne protège la table.

Deux requêtes simultanées sur le même créneau produisent deux rendez-vous confirmés. Sur un service de prise de rendez-vous médical, c'est un défaut fonctionnel de premier ordre.

**Correctif** : `dataSource.transaction()` + `SELECT … FOR UPDATE` sur la disponibilité, doublé d'un index unique partiel sur `(practitioner_id, start_at) WHERE status = 'confirmed'`.

#### MET-02 — Route de l'agenda praticien cassée *(critique)*
`appointment.service.ts:88` : `relations: ['patient', 'practitionerPofile']` — faute de frappe, il manque le `r` de `practitionerProfile`. TypeORM lève une erreur à l'exécution : **`GET /appointments/practitioner/:id` échoue systématiquement**. L'agenda praticien est donc non fonctionnel (masqué à ce jour par le flag `proAgenda: false`).

#### MET-03 — L'hydratation n'est rattachée à aucun utilisateur *(critique)*
`health.controller.ts:60` charge bien l'utilisateur, puis appelle `this.healthService.setHydratation(size)` — **sans le transmettre**. Le relevé est enregistré sans propriétaire, et `GET /health/hydration-latest`, qui filtre par utilisateur, ne peut rien retrouver. Le suivi d'hydratation est cassé de bout en bout.

De plus, `@Body() size: string` lie le corps entier de la requête à une chaîne, ce qui ne correspond pas au JSON envoyé.

#### MET-04 — Seed exécuté au démarrage en production *(majeur)*
`main.ts:22-42` lance `seedRestExercise()` et `runSeed()` à chaque `bootstrap()`. Trois problèmes :
- insertion d'un compte praticien avec mot de passe en clair et **PII réelle** en base de production ;
- avec plusieurs instances, les seeds s'exécutent **en parallèle** (le garde-fou `SELECT COUNT(*)` n'est pas atomique) → doublons ;
- toute erreur est avalée par un `catch` qui journalise `'failed'` et poursuit le démarrage.

Les données de référence (exercices, programmes) doivent passer par des **migrations de données**, et les comptes de test ne doivent jamais atteindre la production.

#### MET-05 — Onboarding praticien fragile *(majeur)*
`auth.service.ts:57` crée systématiquement un rendez-vous avec `practitionerId: 1` — valeur codée en dur, contredite par le commentaire juste au-dessus (« user ID 2 »). Les trois écritures (utilisateur, profil, rendez-vous) ne sont pas transactionnelles : un échec laisse un compte orphelin sans profil.

#### MET-06 — Récurrence et fuseaux déclarés mais inexploités *(majeur)*
`Availability` porte `is_recurring`, `rrule` et `timezone`, mais aucune logique ne les lit. Les créneaux récurrents ne sont donc jamais générés, et le fuseau du praticien n'intervient pas dans le calcul des disponibilités.

**C'est un point d'attention direct pour la contrainte Canada + France** : un praticien à Montréal et un patient à Paris travaillent sur 6 h de décalage, avec des dates de passage à l'heure d'été différentes (2ᵉ dimanche de mars vs dernier dimanche de mars). Le stockage en `timestamptz` est correct ; c'est la **couche de présentation et de génération des créneaux** qui doit être rendue explicitement consciente du fuseau.

#### MET-07 — Aucune notification push *(majeur)*
Les rappels sont purement locaux (`expo-notifications` planifié sur l'appareil). Aucun jeton push n'est enregistré, aucun envoi serveur n'existe : l'entité `Notification` du backend n'est reliée à rien.

Conséquence : **aucun rappel de rendez-vous** ne peut être envoyé, et un rendez-vous annulé côté praticien ne notifie pas le patient. Pour une V1 centrée sur les rappels d'hygiène de vie, les notifications locales suffisent ; dès l'ouverture de la prise de rendez-vous, le push serveur devient indispensable.

#### MET-08 — Téléconsultation : signalisation sans client *(majeur)*
Le backend implémente une signalisation WebRTC complète (offer / answer / ICE). Côté mobile, il n'existe **ni `react-native-webrtc`, ni `RTCPeerConnection`, ni `getUserMedia`** — aucun serveur STUN/TURN n'est par ailleurs configuré. La fonctionnalité est donc inexistante côté client ; le flag `teleconsultation: false` est cohérent avec cet état.

À prévoir avant activation : bibliothèque WebRTC, serveur TURN (indispensable sur réseaux mobiles), permissions caméra/micro, et adaptateur Redis pour la signalisation multi-instances.

#### MET-09 à MET-12 — Défauts mineurs
| # | Constat |
|---|---|
| MET-09 | `GET /user/:id` déclare `@Param('email')` alors que la route expose `:id` — le paramètre est toujours `undefined` |
| MET-10 | `UserService.findOne()` lève `new Error(...)` → réponse **500** au lieu de **404** ; même motif dans `health` et `summary` |
| MET-11 | `SummaryService.getSummaryForUser()` : requête N+1 (`findOne` par activité) et `JSON.parse(act.metadata)` sans `try/catch` — une métadonnée malformée fait tomber la route |
| MET-12 | `handleJoinRoom()` contient deux tests d'appartenance redondants et contradictoires, dont l'un modifie l'initiateur du salon en cas de double join |

---

## 4. Blocages de déploiement du backend

#### DEP-01 — Le schéma n'est jamais créé en production *(bloquant)*
```ts
// config/config.service.ts
synchronize: !this.isProduction(),
migrations: ['src/migration/*.ts'],
```
`isProduction()` renvoie `true` dès que `MODE !== 'DEV'` — y compris si la variable est absente. En production :
- `synchronize` est donc `false` ;
- le dossier `src/migration/` **n'existe pas** ;
- `migrationsRun` n'est pas activé, donc aucune migration ne serait exécutée de toute façon ;
- le chemin cible des sources `.ts`, absentes du build compilé.

**Résultat : aucune table n'est créée, et la première requête échoue.** La seule façon de faire fonctionner l'API aujourd'hui est de déployer avec `MODE=DEV`, ce qui active `synchronize` — c'est-à-dire l'altération automatique du schéma de production à chaque déploiement, avec risque de perte de données.

C'est le point le plus urgent du présent audit sur le plan opérationnel.

#### DEP-02 — Aucune URL de production valide *(bloquant)*
- `eas.json` : `EXPO_PUBLIC_API_URL: "https://your-production-api.com/"` — valeur d'exemple.
- `front-client/.env` et `SocketContext.tsx:25` : tunnel **ngrok gratuit** (`privately-beloved-cowbird.ngrok-free.app`), dont l'URL change à chaque redémarrage.

Un binaire compilé avec ces valeurs est inutilisable. L'URL du socket doit en outre être dérivée de `EXPO_PUBLIC_API_URL` et non codée en dur.

#### DEP-03 — Image Docker en mode développement *(bloquant)*
```dockerfile
FROM node:20
RUN npm install          # devDependencies incluses
CMD ["npm", "run", "start"]   # = nest start → compilation au démarrage
```
L'image embarque toute la chaîne de développement, compile au lancement, s'exécute en `root`, ne fixe aucune version de base, et **aucun `.dockerignore` n'existe** dans le dépôt. Le script `start:prod` (`node dist/main.js`) n'est jamais utilisé.

Attendu : build multi-étapes, `npm ci --omit=dev` sur l'étage final, utilisateur non privilégié, `HEALTHCHECK`, image de base épinglée.

#### DEP-04 — Images servies depuis un chemin absent de l'image *(critique)*
`app.module.ts:41` sert les fichiers statiques depuis `join(__dirname, '..', '..', 'front-client', 'assets', 'images')`. Ce chemin n'existe que grâce au montage de volume de `docker-compose`. Dans une image de production ne contenant que le backend, **toutes les illustrations d'exercices renverront 404**.

Les médias doivent être déplacés vers un stockage objet (S3 / Scaleway Object Storage) servi par un CDN.

#### DEP-05 — Aucun service web déclaré dans `render.yaml` *(critique)*
Le fichier ne définit qu'une base de données et un PgBouncer. **L'API elle-même n'est pas décrite en infrastructure-as-code** — son déploiement est donc manuel et non reproductible.

#### DEP-06 — Mise à l'échelle horizontale impossible *(critique)*
L'état des salons WebRTC vit dans des `Map` en mémoire du processus. Au-delà d'une instance, deux participants d'une même consultation peuvent atterrir sur des processus différents et ne jamais se voir. Nécessite `@socket.io/redis-adapter` et des sessions persistantes (sticky sessions).

#### DEP-07 — Absence de socle d'exploitation *(majeur)*
Pas de `helmet`, pas de `compression`, pas de `enableShutdownHooks()` (les déploiements coupent les requêtes en cours), pas de logs structurés (`pino`) ni d'identifiant de corrélation, pas de sonde `/ready` distincte de `/health`, pas de Sentry côté backend (uniquement côté mobile).

---

## 5. Conformité — Canada et France

Cette section relève des exigences applicables ; elle ne constitue pas un avis juridique. Une validation par un conseil spécialisé est recommandée avant lancement.

### 5.1 France / Union européenne

| Sujet | Exigence | État |
|---|---|---|
| **Nature des données** | Les relevés de douleur, l'hydratation et les rendez-vous avec un praticien sont des **données de santé** (RGPD art. 9) | Traitées sans protection (§2) |
| **Base légale** | Consentement explicite, recueilli séparément des CGU | Absent |
| **Hébergement (HDS)** | L'hébergement de données de santé produites dans un contexte de **prévention, diagnostic ou soin** impose un hébergeur **certifié HDS** (art. L1111-8 CSP) | **Render n'est pas certifié HDS** |
| **Résidence des données** | Non obligatoire, mais fortement attendue en UE pour ce type de service | Base actuellement hors UE |
| **Droits des personnes** | Accès, rectification, effacement, portabilité | Aucun mécanisme |
| **Sous-traitants** | DPA signés (hébergeur, Sentry), registre des traitements | À constituer |
| **Sécurité** | Art. 32 — chiffrement, contrôle d'accès, journalisation | Non satisfait |

> **Point d'arbitrage important.** Tant que l'application reste positionnée « bien-être » (suivi personnel, sans intervention de professionnel de santé), l'obligation HDS est discutable. **Dès l'activation de la téléconsultation et de la prise de rendez-vous avec des praticiens, elle devient difficilement contournable.** Le choix d'hébergeur doit donc être fait maintenant en anticipant cette évolution — migrer un hébergement de données de santé après coup est nettement plus coûteux.

Il faut également veiller au **positionnement produit** : toute allégation de diagnostic ou de traitement ferait basculer l'application dans le champ du **règlement (UE) 2017/745 sur les dispositifs médicaux** (marquage CE), avec des conséquences réglementaires majeures. Le vocabulaire de l'application et des fiches store doit rester celui de la prévention et du bien-être, avec un avertissement explicite invitant à consulter un professionnel de santé.

### 5.2 Canada et Québec

| Sujet | Exigence |
|---|---|
| **PIPEDA** (fédéral) | Consentement valable, finalités limitées, mesures de sécurité proportionnées à la sensibilité — les données de santé sont au plus haut niveau |
| **Loi 25** (Québec) | Responsable de la protection des renseignements personnels désigné et publié ; politique de confidentialité accessible ; **évaluation des facteurs relatifs à la vie privée (EFVP)** avant tout transfert hors Québec ; notification obligatoire des incidents de confidentialité |
| **Loi 96** (Québec) | Le français doit être disponible et de qualité au moins équivalente aux autres langues |
| **Marché anglophone** | Le reste du Canada attend une interface en anglais |

Les données du seed (`America/Montreal`, « Établissement de santé canadien ») confirment un ciblage québécois. Le stack actuel étant hébergé hors Québec, une **EFVP sera requise**.

### 5.3 Synthèse de la contrainte bi-juridictionnelle

Les deux régimes ne pointent pas vers la même région : **c'est le positionnement produit qui tranche**, pas la géographie des utilisateurs.

- **Hors contexte de soin** (V1 bien-être, téléconsultation désactivée) : HDS n'est pas déclenché, et la décision d'adéquation dont bénéficie le Canada autorise l'hébergement des données d'utilisateurs français au Canada. Un hébergement **à Montréal** satisfait alors les deux régimes — et supprime au passage l'obligation d'EFVP de la Loi 25, les données ne quittant pas le Québec.
- **En contexte de soin** (téléconsultation, praticiens français) : le référentiel HDS v2 impose l'hébergement **dans l'EEE** depuis le 16 mai 2026. Le Canada devient alors impossible pour ces données, et l'architecture passe obligatoirement à deux cellules régionales.

Le détail des options et la décision de conception à prendre dès maintenant figurent en §6.2.

## 6. Recommandations de déploiement du backend

### 6.1 Architecture cible

```
                    ┌──────────────────┐
   App mobile ──────▶   CDN / WAF      │◀───── Interface web (à venir)
   (iOS/Android)    └────────┬─────────┘
                             │ HTTPS + HSTS
                    ┌────────▼─────────┐
                    │  API NestJS      │   2 instances min., autoscaling
                    │  (conteneur)     │   région : UE (Paris)
                    └───┬────────┬─────┘
                        │        │
          ┌─────────────▼──┐  ┌──▼──────────────┐
          │ PostgreSQL     │  │ Redis           │
          │ managé + PITR  │  │ throttler +     │
          │ chiffré au     │  │ socket.io       │
          │ repos          │  │ adapter + cache │
          └────────────────┘  └─────────────────┘
                        │
          ┌─────────────▼──────────────┐
          │ Stockage objet (médias)    │
          │ + CDN                       │
          └────────────────────────────┘
```

### 6.2 Choix d'hébergement

Le choix ne se décide pas sur la latence, mais sur **une seule question** : l'application opère-t-elle dans un *contexte de soin* en France ?

#### La règle qui tranche

Deux faits, vérifiés en août 2026, encadrent entièrement la décision :

- **Le référentiel HDS v2, applicable depuis le 16 mai 2026, impose l'hébergement physique dans l'EEE** (UE + Norvège, Islande, Liechtenstein), avec obligation de publier une cartographie des transferts hors EEE. Conséquence directe : **aucun fournisseur ne peut couvrir depuis le Canada des données de santé françaises produites dans un contexte de soin.** Il n'existe pas de contournement contractuel — la certification AWS porte sur Paris (`eu-west-3`), celle d'Azure sur les régions France, celle de GCP sur ses régions européennes.
- **Le Canada bénéficie d'une décision d'adéquation de la Commission européenne**, renouvelée en janvier 2024 et toujours en vigueur, limitée aux organismes commerciaux soumis à la PIPEDA. Conséquence : **hors contexte de soin, héberger au Canada les données d'utilisateurs français est licite sans clauses contractuelles types.**

Les deux marchés sont donc conciliables dans une seule région **tant que la téléconsultation reste désactivée** — et structurellement inconciliables dès qu'elle est activée en France.

#### Scénario A — priorité Canada, V1 telle qu'elle est *(recommandé aujourd'hui)*

Positionnement bien-être, `teleconsultation: false`, pas de praticien français en exercice. HDS n'est pas déclenché, l'adéquation couvre le transfert. **Héberger à Montréal**, ce qui apporte un bénéfice de conformité souvent ignoré : les données restant **physiquement au Québec**, l'obligation d'EFVP de la Loi 25 pour communication hors Québec disparaît.

| Option | Région | Pourquoi |
|---|---|---|
| **Google Cloud** — Cloud Run + Cloud SQL + Memorystore | `northamerica-northeast1` (Montréal) | **Recommandé.** Le moins d'exploitation pour une petite équipe, mise à l'échelle jusqu'à zéro, coût de lancement faible. `europe-west9` (Paris, certifié HDS) disponible pour la future cellule France, sans changer de fournisseur |
| **AWS** — Fargate + RDS + ElastiCache | `ca-central-1` (Montréal) | Alternative si la téléconsultation arrive tôt : sockets longue durée plus conventionnels derrière un ALB, catalogue de services plus large. `eu-west-3` (Paris) certifié HDS |
| **OVHcloud** | Beauharnois (Québec) | Option budget, entreprise française (DPA en français), HDS en France. Services managés moins riches |
| **Azure** | Canada East (Québec) | Canada Central est en Ontario — choisir Canada East pour rester au Québec |
| **Render** (actuel) | — | Aucune région canadienne, non certifié HDS. À conserver au plus pour une recette sans données réelles |

**Latence pour les utilisateurs français** : Montréal ↔ Paris représente environ 85 à 95 ms d'aller-retour, soit un round-trip supplémentaire par appel API. C'est acceptable pour cette charge de travail — et surtout, **les médias (illustrations d'exercices), qui constituent l'essentiel des octets transférés, passent par un CDN avec des points de présence dans les deux marchés**. L'écart perçu par un utilisateur français reste donc faible.

#### Scénario B — téléconsultation ou praticiens français activés

HDS v2 impose alors l'EEE pour ces données. Le Canada-primaire devient impossible pour la partie française, et l'architecture passe obligatoirement à **deux cellules** : Montréal pour le Canada, une région UE certifiée HDS (Paris) pour la France, avec partitionnement des données par marché et un service d'identité commun (§8).

#### La décision à prendre maintenant

Le choix de région est réversible ; **le modèle de données ne l'est pas.** Deux dispositions à prendre dès le P0, presque gratuites aujourd'hui et très coûteuses après coup :

1. **Ajouter un discriminant de résidence** (`region` / `data_residency`) sur `User` et sur les entités qui en dépendent, et proscrire les clés étrangères transversales entre marchés.
2. **Passer les identifiants en UUID.** Toutes les entités utilisent aujourd'hui `@PrimaryGeneratedColumn('increment')`. Si la base est un jour scindée en deux cellules, **les identifiants entiers entreront en collision** — la migration devient alors une reprise de données complète. Le changement coûte une migration aujourd'hui.

Autrement dit : héberger à Montréal pour servir la priorité canadienne, mais concevoir dès maintenant le partitionnement qui permettra d'ouvrir une cellule française sans reprise de données.

### 6.3 Budget d'hébergement

Tarifs publics à la demande relevés en août 2026 pour Google Cloud, région `northamerica-northeast1` (Montréal). Ce sont des **ordres de grandeur pour cadrer un budget**, pas un devis : la majoration Montréal par rapport à `us-central1` est estimée à +10 %, et la facture réelle dépend de l'usage. À valider avec le [calculateur officiel](https://cloud.google.com/products/calculator) une fois la configuration figée.

#### Le poste dominant n'est pas celui qu'on croit

| Poste | $US/mois | $CA/mois | €/mois |
|---|---:|---:|---:|
| **Cloud SQL** 1 vCPU / 3,75 Go / 20 Go SSD, sans HA, IP privée | 62 | 85 | 53 |
| ↳ *avec engagement 1 an (−25 %)* | *46* | *64* | *40* |
| **Cloud Run** — scale-to-zero (reste dans le palier gratuit) | 0 | 0 | 0 |
| **Cloud Run** — 0,5 vCPU chaud en permanence | 42 | 58 | 36 |
| **Cloud Run** — 1 vCPU chaud en permanence | 86 | 119 | 74 |
| Cloud Storage + egress médias | 1 | 1 | 1 |
| Artifact Registry + Secret Manager + journaux | 2 | 3 | 2 |

**Le constat qui pilote le budget : maintenir une instance Cloud Run chaude 24 h/24 coûte plus cher que la base de données** — 86 $US/mois d'astreinte pour 1 vCPU, avant même le premier appel API. C'est le principal levier d'arbitrage.

À l'inverse, **les médias ne coûtent rien** : les actifs mesurés dans le dépôt représentent 6 Mo au total (139 fichiers, dont 3,4 Mo réellement servis par l'API pour les pauses actives). Même à 10 000 utilisateurs, l'egress reste sous la barre des 3 $US/mois.

#### Scénarios au lancement (≈ 1 000 utilisateurs actifs mensuels)

| Configuration | $US/mois | $CA/mois | €/mois | $US/an |
|---|---:|---:|---:|---:|
| **Mini** — scale-to-zero + engagement 1 an | 49 | 68 | 42 | 590 |
| **Sobre** — scale-to-zero, sans engagement | 65 | 89 | 55 | 775 |
| **Confort** — 0,5 vCPU chaud + engagement 1 an | 91 | 125 | 78 | 1 093 |
| **Confort +** — 1 vCPU chaud, sans engagement | 151 | 208 | 129 | 1 811 |

Le compromis entre « Mini » et « Confort » est un **arbitrage coût contre démarrage à froid** : en scale-to-zero, la première requête après une période d'inactivité subit 2 à 5 secondes de latence, le temps que NestJS et le pool TypeORM s'initialisent. Deux atténuations : une tâche Cloud Scheduler qui appelle `/health` toutes les 5 minutes garde une instance tiède pour quelques dollars par mois — sans garantie formelle, Cloud Run pouvant recycler l'instance ; ou passer à 0,5 vCPU chaud, qui divise l'astreinte par deux.

**Recommandation pour le lancement : configuration « Sobre » (≈ 65 $US / 89 $CA par mois), sans engagement.** L'engagement 1 an n'a de sens qu'une fois la charge réelle observée — s'engager avant d'avoir mesuré revient à parier sur un dimensionnement non validé.

#### Paliers suivants

| Palier | $US/mois | $CA/mois | €/mois | $US/an |
|---|---:|---:|---:|---:|
| ≈ 10 000 MAU — 2 vCPU / 7,5 Go, Redis, 1 instance chaude | 261 | 359 | 224 | 3 133 |
| ≈ 50 000 MAU — haute disponibilité, 2 instances | 549 | 755 | 470 | 6 586 |

La haute disponibilité double le coût de calcul de la base et fait passer le stockage SSD de 0,222 à 0,34 $US/Go-mois. Elle n'est pas nécessaire au lancement : une instance mono-zone avec PITR et une restauration testée constitue une posture défendable pour une V1.

#### Hors hébergement — à ne pas oublier dans le budget client

| Poste | Coût |
|---|---|
| Compte développeur Apple | 99 $US / an |
| Compte développeur Google Play | 25 $US, paiement unique |
| Sentry | Palier gratuit suffisant au lancement ; ≈ 26 $US/mois ensuite |
| EAS Build (compilation des binaires) | Palier gratuit limité ; ≈ 99 $US/mois en usage soutenu, ou paiement à la compilation |
| Serveur TURN (téléconsultation) | À prévoir uniquement à l'activation — compter 20 à 50 $US/mois pour un `coturn` auto-hébergé |
| Certification HDS (cellule France) | Uniquement en scénario B — surcoût d'hébergement, non chiffré ici |

Au total, un lancement en configuration « Sobre » représente de l'ordre de **65 à 70 $US par mois (≈ 90 à 95 $CA), soit environ 800 à 950 $US sur la première année**, comptes développeurs inclus.

### 6.4 Configuration de production à mettre en place

**Base de données**
- Migrations TypeORM obligatoires : générer une migration initiale, désactiver `synchronize` dans tous les environnements, exécuter les migrations en étape de déploiement distincte (jamais au démarrage de l'application).
- `ssl: { rejectUnauthorized: true }` avec le certificat CA du fournisseur.
- Sauvegardes PITR, chiffrement au repos, **et un test de restauration effectivement réalisé** avant le lancement.
- Conserver PgBouncer en mode `transaction` (déjà en place — bon choix).

**Application**
```ts
// main.ts — socle minimal de production
app.use(helmet());
app.use(compression());
app.enableCors({ origin: allowedOrigins, credentials: true });  // liste blanche
app.useGlobalPipes(new ValidationPipe({
  whitelist: true, forbidNonWhitelisted: true, transform: true,
}));
app.setGlobalPrefix('api/v1');
app.enableShutdownHooks();
if (process.env.NODE_ENV !== 'production') SwaggerModule.setup('docs', app, document);
app.getHttpAdapter().getInstance().set('trust proxy', 1);
```

**Secrets** — gestionnaire de secrets du fournisseur, jamais dans le dépôt. Rotation immédiate du mot de passe PostgreSQL exposé (SEC-06) et génération d'un `JWT_SECRET` de 64 octets aléatoires.

**Observabilité** — Sentry côté backend, logs JSON structurés (`nestjs-pino`) avec identifiant de corrélation, `/health` (liveness) et `/ready` (readiness, vérifiant la base), alertes sur taux d'erreur 5xx et latence p95.

### 6.5 Chaîne CI/CD

L'actuelle ne se déclenche ni sur `main` ni sur les branches de release, ne teste pas la sécurité et ne déploie pas.

```
Pull request       → lint · build · tests unitaires · tests e2e · npm audit · scan de secrets
Merge sur main     → build image · push registre · migrations · déploiement recette
Tag v*             → migrations prod · déploiement blue/green · smoke tests · EAS Build
Publication        → EAS Submit (App Store Connect + Play Console)
```

Ajouter un scan de secrets (`gitleaks`) est prioritaire compte tenu de SEC-06.

---

## 7. Publication sur l'App Store et le Play Store

### 7.1 Bloquants Apple

| # | Exigence | État |
|---|---|---|
| 1 | **Guideline 5.1.1(v) — suppression de compte depuis l'app.** Obligatoire pour toute app à création de compte | **Absent.** Aucun écran, aucune route API. Motif de rejet automatique |
| 2 | **Politique de confidentialité accessible.** Requise dans l'app et dans la fiche | Les entrées « CGV / Mentions légales » et « Politiques de confidentialités » de `app/screens/mine.tsx` sont des `TouchableOpacity` **sans `onPress`** — boutons inertes |
| 3 | **App Privacy (nutrition label).** Déclaration « Santé et forme », « Coordonnées », « Identifiants » | À produire |
| 4 | **Nom de l'application.** `name` et `slug` valent `"front-client"` | À remplacer par `BackRelief` |
| 5 | **Compte de démonstration** pour la revue (patient et, le cas échéant, praticien) | À fournir |
| 6 | **Avertissement médical** — préciser que l'app ne remplace pas un avis professionnel | À ajouter |
| 7 | Permissions caméra/micro avec `NSCameraUsageDescription` / `NSMicrophoneUsageDescription` | Non requis en V1 (téléconsultation désactivée). **À ajouter impérativement avant activation** |

`ITSAppUsesNonExemptEncryption: false` est correctement déclaré.

### 7.2 Bloquants Google

| # | Exigence | État |
|---|---|---|
| 1 | **Formulaire Data safety** | À compléter |
| 2 | **Déclaration Health Apps** — obligatoire pour les applications de santé | À compléter |
| 3 | **URL web de suppression de compte** — Google exige un parcours in-app **et** une URL publique | Absent |
| 4 | **Politique de confidentialité en ligne** | Absent |
| 5 | `targetSdkVersion 35`, format App Bundle | **Conforme** |
| 6 | Permission Android déclarée `"NOTIFICATIONS"` — cette constante n'existe pas ; la valeur attendue est `POST_NOTIFICATIONS` | À corriger |

### 7.3 Corrections de configuration mobile

| Fichier | Correction |
|---|---|
| `app.json` | `name`/`slug` → `BackRelief` ; `scheme` → `backrelief` ; corriger la permission notifications ; ajouter une description store |
| `eas.json` | Remplacer l'URL d'API d'exemple ; compléter `submit.production` (Apple Team ID, `ascAppId`, clé de compte de service Google) |
| `front-client/.env` | Retirer du suivi git, ajouter au `.gitignore`, passer par les secrets EAS |
| `SocketContext.tsx` | Dériver l'URL du socket de `EXPO_PUBLIC_API_URL` |
| `package.json` | Ajouter `expo-updates` — sans OTA, le moindre correctif impose un cycle de revue complet (24-72 h) |

### 7.4 Internationalisation

Aucune bibliothèque i18n n'est présente ; toutes les chaînes sont en français, en dur dans les composants. Pour le marché canadien : mise en place de `i18next` + `expo-localization`, extraction des chaînes, et traduction FR/EN — **y compris les fiches store et la politique de confidentialité**.

Le français reste obligatoire au Québec (Loi 96), l'anglais est nécessaire pour le reste du Canada.

---

## 8. Préparer la base et le backend complémentaires

La contrainte annoncée — un backend et/ou une base supplémentaires, reliés à la fois à l'application actuelle et à une seconde interface — a une conséquence directe : **plusieurs décisions doivent être prises maintenant**, car elles deviennent coûteuses à rattraper une fois deux systèmes en production.

### 8.1 À corriger dès maintenant

| Sujet | Situation actuelle | Cible |
|---|---|---|
| **Signature des jetons** | HS256, secret symétrique partagé (`JWT_SECRET`) | **RS256 / EdDSA + endpoint JWKS.** Chaque service valide les jetons avec la clé publique, sans jamais détenir de secret de signature. C'est la décision la plus structurante : avec HS256, tout nouveau service devrait recevoir le secret capable de forger des jetons |
| **Rôle dans le jeton** | Supprimé par `jwt.strategy.ts` | Propager `role` (et à terme les permissions) dans `req.user` |
| **Autorisation** | Guards posés à la main, sans RBAC | `RolesGuard` + décorateur `@Roles()` + guard de propriété, appliqués **globalement** avec un décorateur `@Public()` explicite pour les exceptions |
| **Versionnement d'API** | Aucun préfixe | `/api/v1` dès maintenant — impossible à introduire sans casse une fois des clients déployés |
| **Contrat d'API** | Swagger généré mais public | OpenAPI versionné, publié en interne, servant de contrat aux deux interfaces |

### 8.2 Architecture recommandée pour l'extension

**Ne pas partager la base de données entre services.** C'est l'anti-pattern classique de ce type d'extension : deux backends écrivant dans les mêmes tables se couplent par le schéma, et toute migration devient un déploiement coordonné à risque.

```
   App mobile          Seconde interface (web / pro / admin)
        │                          │
        └───────────┬──────────────┘
                    ▼
          ┌───────────────────┐
          │  API Gateway/BFF  │   authentification, quotas, routage, CORS
          └────┬─────────┬────┘
               │         │
     ┌─────────▼──┐   ┌──▼──────────────┐
     │ API actuelle│   │ Nouveau service │
     │ (santé,     │   │ (nouveau        │
     │  praticiens)│   │  domaine)       │
     └─────┬───────┘   └──────┬──────────┘
           │                  │
     ┌─────▼─────┐      ┌─────▼─────┐
     │ schéma A  │      │ schéma B  │    bases (ou schémas) distincts
     └───────────┘      └───────────┘
           └────── événements ───────┘
              (Redis Streams / RabbitMQ)
```

**Principes à retenir**

1. **Identité centralisée.** Un seul émetteur de jetons — service `auth` extrait, ou fournisseur managé (Keycloak, Ory, Auth0, Cognito). Les deux interfaces et les deux backends s'y réfèrent.
2. **Découpage par domaine métier**, pas par couche technique. Les frontières naturelles ici : *Identité*, *Suivi santé*, *Praticiens & rendez-vous*, *Contenus*, *Messagerie*.
3. **Une base par service.** Démarrer avec des **schémas PostgreSQL distincts sur la même instance** est un compromis raisonnable : isolation logique immédiate, séparation physique possible plus tard sans changement applicatif.
4. **Communication.** Lectures synchrones en HTTP via le gateway ; propagation d'état par événements. Ne jamais laisser un service lire directement les tables d'un autre.
5. **Le RBAC devient obligatoire, pas optionnel.** Une interface professionnelle ou d'administration multiplie les rôles ; le modèle « guard posé route par route » ne tiendra pas.
6. **Traçabilité.** Identifiant de corrélation propagé de bout en bout, et journal d'audit sur les accès aux données de santé — attendu tant par le RGPD que par la Loi 25.

### 8.3 Séquencement conseillé

L'ajout du second backend ne doit pas précéder l'assainissement de l'existant : greffer un service sur une API dont 47 routes sont ouvertes propagerait le défaut. L'ordre recommandé est **P0 (§9) → RBAC + JWKS + `/api/v1` → extraction du service d'identité → nouveau service métier**.

---

## 9. Plan d'action priorisé

Les charges sont des ordres de grandeur en jours-homme, pour un développeur familier du code.

### P0 — Avant toute mise en production *(≈ 13–19 j)*

| # | Action | Réf. | Charge |
|---|---|---|---|
| 1 | Faire tourner le secret PostgreSQL exposé et purger l'historique git | SEC-06 | 0,5 j |
| 2 | Ajouter le `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`) | SEC-05 | 0,5 j |
| 3 | Guard JWT global + décorateur `@Public()` explicite, puis revue des 69 routes | SEC-01→04 | 2 j |
| 4 | Retirer `role` des DTO publics ; forcer le rôle côté serveur | SEC-03 | 0,5 j |
| 5 | `@Exclude()` sur `password` + `ClassSerializerInterceptor` global | SEC-01 | 0,5 j |
| 6 | Contrôles de propriété sur toutes les routes à `:id` | SEC-07 | 2 j |
| 7 | Hacher le mot de passe dans `UserService.update()` ; retirer le seed de production | SEC-09, MET-04 | 1 j |
| 8 | **Créer la migration initiale ; `synchronize: false` partout ; migrations en étape de déploiement** | DEP-01 | 2 j |
| 9 | Dockerfile multi-étapes + `.dockerignore` + utilisateur non root | DEP-03 | 1 j |
| 10 | Retirer le secret JWT de repli ; propager `role` dans la stratégie | SEC-08 | 0,5 j |
| 11 | CORS en liste blanche, Swagger désactivé en prod, `helmet`, `trust proxy`, `enableShutdownHooks` | SEC-10→14 | 1 j |
| 12 | Transaction + verrou sur la réservation de créneau | MET-01 | 1 j |
| 13 | Provisionner l'hébergement cible (Montréal si priorité Canada) et migrer la base | §6.2 | 2–3 j |
| 14 | Discriminant de résidence + passage des identifiants en UUID, avant tout partitionnement futur | §6.2 | 1–2 j |

### P1 — Avant soumission aux stores *(≈ 10–15 j)*

| # | Action | Réf. | Charge |
|---|---|---|---|
| 15 | Suppression de compte in-app + route API + page web de suppression | §7.1, §7.2 | 2 j |
| 16 | Écrans CGU et politique de confidentialité (et brancher les boutons inertes) | §7.1 | 1,5 j |
| 17 | Refresh token + révocation à la déconnexion | SEC-08 | 2 j |
| 18 | i18n FR/EN, y compris fiches store | §7.4 | 3–4 j |
| 19 | Corriger `app.json` et `eas.json` (nom, scheme, permissions, URL, submit) | §7.3 | 1 j |
| 20 | Déplacer les médias vers un stockage objet + CDN | DEP-04 | 1,5 j |
| 21 | Corriger MET-02 (typo relation), MET-03 (hydratation), MET-05, MET-09, MET-10 | §3 | 1,5 j |
| 22 | Sentry backend, logs structurés, `/ready` | DEP-07 | 1 j |
| 23 | Déclarer l'API dans `render.yaml` ou son équivalent chez le nouvel hébergeur | DEP-05 | 0,5 j |
| 24 | Formulaires Data safety, Health Apps, App Privacy ; comptes de démonstration | §7 | 1 j |

### P2 — Post-lancement / préparation de l'extension *(≈ 15–20 j)*

| # | Action | Réf. |
|---|---|---|
| 24 | RBAC (`RolesGuard` + `@Roles()`) | §8.1 |
| 25 | Passage à RS256/EdDSA + JWKS | §8.1 |
| 26 | Préfixe `/api/v1` et contrat OpenAPI publié | §8.1 |
| 27 | Notifications push serveur (jetons + envoi + rappels de rendez-vous) | MET-07 |
| 28 | Génération des créneaux récurrents, gestion explicite des fuseaux | MET-06 |
| 29 | `expo-updates` pour les correctifs OTA | §7.3 |
| 30 | Redis (throttler + adaptateur socket.io) et mise à l'échelle horizontale | DEP-06 |
| 31 | Journal d'audit des accès aux données de santé | §8.2 |
| 32 | Extraction du service d'identité, puis nouveau service métier | §8.3 |

### Avant réactivation de la téléconsultation

Client WebRTC (`react-native-webrtc`), serveur TURN, permissions caméra/micro et purpose strings iOS, autorisation d'accès aux salons liée au rendez-vous (SEC-13), identifiants de salon non prédictibles, adaptateur Redis, et validation HDS du périmètre.

---

## Annexe — Inventaire des routes publiques

47 routes accessibles sans authentification (sur 69) :

```
GET    /                                    GET    /notification/:id
GET    /activity                            PATCH  /notification/:id
POST   /appointments                        DELETE /notification/:id
GET    /appointments                        POST   /practitioner-profile
GET    /appointments/as-patient/:id         GET    /practitioner-profile/by-email/:email
GET    /appointments/practitioner/:id       POST   /pratitioner-diplome
POST   /auth/login                          GET    /pratitioner-diplome
POST   /auth/register-practitioner          GET    /pratitioner-diplome/:id
POST   /availabilities                      PATCH  /pratitioner-diplome/:id
GET    /availabilities                      DELETE /pratitioner-diplome/:id
POST   /exercise                            POST   /program
GET    /exercise                            GET    /program
GET    /exercise/:id                        GET    /program/:id
PATCH  /exercise/:id                        PATCH  /program/:id
DELETE /exercise/:id                        DELETE /program/:id
GET    /health          (liveness)          POST   /program-line
GET    /health          (relevés, masqué)   GET    /program-line
GET    /health/:id                          GET    /program-line/:id
PATCH  /health/:id                          PATCH  /program-line/:id
DELETE /health/:id                          DELETE /program-line/:id
POST   /notification                        GET    /user
GET    /notification                        PATCH  /user/:id
                                            DELETE /user/:id
                                            POST   /user/login
                                            POST   /user/register
```

Note : `GET /health` est déclaré deux fois — sonde de disponibilité dans `AppController` et lecture des relevés de douleur dans `HealthController`. `AppController` étant enregistré en premier, c'est la sonde qui répond et le listing des relevés qui est masqué. Le conflit doit être levé explicitement : la sonde mérite un chemin dédié (`/healthz`), et le module métier un préfixe distinct.
