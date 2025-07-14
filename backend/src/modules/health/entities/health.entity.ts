import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class PainRecord  {
    @PrimaryGeneratedColumn()
    id: number;
    
    @ManyToOne(() => User, (user) => user.painRecord )
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

@Entity()
export class HydrationRecord {
  @PrimaryGeneratedColumn() id: number;

  @ManyToOne(() => User, (user) => user.hydrationRecord )
   user: User;

  @Column() bottleSize: string;
  
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  recordedAt: Date;
}
