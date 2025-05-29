import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProgramLine } from '../../program-line/entities/program-line.entity'

@Entity()
export class Program
 {
    @PrimaryGeneratedColumn()        id: number;
    @Column()                        title: string;        // titre du programme
    @Column({ nullable: true })      description?: string; // sous‑titre ou résumé
    @Column()                        image: string;        // url/fichier de la vignette
    @OneToMany(() => ProgramLine, pl => pl.program, { cascade: true })
    lines: ProgramLine[]; // les lignes d’exo associées
}
