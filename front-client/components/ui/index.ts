/**
 * Primitives du design system « Pause Active × Companion ».
 *
 *     import { Button, Screen, Text, TextField } from '@/components/ui';
 *
 * Chaque primitive consomme le thème (`@/theme`) et ne code aucune couleur,
 * taille ni rayon en dur : changer d'ambiance ou passer en sombre ne demande
 * aucune modification ici.
 *
 * Les composants historiques du dossier (`IconSymbol`, `TabBarBackground`,
 * `HapticTab`) restent importés par leur chemin propre et ne font pas partie
 * du design system.
 */
export { Button, MIN_HIT_TARGET } from './Button';
export type { ButtonProps, ButtonSize, ButtonVariant } from './Button';
export { Card } from './Card';
export type { CardProps, CardVariant } from './Card';
export { Checkbox } from './Checkbox';
export type { CheckboxProps } from './Checkbox';
export { Chip } from './Chip';
export type { ChipProps, ChipVariant } from './Chip';
export { Divider } from './Divider';
export { FormMessage } from './FormMessage';
export type { FormMessageProps, FormMessageTone } from './FormMessage';
export { Header } from './Header';
export type { HeaderProps } from './Header';
export { OptionRow } from './OptionRow';
export type { OptionRowProps } from './OptionRow';
export { Radio } from './Radio';
export type { RadioProps } from './Radio';
export { Screen, ScrollScreen } from './Screen';
export type { ScreenProps, ScrollScreenProps } from './Screen';
export { StepHeader } from './StepHeader';
export type { StepHeaderProps } from './StepHeader';
export { StepProgress } from './StepProgress';
export type { StepProgressProps } from './StepProgress';
export { Segmented } from './Segmented';
export type { SegmentedOption, SegmentedProps } from './Segmented';
export { Text } from './Text';
export type { TextColor, TextProps } from './Text';
export { TextField } from './TextField';
export type { TextFieldProps } from './TextField';
