import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import {Exercise } from '../../exercise/entities/exercise.entity';
import { Program } from '../../program/entities/program.entity'

@Entity()
export class ProgramLine {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Program, program => program.lines)
  program: Program;

  @ManyToOne(() => Exercise)
  exercise: Exercise;

  @Column({ type: 'int' })
  order: number;          // position dans le programme

  @Column({ type: 'int', nullable: true })
  repetitions?: number;   // ex. x10

  @Column({ type: 'int', nullable: true })
  duration?: number;      // en s

  @Column({ type: 'int', nullable: true })
  calories?: number;      
}
