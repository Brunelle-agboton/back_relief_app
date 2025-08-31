import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum AppointmentStatus {
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @Column({ type: 'integer' })
  patientId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'practitioner_id' })
  practitioner: User;

  @Column({ type: 'integer' })
  practitionerId: number;

  @Column({ type: 'timestamp with time zone' })
  start_at: Date;

  @Column({ type: 'timestamp with time zone' })
  end_at: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.CONFIRMED,
  })
  status: AppointmentStatus;

  @Column({ nullable: true })
  meeting_url: string;

  @Column({ type: 'jsonb', nullable: true })
  meeting_meta: object;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  cancellation_reason: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'cancelled_by' })
  cancelled_by: User;

  @Column({ type: 'integer', nullable: true })
  cancelled_byId: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
