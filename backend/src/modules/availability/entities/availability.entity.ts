import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PractitionerProfile } from '../../practitioner_profile/entities/practitioner_profile.entity';
import { Exclude } from 'class-transformer';

@Entity('availabilities')
export class Availability {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => PractitionerProfile, (profile) => profile.availabilities)
  @JoinColumn({ name: 'practitioner_profile_id' })
  @Exclude({ toPlainOnly: true })
  practitionerProfile: PractitionerProfile;

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
