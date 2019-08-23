/* eslint-disable no-param-reassign */
/* 格式化日期 */
/* eslint-disable func-names */
export default class DateUtil {
    // eslint-disable-next-line class-methods-use-this
    static formatDate(timestamp, formater) {
        const date = new Date();
        date.setTime(parseInt(timestamp));
        // eslint-disable-next-line no-param-reassign
        formater = (formater != null) ? formater : 'yyyy-MM-dd hh:mm';
        // eslint-disable-next-line no-extend-native
        Date.prototype.Format = function (fmts) {
            const o = {
                'M+': this.getMonth() + 1, // 月
                'd+': this.getDate(), // 日
                'h+': this.getHours(), // 小时
                'm+': this.getMinutes(), // 分
                's+': this.getSeconds(), // 秒
                'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
                S: this.getMilliseconds(), // 毫秒
            };
            let fmt = fmts;
            if (/(y+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (`${this.getFullYear()}`).substr(4 - RegExp.$1.length));
            }
            // eslint-disable-next-line no-restricted-syntax
            for (const k in o) {
                if (new RegExp(`(${k})`).test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1)
                        ? (o[k]) : ((`00${o[k]}`).substr((`${o[k]}`).length)));
                }
            }
            return fmt;
        };
        return date.Format(formater);
    }

    /**
    * 获取上一个月
    *
    * @date 格式为yyyy-mm-dd的日期，如：2014-01-25
    */
    static getPreMonth(date) {
        if (!date) {
            date = this.getDay();
        }
        const arr = date.split('-');
        const year = arr[0]; // 获取当前日期的年份
        const month = arr[1]; // 获取当前日期的月份
        const day = arr[2]; // 获取当前日期的日

        // 跨年处理
        let year2 = year;
        let month2 = parseInt(month) - 1;
        if (month2 == 0) {
            year2 = parseInt(year2) - 1;
            month2 = 12;
        }

        let day2 = day;
        let days2 = new Date(year2, month2, 0);
        days2 = days2.getDate();// 新的月份的总天数
        // 日期超出当前月的总天数处理
        if (day2 > days2) {
            day2 = days2;
        }

        month2 = this.doHandleMonth(month2);
        day2 = this.doHandleMonth(day2);

        return `${year2}-${month2}-${day2}`;
    }

    /**
     * 获取下一个月
     *
     * @date 格式为yyyy-mm-dd的日期，如：2014-01-25
     */
    static getNextMonth(date) {
        if (!date) {
            date = this.getDay();
        }

        const arr = date.split('-');
        const year = arr[0]; // 获取当前日期的年份
        const month = arr[1]; // 获取当前日期的月份
        const day = arr[2]; // 获取当前日期的日


        let year2 = year;
        let month2 = parseInt(month) + 1;
        if (month2 == 13) {
            year2 = parseInt(year2) + 1;
            month2 = 1;
        }

        let day2 = day;
        let days2 = new Date(year2, month2, 0);
        days2 = days2.getDate();
        if (day2 > days2) {
            day2 = days2;
        }

        month2 = this.doHandleMonth(month2);
        day2 = this.doHandleMonth(day2);

        return `${year2}-${month2}-${day2}`;
    }

    /**
     * 获取day天的日期
     * @param {*} day 为负数，几天之前；为正数，几天之后；为0或者不加参数，表示今天
     */
    static getDay(day = 0) {
        const today = new Date();
        const targetdayMilliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
        today.setTime(targetdayMilliseconds);

        const tYear = today.getFullYear();
        let tMonth = today.getMonth();
        let tDate = today.getDate();

        tMonth = this.doHandleMonth(tMonth + 1);
        tDate = this.doHandleMonth(tDate);

        return `${tYear}-${tMonth}-${tDate}`;
    }

    /**
     * 补齐0
     * @param {*} month
     */
    static doHandleMonth(month) {
        if (month.toString().length == 1) {
            return `0${month}`;
        }
        return month;
    }

    static getTime(date) {
        const arr = date.split('-');
        const year = arr[0]; // 获取当前日期的年份
        const month = arr[1]; // 获取当前日期的月份
        const day = arr[2]; // 获取当前日期的日
        return new Date(year, month - 1, day).getTime();
    }
}
