import { IsString, IsOptional, IsInt, Min, IsArray, IsEnum, IsObject, ValidateNested } from 'class-validator';

export class CreatePractitionerDiplomeDto {
    
    @IsString()
    diplome: string;

    @IsString()
    school: string;

    @IsString()
    country: string;

    @IsInt()
    year: number;
}
