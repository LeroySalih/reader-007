
drop function get_feedback_for_assignment;

create or replace function get_no_work_submitted (
        ifrom timestamp, 
        ito timestamp) 
returns table (
    submissionId varchar,
    className varchar, 
    assignmentName varchar , 
    dueDateTime varchar,
    userId varchar,
    givenName varchar, 
    surname varchar, 
    points int, 
    feedback varchar
)
as $$
select o."submissionId" as "submissionId", 
          c."displayName" as "className", 
          a."displayName" as "assignmentName" , 
          a."dueDateTime" as "dueDateTime",
          o."userId" as "userId",
          u."givenName", 
          u."surname", 
          o."points", 
          o."feedback"

    from "Outcomes" as o
    LEFT OUTER JOIN "Assignments" as a ON o."assignmentId" = a."id"
    LEFT OUTER JOIN "Classes" as c ON o."classId" = c."id"
    LEFT OUTER JOIN "Users" as u ON o."userId" = u."id"
    where (points = 0 or o."feedback" = 'no work submitted')
    and a."dueDateTime" >= $1 
    and a."dueDateTime" < $2
    
    order by c."displayName"

$$ language sql;


