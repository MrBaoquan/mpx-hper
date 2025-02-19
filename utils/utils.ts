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

// 判断用户是否已经成年
export function isAdult(birthday: string): boolean {
    const _age = moment().diff(birthday, 'years');
    return _age >= 18;
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

export function numToChinese(num): string {
    const chineseNum = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
    return chineseNum[num - 1];
}

// 将对象转为键值数组
export function objToArr(obj: any) {
    return Object.entries(obj).map(([key, value]) => {
        return { key, value };
    });
}

export function generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// eslint-disable-next-line @typescript-eslint/no-inferrable-types
export function debounce<T extends (...args: any[]) => void>(func: T, wait: number, immediate: boolean = false): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null;

    return function (...args: Parameters<T>): void {
        if (timeout) {
            clearTimeout(timeout);
        }

        const callNow = immediate && !timeout;

        timeout = setTimeout(() => {
            timeout = null;
            if (!immediate) {
                func(...args);
            }
        }, wait);

        if (callNow) {
            func(...args);
        }
    };
}
