import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum ActivityType {
  PAUSE_STARTED  = 'pause_started',
  PAUSE_COMPLETED= 'pause_completed',
  WATER_DRUNK    = 'water_drunk',
  // … tu peux ajouter d’autres types plus tard
}

@Entity()
export class Activity {
  @PrimaryGeneratedColumn()           
  id: number;

  @ManyToOne(() => User, u => u.activities, { nullable: false })
    user: User;

  @Column({ type: 'enum', enum: ActivityType })
   type: ActivityType;

  @Column({ nullable: true })
    metadata?: string; 
  // ex: JSON.stringify({ programId: 5, lineOrder: 2 })

  @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
}
