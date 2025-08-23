import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { PainRecord, HydrationRecord } from '../../health/entities/health.entity';
import { Notification } from '../../notification/entities/notification.entity';
import { Activity } from '../../activity/entities/activity.entity';
import { PractitionerProfile } from '../../practitioner_profile/entities/practitioner_profile.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: string;

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

  // Relation one-to-one vers le profil professionnel (si role === 'professional')
@OneToOne(() => PractitionerProfile, (p) => p.user, { cascade: true, nullable: true })
practitionerProfile?: PractitionerProfile;
}