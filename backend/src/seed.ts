import { DataSource } from 'typeorm';
import { Program } from './modules/program/entities/program.entity';
import { Exercise, Category, Position } from './modules/exercise/entities/exercise.entity';
import { ProgramLine } from './modules/program-line/entities/program-line.entity';

export async function seedRestExercise(dataSource: DataSource) {
    const ExerciseRepository = dataSource.getRepository(Exercise);
    const ProgramRepository = dataSource.getRepository(Program);
    const ProgramLineRepository = dataSource.getRepository(ProgramLine);
    
    const exercisesData =   [
    {
        title: 'Mains contre le mur, bras tendus',
        description: 'Décoller les mains du mur',
        category: Category.WALL,
        position: Position.ÉPAULES,
        image: 'BoostMur-1.jpg',
    },
    {
        title: 'Debout',
        description: '',
        category: Category.WALL,
        position: Position.DOS,
        image: 'BoostMur-2.jpg',
    },
    {
        title: 'Squats contre le mur',
        description: 'Avance tes pieds et colle ton dos',
        category: Category.WALL,
        position: Position.LOMBAIRES,
        image: 'BoostMur-3.jpg',
    },
    {
        title: 'Lever de bras',
        description: 'Faire glisser les bras le long du mur',
        category: Category.STAND_UP,
        position: Position.LOMBAIRES,
        image: 'PauseTonus-1.jpg',
    },
    {
        title: 'Soulager son cou',
        description: 'Tourne la tete',
        category: Category.SIT,
        position: Position.COU,
        image: 'PauseTonus-2.jpg',
    },
    {
        title: 'Soulager son cou',
        description: 'Tourne la tete',
        category: Category.SIT,
        position: Position.COU,
        image: 'PauseTonus-3.jpg',
    },
    {
        title: 'Flax relax bras',
        description: 'Dessiner une diagonale avec les bras tendus',
        category: Category.SIT,
        position: Position.LOMBAIRES,
        image: 'FlashRelax-1.jpg',
    },
     {
        title: 'Flax relax buste',
        description: 'Dessiner',
        category: Category.SIT,
        position: Position.BUSTE,
        image: 'FlashRelax-2.jpg',
    },
     {
        title: 'Flax relax pieds',
        description: '',
        category: Category.SIT,
        position: Position.LEGS,
        image: 'FlashRelax-3.jpg',
    },
    {
        title: 'PauseAssisFit sit 2',
        description: '',
        category: Category.SIT,
        position: Position.DOS,
        image: 'PauseAssisFit-1.jpg',
    },
    {
        title: 'PauseAssisFit sit',
        description: '',
        category: Category.SIT,
        position: Position.ÉPAULES,
        image: 'PauseAssisFit-2.jpg',
    },
    {
        title: 'PauseAssisFit sit',
        description: '',
        category: Category.SIT,
        position: Position.ÉPAULES,
        image: 'PauseAssisFit-3.jpg',
    },
    {
        title: 'Flexi_Siège sit',
        description: '',
        category: Category.SIT,
        position: Position.ÉPAULES,
        image: 'Flexi_Siège-1.jpg',
    },
    {
        title: 'Flexi_Siège sit',
        description: '',
        category: Category.SIT,
        position: Position.ÉPAULES,
        image: 'Flexi_Siège-2.jpg',
    },
    {
        title: 'Flexi_Siège sit',
        description: '',
        category: Category.SIT,
        position: Position.ÉPAULES,
        image: 'Flexi_Siège-3.jpg',
    },
    {
        title: 'Posture bras',
        description: '',
        category: Category.WALL,
        position: Position.ÉPAULES,
        image: 'Posture+1.jpg',
    },
    {
        title: 'Posture bras 2',
        description: '',
        category: Category.WALL,
        position: Position.ÉPAULES,
        image: 'Posture+2.jpg',
    },
     {
        title: 'Posture visage',
        description: '',
        category: Category.STAND_UP,
        position: Position.VISAGE,
        image: 'Posture+3.jpg',
    },
    {
        title: 'Vitalité assis',
        description: '',
        category: Category.SIT,
        position: Position.LEGS,
        image: '2-min-Vitalite-2.jpg',
    },
    {
        title: 'Vitalité assis 2',
        description: 'good',
        category: Category.SIT,
        position: Position.BRAS,
        image: '2-min-Vitalite-3.jpg',
    },
    {
        title: 'Vitalité assis 3',
        description: '',
        category: Category.SIT,
        position: Position.COU,
        image: '2-min-Vitalité-1.jpg',
    },
    {
        title: 'Pause Vitalité assis',
        description: '',
        category: Category.SIT,
        position: Position.COU,
        image: 'Pause-Vitalité-1.jpg',
    },
    {
        title: 'Pause Vitalité debout',
        description: '',
        category: Category.STAND_UP,
        position: Position.LOMBAIRES,
        image: 'Pause-Vitalité-2.jpg',
    },
    {
        title: 'Pause Vitalité debout 2',
        description: '',
        category: Category.STAND_UP,
        position: Position.DOS,
        image: 'Pause-Vitalite-3.jpg',
    },
    ];

    const programsData = [
    {
        title: "Pause Active",
        description: 'Un petit mouvement pour un grand bien‑être',
        image: 'BoostMur.jpg',
        lines: [
        { exIndex: 0, order: 1, repetitions: 10, duration: 30, calories: 80 },
        { exIndex: 1, order: 2, repetitions: 10, duration: 20, calories: 120 },
        { exIndex: 2, order: 3, repetitions: 10, duration: 15, calories: 50 },
        ],
    },
    {
        title: "Pause Active",
        description: 'Un petit mouvement pour un grand bien‑être',
        image: '2-min-Vitalite.jpg',
        lines: [
        { exIndex: 20, order: 1, repetitions: 10, duration: 25, calories: 80 },
        { exIndex: 18, order: 2, repetitions: 10, duration: 30, calories: 120 },
        { exIndex: 19, order: 3, repetitions: 15, duration: 20, calories: 50 },
        ],
    },
    {
        title: "Pause Active",
        description: 'Un petit mouvement pour un grand bien‑être',
        image: 'PauseAssisFit.jpg',
        lines: [
        { exIndex: 9, order: 1, repetitions: 10, duration: 20, calories: 80 },
        { exIndex: 10, order: 2, repetitions: 10, duration: 10, calories: 120 },
        { exIndex: 11, order: 3, repetitions: 10, duration: 15, calories: 50 },
        ],
    },
    {
        title: "Pause Active",
        description: 'Un petit mouvement pour un grand bien‑être',
        image: 'PauseTonus.jpg',
        lines: [
        { exIndex: 3, order: 1, repetitions: 10, duration: 20, calories: 80 },
        { exIndex: 4, order: 2, repetitions: 10, duration: 25, calories: 120 },
        { exIndex: 5, order: 3, repetitions: 10, duration: 10, calories: 50 },
        ],
    },
    {
        title: "Pause Active",
        description: 'Un petit mouvement pour un grand bien‑être',
        image: 'PauseVitalité.jpg',
        lines: [
        { exIndex: 21, order: 1, repetitions: 10, duration: 15, calories: 80 },
        { exIndex: 22, order: 2, repetitions: 10, duration: 30, calories: 120 },
        { exIndex: 23, order: 3, repetitions: 10, duration: 25, calories: 50 },
        ],
    },
    ,
    {
        title: "Pause Active",
        description: 'Un petit mouvement pour un grand bien‑être',
        image: 'Posture+.jpg',
        lines: [
        { exIndex: 15, order: 1, repetitions: 10, duration: 10, calories: 80 },
        { exIndex: 16, order: 2, repetitions: 10, duration: 20, calories: 120 },
        { exIndex: 17, order: 3, repetitions: 10, duration: 25, calories: 50 },
        ],
    },
    {
        title: "Pause Active",
        description: 'Un petit mouvement pour un grand bien‑être',
        image: 'FlexiSiège.jpg',
        lines: [
        { exIndex: 12, order: 1, repetitions: 10, duration: 20, calories: 80 },
        { exIndex: 13, order: 2, repetitions: 10, duration: 30, calories: 120 },
        { exIndex: 14, order: 3, repetitions: 10, duration: 25, calories: 50 },
        ],
    },
    {
        title: "Pause Active",
        description: 'Un petit mouvement pour un grand bien‑être',
        image: 'FlashRelax.jpg',
        lines: [
        { exIndex: 6, order: 1, repetitions: 10, duration: 25, calories: 80 },
        { exIndex: 7, order: 2, repetitions: 10, duration: 15, calories: 120 },
        { exIndex: 8, order: 3, repetitions: 10, duration: 10, calories: 50 },
        ],
    }
    ];

    // 1) seed Exercises
    const savedExercises = await ExerciseRepository.save(
        exercisesData.map(e => ExerciseRepository.create(e))
    );

    // 2) seed Programs + ProgramLines
    for (const p of programsData) {
        const program = ProgramRepository.create({
        title: p?.title,
        description: p?.description,
        image: p?.image,
        });
        await ProgramRepository.save(program);

        // pour chaque ligne, on relie l'exercice déjà créé
        const lines = p?.lines.map(l => ProgramLineRepository.create({
        program,
        exercise: savedExercises[l.exIndex],
        order: l.order,
        repetitions: l.repetitions,
        duration: l.duration,
        calories: l.calories,
        }));

        if (lines && lines.length > 0) {
            await ProgramLineRepository.save(lines);
            } else {
            console.warn("Aucune ligne de programme à sauvegarder.");
            }
    }

      console.log('Seed completed: Active breaks added.');
}