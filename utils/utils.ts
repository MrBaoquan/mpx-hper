import { parseIDNumber } from './validator';

// 根据用户身份证号分配用户头像
export function getAvatarByIdCard(idCard: string): string {
    var _idInfo = parseIDNumber(idCard);
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
