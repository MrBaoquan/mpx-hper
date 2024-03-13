import { parseIDNumber } from './validator';
import * as moment from 'moment';

// 根据用户身份证号分配用户头像
export function getAvatarByIdCard(idCard: string): string {
    const _idInfo = parseIDNumber(idCard);
    if (_idInfo.age < 18) {
        if (_idInfo.gender === '男') {
            return 'https://kerun-app.oss-cn-beijing.aliyuncs.com/kerun_user/boy.png';
        } else {
            return 'https://kerun-app.oss-cn-beijing.aliyuncs.com/kerun_user/girl.png';
        }
    } else {
        if (_idInfo.gender === '男') {
            return 'https://kerun-app.oss-cn-beijing.aliyuncs.com/kerun_user/man.png';
        } else {
            return 'https://kerun-app.oss-cn-beijing.aliyuncs.com/kerun_user/women.png';
        }
    }
}

// 根据日期获取星期，如果是今天|明天|后天则返回对应的文字
export function getWeekByDate(date: string): string {
    const _date = moment(date);
    const _today = moment().format('YYYY-MM-DD');
    const _tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
    const _afterTomorrow = moment().add(2, 'days').format('YYYY-MM-DD');

    const _weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    if (_date.format('YYYY-MM-DD') === _today) {
        return '今天';
    } else if (_date.format('YYYY-MM-DD') === _tomorrow) {
        return '明天';
    } else if (_date.format('YYYY-MM-DD') === _afterTomorrow) {
        return '后天';
    } else {
        return _weeks[_date.day()];
    }
}
