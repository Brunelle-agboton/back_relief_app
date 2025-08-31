import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('availabilities')
export class Availability {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'practitioner_id' })
  practitioner: User;

  @Column({ type: 'integer' })
  practitionerId: number;

  @Column({ type: 'timestamp with time zone' })
  startTime: Date;

  @Column({ type: 'timestamp with time zone' })
  endTime: Date;

  @Column()
  timezone: string;

  @Column({ default: false })
  is_recurring: boolean;

  @Column({ nullable: true })
  rrule: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ default: false })
  isBooked: boolean;
}
