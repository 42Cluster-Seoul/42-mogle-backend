import { Module } from '@nestjs/common';
import { DbmanagerService } from './dbmanager.service';
import { DbmanagerController } from './dbmanager.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/dbmanager/entities/user.entity';
import { MonthInfo } from './entities/month.info.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [User, MonthInfo]
    ),
  ],
  controllers: [DbmanagerController],
  providers: [DbmanagerService]
})
export class DbmanagerModule {}
