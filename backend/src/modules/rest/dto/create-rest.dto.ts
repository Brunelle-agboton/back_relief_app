import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
export class CreateRestDto {
    @IsString()
    @IsNotEmpty()
    contentTitle: String;
    
    @IsString() 
    contentDescription: String;
    
    @IsNumber()
    @IsNotEmpty()
    duration: number;
    
    @IsString()
    @IsNotEmpty()
    position: String;
    
    @IsNumber()
    @IsNotEmpty()
    calories: number;
    
    @IsString()
    @IsNotEmpty()
    image: String;  
    
    @IsString()
    @IsNotEmpty()
    category: String;
}
