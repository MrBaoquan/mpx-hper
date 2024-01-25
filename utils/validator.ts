// 验证身份证号码格式
const validateIdCard = (id: string): boolean => {
    const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    return reg.test(id);
};

// 验证护照号码
const validatePassport = (passport: string): boolean => {
    const reg = /^1[45][0-9]{7}$|([P|p|S|s]\d{7}$)|([S|s|G|g|E|e]\d{8}$)|([Gg|Tt|Ss|Ll|Qq|Dd|Aa|Ff]\d{8}$)|([H|h|M|m]\d{8,10})$/;
    return reg.test(passport);
};

// 验证港澳居民来往内地通行证
const validateHKMacao = (hkMacao: string): boolean => {
    const reg = /^[HMhm]{1}([0-9]{10}|[0-9]{8})$/;
    return reg.test(hkMacao);
};

// 验证台湾居民来往大陆通行证
const validateTaiwan = (taiwan: string): boolean => {
    const reg = /^[0-9]{8}$/;
    return reg.test(taiwan);
};

// 根据身份证号码获取出生日期，年龄、性别
interface IDInfo {
    birthday: string;
    age: number;
    gender: string;
}

const parseIDNumber = (id: string): IDInfo => {
    // 二代身份照号码一共分为18位，第7-10位为出生年份，第11-12位为出生月份，第13-14位为出生日期，第17位为性别，奇数为男性，偶数为女性
    const birthday = `${id.substring(6, 10)}-${id.substring(10, 12)}-${id.substring(12, 14)}`;
    const age = new Date().getFullYear() - Number(id.substring(6, 10));
    const gender = Number(id.substring(16, 17)) % 2 === 0 ? '女' : '男';
    return {
        birthday,
        age,
        gender,
    };
};

// 验证大陆手机号码格式
const validatePhone = (phone: string): boolean => {
    const reg = /^1[3456789]\d{9}$/;
    return reg.test(phone);
};

export { validateIdCard, parseIDNumber, validatePhone, validatePassport, validateHKMacao, validateTaiwan };
