// test-swagger.ts
import { ApiProperty } from '@nestjs/swagger';

class TestDto {
  @ApiProperty()
  name: string;
}

console.log('Test successful');