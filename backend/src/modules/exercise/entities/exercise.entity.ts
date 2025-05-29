import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum Category {
  STAND_UP = 'debout',
  SIT = 'assis',
  WALL = 'mur',
}

export enum Position {
  LOMBAIRES = 'lombaires',
  ÉPAULES   = 'épaules',
  BRAS = 'bras',
  DOS = 'dos',
  COU = 'cou',
  BUSTE = 'buste',
  LEGS = 'pieds',
  VISAGE = 'visage'
}

@Entity()
export class Exercise {
  @PrimaryGeneratedColumn()         
  id: number;

  @Column()                       
  title: string;          

  @Column({ nullable: true })      
  description?: string;    // détail

  @Column({ type: 'enum', enum: Category })
  category: Category;      // pour filtrer par “mur”, “assis”, …

  @Column({ type: 'enum', enum: Position, nullable: true })
  position?: Position;     // “lombaires”, “épaules”, …

  @Column({ nullable: true })
  image?: string;          
}
