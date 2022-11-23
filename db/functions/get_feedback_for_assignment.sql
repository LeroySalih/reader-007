
drop function get_feedback_for_assignment;

create or replace function get_feedback_for_assignment (id varchar) returns table (
  id varchar,
  displayName varchar,
  userId varchar,
  givenName varchar,
  surname varchar,
  feedback varchar
)
as $$

  select a."id", a."displayName", o."userId", u."givenName", u."surname",  o."feedback" 
  from "Outcomes" as o
  LEFT OUTER JOIN "Assignments" as a ON o."assignmentId" = a.id
  LEFT OUTER JOIN "Users" as u ON o."userId" = u."id" 
  WHERE a."id" = $1;


$$ language sql;
