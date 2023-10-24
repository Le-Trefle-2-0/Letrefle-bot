const {get} = require('axios')

module.exports = () => {
    return new Promise(async (resolve, reject) => {
        await get(`${process.env.SOLAR_API}/events`).then((res) => {
            if (res.data == null || res.data == "" || res.data == undefined) reject(false);
            process.env.TZ = 'Europe/Paris';

            for (let event of res.data) {
                let currentDate = new Date();
                let currentHour = currentDate.getHours();
                let currentMinute = currentDate.getMinutes();
                let eventStartDate = new Date(event.date_start);
                let eventEndDate = new Date(event.date_end);
                let dailyStartHour = new Date(event.daily_time_start).getHours();
                let dailyStartMinute = new Date(event.daily_time_start).getMinutes();
                let dailyEndHour = new Date(event.daily_time_end).getHours();
                let dailyEndMinute = new Date(event.daily_time_end).getMinutes();

                console.log('-------------------')
                console.log(`EVENT ID ${event.id}`)
                console.log(eventStartDate <= currentDate && eventEndDate >= currentDate.setHours(0, 0, 0))
                console.log(currentDate)
                if (eventStartDate <= currentDate && eventEndDate >= currentDate.setHours(0, 0, 0)) {
                    console.log(dailyStartHour <= currentHour && dailyStartMinute <= currentMinute)
                    if (dailyStartHour <= currentHour && dailyStartMinute <= currentMinute) {
                        console.log(dailyEndHour >= currentHour && dailyEndMinute >= currentMinute)
                        console.log(dailyEndHour)
                        console.log(currentHour)
                        if (dailyEndHour >= currentHour && dailyEndMinute >= currentMinute) {
                            // resolve(event);
                            reject(false);
                        }
                    }
                }
            }

            reject(false);
            // resolve(true);
        });
    });
}