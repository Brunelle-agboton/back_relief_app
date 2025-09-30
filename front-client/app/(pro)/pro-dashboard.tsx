// Le concept de Transaction


//   Une transaction est un mécanisme qui permet de regrouper plusieurs opérations (créations, mises à jour, suppressions) en un seul bloc atomique. C'est un principe "tout ou rien" :
//    - Soit toutes les opérations réussissent, et les changements sont alors sauvegardés de manière permanente dans la base de données (COMMIT).
//    - Soit une seule opération échoue, et tous les changements effectués depuis le début de la transaction sont alors complètement annulés (ROLLBACK).


//   La base de données revient exactement à l'état dans lequel elle était avant le début de la transaction, comme si rien ne s'était passé. Vous n'avez plus besoin de supprimer manuellement les
//   enregistrements partiels.

//   Comment l'implémenter dans votre Backend NestJS

//   Puisque votre backend est en NestJS, vous utilisez probablement un ORM comme TypeORM ou Prisma. Voici comment vous pourriez implémenter une transaction avec TypeORM, qui est très courant avec
//   NestJS.


//   L'idée est de contrôler manuellement la transaction à l'aide d'un QueryRunner.

//   Voici un exemple conceptuel de ce à quoi votre service d'inscription pourrait ressembler :



//    // Dans votre service d'inscription, par exemple auth.service.ts
//     import { Injectable, InternalServerErrorException } from '@nestjs/common';
//   import { DataSource } from 'typeorm';
//   import { UserService } from '../modules/user/user.service';
//    import { PractitionerProfileService } from '../modules/practitioner_profile/practitioner_profile.service';
//    import { AppointmentService } from '../modules/appointment/appointment.service';
//   import { CreateUserDto } from '../modules/user/dto/create-user.dto';
//   import { CreatePractitionerProfileDto } from '../modules/practitioner_profile/dto/create-practitioner-profile.dto';
//    import { CreateAppointmentDto } from '../modules/appointment/dto/create-appointment.dto';
  
//    @Injectable()
//    export class AuthService {
//      (
//        // Injectez le `DataSource` pour avoir accès au gestionnaire de connexion
//        private readonly dataSource: DataSource,
//        private readonly userService: UserService,
//        private readonly practitionerProfileService: PractitionerProfileService,
//        private readonly appointmentService: AppointmentService,
//    ) {}
//    u
//    async registerPractitioner(registrationData: any): Promise<any> {
//      // 2. Créez un "Query Runner" à partir de votre source de données
//      const queryRunner = this.dataSource.createQueryRunner();
//    r
//      // Connectez le queryRunner et démarrez la transaction
//      await queryRunner.connect();
//      await queryRunner.startTransaction();
//         try {
//          // Séparez vos données
//          const userData: CreateUserDto = { /* ... vos données utilisateur ... */ };
//          const practitionerData: CreatePractitionerProfileDto = { /* ... vos données praticien ... */ };
//          const appointmentData: CreateAppointmentDto = { /* ... vos données rdv ... */ };
  
//          // 4. Exécutez chaque opération en utilisant le manager du queryRunner
//          //    Ceci garantit qu'elles font toutes partie de la même transaction.
  
//          // Étape Créer l'utilisateur
//         const newUser = await this.userService.create(userData, queryRunner.manager);
 
//         // Étape 2: Créer le profil du praticien
//         practitionerData.user = newUser; // Lier le profil à l'utilisateur créé
//         const newPractitioner = await this.practitionerProfileService.create(practitionerData, queryRunner.manager);
 
//         // Étape Créer le rendez-vous
//         appointmentData.practitioner = newPractitioner; // Lier le rdv au praticien créé
//         const newAppointment = await this.appointmentService.create(appointmentData, queryRunner.manager);
 
//        // 5. Si tout a réussi, validez la transaction (`COMMIT`)
//        await queryRunner.commitTransaction();
//         return { user: newUser, practitioner: newPractitioner, appointment: newAppointment };
//       } catch (err) {
//        // Si une erreur se produit, annulez la transaction (`ROLLBACK`)
//        await queryRunner.rollbackTransaction();
//         // Propagez l'erreur pour que le client reçoive une réponse 500, par exemple
//          throw new InternalServerErrorException('Registration failed. Please try again. ' + err.message);
  
//        } finally {
//          // 7. TRÈS IMPORTANT: Libérez toujours le queryRunner pour rendre la connexion à la DB disponible
//          await queryRunner.release();
//        }
//      }
//    }


//   Modification de vos services (create methods)


//   Pour que cela fonctionne, vos méthodes create dans UserService, PractitionerProfileService, etc., doivent être capables d'accepter un EntityManager optionnel pour s'exécuter dans le contexte de la
//    transaction.

//   Exemple pour `UserService` :



//    // user.service.ts
//     import { Injectable } from '@nestjs/common';
//   import { InjectRepository } from '@nestjs/typeorm';
//   mport { Repository, EntityManager } from 'typeorm';
//    import { User } from './entities/user.entity';
//   import { CreateUserDto } from './dto/create-user.dto';

//   @Injectable()
//    export class UserService {
//      (
//        @InjectRepository(User)
//        private readonly userRepository: Repository<User>,
//      ) {}
     
//      // Modifiez la méthode pour accepter un manager
//      async create(createUserDto: CreateUserDto, manager?: EntityManager): Promise<User> {
//        const repository = manager ? manager.getRepository(User) : this.userRepository;
  
//      const newUser = repository.create(createUserDto);
//      return repository.save(newUser);
//    }
//  }



//   En adoptant ce modèle de transaction, votre processus d'inscription deviendra fiable et vous n'aurez plus jamais à nettoyer manuellement votre base de données après une erreur.