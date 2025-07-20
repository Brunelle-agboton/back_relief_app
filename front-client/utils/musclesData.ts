const AbdosSVG= require('@/assets/images/muscles/Abdos.svg');
import AvantBrasSVG from '@/assets/images/muscles/Avant-bras.svg';
import BicepsSVG from '@/assets/images/muscles/Biceps.svg';
import CarpeSVG from '@/assets/images/muscles/Carpe.svg';
import DeltoidDroitSVG from '@/assets/images/muscles/deltoid-droit.svg'; 
import FessierGaucheSVG from '@/assets/images/muscles/fessier-gauche.svg'; // Attention à l'espace
import FessierDroitSVG from '@/assets/images/muscles/Fessier-Droit.svg';
import GrandDorsalGaucheSVG from '@/assets/images/muscles/Grand-dorsal-gauche.svg'; // Attention à l'espace
import GrandRondDroitSVG from '@/assets/images/muscles/Grand-Rond-droit.svg'; // Attention à l'espace
import GrandRondGaucheSVG from '@/assets/images/muscles/Grand-Rond-gauche.svg'; // Attention à l'espace
import GrandDorsalDroitSVG from '@/assets/images/muscles/Grand-dorsal-droit.svg';
import HeadSVG from '@/assets/images/muscles/head.svg';
import IschioJambierSVG from '@/assets/images/muscles/Ischio-jambier.svg';
import LongExtenseurSVG from '@/assets/images/muscles/Long-extenseur.svg'; // Attention à l'espace
import MainSVG from '@/assets/images/muscles/Main.svg';
import MolletDroitSVG from '@/assets/images/muscles/Mollet-droit.svg'; // Attention à l'espace
import MolletGaucheSVG from '@/assets/images/muscles/Mollet-gauche.svg'; // Attention à l'espace
import ObliqueSVG from '@/assets/images/muscles/Oblique.svg';
import PiedDroitSVG from '@/assets/images/muscles/Pied-droit.svg'; // Attention à l'espace
import PiedGaucheSVG from '@/assets/images/muscles/Pied-gauche.svg'; // Attention à l'espace
import QuadricepsSVG from '@/assets/images/muscles/Quadriceps.svg';
import TibiatDroit1SVG from '@/assets/images/muscles/Tibiat-droit-1.svg'; // Attention au -1
import TibiatDroitSVG from '@/assets/images/muscles/Tibiat-droit.svg'; // Attention à l'espace
import TibiatGauche1SVG from '@/assets/images/muscles/Tibiat-gauche-1.svg'; // Attention au -1
import TibiatGaucheSVG from '@/assets/images/muscles/Tibiat-gauche.svg'; // Attention à l'espace
import TrapezeSVG from '@/assets/images/muscles/Trapeze.svg';
import TricepsSVG from '@/assets/images/muscles/Triceps.svg';
import TibiatAnterieurDroitSVG from '@/assets/images/muscles/Tibiat-anterieur.svg';
import TibiatAnterieurGaucheSVG from '@/assets/images/muscles/Tibiat-anterieur-gauche.svg';
import IntercostauxSVG from '@/assets/images/muscles/intercostaux.svg';
import AbdosLateralSVG from '@/assets/images/muscles/Abdos-Lateral.svg';
import MainDroiteSVG from '@/assets/images/muscles/Main-Droite.svg';
import MainGaucheSVG from '@/assets/images/muscles/Main-Gauche.svg';
import AvantBrasDroitSVG from '@/assets/images/muscles/Avant-Bras-Droit.svg';
import AvantBrasGaucheSVG from '@/assets/images/muscles/Avant-Bras-Gauche.svg';
import PectoralDroitSVG from '@/assets/images/muscles/Pectoral-Droit.svg';
import PectoralGaucheSVG from '@/assets/images/muscles/Pectoral-Gauche.svg';
import HeadFaceSVG from '@/assets/images/muscles/Head-Face.svg';
import TricepsDroitSVG from '@/assets/images/muscles/Triceps-Droit.svg';
import SupinateurDroitSVG from '@/assets/images/muscles/Supinateur-Droit.svg';
import SupinateurGaucheSVG from '@/assets/images/muscles/Supinateur-Gauche.svg';
import TricepsGaucheSVG from '@/assets/images/muscles/Triceps-Gauche.svg';
import BicepsGaucheSVG from '@/assets/images/muscles/Biceps-Gauche.svg';
import TibiatGaucheLateralSVG from '@/assets/images/muscles/Tibiat-Gauche-Lateral.svg';
import TibiatGaucheLateral1SVG from '@/assets/images/muscles/Tibiat-Gauche-Lateral-1.svg';
import PiedGaucheAnterieurSVG from '@/assets/images/muscles/Pied-Gauche-Anterieur.svg';
import FessierGaucheLateralSVG from '@/assets/images/muscles/Fessier-Gauche-Lateral.svg';
import PiedDroitAnterieurSVG from '@/assets/images/muscles/Pied-Droit-Anterieur.svg';
import TroncSVG from '@/assets/images/muscles/Tronc.svg';
import BicepsDroitSVG from '@/assets/images/muscles/Biceps-Droit.svg';
import DeltoidDroitLateralSVG from '@/assets/images/muscles/Deltroid-Droit-Lateral.svg';
import DeltoidGaucheLateralSVG from '@/assets/images/muscles/Deltroid-Gauche-Lateral.svg';
import QuadricepsDroitsSVG from '@/assets/images/muscles/Quadriceps-Droits.svg';
import QuadricepsGaucheSVG from '@/assets/images/muscles/Quadriceps-Gauche.svg';
import BicepsFemoralDroitSVG from '@/assets/images/muscles/Bicesps-Femoral.svg';
import BicepsFemoralGaucheSVG from '@/assets/images/muscles/Bicesps-Femoral-Gauche.svg';

