import {
Entity,
PrimaryGeneratedColumn,
Column,
OneToOne,
JoinColumn,
CreateDateColumn,
UpdateDateColumn,
OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Availability } from '../../availability/entities/availability.entity';
import { Appointment } from '../../appointment/entities/appointment.entity';
import { PractitionerDiplome } from '../../practitioner_diplome/entities/practitioner_diplome.entity';

export enum ProfessionalType {
KINESIOLOGUE = 'kinesiologue',
PHYSIOTHERAPIST = 'physiotherapist',
ERGOTHERAPEUTE = 'Ergothérapeute',
ORTHOPEDIST = 'orthopedist',
OTHER = 'other',
}

export enum EstablishmentType {
 CANADIAN_HEALTH_FACILITY = 'Établissement de santé canadien',
  FRENCH_HEALTH_FACILITY = 'Établissement de santé français',
 PRIVATE_CLINIC = 'Clinique privée',
}

@Entity('practitioner_profile')
export class PractitionerProfile {
@PrimaryGeneratedColumn('increment')
id: number;


@OneToOne(() => User, (u) => u.practitionerProfile, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'user_id' })
user: User;


@Column({ type: 'enum', enum: ProfessionalType })
professionalType: ProfessionalType;


@Column('text', { array: true, nullable: true })
specialties?: string[];


@Column({ type: 'text', nullable: true })
bio?: string;


@Column('text', { array: true, nullable: true })
qualifications?: string[];


@Column({ nullable: true, unique: true })
licenseNumber?: string;


@Column({ nullable: true })
phone?: string;

@Column()
postalCode?: string;

@Column({ nullable: true }) // ou une valeur par défaut si pertinent
   city: string;
   
@Column({ nullable: true })
country: string;

@Column({ type: 'text', nullable: true })
clinicAddress?: string;

@Column({ type: 'enum', enum: EstablishmentType, default: EstablishmentType.CANADIAN_HEALTH_FACILITY, comment: "Type d'établissement de santé"})
establishmentType: EstablishmentType;

@Column({ default: 'Europe/Paris' })
timezone: string;


@Column({ default: true })
teleconsultEnabled: boolean;


@Column({ default: true })
isActive: boolean;


@Column({ type: 'numeric', precision: 3, scale: 2, nullable: true })
rating?: number;

@OneToMany(() => PractitionerDiplome, diplome => diplome.practitionerProfile, { cascade: true })
diplomes: PractitionerDiplome[];

@OneToMany(() => Availability, availability => availability.practitionerProfile, { cascade: true })
availabilities: Availability[];

@OneToMany(() => Appointment, appointment => appointment.practitionerProfile, { cascade: true })
appointments: Appointment[];

@CreateDateColumn({ type: 'timestamptz' })
createdAt: Date;

@UpdateDateColumn({ type: 'timestamptz' })
updatedAt: Date;
}