import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Health {
    @PrimaryGeneratedColumn()
    id: number;
    
    @ManyToOne(() => User, (user) => user.health)
    user: User;
    
    @Column()
    painLocation: string;
    
    @Column()
    painLevel: number;
    
    @Column({default: false})
    painDescription: string;

    @Column({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    recordedAt: Date;
}
