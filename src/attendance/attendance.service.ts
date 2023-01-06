import { Inject, Injectable } from '@nestjs/common';
import { DbmanagerService } from 'src/dbmanager/dbmanager.service';
import { DayInfo } from '../dbmanager/entities/day_info.entity';
import { UserInfo } from '../dbmanager/entities/user_info.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { OperatorService } from '../operator/operator.service';
import { MonthInfo } from '../dbmanager/entities/month_info.entity';
import { ButtonStatus } from './button.status.enum';
import { MonthlyUsers } from '../dbmanager/entities/monthly_users.entity';
import { Attendance } from 'src/dbmanager/entities/attendance.entity';

@Injectable()
export class AttendanceService {
	@Inject(DbmanagerService) private readonly dbmanagerService: DbmanagerService
	@Inject(OperatorService) private readonly operatorService: OperatorService

	async getUserButtonStatus(userInfo: UserInfo): Promise<number> {
		if (this.isAvailableTime() === false) {
			return ButtonStatus.NotAvailableTime;
		}
		else if (await this.hasAttendedToday(userInfo)) {
			return ButtonStatus.AlreadyCheckedAttendance;
		}
		return ButtonStatus.AttendanceSuccess;
	}

	// todo: Refactor
	// todo: set Dto to return
	async applyTodayAttendance(attendanceInfo: CreateAttendanceDto, userInfo: UserInfo) {
		const todayWord: string = await this.dbmanagerService.getTodayWord();
		const monthInfo: MonthInfo = await this.dbmanagerService.getThisMonthInfo();
		const currDatetime = new Date();

		if (await this.hasAttendedToday(userInfo) === true) {
			return ({
				statusAttendance: 1,
				errorMsg: "이미 출석 체크 했습니다."
			});
		} else if (attendanceInfo.todayWord !== todayWord) {
			return ({
				statusAttendance: 2,
				errorMsg: "오늘의 단어가 다릅니다."
			});
		} else if (this.isAvailableTime() === false) {
			return ({
				statusAttendance: 3,
				errorMsg: "출석 가능한 시간이 아닙니다."
			});
		}
		let monthlyUser: MonthlyUsers = await this.dbmanagerService.getThisMonthlyUser(userInfo);
		if (monthlyUser == null) {
			monthlyUser = await this.dbmanagerService.createMonthlyUser(userInfo);
		}
		await this.dbmanagerService.attendanceRegistration(userInfo, currDatetime);
		await this.dbmanagerService.updateMonthlyUser(monthlyUser, currDatetime);
		await this.operatorService.updatePerfectStatus(monthlyUser, monthInfo.currentAttendance);
		return ({
			statusAttendance: 0,
			errorMsg: "성공적으로 출석 체크를 완료했습니다." // todo: fix for not errorMsg
		})
	}

	// checkSupplementaryAttendance ?
	async checkAndReflectSupplementaryAttendance(dayInfo: DayInfo) {
		
		if (dayInfo.type === 1) { 			// weekends, 주말출석로직
			

		} else if (dayInfo.type === 2) {	// the end of month, 월말ㅜ석로직
			
		}

		return ;
	}

	/***********************************
     * 			util function list     *
     ********************************* */
	
	isAvailableTime(): Boolean {
		const now = new Date();
		const start = new Date();
		const end = new Date();
		
		start.setHours(8, 30, 0);
		end.setHours(9, 0, 0);
		if (now < start || now > end)
			return (false);
		else
			return (true);
	}

	async hasAttendedToday(userInfo: UserInfo): Promise<boolean> {
		const todayInfo: DayInfo = await this.dbmanagerService.getTodayInfo();
		const todayAttendanceInfo: Attendance = await this.dbmanagerService.getAttendance(userInfo, todayInfo);
		if (todayAttendanceInfo === null)
			return false;
		else
			return true;
	}

	async isTodayWordSet(): Promise<boolean> {
		const todayInfo: DayInfo = await this.dbmanagerService.getTodayInfo();
		if (todayInfo.todayWord === "")
			return (false);
		else
			return (true);
	}
}
