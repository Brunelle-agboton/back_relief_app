import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import {
  PainRecord,
  HydrationRecord,
} from '../../health/entities/health.entity';
import { Notification } from '../../notification/entities/notification.entity';
import { Activity } from '../../activity/entities/activity.entity';
import { PractitionerProfile } from '../../practitioner_profile/entities/practitioner_profile.entity';
import { UserRole } from '../../../common/enums/user-role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userName: string;

  @Index()
  @Column({ unique: true })
  email: string;

  /**
   * SEC-01 : double protection du hash.
   *  - `select: false` : la colonne n'est jamais chargée par un find() ordinaire,
   *    seules les requêtes d'authentification la demandent explicitement ;
   *  - `@Exclude()` : même chargée, elle est retirée de toute réponse HTTP par
   *    le ClassSerializerInterceptor global.
   */
  @Exclude()
  @Column({ select: false })
  password: string;

  @Column({ type: 'varchar', default: UserRole.USER })
  role: UserRole;

  /**
   * SEC-08 : compteur de révocation. Toute incrémentation (déconnexion,
   * changement de mot de passe) invalide immédiatement les jetons déjà émis,
   * sans attendre leur expiration.
   */
  @Exclude()
  @Column({ default: 0 })
  tokenVersion: number;

  // Champs patient — rendus NULLABLE car un professionnel peut ne pas les renseigner
  @Column({ nullable: true })
  age: number;

  @Column({ nullable: true })
  poids: number;

  @Column({ nullable: true })
  taille: number;

  @Column({ nullable: true })
  sexe: string;

  @Column({ nullable: true })
  hourSit: number;

  @Column({ nullable: true })
  isExercise: boolean;

  @Column({ nullable: true })
  numberTraining: number;

  @Column({ nullable: true })
  restReminder: boolean;

  @Column({ nullable: true })
  drinkReminder: boolean;

  @OneToMany(() => PainRecord, (painRecord) => painRecord.user)
  painRecord: PainRecord[];

  @OneToMany(() => HydrationRecord, (hydrationRecord) => hydrationRecord.user)
  hydrationRecord: HydrationRecord[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notification: Notification[];

  @OneToMany(() => Activity, (activity) => activity.user)
  activities: Activity[];

  // Relation one-to-one vers le profil professionnel (si role === 'practitioner')
  @OneToOne(() => PractitionerProfile, (p) => p.user, {
    cascade: true,
    nullable: true,
  })
  practitionerProfile?: PractitionerProfile;
}
