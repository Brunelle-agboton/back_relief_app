import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Health } from '../../health/entities/health.entity';
import { Notification } from '../../notification/entities/notification.entity';
import { Activity } from '../../activity/entities/activity.entity';

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

  @Column()
  age: number;

  @Column()
  poids: number;

  @Column()
  taille: number;

  @Column()
  sexe: string;

  @Column()
  hourSit: number;

  @Column()
  isExercise: boolean;
  
  @Column()
  numberTraining: number;

  @Column()
  restReminder: boolean;
  
  @Column()
  drinkReminder: boolean;

  @OneToMany(() => Health, (health) => health.user)
  health: Health[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notification: Notification[];

  @OneToMany(() => Activity, (activity) => activity.user)
  activities: Activity[];
}