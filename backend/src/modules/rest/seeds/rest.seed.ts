import { DataSource } from 'typeorm';
import { Rest } from '../entities/rest.entity';

export async function seedRest(dataSource: DataSource) {
  const restRepository = dataSource.getRepository(Rest);

  const activeBreaks = [
    {
      contentTitle: 'Pause Assis Fit',
      contentDescription: 'Une pause pour les lombaires',
      duration: 30,
      position: 'lombaires',
      calories: 150,
      image: 'Pause Assis Fit.jpg',
      category: 'sit',
    },
    {
      contentTitle: 'Flash Relax',
      contentDescription: 'Une pause pour les lombaires',
      duration: 50,
      position: 'lombaires',
      calories: 90,
      image: 'Flash Relax.jpg',
      category: 'stand up',
    },
    {
      contentTitle: 'Pause Assis Stretch',
      contentDescription: 'Étirements pour le dos',
      duration: 20,
      position: 'dos',
      calories: 100,
      image: '2 min Vitalité.jpg',
      category: 'sit',
    },
    {
      contentTitle: 'Pause Debout Stretch',
      contentDescription: 'Étirements pour le dos',
      duration: 20,
      position: 'dos',
      calories: 100,
      image: 'Boost Mur.jpg',
      category: 'wall',
    },
    {
        contentTitle: 'Pause Assis Relax',
        contentDescription: 'Relaxation pour le dos',
        duration: 20,
        position: 'dos',
        calories: 100,
        image: 'Flexi\'Siège.jpg',
        category: 'sit',
    },
    {
        contentTitle: 'Pause Debout Relax',
        contentDescription: 'Relaxation pour le dos',
        duration: 30,
        position: 'dos',
        calories: 100,
        image: 'Pause Tonus.jpg',
        category: 'stand up',
    },
    {
        contentTitle: 'Pause debout vitalité',
        contentDescription: 'Une pause pour les lombaires',
        duration: 30,
        position: 'lombaires',
        calories: 150,
        image: 'Pause Vitalité.jpg',
        category: 'stand up',
    },
    {
        contentTitle: 'Pause pour la posture',
        contentDescription: 'Une pause pour les lombaires',
        duration: 90,
        position: 'lombaires',
        calories: 150,
        image: 'Posture +.jpg',
        category: 'wall',
    },
  ];

  for (const breakData of activeBreaks) {
    const rest = restRepository.create(breakData);
    await restRepository.save(rest);
  }

  console.log('Seed completed: Active breaks added.');
}