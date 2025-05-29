import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    date: Date;

    @ManyToOne(() => User, (user) => user.notification)
    user: User;

    @Column({ default: false })
    isRead: boolean;
}
