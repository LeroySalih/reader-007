drop function getClassAssignments;


create or replace function getClassAssignments() returns table (
        "classId" varchar, 
        "className" varchar,
        "assignmentId"varchar,
        "assignmentTitle" varchar,
        "created" timestamp,
        "dueDate" timestamp,
        "webUrl"  varchar,
        "hasRubric" varchar     
        ) 
as $$
  select c."id" as "classId", 
         c."displayName" as "className",
         a."id" as "assignmentId",
         a."displayName" as "assignmentTitle", 
         a."createdDateTime" as "created", 
         a."dueDateTime" as "dueDate",
         a."webUrl"  as"webUrl",
         a."hasRubric" as "hasRubric"
  from "Classes" as c, 
       "Assignments" as a
  where c.id like a."classId" and a."createdDateTime" > '2022-09-01 00:00:00'::timestamp


$$ language sql;