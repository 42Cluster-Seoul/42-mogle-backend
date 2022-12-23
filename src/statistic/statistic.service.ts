import { Inject, Injectable } from '@nestjs/common';
import { DbmanagerService } from '../dbmanager/dbmanager.service';
import { UserInfo } from '../dbmanager/entities/user_info.entity';
import { MonthlyUsers } from '../dbmanager/entities/monthly_users.entity';
import { AttendanceStatus } from './dto/attendanceStatus.dto';
import { MonthInfo } from 'src/dbmanager/entities/month_info.entity';

@Injectable()
export class StatisticService {
	@Inject(DbmanagerService)
	private readonly dbmanagerService: DbmanagerService;

	async getAttendanceList(userInfo: UserInfo) {
		return await this.dbmanagerService.getAttendanceList(userInfo);
	}

	async getUserMonthStatus(userInfo: UserInfo): Promise<AttendanceStatus> {
		let attendanceStatus: AttendanceStatus = {
			attendanceCount: 0,
			isPerfectAttendance: false,
		};
		const monthlyUserInfo: MonthlyUsers = await this.dbmanagerService.getThisMonthStatus(userInfo);
		if (monthlyUserInfo) {
			attendanceStatus.attendanceCount = monthlyUserInfo.attendanceCount;
			attendanceStatus.isPerfectAttendance = monthlyUserInfo.isPerfect;
		}
		return attendanceStatus;
	}

	async updateUserMonthlyProperties(userInfo: UserInfo, monthInfo: MonthInfo) {
		const monthlyUserInfo = await this.dbmanagerService.getSpecificMonthlyuserInfo(monthInfo, userInfo);

		// update attendanceCount
		const countFromAttendanceOfUserInMonth = await this.dbmanagerService.getCountFromAttendanceOfUserInMonth(userInfo, monthInfo);
		console.log(`countFromAttendanceOfUserInMonth: ${countFromAttendanceOfUserInMonth}`);
		monthlyUserInfo.attendanceCount = countFromAttendanceOfUserInMonth;
		
		// update isPerfect
		if (monthlyUserInfo.attendanceCount === monthInfo.currentAttendance 
			&& monthlyUserInfo.isPerfect === false) {
			monthlyUserInfo.isPerfect = true;
		}
		console.log(`monthlyUserInfo: ${JSON.stringify(monthlyUserInfo)}`);

		// update totalPerfectCount
		// set month and year to find lastMonthInfox
		let lastMonth: number = (monthInfo.month == 1 ? 12 : monthInfo.month - 1);
		let yearToLastMonth: number = (lastMonth == 12 ? monthInfo.year - 1 : monthInfo.year);
		if (monthlyUserInfo.isPerfect) {
			if (monthlyUserInfo.attendanceCount === monthInfo.totalAttendance) {
				const lastMonthInfo: MonthInfo = await this.dbmanagerService.getSpecificMonthInfo(yearToLastMonth, lastMonth);
				if (lastMonthInfo) {
					// find lastMonthlyUserInfo
					const lastMonthlyUserInfo: MonthlyUsers = await this.dbmanagerService.getSpecificMonthlyuserInfo(lastMonthInfo, userInfo);
					if (lastMonthlyUserInfo) {
						monthlyUserInfo.totalPerfectCount = lastMonthlyUserInfo.totalPerfectCount + 1;
					} else {
						monthlyUserInfo.totalPerfectCount = 1;
					}
				}
			}
		}
		// todo: save monthlyUsers
		return ;
	}


	// updateMonthlyUserAttendanceCount(monthlyuser: MonthlyUsers) {

	// 	if (!this.isWeekend())
	// 	{
	// 		monthlyuser.attendanceCount += 1;
	// 		// todo: save랑 update 둘 중에 하나만 하기
	// 		this.monthlyUsersRepository.save(monthlyuser);
	// 		this.monthlyUsersRepository.update(monthlyuser.id, {
	// 			attendanceCount: monthlyuser.attendanceCount,
	// 		});
	// 	}
	// }
}
