
import spacetime from 'spacetime'
import { DateTime } from "luxon";


export const threeWeeksAgo = spacetime()
                            .subtract(3, "weeks")
                            .weekStart("Sunday")
                            .startOf("weeks")
                            .format("iso");

export const oneDayAgo = spacetime()
                            .subtract(1, "days")
                            .format("iso");


export const neverUpdated = spacetime([2022, 0, 1]).format('iso');

export const dueWeek = (dt) => {
    return dt.plus({days: 2}).startOf('week').minus({days: 1})
};

export const dueWeekFromISO = (iso) => {
    return dueWeek(DateTime.fromISO(iso))
}

export const workWeekFromISO = (iso) => {
    return dueWeekFromISO(iso).minus({days: 7})
}
