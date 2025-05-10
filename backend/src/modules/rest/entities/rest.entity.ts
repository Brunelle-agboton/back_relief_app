import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Rest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    contentTitle: String;

    @Column()
    contentDescription: String;

    @Column()
    duration: Number;

    @Column()
    position: String;

    @Column()
    calories: Number;

    @Column()
    image: String;  

    @Column()
    category: String;
}
