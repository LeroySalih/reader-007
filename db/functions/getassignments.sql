drop function getassignments;


create or replace function getassignments() returns table (
        "classId" varchar, 
        "className" varchar,
        "assignmentTitle" varchar,
        "created" timestamp,
        "dueDate" timestamp,    
        ) 
as $$

  select c."id" as "classId", 
         c."displayName" as "className",
         a."displayName" as "Assignment Title", 
         a."createdDateTime" as "Created", 
         a."dueDateTime" as "Due Date"
  from "Classes" as c, 
       "Assignments" as a
  where c.id like a."classId"
  
$$ language sql;