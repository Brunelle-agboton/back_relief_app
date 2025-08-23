import {
Entity,
PrimaryGeneratedColumn,
Column,
OneToOne,
JoinColumn,
CreateDateColumn,
UpdateDateColumn,
Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';


export enum ProfessionalType {
KINESIOLOGUE = 'kinesiologue',
PHYSIOTHERAPIST = 'physiotherapist',
ERGOTHERAPIST = 'ergotherapist',
OTHER = 'other',
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


@Column({ nullable: true })
licenseNumber?: string;


@Column({ nullable: true })
phone?: string;


@Column({ type: 'text', nullable: true })
clinicAddress?: string;


@Column({ default: 'Europe/Paris' })
timezone: string;


@Column({ default: true })
teleconsultEnabled: boolean;


@Column({ default: true })
isActive: boolean;


@Column({ type: 'numeric', precision: 3, scale: 2, nullable: true })
rating?: number;


@CreateDateColumn({ type: 'timestamptz' })
createdAt: Date;


@UpdateDateColumn({ type: 'timestamptz' })
updatedAt: Date;
}