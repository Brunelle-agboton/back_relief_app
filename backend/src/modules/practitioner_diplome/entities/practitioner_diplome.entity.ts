import {
Entity,
PrimaryGeneratedColumn,
Column,
OneToOne,
JoinColumn,
CreateDateColumn,
UpdateDateColumn,
ManyToOne,
} from 'typeorm';
import { PractitionerProfile } from 'src/modules/practitioner_profile/entities/practitioner_profile.entity';
import { Exclude } from 'class-transformer';

@Entity('practitioner_diplome')
export class PractitionerDiplome {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    diplome: string;

     @Column()
    school: string;

    @Column()
    country: string;

    @Column()
    year: number;

    @ManyToOne(() => PractitionerProfile, (practitionerProfile) => practitionerProfile.diplomes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'practitioner_profile_id' })
    @Exclude({ toPlainOnly: true })
    practitionerProfile: PractitionerProfile;
}
