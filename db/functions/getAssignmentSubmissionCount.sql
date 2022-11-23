drop function getAssignmentSubmissionCount;

create or replace function getAssignmentSubmissionCount () returns table (
  "displayName" varchar,
  "assignmentId" varchar,
  "status" varchar,
  "count" int 
)
as $$

select a."displayName" as "displayName", 
      subs."assignmentId" as "assignmentId",   
      subs."status" as "status", 
      subs."Count" as "count"
from (
    select  "assignmentId", "status", count(*) as "Count"
    from    "Submissions"
    group by "assignmentId", "status"
    order by count(*) desc
) as subs, "Assignments" as a
where subs."assignmentId" = a."id"
order by subs."assignmentId" desc

$$ language sql;



