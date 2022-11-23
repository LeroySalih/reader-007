
drop function upsertMember;


CREATE OR REPLACE FUNCTION upsertMember(
    iclassId varchar,
    iuserid varchar,
    igivenName varchar,
    isurname varchar,
    iemail varchar
    
    ) RETURNS VOID AS

$$

    INSERT INTO "Users"(id, "givenName", surname, email)
    VALUES (iuserid, igivenName, isurname, iemail)
    ON CONFLICT ON CONSTRAINT "Users_pkey"
    DO
    UPDATE SET
        "givenName"=EXCLUDED."givenName",
        surname=EXCLUDED.surname,
        email=EXCLUDED.email
    ;

    INSERT INTO "ClassMembers" ("classId", "userId")
    VALUES (iclassId, iuserId)
    ON CONFLICT ON CONSTRAINT "ClassMembers_pkey"
    DO NOTHING;
     

$$
  LANGUAGE sql;