//Main-Gauche
type SVGComponent = React.FC<React.SVGProps<SVGSVGElement>>;

export const MuscleSVGs: Record<string, SVGComponent> = {
  'Abdos': AbdosSVG,
  'Avant-bras': AvantBrasSVG,
  'Biceps': BicepsSVG,
  'Carpe': CarpeSVG,
  'Deltoïde Droit': DeltoidDroitSVG, 
  'Fessier Gauche': FessierGaucheSVG,
  'Fessier-Droit': FessierDroitSVG,
  'Grand Dorsal Gauche': GrandDorsalGaucheSVG,
  'Grand Rond Droit': GrandRondDroitSVG,
  'Grand Rond Gauche': GrandRondGaucheSVG,
  'Grand Dorsal Droit': GrandDorsalDroitSVG,
  'Tête': HeadSVG,
  'Ischio-jambier': IschioJambierSVG,
  'Long Extenseur': LongExtenseurSVG,
  'Main': MainSVG,
  'Mollet Droit': MolletDroitSVG,
  'Mollet Gauche': MolletGaucheSVG,
  'Oblique': ObliqueSVG,
  'Pied Droit': PiedDroitSVG,
  'Pied Gauche': PiedGaucheSVG,
  'Quadriceps': QuadricepsSVG,
  'Tibiat Droit-1': TibiatDroit1SVG, 
  'Tibiat Droit': TibiatDroitSVG,
  'Tibiat Gauche-1': TibiatGauche1SVG, 
  'Tibiat Gauche': TibiatGaucheSVG,
  'Trapèze': TrapezeSVG,
  'Triceps': TricepsSVG,
  "Tibiat Anterieur Droit": TibiatAnterieurDroitSVG,
  "Tibiat Anterieur Gauche": TibiatAnterieurGaucheSVG,
  "Intercostaux": IntercostauxSVG,
  "Abdos Lateral": AbdosLateralSVG,
  "Main Droite": MainDroiteSVG,
  "Main Gauche": MainGaucheSVG,
  "Avant Bras Droit": AvantBrasDroitSVG,
  "Avant Bras Gauche": AvantBrasGaucheSVG,
  "Triceps Droit": TricepsDroitSVG,
  "Supinateur Droit": SupinateurDroitSVG,
  "Supinateur Gauche":SupinateurGaucheSVG,
  "Triceps Gauche": TricepsGaucheSVG,
  "Biceps Gauche": BicepsGaucheSVG,
  "Tibiat Gauche Lateral":TibiatGaucheLateralSVG,
  "Fessier Gauche Lateral":FessierGaucheLateralSVG,
  "Pied Droit Anterieur": PiedDroitAnterieurSVG,
  "Pied Gauche Anterieur": PiedGaucheAnterieurSVG,
  "Tronc": TroncSVG,
  "Biceps Droit": BicepsDroitSVG,
  "Pectoral Gauche": PectoralGaucheSVG,
  "Pectoral Droit": PectoralDroitSVG,
  "Tête Face": HeadFaceSVG,
  "Deltoid Gauche Lateral": DeltoidGaucheLateralSVG,
  "Deltoid Droit Lateral": DeltoidDroitLateralSVG,
  "Quadriceps Droit": QuadricepsDroitsSVG,
  "Quadriceps Gauche": QuadricepsGaucheSVG,
  "Bicesps Femoral Droit": BicepsFemoralDroitSVG,
  "Bicesps Femoral Gauche": BicepsFemoralGaucheSVG,
  "Tibiat Gauche Lateral 1": TibiatGaucheLateral1SVG

};

export const MuscleNames: string[] = [
  "Abdos",
  "Avant-bras",
  "Biceps",
  "Carpe",
  "Deltoïde Droit",
  "Fessier Gauche",
  "Fessier-Droit",
  "Grand Dorsal Gauche",
  "Grand Rond Droit",
  "Grand Rond Gauche",
  "Grand Dorsal Droit",
  "Tête",
  "Ischio-jambier",
  "Long Extenseur",
  "Main",
  "Mollet Droit",
  "Mollet Gauche",
  "Oblique",
  "Pied Droit",
  "Pied Gauche",
  "Quadriceps",
  "Tibiat Droit-1",
  "Tibiat Droit",
  "Tibiat Gauche-1",
  "Tibiat Gauche",
  "Trapèze",
  "Triceps"
];
