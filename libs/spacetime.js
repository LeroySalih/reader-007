
import spacetime from 'spacetime'

export const threeWeeksAgo = spacetime()
                            .subtract(3, "weeks")
                            .weekStart("Sunday")
                            .startOf("weeks")
                            .format("iso");

export const oneDayAgo = spacetime()
                            .subtract(1, "days")
                            .format("iso");


export const neverUpdated = spacetime([2022, 0, 1]).format('iso');