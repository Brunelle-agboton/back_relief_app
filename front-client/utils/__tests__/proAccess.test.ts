import { FEATURES } from '@/config/featureFlags';
import { resolveProAccess } from '../proAccess';

/**
 * L'espace praticien n'offre ni déconnexion ni retour vers l'espace patient :
 * une entrée indue s'y transforme en impasse. Ces cas figent qui peut y entrer.
 */

const flags = FEATURES as unknown as { proDashboard: boolean };
const original = flags.proDashboard;

afterEach(() => {
  flags.proDashboard = original;
});

const practitioner = { isLoading: false, isAuthenticated: true, role: 'practitioner' };

describe('accès à l’espace praticien', () => {
  it('attend la fin de lecture de la session avant de trancher', () => {
    // Sans cette attente, un praticien légitime serait éjecté au premier rendu,
    // le jeton étant lu de façon asynchrone.
    expect(resolveProAccess({ ...practitioner, isLoading: true })).toBe('pending');
    expect(
      resolveProAccess({ isLoading: true, isAuthenticated: false, role: undefined }),
    ).toBe('pending');
  });

  it('renvoie une session absente vers l’accueil public', () => {
    expect(
      resolveProAccess({ isLoading: false, isAuthenticated: false, role: undefined }),
    ).toBe('anonymous');
  });

  it('renvoie un patient vers son espace', () => {
    flags.proDashboard = true;
    expect(resolveProAccess({ ...practitioner, role: 'user' })).toBe('patient');
    expect(resolveProAccess({ ...practitioner, role: undefined })).toBe('patient');
  });

  it('renvoie un praticien vers l’espace patient tant que le drapeau est fermé', () => {
    // C'est la règle déjà appliquée à la connexion ; elle vaut désormais aussi
    // à l'entrée de la route.
    flags.proDashboard = false;
    expect(resolveProAccess(practitioner)).toBe('patient');
  });

  it('laisse entrer un praticien quand le drapeau est ouvert', () => {
    flags.proDashboard = true;
    expect(resolveProAccess(practitioner)).toBe('allowed');
  });

  it('reste fermé dans la configuration livrée', () => {
    // `proDashboard` est à `false` pour la V1 : aucun accès ne doit passer.
    expect(FEATURES.proDashboard).toBe(false);
    expect(resolveProAccess(practitioner)).toBe('patient');
  });
});
