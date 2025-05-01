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
    content: String;

}
